/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){

	//Library depencencies
	var StateGame = include('cloudkid.StateGame'),
		UIScaler;

	/**
	*  A sub-game class to provide scaling functionality and responsive design.
	*  @example
		var game = new cloudkid.ScalingGame();
		game.on('scalingReady', function(){
			// Ready to use!
		});
	*  @class ScalingGame
	*  @extends cloudkid.StateGame
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out sound alias or sound object
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
	*  @param {boolean} [options.mute=false] Set the initial mute state of the all the audio (unminifed library version only)
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile=false] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number: 
	* 		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding "?v=" 
	*		to the end of each file path requested. Use for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file requests
	*		this is a great way to load all load requests with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original aspect ratio
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.ip] The host computer for IP remote debugging,
	*		the debug module must be included to use this feature.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `cloudkid.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `cloudkid.PixiTask`, default behavior is to load assets from the same domain.	
	*/
	var ScalingGame = function(options)
	{
		UIScaler = include('cloudkid.UIScaler');

		StateGame.call(this, options);

		/**
		*  The current device pixel ratio as reported by the browser
		*  @property {number} pixelRatio
		*/
		this.pixelRatio = window.devicePixelRatio || 1;
		
		/**
		*  The main UIScaler for any display object references in the main game.
		*  @property {UIScaler} scaler
		*/
		this.scaler = null; 

		/** 
		*  The default pixels per inch on the screen
		*  @property {int} ppi
		*  @default 96
		*/
		this.ppi = 96;

		// Listen when the state manager is setup
		this.on('statesReady', onStatesReady.bind(this));
	};

	// Extend application
	var s = StateGame.prototype;
	var p = ScalingGame.prototype = Object.create(s);

	/**
	*  The main entry point for this game
	*  @event scalingReady
	*/
	var SCALING_READY = 'scalingReady';

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onStatesReady = function()
	{
		this.off('statesReady');

		var config = this.config,
			display = this.display;

		if (!config.designedSettings)
		{
			if (DEBUG)
			{
				throw "The config.json requires designedSettings object which contains keys 'designedWidth', 'designedHeight', and 'designedPPI'";
			}
			else
			{
				throw "designedSettings required in config";
			}
		}

		if (!config.scaling)
		{
			if (DEBUG)
			{
				throw "The config.json requires scaling object which contains all the state scaling";
			}
			else
			{
				throw "scaling required in config";
			}
		}

		// Create the calling from the configuration
		this.scaler = UIScaler.fromJSON(
			this, 
			config.designedSettings, 
			config.scaling,
			false
		);

		// Resize now that the config is loaded - fix portrait mode
		this.on("resize", resize.bind(this));

		// Dispatch a resize function
		this.trigger('resize', display.width, display.height);

		// We're done initializing the scaler
		this.trigger(SCALING_READY);
	};

	/**
	*  Handler for the stage resizing
	*  @method resize
	*  @private
	*  @param {number} width The width of the display
	*  @param {number} height  The height of the display
	*/
	var resize = function(w, h)
	{
		var pretendPPI = this.ppi;

		// assume a small phone and force a higher ppi in 
		// size calculations for larger buttons
		if (h <= 450)
		{
			pretendPPI *= 1.5;
		}
		
		// Set the new design scale size
		UIScaler.init(w, h, pretendPPI);

		this.scaler.resize();
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.scaler)
		{
			this.scaler.destroy();
			this.scaler = null;
		}
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[ScalingGame name='" + this.name + "'']";
	};

	// Add to the namespace
	namespace('cloudkid').ScalingGame = ScalingGame;

}());