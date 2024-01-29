module.exports = {
	branches: [
		'main', // string
		{ name: 'beta', prerelease: true },
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'docs/CHANGELOG.md',
			},
		],
		'@semantic-release/npm',
		[
			'@semantic-release/git',
			{
				assets: ['docs/CHANGELOG.md'],
			},
		],
		'@semantic-release/github',
	],
};