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
			'<%= distFolder %>/modules/cutscene.min.js' : '<%= build.modules.cutscene %>',
			'<%= distFolder %>/modules/translate.min.js' : '<%= build.modules.translate %>'
		}
	},
	development: {
		files: {
			'<%= distFolder %>/<%= build.output %>.debug.js': '<%= build.main %>',
			'<%= distFolder %>/modules/worker.debug.js' : '<%= build.modules.worker %>',
			'<%= distFolder %>/modules/display-generic.debug.js' : '<%= build.modules.displaygeneric %>',
			'<%= distFolder %>/modules/display-createjs.debug.js' : '<%= build.modules.displaycreatejs %>',
			'<%= distFolder %>/modules/display-pixi.debug.js' : '<%= build.modules.displaypixi %>',
			'<%= distFolder %>/modules/tasks.debug.js' : '<%= build.modules.tasks %>',
			'<%= distFolder %>/modules/states.debug.js' : '<%= build.modules.states %>',
			'<%= distFolder %>/modules/sound.debug.js' : '<%= build.modules.sound %>',
			'<%= distFolder %>/modules/captions.debug.js' : '<%= build.modules.captions %>',
			'<%= distFolder %>/modules/cutscene.debug.js' : '<%= build.modules.cutscene %>',
			'<%= distFolder %>/modules/translate.debug.js' : '<%= build.modules.translate %>'
		}
	}
};