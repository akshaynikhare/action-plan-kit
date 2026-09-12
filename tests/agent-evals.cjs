#!/usr/bin/env node
// Small, offline-checkable evaluation set. Live runs are explicit and use Claude's existing auth.
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const { sha } = require('../kit/scripts/plan-lib.cjs');
const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(__dirname, 'evals/cases.md'), 'utf8');
function cases() {
  return source.split(/^## /m).slice(1).map(block => {
    const get = key => (block.match(new RegExp(`^${key}: (.+)$`, 'm')) || [])[1];
    return { id: block.split('\n')[0], agent: get('Agent'), expected: get('Expected'), anchor: get('Anchor'), packet: block.split('### Packet\n')[1] };
  });
}
function classify(report, agent) {
  const lines = report.split('\n');
  const hits = lines.filter(l => agent === 'ap-acceptance' ? /\bGAP\b/.test(l) : /\bCONFIRMED\b/.test(l));
  if (hits.length) return { label: 'BAD', duplicates: Math.max(0, hits.length - 1) };
  if (/\bUNCONFIRMED\b/.test(report)) return { label: 'UNKNOWN', duplicates: 0 };
  const clean = agent === 'ap-acceptance' ? /\bCOVERED\b/.test(report) : /No (?:regression|issue|cleanup) found/i.test(report);
  return { label: clean ? 'GOOD' : 'UNPARSED', duplicates: 0 };
}
function check() {
  const all = cases();
  if (all.length !== 12 || new Set(all.map(c => c.id)).size !== all.length) throw Error('Expected 12 unique cases');
  for (const agent of ['ap-acceptance', 'ap-regression', 'ap-security', 'ap-cleanup']) {
    if (!fs.existsSync(path.join(repo, 'kit/agents', `${agent}.md`))) throw Error(`Missing ${agent}`);
    for (const expected of ['GOOD', 'BAD', 'UNKNOWN']) if (all.filter(c => c.agent === agent && c.expected === expected).length !== 1) throw Error(`Missing ${agent}/${expected}`);
  }
  for (const c of all) if (!c.packet || !c.anchor || !c.packet.includes(c.anchor)) throw Error(`Invalid packet ${c.id}`);
  // Check scoring boundaries so UNCONFIRMED is never counted as CONFIRMED.
  if (classify('UNCONFIRMED | api.js:1 | missing consumer', 'ap-regression').label !== 'UNKNOWN') throw Error('Classification boundary broken');
  if (classify('R1 | GAP | test.js:1', 'ap-acceptance').label !== 'BAD') throw Error('GAP classification broken');
  console.log('[agent-evals] 12 valid cases: good, bad and missing-context for each focused reviewer');
}
function run() {
  const outIndex = process.argv.indexOf('--out');
  const dir = outIndex >= 0 ? path.resolve(process.argv[outIndex + 1]) : fs.mkdtempSync(path.join(os.tmpdir(), 'actionplan-agent-evals-'));
  fs.mkdirSync(dir, { recursive: true });
  const metrics = { total: 0, correct: 0, misses: 0, falseAlarms: 0, duplicates: 0, errors: 0 }, rows = [];
  console.log(`[agent-evals] reports: ${dir}`);
  for (const c of cases()) {
    const agent = fs.readFileSync(path.join(repo, 'kit/agents', `${c.agent}.md`), 'utf8');
    const model = (agent.match(/^model: (.+)$/m) || [])[1];
    const system = agent.replace(/^---\n[\s\S]*?\n---\n/, '');
    const r = spawnSync('claude', ['--safe-mode', '--print', '--no-session-persistence', '--tools', '', '--output-format', 'json', '--model', model, '--system-prompt', system], {
      cwd: dir, input: c.packet, encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024,
    });
    let reply;
    try { reply = JSON.parse(r.stdout || '{}'); } catch { reply = {}; }
    const report = reply.result || '';
    if (r.status !== 0 || reply.is_error || !report) {
      metrics.errors++;
      fs.writeFileSync(path.join(dir, `${c.id}.md`), '# Runner failure\n' + (report || r.stderr || r.error?.message || 'No model result'));
      rows.push(`| ${c.id} | ${c.expected} | RUNNER ERROR | - |`);
      console.log(`[agent-evals] ${c.id}: runner unavailable; stopping live run`);
      break;
    }
    fs.writeFileSync(path.join(dir, `${c.id}.md`), report + '\n');
    const result = classify(report, c.agent), grounded = report.includes(c.anchor);
    const correct = result.label === c.expected && (c.expected === 'GOOD' || grounded);
    metrics.total++; metrics.correct += Number(correct); metrics.duplicates += result.duplicates;
    metrics.misses += Number(c.expected === 'BAD' && !correct);
    metrics.falseAlarms += Number(c.expected !== 'BAD' && result.label === 'BAD');
    rows.push(`| ${c.id} | ${c.expected} | ${result.label} | ${correct ? 'PASS' : 'REVIEW'} |`);
    console.log(`[agent-evals] ${c.id}: ${correct ? 'PASS' : 'REVIEW'} (${reply.model || model})`);
  }
  const provenance = cases().filter((c, i, a) => a.findIndex(x => x.agent === c.agent) === i).map(c => `${c.agent}: ${sha(fs.readFileSync(path.join(repo, 'kit/agents', `${c.agent}.md`)))}`).join('\n');
  fs.writeFileSync(path.join(dir, 'SUMMARY.md'), `# Focused reviewer evaluation\n\nRun: ${new Date().toISOString()}\nFixture SHA256: ${sha(source)}\n\n${provenance}\n\nCompleted: ${metrics.total}/12; label/anchor matches: ${metrics.correct}; missed planted issues: ${metrics.misses}; false alarms: ${metrics.falseAlarms}; extra finding rows: ${metrics.duplicates}; runner errors: ${metrics.errors}.\n\n| Case | Expected | Observed | Check |\n|---|---|---|---|\n${rows.join('\n')}\n\nThese are format/anchor checks on small synthetic examples, not a quality guarantee. Extra finding rows are duplicate candidates, not semantically proven duplicates. Inspect raw reports using the rubric before accepting a result. No filesystem tools were enabled; production tool routing is outside this evaluation.\n`);
  if (metrics.errors || metrics.total !== 12 || metrics.correct !== 12 || metrics.duplicates) process.exitCode = 1;
}
if (require.main === module) {
  try { check(); if (process.argv.includes('--run')) run(); }
  catch (err) { console.error(`[agent-evals] ${err.message}`); process.exitCode = 1; }
}
module.exports = { classify, cases };
