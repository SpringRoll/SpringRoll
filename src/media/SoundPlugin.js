/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Sound = include('springroll.Sound'),
		VOPlayer = include('springroll.VOPlayer');

	/**
	 * Plugin for the Sound class, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class SoundPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var SoundPlugin = function()
	{
		ApplicationPlugin.call(this);

		// Higher priority for the sound
		this.priority = 9;
	};

	// Reference to the prototype
	var p = extend(SoundPlugin, ApplicationPlugin);

	// Initialize
	p.init = function()
	{
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
		 * The order in which file types are
		 * preferred, where "ogg" becomes a ".ogg"
		 * extension on all sound file urls.
		 * @property {Array} options.audioTypes
		 * @default ['ogg','mp3'] 
		 * @readOnly
		 */
		this.options.add('audioTypes', ["ogg", "mp3"], true);

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
		*  The current music alias playing
		*  @property {String} _music
		*  @private
		*/
		this._music = null;
		
		/**
		*  The current music SoundInstance playing
		*  @property {SoundInstance} _musicInstance
		*  @private
		*/
		this._musicInstance = null;

		/**
		*  The global player for playing voice over
		*  @property {springroll.VOPlayer} player
		*/
		this.player = new VOPlayer();

		/**
		*  The global player for all audio, also accessible through singleton
		*  @property {springroll.Sound} sound
		*/
		this.sound = null;

		/**
		*  Get or set the current music alias to play
		*  @property {String} music
		*  @default null
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

				if (this._music)
				{
					this._musicInstance = sound.play(
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
		*  The SoundInstance for the current music, for adjusting volume.
		*  @property {SoundInstance} musicInstance
		*/
		Object.defineProperty(this, "musicInstance",
		{
			get: function()
			{
				return this._musicInstance;
			}
		});

		/**
		*  Convenience method to loads a Sound config object.
		*  @method addSounds
		*  @public
		*  @param {Object} config The config to load.
		*  @param {String} [config.context] The optional sound context to load sounds into unless
		*                                   otherwise specified by the individual sound. Sounds do not
		*                                   require a context.
		*  @param {String} [config.path=""] The path to prepend to all sound source urls in this config.
		*  @param {Array} config.soundManifest The list of sounds, either as String ids or Objects with
		*                                      settings.
		*  @param {Object|String} config.soundManifest.* An entry in the array. If this is a
		*                                                string, then it is the same as
		*                                                {'id':'<yourString>'}.
		*  @param {String} config.soundManifest.*.id The id to reference the sound by.
		*  @param {String} [config.soundManifest.*.src] The src path to the file, without an
		*                                               extension. If omitted, defaults to id.
		*  @param {Number} [config.soundManifest.*.volume=1] The default volume for the sound,
		*                                                    from 0 to 1.
		*  @param {Boolean} [config.soundManifest.*.loop=false] If the sound should loop by
		*                                                       default whenever the loop
		*                                                       parameter in play() is not
		*                                                       specified.
		*  @param {String} [config.soundManifest.*.context] A context name to override
		*                                                   config.context with.
		*  @return {springroll.Application} The Application object for chaining
		*/
		this.addSounds = function(config)
		{
			this.sound.loadConfig(config);
			return this;
		};

		// Add the listener for the config loader to autoload the sounds
		this.once('configLoaded', function(config)
		{
			//initialize Sound and load up global sound config
			var sounds = config.sounds;
			if (sounds)
			{
				if (sounds.vo)
				{
					this.addSounds(sounds.vo);
				}
				if (sounds.sfx)
				{
					this.addSounds(sounds.sfx);
				}
				if (sounds.music)
				{
					this.addSounds(sounds.music);
				}
			}
		});
	};

	/**
	*  The sound is ready to use
	*  @event soundReady
	*/
	var SOUND_READY = 'soundReady';

	// Start the initialization of the sound
	p.ready = function(done)
	{
		Sound.init({
			swfPath : this.options.swfPath,
			types : this.options.audioTypes,
			ready : function()
			{
				if (this.destroyed) return;

				var sound = this.sound = Sound.instance;

				if (DEBUG)
				{
					// For testing, mute the game if requested
					sound.muteAll = !!this.options.mute;
				}
				// Add listeners to pause and resume the sounds
				this.on({
					paused : function()
					{
						sound.pauseAll();
					},
					resumed : function()
					{
						sound.unpauseAll();
					}
				});

				this.trigger(SOUND_READY);
				done();
			}
			.bind(this)
		});
	};

	// Destroy the animator
	p.destroy = function()
	{
		this.player.destroy();
		this.player = null;
		
		if (this.sound)
		{
			this.sound.destroy();
			this.sound = null;
		}
	};

	// register plugin
	ApplicationPlugin.register(SoundPlugin);

}());