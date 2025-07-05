/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main', { name: 'beta', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: './docs/CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: './package',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['docs/', './package.json', './package-lock.json'],
        message: 'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
