# Release and Pages publishing

Akshay Nikhare owns releases. Automation uses GitHub's repository token with job-scoped permissions;
no npm account, package registry credential or personal access token is needed.

## Publish a release

1. Update VERSION, CITATION.cff (version and date), docs/CITATION.md and CHANGELOG.md together.
2. Run `make test` and `make package`. Review the archive and upgrade compatibility.
3. Merge the release commit to `main` and wait for CI to pass.
4. Create an annotated version tag and push it. For example, for the version in VERSION:

```bash
release_version=$(cat VERSION)
git tag -a "v${release_version}" -m "ActionPlan Kit v${release_version}"
git push origin "v${release_version}"
```

The Release workflow validates the tag against VERSION/citation/changelog, reruns offline CI,
requires the tagged commit to belong to main, packages `kit/` with its installer, license and guides,
and publishes an installable `.tar.gz` plus SHA256SUMS. GitHub also provides source archives.
Release notes come from that version's changelog section. Nothing is published to npm or PyPI.

For recovery, use **Actions → Release → Run workflow**, enter the existing tag, and select main.
Reruns keep an existing release and upload only missing assets; they do not overwrite published
assets. If a published release needs code changes, publish a new version instead of moving its tag.

## Publish the website

The Pages workflow runs on pushes to main or manual dispatch on main. It validates the code and
site, stages only index.html, 404.html, robots.txt, sitemap.xml and assets/, then deploys through
GitHub's `github-pages` environment. The repository source, test logs and installed project data
are not part of the site artifact.

Repository setup: **Settings → Pages → Source → GitHub Actions**. The live address is
https://akshaynikhare.github.io/action-plan-kit/. The deploy job has `pages: write` and
`id-token: write`; ordinary CI uses read-only repository access. Official actions are pinned to
commit hashes and Dependabot proposes updates.

Check failed runs in Actions. A failed build never reaches the publish/deploy job. To roll back
website content, revert the site change on main and let Pages redeploy the reviewed revision.
The [GitHub Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
describes the deployment permissions and artifact requirements.
