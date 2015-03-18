/*! SpringRoll 0.2.0 */
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
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function(undefined)
{
	// Imports
	var Application = include('springroll.Application'),
		AnimatorTimeline = include('springroll.easeljs.AnimatorTimeline'),
		Debug,
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
	 *	Sets the variables of the Animator to their defaults. Use when _timelines is null,
	 *	if the Animator data was cleaned up but was needed again later.
	 *
	 *	@method init
	 *	@static
	 */
	Animator.init = function()
	{
		_timelines = [];
		_removedTimelines = [];
		_timelinesMap = {};
		_paused = false;

		Sound = include('springroll.Sound', false);
		Debug = include('springroll.Debug', false);
	};

	/**
	 *	Stops all animations and cleans up the variables used.
	 *
	 *	@method destroy
	 *	@static
	 */
	Animator.destroy = function()
	{
		Animator.stopAll(null, true);
		Animator.captions = null;

		_timelines = null;
		_removedTimelines = null;
		_timelinesMap = null;
	};

	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);

	/**
	 *   Play an animation for a frame label event
	 *
	 *   @method play
	 *   @param {createjs.DisplayObject} instance The MovieClip or display object with the same API
	 *                                            to animate.
	 *   @param {String|Object|Array} eventList One of or an array of the following
	 *   * objects in the format:
	 *
	 *       {
	 *           anim:"myAnim",
	 *           start:0,
	 *           speed:1,
	 *           audio:{alias:"MyAlias", start:300}
	 *       }
	 *
	 *       * anim is the frame label of the animation to play, e.g. "onClose" to "onClose_stop".
	 *       * start is milliseconds into the animation to start (0 if omitted). A value of -1
	 *           starts from a random time in the animation.
	 *       * speed is a multiplier for the animation speed (1 if omitted).
	 *       * audio is audio to sync the animation to using springroll.Sound. audio can be a String
	 *           if you want the audio to start 0 milliseconds into the animation.
	 *   * strings - frame labels, e.g. "onClose" to "onClose_stop".
	 *   * numbers - milliseconds to wait.
	 *   * functions - called upon reaching, followed immediately by the next item.
	 *   @param {Function} [onComplete] The callback function for when the animation is done.
	 *   @param {Function|Boolean} [onCancelled] A callback function for when an animation is
	 *                                           stopped with Animator.stop() or to play another
	 *                                           animation. A value of 'true' uses onComplete for
	 *                                           onCancelled.
	 *   @return {springroll.easeljs.AnimatorTimeline} The Timeline object that represents this play() call.
	 *   @static
	 */
	Animator.play = function(instance, eventList, onComplete, onCancelled)
	{
		var audio, options;

		if (onComplete && typeof onComplete != "function")
		{
			options = onComplete;
			onComplete = options.onComplete;
			onCancelled = options.onCancelled;
		}
		else if (onCancelled === true)
		{
			onCancelled = onComplete;
		}
		//deprecation fallback
		if (typeof eventList == "string" && options)
		{
			audio = options.audio || options.soundData || null;
			eventList = {
				anim: eventList,
				audio: audio
			};
		}
		if (!Array.isArray(eventList))
			eventList = [eventList];

		if (!_timelines)
			Animator.init();

		if (_timelinesMap[instance.id] !== undefined)
		{
			Animator.stop(instance);
		}
		var timeline = Animator._makeTimeline(instance, eventList, onComplete, onCancelled);

		//if the animation is present and complete
		if (timeline.eventList && timeline.eventList.length >= 1)
		{
			timeline._nextItem(); //advance the timeline to the first item

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

		if (true && Debug)
		{
			var label = eventList[0].anim ||
				eventList[0].audio ||
				eventList[0] ||
				'<label unknown>';
			var readableInstance = instance.id ||
				instance.name ||
				instance.key ||
				instance.label ||
				instance.toString() ||
				instance;
			Debug.groupCollapsed("No valid animation label \"" + label + "\" in MovieClip " + readableInstance);
			Debug.red("eventList:", eventList);
			Debug.red("instance:", instance);
			Debug.trace("Animator.play");
			Debug.groupEnd();
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
	 *   @method _makeTimeline
	 *   @param {createjs.MovieClip} instance The instance to animate
	 *   @param {Array} eventList List of animation events
	 *   @param {Function} onComplete The function to callback when we're done
	 *   @param {Function} onCancelled The function to callback when cancelled
	 *   @return {springroll.easeljs.AnimatorTimeline} The Timeline object
	 *   @private
	 *   @static
	 */
	Animator._makeTimeline = function(instance, eventList, onComplete, onCancelled)
	{
		var timeline = new AnimatorTimeline();
		if (!Animator.canAnimate(instance)) //not a movieclip
		{
			if (true && Debug)
			{
				Debug.warn("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
			}
			return timeline;
		}
		//make sure the movieclip doesn't play outside the control of Animator
		instance.tickEnabled = false;
		var fps;
		//make sure the movieclip is framerate independent
		if (!instance.framerate)
		{
			fps = Application.instance.options.fps;
			if (!fps)
				fps = 15;
			instance.framerate = fps;
		}
		else
			fps = instance.framerate; //we'll want this for some math later
		timeline.instance = instance;
		timeline.eventList = []; //we'll create a duplicate event list with specific info
		timeline.onComplete = onComplete;
		timeline.onCancelled = onCancelled;
		timeline.speed = speed;
		var labels = instance.getLabels();
		var anim, audio, start, speed, alias;
		for (var j = 0, jLen = eventList.length; j < jLen; ++j)
		{
			var listItem = eventList[j];
			switch (typeof listItem)
			{
				case "string":
					anim = listItem;
					audio = null;
					start = 0;
					speed = 1;
					break;
				case "object":
					anim = listItem.anim;
					audio = listItem.audio;
					//convert into seconds, as that is what the time uses internally
					start = typeof listItem.start == "number" ? listItem.start * 0.001 : 0;
					speed = listItem.speed > 0 ? listItem.speed : 1;
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

			var l, first = -1,
				last = -1,
				loop = false;
			for (var i = 0, len = labels.length; i < len; ++i)
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
			if (first >= 0 && last > 0)
			{
				animData = {
					first: first,
					last: last,
					loop: loop,
					speed: speed,
					animStart: start
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
				if (typeof audio == "string")
				{
					start = 0;
					alias = audio;
				}
				else
				{
					start = audio.start > 0 ? audio.start * 0.001 : 0; //seconds
					alias = audio.alias;
				}
				if (Sound.instance.exists(alias))
				{
					Sound.instance.preloadSound(alias);
					animData.alias = alias;
					animData.audioStart = start;

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
	 *   @method canAnimate
	 *   @param {createjs.DisplayObject} instance The object to check for animation properties.
	 *   @return {Boolean} If the instance can be animated or not.
	 *   @static
	 */
	Animator.canAnimate = function(instance)
	{
		if (!instance)
			return false;
		if (instance instanceof createjs.MovieClip) //all createjs.MovieClips are A-OK
			return true;
		if (instance.framerate !== undefined && //property - calculate timing
			instance.getLabels !== undefined && //method - get framelabels
			instance.elapsedTime !== undefined && //property - set time passed
			instance._tick !== undefined && //method - update after setting elapsedTime
			instance.gotoAndStop !== undefined && //method - stop at end of anim
			instance.play !== undefined && //method - start playing
			instance.id !== undefined) //property - used to avoid duplication of timelines
			return true;

		return false;
	};

	/**
	 *   Determines if a given instance can be animated by Animator, to allow things that aren't
	 *	MovieClips from EaselJS to be animated if they share the same API. Note - 'id' is a property
	 *	with a unique value for each createjs.DisplayObject. If a custom object is made that does
	 *	not inherit from DisplayObject, it needs to not have an id that is identical to anything
	 *	from EaselJS.
	 *
	 *   @method _canAnimate
	 *   @deprecated Use the public method Animator.canAnimate
	 *   @param {createjs.DisplayObject} instance The object to check for animation properties.
	 *   @return {Boolean} If the instance can be animated or not.
	 *   @private
	 *   @static
	 */
	Animator._canAnimate = function(instance)
	{
		return Animator.canAnimate(instance);
	};

	/**
	 *   Checks if animation exists
	 *
	 *   @method instanceHasAnimation
	 *   @param {createjs.MovieClip} instance The timeline to check
	 *   @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 *   @public
	 *   @static
	 *	@return {Boolean} does this animation exist?
	 */
	Animator.instanceHasAnimation = function(instance, event)
	{
		if (typeof instance.getLabels != "function") return false;
		var labels = instance.getLabels();
		var startFrame = -1,
			stopFrame = -1;
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		var l;
		for (var i = 0, len = labels.length; i < len; ++i)
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
	 *   @method getDuration
	 *   @param {createjs.MovieClip} instance The timeline to check
	 *   @param {String|Array} event The frame label event or array, in the format that play() uses.
	 *   @public
	 *   @static
	 *	@return {Number} Duration of animation event in milliseconds
	 */
	Animator.getDuration = function(instance, event)
	{
		if (typeof instance.getLabels != "function") return 0;
		if (Array.isArray(event))
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
			if (typeof event == "number")
				return event;
			else if (typeof event == "object" && event.anim)
				event = event.anim;
			else if (typeof event != "string")
				return 0;

			var labels = instance.getLabels();
			var startFrame = -1,
				stopFrame = -1;
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
			if (startFrame >= 0 && stopFrame > 0)
			{
				//make sure the movieclip has a framerate
				if (!instance.framerate)
				{
					var fps = Application.instance.options.fps;
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
	 *   @method stop
	 *   @param {createjs.MovieClip} instance The MovieClip to stop the action on
	 *   @param {Boolean} [removeCallbacks=false] Completely disregard the on complete or
	 *                                            on cancelled callback of this animation.
	 *   @static
	 */
	Animator.stop = function(instance, removeCallbacks)
	{
		if (!_timelines) return;

		var timeline = _timelinesMap[instance.id];
		if (!timeline)
		{
			return;
		}
		if (removeCallbacks)
		{
			timeline.onComplete = timeline.onCancelled = null;
		}
		Animator._remove(timeline, true);
	};

	/**
	 *   Stop all current Animator animations.
	 *   This is good for cleaning up all animation, as it doesn't do a callback on any of them.
	 *
	 *   @method stopAll
	 *   @param {createjs.Container} [container] Specify a container to stop timelines
	 *          contained within. This only checks one layer deep.
	 *   @param {Boolean} [removeCallbacks=false] Completely disregard the on complete or
	 *                                            on cancelled callback of the current animations.
	 *   @static
	 */
	Animator.stopAll = function(container, removeCallbacks)
	{
		if (!Animator._hasTimelines()) return;

		var timeline;
		var removedTimelines = _timelines.slice();

		for (var i = 0, len = removedTimelines.length; i < len; i++)
		{
			timeline = removedTimelines[i];

			if (!container || container.contains(timeline.instance))
			{
				if (removeCallbacks)
				{
					timeline.onComplete = timeline.onCancelled = null;
				}
				Animator._remove(timeline, true);
			}
		}
	};

	/**
	 *   Remove a timeline from the stack
	 *
	 *   @method _remove
	 *   @param {springroll.easeljs.AnimatorTimeline} timeline
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

		var onComplete = timeline.onComplete,
			onCancelled = timeline.onCancelled;

		// Stop the animation
		timeline.instance.stop();

		//in most cases, if doOnComplete is true, it's a natural stop and the audio can
		//be allowed to continue
		if (doCancelled && timeline.soundInst)
			timeline.soundInst.stop(); //stop the sound from playing

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
		if (doCancelled)
		{
			if (onCancelled)
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
	 *   @method pause
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
	 *   @method resume
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
	 *   @method pauseInGroup
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
	 *   @method getTimeline
	 *   @param {createjs.MovieClip} instance MovieClip
	 *   @return {springroll.easeljs.AnimatorTimeline} The timeline
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
	 *  @method getPaused
	 *  @return {Boolean} if we're paused or not
	 */
	Animator.getPaused = function()
	{
		return _paused;
	};

	/**
	 *  Start the updating
	 *
	 *  @method _startUpdate
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
	 *   @method _stopUpdate
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
	 *   @method
	 *   @param {int} elapsed The time in milliseconds since the last frame
	 *   @private
	 *   @static
	 */
	Animator._update = function(elapsed)
	{
		if (!_timelines) return;

		var delta = elapsed * 0.001; //ms -> sec

		var t, instance, audioPos, extraTime, onNext;
		for (var i = _timelines.length - 1; i >= 0; --i)
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
						if (t.complete)
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
					if (t.complete)
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
						if (t.firstFrame >= 0)
							instance.gotoAndStop(t.lastFrame);
						t._nextItem();
						if (t.complete)
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
			if (onNext)
			{
				t._time_sec += extraTime;
				if (t.firstFrame >= 0)
					instance.gotoAndPlay(t.firstFrame);
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
			//if on an animation, not a pause
			if (t.firstFrame >= 0)
			{
				instance.elapsedTime = t.startTime + t._time_sec;
				//because the movieclip only checks the elapsed time here (tickEnabled is false),
				//calling advance() with no parameters is fine - it won't advance the time
				instance.advance();
			}
		}
		for (i = 0; i < _removedTimelines.length; i++)
		{
			t = _removedTimelines[i];
			Animator._remove(t);
		}
	};

	/**
	 *  The sound has been started
	 *  @method onSoundStarted
	 *  @private
	 *  @param {springroll.easeljs.AnimatorTimeline} timeline
	 */
	var onSoundStarted = function(timeline, playIndex)
	{
		if (timeline.listIndex != playIndex) return;

		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};

	/**
	 *  The sound is done
	 *  @method onSoundDone
	 *  @private
	 *  @param {springroll.easeljs.AnimatorTimeline} timeline
	 */
	var onSoundDone = function(timeline, playIndex, soundAlias)
	{
		if (Animator.captions && Animator.captions.currentAlias == soundAlias)
			Animator.captions.stop();

		if (timeline.listIndex != playIndex) return;

		if (timeline.soundEnd > 0 && timeline.soundEnd > timeline._time_sec)
			timeline._time_sec = timeline.soundEnd;
		timeline.soundInst = null;
	};

	/**
	 *  Check to see if we have timeline
	 *
	 *  @method _hasTimelines
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
	 *  @method toString
	 *  @return String
	 *  @static
	 */
	Animator.toString = function()
	{
		return "[springroll.easeljs.Animator]";
	};

	// Assign to the global namespace
	namespace('springroll').Animator = Animator;
	namespace('springroll.easeljs').Animator = Animator;

}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function(undefined) {

	"use strict";

	/**
	*  Handles a spritesheet. File extensions and folder paths are dropped from frame names upon loading.
	*  @class TextureAtlas
	*  @constructor
	*  @param {Image|HTMLCanvasElement|Array} image The image that all textures pull from.
	*       This can also be an array of images, if the TextureAtlas should be built from several spritesheets.
	*  @param {Object|Array} spritesheetData The JSON object describing the frames in the atlas.
	*       This is expected to fit the JSON Hash format as exported from TexturePacker.
	*       This can also be an array of data objects, if the TextureAtlas should be built from several spritesheets.
	*/
	var TextureAtlas = function(image, spritesheetData)
	{
		/**
		*  The an array of image elements (Image|HTMLCanvasElement) that frames in texture atlas use.
		*  @property {Array} _image
		*  @private
		*/
		if(Array.isArray(image))
		{
			this._images = image;
		}
		else
		{
			this._images = [image];
			spritesheetData = [spritesheetData];
		}

		/**
		*  The dictionary of Textures that this atlas consists of.
		*  @property {Object} frames
		*/
		this.frames = {};

		for(var i = 0; i < this._images.length; ++i)
		{
			image = this._images[i];

			var dataFrames = spritesheetData[i].frames;
			for(var name in dataFrames)
			{
				var data = dataFrames[name];
				var index = name.lastIndexOf(".");
				if(index > 0)
					name = name.substring(0, index);//strip off any ".png" or ".jpg" at the end
				index = name.lastIndexOf("/");
				if(index < 0)
					name = name.substring(index + 1);//strip off any folder structure included in the name
				this.frames[name] = new Texture(image, data);
			}
		}
	};
	
	// Extend Object
	var p = TextureAtlas.prototype = {};

	/**
	*  Gets a frame by name.
	*  @method getFrame
	*  @param {String} name The frame name to get.
	*  @return {createjs.TextureAtlas.Texture} The texture by that name, or null if it doesn't exist.
	*/
	p.getFrame = function(name)
	{
		return this.frames[name] || null;
	};

	/**
	*  Get an array of Textures that match a specific name. If a frame in a sequence is not in the atlas,
	*  the previous frame in the sequence is used in place of it.
	*  @method getFrames
	*  @param {String} name The base name of all frames to look for, like "anim_#" to search for an animation exported
	*         as anim_0001.png (the ".png" is dropped when the TextureAtlas is loaded).
	*  @param {int} numberMin The number to start on while looking for frames. Flash PNG sequences generally start at 1.
	*  @param {int} numberMax The number to go until while looking for frames.
	*         If your animation runs from frame 0001 to frame 0014, numberMax would be 14.
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as anim_0001.png
	*  @param {Array} [outArray] If already using an array, this can fill it instead of creating a new one.
	*  @return {Array} The collection of createjs.TextureAtlas.Textures.
	*/
	p.getFrames = function(name, numberMin, numberMax, maxDigits, outArray)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		if(!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
		var zeros = [];//preceding zeroes array
		var compares = [];//powers of 10 array for determining how many preceding zeroes to use
		var i, c;
		for(i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for(var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length;//the length of the compar

		var prevTex;//the previous Texture, so we can place the same object in multiple times to control animation rate
		var len;
		for(i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
			for(c = 0; c < compareLength; ++c)
			{
				if(i < compares[c])
				{
					num = zeros[c] + i;
					break;
				}
			}
			if(!num)
				num = i.toString();
			
			//If the texture doesn't exist, use the previous texture - this should allow us to use fewer textures
			//that are in fact the same, if those textures were removed before making the spritesheet
			var texName = name.replace("#", num);
			var tex = this.frames[texName];
			if(tex)
				prevTex = tex;
			if(prevTex)
				outArray.push(prevTex);
		}

		return outArray;
	};

	/**
	*  Destroys the TextureAtlas by nulling the image and frame dictionary references.
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.image = null;
		this.frames = null;
	};

	namespace("createjs").TextureAtlas = TextureAtlas;
	namespace("springroll.easeljs").TextureAtlas = TextureAtlas;

	/**
	*  A Texture - a specific portion of an image that can then be drawn by a Bitmap.
	*  This class is hidden within TextureAtlas, and can't be manually created.
	*  @class Texture
	*/
	var Texture = function(image, data)
	{
		/**
		*  The image element that this texture references.
		*  @property {Image|HTMLCanvasElement} image
		*/
		this.image = image;
		var f = data.frame;
		/**
		*  The frame rectangle within the image.
		*  @property {createjs.Rectangle} frame
		*/
		this.frame = new createjs.Rectangle(f.x, f.y, f.w, f.h);
		/**
		*  If this texture has been trimmed.
		*  @property {Boolean} trimmed
		*/
		this.trimmed = data.trimmed;
		/**
		*  The offset that the trimmed sprite should be placed at to restore it to the untrimmed position.
		*  @property {createjs.Point} offset
		*/
		this.offset = new createjs.Point(data.spriteSourceSize.x, data.spriteSourceSize.y);
		/**
		*  The width of the untrimmed texture.
		*  @property {Number} width
		*/
		this.width = data.sourceSize.w;
		/**
		*  The height of the untrimmed texture.
		*  @property {Number} height
		*/
		this.height = data.sourceSize.h;
	};
}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function(undefined) {

	"use strict";
	
	var Container = include("createjs.Container");

	/**
	*  A class similar to createjs.MovieClip, but made to play animations from a
	*  springroll.easeljs.TextureAtlas. The EaselJS Sprite class requires a spritesheet with equal
	*  sized and spaced frames. By using TextureAtlas, you can use a much smaller spritesheet,
	*  sprites on screen with fewer extra transparent pixels, and use the same API as MovieClip.
	*
	*  Format for BitmapMovieClip data:
	*
	*	{
	*		fps:30,
	*		labels:
	*		{
	*			animStart:0,
	*			animStart_loop:15
	*		},
	*		origin:{ x: 20, y:30 },
	*		frames:
	*		[
	*			{
	*				name:"myAnim#",
	*				min:1,
	*				max:20,
	*				digits:4
	*			}
	*		],
	*		scale:1
	*	}
	*
	*  The example object describes a 30 fps animation that is 20 frames long, and was originally
	*  myAnim0001.png->myAnim0020.png, with frame labels on the first and 16th frames. 'digits' is
	*  optional, and defaults to 4.
	*
	*  @class BitmapMovieClip
	*  @extends createjs.Container
	*  @constructor
	*  @param {TextureAtlas} [atlas] The texture atlas to pull frames from.
	*  @param {Object} [data] Initialization data
	*  @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the
	*                          current framerate.
	*  @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in
	*                                playing animations.
	*  @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	*  @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	*  @param {String} [data.frames.name] The name to use for the frame sequence. This should
	*                                     include a "#" to be replaced with the image number.
	*  @param {int} [data.frames.min] The first frame number in the frame sequence.
	*  @param {int} [data.frames.max] The last frame number in the frame sequence.
	*  @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames,
	*                                      e.g. myAnim0001 has 4 digits.
	*  @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4
	*                                 means the art was increased in size to 140% before exporting
	*                                 and should be scaled back down before drawing to the screen.
	*/
	var BitmapMovieClip = function(atlas, data)
	{
		Container.call(this);
		this.mouseChildren = false;//mouse events should reference this, not the child bitmap
		this._bitmap = new createjs.Bitmap();
		this.addChild(this._bitmap);
		if(atlas && data)
			this.init(atlas, data);
	};

	var p = extend(BitmapMovieClip, Container);
	var s = Container.prototype;

	//==== Public properties =====

	/**
	 * Indicates whether this BitmapMovieClip should loop when it reaches the end of its timeline.
	 * @property loop
	 * @type Boolean
	 * @default true
	 */
	p.loop = true;

	/**
	 * The current frame of the movieclip.
	 * @property currentFrame
	 * @type Number
	 * @default 0
	 * @readonly
	 */
	p.currentFrame = 0;

	/**
	 * If true, the BitmapMovieClip's position will not advance when ticked.
	 * @property paused
	 * @type Boolean
	 * @default false
	 */
	p.paused = false;

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for
	 * the BitmapMovieClip will cause it to advance based on elapsed time between ticks as
	 * appropriate to maintain the target framerate.
	 *
	 * For example, if a BitmapMovieClip with a framerate of 10 is placed on a Stage being updated
	 * at 40fps, then the BitmapMovieClip will advance roughly one frame every 4 ticks. This will
	 * not be exact, because the time between each tick will vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta"
	 * property) being passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate', {
		get: function() {
			return this._framerate;
		},
		set: function(value) {
			if(value > 0)
			{
				this._framerate = value;
				this._duration = value ? this._frames.length / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in
	 * seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime', {
		get: function() {
			return this._t;
		},
		set: function(value) {
			this._t = value;
		}
	});

	/**
	 * (Read-Only) The total number of frames in the timeline
	 * @property totalFrames
	 * @type Int
	 * @default 0
	 * @readOnly
	 */
	Object.defineProperty(p, 'totalFrames', {
		get: function() {
			return this._frames.length;
		}
	});

	/**
	 * (Read-Only) The Texture of the current frame
	 * @property currentTexture
	 * @type createjs.TextureAtlas.Texture
	 * @readOnly
	 */
	Object.defineProperty(p, 'currentTexture', {
		get: function() {
			return this._currentTexture;
		}
	});

	//==== Private properties =====

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for
	 * the BitmapMovieClip will cause it to advance based on elapsed time between ticks as
	 * appropriate to maintain the target framerate.
	 *
	 * @property _framerate
	 * @type {Number}
	 * @default 0
	 * @private
	 **/
	p._framerate = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the total time in seconds for the
	 * animation.
	 *
	 * @property _duration
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._duration = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in
	 * seconds.
	 * @property _t
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._t = 0;

	/**
	 * @property _prevPosition
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._prevPosition = 0;

	/**
	 * The Bitmap used to render the current frame of the animation.
	 * @property _bitmap
	 * @type createjs.Bitmap
	 * @private
	 */
	p._bitmap = 0;

	/**
	 * An array of frame labels.
	 * @property _labels
	 * @type Array
	 * @private
	 */
	p._labels = 0;

	/**
	 * An array of textures.
	 * @property _frames
	 * @type Array
	 * @private
	 */
	p._frames = null;

	/**
	 * The current texture.
	 * @property _currentTexture
	 * @type createjs.TextureAtlas.Texture
	 * @private
	 */
	p._currentTexture = null;

	/**
	 * The origin point of the BitmapMovieClip.
	 * @property _origin
	 * @type createjs.Point
	 * @private
	 */
	p._origin = null;

	/**
	 * A scale to apply to the images in the BitmapMovieClip
	 * to restore normal size (if spritesheet was exported at a smaller or larger size).
	 * @property _scale
	 * @type Number
	 * @private
	 */
	p._scale = 1;

	//==== Public Methods =====

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a
	 * canvas. This does not account for whether it would be visible within the boundaries of the
	 * stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		// children are placed in draw, so we can't determine if we have content.
		return !!(this.visible && this.alpha > 0 && this.scaleX !== 0 && this.scaleY !== 0);
	};

	/**
	 * Draws the display object into the specified context ignoring its visible, alpha, shadow, and
	 * transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current
	 *                              cache. For example, used for drawing the cache (to prevent it
	 *                              from simply drawing an existing cache back into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		s.draw.call(this, ctx, ignoreCache);//Container's call
		return true;
	};

	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. If 0 or null, time is not
	 *                        advanced but the timeline is still updated.
	 * @method advance
	*/
	p.advance = function(time) {
		if(!this.paused)
		{
			if(this._framerate > 0)
			{
				if(time)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.loop ? this._t - this._duration : this._duration;
				this._prevPosition = Math.floor(this._t * this._framerate);
				if(this._prevPosition >= this._frames.length)
					this._prevPosition = this._frames.length - 1;
			}
			else
				this._prevPosition = this._prevPosition + 1;
			this._updateTimeline();
		}
	};
	
	/**
	 * Returns a sorted list of the labels defined on this BitmapMovieClip. Shortcut to TweenJS:
	 * Timeline.getLabels();
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame)
	 *                         properties.
	 **/
	p.getLabels = function() {
		return this._labels;
	};
	
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS:
	 * Timeline.getCurrentLabel() for more information.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 **/
	p.getCurrentLabel = function() {
		var labels = this._labels;
		var current = null;
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			if(labels[i].position <= this.currentFrame)
				current = labels[i].label;
			else
				break;
		}
		return current;
	};

	/**
	 *  Initializes or re-initializes the BitmapMovieClip.
	 *  @method init
	 *  @param {TextureAtlas} atlas The texture atlas to pull frames from.
	 *  @param {Object} data Initialization data
	 *  @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the
	 *                          current framerate.
	 *  @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in
	 *                                playing animations.
	 *  @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 *  @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 *  @param {String} [data.frames.name] The name to use for the frame sequence. This should
	 *                                     include a "#" to be replaced with the image number.
	 *  @param {int} [data.frames.min] The first frame number in the frame sequence.
	 *  @param {int} [data.frames.max] The last frame number in the frame sequence.
	 *  @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames,
	 *                                      e.g. myAnim0001 has 4 digits.
	 *  @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4
	 *                                 means the art was increased in size to 140% before exporting
	 *                                 and should be scaled back down before drawing to the screen.
	 **/
	p.init = function(atlas, data)
	{
		//collect the frame labels
		var labels = this._labels = [];
		if(data.labels)
		{
			for(var name in data.labels)
			{
				labels.push({label:name, position: data.labels[name]});
			}
			labels.sort(labelSorter);
		}
		//collect the frames
		this._frames = [];
		for(var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];
			atlas.getFrames(frameSet.name, frameSet.min, frameSet.max, frameSet.digits, this._frames);
		}
		//set up the framerate
		if(data.fps)
			this.framerate = data.fps;
		else if(this._framerate)
			this.framerate = this._framerate;
		if(data.scale && data.scale > 0)
			this._scale = 1 / data.scale;
		else
			this._scale = 1;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
		if(data.origin)
			this._origin = new createjs.Point(data.origin.x * this._scale, data.origin.y * this._scale);
		else
			this._origin = new createjs.Point();
	};

	function labelSorter(a, b)
	{
		return a.position - b.position;
	}

	/**
	*	Copies the labels, textures, origin, and framerate from another BitmapMovieClip.
	*	The labels and textures are copied by reference, instead of a deep copy.
	*	@method copyFrom
	*	@param {BitmapMovieClip} other The movieclip to copy data from.
	*/
	p.copyFrom = function(other)
	{
		this._frames = other._frames;
		this._labels = other._labels;
		this._origin = other._origin;
		this._framerate = other._framerate;
		this._duration = other._duration;
		this._scale = other._scale;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
	};

	/**
	*	Destroys the BitmapMovieClip, removing all children and nulling all reference variables.
	*	@method destroy
	*/
	p.destroy = function()
	{
		this.removeAllChildren();
		this._bitmap = null;
		this._frames = null;
		this._origin = null;
		this._currentTexture = null;
	};

	//===== Private Methods =====

	/**
	 * @method _tick
	 * @param {Object} props Properties to copy to the DisplayObject {{#crossLink "DisplayObject/tick"}}{{/crossLink}} event object.
	 * function.
	 * @protected
	 **/
	p._tick = function(props) {
		this.advance(props&&props.delta);
		s._tick.call(this, props);
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = null;
		if(typeof positionOrLabel == "string")
		{
			var labels = this._labels;
			for(var i = 0, len = labels.length; i < len; ++i)
			{
				if(labels[i].label == positionOrLabel)
				{
					pos = labels[i].position;
					break;
				}
			}
		}
		else
			pos = positionOrLabel;
		if (pos === null) { return; }
		this._prevPosition = pos;
		if(this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};

	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function() {
		if(this._prevPosition < 0)
			this._prevPosition = 0;
		else if(this._prevPosition >= this._frames.length)
			this._prevPosition = this._frames.length - 1;
		this.currentFrame = this._prevPosition;
		if(this._currentTexture != this._frames[this.currentFrame])
		{
			var tex = this._currentTexture = this._frames[this.currentFrame];
			this._bitmap.image = tex.image;
			this._bitmap.sourceRect = tex.frame;
			this._bitmap.x = -this._origin.x + tex.offset.x * this._bitmap.scaleX;
			this._bitmap.y = -this._origin.y + tex.offset.y * this._bitmap.scaleY;
		}
	};
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPosition = 0;
		this._t = 0;
		this.currentFrame = 0;
	};

	namespace("createjs").BitmapMovieClip = BitmapMovieClip;
	namespace("springroll.easeljs").BitmapMovieClip = BitmapMovieClip;
}());