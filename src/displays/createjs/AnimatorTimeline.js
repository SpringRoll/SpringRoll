/**
*  @module cloudkid.createjs
*/
(function(){

	"use strict";

	/**
	*   Animator Timeline is a class designed to provide
	*   base animation functionality
	*   
	*   @class createjs.AnimatorTimeline
	*   @constructor
	*/
	var AnimatorTimeline = function(){};
	
	// Create a prototype
	var p = AnimatorTimeline.prototype;
	
	/**
	* The event to callback when we're done
	* 
	* @event onComplete
	*/
	p.onComplete = null;
	
	/** 
	* The parameters to pass when completed 
	* 
	* @property {Array} onCompleteParams
	*/
	p.onCompleteParams = null;
	
	/**
	* The event label
	* 
	* @property {String} event
	*/
	p.event = null;
	
	/**
	* The instance of the timeline to animate 
	* 
	* @property {AnimatorTimeline} instance
	*/
	p.instance = null;
	
	/**
	* The frame number of the first frame
	* 
	* @property {int} firstFrame
	*/
	p.firstFrame = -1;
	
	/**
	* The frame number of the last frame
	* 
	* @property {int} lastFrame
	*/
	p.lastFrame = -1;
	
	/**
	* If the animation loops - determined by looking to see if it ends in " stop" or " loop"
	* 
	* @property {bool} isLooping
	*/
	p.isLooping = false;
	
	/**
	* Ensure we show the last frame before looping
	* 
	* @property {bool} isLastFrame
	*/
	p.isLastFrame = false;
	
	/**
	* length of timeline in frames
	* 
	* @property {int} length
	*/
	p.length = 0;

	/**
	*  If this timeline plays captions
	*
	*  @property {bool} useCaptions
	*  @readOnly
	*/
	p.useCaptions = false;
	
	/**
	* If the timeline is paused.
	* 
	* @property {bool} _paused
	* @private
	*/
	p._paused = false;
	
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

	/**
	* The animation start time in seconds on the movieclip's timeline.
	* @property {Number} startTime
	* @public
	*/
	p.startTime = 0;
	/**
	* The animation duration in seconds.
	* @property {Number} duration
	* @public
	*/
	p.duration = 0;
	/**
	* The animation speed. Default is 1.
	* @property {Number} speed
	* @public
	*/
	p.speed = 1;
	/**
	* The position of the animation in seconds.
	* @property {Number} time
	* @public
	*/
	p.time = 0;
	/**
	* Sound alias to sync to during the animation.
	* @property {String} soundAlias
	* @public
	*/
	p.soundAlias = null;
	/**
	* A sound instance object from cloudkid.Sound or cloudkid.Audio, used for tracking sound position.
	* @property {Object} soundInst
	* @public
	*/
	p.soundInst = null;
	/**
	* If the timeline will, but has yet to play a sound.
	* @property {bool} playSound
	* @public
	*/
	p.playSound = false;
	/**
	* The time (seconds) into the animation that the sound starts.
	* @property {Number} soundStart
	* @public
	*/
	p.soundStart = 0;
	/**
	* The time (seconds) into the animation that the sound ends
	* @property {Number} soundEnd
	* @public
	*/
	p.soundEnd = 0;
	
	// Assign to the name space
	namespace('cloudkid').AnimatorTimeline = AnimatorTimeline;
	namespace('cloudkid.createjs').AnimatorTimeline = AnimatorTimeline;
	
}());