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
  assert.deepEqual(files(out), ['.nojekyll', '404.html', 'assets/social-card.png', 'index.html', 'robots.txt', 'sitemap.xml']);
  assert.throws(() => build(out), /must be empty/);
  const png = fs.readFileSync(path.join(out, 'assets/social-card.png'));
  assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
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
