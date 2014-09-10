module.exports = {
	worker: {
		src: ['<%= distFolder %>/modules/worker.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	displaygeneric: {
		src: ['<%= distFolder %>/modules/display-generic.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	displaycreatejs: {
		src: ['<%= distFolder %>/modules/display-createjs.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	displaypixi: {
		src: ['<%= distFolder %>/modules/display-pixi.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	tasks: {
		src: ['<%= distFolder %>/modules/tasks.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	states: {
		src: ['<%= distFolder %>/modules/states.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	sound: {
		src: ['<%= distFolder %>/modules/sound.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	captions: {
		src: ['<%= distFolder %>/modules/captions.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	cutscene: {
		src: ['<%= distFolder %>/modules/cutscene.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	},
	translate: {
		src: ['<%= distFolder %>/modules/translate.js'],
		overwrite: true,
		replacements: ['<%= replace.combine.replacements %>']
	}
};