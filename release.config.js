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
				assets: ['package/'],
				message:
					// eslint-disable-next-line no-template-curly-in-string
					'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}',
			},
		],
		'@semantic-release/github',
	],
};
