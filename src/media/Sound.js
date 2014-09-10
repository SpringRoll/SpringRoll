/**
*  @module cloudkid
*/
(function() {

	"use strict";

	var Application = cloudkid.Application,
		MediaLoader = cloudkid.MediaLoader,
		LoadTask = cloudkid.LoadTask,
		Task = cloudkid.Task,
		TaskManager = cloudkid.TaskManager;

	/**
	*  Acts as a wrapper for SoundJS as well as adding lots of other functionality
	*  for managing sounds.
	*
	*  @class Sound
	*/
	var Sound = function()
	{
		this._sounds = {};
		this._fades = [];
		this._contexts = {};
		this._pool = [];
		this._update = this._update.bind(this);
		this._markLoaded = this._markLoaded.bind(this);
		/** 
		*  A copy of _playAfterLoad bound to this Sound instance.
		*  @property {function} _playAfterLoadBound
		*  @private
		*/
		this._playAfterLoadBound = this._playAfterLoad.bind(this);
	};
	
	var p = Sound.prototype = {};
	
	var _instance = null;
	
	/** 
	*  Dictionary of sound objects, containing configuration info and playback objects.
	*  @property {Object} _sounds
	*  @private
	*/
	p._sounds = null;
	/** 
	
	*  Array of SoundInst objects that are being faded in or out.
	*  @property {Array} _fades
	*  @private
	*/
	p._fades = null;

	/**
	*  Array of SoundInst objects waiting to be used.
	*  @property {Array} _pool
	*  @private
	*/
	p._pool = null;

	/**
	*  The extension of the supported sound type that will be used.
	*  @property {string} supportedSound
	*  @public
	*/
	p.supportedSound = null;

	/**
	*  Dictionary of SoundContexts.
	*  @property {Object} _contexts
	*  @private
	*/
	p._contexts = null;

	//sound states
	var UNLOADED = 0;
	var LOADING = 1;
	var LOADED = 2;

	var UPDATE_ALIAS = "CKSOUND";

	/**
	*  A constant for telling Sound not to handle a sound with play(), but to
	*  return what SoundJS returns directly.
	*  @property {String} UNHANDLED
	*  @public
	*  @static
	*/
	Sound.UNHANDLED = "unhandled";
	
	/**
	*	Initializes the Sound singleton. If using createjs.FlashPlugin, you will be responsible for setting
	*	createjs.FlashPlugin.BASE_PATH.
	*	@method init
	*	@static
	*	@param {Array} pluginOrder The SoundJS plugins to pass to createjs.Sound.registerPlugins().
	*	@param {Array} filetypeOrder The order in which file types are preferred, where "ogg" becomes a ".ogg"
	*					extension on all sound file urls.
	*	@param {Function} completeCallback A function to call when initialization is complete.
	*/
	Sound.init = function(pluginOrder, filetypeOrder, completeCallback)
	{
		createjs.Sound.registerPlugins(pluginOrder);

		//If on iOS, then we need to add a touch listener to unmute sounds.
		//playback pretty much has to be createjs.WebAudioPlugin for iOS
		if(createjs.Sound.BrowserDetect.isIOS)
		{
			document.addEventListener("touchstart", _playEmpty);
		}

		_instance = new Sound();
		
		//make sure the capabilities are ready (looking at you, Cordova plugin)
		if(createjs.Sound.getCapabilities())
		{
			_instance._initComplete(filetypeOrder, completeCallback);
		}
		else if(createjs.Sound.activePlugin)
		{
			if(DEBUG)
			{
				Debug.log("SoundJS Plugin " + createjs.Sound.activePlugin + " was not ready, waiting until it is");
			}
			//if the sound plugin is not ready, then just wait until it is
			var waitFunction;
			waitFunction = function()
				{
					if(createjs.Sound.getCapabilities())
					{
						cloudkid.Application.instance.off("update", waitFunction);
						_instance._initComplete(filetypeOrder, completeCallback);
					}
				};
			cloudkid.Application.instance.on("update", waitFunction);
		}
		else
			Debug.error("Unable to initialize SoundJS with a plugin!");

		return _instance;
	};

	function _playEmpty()
	{
		document.removeEventListener("touchstart", _playEmpty);
		createjs.WebAudioPlugin.playEmptySound();
	}

	p._initComplete = function(filetypeOrder, callback)
	{
		if(createjs.FlashPlugin && createjs.Sound.activePlugin instanceof createjs.FlashPlugin)
			_instance.supportedSound = ".mp3";
		else
		{
			for(var i = 0; i < filetypeOrder.length; ++i)
			{
				var type = filetypeOrder[i];
				if(createjs.Sound.getCapability(type))
				{
					_instance.supportedSound = "." + type;
					break;
				}
			}
		}
		if(callback)
			callback();
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
	*	Loads a config object. This should not be called until after Sound.init() is complete.
	*	@method loadConfig
	*	@public
	*	@param {Object} config The config to load.
	*	@param {String} defaultContext The optional sound context to load sounds into unless 
	*		otherwise specified. Sounds do not require a context.
	*/
	p.loadConfig = function(config, defaultContext)
	{
		if(!config)
		{
			Debug.warn("Warning - cloudkid.Sound was told to load a null config");
			return;
		}
		var list = config.soundManifest;
		var path = config.path;
		defaultContext = defaultContext || config.context;
		for(var i = 0, len = list.length; i < len; ++i)
		{
			var s = list[i];
			if (typeof s == "string") {
				s = {id: s};
			}
			var temp = this._sounds[s.id] = {
				id: s.id,
				src: path + (s.src ? s.src : s.id) + this.supportedSound,
				volume: s.volume ? s.volume : 1,
				state: UNLOADED,
				playing: [],
				waitingToPlay: [],
				context: s.context || defaultContext,
				playAfterLoad: false,
				preloadCallback: null,
				data:s//save data for potential use by SoundJS plugins
			};
			if(temp.context)
			{
				if(!this._contexts[temp.context])
					this._contexts[temp.context] = new SoundContext(temp.context);
				this._contexts[temp.context].sounds.push(temp);
			}
		}
	};

	/**
	*	If a sound exists in the list of recognized sounds.
	*	@method exists
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {bool} true if the sound exists, false otherwise.
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
	*	@return {bool} true if the sound is unloaded, false if it is loaded, loading or does not exist.
	*/
	p.isUnloaded = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].state == UNLOADED : false;
	};

	/**
	*	If a sound is loaded.
	*	@method isLoaded
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {bool} true if the sound is loaded, false if it is not loaded or does not exist.
	*/
	p.isLoaded = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].state == LOADED : false;
	};

	/**
	*	If a sound is in the process of being loaded
	*	@method isLoading
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {bool} true if the sound is currently loading, false if it is loaded, unloaded, or does not exist.
	*/
	p.isLoading = function(alias)
	{
		return this._sounds[alias] ? this._sounds[alias].state == LOADING : false;
	};

	/**
	*	If a sound is playing.
	*	@method isPlaying
	*	@public
	*	@param {String} alias The alias of the sound to look for.
	*	@return {bool} true if the sound is currently playing or loading with an intent to play, false if it is not playing or does not exist.
	*/
	p.isPlaying = function(alias)
	{
		var sound = this._sounds[alias];
		return sound ? sound.playing.length + sound.waitingToPlay.length > 0 : false;
	};

	/**
	*	Fades a sound from 0 to a specified volume.
	*	@method fadeIn
	*	@public
	*	@param {String|SoundInst} aliasOrInst The alias of the sound to fade the last played instance of, or an instance returned from play().
	*	@param {Number} duration The duration in milliseconds to fade for. The default is 500ms.
	*	@param {Number} targetVol The volume to fade to. The default is the sound's default volume.
	*	@param {Number} startVol The volume to start from. The default is 0.
	*/
	p.fadeIn = function(aliasOrInst, duration, targetVol, startVol)
	{
		var sound, inst;
		if(typeof(aliasOrInst) == "string")
		{
			sound = this._sounds[aliasOrInst];
			if(!sound) return;
			if(sound.playing.length)
				inst = sound.playing[sound.playing.length - 1];//fade the last played instance
		}
		else
		{
			inst = aliasOrInst;
			sound = this._sounds[inst.alias];
		}
		if(!inst || !inst._channel) return;
		inst._fTime = 0;
		inst._fDur = duration > 0 ? duration : 500;
		var v = startVol > 0 ? startVol : 0;
		inst._channel.setVolume(v);
		inst.curVol = inst._fStart = v;
		inst._fEnd = targetVol || sound.volume;
		if(this._fades.indexOf(inst) == -1)
		{
			this._fades.push(inst);
			if(this._fades.length == 1)
				Application.instance.on("update", this._update);
		}
	};

	/**
	*	Fades a sound from the current volume to a specified volume. A sound that ends at 0 volume
	*	is stopped after the fade.
	*	@method fadeOut
	*	@public
	*	@param {String|SoundInst} aliasOrInst The alias of the sound to fade the last played instance of, or an instance returned from play().
	*	@param {Number} duration The duration in milliseconds to fade for. The default is 500ms.
	*	@param {Number} targetVol The volume to fade to. The default is 0.
	*	@param {Number} startVol The volume to fade from. The default is the current volume.
	*/
	p.fadeOut = function(aliasOrInst, duration, targetVol, startVol)
	{
		var sound, inst;
		if(typeof(aliasOrInst) == "string")
		{
			sound = this._sounds[aliasOrInst];
			if(!sound) return;
			if(sound.playing.length)
				inst = sound.playing[sound.playing.length - 1];//fade the last played instance
		}
		else
		{
			inst = aliasOrInst;
			//sound = this._sounds[inst.alias];
		}
		if(!inst || !inst._channel) return;
		inst._fTime = 0;
		inst._fDur = duration > 0 ? duration : 500;
		if(startVol > 0)
		{
			inst._channel.setVolume(startVol);
			inst._fStart = startVol;
		}
		else
			inst._fStart = inst._channel.getVolume();
		inst.curVol = inst._fStart;
		inst._fEnd = targetVol || 0;
		if(this._fades.indexOf(inst) == -1)
		{
			this._fades.push(inst);
			if(this._fades.length == 1)
				Application.instance.on("update", this._update);
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
		for(var i = fades.length - 1; i >= 0; --i)
		{
			var inst = fades[i];
			if(inst.paused) continue;
			var time = inst._fTime += elapsed;
			if(time >= inst._fDur)
			{
				if(inst._fEnd === 0)
				{
					var sound = this._sounds[inst.alias];
					sound.playing = sound.playing.splice(sound.playing.indexOf(inst), 1);
					this._stopInst(inst);
				}
				else
				{
					inst.curVol = inst._fEnd;
					inst.updateVolume();
				}
				++trim;
				var swapIndex = fades.length - trim;
				if(i != swapIndex)//don't bother swapping if it is already last
				{
					fades[i] = fades[swapIndex];
				}
			}
			else
			{
				var lerp = time / inst._fDur;
				var vol;
				if(inst._fEnd > inst._fStart)
					vol = inst._fStart + (inst._fEnd - inst._fStart) * lerp;
				else
					vol = inst._fEnd + (inst._fStart - inst._fEnd) * lerp;
				inst.curVol = vol;
				inst.updateVolume();
			}
		}
		fades.length = fades.length - trim;
		if(fades.length === 0)
			Application.instance.off("update", this._update);
	};
	
	/**
	*	Plays a sound.
	*	@method play
	*	@public
	*	@param {String} alias The alias of the sound to play.
	*	@param {function} completeCallback An optional function to call when the sound is finished. 
			Passing cloudkid.Sound.UNHANDLED results in cloudkid.Sound not handling the sound 
			and merely returning what SoundJS returns from its play() call.
	*	@param {function} startCallback An optional function to call when the sound starts playback.
			If the sound is loaded, this is called immediately, if not, it calls when the 
			sound is finished loading.
	*	@param {bool} interrupt If the sound should interrupt previous sounds (SoundJS parameter). Default is false.
	*	@param {Number} delay The delay to play the sound at in milliseconds(SoundJS parameter). Default is 0.
	*	@param {Number} offset The offset into the sound to play in milliseconds(SoundJS parameter). Default is 0.
	*	@param {int} loop How many times the sound should loop. Use -1 (or true) for infinite loops (SoundJS parameter).
			Default is no looping.
	*	@param {Number} volume The volume to play the sound at (0 to 1). Omit to use the default for the sound.
	*	@param {Number} pan The panning to start the sound at (-1 to 1). Default is centered (0).
	*	@return {SoundInst} An internal SoundInst object that can be used for fading in/out as well as 
			pausing and getting the sound's current position.
	*/
	p.play = function (alias, completeCallback, startCallback, interrupt, delay, offset, loop, volume, pan)
	{
		if(loop === true)//Replace with correct infinite looping.
			loop = -1;
		//UNHANDLED is really for legacy code, like the StateManager and Cutscene libraries that are using the sound instance directly to synch animations
		if(completeCallback == Sound.UNHANDLED)//let calling code manage the SoundInstance - this is only allowed if the sound is already loaded
		{
			return createjs.Sound.play(alias, interrupt, delay, offset, loop, volume, pan);
		}

		var sound = this._sounds[alias];
		if(!sound)
		{
			Debug.error("cloudkid.Sound: sound " + alias + " not found!");
			if(completeCallback)
				completeCallback();
			return;
		}
		var state = sound.state;
		var inst, arr;
		volume = (typeof(volume) == "number" && volume > 0) ? volume : sound.volume;
		if(state == LOADED)
		{
			var channel = createjs.Sound.play(alias, interrupt, delay, offset, loop, volume, pan);
			//have Sound manage the playback of the sound
			
			if(!channel || channel.playState == createjs.Sound.PLAY_FAILED)
			{
				if(completeCallback)
					completeCallback();
				return null;
			}
			else
			{
				inst = this._getSoundInst(channel, sound.id);
				if(channel.handleExtraData)
					channel.handleExtraData(sound.data);
				inst.curVol = volume;
				sound.playing.push(inst);
				inst._endCallback = completeCallback;
				inst.updateVolume();
				inst.length = channel.getDuration();
				inst._channel.addEventListener("complete", inst._endFunc);
				if(startCallback)
					setTimeout(startCallback, 0);
				return inst;
			}
		}
		else if(state == UNLOADED)
		{
			sound.state = LOADING;
			sound.playAfterLoad = true;
			inst = this._getSoundInst(null, sound.id);
			inst.curVol = volume;
			sound.waitingToPlay.push(inst);
			inst._endCallback = completeCallback;
			inst._startFunc = startCallback;
			if(inst._startParams)
			{
				arr = inst._startParams;
				arr[0] = interrupt;
				arr[1] = delay;
				arr[2] = offset;
				arr[3] = loop;
				arr[4] = pan;
			}
			else
				inst._startParams = [interrupt, delay, offset, loop, pan];
			MediaLoader.instance.load(
				sound.src, //url to load
				this._playAfterLoadBound,//complete callback
				null,//progress callback
				0,//priority
				sound//the sound object (contains properties for PreloadJS/SoundJS)
			);
			return inst;
		}
		else if(state == LOADING)
		{
			//tell the sound to play after loading
			sound.playAfterLoad = true;
			inst = this._getSoundInst(null, sound.id);
			inst.curVol = volume;
			sound.waitingToPlay.push(inst);
			inst._endCallback = completeCallback;
			inst._startFunc = startCallback;
			if(inst._startParams)
			{
				arr = inst._startParams;
				arr[0] = interrupt;
				arr[1] = delay;
				arr[2] = offset;
				arr[3] = loop;
				arr[4] = pan;
			}
			else
				inst._startParams = [interrupt, delay, offset, loop, pan];
			return inst;
		}
	};

	/**
	*	Gets a SoundInst, from the pool if available or maks a new one if not.
	*	@method _getSoundInst
	*	@private
	*	@param {createjs.SoundInstance} channel A createjs SoundInstance to initialize the object with.
	*	@param {String} id The alias of the sound that is going to be used.
	*	@return {SoundInst} The SoundInst that is ready to use.
	*/
	p._getSoundInst = function(channel, id)
	{
		var rtn;
		if(this._pool.length)
			rtn = this._pool.pop();
		else
		{
			rtn = new SoundInst();
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
	*	@param {String} alias The sound to play.
	*/
	p._playAfterLoad = function(result)
	{
		var alias = typeof result == "string" ? result : result.id;
		var sound = this._sounds[alias];
		sound.state = LOADED;
		
		//If the sound was stopped before it finished loading, then don't play anything
		if(!sound.playAfterLoad) return;
		
		//Go through the list of sound instances that are waiting to start and start them
		var waiting = sound.waitingToPlay;
		for(var i = 0; i < waiting.length; ++i)
		{
			var inst = waiting[i];
			var startParams = inst._startParams;
			var volume = inst.curVol;
			var channel = createjs.Sound.play(alias, startParams[0], startParams[1], startParams[2], startParams[3], volume, startParams[4]);

			if(!channel || channel.playState == createjs.Sound.PLAY_FAILED)
			{
				if(inst._endCallback)
					inst._endCallback();
				this._poolInst(inst);
			}
			else
			{
				sound.playing.push(inst);
				inst._channel = channel;
				if(channel.handleExtraData)
					channel.handleExtraData(sound.data);
				inst.length = channel.getDuration();
				inst.updateVolume();
				channel.addEventListener("complete", inst._endFunc);
				if(inst._startFunc)
					inst._startFunc();
				if(inst.paused)//if the sound got paused while loading, then pause it
					channel.pause();
			}
		}
		waiting.length = 0;
	};
	
	/**
	*	The callback used for when a sound instance is complete.
	*	@method _onSoundComplete
	*	@private
	*	@param {SoundInst} inst The SoundInst that is complete.s
	*/
	p._onSoundComplete = function(inst)
	{
		inst._channel.removeEventListener("complete", inst._endFunc);
		var sound = this._sounds[inst.alias];
		sound.playing.splice(sound.playing.indexOf(inst), 1);
		var callback = inst._endCallback;
		this._poolInst(inst);
		if(callback)
			callback();
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
		if(!s) return;
		if(s.playing.length)
			this._stopSound(s);
		else if(s.state == LOADING)
		{
			s.playAfterLoad = false;
			var waiting = s.waitingToPlay;
			for(var i = 0; i < waiting.length; ++i)
			{
				var inst = waiting[i];
				/*if(inst._endCallback)
					inst._endCallback();*/
				this._poolInst(inst);
			}
			waiting.length = 0;
		}
	};
	
	/**
	*	Stops all playing SoundInsts for a sound.
	*	@method _stopSound
	*	@private
	*	@param {Object} s The sound (from the _sounds dictionary) to stop.
	*/
	p._stopSound = function(s)
	{
		var arr = s.playing;
		for(var i = arr.length -1; i >= 0; --i)
		{
			this._stopInst(arr[i]);
		}
		arr.length = 0;
	};
	
	/**
	*	Stops and repools a specific SoundInst.
	*	@method _stopInst
	*	@private
	*	@param {SoundInst} inst The SoundInst to stop.
	*/
	p._stopInst = function(inst)
	{
		inst._channel.removeEventListener("complete", inst._endFunc);
		inst._channel.stop();
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
		if(context)
		{
			var arr = context.sounds;
			for(var i = arr.length - 1; i >= 0; --i)
			{
				var s = arr[i];
				if(s.playing.length)
					this._stopSound(s);
				else if(s.state == LOADING)
					s.playAfterLoad = false;
			}
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
		if(typeof alias == "string")
			sound = this._sounds[alias];
		else
			sound = alias;
		var arr = sound.playing;
		for(var i = arr.length - 1; i >= 0; --i)
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
		if(typeof alias == "string")
			sound = this._sounds[alias];
		else
			sound = alias;
		var arr = sound.playing;
		for(var i = arr.length - 1; i >= 0; --i)
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
		for(var i in arr)
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
		for(var i in arr)
			this.unpauseSound(arr[i]);
	};

	/**
	*	Sets mute status of all sounds in a context
	*	@method setContextMute
	*	@public
	*	@param {String} context The name of the context to modify.
	*	@param {bool} muted If the context should be muted.
	*/
	p.setContextMute = function(context, muted)
	{
		context = this._contexts[context];
		if(context)
		{
			context.muted = muted;
			var volume = context.volume;
			var arr = context.sounds;
			for(var i = arr.length - 1; i >= 0; --i)
			{
				var s = arr[i];
				if(s.playing.length)
				{
					var playing = s.playing;
					for(var j = playing.length - 1; j >= 0; --j)
					{
						playing[j].updateVolume(muted ? 0 : volume);
					}
				}
			}
		}
	};

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
		if(context)
		{
			var muted = context.muted;
			context.volume = volume;
			var arr = context.sounds;
			for(var i = arr.length - 1; i >= 0; --i)
			{
				var s = arr[i];
				if(s.playing.length)
				{
					var playing = s.playing;
					for(var j = playing.length - 1; j >= 0; --j)
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
		if(!sound)
		{
			Debug.error("Sound does not exist: " + alias + " - can't preload!");
			return;
		}
		if(sound.state != UNLOADED) return;
		sound.state = LOADING;
		sound.preloadCallback = callback || null;
		MediaLoader.instance.load(
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
		if(!list || list.length === 0)
		{
			if(callback)
				callback();
			return;
		}

		var tasks = [];
		for(var i = 0, len = list.length; i < len; ++i)
		{
			var sound = this._sounds[list[i]];
			if(sound)
			{
				if(sound.state == UNLOADED)
				{
					sound.state = LOADING;
					//sound is passed last so that SoundJS gets the sound ID
					tasks.push(new LoadTask(sound.id, sound.src, this._markLoaded, null, 0, sound));
				}
			}
			else
			{
				Debug.error("cloudkid.Sound was asked to preload " + list[i] + " but it is not a registered sound!");
			}
		}
		if(tasks.length > 0)
		{
			TaskManager.process(tasks, function()
			{
				if(callback)
					callback();
			});
		}
		else if(callback)
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
		if(sound)
		{
			sound.state = LOADED;
			if(sound.playAfterLoad)
				this._playAfterLoad(alias);
		}
		var callback = sound.preloadCallback;
		if(callback)
		{
			sound.preloadCallback = null;
			callback();
		}
	};
	
	/**
	*	Creates a Task for the CloudKid Task library for preloading a list of sounds.
	*	This function will not work if the Task library was not loaded before the Sound library.
	*	@method createPreloadTask
	*	@public
	*	@param {String} id The id of the task.
	*	@param {Array} list An array of sound aliases to load.
	*	@param {function} callback The function to call when the task is complete.
	*	@return {cloudkid.Task} A task to load up all of the sounds in the list.
	*/
	p.createPreloadTask = function(id, list, callback)
	{
		if(!SoundListTask) return null;
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
		if(!list) return;
		
		for(var i = 0, len = list.length; i < len; ++i)
		{
			var sound = this._sounds[list[i]];
			if(sound)
			{
				this._stopSound(sound);
				sound.state = UNLOADED;
			}
			createjs.Sound.removeSound(list[i]);
		}
	};

	/**
	*	Places a SoundInst back in the pool for reuse.
	*	@method _poolinst
	*	@private
	*	@param {SoundInst} inst The instance to repool.
	*/
	p._poolInst = function(inst)
	{
		inst._endCallback = null;
		inst.alias = null;
		inst._channel = null;
		inst._startFunc = null;
		inst.curVol = 0;
		inst.paused = false;
		inst.isValid = false;
		this._pool.push(inst);
	};
	
	/**
	*	Destroys cloudkid.Sound. This does not unload loaded sounds, destroy SoundJS to do that.
	*	@method destroy
	*	@public
	*/
	p.destroy = function()
	{
		_instance = null;
		this._volumes = null;
		this._fades = null;
		this._contexts = null;
		this._pool = null;
	};
	
	/**
	*  A playing instance of a sound (or promise to play as soon as it loads). These can only
	*  be created through cloudkid.Sound.instance.play().
	*  @class SoundInst
	*/
	var SoundInst = function()
	{
		/**
		*	SoundJS SoundInstance, essentially a sound channel.
		*	@property {createjs.SoundInstance} _channel
		*	@private
		*/
		this._channel = null;
		/**
		*	Internal callback function for when the sound ends.
		*	@property {function} _endFunc
		*	@private
		*/
		this._endFunc = null;
		/**
		*	User's callback function for when the sound ends.
		*	@property {function} _endCallback
		*	@private
		*/
		this._endCallback = null;
		/**
		*	User's callback function for when the sound starts. This is only used if the sound wasn't loaded before play() was called.
		*	@property {function} _startFunc
		*	@private
		*/
		this._startFunc = null;
		/**
		*	An array of relevant parameters passed to play(). This is only used if the sound wasn't loaded before play() was called.
		*	@property {Array} _startParams
		*	@private
		*/
		this._startParams = null;
		/**
		*	The alias for the sound that this instance was created from.
		*	@property {String} alias
		*	@public
		*	@readOnly
		*/
		this.alias = null;
		/**
		*	The current time in milliseconds for the fade that this sound instance is performing.
		*	@property {Number} _fTime
		*	@private
		*/
		this._fTime = 0;
		/**
		*	The duration in milliseconds for the fade that this sound instance is performing.
		*	@property {Number} _fDur
		*	@private
		*/
		this._fDur = 0;
		/**
		*	The starting volume for the fade that this sound instance is performing.
		*	@property {Number} _fEnd
		*	@private
		*/
		this._fStart = 0;
		/**
		*	The ending volume for the fade that this sound instance is performing.
		*	@property {Number} _fEnd
		*	@private
		*/
		this._fEnd = 0;
		/**
		*	The current sound volume (0 to 1). This is multiplied by the sound context's volume.
		*	Setting this won't take effect until updateVolume() is called.
		*	@property {Number} curVol
		*	@public
		*/
		this.curVol = 0;
		/**
		*	The length of the sound in milliseconds. This is 0 if it hasn't finished loading.
		*	@property {Number} length
		*	@public
		*/
		this.length = 0;
		/**
		*	If the sound is currently paused. Setting this has no effect - use pause() and unpause().
		*	@property {bool} paused
		*	@public
		*	@readOnly
		*/
		this.paused = false;
		/**
		*	An active SoundInst should always be valid. This is primarily for compatability with cloudkid.Audio.
		*	@property {bool} isValid
		*	@public
		*	@readOnly
		*/
		this.isValid = true;
	};
	
	/**
	*	The position of the sound playhead in milliseconds, or 0 if it hasn't started playing yet.
	*	@property {Number} position
	*	@public
	*/
	Object.defineProperty(SoundInst.prototype, "position", 
	{
		get: function(){ return this._channel ? this._channel.getPosition() : 0;}
	});

	/**
	*	Stops this SoundInst.
	*	@method stop
	*	@public
	*/
	SoundInst.prototype.stop = function()
	{
		var s = Sound.instance;
		var sound = s._sounds[this.alias];
		sound.playing.splice(sound.playing.indexOf(this), 1);
		Sound.instance._stopInst(this);
	};

	/**
	*	Updates the volume of this SoundInst.
	*	@method updateVolume
	*	@public
	*	@param {Number} contextVol The volume of the sound context that the sound belongs to. If omitted, the volume is automatically collected.
	*/
	SoundInst.prototype.updateVolume = function(contextVol)
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
	*	Pauses this SoundInst.
	*	@method pause
	*	@public
	*/
	SoundInst.prototype.pause = function()
	{
		if(this.paused) return;
		this.paused = true;
		if(!this._channel) return;
		this._channel.pause();
	};

	/**
	*	Unpauses this SoundInst.
	*	@method unpause
	*	@public
	*/
	SoundInst.prototype.unpause = function()
	{
		if(!this.paused) return;
		this.paused = false;
		if(!this._channel) return;
		this._channel.resume();
	};

	//As use of the Task library isn't required, creating this class is optional
	var SoundListTask;
	if(Task)
	{
		/**
		*  A task for loading a list of sounds. These can only
		*  be created through Sound.instance.createPreloadTask().
		*  This class is not created if the Task library is not loaded before the Sound library.
		*  @class SoundListTask
		*  @extends {cloudkid.Task}
		*/
		SoundListTask = function(id, list, callback)
		{
			this.initialize(id, callback);
			
			this.list = list;
		};

		SoundListTask.prototype = Object.create(Task.prototype);
		SoundListTask.s = Task.prototype;

		SoundListTask.prototype.start = function(callback)
		{
			_instance.preload(this.list, callback);
		};

		SoundListTask.prototype.destroy = function()
		{
			SoundListTask.s.destroy.apply(this);
			this.list = null;
		};
	}

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

	SoundContext.prototype = {};
	
	namespace('cloudkid').Sound = Sound;
}());