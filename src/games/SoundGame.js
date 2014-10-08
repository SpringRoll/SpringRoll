/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){

	//Library depencencies
	var Game = include('cloudkid.Game'),
		Application = include('cloudkid.Application'),
		VOPlayer,
		LoadTask,
		Captions,
		Sound;

	/**
	*  A sub-application for Game which setups Sound, VOPlayer and Captions.
	*  @example
		var game = new cloudkid.SoundGame();
		game.on('init', function(){
			// Ready to use!
		});
	*  @class SoundGame
	*  @extends cloudkid.Game
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
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
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `cloudkid.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `cloudkid.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var SoundGame = function(options)
	{
		Sound = include('cloudkid.Sound');
		VOPlayer = include('cloudkid.VOPlayer');
		Captions = include('cloudkid.Captions', false);

		Game.call(this, Object.merge({
			captionsPath : 'assets/config/captions.json',
			swfPath : 'assets/swfs/',
			mute : false,
			captions : null
		}, options));

		/**
		*  The current music alias playing
		*  @property {string} _music
		*  @private
		*/
		this._music = null;

		/**
		*  The global player for playing voice over
		*  @property {VOPlayer} player
		*/
		this.player = null;

		/**
		*  The global captions object
		*  @property {DOMElement|createjs.Text|PIXI.Text|PIXI.BitmapText} captions
		*/
		this.captions = null;

		// Listen for the game is loaded then initalize the sound
		this.once('loading', onLoading.bind(this));
		this.once('loaded', onLoaded.bind(this));
	};

	// Extend application
	var s = Game.prototype;
	var p = SoundGame.prototype = Object.create(s);

	/**
	*  The Sound is completed, this is the event to listen to 
	*  when the game ready to use. 
	*  @event soundReady
	*/
	var SOUND_READY = 'soundReady';

	/**
	*  Callback when preload as been finished
	*  @method onLoading
	*  @private
	*  @param {Array} tasks The collection of tasks
	*/
	var onLoading = function(tasks)
	{
		if (this.options.captionsPath !== null)
		{
			LoadTask = include('cloudkid.LoadTask');
			tasks.push(new LoadTask(
				'captions',
				this.options.captionsPath,
				onCaptionsLoaded.bind(this)
			));
		}
		else
		{
			onCaptionsLoaded();
		}
	};

	/**
	*  Callback when the captions have been loaded
	*  @method onCaptionsLoaded
	*  @private
	*  @param {LoaderResult} result The loader result
	*/
	var onCaptionsLoaded = function(result)
	{
		var captions = null;

		// Add to the captions
		if (result)
		{
			// Create a new captions object
			captions = new Captions(result.content, this.options.captions);

			// Give the display to the animators
			this.getDisplays(function(display){
				//ensure that displays without Animators don't break anything
				if(display.animator)
					display.animator.captions = captions;
			});

			// Add the reference to the game
			this.captions = captions.textField;
		}

		// Create a new VO Player class
		this.player = new VOPlayer(captions);
	};

	/**
	*  Callback when preload as been finished
	*  @method onLoaded
	*  @private
	*/
	var onLoaded = function()
	{
		this._readyToInit = false;

		// Initialize the sound
		Sound.init({
			swfPath : this.options.swfPath,
			ready : onSoundReady.bind(this)
		});
	};

	/**
	*  Callback when the sound has been initialized
	*  @method onSoundReady
	*  @private
	*/
	var onSoundReady = function()
	{	
		var sounds = this.config.sounds;
		var sound = Sound.instance;

		//initialize Sound and load up global sound config
		if (sounds)
		{
			if (sounds.vo) sound.loadConfig(sounds.vo);
			if (sounds.sfx) sound.loadConfig(sounds.sfx);
			if (sounds.music) sound.loadConfig(sounds.music);
		}

		if (DEBUG)
		{
			// For testing, mute the game if requested
			sound.setMuteAll(!!this.options.mute);
		}

		this._readyToInit = true;
		this.trigger(SOUND_READY);
		Application.prototype._doInit.call(this);
	};

	/**
	*  Set the current music alias to play
	*  @property {string} music
	*  @default null
	*/
	Object.defineProperty(p, "music",
	{
		set: function(value)
		{
			if (value == this._music)
			{
				return;
			}
			var sound = Sound.instance;

			if (DEBUG && !sound)
			{
				Debug.assert("Sound must be created before setting music!");
			}

			if (this._music)
			{
				sound.fadeOut(this._music);
			}
			this._music = value;

			if (this._music)
			{
				sound.play(
					this._music, 
					{
						start: sound.fadeIn.bind(sound, this._music),
						loop: -1
					}
				);
			}
		},
		get: function()
		{
			return this._music;
		}
	});

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.player)
		{
			this.player.destroy();
			this.player = null;
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
		return "[SoundGame name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('cloudkid').SoundGame = SoundGame;

}());