module.exports = function(grunt)
{
	grunt.util.linefeed = "\n";
	require('library-grunt')(grunt,
	{
		themePath: '../SpringRollTheme'
	});
};