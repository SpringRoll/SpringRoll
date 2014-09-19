/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
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
		* The event to callback when we're done
		* 
		* @event onComplete
		*/
		this.onComplete = null;
		
		/** 
		* The parameters to pass when completed 
		* 
		* @property {Array} onCompleteParams
		*/
		this.onCompleteParams = null;
		
		/**
		* The event label
		* 
		* @property {String} event
		*/
		this.event = null;
		
		/**
		* The instance of the timeline to animate 
		* 
		* @property {AnimatorTimeline} instance
		*/
		this.instance = null;
		
		/**
		* The frame number of the first frame
		* 
		* @property {int} firstFrame
		*/
		this.firstFrame = -1;
		
		/**
		* The frame number of the last frame
		* 
		* @property {int} lastFrame
		*/
		this.lastFrame = -1;
		
		/**
		* If the animation loops - determined by looking to see if it ends in " stop" or " loop"
		* 
		* @property {bool} isLooping
		*/
		this.isLooping = false;
		
		/**
		* Ensure we show the last frame before looping
		* 
		* @property {bool} isLastFrame
		*/
		this.isLastFrame = false;
		
		/**
		* length of timeline in frames
		* 
		* @property {int} length
		*/
		this.length = 0;

		/**
		*  If this timeline plays captions
		*
		*  @property {bool} useCaptions
		*  @readOnly
		*/
		this.useCaptions = false;
		
		/**
		* If the timeline is paused.
		* 
		* @property {bool} _paused
		* @private
		*/
		this._paused = false;
		
		/**
		* The animation start time in seconds on the movieclip's timeline.
		* @property {Number} startTime
		* @public
		*/
		this.startTime = 0;
		
		/**
		* The animation duration in seconds.
		* @property {Number} duration
		* @public
		*/
		this.duration = 0;

		/**
		* The animation speed. Default is 1.
		* @property {Number} speed
		* @public
		*/
		this.speed = 1;

		/**
		* The position of the animation in seconds.
		* @property {Number} time
		* @public
		*/
		this.time = 0;

		/**
		* Sound alias to sync to during the animation.
		* @property {String} soundAlias
		* @public
		*/
		this.soundAlias = null;

		/**
		* A sound instance object from cloudkid.Sound used for tracking sound position.
		* @property {Object} soundInst
		* @public
		*/
		this.soundInst = null;

		/**
		* If the timeline will, but has yet to play a sound.
		* @property {bool} playSound
		* @public
		*/
		this.playSound = false;

		/**
		* The time (seconds) into the animation that the sound starts.
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
	};
	
	/**
	* Sets and gets the animation's paused status.
	* 
	* @property {bool} paused
	* @public
	*/
	Object.defineProperty(AnimatorTimeline.prototype, "paused", {
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
	namespace('cloudkid').AnimatorTimeline = AnimatorTimeline;
	namespace('cloudkid.createjs').AnimatorTimeline = AnimatorTimeline;
	
}());