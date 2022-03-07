/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Sound = include('springroll.Sound'),
		VOPlayer = include('springroll.VOPlayer'),
		WebAudioPlugin = include('createjs.WebAudioPlugin'),
		FlashAudioPlugin = include('createjs.FlashAudioPlugin', false);

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(90);

	//Initialize
	plugin.setup = function()
	{
		/**
		 * The preferred order of SoundJS audio plugins to use.
		 * @property {Array} options.audioPlugins
		 * @default [WebAudioPlugin,FlashAudioPlugin]
		 * @readOnly
		 */
		this.options.add('audioPlugins', FlashAudioPlugin ? [WebAudioPlugin, FlashAudioPlugin] : [WebAudioPlugin], true);

		/**
		 * The relative location to the FlashPlugin swf for SoundJS
		 * @property {String} options.swfPath
		 * @default 'assets/swfs/'
		 * @readOnly
		 */
		this.options.add('swfPath', 'assets/swfs/', true);

		/**
		 * For the Sound class to use the Flash plugin shim
		 * @property {Boolean} options.forceFlashAudio
		 * @default false
		 * @readOnly
		 */
		this.options.add('forceFlashAudio', false, true);

		/**
		 * For the Sound class to use Native Audio Plugin if Cordova is detected. Only applicable to games that require native audio.
		 * If set to true, use Native Audio in Cordova if the plugin is available.
		 * If set to false, then Sound will fall back to the standard plugins as set either by plugin options or in sound class.
		 * @property {Boolean} options.forceNativeAudio
		 * @default false
		 * @readOnly
		 */
		this.options.add('forceNativeAudio', false, true);

		/**
		 * The order in which file types are
		 * preferred, where "ogg" becomes a ".ogg"
		 * extension on all sound file urls.
		 * @property {Array} options.audioTypes
		 * @default ['mp3']
		 * @readOnly
		 */
		this.options.add('audioTypes', ["mp3"], true);

		if (DEBUG)
		{
			/**
			 * Set the initial mute state of the all the audio
			 * (unminifed library version only)
			 * @property {Boolean} options.mute
			 * @default false
			 * @readOnly
			 */
			this.options.add('mute', false, true);
		}

		/**
		 * The current music alias playing
		 * @property {String} _music
		 * @private
		 */
		this._music = null;

		/**
		 * The current music SoundInstance playing
		 * @property {SoundInstance} _musicInstance
		 * @private
		 */
		this._musicInstance = null;

		/**
		 * The global player for playing voice over
		 * @property {springroll.VOPlayer} voPlayer
		 */
		this.voPlayer = new VOPlayer();

		/**
		 * The global player for all audio, also accessible through singleton
		 * @property {springroll.Sound} sound
		 */
		this.sound = null;

		//Add new task
		this.assetManager.register('springroll.SoundTask');

		/**
		 * Get or set the current music alias to play
		 * @property {String} music
		 * @default null
		 */
		Object.defineProperty(this, "music",
		{
			set: function(value)
			{
				if (value == this._music)
				{
					return;
				}
				var sound = this.sound;

				if (this._music)
				{
					sound.fadeOut(this._music);
					this._musicInstance = null;
				}
				this._music = value;

				if (value)
				{
					this._musicInstance = sound.play(
						this._music,
						{
							start: sound.fadeIn.bind(sound, value),
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
		 * The SoundInstance for the current music, for adjusting volume.
		 * @property {SoundInstance} musicInstance
		 */
		Object.defineProperty(this, "musicInstance",
		{
			get: function()
			{
				return this._musicInstance;
			}
		});

		//Add the listener for the config loader to autoload the sounds
		this.once('configLoaded', function(config)
		{
			//initialize Sound and load up global sound config
			var sounds = config.sounds;
			var sound = this.sound;
			if (sounds)
			{
				if (sounds.vo)
				{
					sound.addContext(sounds.vo);
				}
				if (sounds.sfx)
				{
					sound.addContext(sounds.sfx);
				}
				if (sounds.music)
				{
					sound.addContext(sounds.music);
				}
			}
		});
	};

	/**
	 * The sound is ready to use
	 * @event soundReady
	 */
	var SOUND_READY = 'soundReady';

	//Start the initialization of the sound
	plugin.preload = function(done)
	{
		Sound.init(
		{
			plugins: this.options.audioPlugins,
			swfPath: this.options.swfPath,
			types: this.options.audioTypes,
			ready: function()
				{
					if (this.destroyed) return;

					var sound = this.sound = Sound.instance;

					if (DEBUG)
					{
						//For testing, mute the game if requested
						sound.muteAll = !!this.options.mute;
					}
					//Add listeners to pause and resume the sounds
					this.on(
					{
						paused: function()
						{
							sound.pauseAll();
						},
						resumed: function()
						{
							sound.resumeAll();
						}
					});

					this.trigger(SOUND_READY);
					done();
				}
				.bind(this)
		});
	};

	//Destroy the animator
	plugin.teardown = function()
	{
		if (this.voPlayer)
		{
			this.voPlayer.destroy();
			this.voPlayer = null;
		}
		if (this.sound)
		{
			this.sound.destroy();
			this.sound = null;
		}
	};

}());