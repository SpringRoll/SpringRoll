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
	*   @param {createjs.DisplayObject} instance The MovieClip or display object with the same API
	*                                            to animate.
	*   @param {String|Object|Array} eventList One of or an array of the following:
	*                            * objects with 'audio' and 'anim' properties, where audio is an
	*                                alias for Sound; or an object in the format
	*                                {alias:"MyAlias", start:300} with start being milliseconds into
	*                                the animation that the sound starts.
	*                            * strings - frame labels, e.g. "onClose" to "onClose_stop"
	*                            * numbers - milliseconds to wait
	*                            * functions - called upon reaching
	*   @param {Object|Function} [options] The object of optional parameters or onComplete
	*                                      callback function
	*   @param {Function} [options.onComplete] The callback function when the animation is done
	*   @param {int} [options.startTime=0] The time in milliseconds into the animation to start.
	*                                      A value of -1 makes the animation play at a random
	*                                      startTime. If used in a list, this only affects the first
	*                                      item in the list.
	*   @param {Number} [options.speed=1] The speed at which to play the animation.
	*   @param {Function} [options.onCancelled] A callback function for when an animation is stopped
	*                                           with Animator.stop() or to play another animation.
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.play = function(instance, eventList, options)
	{
		var onComplete, startTime, speed, audio, onCancelled;

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
		startTime = options.startTime;
		//convert into seconds, as that is what the time uses internally
		startTime = startTime ? startTime * 0.001 : 0;
		speed = options.speed || 1;
		onCancelled = options.onCancelled || null;
		if(typeof eventList == "string")
		{
			audio = options.audio || options.soundData || null;
			eventList = {anim: eventList, audio: audio};
		}
		if(!Array.isArray(eventList))
			eventList = [eventList];

		if (!_timelines)
			Animator.init();

		if (_timelinesMap[instance.id] !== undefined)
		{
			Animator.stop(instance);
		}
		var timeline = Animator._makeTimeline(instance, eventList, onComplete, speed, onCancelled);

		//if the animation is present and complete
		if (timeline.eventList && timeline.eventList.length >= 1)
		{
			timeline._nextItem();//advance the timeline to the first item
			timeline._time_sec = startTime == -1 ? Math.random() * timeline.duration : startTime;

			instance.elapsedTime = timeline.startTime + timeline._time_sec;
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

			return timeline;
		}

		if (DEBUG)
		{
			Debug.log("No valid animations found in " + eventList + " on this MovieClip " + instance);
		}

		if (onComplete)
		{
			onComplete();
		}
		return null;
	};

	/**
	*   Creates the AnimatorTimeline for a given animation
	*
	*   @function _makeTimeline
	*   @param {createjs.MovieClip} instance The timeline to animate
	*   @param {String} eventList The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {Function} onComplete The function to callback when we're done
	*   @param {Number} speed The speed at which to play the animation.
	*   @param {Function} onCancelled The function to callback when cancelled
	*   @return {AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(instance, eventList, onComplete, speed, onCancelled)
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
		timeline.eventList = [];//we'll create a duplicate event list with specific info
		timeline.onComplete = onComplete;
		timeline.onCancelled = onCancelled;
		timeline.speed = speed;
		var labels = instance.getLabels();
		var anim, audio;
		for(var j = 0, jLen = eventList.length; j < jLen; ++j)
		{
			var listItem = eventList[j];
			switch(typeof listItem)
			{
				case "string":
					anim = listItem;
					audio = null;
					break;
				case "object":
					anim = listItem.anim;
					audio = listItem.audio;
					break;
				case "number":
					//convert to seconds
					timeline.eventList.push(listItem * 0.001);
					continue;
				case "function":
					//add functions directly
					timeline.eventList.push(listItem);
					continue;
				default:
					//anything else we'll ignore
					continue;
			}
			
			//go through the list of labels (they are sorted by frame number)
			var stopLabel = anim + "_stop";
			var loopLabel = anim + "_loop";

			var l, first = -1, last = -1, loop = false;
			for(var i = 0, len = labels.length; i < len; ++i)
			{
				l = labels[i];
				if (l.label == anim)
				{
					first = l.position;
				}
				else if (l.label == stopLabel)
				{
					last = l.position;
					break;
				}
				else if (l.label == loopLabel)
				{
					last = l.position;
					loop = true;
					break;
				}
			}
			var animData;
			if(first >= 0 && last > 0)
			{
				animData =
				{
					first: first,
					last: last,
					loop: loop
				};
			}
			else
			{
				//if the animation doesn't exist, skip it
				continue;
			}
			//figure out audio stuff if it is okay to use
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
					animData.alias = alias;
					animData.start = start;
				
					animData.useCaptions = Animator.captions && Animator.captions.hasCaption(alias);
				}
			}
			timeline.eventList.push(animData);
		}

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
	*   @param {createjs.MovieClip} instance The object to check for animation properties.
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
	*   @param {createjs.MovieClip} instance The timeline to check
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
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
	*   @param {createjs.MovieClip} instance The timeline to check
	*   @param {String|Array} event The frame label event or array, in the format that play() uses.
	*   @public
	*   @static
	*	@return {Number} Duration of animation event in milliseconds
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
			if(typeof event == "number")
				return event;
			else if(typeof event == "object" && event.anim)
				event = event.anim;
			else if(typeof event != "string")
				return 0;
			
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
			if(startFrame >= 0 && stopFrame > 0)
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

				return (stopFrame - startFrame) / instance.framerate * 1000;
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
		
		var timeline = _timelinesMap[instance.id];
		if (!timeline)
		{
			if (DEBUG)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
			return;
		}
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

		var onComplete = timeline.onComplete, onCancelled = timeline.onCancelled;

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
		timeline.eventList = null;
		timeline.onComplete = null;
		timeline.onCancelled = null;

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
			onComplete();
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

		var t, instance, audioPos, extraTime, onNext;
		for(var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			instance = t.instance;
			if (t.paused) continue;
			
			//we'll use this to figure out if the timeline is on the next item
			//to avoid code repetition
			onNext = false;
			extraTime = 0;

			if (t.soundInst)
			{
				if (t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					audioPos = t.soundInst.position * 0.001;
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
						instance.gotoAndStop(t.lastFrame);
						extraTime = t._time_sec - t.duration;
						t._nextItem();
						if(t.complete)
						{
							_removedTimelines.push(t);
							continue;
						}
						else
						{
							onNext = true;
						}
					}
				}
				//if sound is no longer valid, stop animation playback immediately
				else
				{
					t._nextItem();
					if(t.complete)
					{
						_removedTimelines.push(t);
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
				t._time_sec += delta * t.speed;
				if (t._time_sec >= t.duration)
				{
					if (t.isLooping)
					{
						t._time_sec -= t.duration;
						//call the on complete function each time
						if (t.onComplete)
							t.onComplete();
					}
					else
					{
						extraTime = t._time_sec - t.duration;
						instance.gotoAndStop(t.lastFrame);
						t._nextItem();
						if(t.complete)
						{
							_removedTimelines.push(t);
							continue;
						}
						else
						{
							onNext = true;
						}
					}
				}
				if (t.playSound && t._time_sec >= t.soundStart)
				{
					t._time_sec = t.soundStart;
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
			if(onNext)
			{
				t._time_sec += extraTime;
				if(t.firstFrame >= 0)
					instance.gotoAndPlay(t.firstFrame);
				if(t.playSound && t._time_sec >= t.soundStart)
				{
					t._time_sec = t.soundStart;
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
			//if on an animation, not a pause
			if(t.firstFrame >= 0)
			{
				instance.elapsedTime = t.startTime + t._time_sec;
				//because the movieclip only checks the elapsed time here
				//(advanceDuringTicks is false),
				//calling advance() with no parameters is fine
				instance.advance();
			}
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
		if (timeline.soundEnd > 0 && timeline.soundEnd > timeline._time_sec)
			timeline._time_sec = timeline.soundEnd;
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
