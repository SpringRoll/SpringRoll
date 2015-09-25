module.exports = {
	options: {
		base: '.',
		message: 'Auto-generated commit'
    },
    src: [
        'index.htm',
    	'<%= docsPath %>/**/*',
    	'dist/**/*',
    	'examples/**/*',
    	'components/google-code-prettify/bin/prettify.min.css',
    	'components/google-code-prettify/bin/prettify.min.js',
    	'components/google-code-prettify/bin/run_prettify.min.js',
    	'components/tweenjs/lib/tweenjs.min.js',
    	'components/easeljs/lib/easeljs.combined.js',
    	'components/easeljs/lib/movieclip.combined.js',
    	'components/preloadjs/lib/preloadjs.min.js',
    	'components/soundjs/lib/flashaudioplugin.min.js',
    	'components/soundjs/lib/soundjs.min.js',
    	'components/pixi.js/bin/pixi.js',
    	'components/jquery/dist/jquery.min.js'
    ]
};