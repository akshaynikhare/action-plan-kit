const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync, spawn } = require('child_process');
const repo = path.resolve(__dirname, '..');
const id = n => `AP-${String(n).padStart(4, '0')}`;
function run(args, cwd, session = 'test-owner') {
  return spawnSync(args[0], args.slice(1), { cwd, encoding: 'utf8', env: { ...process.env, ACTIONPLAN_SESSION_ID: session } });
}
function ok(r) { assert.equal(r.status, 0, r.stdout + r.stderr); return r; }
function fail(r) { assert.notEqual(r.status, 0, r.stdout + r.stderr); return r; }
function temp(t) { const p = fs.mkdtempSync(path.join(os.tmpdir(), 'actionplan-test-')); t.after(() => fs.rmSync(p, { recursive: true, force: true })); return p; }
function install(root, ...flags) { return run(['bash', path.join(repo, 'install.sh'), '--target', root, '--code', 'AP', ...flags], repo); }
function write(root, name, text) { const p = path.join(root, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return p; }
function project(t, name = 'project') {
  const root = path.join(temp(t), name); ok(install(root));
  const cfg = path.join(root, '.actionplan/config.json'), data = JSON.parse(fs.readFileSync(cfg));
  data.commands.typecheck = 'echo fixture-typecheck'; data.commands.lint = 'echo fixture-lint';
  fs.writeFileSync(cfg, JSON.stringify(data)); return root;
}
function plan(root, n = 1, file = 'src/a.js', extra = '') {
  const body = `---\nid: ${id(n)}\nstage: planned\n---\n## Open questions\n\n## Files touched\n| File | Change |\n|---|---|\n| ${file} | edit |\n## Sprint tasks\n- [x] Implement fixture\n## Definition of Done\n- [x] QA clean\n- [x] Human sign-off\n## Verification\n\`\`\`bash\nprintf 'targeted fixture check\\n'\n\`\`\`\n${extra}`;
  return write(root, `.actionplan/planned/${id(n)}-fixture.md`, body);
}
function lock(root, action, n = 1, owner = 'test-owner') { return run(['bash', '.actionplan/scripts/lock.sh', action, id(n)], root, owner); }
function stage(root, to, n = 1, owner = 'test-owner') { return run(['bash', '.actionplan/scripts/stage.sh', id(n), to], root, owner); }
function seal(root, n = 1) {
  const base = `.actionplan/qa/${id(n)}`;
  write(root, `${base}/report-1.md`, 'No issue found in supplied diff.\n');
  const rows = ['acceptance', 'regression', 'security', 'cleanup'].map(role => `| ap-${role} | SKIP | - | No trigger in this fixture |`).join('\n');
  write(root, `${base}/review-1.md`, `## Reviews\n| ap-qa | PASS | report-1.md | No findings |\n${rows}\n`);
  ok(run(['node', '.actionplan/scripts/finish.cjs', id(n), '1'], root));
}
function tree(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory() ? tree(path.join(root, e.name)).map(p => `${e.name}/${p}`) : [e.name + ':' + fs.readFileSync(path.join(root, e.name)).toString('base64')]);
}
test('installer handles quoted/metacharacter paths and preserves user files on upgrade', t => {
  const root = path.join(temp(t), 'Akshay\'s "project" & $cash');
  write(root, 'Makefile', 'check:\n\t@echo existing-check\n');
  write(root, 'CLAUDE.md', 'User instructions.\n');
  write(root, 'package.json', JSON.stringify({ scripts: { test: 'node --test' } }));
  ok(install(root));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.actionplan/config.json'))).name, path.basename(root));
  assert.equal(fs.readFileSync(path.join(root, 'Makefile'), 'utf8'), 'check:\n\t@echo existing-check\n');
  assert.match(fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8'), /User instructions/);
  const before = tree(root); ok(install(root)); assert.deepEqual(tree(root), before);
  write(root, '.actionplan/VERSION', 'older-version\n');
  write(root, '.actionplan/DECISIONS.md', 'User decision\n');
  write(root, 'docs/_workflow/SDLC.md', 'Custom SDLC\n');
  ok(install(root));
  assert.equal(fs.readFileSync(path.join(root, '.actionplan/DECISIONS.md'), 'utf8'), 'User decision\n');
  assert.equal(fs.readFileSync(path.join(root, 'docs/_workflow/SDLC.md'), 'utf8'), 'Custom SDLC\n');
  assert.ok(fs.existsSync(path.join(root, 'docs/_workflow/SDLC.md.kit-new')));
  const block = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');
  assert.equal((block.match(/actionplan-kit:start/g) || []).length, 1);
  assert.ok(!fs.existsSync(path.join(root, 'CLAUDE.md.kit-new')));
  ok(run(['node', '.actionplan/scripts/check.cjs'], root));
});
test('dry-run changes neither absent nor existing targets; malformed arguments fail', t => {
  const root = path.join(temp(t), 'absent'); ok(install(root, '--dry-run')); assert.ok(!fs.existsSync(root));
  ok(install(root)); const before = tree(root); ok(install(root, '--dry-run', '--force')); assert.deepEqual(tree(root), before);
  fail(run(['bash', 'install.sh', '--target'], repo));
});
test('existing project check cannot bypass the kit runner', t => {
  const root = project(t); write(root, 'Makefile', 'check:\n\t@echo unrelated-check\n');
  write(root, '.actionplan/in-progress/open.md', '## Open questions\n- Unanswered\n');
  ok(run(['make', 'check'], root)); fail(run(['node', '.actionplan/scripts/check.cjs'], root));
});
test('claims and releases are owner checked; stage preserves locks; resume is idempotent', t => {
  const root = project(t); plan(root); ok(lock(root, 'claim'));
  fail(lock(root, 'claim', 1, 'intruder')); fail(lock(root, 'release', 1, 'intruder'));
  fail(stage(root, 'in-progress', 1, 'intruder')); ok(stage(root, 'in-progress')); ok(stage(root, 'in-progress'));
  assert.ok(fs.existsSync(path.join(root, `.actionplan/locks/${id(1)}.json`)));
  ok(lock(root, 'release'));
});
test('simultaneous overlapping claims have exactly one winner', async t => {
  const root = project(t); plan(root, 1); plan(root, 2);
  const launch = n => new Promise((resolve, reject) => {
    const p = spawn('bash', ['.actionplan/scripts/lock.sh', 'claim', id(n)], { cwd: root, env: { ...process.env, ACTIONPLAN_SESSION_ID: `owner-${n}` }, stdio: 'ignore' });
    p.on('error', reject); p.on('exit', resolve);
  });
  const results = await Promise.all([launch(1), launch(2)]);
  assert.equal(results.filter(x => x === 0).length, 1);
});
test('light plans require filled manifests; aliases, frozen paths and root escapes are checked', t => {
  const root = project(t), light = fs.readFileSync(path.join(repo, 'kit/templates/plan-light.md'), 'utf8').replace('{{ID}}', id(1));
  const p = write(root, `.actionplan/planned/${id(1)}-light.md`, light);
  fail(lock(root, 'claim')); fs.writeFileSync(p, light.replace('| <file> | <change> |', '| src/a.js | change |')); ok(lock(root, 'claim'));
  plan(root, 2, 'src/../src/a.js'); fail(lock(root, 'claim', 2));
  plan(root, 3, '../escape.js'); fail(lock(root, 'claim', 3));
  write(root, '.actionplan/FROZEN.md', '- src/frozen.js — protected\n'); plan(root, 4, 'src/frozen.js'); fail(lock(root, 'claim', 4));
});
test('open questions and invalid stages are refused before movement', t => {
  const root = project(t), p = plan(root); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('## Open questions\n', '## Open questions\n- undecided\n'));
  ok(lock(root, 'claim')); fail(stage(root, 'in-progress')); fail(stage(root, '../qa')); assert.ok(fs.existsSync(p));
});
test('archive rejects missing sign-off/DoD, adverse or incomplete QA and stale evidence', t => {
  const root = project(t), p = plan(root), body = fs.readFileSync(p, 'utf8');
  write(root, `.actionplan/qa/${id(1)}/report-1.md`, 'Unresolved regression.\n');
  fail(stage(root, 'archived'));
  ok(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root)); seal(root);
  fs.writeFileSync(p, body.replace('- [x] Human sign-off', '- [-] Human sign-off')); fail(stage(root, 'archived'));
  fs.writeFileSync(p, body.replace('## Definition of Done', '## Removed')); fail(stage(root, 'archived'));
  fs.writeFileSync(p, body);
  write(root, 'src/a.js', 'changed after verification'); fail(stage(root, 'archived'));
  ok(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root)); seal(root);
  write(root, `.actionplan/qa/${id(1)}/report-1.md`, 'Changed report'); fail(stage(root, 'archived'));
  seal(root); ok(stage(root, 'archived'));
  write(root, 'src/a.js', 'future legitimate change'); ok(run(['node', '.actionplan/scripts/gates/dod-before-archive.cjs'], root));
});
test('failed verification invalidates previous success and cannot be sealed', t => {
  const root = project(t), p = plan(root); ok(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root)); seal(root);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace("printf 'targeted fixture check\\n'", 'exit 9'));
  fail(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root));
  assert.match(fs.readFileSync(path.join(root, `.actionplan/qa/${id(1)}/verification.md`), 'utf8'), /Status: FAIL/);
  fail(run(['node', '.actionplan/scripts/finish.cjs', id(1), '1'], root)); fail(stage(root, 'archived'));
});
test('configured lint failures, failed dispositions and newer QA rounds block completion', t => {
  const root = project(t); plan(root); ok(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root)); seal(root);
  const review = path.join(root, `.actionplan/qa/${id(1)}/review-1.md`);
  fs.writeFileSync(review, fs.readFileSync(review, 'utf8').replace('| ap-qa | PASS |', '| ap-qa | FAIL |'));
  fail(run(['node', '.actionplan/scripts/finish.cjs', id(1), '1'], root));
  fail(stage(root, 'archived'));
  write(root, `.actionplan/qa/${id(1)}/report-2.md`, 'Another round\n'); fail(stage(root, 'archived'));
  const cfg = path.join(root, '.actionplan/config.json'), data = JSON.parse(fs.readFileSync(cfg)); data.commands.lint = 'exit 7'; fs.writeFileSync(cfg, JSON.stringify(data));
  fail(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root));
});
test('symlink aliases overlap; directories and external symlink targets cannot be claimed', t => {
  const root = project(t); write(root, 'src/a.js', 'fixture');
  fs.symlinkSync(path.join(root, 'src'), path.join(root, 'alias'));
  plan(root, 1, 'src/a.js'); ok(lock(root, 'claim'));
  plan(root, 2, 'alias/a.js'); fail(lock(root, 'claim', 2));
  plan(root, 3, '.'); fail(lock(root, 'claim', 3));
  plan(root, 4, 'src'); fail(lock(root, 'claim', 4));
  fs.symlinkSync(os.tmpdir(), path.join(root, 'outside'));
  plan(root, 5, 'outside/file.js'); fail(lock(root, 'claim', 5));
});
test('stale takeover requires expiry and explicit human confirmation', t => {
  const root = project(t); plan(root); ok(lock(root, 'claim'));
  const command = ['bash', '.actionplan/scripts/lock.sh', 'steal', id(1), '--human-confirmed'];
  fail(run(command, root, 'other'));
  const p = path.join(root, `.actionplan/locks/${id(1)}.json`), data = JSON.parse(fs.readFileSync(p));
  data.started = new Date(Date.now() - 9 * 3600000).toISOString(); fs.writeFileSync(p, JSON.stringify(data));
  fail(lock(root, 'steal', 1, 'other')); ok(run(command, root, 'other')); ok(lock(root, 'claim', 1, 'other'));
});
test('a failing pipeline and check-generated source changes cannot produce PASS evidence', t => {
  const root = project(t), p = plan(root), original = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, original.replace("printf 'targeted fixture check\\n'", 'false | true'));
  fail(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root));
  write(root, 'src/a.js', 'before');
  fs.writeFileSync(p, original.replace("printf 'targeted fixture check\\n'", "printf 'after' > src/a.js"));
  fail(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root));
  assert.match(fs.readFileSync(path.join(root, `.actionplan/qa/${id(1)}/verification.md`), 'utf8'), /Checks changed scoped files/);
});
test('missing selected review, missing role and skipped general QA are refused', t => {
  const root = project(t); plan(root); ok(run(['node', '.actionplan/scripts/verify.cjs', id(1)], root)); seal(root);
  const p = path.join(root, `.actionplan/qa/${id(1)}/review-1.md`), original = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, original.replace('| ap-security | SKIP | - |', '| ap-security | PASS | ap-security-report-1.md |'));
  fail(run(['node', '.actionplan/scripts/finish.cjs', id(1), '1'], root)); fail(stage(root, 'archived'));
  fs.writeFileSync(p, original.replace(/^\| ap-cleanup.*\n/m, ''));
  fail(run(['node', '.actionplan/scripts/finish.cjs', id(1), '1'], root));
  fs.writeFileSync(p, original.replace('| ap-qa | PASS | report-1.md |', '| ap-qa | SKIP | - |'));
  fail(run(['node', '.actionplan/scripts/finish.cjs', id(1), '1'], root));
});
