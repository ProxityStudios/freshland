module.exports = {
	branches: ['main', { name: 'beta', prerelease: true }],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'docs/CHANGELOG.md',
			},
		],
		[
			'@semantic-release/npm',
			{
				pkgRoot: 'dist',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: [
					'dist/**/*.{js}',
					'docs',
					'package.json',
					'npm-shrinkwrap.json',
				],
				message:
					// eslint-disable-next-line no-template-curly-in-string
					'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
		'@semantic-release/github',
	],
};
