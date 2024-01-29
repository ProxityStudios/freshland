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
				pkgRoot: './dist',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: [
					'dist',
					'docs',
					'templates',
					'package.json',
					'npm-shrinkwrap.json',
				],
				message:
					// eslint-disable-next-line no-template-curly-in-string
					'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
		[
			'@semantic-release/github',
			{
				assets: [
					{ path: 'dist', label: 'JS distribution' },
					{ path: 'docs', label: 'Docs distribution' },
					{ path: 'templates', label: 'Templtes distribution' },
					{ path: 'package.json', label: 'Package distribution' },
					{ path: 'npm-shrinkwrap.json', label: 'Shrinkwro distribution' },
				],
			},
		],
	],
};
