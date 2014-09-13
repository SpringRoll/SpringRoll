module.exports = {
	js: {
		files: [
			'Gruntfile.js',
			'<%= build.main %>',
			'<%= build.file %>',
			'<%= build.modules.worker %>',
			'<%= build.modules.displaygeneric %>',
			'<%= build.modules.displaycreatejs %>',
			'<%= build.modules.displaypixi %>',
			'<%= build.modules.tasks %>',
			'<%= build.modules.states %>',
			'<%= build.modules.sound %>',
			'<%= build.modules.captions %>',
			'<%= build.modules.interface %>',
			'<%= build.modules.translate %>'
		]
	}
};