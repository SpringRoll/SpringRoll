/*! SpringRoll 0.3.18 */
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	/**
	* Class for assisting in creating an array of Spine animations to play at the same time
	* on one skeleton through Animator. Concurrent animations will play until one non-looping
	* animation ends.
	*
	* @class ParallelSpineData
	* @constructor
	* @param {String} anim The name of the animation on the skeleton.
	* @param {Boolean} [loop=false] If this animation should loop.
	* @param {Number} [speed=1] The speed at which this animation should be played.
	*/
	var ParallelSpineData = function(anim, loop, speed)
	{
		this.anim = anim;
		this.loop = !!loop;
		this.speed = speed > 0 ? speed : 1;
	};
	
	// Assign to namespace
	namespace("springroll.pixi").ParallelSpineData = ParallelSpineData;

}());
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
		ParallelSpineData = include('springroll.pixi.ParallelSpineData');
	
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
		var repeat = false;
		//if on a looping animation, set up the animation to be replayed
		// - this will only happen on looping animations with audio
		if(this.isLooping)
		{
			//if sound is playing, we need to stop it immediately
			//otherwise it can interfere with replaying the audio
			if(this.soundInst)
				this.soundInst.stop();
			//say that we are repeating, so that we start at the beginning of the loop
			//in case it started part way in
			repeat = true;
		}
		else
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
					else if(anim[0] instanceof ParallelSpineData)
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
						this.duration = skeletonData.findAnimation(anim[0]).duration;
						if(anim.length == 1)
						{
							state.setAnimationByName(anim[0], this.isLooping);
						}
						else
						{
							state.setAnimationByName(anim[0], false);
							for(i = 1; i < anim.length; ++i)
							{
								state.addAnimationByName(anim[i],
									this.isLooping && i == anim.length - 1);
								this.duration += skeletonData.findAnimation(anim[i]).duration;
							}
						}
					}
				}
				var startTime = typeof listItem.start == "number" ? listItem.start * 0.001 : 0;
				if(repeat)
					this._time_sec = 0;
				else
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
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function(undefined)
{
	var Spine = include('PIXI.Spine'),
		Texture = include('PIXI.Texture'),
		AnimatorTimeline = include('springroll.pixi.AnimatorTimeline'),
		ParallelSpineData = include('springroll.pixi.ParallelSpineData'),
		Application = include('springroll.Application'),
		MovieClip = include('PIXI.MovieClip'),
		Sound;

	/**
	*  Animator for interacting with Spine animations
	*  @class Animator
	*  @static
	*/
	var Animator = {};
	
	/**
	* The collection of AnimatorTimelines that are playing
	* @property {Array} _timelines
	* @private
	*/
	var _timelines = null,
	
	/**
	* The number of animations
	* @property {int} _numAnims
	* @private
	* @static
	*/
	_numAnims = 0,
	
	/**
	 * Stored collection of AnimatorTimelines. This is internal to Animator and can't be accessed externally.
	 * @property {Array} _animPool
	 * @private
	 * @static
	 */
	_animPool = null;
	
	/**
	*  The global captions object to use with animator
	*  @property {springroll.Captions} captions
	*  @public
	*/
	Animator.captions = null;

	/**
	 * Initializes the singleton instance of Animator.
	 * @method init
	 * @static
	 */
	Animator.init = function()
	{
		_animPool = [];
		_timelines = [];

		Sound = include('springroll.Sound', false);
	};
	
	/**
	* Play a specified animation
	*
	* @method play
	* @param {PIXI.MovieClip|PIXI.Spine} clip The clip to play. Animation options vary depending on
	*                                         object type.
	* @param {String|Array} animData One of or an array of the following
	*   * objects in the format:
	*
	*       {
	*           anim:<string|array of strings|array of ParallelSpineData|array of Textures>,
	*           start:0,
	*           speed:1,
	*           loop:false,
	*           audio:{alias:"MyAlias", start:300}
	*       }
	*
	*       * anim is the data about the animation to play. See below for more info
	*       * start is milliseconds into the animation to start (0 if omitted). A value of -1
	*           starts from a random time in the animation.
	*       * speed is a multiplier for the animation speed (1 if omitted).
	*       * loop is if the animation should loop (false if omitted).
	*       * audio is audio to sync the animation to using springroll.Sound. audio can be a String
	*           if you want the audio to start 0 milliseconds into the animation.
	*   * strings - A single animation to play on a Spine skeleton.
	*   * arrays of strings - An array of animations to play sequentially on a Spine skeleton.
	*   * arrays of ParallelSpineData - An array of animations to play at the same time on a
	*       Spine skeleton.
	*   * arrays of Textures - An array of textures to play on a MovieClip.
	*   * numbers - milliseconds to wait.
	*   * functions - called upon reaching, followed immediately by the next item.
	* @param {Function} [onComplete] The function to call once the animation has finished.
	* @param {Function} [onCancelled] A callback function for when an animation is stopped with
	*                                 Animator.stop() or to play another animation.
	* @return {springroll.pixi.AnimatorTimeline} The timeline object
	*/
	Animator.play = function(clip, animData, onComplete, onCancelled)
	{
		var audio, options;

		if (onComplete && typeof onComplete != "function")
		{
			options = onComplete;
			onComplete = options.onComplete;
			onCancelled = options.onCancelled;
		}
		else if(onCancelled === true)
			onCancelled = onComplete;
		
		//ensure that we can play the clip
		if (!Animator.canAnimate(clip))
		{
			if (onComplete) onComplete();
			return;
		}
		
		Animator.stop(clip);
		//deprecation fallback
		if(options)
			audio = options.audio || options.soundData || null;
		
		if(typeof animData == "string")
		{
			animData = [{anim: animData, audio: audio}];
		}
		else if(Array.isArray(animData))
		{
			var firstItem = animData[0];
			if(firstItem instanceof Texture)
			{
				animData = [{anim: animData, audio: audio}];
			}
			else if(typeof firstItem == "string")
			{
				animData = [{anim: animData, audio: audio}];
			}
			else if(firstItem instanceof ParallelSpineData)
			{
				animData = [{anim: animData, audio: audio}];
			}
		}
		else
			animData = [animData];
		
		var t = Animator._makeTimeline(clip, animData, onComplete, onCancelled);
		
		if(t.eventList.length < 1)
		{
			_repool(t);
			if (onComplete)
				onComplete();
			return null;
		}
		//update the art to the proper bit of the animation
		t._nextItem();
		updateClip(t, t._time_sec, 0);
		
		_timelines.push(t);
		if (++_numAnims == 1)
			Application.instance.on("update", _update);
		return t;
	};
	
	/**
	*   Creates the AnimatorTimeline for a given animation
	*
	*   @method _makeTimeline
	*   @param {PIXI.Spine|PIXI.MovieClip} clip The instance to animate
	*   @param {Array} animData List of animation events.
	*   @param {Function} callback The function to callback when we're done
	*   @param {Function} cancelledCallback The function to callback when cancelled
	*   @return {springroll.pixi.AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(clip, animData, callback, cancelledCallback)
	{
		var t = _animPool.length ?
			_animPool.pop().init(clip, callback, cancelledCallback) :
			new AnimatorTimeline(clip, callback, cancelledCallback);
		
		var i, length, j, jLength, anim, audio;
		for(i = 0; i < animData.length; ++i)
		{
			var data = animData[i];
			if(typeof data == "number")
			{
				t.eventList.push(data * 0.001);
				continue;
			}
			if(typeof data == "function")
			{
				t.eventList.push(data);
				continue;
			}
			anim = data.anim;
			audio = data.audio;
			if (t.isSpine)
			{
				//allow the animations to be a string, or an array of strings
				if (typeof anim == "string")
				{
					if (checkSpineForAnimation(clip, anim))
					{
						t.eventList.push(data);
					}
				}
				//Array - either animations in order or animations at the same time
				else
				{
					//array of Strings, play animations by name in order
					if (typeof anim[0] == "string")
					{
						for(j = anim.length; j >= 0; --j)
						{
							if(!checkSpineForAnimation(clip, anim[j]))
							{
								anim.splice(j, 1);
							}
						}
						if(anim.length)
							t.eventList.push(data);
					}
					//array of objects - play different animations at the same time
					else
					{
						for(j = anim.length; j >= 0; --j)
						{
							if(!checkSpineForAnimation(clip, anim[j].anim))
							{
								anim.splice(j, 1);
							}
						}
						if(anim.length)
							t.eventList.push(data);
					}
				}
			}
			//standard PIXI.MovieClip
			else if(anim[0] instanceof Texture)
			{
				t.eventList.push(data);
			}
			//bad data, nothing we can animate with
			else
			{
				continue;
			}
			//only do sound if the Sound library is in use
			if (audio && Sound)
			{
				var alias, start;
				if (typeof audio == "string")
				{
					start = 0;
					alias = audio;
				}
				else
				{
					start = audio.start > 0 ? audio.start * 0.001 : 0;//seconds
					alias = audio.alias;
				}
				if(Sound.instance.exists(alias))
				{
					Sound.instance.preloadSound(alias);
					data.alias = alias;
					data.audioStart = start;
				
					data.useCaptions = Animator.captions && Animator.captions.hasCaption(alias);
				}
			}
		}
		
		return t;
	};
	
	/**
	*   Determines if a given instance can be animated by Animator.
	*   @method canAnimate
	*   @param {PIXI.DisplayObject} instance The object to check for animation properties.
	*   @return {Boolean} If the instance can be animated or not.
	*   @static
	*/
	Animator.canAnimate = function(instance)
	{
		if(!instance)
			return false;
		//check for instance of Spine, MovieClip
		if(instance instanceof Spine || instance instanceof MovieClip)
			return true;
		//check for textures && _elapsedTime properties, that MovieClip has
		if(instance.hasOwnProperty("textures") && instance.hasOwnProperty("_elapsedTime"))
			return true;
		return false;
	};
	
	/**
	*   Get duration of animation (or sequence of animations) in seconds
	*
	*   @method getDuration
	*   @param {PIXI.MovieClip|PIXI.Spine} clip The display object that the animation matches.
	*   @param {String|Array} animData The animation data or array, in the format that play() uses.
	*   @public
	*   @static
	*	@return {Number} Duration of animation event in milliseconds
	*/
	Animator.getDuration = function(clip, animData)
	{
		//calculated in seconds
		var duration = 0;
		
		//ensure one format
		if(typeof animData == "string")
		{
			animData = [{anim: animData}];
		}
		else if(Array.isArray(animData))
		{
			var firstItem = animData[0];
			if(firstItem instanceof Texture)
			{
				animData = [{anim: animData}];
			}
			else if(typeof firstItem == "string")
			{
				animData = [{anim: animData}];
			}
			else if(firstItem instanceof ParallelSpineData)
			{
				animData = [{anim: animData}];
			}
		}
		else
			animData = [animData];
		
		for(var i = 0; i < animData.length; ++i)
		{
			var listItem = animData[i];
			switch(typeof listItem)
			{
				case "object":
					var anim = listItem.anim;
					if(typeof anim == "string")
					{
						//single spine anim
						duration += clip.stateData.skeletonData.findAnimation(anim).duration;
					}
					else //if(Array.isArray(anim))
					{
						//MovieClip
						if(anim[0] instanceof Texture)
						{
							duration += anim.length / clip.fps;
						}
						//concurrent spine anims
						else if(anim[0] instanceof ParallelSpineData)
						{
							this.spineStates = new Array(anim.length);
							this.spineSpeeds = new Array(anim.length);
							var maxDuration = 0, maxLoopDuration = 0, tempDuration;
							skeletonData = clip.stateData.skeletonData;
							for(i = 0; i < anim.length; ++i)
							{
								var animLoop = anim[i].loop;
								tempDuration = skeletonData.findAnimation(anim[i].anim).duration;
								if(animLoop)
								{
									if(duration > maxLoopDuration)
										maxLoopDuration = tempDuration;
								}
								else
								{
									if(duration > maxDuration)
										maxDuration = tempDuration;
								}
							}
							//set the duration to be the longest of the non looping animations
							//or the longest loop if they all loop
							if(maxDuration)
								duration += maxDuration;
							else
								duration += maxLoopDuration;
						}
						//list of sequential spine anims
						else
						{
							skeletonData = clip.stateData.skeletonData;
							for(i = 0; i < anim.length; ++i)
							{
								duration += skeletonData.findAnimation(anim[i]).duration;
							}
						}
					}
					break;
				case "number":
					duration += listItem * 0.001;
					break;
			}
		}
		
		return duration * 1000;//convert into milliseconds
	};

	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 *
	 * @method instanceHasAnimation
	 * @param {PIXI.Spine} instance The animation to search. This has to be a Spine animation.
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	Animator.instanceHasAnimation = function(instance, anim)
	{
		if (instance instanceof Spine)
			return checkSpineForAnimation(instance, anim);
		return false;
	};
	
	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 *
	 * @method checkSpineForAnimation
	 * @param {PIXI.Spine} clip The spine to search
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	var checkSpineForAnimation = function(clip, anim)
	{
		return clip.stateData.skeletonData.findAnimation(anim) !== null;
	};
	
	/**
	 * Stop a clip
	 *
	 * @method stop
	 * @param {PIXI.MovieClip|PIXI.Spine} clip The clip to stop
	 */
	Animator.stop = function(clip, doCallback)
	{
		for(var i = 0; i < _numAnims; ++i)
		{
			if (_timelines[i].clip === clip)
			{
				var t = _timelines[i];
				_timelines.splice(i, 1);
				if (--_numAnims === 0)
					Application.instance.off("update", _update);
				if (t.cancelledCallback)
					t.cancelledCallback();
				if (t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
			}
		}
	};
	
	/**
	 * Stops all current animations
	 *
	 * @method stop
	 * @static
	 * @param {boolean} [doCancelled=true] We if should do the cancelled callback, if available.
	 */
	Animator.stopAll = function(doCancelled)
	{
		doCancelled = doCancelled !== undefined ? true : !!doCancelled;

		for(var i = 0; i < _numAnims; ++i)
		{
				var t = _timelines[i];
				if (doCancelled && t.cancelledCallback)
					t.cancelledCallback();
				if (t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
		}
		Application.instance.off("update", _update);
		_timelines.length = _numAnims = 0;
	};
	
	/**
	 * Put an AnimatorTimeline back into the general pool after it's done playing
	 * or has been manually stopped.
	 *
	 * @method _repool
	 * @param {springroll.pixi.AnimatorTimeline} timeline
	 * @private
	 */
	var _repool = function(timeline)
	{
		timeline.clip = null;
		timeline.callback = null;
		timeline.cancelledCallback = null;
		timeline.isLooping = false;
		timeline.spineStates = null;
		timeline.speed = null;
		timeline.soundInst = null;
		_animPool.push(timeline);
	};
	
	/**
	 * Update each frame
	 *
	 * @method _update
	 * @param {int} elapsed The time since the last frame
	 * @private
	 */
	var _update = function(elapsed)
	{
		//TODO: finish updating to cleaner method - see Trello and AnimatorTimeline.
		var delta = elapsed * 0.001;//ms -> sec
		
		for(var i = _numAnims - 1; i >= 0; --i)
		{
			var t = _timelines[i];
			if (t.paused) continue;
			var prevTime = t._time_sec;
			//we'll use this to figure out if the timeline is on the next item
			//to avoid code repetition
			var onNext = false, extraTime = 0;
			
			//if the timeline is on an active animation
			if(t.isAnim)
			{
				//update time to audio
				if (t.soundInst)
				{
					if (t.soundInst.isValid)
					{
						//convert sound position ms -> sec
						var audioPos = t.soundInst.position * 0.001;
						if (audioPos < 0)
							audioPos = 0;
						t._time_sec = t.soundStart + audioPos;
						if (t.useCaptions)
						{
							Animator.captions.seek(t.soundInst.position);
						}
						//if the sound goes beyond the animation, then stop the animation
						//audio animations shouldn't loop, because doing that properly is difficult
						//letting the audio continue should be okay though
						if (t._time_sec >= t.duration)
						{
							updateClip(t, t.duration, prevTime);
							extraTime = t._time_sec - t.duration;
							t._nextItem();
							if(t.complete)
							{
								_onMovieClipDone(t);
								continue;
							}
							else
							{
								onNext = true;
							}
						}
					}
					else//if sound is no longer valid, stop animation immediately
					{
						t._nextItem();
						if(t.complete)
						{
							_onMovieClipDone(t);
							continue;
						}
						else
						{
							onNext = true;
						}
					}
				}
				//update time normally
				else
				{
					t._time_sec += delta * t.speed;
					//see if we should start playing audio
					if (t.playSound && t._time_sec >= t.soundStart)
					{
						t._time_sec = t.soundStart;
						t.playSound = false;
						t.soundInst = Sound.instance.play(
							t.soundAlias,
							onSoundDone.bind(this, t, t.listIndex, t.soundAlias),
							onSoundStarted.bind(this, t, t.listIndex)
						);
						if (t.useCaptions)
						{
							Animator.captions.play(t.soundAlias);
						}
					}
				}
				//update the clip
				var c = t.clip;
				if (t.isSpine)
				{
					if (t.spineStates)
					{
						var complete = updateClip(t, t._time_sec, prevTime);
						if (complete)
						{
							extraTime = t._time_sec - t.duration;
							t._nextItem();
							if(t.complete)
							{
								_onMovieClipDone(t);
								continue;
							}
							else
							{
								onNext = true;
							}
						}
						else if(t._time_sec > t.duration)
						{
							extraTime = t._time_sec - t.duration;
							t._nextItem();
							onNext = true;
						}
					}
					else
					{
						updateClip(t, t._time_sec, prevTime);
						if (t._time_sec >= t.duration)
						{
							extraTime = t._time_sec - t.duration;
							
							t._nextItem();
							if(t.complete)
							{
								_onMovieClipDone(t);
								continue;
							}
							else
							{
								onNext = true;
							}
						}
					}
				}
				else//standard PIXI.MovieClip
				{
					if (t._time_sec >= t.duration)
					{
						if (t.isLooping && t.listIndex == t.eventList.length - 1)
						{
							extraTime = t._time_sec - t.duration;
							t._nextItem();//reset any audio and such
							//call the on complete function each time
							if (t.onComplete)
								t.onComplete();
							onNext = true;
						}
						else
						{
							extraTime = t._time_sec - t.duration;
							c.gotoAndStop(c.textures.length - 1);
							t._nextItem();
							if(t.complete)
							{
								_onMovieClipDone(t);
								continue;
							}
							else
							{
								onNext = true;
							}
						}
					}
					else
					{
						c._elapsedTime = t._time_sec;
					}
				}
			}
			//a timed pause
			else
			{
				t._time_sec += delta * t.speed;
				if (t._time_sec >= t.duration)
				{
					extraTime = t._time_sec - t.duration;
					t._nextItem();
					if(t.complete)
					{
						_onMovieClipDone(t);
						continue;
					}
					else
					{
						onNext = true;
					}
				}
			}
			if(onNext)
			{
				prevTime = 0;
				t._time_sec += extraTime;
				while(t._time_sec >= t.duration)
				{
					extraTime = t._time_sec - t.duration;
					t._nextItem();
					if (t.complete)
					{
						if(t.clip.gotoAndStop)
							t.clip.gotoAndStop(t.clip.textures.length - 1);
						else
							updateClip(t, t._time_sec, prevTime);
						_onMovieClipDone(t);
						continue;
					}
					t._time_sec += extraTime;
				}
				
				if(t.playSound && t._time_sec >= t.soundStart)
				{
					t._time_sec = t.soundStart;
					t.playSound = false;
					t.soundInst = Sound.instance.play(
						t.soundAlias,
						onSoundDone.bind(this, t, t.listIndex, t.soundAlias),
						onSoundStarted.bind(this, t, t.listIndex)
					);
					if (t.useCaptions)
					{
						Animator.captions.play(t.soundAlias);
					}
				}
				//update after the change to the new step
				if(t.isAnim)
					updateClip(t, t._time_sec, prevTime);
			}
		}
		if (_numAnims === 0)
			Application.instance.off("update", _update);
	};
	
	var updateClip = function(t, time, prevTime)
	{
		var complete = false;
		var c = t.clip;
		if (t.isSpine)
		{
			if (t.spineStates)
			{
				for(var j = 0, len = t.spineStates.length; j < len; ++j)
				{
					var s = t.spineStates[j];
					s.update((time - prevTime) * t.spineSpeeds[j]);
					s.apply(c.skeleton);
					if (!s.currentLoop && s.isComplete())
						complete = true;
				}
			}
			else
			{
				c.updateAnim(time - prevTime);
			}
		}
		else
		{
			c._elapsedTime = time;
		}
		return complete;
	};
	
	var onSoundStarted = function(timeline, playIndex)
	{
		if(timeline.listIndex != playIndex) return;
		
		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};
	
	var onSoundDone = function(timeline, playIndex, soundAlias)
	{
		if (Animator.captions && Animator.captions.currentAlias == soundAlias)
			Animator.captions.stop();
		
		if(timeline.listIndex != playIndex) return;
		
		if (timeline.soundEnd > 0 && timeline._time_sec < timeline.soundEnd)
			timeline._time_sec = timeline.soundEnd;
		timeline.soundInst = null;
	};
	
	/**
	 * Called when a movie clip is done playing, calls the AnimatorTimeline's
	 * callback if it has one
	 *
	 * @method _onMovieClipDone
	 * @param {pixi.AnimatorTimeline} timeline
	 * @private
	 */
	var _onMovieClipDone = function(timeline)
	{
		var i = _timelines.indexOf(timeline);
		if(i >= 0)
		{
			if (timeline.useCaptions)
				Animator.captions.stop();
			timeline.clip.onComplete = null;
			_timelines.splice(i, 1);
			if (--_numAnims === 0)
				Application.instance.off("update", _update);
			if (timeline.callback)
				timeline.callback();
			_repool(timeline);
		}
	};
	
	/**
	 * Destroy this
	 *
	 * @method destroy
	 */
	Animator.destroy = function()
	{
		Animator.stopAll(false);
		Animator.captions = null;
		_animPool = null;
		_timelines = null;
		Application.instance.off("update", _update);
	};
	
	namespace('springroll').Animator = Animator;
	namespace('springroll.pixi').Animator = Animator;
}());
/**
 * @module PIXI Animation
 * @namespace springroll
 * @requires  Core, PIXI Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.pixi.Animator');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();	

	// Init the animator
	plugin.setup = function()
	{
		Animator.init();
		Animator.captions = this.captions || null;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (Animator) Animator.destroy();
	};

}());