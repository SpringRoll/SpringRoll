module.exports = function(grunt)
{
	grunt.registerTask(
		'docs-live',
		'Generate documentation and push to gh-pages branch', [
			'clean:docs',
			'file-creator:redirect',
			'yuidoc',
			'gh-pages',
			'clean:redirect'
		]
	);

	grunt.registerTask(
		'format',
		'Auto-format the JavaScript and JSON files within the project', [
			'jsbeautifier:all'
		]
	);

	grunt.registerTask(
		'default',
		'Default task to build all the library in minified concat modes', [
			'clean:all',
			'format',
			'build-debug',
			'build'
		]
	);
};