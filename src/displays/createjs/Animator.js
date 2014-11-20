/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function(undefined){

	// Imports
	var Application = include('springroll.Application'),
		AnimatorTimeline = include('springroll.createjs.AnimatorTimeline'),
		Sound;

	/**
	*   Animator is a static class designed to provided
	*   base animation functionality, using frame labels of MovieClips
	*
	*   @class Animator
	*   @static
	*/
	var Animator = {};

	/**
	* If we fire debug statements
	*
	* @property {Boolean} debug
	* @public
	* @static
	*/
	Animator.debug = false;

	/**
	*  The global captions object to use with animator
	*  @property {springroll.Captions} captions
	*  @public
	*  @static
	*/
	Animator.captions = null;

	/**
	* The collection of timelines
	*
	* @property {Array} _timelines
	* @private
	*/
	var _timelines = null;

	/**
	* A collection of timelines for removal - kept out here so it doesn't need to be
	* reallocated every frame
	*
	* @property {Array} _removedTimelines
	* @private
	*/
	var _removedTimelines = null;

	/** Look up a timeline by the instance
	*
	* @property {Dictionary} _timelinesMap
	* @private
	*/
	var _timelinesMap = null;

	/**
	* If the Animator is paused
	*
	* @property {Boolean} _paused
	* @private
	*/
	var _paused = false;

	/**
	* An empty object to avoid creating new objects in play()
	* when an options object is not used for parameters.
	*
	* @property {Object} _optionsHelper
	* @private
	*/
	var _optionsHelper = {};

	/**
	*	Sets the variables of the Animator to their defaults. Use when _timelines is null,
	*	if the Animator data was cleaned up but was needed again later.
	*
	*	@function init
	*	@static
	*/
	Animator.init = function()
	{
		_timelines = [];
		_removedTimelines = [];
		_timelinesMap = {};
		_paused = false;

		Sound = include('springroll.Sound', false);
	};

	/**
	*	Stops all animations and cleans up the variables used.
	*
	*	@function destroy
	*	@static
	*/
	Animator.destroy = function()
	{
		Animator.stopAll();
		Animator.captions = null;

		_optionsHelper = null;
		_timelines = null;
		_removedTimelines = null;
		_timelinesMap = null;
	};

	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);

	/**
	*   Play an animation for a frame label event
	*
	*   @function play
	*   @param {createjs.DisplayObject} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {Object|Function} [options] The object of optional parameters or onComplete
	*                                      callback function
	*   @param {Function} [options.onComplete] The callback function when the animation is done
	*   @param {Array} [options.onCompleteParams] Parameters to pass to onComplete function
	*   @param {int} [options.startTime=0] The time in milliseconds into the animation to start.
	*                                      A value of -1 makes the animation play at a random
	*                                      startTime.
	*   @param {Number} [options.speed=1] The speed at which to play the animation.
	*   @param {Object|String} [options.audio] Data about a sound to sync the animation to, as
	*                                              just an alias or in the format
	*                                              {alias:"MyAlias", start:0}. start is the seconds
	*                                              into the animation to start playing the sound.
	*                                              If it is omitted or audio is a String, it
	*                                              defaults to 0.
	*   @param {Function} [options.onCancelled] A callback function for when an animation is stopped
	*                                           with Animator.stop() or to play another animation.
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.play = function(instance, event, options)
	{
		var onComplete, onCompleteParams, startTime, speed, audio, onCancelled;

		if (options && typeof options == "function")
		{
			onComplete = options;
			options = _optionsHelper;//use the helper instead of creating a new object
		}
		else if (!options)
		{
			options = _optionsHelper;//use the helper instead of creating a new object
		}

		onComplete = options.onComplete || onComplete || null;
		onCompleteParams = options.onCompleteParams || null;
		startTime = options.startTime;
		//convert into seconds, as that is what the time uses internally
		startTime = startTime ? startTime * 0.001 : 0;
		speed = options.speed || 1;
		onCancelled = options.onCancelled || null;
		audio = options.audio || options.soundData || null;

		if (!_timelines)
			Animator.init();

		if (_timelinesMap[instance.id] !== undefined)
		{
			Animator.stop(instance);
		}
		var timeline = Animator._makeTimeline(instance, event, onComplete, onCompleteParams, speed,
												audio, onCancelled);

		//if the animation is present and complete
		if (timeline.firstFrame > -1 && timeline.lastFrame > -1)
		{
			timeline.time = startTime == -1 ? Math.random() * timeline.duration : startTime;

			instance.elapsedTime = timeline.startTime + timeline.time;
			//have it set its 'paused' variable to false
			instance.play();
			//update the movieclip to make sure it is redrawn correctly at the next opportunity
			instance._tick();

			// Before we add the timeline, we should check to see
			// if there are no timelines, then start the enter frame
			// updating
			if (!Animator._hasTimelines()) Animator._startUpdate();

			_timelines.push(timeline);
			_timelinesMap[instance.id] = timeline;

			//start preloading the sound, for less wait time when the animation gets to it
			if (timeline.soundStart > 0)
			{
				Sound.instance.preloadSound(timeline.soundAlias);
			}

			return timeline;
		}

		if (DEBUG)
		{
			Debug.log("No event " + event + " was found, or it lacks an end, on this MovieClip " + instance);
		}

		if (onComplete)
		{
			onComplete.apply(null, onCompleteParams);
		}
		return null;
	};

	/**
	*   Creates the AnimatorTimeline for a given animation
	*
	*   @function _makeTimeline
	*   @param {easeljs.MovieClip} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {Function} onComplete The function to callback when we're done
	*   @param {Function} onCompleteParams Parameters to pass to onComplete function
	*   @param {Number} speed The speed at which to play the animation.
	*   @param {Object|String} audio Data about sound to sync the animation to.
	*   @param {Function} onCancelled The function to callback when cancelled
	*   @return {AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(instance, event, onComplete, onCompleteParams, speed,
										audio, onCancelled)
	{
		var timeline = new AnimatorTimeline();
		if (!Animator._canAnimate(instance))//not a movieclip
		{
			return timeline;
		}
		//make sure the movieclip doesn't play outside the control of Animator
		instance.advanceDuringTicks = false;
		var fps;
		//make sure the movieclip is framerate independent
		if (!instance.framerate)
		{
			fps = Application.instance.options.fps;
			if (!fps)
				fps = Application.instance.fps;
			if (!fps)
				fps = 15;
			instance.framerate = fps;
		}
		else
			fps = instance.framerate;//we'll want this for some math later
		timeline.instance = instance;
		timeline.event = event;
		timeline.onComplete = onComplete;
		timeline.onCompleteParams = onCompleteParams;
		timeline.onCancelled = onCancelled;
		timeline.speed = speed;
		if (audio && Sound)
		{
			timeline.playSound = true;
			if (typeof audio == "string")
			{
				timeline.soundStart = 0;
				timeline.soundAlias = audio;
			}
			else
			{
				timeline.soundStart = audio.start > 0 ? audio.start : 0;//seconds
				timeline.soundAlias = audio.alias;
			}
			timeline.useCaptions = Animator.captions &&
									Animator.captions.hasCaption(timeline.soundAlias);
		}

		//go through the list of labels (they are sorted by frame number)
		var labels = instance.getLabels();
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";

		var l;
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			l = labels[i];
			if (l.label == event)
			{
				timeline.firstFrame = l.position;
			}
			else if (l.label == stopLabel)
			{
				timeline.lastFrame = l.position;
				break;
			}
			else if (l.label == loopLabel)
			{
				timeline.lastFrame = l.position;
				timeline.isLooping = true;
				break;
			}
		}

		timeline.length = timeline.lastFrame - timeline.firstFrame;
		timeline.startTime = timeline.firstFrame / fps;
		timeline.duration = timeline.length / fps;

		return timeline;
	};

	/**
	*   Determines if a given instance can be animated by Animator, to allow things that aren't
	*	MovieClips from EaselJS to be animated if they share the same API. Note - 'id' is a property
	*	with a unique value for each createjs.DisplayObject. If a custom object is made that does
	*	not inherit from DisplayObject, it needs to not have an id that is identical to anything
	*	from EaselJS.
	*
	*   @function _canAnimate
	*   @param {easeljs.MovieClip} instance The object to check for animation properties.
	*   @return {Boolean} If the instance can be animated or not.
	*   @private
	*   @static
	*/
	Animator._canAnimate = function(instance)
	{
		if (instance instanceof createjs.MovieClip)//all createjs.MovieClips are A-OK
			return true;
		if (instance.framerate !== undefined &&//property - calculate timing
			instance.getLabels !== undefined &&//method - get framelabels
			instance.elapsedTime !== undefined &&//property - set time passed
			instance._tick !== undefined &&//method - update after setting elapsedTime
			instance.gotoAndStop !== undefined &&//method - stop at end of anim
			instance.play !== undefined &&//method - start playing
			instance.id !== undefined)//property - used to avoid duplication of timelines
			return true;
		if (DEBUG)
		{
			Debug.warn("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
		}
		return false;
	};

	/**
	*   Checks if animation exists
	*
	*   @function instanceHasAnimation
	*   @param {easeljs.MovieClip} instance The timeline to check
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @public
	*   @static
	*	@return {Boolean} does this animation exist?
	*/
	Animator.instanceHasAnimation = function(instance, event)
	{
		if(typeof instance.getLabels != "function") return false;
		var labels = instance.getLabels();
		var startFrame = -1, stopFrame = -1;
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		var l;
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			l = labels[i];
			if (l.label == event)
			{
				startFrame = l.position;
			}
			else if (l.label == stopLabel || l.label == loopLabel)
			{
				stopFrame = l.position;
				break;
			}
		}

		return startFrame >= 0 && stopFrame >= 0;
	};

	/**
	*   Get duration of animation event (or sequence of events) in seconds
	*
	*   @function getDuration
	*   @param {easeljs.MovieClip} instance The timeline to check
	*   @param {String|Array} event The frame label event (e.g. "onClose" to "onClose stop") or Array of event labels
	*   @public
	*   @static
	*	@return {Number} duration of animation event in seconds
	*/
	Animator.getDuration = function(instance, event)
	{
		if(typeof instance.getLabels != "function") return 0;
		if(Array.isArray(event))
		{
			var duration = 0;
			for (var j = 0, eventLength = event.length; j < eventLength; j++)
			{
				duration += Animator.getDuration(instance, event[j]);
			}
			return duration;
		}
		else
		{
			var labels = instance.getLabels();
			var startFrame = -1, stopFrame = -1;
			var stopLabel = event + "_stop";
			var loopLabel = event + "_loop";
			var l;
			for (var i = 0, labelsLength = labels.length; i < labelsLength; ++i)
			{
				l = labels[i];
				if (l.label == event)
				{
					startFrame = l.position;
				}
				else if (l.label == stopLabel || l.label == loopLabel)
				{
					stopFrame = l.position;
					break;
				}
			}
			if(startFrame >= 0 && stopFrame >= 0)
			{
				//make sure the movieclip has a framerate
				if (!instance.framerate)
				{
					var fps = Application.instance.options.fps;
					if (!fps)
						fps = Application.instance.fps;
					if (!fps)
						fps = 15;
					instance.framerate = fps;
				}

				return (stopFrame - startFrame) / instance.framerate;
			}
			else
				return 0;
		}
	};

	/**
	*   Stop the animation.
	*
	*   @function stop
	*   @param {createjs.MovieClip} instance The MovieClip to stop the action on
	*   @static
	*/
	Animator.stop = function(instance)
	{
		if (!_timelines) return;

		if (!_timelinesMap[instance.id])
		{
			if (DEBUG)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
			return;
		}
		var timeline = _timelinesMap[instance.id];
		Animator._remove(timeline, true);
	};

	/**
	*   Stop all current Animator animations.
	*   This is good for cleaning up all animation, as it doesn't do a callback on any of them.
	*
	*   @function stopAll
	*   @param {createjs.Container} [container] Specify a container to stop timelines
	*                                           contained within. This only checks one layer deep.
	*   @static
	*/
	Animator.stopAll = function(container)
	{
		if (!Animator._hasTimelines()) return;

		var timeline;
		var removedTimelines = _timelines.slice();

		for (var i=0, len = removedTimelines.length; i < len; i++)
		{
			timeline = removedTimelines[i];

			if (!container || container.contains(timeline.instance))
			{
				Animator._remove(timeline, true);
			}
		}
	};

	/**
	*   Remove a timeline from the stack
	*
	*   @function _remove
	*   @param {AnimatorTimeline} timeline
	*   @param {Boolean} doCancelled If we do the on complete callback
	*   @private
	*   @static
	*/
	Animator._remove = function(timeline, doCancelled)
	{
		var index = _removedTimelines.indexOf(timeline);
		if (index >= 0)
		{
			_removedTimelines.splice(index, 1);
		}

		index = _timelines.indexOf(timeline);

		// We can't remove an animation twice
		if (index < 0) return;

		var onComplete = timeline.onComplete, onCompleteParams = timeline.onCompleteParams,
			onCancelled = timeline.onCancelled;

		// Stop the animation
		timeline.instance.stop();

		//in most cases, if doOnComplete is true, it's a natural stop and the audio can
		//be allowed to continue
		if (doCancelled && timeline.soundInst)
			timeline.soundInst.stop();//stop the sound from playing

		// Remove from the stack
		_timelines.splice(index, 1);
		delete _timelinesMap[timeline.instance.id];

		//stop the captions, if relevant
		if (timeline.useCaptions)
		{
			Animator.captions.stop();
		}

		// Clear the timeline
		timeline.instance = null;
		timeline.event = null;
		timeline.onComplete = null;
		timeline.onCompleteParams = null;

		// Check if we should stop the update
		if (!Animator._hasTimelines()) Animator._stopUpdate();

		//call the appropriate callback
		if(doCancelled)
		{
			if(onCancelled)
				onCancelled();
		}
		else if (onComplete)
		{
			onComplete.apply(null, onCompleteParams);
		}
	};

	/**
	*   Pause all tweens which have been excuted by Animator.play()
	*
	*   @function pause
	*   @static
	*/
	Animator.pause = function()
	{
		if (!_timelines) return;

		if (_paused) return;

		_paused = true;

		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			_timelines[i].paused = true;
		}
		Animator._stopUpdate();
	};

	/**
	*   Resumes all tweens executed by the Animator.play()
	*
	*   @function resume
	*   @static
	*/
	Animator.resume = function()
	{
		if (!_timelines) return;

		if (!_paused) return;

		_paused = false;

		// Resume playing of all the instances
		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			_timelines[i].paused = false;
		}
		if (Animator._hasTimelines()) Animator._startUpdate();
	};

	/**
	*   Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
	*
	*   @function pauseInGroup
	*   @param {Boolean} paused If this should be paused or unpaused
	*   @param {createjs.Container} container The container to stop timelines contained within
	*   @static
	*/
	Animator.pauseInGroup = function(paused, container)
	{
		if (!Animator._hasTimelines() || !container) return;

		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			if (container.contains(_timelines[i].instance))
			{
				_timelines[i].paused = paused;
			}
		}
	};

	/**
	*   Get the timeline object for an instance
	*
	*   @function getTimeline
	*   @param {createjs.MovieClip} instance MovieClip
	*   @return {AnimatorTimeline} The timeline
	*   @static
	*/
	Animator.getTimeline = function(instance)
	{
		if (!Animator._hasTimelines()) return null;

		if (_timelinesMap[instance.id] !== undefined)
		{
			return _timelinesMap[instance.id];
		}
		return null;
	};

	/**
	*  Whether the Animator class is currently paused.
	*
	*  @function getPaused
	*  @return {Boolean} if we're paused or not
	*/
	Animator.getPaused = function()
	{
		return _paused;
	};

	/**
	*  Start the updating
	*
	*  @function _startUpdate
	*  @private
	*  @static
	*/
	Animator._startUpdate = function()
	{
		if (Application.instance)
			Application.instance.on("update", Animator._update);
	};

	/**
	*   Stop the updating
	*
	*   @function _stopUpdate
	*   @private
	*   @static
	*/
	Animator._stopUpdate = function()
	{
		if (Application.instance)
			Application.instance.off("update", Animator._update);
	};

	/**
	*   The update every frame
	*
	*   @function
	*   @param {int} elapsed The time in milliseconds since the last frame
	*   @private
	*   @static
	*/
	Animator._update = function(elapsed)
	{
		if (!_timelines) return;

		var delta = elapsed * 0.001;//ms -> sec

		var t, instance, audioPos;
		for(var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			instance = t.instance;
			if (t.paused) continue;

			if (t.soundInst)
			{
				if (t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					audioPos = t.soundInst.position * 0.001;
					if (audioPos < 0)
						audioPos = 0;
					t.time = t.soundStart + audioPos;

					if (t.useCaptions)
					{
						Animator.captions.seek(t.soundInst.position);
					}
					//if the sound goes beyond the animation, then stop the animation
					//audio animations shouldn't loop, because doing that properly is difficult
					//letting the audio continue should be okay though
					if (t.time >= t.duration)
					{
						instance.gotoAndStop(t.lastFrame);
						_removedTimelines.push(t);
						continue;
					}
				}
				//if sound is no longer valid, stop animation playback immediately
				else
				{
					_removedTimelines.push(t);
					continue;
				}
			}
			else
			{
				t.time += delta * t.speed;
				if (t.time >= t.duration)
				{
					if (t.isLooping)
					{
						t.time -= t.duration;
						if (t.onComplete)
							t.onComplete.apply(null, t.onCompleteParams);
					}
					else
					{
						instance.gotoAndStop(t.lastFrame);
						_removedTimelines.push(t);
						continue;
					}
				}
				if (t.playSound && t.time >= t.soundStart)
				{
					t.time = t.soundStart;
					t.soundInst = Sound.instance.play(
						t.soundAlias,
						onSoundDone.bind(this, t),
						onSoundStarted.bind(this, t)
					);
					if (t.useCaptions)
					{
						Animator.captions.play(t.soundAlias);
					}
				}
			}
			instance.elapsedTime = t.startTime + t.time;
			//because the movieclip only checks the elapsed time here (advanceDuringTicks is false),
			//calling advance() with no parameters is fine
			instance.advance();
		}
		for(i = 0; i < _removedTimelines.length; i++)
		{
			t = _removedTimelines[i];
			Animator._remove(t);
		}
	};

	/**
	*  The sound has been started
	*  @method onSoundStarted
	*  @private
	*  @param {AnimatorTimeline} timeline
	*/
	var onSoundStarted = function(timeline)
	{
		timeline.playSound = false;
		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};

	/**
	*  The sound is done
	*  @method onSoundDone
	*  @private
	*  @param {AnimatorTimeline} timeline
	*/
	var onSoundDone = function(timeline)
	{
		if (timeline.soundEnd > 0 && timeline.soundEnd > timeline.time)
			timeline.time = timeline.soundEnd;
		timeline.soundInst = null;
	};

	/**
	*  Check to see if we have timeline
	*
	*  @function _hasTimelines
	*  @return {Boolean} if we have timelines
	*  @private
	*  @static
	*/
	Animator._hasTimelines = function()
	{
		if (!_timelines) return false;
		return _timelines.length > 0;
	};

	/**
	*  String representation of this class
	*
	*  @function toString
	*  @return String
	*  @static
	*/
	Animator.toString = function()
	{
		return "[springroll.createjs.Animator]";
	};

	// Assign to the global namespace
	namespace('springroll').Animator = Animator;
	namespace('springroll.createjs').Animator = Animator;

}());
