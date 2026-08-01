/**
 * semantic-release configuration.
 *
 * Versions are derived from Conventional Commit messages on the release
 * branches below:
 *   - fix:            -> patch (x.y.Z)
 *   - feat:           -> minor (x.Y.0)
 *   - BREAKING CHANGE -> major (X.0.0)  (footer, or `!` after the type)
 *   - docs/chore/etc. -> no release
 *
 * Stable releases come from `main`. Push to `beta`/`alpha` for prereleases
 * (e.g. 4.0.0-beta.1). See CONTRIBUTING.md for the commit format.
 *
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: [
    'main',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    // Exposes the computed version/published flag as GitHub Actions step
    // outputs (new-release-version, new-release-published) for the workflow.
    'semantic-release-export-data',
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    // This is a packaged desktop app, not an npm package — bump the version in
    // package.json but never publish to the registry.
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/git',
      {
        assets: ['package.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
}
