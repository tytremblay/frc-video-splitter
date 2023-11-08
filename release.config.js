module.exports = {
  branches: [
    'alpha',
    'main',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    'semantic-release-export-data',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
      },
    ],
  ],
};