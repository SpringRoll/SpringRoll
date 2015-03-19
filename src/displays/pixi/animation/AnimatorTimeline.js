/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	var Spine = include('PIXI.Spine'),
		AnimationState = include('PIXI.spine.AnimationState'),
		Texture = include('PIXI.Texture'),
		ConcurrentSpineAnimData = include('springroll.pixi.ConcurrentSpineAnimData');
	
	/**
	 * Internal Animator class for keeping track of animations. AnimatorTimelines are pooled
	 * internally, so please only keep references to them while they are actively playing an
	 * animation.
	 *
	 * @class AnimatorTimeline
	 * @constructor
	 * @param {PIXI.MovieClip|Pixi.Spine} clip The AnimatorTimeline's clip
	 * @param {Function} callback The function to call when the clip is finished playing
	 * @param {Number} speed The speed at which the clip should be played
	 * @param {Function} cancelledCallback The function to call if the clip's playback is
	 *                                     interrupted.
	 */
	var AnimatorTimeline = function(clip, callback, speed, cancelledCallback)
	{
		this.eventList = [];
		this.init(clip, callback, speed, cancelledCallback);
	};
	
	AnimatorTimeline.constructor = AnimatorTimeline;

	// Reference to the prototype
	var p = AnimatorTimeline.prototype;

	/**
	 * Initialize the AnimatorTimeline
	 *
	 * @function init
	 * @param {PIXI.MovieClip|Pixi.Spine} clip The AnimatorTimeline's clip
	 * @param {Function} callback The function to call when the clip is finished playing
	 * @param {Number} speed The speed at which the clip should be played
	 * @param {Function} cancelledCallback The function to call if the clip's playback is
	 *                                     interrupted.
	 * @returns {Animator.AnimatorTimeline}
	 */
	p.init = function(clip, callback, speed, cancelledCallback)
	{
		/**
		*	The clip for this AnimTimeLine
		*	@property {PIXI.MovieClip|PIXI.Spine} clip
		*	@public
		*/
		this.clip = clip;

		/**
		*	Whether the clip is a PIXI.Spine
		*	@property {Boolean} isSpine
		*	@public
		*/
		this.isSpine = clip instanceof Spine;

		/**
		*	The function to call when the clip is finished playing
		*	@property {Function} callback
		*	@public
		*/
		this.callback = callback;
		
		/**
		*	The function to call if the clip's playback is interrupted.
		*	@property {Function} cancelledCallback
		*	@public
		*/
		this.cancelledCallback = cancelledCallback;
		
		/**
		* The current animation duration in seconds.
		* @property {Number} duration
		* @public
		*/
		this.duration = 0;

		/**
		*	A speed multiplier for the current animation. Concurrent Spine animations use
		*	spineSpeeds instead.
		*	@property {Number} speed
		*	@public
		*/
		this.speed = speed;
		
		/**
		*	A list of animation, audio, functions, and/or pauses to play.
		*	@property {Array} eventList
		*	@public
		*/
		this.eventList.length = 0;
		
		/**
		* The index of the active animation in eventList.
		* @property {int} listIndex
		*/
		this.listIndex = -1;

		/**
		*	@property {Array} spineStates
		*	@public
		*/
		this.spineStates = null;

		/**
		*	If the current animation loops
		*	@property {Boolean} isLooping
		*	@public
		*/
		this.isLooping = null;

		/**
		*	The position of the animation in seconds
		*	@property {Number} _time_sec
		*	@private
		*/
		this._time_sec = 0;

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
		*	@property {Boolean} playSound
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
		*  @property {Boolean} useCaptions
		*  @readOnly
		*/
		this.useCaptions = false;

		/**
		*	If this animation is paused.
		*	@property {Boolean} _paused
		*	@private
		*/
		this._paused = false;
		
		/**
		*	If the timeline is actively playing an animation, instead of a pause timer.
		*
		*	@property {Boolean} isAnim
		*	@public
		*/
		this.isAnim = false;
		
		/**
		* If the timeline is complete. Looping timelines will never complete.
		* @property {Boolean} complete
		* @public
		* @readOnly
		*/
		this.complete = false;

		return this;
	};
	
	/**
	 * Advances to the next item in the list of things to play.
	 * @method _nextItem
	 * @private
	 */
	p._nextItem = function()
	{
		//reset variables
		this.soundEnd = this.soundStart = 0;
		this.isAnim = this.playSound = this.useCaptions = false;
		this.soundInst = this.soundAlias = null;
		this.spineStates = this.spineSpeeds = null;
		this.isLooping = false;
		//see if the animation list is complete
		if(++this.listIndex >= this.eventList.length)
		{
			this.complete = true;
			return;
		}
		var i, skeletonData;
		//take action based on the type of item in the list
		var listItem = this.eventList[this.listIndex];
		switch(typeof listItem)
		{
			case "object":
				this.isAnim = true;
				var anim = listItem.anim, clip = this.clip;
				this.isLooping = !!listItem.loop;
				this.speed = listItem.speed > 0 ? listItem.speed : 1;
				if(typeof anim == "string")
				{
					//single spine anim
					this.duration = clip.stateData.skeletonData.findAnimation(anim).duration;
					clip.state.setAnimationByName(anim, this.isLooping);
				}
				else //if(Array.isArray(anim))
				{
					//MovieClip
					if(anim[0] instanceof Texture)
					{
						clip.textures = anim;
						clip.updateDuration();
						this.duration = clip._duration;
						clip.gotoAndPlay(0);
					}
					//concurrent spine anims
					else if(anim[0] instanceof ConcurrentSpineAnimData)
					{
						this.spineStates = new Array(anim.length);
						this.spineSpeeds = new Array(anim.length);
						this.duration = 0;
						var maxDuration = 0, maxLoopDuration = 0, duration;
						skeletonData = clip.stateData.skeletonData;
						for(i = 0; i < anim.length; ++i)
						{
							var s = new AnimationState(clip.stateData);
							this.spineStates[i] = s;
							var animLoop = anim[i].loop;
							s.setAnimationByName(anim[i].anim, animLoop);
							duration = skeletonData.findAnimation(anim[i].anim).duration;
							if(animLoop)
							{
								if(duration > maxLoopDuration)
									maxLoopDuration = duration;
							}
							else
							{
								if(duration > maxDuration)
									maxDuration = duration;
							}
							if (anim[i].speed > 0)
								t.spineSpeeds[i] = anim[i].speed;
							else
								t.spineSpeeds[i] = 1;
						}
						//set the duration to be the longest of the non looping animations
						//or the longest loop if they all loop
						this.duration = maxDuration || maxLoopDuration;
					}
					//list of sequential spine anims
					else
					{
						var state = clip.state;
						skeletonData = clip.stateData.skeletonData;
						state.setAnimationByName(anim[0], false);
						this.duration = skeletonData.findAnimation(anim[0]).duration;
						for(i = 1; i < anim.length; ++i)
						{
							state.addAnimationByName(anim[i],
								this.isLooping && i == anim.length - 1);
							this.duration += skeletonData.findAnimation(anim[i]).duration;
						}
					}
				}
				var startTime = typeof listItem.start == "number" ? listItem.start * 0.001 : 0;
				this._time_sec = startTime < 0 ? Math.random() * this.duration : startTime;
				//audio
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

	// Assign to namespace
	namespace("springroll.pixi").AnimatorTimeline = AnimatorTimeline;

}());