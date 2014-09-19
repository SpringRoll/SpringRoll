/**
*  @module PIXI Display
*  @namespace cloudkid.pixi
*/
(function(){
	
	/**
	 * Internal Animator class for keeping track of animations. AnimatorTimelines are pooled internally,
	 * so please only keep references to them while they are actively playing an animation.
	 * 
	 * @class AnimatorTimeline
	 * @constructor
	 * @param {PIXI.MovieClip|Pixi.Spine} clip The AnimatorTimeline's clip
	 * @param {function} callback The function to call when the clip is finished playing
	 * @param {int} speed The speed at which the clip should be played
	 */
	var AnimatorTimeline = function(clip, callback, speed)
	{
		this.init(clip, callback, speed);
	};
	
	AnimatorTimeline.constructor = AnimatorTimeline;

	// Reference to the prototype
	var p = AnimatorTimeline.prototype;

	/**
	 * Initialize the AnimatorTimeline
	 * 
	 * @function init
	 * @param {PIXI.MovieClip|Pixi.Spine} clip The AnimatorTimeline's clip
	 * @param {function} callback The function to call when the clip is finished playing
	 * @param {Number} speed The speed at which the clip should be played
	 * @returns {Animator.AnimatorTimeline}
	 */
	p.init = function(clip, callback, speed)
	{
		/**
		*	The clip for this AnimTimeLine
		*	@property {PIXI.MovieClip|PIXI.Spine} clip
		*	@public
		*/
		this.clip = clip;

		/**
		*	Whether the clip is a PIXI.Spine
		*	@property {bool} isSpine
		*	@public
		*/
		this.isSpine = clip instanceof PIXI.Spine;

		/**
		*	The function to call when the clip is finished playing
		*	@property {function} callback
		*	@public
		*/
		this.callback = callback;

		/**
		*	The speed at which the clip should be played
		*	@property {Number} speed
		*	@public
		*/
		this.speed = speed;

		/**
		*	@property {Array} spineStates
		*	@public
		*/
		this.spineStates = null;

		/**
		*	Not used by Animator, but potentially useful for other code to keep track of what type of animation is being played
		*	@property {bool} loop
		*	@public
		*/
		this.loop = null;

		/**
		*	The position of the animation in seconds
		*	@property {Number} time
		*	@public
		*/
		this.time = 0;

		/**
		*	Sound alias to sync to during the animation.
		*	@property {String} soundAlias
		*	@public
		*/
		this.soundAlias = null;

		/**
		*	A sound instance object from Sound, used for tracking sound position.
		*	@property {Object} soundInst
		*	@public
		*/
		this.soundInst = null;

		/**
		*	If the timeline will, but has yet to, play a sound
		*	@property {bool} playSound
		*	@public
		*/
		this.playSound = false;

		/**
		*	The time (seconds) into the animation that the sound starts.
		*	@property {Number} soundStart
		*	@public
		*/
		this.soundStart = 0;

		/**
		*	The time (seconds) into the animation that the sound ends
		*	@property {Number} soundEnd
		*	@public
		*/
		this.soundEnd = 0;

		/**
		*  If this timeline plays captions
		*
		*  @property {bool} useCaptions
		*  @readOnly
		*/
		this.useCaptions = false;

		/**
		*	If this animation is paused.
		*	@property {bool} _paused
		*	@private
		*/
		this._paused = false;

		return this;
	};
	
	/**
	* Sets and gets the animation's paused status.
	* 
	* @property {bool} paused
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

	// Assign to namespace
	namespace("cloudkid.pixi").AnimatorTimeline = AnimatorTimeline;

}());