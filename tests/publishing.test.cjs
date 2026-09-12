const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const { validate, packageRelease } = require('../.github/scripts/release.cjs');
const { build } = require('../.github/scripts/build-pages.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function temp(t) { const p = fs.mkdtempSync(path.join(os.tmpdir(), 'actionplan-publish-test-')); t.after(() => fs.rmSync(p, { recursive: true, force: true })); return p; }
function files(dir, prefix = '') { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]).sort(); }
test('release metadata agrees and an incorrect tag is rejected', () => {
  const v = read('VERSION').trim(), result = validate(`v${v}`);
  assert.equal(result.version, v); assert.match(result.notes, /MIT license/);
  assert.throws(() => validate('v999.0.0'), /Tag must match/);
  assert.ok(read('README.md').trimEnd().split('\n').length <= 60);
});
test('release bundle is installable, retains the license and matches its checksum', t => {
  const out = temp(t), { archive } = packageRelease(out);
  const bytes = fs.readFileSync(path.join(out, archive));
  assert.equal(fs.readFileSync(path.join(out, 'SHA256SUMS'), 'utf8'), `${crypto.createHash('sha256').update(bytes).digest('hex')}  ${archive}\n`);
  const unpack = path.join(out, 'unpack'); fs.mkdirSync(unpack);
  execFileSync('tar', ['-xzf', path.join(out, archive), '-C', unpack]);
  const source = path.join(unpack, `action-plan-kit-${read('VERSION').trim()}`);
  assert.ok(fs.existsSync(path.join(source, 'LICENSE')));
  assert.ok(!fs.existsSync(path.join(source, '.git')));
  assert.ok(!fs.existsSync(path.join(source, 'tests')));
  const target = path.join(out, 'installed');
  execFileSync('bash', [path.join(source, 'install.sh'), '--target', target, '--code', 'AP'], { stdio: 'pipe' });
  assert.equal(fs.readFileSync(path.join(target, '.actionplan/LICENSE'), 'utf8'), read('LICENSE'));
  execFileSync('node', [path.join(target, '.actionplan/scripts/check.cjs')], { stdio: 'pipe' });
});
test('Pages stages only the explicit public assets and refuses dirty staging', t => {
  const out = path.join(temp(t), 'site'); build(out);
  assert.deepEqual(files(out), ['.nojekyll', '404.html', 'assets/apple-touch-icon.png', 'assets/favicon-32.png', 'assets/icon-512.png', 'assets/icon.svg', 'assets/social-card.png', 'index.html', 'robots.txt', 'sitemap.xml']);
  assert.throws(() => build(out), /must be empty/);
  const pages = read('index.html') + read('404.html');
  for (const [asset, width, height] of [['social-card.png', 1200, 630], ['favicon-32.png', 32, 32], ['apple-touch-icon.png', 180, 180], ['icon-512.png', 512, 512]]) {
    const png = fs.readFileSync(path.join(out, 'assets', asset));
    assert.equal(png.readUInt32BE(16), width, `${asset} width`); assert.equal(png.readUInt32BE(20), height, `${asset} height`);
    assert.ok(pages.includes(`assets/${asset}`), `published asset is unreferenced: ${asset}`);
  }
  assert.ok(pages.includes('assets/icon.svg'), 'published asset is unreferenced: icon.svg');
});
test('published pages are self-contained with valid landing-page metadata', () => {
  for (const file of ['index.html', '404.html']) {
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!/<(?:script|iframe|img)[^>]+src=["'](?:https?:)?\/\//i.test(html));
    assert.ok(!/<link[^>]+(?:stylesheet|preconnect|dns-prefetch)[^>]+https?:/i.test(html));
    assert.ok(!/@import|url\(\s*["']?https?:/i.test(html));
  }
  const html = read('index.html');
  assert.ok(html.match(/<title>(.*?)<\/title>/)[1].length <= 60);
  assert.ok(html.match(/name="description" content="([^"]+)"/)[1].length <= 155);
  for (const key of ['og:title', 'og:description', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(html.includes(`"${key}"`));
  assert.match(read('404.html'), /name="robots" content="noindex"/);
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/akshaynikhare\.github\.io\/action-plan-kit\/sitemap\.xml$/m);
});
test('landing-page structured data is valid and mirrors the visible answers', () => {
  const html = read('index.html');
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const types = graph.map(node => node['@type']);
  for (const type of ['Person', 'SoftwareApplication', 'WebSite', 'WebPage', 'HowTo', 'FAQPage']) assert.ok(types.includes(type), `missing ${type}`);
  const ids = new Set(graph.map(node => node['@id']));
  for (const reference of JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)) assert.ok(ids.has(reference[1]), `dangling reference ${reference[1]}`);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').replace(/ ([.,?])(?=\s|$)/g, '$1');
  for (const question of graph.find(node => node['@type'] === 'FAQPage').mainEntity) {
    assert.ok(visible.includes(question.name), `question is not on the page: ${question.name}`);
    assert.ok(visible.includes(question.acceptedAnswer.text), `answer is not on the page: ${question.name}`);
  }
});
test('community and user guides have no broken local Markdown links', () => {
  const markdown = fs.readdirSync(root).filter(f => f.endsWith('.md')).concat(files(path.join(root, 'docs')).filter(f => f.endsWith('.md')).map(f => `docs/${f}`));
  for (const file of markdown) {
    for (const match of read(file).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), target)), `${file}: broken link ${target}`);
    }
  }
});
test('publisher uses the creation response when the new draft is absent from release listings', t => {
  const out = temp(t), source = path.join(out, 'source'), bin = path.join(out, 'bin');
  fs.mkdirSync(source); fs.mkdirSync(bin);
  for (const file of ['VERSION', 'CITATION.cff', 'CHANGELOG.md', 'docs/CITATION.md']) {
    const dest = path.join(source, file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(path.join(root, file), dest);
  }
  fs.mkdirSync(path.join(source, 'dist'));
  const version = read('VERSION').trim(), archive = `action-plan-kit-${version}.tar.gz`, sha = 'a'.repeat(40);
  fs.writeFileSync(path.join(source, 'dist', archive), 'synthetic archive');
  const log = path.join(out, 'calls.jsonl');
  fs.writeFileSync(path.join(bin, 'gh'), `#!/usr/bin/env node
const fs = require('fs'), args = process.argv.slice(2);
fs.appendFileSync(process.env.MOCK_CALLS, JSON.stringify(args) + '\\n');
if (args[0] === 'api' && args.some(a => a.includes('/commits/'))) console.log('${sha}');
else if (args.includes('POST')) console.log(JSON.stringify({id: 1, tag_name: 'v${version}', draft: true, assets: []}));
else if (args[0] === 'api') console.log('[]');
`, { mode: 0o755 });
  execFileSync(process.execPath, [path.join(root, '.github/scripts/release.cjs'), 'publish', `v${version}`, sha], {
    env: { ...process.env, GH_REPO: 'fixture/project', ACTIONPLAN_RELEASE_SOURCE: source, PATH: bin + path.delimiter + process.env.PATH, MOCK_CALLS: log }, stdio: 'pipe',
  });
  const calls = fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(calls.filter(args => args.some(a => a.includes('/releases?'))).length, 1);
  assert.equal(calls.filter(args => args[0] === 'release' && args[1] === 'upload').length, 2);
  assert.ok(calls.some(args => args.includes('--draft=false')));
});
