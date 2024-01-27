module.exports = {
	branches: [
		'main', // string
		{ name: 'beta', prerelease: true }, // object with name property
		// You can add more branches as needed
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'@semantic-release/npm',
		'@semantic-release/github',
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'CHANGELOG.md',
			},
		],
	],
};
