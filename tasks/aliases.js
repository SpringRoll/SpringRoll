module.exports = function(grunt)
{
	grunt.registerTask(
		'test', 
		'Run the unit tests', 
		['qunit']
	);
};  