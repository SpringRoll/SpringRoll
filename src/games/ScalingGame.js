/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var StateGame = include('springroll.StateGame'),
		UIScaler;

	/**
	*  A sub-game class to provide scaling functionality and responsive design.
	*  @example
		var game = new springroll.ScalingGame();
		game.on('scalingReady', function(){
			// Ready to use!
		});
	*  @class ScalingGame
	*  @extends springroll.StateGame
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
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add a maximum aspect ratio.
	*         This allows for "title-safe" responsiveness. Must be greater than the original aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging,
	*		the debug module must be included to use this feature. Can be an IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var ScalingGame = function(options)
	{
		UIScaler = include('springroll.UIScaler');

		StateGame.call(this, options);
		
		/**
		*  The main UIScaler for any display object references in the main game.
		*  @property {UIScaler} scaler
		*/
		this.scaler = null;

		// Listen when the state manager is setup
		this.once('statesReady', onStatesReady.bind(this));
	};

	// Extend application
	var s = StateGame.prototype;
	var p = ScalingGame.prototype = Object.create(s);

	/**
	*  When the scaling has been initialized
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
		var config = this.config,
			display = this.display,
			designed = config.designedSettings;

		if (!designed)
		{
			if (DEBUG)
			{
				throw "The config requires 'designedSettings' object which contains keys 'width' and 'height'";
			}
			else
			{
				throw "'designedSettings' required in config";
			}
		}

		if (!config.scaling)
		{
			if (DEBUG)
			{
				throw "The config requires 'scaling' object which contains all the state scaling items";
			}
			else
			{
				throw "'scaling' required in config";
			}
		}

		// Create the calling from the configuration
		// This will only scale items on the root of the stage
		this.scaler = new UIScaler(
			this,
			designed,
			config.scaling,
			true,
			this.display
		);
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
	namespace('springroll').ScalingGame = ScalingGame;

}());