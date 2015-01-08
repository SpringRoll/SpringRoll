/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function() {
	
	var Spine = include('PIXI.Spine'),
		Texture = include('PIXI.Texture'),
		AnimatorTimeline = include('springroll.pixi.AnimatorTimeline'),
		ConcurrentSpineAnimData = include('springroll.pixi.ConcurrentSpineAnimData'),
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
	*           anim:<string|array of strings|array of ConcurrentSpineAnimData|array of Textures>,
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
	*   * arrays of ConcurrentSpineAnimData - An array of animations to play at the same time on a
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
			else if(firstItem instanceof ConcurrentSpineAnimData)
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
	*   Determines if a given instance can be animated by Animator.
	*   @method _canAnimate
	*   @deprecated Use the public method Animator.canAnimate
	*   @param {PIXI.DisplayObject} instance The object to check for animation properties.
	*   @return {Boolean} If the instance can be animated or not.
	*   @private
	*   @static
	*/
	Animator._canAnimate = Animator.canAnimate;
	
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
			else if(firstItem instanceof ConcurrentSpineAnimData)
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
						else if(anim[0] instanceof ConcurrentSpineAnimData)
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
	 */
	Animator.stopAll = function()
	{
		for(var i = 0; i < _numAnims; ++i)
		{
				var t = _timelines[i];
				if (t.cancelledCallback)
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
							t._time_sec -= t.duration;
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
							t._time_sec -= t.duration;
							//call the on complete function each time
							if (t.onComplete)
								t.onComplete();
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
		Animator.captions = null;
		_animPool = null;
		_timelines = null;
		Application.instance.off("update", _update);
	};

	//set up the global initialization and destroy
	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);
	
	namespace('springroll').Animator = Animator;
	namespace('springroll.pixi').Animator = Animator;
}());