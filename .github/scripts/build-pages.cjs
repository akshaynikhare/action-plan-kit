#!/usr/bin/env node
// Explicit public-site allowlist. Never upload the source tree as the Pages artifact.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../..');
const publicFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'assets'];
function build(out = path.join(root, '_site')) {
  out = path.resolve(out);
  if (fs.existsSync(out) && fs.readdirSync(out).length) throw Error('Site staging directory must be empty; use a fresh output directory');
  fs.mkdirSync(out, { recursive: true });
  for (const name of publicFiles) fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
  console.log(`[pages] staged public site in ${out}`);
  return out;
}
if (require.main === module) {
  try { build(process.argv[2]); } catch (err) { console.error(`[pages] ${err.message}`); process.exitCode = 1; }
}
module.exports = { build, publicFiles };
