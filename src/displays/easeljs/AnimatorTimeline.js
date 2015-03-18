/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function(){

	/**
	*   Animator Timeline is a class designed to provide
	*   base animation functionality
	*
	*   @class AnimatorTimeline
	*   @constructor
	*/
	var AnimatorTimeline = function()
	{
		/**
		* The function to call when we're done
		*
		* @property {Function} onComplete
		*/
		this.onComplete = null;
		
		/**
		* The function to call when stopped early.
		*
		* @property {Function} onCancelled
		*/
		this.onCancelled = null;
		
		/**
		* An array of animations and pauses.
		*
		* @property {Array} event
		*/
		this.eventList = null;
		
		/**
		 * The index of the active animation in eventList.
		 * @property {int} listIndex
		 */
		this.listIndex = -1;
		
		/**
		* The instance of the timeline to animate
		*
		* @property {AnimatorTimeline} instance
		*/
		this.instance = null;
		
		/**
		* The frame number of the first frame of the current animation. If this is -1, then the
		* animation is currently a pause instead of an animation.
		*
		* @property {int} firstFrame
		*/
		this.firstFrame = -1;
		
		/**
		* The frame number of the last frame of the current animation.
		*
		* @property {int} lastFrame
		*/
		this.lastFrame = -1;
		
		/**
		* If the current animation loops - determined by looking to see if it ends
		in "_stop" or "_loop"
		*
		* @property {Boolean} isLooping
		*/
		this.isLooping = false;
		
		/**
		* Length of current animation in frames.
		*
		* @property {int} length
		*/
		this.length = 0;

		/**
		*  If this timeline plays captions for the current sound.
		*
		*  @property {Boolean} useCaptions
		*  @readOnly
		*/
		this.useCaptions = false;
		
		/**
		* If the timeline is paused.
		*
		* @property {Boolean} _paused
		* @private
		*/
		this._paused = false;
		
		/**
		* The start time of the current animation on the movieclip's timeline.
		* @property {Number} startTime
		* @public
		*/
		this.startTime = 0;
		
		/**
		* The current animation duration in seconds.
		* @property {Number} duration
		* @public
		*/
		this.duration = 0;

		/**
		* The animation speed for the current animation. Default is 1.
		* @property {Number} speed
		* @public
		*/
		this.speed = 1;

		/**
		* The position of the current animation in seconds, or the current pause timer.
		* @property {Number} _time_sec
		* @private
		*/
		this._time_sec = 0;

		/**
		* Sound alias to sync to during the current animation.
		* @property {String} soundAlias
		* @public
		*/
		this.soundAlias = null;

		/**
		* A sound instance object from springroll.Sound, used for tracking sound position for the
		* current animation.
		* @property {Object} soundInst
		* @public
		*/
		this.soundInst = null;

		/**
		* If the timeline will, but has yet to play a sound for the current animation.
		* @property {Boolean} playSound
		* @public
		*/
		this.playSound = false;

		/**
		* The time (seconds) into the current animation that the sound starts.
		* @property {Number} soundStart
		* @public
		*/
		this.soundStart = 0;

		/**
		* The time (seconds) into the animation that the sound ends
		* @property {Number} soundEnd
		* @public
		*/
		this.soundEnd = 0;
		
		/**
		* If the timeline is complete. Looping timelines will never complete.
		* @property {Boolean} complete
		* @public
		* @readOnly
		*/
		this.complete = false;
	};
	
	var p = AnimatorTimeline.prototype;
	
	/**
	 * Advances to the next item in the list of things to play.
	 * @method _nextItem
	 * @private
	 */
	p._nextItem = function()
	{
		//reset variables
		this.soundEnd = this.soundStart = 0;
		this.isLooping = this.playSound = this.useCaptions = false;
		this.soundInst = this.soundAlias = null;
		this.startTime = this.length = 0;
		this.firstFrame = this.lastFrame = -1;
		//see if the animation list is complete
		if(++this.listIndex >= this.eventList.length)
		{
			this.complete = true;
			return;
		}
		//take action based on the type of item in the list
		var listItem = this.eventList[this.listIndex];
		switch(typeof listItem)
		{
			case "object":
				this.firstFrame = listItem.first;
				this.lastFrame = listItem.last;
				this.length = this.lastFrame - this.firstFrame;
				var fps = this.instance.framerate;
				this.startTime = this.firstFrame / fps;
				this.duration = this.length / fps;
				this.speed = listItem.speed;
				this.isLooping = listItem.loop;
				var animStart = listItem.animStart;
				this._time_sec = animStart < 0 ? Math.random() * this.duration : animStart;
				if(listItem.alias)
				{
					this.soundAlias = listItem.alias;
					this.soundStart = listItem.audioStart;
					this.playSound = true;
					this.useCaptions = listItem.useCaptions;
				}
				break;
			case "number":
				this.duration = listItem;
				this._time_sec = 0;
				break;
			case "function":
				listItem();
				this._nextItem();
				break;
		}
	};
	
	/**
	* The position of the current animation, or the current pause timer, in milliseconds.
	* @property {Number} time
	* @public
	*/
	Object.defineProperty(p, "time", {
		get: function() { return this._time_sec * 1000; },
		set: function(value) { this._time_sec = value * 0.001; }
	});
	
	/**
	* Sets and gets the animation's paused status.
	*
	* @property {Boolean} paused
	* @public
	*/
	Object.defineProperty(p, "paused", {
		get: function() { return this._paused; },
		set: function(value) {
			if(value == this._paused) return;
			this._paused = !!value;
			if(this.soundInst)
			{
				if(this.paused)
					this.soundInst.pause();
				else
					this.soundInst.unpause();
			}
		}
	});
	
	// Assign to the name space
	namespace('springroll').AnimatorTimeline = AnimatorTimeline;
	namespace('springroll.easeljs').AnimatorTimeline = AnimatorTimeline;
	
}());