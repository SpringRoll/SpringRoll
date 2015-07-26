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
	 */
	var VOPlayer = function()
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

		/**
		 *	The captions object
		 *	@property {springroll.Captions} _captions
		 *	@private
		 */
		this._captions = null;
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
	 *	@param {String|Array} idOrList The alias of the audio file to play or the array of items to
	 *	                               play/call in order.
	 *	@param {Function} [callback] The function to call when playback is complete.
	 *	@param {Function} [cancelledCallback] The function to call when playback is interrupted with
	 *	                                      a stop() or play() call. If this value is a boolean
	 *	                                      <code>true</code> then callback will be used instead.
	 */
	p.play = function(idOrList, callback, cancelledCallback)
	{
		this.stop();

		this._listCounter = -1;
		if (typeof idOrList == "string")
		{
			this._listHelper.length = 0;
			this._listHelper[0] = idOrList;
			this.soundList = this._listHelper;
		}
		else
			this.soundList = idOrList;
		this._callback = callback;
		this._cancelledCallback = cancelledCallback === true ? callback : cancelledCallback;
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
					s.preload(next);
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
		this._captions = null;
	};

	namespace('springroll').VOPlayer = VOPlayer;
	namespace('springroll').Sound.VOPlayer = VOPlayer;

}());
