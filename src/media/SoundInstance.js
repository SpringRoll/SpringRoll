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
		if (!Sound)
		{
			Sound = include('springroll.Sound');
		}

		/**
		 * SoundJS SoundInstance, essentially a sound channel.
		 * @property {createjs.SoundInstance} _channel
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
		 * User's callback function for when the sound starts.
		 * This is only used if the sound wasn't loaded before play() was called.
		 * @property {function} _startFunc
		 * @private
		 */
		this._startFunc = null;

		/**
		 * An array of relevant parameters passed to play(). This is only used if
		 * the sound wasn't loaded before play() was called.
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
		 * and resume().
		 * @property {Boolean} paused
		 * @public
		 * @readOnly
		 */
		this.paused = false;

		/**
		 * If the sound is paused due to a global pause, probably from the Application.
		 * @property {Boolean} globallyPaused
		 * @readOnly
		 */
		this.globallyPaused = false;

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
	var p = extend(SoundInstance);

	/**
	 * The position of the sound playhead in milliseconds, or 0 if it hasn't started playing yet.
	 * @property {Number} position
	 * @public
	 * @readOnly
	 */
	Object.defineProperty(p, "position",
	{
		get: function()
		{
			return this._channel ? this._channel.getPosition() : 0;
		}
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
			//in case this SoundInstance is not valid any more for some reason
			if (!sound) return;

			var index = sound.playing.indexOf(this);
			if (index > -1)
				sound.playing.splice(index, 1);

			index = sound.waitingToPlay.indexOf(this);
			if (index > -1)
				sound.waitingToPlay.splice(index, 1);

			s._stopInst(this);
		}
	};

	/**
	 * Updates the volume of this SoundInstance.
	 * @method updateVolume
	 * @protected
	 * @param {Number} contextVol The volume of the sound context that the sound belongs to. If
	 *                          omitted, the volume is automatically collected.
	 */
	p.updateVolume = function(contextVol)
	{
		if (!this._channel) return;
		if (contextVol === undefined)
		{
			var s = Sound.instance;
			var sound = s._sounds[this.alias];
			if (sound.context)
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
	Object.defineProperty(p, "volume",
	{
		get: function()
		{
			return this.curVol;
		},
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
	Object.defineProperty(p, "pan",
	{
		get: function()
		{
			return this._pan;
		},
		set: function(value)
		{
			this._pan = value;
			if (this._channel)
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
		//ensure that this is marked as a manual pause
		this.globallyPaused = false;
		if (this.paused) return;
		this.paused = true;
		if (!this._channel) return;
		this._channel.pause();
		Sound.instance._onInstancePaused();
	};

	/**
	 * Unpauses this SoundInstance.
	 * @method resume
	 * @public
	 */
	p.resume = function()
	{
		if (!this.paused) return;
		this.paused = false;
		if (!this._channel) return;
		Sound.instance._onInstanceResume();
		this._channel.resume();
		if (this._channel.gainNode)
		{
			//reset values on the channel to ensure that the volume update takes -
			//the default volume on the audio after playing/resuming will be 1
			this._channel._volume = -1;
			this._channel.gainNode.gain.value = 0;
		}
		this.updateVolume();
	};

	namespace('springroll').SoundInstance = SoundInstance;

}());