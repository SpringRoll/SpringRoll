/**
*  @module Sound
*  @namespace springroll
*/
(function(){

	var Sound;

	/**
	*  A playing instance of a sound (or promise to play as soon as it loads). These can only
	*  be created through springroll.Sound.instance.play().
	*  @class SoundInstance
	*/
	var SoundInstance = function()
	{
		if(!Sound)
		{
			Sound = include('springroll.Sound');
		}

		/**
		*	SoundJS SoundInstanceance, essentially a sound channel.
		*	@property {createjs.SoundInstanceance} _channel
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
		*	An active SoundInstance should always be valid. This is primarily for compatability with springroll.Audio.
		*	@property {bool} isValid
		*	@public
		*	@readOnly
		*/
		this.isValid = true;
	};
	
	// Reference to the prototype
	var p = SoundInstance.prototype = {};

	/**
	*	The position of the sound playhead in milliseconds, or 0 if it hasn't started playing yet.
	*	@property {Number} position
	*	@public
	*/
	Object.defineProperty(p, "position", 
	{
		get: function(){ return this._channel ? this._channel.getPosition() : 0;}
	});

	/**
	*	Stops this SoundInstance.
	*	@method stop
	*	@public
	*/
	p.stop = function()
	{
		var s = Sound.instance;
		var sound = s._sounds[this.alias];
		sound.playing.splice(sound.playing.indexOf(this), 1);
		Sound.instance._stopInst(this);
	};

	/**
	*	Updates the volume of this SoundInstance.
	*	@method updateVolume
	*	@public
	*	@param {Number} contextVol The volume of the sound context that the sound belongs to. If omitted, the volume is automatically collected.
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
	*	Pauses this SoundInstance.
	*	@method pause
	*	@public
	*/
	p.pause = function()
	{
		if(this.paused) return;
		this.paused = true;
		if(!this._channel) return;
		this._channel.pause();
	};

	/**
	*	Unpauses this SoundInstance.
	*	@method unpause
	*	@public
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