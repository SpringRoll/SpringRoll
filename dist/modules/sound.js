/*! SpringRoll 0.2.0 */
/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	*  A private class that represents a sound context.
	*  @class SoundContext
	*  @constructor
	*  @param {String} id The name of the sound context.
	*/
	var SoundContext = function(id)
	{
		/**
		*	The name of the sound context.
		*	@property {String} id
		*	@public
		*/
		this.id = id;
		
		/**
		*	The current volume to apply to all sounds in the context (0 to 1).
		*	@property {Number} volume
		*	@public
		*/
		this.volume = 1;

		/**
		*	If all sounds in the sound context are muted or not.
		*	@property {bool} muted
		*	@public
		*/
		this.muted = false;

		/**
		*	The sound objects in this context, from Sound.instance._sounds;
		*	@property {Array} sounds
		*	@public
		*/
		this.sounds = [];
	};

	// Assign to name space
	namespace('springroll').SoundContext = SoundContext;
	
}());
/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Sound;

	/**
	 * A playing instance of a sound (or promise to play as soon as it loads). These can only
	 * be created through springroll.Sound.instance.play().
	 * @class SoundInstance
	 */
	var SoundInstance = function()
	{
		if(!Sound)
		{
			Sound = include('springroll.Sound');
		}

		/**
		* SoundJS SoundInstanceance, essentially a sound channel.
		* @property {createjs.SoundInstanceance} _channel
		* @private
		*/
		this._channel = null;

		/**
		* Internal callback function for when the sound ends.
		* @property {function} _endFunc
		* @private
		*/
		this._endFunc = null;

		/**
		* User's callback function for when the sound ends.
		* @property {function} _endCallback
		* @private
		*/
		this._endCallback = null;

		/**
		* User's callback function for when the sound starts. This is only used if the sound
		* wasn't loaded before play() was called.
		* @property {function} _startFunc
		* @private
		*/
		this._startFunc = null;

		/**
		* An array of relevant parameters passed to play(). This is only used if the sound
		* wasn't loaded before play() was called.
		* @property {Array} _startParams
		* @private
		*/
		this._startParams = null;

		/**
		* The alias for the sound that this instance was created from.
		* @property {String} alias
		* @public
		* @readOnly
		*/
		this.alias = null;

		/**
		* The current time in milliseconds for the fade that this sound instance is performing.
		* @property {Number} _fTime
		* @private
		*/
		this._fTime = 0;

		/**
		* The duration in milliseconds for the fade that this sound instance is performing.
		* @property {Number} _fDur
		* @private
		*/
		this._fDur = 0;

		/**
		* The starting volume for the fade that this sound instance is performing.
		* @property {Number} _fEnd
		* @private
		*/
		this._fStart = 0;

		/**
		* The ending volume for the fade that this sound instance is performing.
		* @property {Number} _fEnd
		* @private
		*/
		this._fEnd = 0;

		/**
		* The current sound volume (0 to 1). This is multiplied by the sound context's volume.
		* Setting this won't take effect until updateVolume() is called.
		* @property {Number} curVol
		* @protected
		* @readOnly
		*/
		this.curVol = 0;
		
		/**
		* The sound pan value, from -1 (left) to 1 (right).
		* @property {Number} _pan
		* @private
		* @readOnly
		*/
		this._pan = 0;

		/**
		* The length of the sound in milliseconds. This is 0 if it hasn't finished loading.
		* @property {Number} length
		* @public
		*/
		this.length = 0;

		/**
		* If the sound is currently paused. Setting this has no effect - use pause()
		* and unpause().
		* @property {Boolean} paused
		* @public
		* @readOnly
		*/
		this.paused = false;

		/**
		* An active SoundInstance should always be valid, but if you keep a reference after a
		* sound stops it will no longer be valid (until the SoundInstance is reused for a
		* new sound).
		* @property {Boolean} isValid
		* @public
		* @readOnly
		*/
		this.isValid = true;
	};
	
	// Reference to the prototype
	var p = SoundInstance.prototype = {};

	/**
	* The position of the sound playhead in milliseconds, or 0 if it hasn't started playing yet.
	* @property {Number} position
	* @public
	* @readOnly
	*/
	Object.defineProperty(p, "position",
	{
		get: function(){ return this._channel ? this._channel.getPosition() : 0;}
	});

	/**
	* Stops this SoundInstance.
	* @method stop
	* @public
	*/
	p.stop = function()
	{
		var s = Sound.instance;
		if (s)
		{
			var sound = s._sounds[this.alias];
			var index = sound.playing.indexOf(this);
			if(index > -1)
				sound.playing.splice(index, 1);

			index = sound.waitingToPlay.indexOf(this);
			if(index > -1)
				sound.waitingToPlay.splice(index, 1);

			s._stopInst(this);
		}
	};

	/**
	* Updates the volume of this SoundInstance.
	* @method updateVolume
	* @protected
	* @param {Number} contextVol The volume of the sound context that the sound belongs to. If
	*                            omitted, the volume is automatically collected.
	*/
	p.updateVolume = function(contextVol)
	{
		if(!this._channel) return;
		if(contextVol === undefined)
		{
			var s = Sound.instance;
			var sound = s._sounds[this.alias];
			if(sound.context)
			{
				var context = s._contexts[sound.context];
				contextVol = context.muted ? 0 : context.volume;
			}
			else
				contextVol = 1;
		}
		this._channel.setVolume(contextVol * this.curVol);
	};
	
	/**
	* The current sound volume (0 to 1). This is multiplied by the sound context's volume to
	* get the actual sound volume.
	* @property {Number} volume
	* @public
	*/
	Object.defineProperty(p, "volume", {
		get: function() { return this.curVol; },
		set: function(value)
		{
			this.curVol = value;
			this.updateVolume();
		}
	});
	
	/**
	* The sound pan value, from -1 (left) to 1 (right).
	* @property {Number} pan
	* @public
	*/
	Object.defineProperty(p, "pan", {
		get: function() { return this._pan; },
		set: function(value)
		{
			this._pan = value;
			if(this._channel)
				this._channel.pan = value;
		}
	});

	/**
	* Pauses this SoundInstance.
	* @method pause
	* @public
	*/
	p.pause = function()
	{
		if(this.paused) return;
		this.paused = true;
		if(!this._channel) return;
		this._channel.pause();
	};

	/**
	* Unpauses this SoundInstance.
	* @method unpause
	* @public
	*/
	p.unpause = function()
	{
		if(!this.paused) return;
		this.paused = false;
		if(!this._channel) return;
		this._channel.resume();
	};

	namespace('springroll').SoundInstance = SoundInstance;

}());
/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task', false);

	// Task is optional if we're using the task module
	if (!Task) return;

	/**
	 * A task for loading a list of sounds. These can only
	 * be created through Sound.instance.createPreloadTask().
	 * This class is not created if the Task library is not loaded before the Sound library.
	 * @class SoundListTask
	 * @extends {springroll.Task}
	 * @constructor
	 * @param {String} id The unique id of this task
	 * @param {Array} list The collection of sounds
	 * @param {Function} callback Completed callback function
	 */
	var SoundListTask = function(id, list, callback)
	{
		Task.call(this, id, callback);
		
		/**
		*  The collection of sounds to load
		*  @property {Array} list
		*/
		this.list = list;
	};

	// Super
	var s = Task.prototype;

	// Reference to the prototype
	var p = extend(SoundListTask, Task);

	/**
	*  Begin the task
	*  @method start
	*  @param {function} callback The function to call when we're done
	*/
	p.start = function(callback)
	{
		springroll.Sound.instance.preload(this.list, callback);
	};

	/**
	*  Destroy the task
	*  @method destroy
	*/
	p.destroy = function()
	{
		s.destroy.call(this);
		this.list = null;
	};

	// Assign to name space
	namespace('springroll').SoundListTask = SoundListTask;
	
}());
/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Application = include('springroll.Application'),
		Debug,
		Loader,
		LoadTask,
		TaskManager,
		SoundContext,
		SoundInstance,
		SoundListTask,
		WebAudioPlugin = include('createjs.WebAudioPlugin'),
		FlashAudioPlugin = include('createjs.FlashAudioPlugin', false),
		SoundJS = include('createjs.Sound'),
		Enum = include('springroll.Enum');

	/**
	*  Acts as a wrapper for SoundJS as well as adding lots of other functionality
	*  for managing sounds.
	*
	*  @class Sound
	*/
	var Sound = function()
	{
		// Import classes
		if (!Loader)
		{
			Debug = include('springroll.Debug', false);
			Loader = include('springroll.Loader');
			LoadTask = include('springroll.LoadTask', false);
			TaskManager = include('springroll.TaskManager', false);
			SoundContext = include('springroll.SoundContext');
			SoundInstance = include('springroll.SoundInstance');
			SoundListTask = include('springroll.SoundListTask', false);
		}

		/**
		*  Dictionary of sound objects, containing configuration info and playback objects.
		*  @property {Object} _sounds
		*  @private
		*/
		this._sounds = {};

		/**
		*  Array of SoundInstance objects that are being faded in or out.
		*  @property {Array} _fades
		*  @private
		*/
		this._fades = [];

		/**
		*  Array of SoundInstance objects waiting to be used.
		*  @property {Array} _pool
		*  @private
		*/
		this._pool = [];

		/**
		*  The extension of the supported sound type that will be used.
		*  @property {string} supportedSound
		*  @public
		*/
		this.supportedSound = null;

		/**
		*  Dictionary of SoundContexts.
		*  @property {Object} _contexts
		*  @private
		*/
		this._contexts = {};

		// Bindings
		this._update = this._update.bind(this);
		this._markLoaded = this._markLoaded.bind(this);
		this._playAfterLoad = this._playAfterLoad.bind(this);

		/**
		*  If sound is enabled. This will only be false if Sound was unable to initialize
		*  a SoundJS plugin.
		*  @property {Boolean} soundEnabled
		*  @readOnly
		*/
		this.soundEnabled = true;
	};

	var p = Sound.prototype = {};

	var _instance = null;
	
	//sound states
	var LoadStates = new Enum("unloaded", "loading", "loaded");

	/**
	*  Initializes the Sound singleton. If using createjs.FlashAudioPlugin, you will be responsible for
	*  setting createjs.FlashAudioPlugin.BASE_PATH.
	*  @method init
	*  @static
	*  @param {Object|Function} options Either the options object or the ready function
	*  @param {Array} [options.plugins=createjs.WebAudioPlugin,createjs.FlashAudioPlugin] The SoundJS
	*                                         plugins to pass to createjs.Sound.registerPlugins().
	*  @param {Array} [options.types=['ogg','mp3']] The order in which file types are preferred,
	*                                               where "ogg" becomes a ".ogg" extension on all
	*                                               sound file urls.
	*  @param {String} [options.swfPath='assets/swfs/'] The required path to the
	*                                                   createjs.FlashAudioPlugin SWF
	*  @param {Function} [options.ready] A function to call when initialization is complete.
	*  @return {Sound} The new instance of the sound object
	*/
	Sound.init = function(options, readyCallback)
	{
		var appOptions = Application.instance.options;
		// First argument is function
		if (typeof options == 'function')
		{
			options = { ready: options };
		}

		var _defaultOptions = {
			plugins : appOptions.forceFlashAudio ?
						[FlashAudioPlugin] : [WebAudioPlugin, FlashAudioPlugin],
			types: ['ogg', 'mp3'],
			swfPath: 'assets/swfs/',
			ready: null
		};

		options = options || {};

		//set up default options
		for (var key in _defaultOptions)
		{
			if (!options.hasOwnProperty(key))
				options[key] = _defaultOptions[key];
		}

		// Check if the ready callback is the second argument
		// this is deprecated
		options.ready = options.ready || readyCallback;

		if (!options.ready)
		{
			throw "springroll.Sound.init requires a ready callback";
		}

		if (FlashAudioPlugin)
		{
			// Apply the base path if available
			var basePath = appOptions.basePath;
			FlashAudioPlugin.swfPath = (basePath || "") + options.swfPath;
		}

		SoundJS.registerPlugins(options.plugins);

		//If on iOS, then we need to add a touch listener to unmute sounds.
		//playback pretty much has to be createjs.WebAudioPlugin for iOS
		if (createjs.BrowserDetect.isIOS &&
			SoundJS.activePlugin instanceof WebAudioPlugin)
		{
			document.addEventListener("touchstart", _playEmpty);
		}

		// New sound object
		_instance = new Sound();

		//make sure the capabilities are ready (looking at you, Cordova plugin)
		if (SoundJS.getCapabilities())
		{
			_instance._initComplete(options.types, options.ready);
		}
		else if (SoundJS.activePlugin)
		{
			if (true && Debug)
			{
				Debug.log("SoundJS Plugin " + SoundJS.activePlugin + " was not ready, waiting until it is");
			}
			//if the sound plugin is not ready, then just wait until it is
			var waitFunction;
			waitFunction = function()
			{
				if (SoundJS.getCapabilities())
				{
					Application.instance.off("update", waitFunction);
					_instance._initComplete(options.types, options.ready);
				}
			};

			Application.instance.on("update", waitFunction);
		}
		else
		{
			if (true && Debug) Debug.error("Unable to initialize SoundJS with a plugin!");
			this.soundEnabled = false;
			if (options.ready)
				options.ready();
		}
		return _instance;
	};

	/**
	*  Statisfies the iOS event needed to initialize the audio
	*  @private
	*  @method _playEmpty
	*/
	function _playEmpty()
	{
		document.removeEventListener("touchstart", _playEmpty);
		WebAudioPlugin.playEmptySound();
	}

	/**
	*  When the initialization as completed
	*  @method
	*  @private
	*  @param {Array} filetypeOrder The list of files types
	*  @param {Function} callback The callback function
	*/
	p._initComplete = function(filetypeOrder, callback)
	{
		if (FlashAudioPlugin && SoundJS.activePlugin instanceof FlashAudioPlugin)
		{
			_instance.supportedSound = ".mp3";
		}
		else
		{
			var type;
			for (var i = 0, len = filetypeOrder.length; i < len; ++i)
			{
				type = filetypeOrder[i];
				if (SoundJS.getCapability(type))
				{
					_instance.supportedSound = "." + type;
					break;
				}
			}
		}

		this.pauseAll = this.pauseAll.bind(this);
		this.unpauseAll = this.unpauseAll.bind(this);
		this.destroy = this.destroy.bind(this);

		// Add listeners to pause and resume the sounds
		Application.instance.on({
			paused : this.pauseAll,
			resumed : this.unpauseAll,
			destroy : this.destroy
		});

		if (callback)
		{
			callback();
		}
	};

	/**
	*  The singleton instance of Sound.
	*  @property {Sound} instance
	*  @public
	*  @static
	*/
	Object.defineProperty(Sound, "instance",
	{
		get: function() { return _instance; }
	});

	/**
	*  Loads a config object. This should not be called until after Sound.init() is complete.
	*  @method loadConfig
	*  @public
	*  @param {Object} config The config to load.
	*  @param {String} [config.context] The optional sound context to load sounds into unless
	*                                   otherwise specified by the individual sound. Sounds do not
	*                                   require a context.
	*  @param {String} [config.path=""] The path to prepend to all sound source urls in this config.
	*  @param {Array} config.soundManifest The list of sounds, either as String ids or Objects with
	*                                      settings.
	*  @param {Object|String} config.soundManifest.listItem Not actually a property called listItem,
	*                                                       but an entry in the array. If this is a
	*                                                       string, then it is the same as
	*                                                       {'id':'<yourString>'}.
	*  @param {String} config.soundManifest.listItem.id The id to reference the sound by.
	*  @param {String} [config.soundManifest.listItem.src] The src path to the file, without an
	*                                                      extension. If omitted, defaults to id.
	*  @param {Number} [config.soundManifest.listItem.volume=1] The default volume for the sound,
	*                                                           from 0 to 1.
	*  @param {Boolean} [config.soundManifest.listItem.loop=false] If the sound should loop by
	*                                                              default whenever the loop
	*                                                              parameter in play() is not
	*                                                              specified.
	*  @param {String} [config.soundManifest.listItem.context] A context name to override
	*                                                          config.context with.
	*  @param {Boolean} [config.soundManifest.listItem.preload] If the sound should be preloaded
	*                                                           immediately.
	*  @return {Sound} The sound object for chaining
	*/
	p.loadConfig = function(config)
	{
		if (!config)
		{
			if (true && Debug) Debug.warn("Warning - springroll.Sound was told to load a null config");
			return;
		}
		var list = config.soundManifest;
		var path = config.path || "";
		var defaultContext = config.context;

		var s;
		var temp = {};
		for (var i = 0, len = list.length; i < len; ++i)
		{
			s = list[i];
			if (typeof s == "string") {
				s = {id: s};
			}
			temp = this._sounds[s.id] = {
				id: s.id,
				src: path + (s.src ? s.src : s.id) + this.supportedSound,
				volume: s.volume ? s.volume : 1,
				loop: !!s.loop,
				loadState: LoadStates.unloaded,
				playing: [],
				waitingToPlay: [],
				context: s.context || defaultContext,
				playAfterLoad: false,
				preloadCallback: null,
				data:s,//save data for potential use by SoundJS plugins
				duration:0
			};
			if (temp.context)
			{
				if (!this._contexts[temp.context])
					this._contexts[temp.context] = new SoundContext(temp.context);
				this._contexts[temp.context].sounds.push(temp);
			}
			//preload the sound for immediate-ish use
			if(s.preload === true)
			{
				this.preloadSound(temp.id);
			}
		}
		//return the Sound instance for chaining
		return this;
	};

	/**
	*	If a sound exists in the list of recognized sounds.
	*	@method exists
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {Boolean} true if the sound exists, false otherwise.
	*/
	p.exists = function(alias)
	{
		return !!this._sounds[alias];
	};

	/**
	*	If a sound is unloaded.
	*	@method isUnloaded
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {Boolean} true if the sound is unloaded, false if it is loaded, loading or does not exist.
	*/
	p.isUnloaded = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].loadState == LoadStates.unloaded : false;
	};

	/**
	*	If a sound is loaded.
	*	@method isLoaded
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {Boolean} true if the sound is loaded, false if it is not loaded or does not exist.
	*/
	p.isLoaded = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].loadState == LoadStates.loaded : false;
	};

	/**
	*  If a sound is in the process of being loaded
	*  @method isLoading
	*  @public
	*  @param {String} alias The alias of the sound to look for.
	*  @return {Boolean} A value of true if the sound is currently loading, false if it is loaded,
	*                    unloaded, or does not exist.
	*/
	p.isLoading = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].loadState == LoadStates.loading : false;
	};

	/**
	*  If a sound is playing.
	*  @method isPlaying
	*  @public
	*  @param {String} alias The alias of the sound to look for.
	*  @return {Boolean} A value of true if the sound is currently playing or loading with an intent
	*                    to play, false if it is not playing or does not exist.
	*/
	p.isPlaying = function(alias)
	{
		var sound = this._sounds[alias];
		return sound ? sound.playing.length + sound.waitingToPlay.length > 0 : false;
	};
	
	/**
	*  Gets the duration of a sound in milliseconds, if it has been loaded.
	*  @method getDuration
	*  @public
	*  @param {String} alias The alias of the sound to look for.
	*  @return {int|null} The duration of the sound in milliseconds. If the sound has not been
	*                     loaded, 0 is returned. If no sound exists by that alias, null is returned.
	*/
	p.getDuration = function(alias)
	{
		var sound = this._sounds[alias];
		
		if(!sound) return null;
		
		if(!sound.duration)//sound hasn't been loaded yet
		{
			if(sound.loadState == LoadStates.loaded)
			{
				//play the sound once to get the duration of it
				var channel = SoundJS.play(alias, null, null, null, null, /*volume*/0);
				sound.duration = channel.getDuration();
				//stop the sound
				channel.stop();
			}
		}
		
		return sound.duration;
	};

	/**
	*  Fades a sound from 0 to a specified volume.
	*  @method fadeIn
	*  @public
	*  @param {String|SoundInstance} aliasOrInst The alias of the sound to fade the last played
	*                                            instance of, or an instance returned from play().
	*  @param {Number} [duration=500] The duration in milliseconds to fade for. The default is
	*                                 500ms.
	*  @param {Number} [targetVol] The volume to fade to. The default is the sound's default volume.
	*  @param {Number} [startVol=0] The volume to start from. The default is 0.
	*/
	p.fadeIn = function(aliasOrInst, duration, targetVol, startVol)
	{
		var sound, inst;
		if (typeof(aliasOrInst) == "string")
		{
			sound = this._sounds[aliasOrInst];
			if (!sound) return;
			if (sound.playing.length)
				inst = sound.playing[sound.playing.length - 1];//fade the last played instance
		}
		else
		{
			inst = aliasOrInst;
			sound = this._sounds[inst.alias];
		}
		if (!inst || !inst._channel) return;
		inst._fTime = 0;
		inst._fDur = duration > 0 ? duration : 500;
		var v = startVol > 0 ? startVol : 0;
		inst._channel.setVolume(v);
		inst.curVol = inst._fStart = v;
		inst._fEnd = targetVol || sound.volume;
		if (this._fades.indexOf(inst) == -1)
		{
			this._fades.push(inst);
			if (this._fades.length == 1)
			{
				Application.instance.on("update", this._update);
			}
		}
	};

	/**
	*  Fades a sound from the current volume to a specified volume. A sound that ends at 0 volume
	*  is stopped after the fade.
	*  @method fadeOut
	*  @public
	*  @param {String|SoundInstance} aliasOrInst The alias of the sound to fade the last played
	*                                            instance of, or an instance returned from play().
	*  @param {Number} [duration=500] The duration in milliseconds to fade for. The default is
	*                                 500ms.
	*  @param {Number} [targetVol=0] The volume to fade to. The default is 0.
	*  @param {Number} [startVol] The volume to fade from. The default is the current volume.
	*/
	p.fadeOut = function(aliasOrInst, duration, targetVol, startVol)
	{
		var sound, inst;
		if (typeof(aliasOrInst) == "string")
		{
			sound = this._sounds[aliasOrInst];
			if (!sound) return;
			if (sound.playing.length)
				inst = sound.playing[sound.playing.length - 1];//fade the last played instance
		}
		else
		{
			inst = aliasOrInst;
			//sound = this._sounds[inst.alias];
		}
		if (!inst || !inst._channel) return;
		inst._fTime = 0;
		inst._fDur = duration > 0 ? duration : 500;
		if (startVol > 0)
		{
			inst._channel.setVolume(startVol);
			inst._fStart = startVol;
		}
		else
			inst._fStart = inst._channel.getVolume();
		inst.curVol = inst._fStart;
		inst._fEnd = targetVol || 0;
		if (this._fades.indexOf(inst) == -1)
		{
			this._fades.push(inst);
			if (this._fades.length == 1)
			{
				Application.instance.on("update", this._update);
			}
		}
	};

	/**
	*	The update call, used for fading sounds. This is bound to the instance of Sound
	*	@method _update
	*	@private
	*	@param {int} elapsed The time elapsed since the previous frame, in milliseconds.
	*/
	p._update = function(elapsed)
	{
		var fades = this._fades;
		var trim = 0;

		var inst, time, sound,swapIndex, lerp, vol;
		for (var i = fades.length - 1; i >= 0; --i)
		{
			inst = fades[i];
			if (inst.paused) continue;
			time = inst._fTime += elapsed;
			if (time >= inst._fDur)
			{
				if (inst._fEnd === 0)
				{
					sound = this._sounds[inst.alias];
					sound.playing = sound.playing.splice(sound.playing.indexOf(inst), 1);
					this._stopInst(inst);
				}
				else
				{
					inst.curVol = inst._fEnd;
					inst.updateVolume();
				}
				++trim;
				swapIndex = fades.length - trim;
				if (i != swapIndex)//don't bother swapping if it is already last
				{
					fades[i] = fades[swapIndex];
				}
			}
			else
			{
				lerp = time / inst._fDur;
				if (inst._fEnd > inst._fStart)
					vol = inst._fStart + (inst._fEnd - inst._fStart) * lerp;
				else
					vol = inst._fEnd + (inst._fStart - inst._fEnd) * lerp;
				inst.curVol = vol;
				inst.updateVolume();
			}
		}
		fades.length = fades.length - trim;
		if (fades.length === 0)
		{
			Application.instance.off("update", this._update);
		}
	};

	/**
	*  Plays a sound.
	*  @method play
	*  @public
	*  @param {String} alias The alias of the sound to play.
	*  @param {Object|function} [options] The object of optional parameters or complete callback
	*                                     function.
	*  @param {Function} [options.complete] An optional function to call when the sound is finished.
	*  @param {Function} [options.start] An optional function to call when the sound starts
	*                                    playback. If the sound is loaded, this is called
	*                                    immediately, if not, it calls when the sound is finished
	*                                    loading.
	*  @param {Boolean} [options.interrupt=false] If the sound should interrupt previous sounds
	*                                             (SoundJS parameter). Default is false.
	*  @param {Number} [options.delay=0] The delay to play the sound at in milliseconds (SoundJS
	*                                    parameter). Default is 0.
	*  @param {Number} [options.offset=0] The offset into the sound to play in milliseconds
	*                                     (SoundJS parameter). Default is 0.
	*  @param {int} [options.loop=0] How many times the sound should loop. Use -1 (or true) for
	*                                infinite loops (SoundJS parameter). Default is no looping.
	*  @param {Number} [options.volume] The volume to play the sound at (0 to 1). Omit to use the
	*                                   default for the sound.
	*  @param {Number} [options.pan=0] The panning to start the sound at (-1 to 1). Default is
	*                                  centered (0).
	*  @return {SoundInstance} An internal SoundInstance object that can be used for fading in/out
	*                             as well as pausing and getting the sound's current position.
	*/
	p.play = function (alias, options, startCallback, interrupt, delay, offset, loop, volume, pan)
	{
		if (!this.soundEnabled) return;

		var completeCallback;
		if (options && typeof options == "function")
		{
			completeCallback = options;
			options = null;
		}
		completeCallback = (options ? options.complete : completeCallback) || null;
		startCallback = (options ? options.start : startCallback) || null;
		interrupt = !!(options ? options.interrupt : interrupt);
		delay = (options ? options.delay : delay) || 0;
		offset = (options ? options.offset : offset) || 0;
		loop = (options ? options.loop : loop);
		volume = (options ? options.volume : volume);
		pan = (options ? options.pan : pan) || 0;

		//Replace with correct infinite looping.
		if (loop === true)
			loop = -1;

		var sound = this._sounds[alias];
		if (!sound)
		{
			if (true && Debug) Debug.error("springroll.Sound: alias '" + alias + "' not found!");

			if (completeCallback)
				completeCallback();
			return;
		}
		//check for sound loop settings
		if (sound.loop && loop === undefined || loop === null)
			loop = -1;
		//check for sound volume settings
		volume = (typeof(volume) == "number") ? volume : sound.volume;
		//take action based on the sound state
		var loadState = sound.loadState;
		var inst, arr;
		if (loadState == LoadStates.loaded)
		{
			var channel = SoundJS.play(alias, interrupt, delay, offset, loop, volume, pan);
			//have Sound manage the playback of the sound

			if (!channel || channel.playState == SoundJS.PLAY_FAILED)
			{
				if (completeCallback)
					completeCallback();
				return null;
			}
			else
			{
				inst = this._getSoundInst(channel, sound.id);
				if (channel.handleExtraData)
					channel.handleExtraData(sound.data);
				inst.curVol = volume;
				inst._pan = pan;
				sound.playing.push(inst);
				inst._endCallback = completeCallback;
				inst.updateVolume();
				inst.length = channel.getDuration();
				if(!sound.duration)
					sound.duration = inst.length;
				inst._channel.addEventListener("complete", inst._endFunc);
				if (startCallback)
					setTimeout(startCallback, 0);
				return inst;
			}
		}
		else if (loadState == LoadStates.unloaded)
		{
			sound.loadState = LoadStates.loading;
			sound.playAfterLoad = true;
			inst = this._getSoundInst(null, sound.id);
			inst.curVol = volume;
			inst._pan = pan;
			sound.waitingToPlay.push(inst);
			inst._endCallback = completeCallback;
			inst._startFunc = startCallback;
			if (inst._startParams)
			{
				arr = inst._startParams;
				arr[0] = interrupt;
				arr[1] = delay;
				arr[2] = offset;
				arr[3] = loop;
			}
			else
				inst._startParams = [interrupt, delay, offset, loop];
			Loader.instance.load(
				sound.src, //url to load
				this._playAfterLoad,//complete callback
				null,//progress callback
				0,//priority
				sound//the sound object (contains properties for PreloadJS/SoundJS)
			);
			return inst;
		}
		else if (loadState == LoadStates.loading)
		{
			//tell the sound to play after loading
			sound.playAfterLoad = true;
			inst = this._getSoundInst(null, sound.id);
			inst.curVol = volume;
			inst._pan = pan;
			sound.waitingToPlay.push(inst);
			inst._endCallback = completeCallback;
			inst._startFunc = startCallback;
			if (inst._startParams)
			{
				arr = inst._startParams;
				arr[0] = interrupt;
				arr[1] = delay;
				arr[2] = offset;
				arr[3] = loop;
			}
			else
				inst._startParams = [interrupt, delay, offset, loop];
			return inst;
		}
	};

	/**
	*  Gets a SoundInstance, from the pool if available or maks a new one if not.
	*  @method _getSoundInst
	*  @private
	*  @param {createjs.SoundInstance} channel A createjs SoundInstance to initialize the object
	*                                          with.
	*  @param {String} id The alias of the sound that is going to be used.
	*  @return {SoundInstance} The SoundInstance that is ready to use.
	*/
	p._getSoundInst = function(channel, id)
	{
		var rtn;
		if (this._pool.length)
			rtn = this._pool.pop();
		else
		{
			rtn = new SoundInstance();
			rtn._endFunc = this._onSoundComplete.bind(this, rtn);
		}
		rtn._channel = channel;
		rtn.alias = id;
		rtn.length = channel ? channel.getDuration() : 0;//set or reset this
		rtn.isValid = true;
		return rtn;
	};

	/**
	*	Plays a sound after it finishes loading.
	*	@method _playAfterload
	*	@private
	*	@param {String} result The sound to play as an alias or load manifest.
	*/
	p._playAfterLoad = function(result)
	{
		var alias = typeof result == "string" ? result : result.id;
		var sound = this._sounds[alias];
		sound.loadState = LoadStates.loaded;

		//If the sound was stopped before it finished loading, then don't play anything
		if (!sound.playAfterLoad) return;

		//Go through the list of sound instances that are waiting to start and start them
		var waiting = sound.waitingToPlay;

		var inst, startParams, volume, channel, pan;
		for (var i = 0, len = waiting.length; i < len; ++i)
		{
			inst = waiting[i];
			startParams = inst._startParams;
			volume = inst.curVol;
			pan = inst._pan;
			//startParams[0] is interrupt;
			//startParams[1] is delay;
			//startParams[2] is offset;
			//startParams[3] is loop;
			channel = SoundJS.play(alias, startParams[0], startParams[1], startParams[2],
									startParams[3], volume, pan);

			if (!channel || channel.playState == SoundJS.PLAY_FAILED)
			{
				if (inst._endCallback)
					inst._endCallback();
				this._poolInst(inst);
			}
			else
			{
				sound.playing.push(inst);
				inst._channel = channel;
				if (channel.handleExtraData)
					channel.handleExtraData(sound.data);
				inst.length = channel.getDuration();
				if(!sound.duration)
					sound.duration = inst.length;
				inst.updateVolume();
				channel.addEventListener("complete", inst._endFunc);
				if (inst._startFunc)
					inst._startFunc();
				if (inst.paused)//if the sound got paused while loading, then pause it
					channel.pause();
			}
		}
		waiting.length = 0;
	};

	/**
	*	The callback used for when a sound instance is complete.
	*	@method _onSoundComplete
	*	@private
	*	@param {SoundInstance} inst The SoundInstance that is complete.s
	*/
	p._onSoundComplete = function(inst)
	{
		if (inst._channel)
		{
			inst._channel.removeEventListener("complete", inst._endFunc);
			var sound = this._sounds[inst.alias];
			var index = sound.playing.indexOf(inst);
			if (index > -1)
				sound.playing.splice(index, 1);
			var callback = inst._endCallback;
			this._poolInst(inst);
			if (callback)
				callback();
		}
	};

	/**
	*	Stops all playing or loading instances of a given sound.
	*	@method stop
	*	@public
	*	@param {String} alias The alias of the sound to stop.
	*/
	p.stop = function(alias)
	{
		var s = this._sounds[alias];
		if (!s) return;
		if (s.playing.length)
			this._stopSound(s);
		else if (s.loadState == LoadStates.loading)
		{
			s.playAfterLoad = false;
			var waiting = s.waitingToPlay;
			var inst;
			for (var i = 0, len = waiting.length; i < len; ++i)
			{
				inst = waiting[i];
				this._poolInst(inst);
			}
			waiting.length = 0;
		}
	};

	/**
	*	Stops all playing SoundInstances for a sound.
	*	@method _stopSound
	*	@private
	*	@param {Object} s The sound (from the _sounds dictionary) to stop.
	*/
	p._stopSound = function(s)
	{
		var arr = s.playing;
		for (var i = arr.length -1; i >= 0; --i)
		{
			this._stopInst(arr[i]);
		}
		arr.length = 0;
	};

	/**
	*	Stops and repools a specific SoundInstance.
	*	@method _stopInst
	*	@private
	*	@param {SoundInstance} inst The SoundInstance to stop.
	*/
	p._stopInst = function(inst)
	{
		if (inst._channel)
		{
			inst._channel.removeEventListener("complete", inst._endFunc);
			inst._channel.stop();
		}
		this._poolInst(inst);
	};

	/**
	*	Stops all sounds in a given context.
	*	@method stopContext
	*	@public
	*	@param {String} context The name of the context to stop.
	*/
	p.stopContext = function(context)
	{
		context = this._contexts[context];
		if (context)
		{
			var arr = context.sounds;
			var s;
			for (var i = arr.length - 1; i >= 0; --i)
			{
				s = arr[i];
				if (s.playing.length)
					this._stopSound(s);
				else if (s.loadState == LoadStates.loading)
					s.playAfterLoad = false;
			}
		}
	};

	/**
	 * Stop all sounds that are playing, regardless of context.
	 * @method stopAll
	 */
	p.stopAll = function()
	{
		for(var alias in this._sounds)
		{
			this.stop(alias);
		}
	};

	/**
	*	Pauses a specific sound.
	*	@method pauseSound
	*	@public
	*	@param {String} alias The alias of the sound to pause.
	*		Internally, this can also be the object from the _sounds dictionary directly.
	*/
	p.pauseSound = function(alias)
	{
		var sound;
		if (typeof alias == "string")
			sound = this._sounds[alias];
		else
			sound = alias;
		var arr = sound.playing;
		for (var i = arr.length - 1; i >= 0; --i)
			arr[i].pause();
	};

	/**
	*	Unpauses a specific sound.
	*	@method unpauseSound
	*	@public
	*	@param {String} alias The alias of the sound to pause.
	*		Internally, this can also be the object from the _sounds dictionary directly.
	*/
	p.unpauseSound = function(alias)
	{
		var sound;
		if (typeof alias == "string")
			sound = this._sounds[alias];
		else
			sound = alias;
		var arr = sound.playing;
		for (var i = arr.length - 1; i >= 0; --i)
		{
			arr[i].unpause();
		}
	};

	/**
	*	Pauses all sounds.
	*	@method pauseAll
	*	@public
	*/
	p.pauseAll = function()
	{
		var arr = this._sounds;
		for (var i in arr)
			this.pauseSound(arr[i]);
	};

	/**
	*	Unpauses all sounds.
	*	@method unpauseAll
	*	@public
	*/
	p.unpauseAll = function()
	{
		var arr = this._sounds;
		for (var i in arr)
			this.unpauseSound(arr[i]);
	};

	/**
	*	Sets mute status of all sounds in a context
	*	@method setContextMute
	*	@public
	*	@param {String} context The name of the context to modify.
	*	@param {Boolean} muted If the context should be muted.
	*/
	p.setContextMute = function(context, muted)
	{
		context = this._contexts[context];
		if (context)
		{
			context.muted = muted;
			var volume = context.volume;
			var arr = context.sounds;

			var s, playing, j;
			for (var i = arr.length - 1; i >= 0; --i)
			{
				s = arr[i];
				if (s.playing.length)
				{
					playing = s.playing;
					for (j = playing.length - 1; j >= 0; --j)
					{
						playing[j].updateVolume(muted ? 0 : volume);
					}
				}
			}
		}
	};

	/**
	*  Set the mute status of all sounds
	*  @property {Boolean} muteAll
	*/
	Object.defineProperty(p, 'muteAll', {
		set: function(muted)
		{
			SoundJS.setMute(!!muted);
		}
	});

	/**
	*	Sets volume of a context. Individual sound volumes are multiplied by this value.
	*	@method setContextVolume
	*	@public
	*	@param {String} context The name of the context to modify.
	*	@param {Number} volume The volume for the context (0 to 1).
	*/
	p.setContextVolume = function(context, volume)
	{
		context = this._contexts[context];
		if (context)
		{
			var muted = context.muted;
			context.volume = volume;
			var arr = context.sounds;
			var s, playing, j;
			for (var i = arr.length - 1; i >= 0; --i)
			{
				s = arr[i];
				if (s.playing.length)
				{
					playing = s.playing;
					for (j = playing.length - 1; j >= 0; --j)
					{
						playing[j].updateVolume(muted ? 0 : volume);
					}
				}
			}
		}
	};

	/**
	*	Preloads a specific sound.
	*	@method preloadSound
	*	@public
	*	@param {String} alias The alias of the sound to load.
	*	@param {function} callback The function to call when the sound is finished loading.
	*/
	p.preloadSound = function(alias, callback)
	{
		var sound = this._sounds[alias];
		if (!sound)
		{
			if (true && Debug) Debug.error("Sound does not exist: " + alias + " - can't preload!");
			return;
		}
		if (sound.loadState != LoadStates.unloaded) return;
		sound.loadState = LoadStates.loading;
		sound.preloadCallback = callback || null;
		Loader.instance.load(
			sound.src, //url to load
			this._markLoaded,//complete callback
			null,//progress callback
			0,//priority
			sound//the sound object (contains properties for PreloadJS/SoundJS)
		);
	};

	/**
	*	Preloads a list of sounds.
	*	@method preload
	*	@public
	*	@param {Array} list An array of sound aliases to load.
	*	@param {function} callback The function to call when all sounds have been loaded.
	*/
	p.preload = function(list, callback)
	{
		if (!LoadTask || !TaskManager)
		{
			throw "The Task Module is needed to preload audio!";
		}

		if (!list || list.length === 0)
		{
			if (callback)
				callback();
			return;
		}

		var tasks = [];
		var sound;
		for (var i = 0, len = list.length; i < len; ++i)
		{
			sound = this._sounds[list[i]];
			if (sound)
			{
				if (sound.loadState == LoadStates.unloaded)
				{
					sound.loadState = LoadStates.loading;
					//sound is passed last so that SoundJS gets the sound ID
					tasks.push(new LoadTask(sound.id, sound.src, this._markLoaded, null, 0, sound));
				}
			}
			else
			{
				if (true && Debug) Debug.error("springroll.Sound was asked to preload " + list[i] + " but it is not a registered sound!");
			}
		}
		if (tasks.length > 0)
		{
			TaskManager.process(tasks, function()
			{
				if (callback)
					callback();
			});
		}
		else if (callback)
		{
			callback();
		}
	};

	/**
	*	Marks a sound as loaded. If it needs to play after the load, then it is played.
	*	@method _markLoaded
	*	@private
	*	@param {String} alias The alias of the sound to mark.
	*	@param {function} callback A function to call to show that the sound is loaded.
	*/
	p._markLoaded = function(result)
	{
		var alias = result.id;
		var sound = this._sounds[alias];
		if (sound)
		{
			
			sound.loadState = LoadStates.loaded;
			if (sound.playAfterLoad)
				this._playAfterLoad(alias);
		}
		var callback = sound.preloadCallback;
		if (callback)
		{
			sound.preloadCallback = null;
			callback();
		}
	};

	/**
	*	Creates a Task for the springroll Task library for preloading a list of sounds.
	*	This function will not work if the Task library was not loaded before the Sound library.
	*	@method createPreloadTask
	*	@public
	*	@param {String} id The id of the task.
	*	@param {Array} list An array of sound aliases to load.
	*	@param {function} callback The function to call when the task is complete.
	*	@return {springroll.Task} A task to load up all of the sounds in the list.
	*/
	p.createPreloadTask = function(id, list, callback)
	{
		if (!SoundListTask) return null;
		return new SoundListTask(id, list, callback);
	};

	/**
	*	Unloads a list of sounds to reclaim memory if possible.
	*	If the sounds are playing, they are stopped.
	*	@method unload
	*	@public
	*	@param {Array} list An array of sound aliases to unload.
	*/
	p.unload = function(list)
	{
		if (!list) return;

		var sound;
		for (var i = 0, len = list.length; i < len; ++i)
		{
			sound = this._sounds[list[i]];
			if (sound)
			{
				this._stopSound(sound);
				sound.loadState = LoadStates.unloaded;
			}
			SoundJS.removeSound(list[i]);
		}
	};

	/**
	*	Places a SoundInstance back in the pool for reuse.
	*	@method _poolinst
	*	@private
	*	@param {SoundInstance} inst The instance to repool.
	*/
	p._poolInst = function(inst)
	{
		if (this._pool.indexOf(inst) == -1)
		{
			inst._endCallback = null;
			inst.alias = null;
			inst._channel = null;
			inst._startFunc = null;
			inst.curVol = 0;
			inst.paused = false;
			inst.isValid = false;
			this._pool.push(inst);
		}
	};

	/**
	*	Destroys springroll.Sound. This unloads loaded sounds in SoundJS.
	*	@method destroy
	*	@public
	*/
	p.destroy = function()
	{
		// Stop all sounds
		this.stopAll();

		// Remove all sounds from memeory
		SoundJS.removeAllSounds();

		// Remove the SWF from the page
		if (FlashAudioPlugin && SoundJS.activePlugin instanceof FlashAudioPlugin)
		{
			var swf = document.getElementById("SoundJSFlashContainer");
			if (swf && swf.parentNode)
			{
				swf.parentNode.removeChild(swf);
			}
		}
		if (Application.instance)
		{
			Application.instance.off('paused', this.pauseAll);
			Application.instance.off('resumed', this.unpauseAll);
			Application.instance.off('destroy', this.destroy);
		}

		_instance = null;

		this._sounds = null;
		this._volumes = null;
		this._fades = null;
		this._contexts = null;
		this._pool = null;
	};

	namespace('springroll').Sound = Sound;
}());

/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Class Imports, we'll actually include them in the constructor
	// in case these classes were included after in the load-order
	var Sound = include('springroll.Sound'),
		Captions,
		Application;

	/**
	 * A class for managing audio by only playing one at a time, playing a list, and even
	 * managing captions (Captions library) at the same time.
	 *
	 * @class VOPlayer
	 * @constructor
	 * @param {Captions} [captions=null] If a Captions object should be created for use
	 *			or the captions object to use
	 */
	var VOPlayer = function(captions)
	{
		// Import classes
		if (!Application)
		{
			Captions = include('springroll.Captions', false);
			Application = include('springroll.Application');
		}

		// Bound method calls
		this._onSoundFinished = this._onSoundFinished.bind(this);
		this._updateSilence = this._updateSilence.bind(this);
		this._updateSoloCaption = this._updateSoloCaption.bind(this);
		this._syncCaptionToSound = this._syncCaptionToSound.bind(this);
		
		this.captions = captions || null;

		/**
		*	An Array used when play() is called to avoid creating lots of Array objects.
		*	@property {Array} _listHelper
		*	@private
		*/
		this._listHelper = [];

		/**
		*	If the VOPlayer should keep a list of all audio it plays for unloading later. Default is false.
		*	@property {Boolean} trackSound
		*	@public
		*/
		this.trackSound = false;

		/**
		*	The current list of audio/silence times/functions. Generally you will not need to modify this.
		*	@property {Array} soundList
		*	@public
		*/
		this.soundList = null;

		/**
		*	The current position in soundList.
		*	@property {int} _listCounter
		*	@private
		*/
		this._listCounter = 0;

		/**
		*	The current audio alias being played.
		*	@property {String} _currentSound
		*	@private
		*/
		this._currentSound = null;

		/**
		*	The current audio instance being played.
		*	@property {SoundInstance} _soundInstance
		*	@private
		*/
		this._soundInstance = null;

		/**
		*	The callback for when the list is finished.
		*	@property {Function} _callback
		*	@private
		*/
		this._callback = null;

		/**
		*	The callback for when the list is interrupted for any reason.
		*	@property {Function} _cancelledCallback
		*	@private
		*/
		this._cancelledCallback = null;

		/**
		*	A list of audio file played by this, so that they can be unloaded later.
		*	@property {Array} _playedSound
		*	@private
		*/
		this._playedSound = null;

		/**
		*	A timer for silence entries in the list, in milliseconds.
		*	@property {int} _timer
		*	@private
		*/
		this._timer = 0;
	};

	var p = VOPlayer.prototype = {};

	/**
	*	If VOPlayer is currently playing (audio or silence).
	*	@property {Boolean} playing
	*	@public
	*	@readOnly
	*/
	Object.defineProperty(p, "playing",
	{
		get: function(){ return this._currentSound !== null || this._timer > 0; }
	});

	/**
	*	The springroll.Captions object used for captions. The developer is responsible for
	*	initializing this with a captions
	*	dictionary config file and a reference to a text field.
	*	@property {Captions} captions
	*	@public
	*/
	Object.defineProperty(p, "captions",
	{
		set: function(captions)
		{
			this._captions = captions;
			if (captions)
			{
				captions.selfUpdate = false;
			}
		},
		get: function()
		{
			return this._captions;
		}
	});
	
	/**
	 * Calculates the amount of time elapsed in the current playlist of audio/silence.
	 * @method getElapsed
	 * @return {int} The elapsed time in milliseconds.
	 */
	p.getElapsed = function()
	{
		var total = 0, item, i;
		for(i = 0; i < this._listCounter; ++i)
		{
			item = this.soundList[i];
			if(typeof item == "string")
				total += Sound.instance.getDuration(item);
			else if(typeof item == "number")
				total += item;
		}
		//get the current item
		i = this._listCounter;
		if(i < this.soundList.length)
		{
			item = this.soundList[i];
			if(typeof item == "string")
				total += this._soundInstance.position;
			else if(typeof item == "number")
				total += item - this._timer;
		}
		return total;
	};

	/**
	*	Plays a single audio alias, interrupting any current playback.
	*	Alternatively, plays a list of audio files, timers, and/or functions.
	*	Audio in the list will be preloaded to minimize pauses for loading.
	*	@method play
	*	@public
	*	@param {String|Array} idOrList The alias of the audio file to play or the array of items to play/call in order.
	*	@param {Function} [callback] The function to call when playback is complete.
	*	@param {Function} [cancelledCallback] The function to call when playback is interrupted with a stop() or play() call.
	*/
	p.play = function(idOrList, callback, cancelledCallback)
	{
		this.stop();

		this._listCounter = -1;
		if (typeof idOrList == "string")
		{
			this._listHelper[0] = idOrList;
			this.soundList = this._listHelper;
		}
		else
			this.soundList = idOrList;
		this._callback = callback;
		this._cancelledCallback = cancelledCallback;
		this._onSoundFinished();
	};

	/**
	*	Callback for when audio/timer is finished to advance to the next item in the list.
	*	@method _onSoundFinished
	*	@private
	*/
	p._onSoundFinished = function()
	{
		//remove any update callback
		Application.instance.off("update", [
			this._updateSoloCaption,
			this._syncCaptionToSound,
			this._updateSilence
		]);

		//if we have captions and an audio instance, set the caption time to the length of the audio
		if (this._captions && this._soundInstance)
		{
			this._captions.seek(this._soundInstance.length);
		}
		this._soundInstance = null;//clear the audio instance
		this._listCounter++;//advance list

		//if the list is complete
		if (this._listCounter >= this.soundList.length)
		{
			if (this._captions)
				this._captions.stop();
			this._currentSound = null;
			this._cancelledCallback = null;
			var c = this._callback;
			this._callback = null;
			if (c) c();
		}
		else
		{
			this._currentSound = this.soundList[this._listCounter];
			if (typeof this._currentSound == "string")
			{
				// If the sound doesn't exist, then we play it and let it fail,
				// an error should be shown and playback will continue
				this._playSound();
			}
			else if (typeof this._currentSound == "function")
			{
				this._currentSound();//call function
				this._onSoundFinished();//immediately continue
			}
			else
			{
				this._timer = this._currentSound;//set up a timer to wait
				this._currentSound = null;
				Application.instance.on("update", this._updateSilence);
			}
		}
	};

	/**
	*	The update callback used for silence timers.
	*	This method is bound to the VOPlayer instance.
	*	@method _updateSilence
	*	@private
	*	@param {int} elapsed The time elapsed since the previous frame, in milliseconds.
	*/
	p._updateSilence = function(elapsed)
	{
		this._timer -= elapsed;

		if (this._timer <= 0)
		{
			this._onSoundFinished();
		}
	};

	/**
	*	The update callback used for updating captions without active audio.
	*	This method is bound to the VOPlayer instance.
	*	@method _updateSoloCaption
	*	@private
	*	@param {int} elapsed The time elapsed since the previous frame, in milliseconds.
	*/
	p._updateSoloCaption = function(elapsed)
	{
		this._timer += elapsed;
		this._captions.seek(this._timer);

		if (this._timer >= this._captions.duration)
		{
			this._onSoundFinished();
		}
	};

	/**
	*	The update callback used for updating captions with active audio.
	*	This method is bound to the VOPlayer instance.
	*	@method _syncCaptionToSound
	*	@private
	*	@param {int} elapsed The time elapsed since the previous frame, in milliseconds.
	*/
	p._syncCaptionToSound = function(elapsed)
	{
		if (!this._soundInstance) return;

		this._captions.seek(this._soundInstance.position);
	};

	/**
	*	Plays the current audio item and begins preloading the next item.
	*	@method _playSound
	*	@private
	*/
	p._playSound = function()
	{
		if (this.trackSound)
		{
			if (this._playedSound)
			{
				if (this._playedSound.indexOf(this._currentSound) == -1)
					this._playedSound.push(this._currentSound);
			}
			else
			{
				this._playedSound = [this._currentSound];
			}
		}
		var s = Sound.instance;
		if (!s.exists(this._currentSound) && this._captions && this._captions.hasCaption(this._currentSound))
		{
			this._captions.play(this._currentSound);
			this._timer = 0;
			this._currentSound = null;
			Application.instance.on("update", this._updateSoloCaption);
		}
		else
		{
			this._soundInstance = s.play(this._currentSound, this._onSoundFinished);
			if (this._captions)
			{
				this._captions.play(this._currentSound);
				Application.instance.on("update", this._syncCaptionToSound);
			}
		}
		var len = this.soundList.length;
		var next;
		for (var i = this._listCounter + 1; i < len; ++i)
		{
			next = this.soundList[i];
			if (typeof next == "string")
			{
				if (!s.isLoaded(next))
				{
					s.preloadSound(next);
				}
				break;
			}
		}
	};

	/**
	*	Stops playback of any audio/timer.
	*	@method stop
	*	@public
	*/
	p.stop = function()
	{
		if (this._currentSound)
		{
			Sound.instance.stop(this._currentSound);
			this._currentSound = null;
		}
		if (this._captions)
		{
			this._captions.stop();
		}
		Application.instance.off('update', [
			this._updateSoloCaption,
			this._syncCaptionToSound,
			this._updateSilence
		]);
		this.soundList = null;
		this._timer = 0;
		this._callback = null;
		var c = this._cancelledCallback;
		this._cancelledCallback = null;
		if (c) c();
	};

	/**
	*	Unloads all audio this VOPlayer has played. If trackSound is false, this won't do anything.
	*	@method unloadSound
	*	@public
	*/
	p.unloadSound = function()
	{
		Sound.instance.unload(this._playedSound);
		this._playedSound = null;
	};

	/**
	*	Cleans up this VOPlayer.
	*	@method destroy
	*	@public
	*/
	p.destroy = function()
	{
		this.stop();
		this.soundList = null;
		this._listHelper = null;
		this._currentSound = null;
		this._soundInstance = null;
		this._callback = null;
		this._cancelledCallback = null;
		this._playedSound = null;

		if (this._captions)
		{
			this._captions.destroy();
			this._captions = null;
		}
	};

	namespace('springroll').VOPlayer = VOPlayer;
	namespace('springroll').Sound.VOPlayer = VOPlayer;

}());
