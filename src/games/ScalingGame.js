/**
*  @module cloudkid
*/
(function(undefined){

	//Library depencencies
	var StateGame = include('cloudkid.StateGame'),
		UIScaler;

	/**
	*  A sub-game class to provide scaling functionality and responsive design.
	*  @class ScalingGame
	*  @extends StateGame
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
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
		*  The current UI scaler
		*  @property {UIScaler} scaling
		*/
		this.scaling = null; 

		/** 
		*  The default pixels per inch on the screen
		*  @property {int} ppi
		*  @default 96
		*/
		this.ppi = 96;

		// Listen when the state manager is setup
		onStatesReady = onStatesReady.bind(this);
		this.on('statesReady', onStatesReady);
	};

	// Extend application
	var s = StateGame.prototype;
	var p = ScalingGame.prototype = Object.create(s);

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onStatesReady = function()
	{
		this.off('statesReady', onStatesReady);

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

		// Set the initial UIScaler
		UIScaler.init(display.width, display.height, this.ppi);

		// Create the calling from the configuration
		this.scaling = UIScaler.fromJSON(
			display.stage, 
			config.designedSettings, 
			config.scaling,
			false
		);

		// Resize now that the config is loaded - fix portrait mode
		this.on("resize", resize.bind(this));

		// Dispatch a resize function
		this.trigger('resize', display.width, display.height);
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
		UIScaler.init(this.gameWidth, this.gameHeight, pretendPPI);

		this.scaling.resize();	
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.scaling)
		{
			this.scaling.destroy();
			this.scaling = null;
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
		return "[ScalingGame '" + this.name + "'']";
	};

	// Add to the namespace
	namespace('cloudkid').ScalingGame = ScalingGame;

}());