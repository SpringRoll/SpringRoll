module.exports = {
	release: {
		files: {
			'<%= distFolder %>/<%= build.output %>.min.js': '<%= build.main %>',
			'<%= distFolder %>/modules/worker.min.js' : '<%= build.modules.worker %>',
			'<%= distFolder %>/modules/display-native.min.js' : '<%= build.modules.displaynative %>',
			'<%= distFolder %>/modules/display-createjs.min.js' : '<%= build.modules.displaycreatejs %>',
			'<%= distFolder %>/modules/display-pixi.min.js' : '<%= build.modules.displaypixi %>',
			'<%= distFolder %>/modules/game.min.js' : '<%= build.modules.game %>',
			'<%= distFolder %>/modules/tasks.min.js' : '<%= build.modules.tasks %>',
			'<%= distFolder %>/modules/states.min.js' : '<%= build.modules.states %>',
			'<%= distFolder %>/modules/sound.min.js' : '<%= build.modules.sound %>',
			'<%= distFolder %>/modules/captions.min.js' : '<%= build.modules.captions %>',
			'<%= distFolder %>/modules/interface.min.js' : '<%= build.modules.interface %>',
			'<%= distFolder %>/modules/translate.min.js' : '<%= build.modules.translate %>'
		},
		options: {
			banner: '/*! <%= build.name %> <%= build.version %> */\n!function(){"use strict";',
			footer: '}();'
		}
	}
};