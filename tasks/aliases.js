module.exports = function(grunt)
{
	grunt.registerTask(
		'test', 
		'Run the unit tests', 
		['qunit']
	);

	grunt.registerTask(
		'test-live',
		'Run the unit tests in the browser',
		['connect:test']
	);

	grunt.registerTask(
		'examples',
		'Install bower libraries',
		['bower-install-simple:dev', 'connect:examples']
	);
};  