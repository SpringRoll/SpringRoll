module.exports = function(grunt)
{
	grunt.registerTask(
		'test', 
		'Run the unit tests', [
			'bower-install-simple:dev', 
			'qunit'
		]
	);

	grunt.registerTask(
		'test-live',
		'Run the unit tests in the browser', [
			'bower-install-simple:dev', 
			'connect:test'
		]
	);

	grunt.registerTask(
		'examples',
		'Install bower libraries', [
			'bower-install-simple:dev', 
			'connect:examples'
		]
	);
};  