/**
*  @module cloudkid
*/
(function(undefined){

	//Library depencencies
	var Game = include('cloudkid.Game'),
		VOPlayer,
		Captions,
		Sound;

	/**
	*  A sub-application for Game which setups Sound, VOPlayer and Captions.
	*  @example
		var game = new cloudkid.SoundGame();
		game.on('soundReady', function(){
			// Ready to use!
		});
	*  @class SoundGame
	*  @extends Game
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
	*  @param {boolean} [options.mute=false] Set the initial mute state of the all the audio (unminifed library version only)
	*/
	var SoundGame = function(options)
	{
		Sound = include('cloudkid.Sound');
		VOPlayer = include('cloudkid.VOPlayer');
		Captions = include('cloudkid.Captions', false);

		Game.call(this, options);

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

		// Listen for the game is loaded then initalize the sound
		onLoaded = onLoaded.bind(this);
		onLoading = onLoading.bind(this);

		this.on({
			loaded : onLoaded,
			loading : onLoading
		});
	};

	// Extend application
	var s = Game.prototype;
	var p = SoundGame.prototype = Object.create(s);

	/**
	*  The Sound is completed, this is the event to listen to 
	*  when the game ready to use. Do NOT use Application's init,
	*  or Game's loaded events as the entry point for your application.
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
			tasks.push(new LoadTask(
				'captions',
				this.options.captionsPath || "assets/config/captions.json",
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
			captions = new Captions(result.content);
		}

		this.player = new VOPlayer(captions);
	};

	/**
	*  Callback when preload as been finished
	*  @method onLoaded
	*  @private
	*/
	var onLoaded = function()
	{
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

		this.trigger(SOUND_READY);
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