module.exports = {
	worker: {
		src: ['<%= build.modules.worker %>'],
		dest: '<%= distFolder %>/modules/worker.js'
	},
	displaygeneric : {
		src: ['<%= build.modules.displaygeneric %>'],
		dest: '<%= distFolder %>/modules/display-generic.js'
	},
	displaypixi : {
		src: ['<%= build.modules.displaypixi %>'],
		dest: '<%= distFolder %>/modules/display-pixi.js'
	},
	displaycreatejs : {
		src: ['<%= build.modules.displaycreatejs %>'],
		dest: '<%= distFolder %>/modules/display-createjs.js'
	},
	tasks : {
		src: ['<%= build.modules.tasks %>'],
		dest: '<%= distFolder %>/modules/tasks.js'
	},
	states : {
		src: ['<%= build.modules.states %>'],
		dest: '<%= distFolder %>/modules/states.js'
	},
	sound : {
		src: ['<%= build.modules.sound %>'],
		dest: '<%= distFolder %>/modules/sound.js'
	},
	captions : {
		src: ['<%= build.modules.captions %>'],
		dest: '<%= distFolder %>/modules/captions.js'
	},
	interface : {
		src: ['<%= build.modules.interface %>'],
		dest: '<%= distFolder %>/modules/interface.js'
	},
	translate : {
		src: ['<%= build.modules.translate %>'],
		dest: '<%= distFolder %>/modules/translate.js'
	},
	options: {
		banner: '/*! <%= build.name %> <%= build.version %> */\n!function(){"use strict";',
		footer: '}();'
	}
};