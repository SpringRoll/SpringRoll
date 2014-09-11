module.exports = {
	release: {
		files: {
			'<%= distFolder %>/<%= build.output %>.min.js': '<%= build.main %>',
			'<%= distFolder %>/modules/worker.min.js' : '<%= build.modules.worker %>',
			'<%= distFolder %>/modules/display-generic.min.js' : '<%= build.modules.displaygeneric %>',
			'<%= distFolder %>/modules/display-createjs.min.js' : '<%= build.modules.displaycreatejs %>',
			'<%= distFolder %>/modules/display-pixi.min.js' : '<%= build.modules.displaypixi %>',
			'<%= distFolder %>/modules/tasks.min.js' : '<%= build.modules.tasks %>',
			'<%= distFolder %>/modules/states.min.js' : '<%= build.modules.states %>',
			'<%= distFolder %>/modules/sound.min.js' : '<%= build.modules.sound %>',
			'<%= distFolder %>/modules/captions.min.js' : '<%= build.modules.captions %>',
			'<%= distFolder %>/modules/interface.min.js' : '<%= build.modules.interface %>',
			'<%= distFolder %>/modules/translate.min.js' : '<%= build.modules.translate %>'
		}
	}
};