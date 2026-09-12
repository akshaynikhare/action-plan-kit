#!/usr/bin/env node
// Validate release metadata, package an installable bundle, and publish without replacing assets.
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const bundleFiles = ['install.sh', 'VERSION', 'LICENSE', 'README.md', 'CHANGELOG.md', 'CITATION.cff', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md', 'MAINTAINERS.md', 'docs', 'kit'];
function validate(tag = `v${read('VERSION').trim()}`) {
  const version = read('VERSION').trim();
  if (!/^\d+\.\d+\.\d+$/.test(version) || tag !== `v${version}`) throw Error('Tag must match the stable version in VERSION');
  if (!read('CITATION.cff').includes(`version: "${version}"`)) throw Error('CITATION.cff version does not match VERSION');
  const escaped = version.replace(/\./g, '\\.');
  const changelog = read('CHANGELOG.md');
  const heading = changelog.match(new RegExp(`^## \\[${escaped}\\] - (\\d{4}-\\d{2}-\\d{2})$`, 'm'));
  if (!heading) throw Error('A dated changelog section is required');
  const notes = changelog.slice(heading.index + heading[0].length).split(/^## |^\[/m)[0].trim();
  if (!notes) throw Error('Release notes must not be empty');
  const date = heading[1];
  if (!read('CITATION.cff').includes(`date-released: "${date}"`)) throw Error('Citation and changelog release dates must match');
  if (!read('docs/CITATION.md').includes(`version = {${version}}`)) throw Error('Update the citation example for this release');
  return { version, tag, date, notes: notes + '\n' };
}
function packageRelease(output = path.join(root, 'dist')) {
  const { version } = validate(), prefix = `action-plan-kit-${version}`;
  fs.mkdirSync(output, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'actionplan-package-'));
  try {
    const stage = path.join(tmp, prefix); fs.mkdirSync(stage);
    for (const name of bundleFiles) fs.cpSync(path.join(root, name), path.join(stage, name), { recursive: true });
    const archive = `${prefix}.tar.gz`;
    execFileSync('tar', ['-czf', path.resolve(output, archive), '-C', tmp, prefix]);
    fs.writeFileSync(path.join(output, 'SHA256SUMS'), `${hash(fs.readFileSync(path.join(output, archive)))}  ${archive}\n`);
    console.log(`[release] created ${archive} and SHA256SUMS`);
    return { archive, output };
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
function publish(tag, sha) {
  const meta = validate(tag), repo = process.env.GH_REPO;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '') || !/^[a-f0-9]{40}$/.test(sha || '')) throw Error('GH_REPO and the validated commit SHA are required');
  const gh = args => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
  if (gh(['api', `repos/${repo}/commits/${tag}`, '--jq', '.sha']) !== sha) throw Error('Release tag changed after validation');
  const dir = path.join(root, 'dist'), archive = `action-plan-kit-${meta.version}.tar.gz`;
  if (!fs.existsSync(path.join(dir, archive))) throw Error('Run make package before publishing');
  // List rather than treating any failed lookup as absence: authorization/network failures must stop.
  const releases = JSON.parse(gh(['api', `repos/${repo}/releases?per_page=100`]));
  let release = releases.find(r => r.tag_name === tag);
  const notes = path.join(dir, 'RELEASE_NOTES.md'); fs.writeFileSync(notes, meta.notes);
  if (!release) {
    gh(['release', 'create', tag, '--repo', repo, '--verify-tag', '--draft', '--title', `ActionPlan Kit ${tag}`, '--notes-file', notes]);
    release = JSON.parse(gh(['api', `repos/${repo}/releases/tags/${tag}`]));
  }
  const existingArchive = release.assets.find(a => a.name === archive);
  let archiveHash;
  const downloaded = fs.mkdtempSync(path.join(os.tmpdir(), 'actionplan-published-'));
  try {
    if (existingArchive) {
      gh(['release', 'download', tag, '--repo', repo, '--pattern', archive, '--dir', downloaded]);
      archiveHash = hash(fs.readFileSync(path.join(downloaded, archive)));
    } else {
      gh(['release', 'upload', tag, path.join(dir, archive), '--repo', repo]);
      archiveHash = hash(fs.readFileSync(path.join(dir, archive)));
    }
    const sums = `${archiveHash}  ${archive}\n`;
    if (release.assets.some(a => a.name === 'SHA256SUMS')) {
      gh(['release', 'download', tag, '--repo', repo, '--pattern', 'SHA256SUMS', '--dir', downloaded]);
      if (fs.readFileSync(path.join(downloaded, 'SHA256SUMS'), 'utf8') !== sums) throw Error('Published checksums disagree with the archive; do not overwrite assets');
    } else {
      fs.writeFileSync(path.join(dir, 'SHA256SUMS'), sums);
      gh(['release', 'upload', tag, path.join(dir, 'SHA256SUMS'), '--repo', repo]);
    }
    if (release.draft) gh(['release', 'edit', tag, '--repo', repo, '--draft=false', '--latest']);
    console.log(`[release] published https://github.com/${repo}/releases/tag/${tag}`);
  } finally { fs.rmSync(downloaded, { recursive: true, force: true }); }
}
if (require.main === module) {
  try {
    const [command, arg, sha] = process.argv.slice(2);
    if (command === 'validate') console.log(`[release] ${validate(arg).tag} metadata valid`);
    else if (command === 'package') packageRelease(arg ? path.resolve(arg) : undefined);
    else if (command === 'publish') publish(arg, sha);
    else throw Error('Usage: release.cjs validate [tag] | package [output-dir] | publish <tag> <sha>');
  } catch (err) { console.error(`[release] ${err.message}`); process.exitCode = 1; }
}
module.exports = { validate, packageRelease, bundleFiles };
