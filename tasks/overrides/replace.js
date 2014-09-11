module.exports = {
	worker: {
		src: ['<%= distFolder %>/modules/worker.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	displaygeneric: {
		src: ['<%= distFolder %>/modules/display-generic.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	displaycreatejs: {
		src: ['<%= distFolder %>/modules/display-createjs.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	displaypixi: {
		src: ['<%= distFolder %>/modules/display-pixi.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	tasks: {
		src: ['<%= distFolder %>/modules/tasks.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	states: {
		src: ['<%= distFolder %>/modules/states.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	sound: {
		src: ['<%= distFolder %>/modules/sound.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	captions: {
		src: ['<%= distFolder %>/modules/captions.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	interface: {
		src: ['<%= distFolder %>/modules/interface.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	},
	translate: {
		src: ['<%= distFolder %>/modules/translate.js'],
		overwrite: true,
		replacements: '<%= replace.development.replacements %>'
	}
};