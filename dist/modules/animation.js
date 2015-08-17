/*! SpringRoll 0.4.0 */
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	 * Animator Timeline is a class designed to provide
	 * base animation functionality
	 *
	 * @class AnimatorTimeline
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
		 * @property {Array} eventList
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
		 * @property {springroll.AnimatorInstance} instance
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
		 * If this timeline plays captions for the current sound.
		 *
		 * @property {Boolean} useCaptions
		 * @readOnly
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
		 */
		this.startTime = 0;
		
		/**
		 * The current animation duration in seconds.
		 * @property {Number} duration
		 */
		this.duration = 0;

		/**
		 * The animation speed for the current animation. Default is 1.
		 * @property {Number} speed
		 */
		this.speed = 1;

		/**
		 * The position of the current animation in seconds, or the current pause timer.
		 * @property {Number} position
		 * @protected
		 */
		this.position = 0;

		/**
		 * Sound alias to sync to during the current animation.
		 * @property {String} soundAlias
		 */
		this.soundAlias = null;

		/**
		 * A sound instance object from springroll.Sound, used for tracking sound position for the
		 * current animation.
		 * @property {Object} soundInst
		 */
		this.soundInst = null;

		/**
		 * If the timeline will, but has yet to play a sound for the current animation.
		 * @property {Boolean} playSound
		 */
		this.playSound = false;

		/**
		 * The time (seconds) into the current animation that the sound starts.
		 * @property {Number} soundStart
		 */
		this.soundStart = 0;

		/**
		 * The time (seconds) into the animation that the sound ends
		 * @property {Number} soundEnd
		 */
		this.soundEnd = 0;
		
		/**
		 * If the timeline is complete. Looping timelines will never complete.
		 * @property {Boolean} complete
		 * @readOnly
		 */
		this.complete = false;
	};
	
	var p = AnimatorTimeline.prototype;

	/**
	 * Reset the timeline so we can reuse
	 * @method reset
	 * @private
	 * @return {springroll.AnimatorTimeline} Instance of timeline
	 */
	p.reset = function()
	{
		if (this.instance)
		{
			this.instance.destroy();
			this.instance = null;
		}
		this.complete = false;
		this.soundEnd = 0;
		this.soundStart = 0;
		this.playSound = false;
		this.soundInst = null;
		this.soundAlias = null;
		this.position = 0;
		this.speed = 1;
		this.duration = 0;
		this.startTime = 0;
		this._paused = false;
		this.useCaptions = false;
		this.length = 0;
		this.isLooping = false;
		this.firstFrame = -1;
		this.lastFrame = -1;
		this.listIndex = -1;
		this.eventList = null;
		this.onCancelled = null;
		this.onComplete = null;
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
		if (this.isLooping)
		{
			//if sound is playing, we need to stop it immediately
			//otherwise it can interfere with replaying the audio
			var sound = this.soundInst;
			if (sound)
			{
				sound.stop();
				this.soundInst = null;
			}
			//say that we are repeating, so that we start at the beginning of the loop
			//in case it started part way in
			repeat = true;
		}
		else
		{
			//reset variables
			this.soundEnd = this.soundStart = 0;
			this.isLooping = this.playSound = this.useCaptions = false;
			this.soundInst = this.soundAlias = null;
			this.startTime = this.length = 0;
			this.firstFrame = this.lastFrame = -1;
			
			//see if the animation list is complete
			if (++this.listIndex >= this.eventList.length)
			{
				this.complete = true;
				return;
			}
		}
		//take action based on the type of item in the list
		var listItem = this.eventList[this.listIndex];

		switch (typeof listItem)
		{
			case "object":
			{
				this.firstFrame = listItem.first;
				this.lastFrame = listItem.last;
				this.length = this.lastFrame - this.firstFrame;
				var fps = this.instance.framerate;
				this.startTime = this.firstFrame / fps;
				this.duration = this.length / fps;
				this.speed = listItem.speed;
				this.isLooping = listItem.loop;
				var animStart = listItem.animStart;

				if (repeat)
				{
					this.position = 0;
				}
				else
				{
					this.position = animStart < 0 ? Math.random() * this.duration : animStart;
				}
				if (listItem.alias)
				{
					this.soundAlias = listItem.alias;
					this.soundStart = listItem.audioStart;
					this.playSound = true;
					this.useCaptions = listItem.useCaptions;
				}
				break;
			}
			case "number":
			{
				this.duration = listItem;
				this.position = 0;
				break;
			}
			case "function":
			{
				listItem();
				this._nextItem();
				break;
			}
		}
	};
	
	/**
	 * The position of the current animation, or the current pause timer, in milliseconds.
	 * @property {Number} time
	 */
	Object.defineProperty(p, "time", 
	{
		get: function()
		{
			return this.position * 1000;
		},
		set: function(value)
		{
			this.position = value * 0.001;
		}
	});
	
	/**
	 * Sets and gets the animation's paused status.
	 * @property {Boolean} paused
	 */
	Object.defineProperty(p, "paused", 
	{
		get: function()
		{
			return this._paused; 
		},
		set: function(value)
		{
			if (value == this._paused) return;
			this._paused = !!value;
			var sound = this.soundInst;
			if (sound)
			{
				if (this.paused)
				{
					sound.pause();
				}
				else
				{
					sound.unpause();
				}
			}
		}
	});
	
	// Assign to the name space
	namespace('springroll').AnimatorTimeline = AnimatorTimeline;
	
}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Imports
	var AnimatorTimeline = include('springroll.AnimatorTimeline'),
		Debug;

	/**
	 * Animator is a static class designed to provided
	 * base animation functionality, using frame labels of MovieClips
	 *
	 * @class Animator
	 * @constructor
	 * @param {springroll.Application} app Reference to the application
	 */
	var Animator = function(app)
	{
		/**
		 * If we fire debug statements
		 * @property {Boolean} debug
		 */
		this.debug = false;

		/**
		 * The global captions object to use with animator
		 * @property {springroll.Captions} captions
		 */
		this.captions = null;

		/**
		 * Reference to the application
		 * @property {springroll.Application} app
		 * @private
		 */
		_app = app;

		/**
		 * The collection of AnimatorPlugin definitions
		 * @property {Array} _definitions
		 * @private
		 */
		_definitions = [];

		/**
		 * The collection of timelines
		 *
		 * @property {Array} _timelines
		 * @private
		 */
		_timelines = [];

		/**
		 * A collection of timelines for removal - kept out here so it doesn't need to be
		 * reallocated every frame
		 *
		 * @property {Array} _removedTimelines
		 * @private
		 */
		_removedTimelines = [];

		/**
		 * Look up a timeline by the instance
		 *
		 * @property {Dictionary} _timelinesMap
		 * @private
		 */
		_timelinesMap = {};

		/** 
		 * The collection of used timeline objects
		 *
		 * @property {Array} _timelinePool
		 * @private
		 */
		_timelinePool = [];

		/** 
		 * If there are timelines available
		 *
		 * @property {Boolean} _hasTimelines
		 * @private
		 */
		_hasTimelines = false;

		/**
		 * If the Animator is paused
		 *
		 * @property {Boolean} _paused
		 * @private
		 */
		_paused = false;

		// update bind
		this._update = this._update.bind(this);

		Debug = include('springroll.Debug', false);
	};

	// Reference to the prototype
	var p = Animator.prototype;

	// Private local vars
	var _removedTimelines,
		_timelines,
		_definitions,
		_timelinesMap,
		_paused,
		_timelinePool,
		_app;

	/**
	 * Register an animator instance definition type
	 * @method register
	 * @param {String} qualifiedClassName The class name
	 * @param {int} priority The priority order for definition
	 */
	p.register = function(qualifiedClassName, priority)
	{
		var plugin = include(qualifiedClassName);
		plugin.priority = priority;
		_definitions.push(plugin);
		_definitions.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	/**
	 * Play an animation for a frame label event, with more verbose play options.
	 *
	 * @method play
	 * @param {*} clip The display object with the same API to animate.
	 * @param {Object} options One of or an array of the following
	 * @param {String} options.anim the frame label of the animation to play, e.g. "onClose" to "onClose_stop".
	 * @param {int} [options.start=0] Milliseconds into the animation to start. A value of -1
	 *      starts from a random time in the animation.
	 * @param {int} [options.speed=1] a multiplier for the animation speed.
	 * @param {Object|String} [options.audio] Audio to sync the animation to using springroll.Sound. audio can be a String
	 *      if you want the audio to start 0 milliseconds into the animation.
	 * @param {String} [options.audio.alias] The sound alias
	 * @param {int} [options.audio.start] The sound delay
	 * @param {Function} [onComplete] The callback function for when the animation is done.
	 * @param {Function|Boolean} [onCancelled] A callback function for when an animation is
	 *        stopped with Animator.stop() or to play another
	 *        animation. A value of 'true' uses onComplete for
	 *        onCancelled.
	 * @return {springroll.AnimatorTimeline} The Timeline object that represents this play() call.
	 */

	/**
	 * Play an animation for a frame label event or events
	 *
	 * @method play
	 * @param {*} clip The display object with the same API to animate.
	 * @param {String|Array} eventList The name of an event or collection of events
	 * @param {Function} [onComplete] The callback function for when the animation is done.
	 * @param {Function|Boolean} [onCancelled] A callback function for when an animation is
	 *        stopped with Animator.stop() or to play another
	 *        animation. A value of 'true' uses onComplete for
	 *        onCancelled.
	 * @return {springroll.AnimatorTimeline} The Timeline object that represents this play() call.
	 */
	p.play = function(clip, eventList, onComplete, onCancelled)
	{
		var audio, options;

		if (onComplete && !isFunction(onComplete))
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
		if (isString(eventList) && options)
		{
			audio = options.audio || options.soundData || null;
			eventList = {
				anim: eventList,
				audio: audio
			};
		}
		if (!Array.isArray(eventList))
		{
			eventList = [eventList];
		}
		
		var timeline = this._makeTimeline(
			clip,
			eventList,
			onComplete,
			onCancelled
		);

		var instance = timeline.instance;

		if (_timelinesMap[instance.id] !== undefined)
		{
			this.stop(clip);
		}

		//if the animation is present and complete
		if (timeline.eventList && timeline.eventList.length >= 1)
		{
			timeline._nextItem(); //advance the timeline to the first item

			instance.elapsedTime = timeline.startTime + timeline.position;

			// have it set its 'paused' variable to false
			instance.play();

			// Before we add the timeline, we should check to see
			// if there are no timelines, then start the enter frame
			// updating
			if (!_hasTimelines) this._startUpdate();

			_timelines.push(timeline);
			_timelinesMap[instance.id] = timeline;
			_hasTimelines = true;

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
	 * Creates the AnimatorTimeline for a given animation
	 *
	 * @method _makeTimeline
	 * @param {*} clip The instance to animate
	 * @param {Array} eventList List of animation events
	 * @param {Function} onComplete The function to callback when we're done
	 * @param {Function} onCancelled The function to callback when cancelled
	 * @return {springroll.AnimatorTimeline} The Timeline object
	 * @private
	 */
	p._makeTimeline = function(clip, eventList, onComplete, onCancelled)
	{
		var timeline = _timelinePool.length ? 
			_timelinePool.pop() : 
			new AnimatorTimeline();

		var instance = this.canAnimate(clip, true);

		if (!instance)
		{
			if (true && Debug)
			{
				Debug.warn("Attempting to use Animator to play something that is not compatible: ", instance);
			}
			return timeline;
		}

		var fps;

		//make sure the movieclip is framerate independent
		if (!instance.framerate)
		{
			fps = _app.options.fps || 15;
			if (!fps)
				fps = 15;
			instance.framerate = fps;
		}
		else
		{
			// we'll want this for some math later
			fps = instance.framerate; 
		}

		timeline.instance = instance;
		timeline.eventList = []; // we'll create a duplicate event list with specific info
		timeline.onComplete = onComplete;
		timeline.onCancelled = onCancelled;
		timeline.speed = speed;
		var labels = instance.getLabels();
		var anim, audio, start, speed, alias;

		for (var j = 0, jLen = eventList.length; j < jLen; ++j)
		{
			var listItem = eventList[j];
			
			if (isString(listItem))
			{
				anim = listItem;
				audio = null;
				start = 0;
				speed = 1;
			}
			else if (typeof listItem == "object")
			{
				anim = listItem.anim;
				audio = listItem.audio;
				//convert into seconds, as that is what the time uses internally
				start = isNumber(listItem.start) ? listItem.start * 0.001 : 0;
				speed = listItem.speed > 0 ? listItem.speed : 1;
			}
			else if (isNumber(listItem))
			{
				//convert to seconds
				timeline.eventList.push(listItem * 0.001);
				continue;
			}
			else if (isFunction(listItem))
			{
				//add functions directly
				timeline.eventList.push(listItem);
				continue;
			}
			else
			{
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
					name: anim,
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
			if (audio && _app.sound)
			{
				if (isString(audio))
				{
					start = 0;
					alias = audio;
				}
				else
				{
					start = audio.start > 0 ? audio.start * 0.001 : 0; //seconds
					alias = audio.alias;
				}
				if (_app.sound.exists(alias))
				{
					_app.sound.preload(alias);
					animData.alias = alias;
					animData.audioStart = start;

					animData.useCaptions = this.captions && this.captions.hasCaption(alias);
				}
			}
			timeline.eventList.push(animData);
		}
		return timeline;
	};

	/**
	 * Determines if a given instance can be animated by Animator. Note - `id` is a property
	 * with a unique value for each `createjs.DisplayObject`. If a custom object is made that does
	 * not inherit from DisplayObject, it needs to not have an id that is identical to anything
	 * from EaselJS.
	 *
	 * @method canAnimate
	 * @param {*} clip The object to check for animation properties.
	 * @param {Boolean} [makeInstance=false] (private) If we should construct an AnimatorInstance from clip
	 * @return {Boolean|springroll.AnimatorInstance} If the instance can be animated or boolean
	 *         if `makeInstance` param is false.
	 */
	p.canAnimate = function(clip, makeInstance)
	{
		// Check if the clip is already part of a timeline
		var timeline = getTimelineByClip(clip);

		if (clip)
		{
			// We have a timeline instance, we'll just return that
			if (timeline)
			{
				return !!makeInstance ? timeline.instance : true;
			}
			for(var Def, i = 0, len = _definitions.length; i < len; i++)
			{
				Definition = _definitions[i];
				if (Definition.test(clip))
				{
					return !!makeInstance ? new Definition(clip) : true;
				}
			}
		}
		return !!makeInstance ? null : false;
	};

	/**
	 * Checks if animation exists
	 *
	 * @method hasAnimation
	 * @param {*} clip The instance to check
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @public
	 * @return {Boolean} does this animation exist?
	 */
	p.hasAnimation = function(clip, event)
	{
		var timeline = getTimelineByClip(clip);
		if (timeline)
		{
			return timeline.instance.hasAnimation(event);
		}
		else
		{
			var instance = this.canAnimate(clip, true);
			var hasAnim = instance.hasAnimation(event);
			instance.destroy();
			return hasAnim;
		}
	};

	/**
	 * Get duration of animation event (or sequence of events) in seconds
	 *
	 * @method getDuration
	 * @param {*} instance The timeline to check
	 * @param {String|Array} event The frame label event or array, in the format that play() uses.
	 * @public
	 * @return {Number} Duration of animation event in milliseconds
	 */
	p.getDuration = function(clip, event)
	{
		var timeline = getTimelineByClip(clip);
		var instance, duration;

		// Animation is already playing
		// don't create a new instance
		if (timeline)
		{
			duration = timeline.instance.getDuration(event);
		}
		else
		{
			// Have to create a new instance
			instance = this.canAnimate(clip, true);
			duration = instance.getDuration(event);
			instance.destroy();
		}
		return duration;		
	};

	/**
	 * Stop the animation.
	 *
	 * @method stop
	 * @param {*} clip The instance to stop the action on
	 * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete or
	 *                                        on cancelled callback of this animation.
	 */
	p.stop = function(clip, removeCallbacks)
	{
		var timeline = getTimelineByClip(clip);
		if (!timeline)
		{
			return;
		}
		if (removeCallbacks)
		{
			timeline.onComplete = timeline.onCancelled = null;
		}
		this._remove(timeline, true);
	};

	/**
	 * Stop all current Animator animations.
	 * This is good for cleaning up all animation, as it doesn't do a callback on any of them.
	 *
	 * @method stopAll
	 * @param {createjs.Container} [container] Specify a container to stop timelines
	 *                                       contained within. This only checks one layer deep.
	 * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete or
	 *                                        on cancelled callback of the current animations.
	 */
	p.stopAll = function(container, removeCallbacks)
	{
		if (!_hasTimelines) return;

		var timeline;
		var removedTimelines = _timelines.slice();

		for (var i = 0, len = removedTimelines.length; i < len; i++)
		{
			timeline = removedTimelines[i];

			if (!container || container.contains(timeline.instance.clip))
			{
				if (removeCallbacks)
				{
					timeline.onComplete = timeline.onCancelled = null;
				}
				this._remove(timeline, true);
			}
		}
		_hasTimelines = false;
	};

	/**
	 * Remove a timeline from the stack
	 *
	 * @method _remove
	 * @param {springroll.AnimatorTimeline} timeline
	 * @param {Boolean} doCancelled If we do the on complete callback
	 * @private
	 */
	p._remove = function(timeline, doCancelled)
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

		//in most cases, if doOnComplete is true, it's a natural stop and the audio can
		//be allowed to continue
		if (doCancelled && timeline.soundInst)
			timeline.soundInst.stop(); //stop the sound from playing

		// Remove from the stack
		_timelines.splice(index, 1);
		_hasTimelines = _timelines.length > 0;
		delete _timelinesMap[timeline.instance.id];

		//stop the captions, if relevant
		if (timeline.useCaptions)
		{
			this.captions.stop();
		}

		// Reset the timeline and add to the pool
		// of timeline objects
		_timelinePool.push(timeline.reset());

		// Check if we should stop the update
		if (!_hasTimelines) this._stopUpdate();

		//call the appropriate callback
		if (doCancelled)
		{
			if (onCancelled)
			{
				onCancelled();
			}
		}
		else if (onComplete)
		{
			onComplete();
		}
	};

	/**
	 * Pause all tweens which have been excuted by `play()`
	 *
	 * @method pause
	 */
	p.pause = function()
	{
		if (_paused) return;

		_paused = true;

		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			_timelines[i].paused = true;
		}
		this._stopUpdate();
	};

	/**
	 * Resumes all tweens executed by the `play()`
	 *
	 * @method resume
	 */
	p.resume = function()
	{
		if (!_paused) return;

		_paused = false;

		// Resume playing of all the instances
		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			_timelines[i].paused = false;
		}
		if (_hasTimelines) this._startUpdate();
	};

	/**
	 * Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
	 *
	 * @method pauseInGroup
	 * @param {Boolean} paused If this should be paused or unpaused
	 * @param {createjs.Container} container The container to stop timelines contained within
	 */
	p.pauseInGroup = function(paused, container)
	{
		if (!hasTimelines() || !container) return;

		for (var i = 0, len = _timelines.length; i < len; i++)
		{
			if (container.contains(_timelines[i].instance.clip))
			{
				_timelines[i].paused = paused;
			}
		}
	};

	/**
	 * Get the timeline object for an instance
	 *
	 * @method getTimeline
	 * @param {*} clip The animation clip
	 * @return {springroll.AnimatorTimeline} The timeline
	 */
	p.getTimeline = function(clip)
	{
		if (!_hasTimelines) return null;
		return getTimelineByClip(clip);
	};

	/**
	 * Loop a clip by timeline
	 * @method getTimelineByClip
	 * @private
	 * @param {*} clip The clip to check
	 * @return {springroll.AnimatorTimeline} The timeline for clip
	 */
	var getTimelineByClip = function(clip)
	{
		if (clip.__animatorId)
		{
			return _timelinesMap[clip.__animatorId] || null;
		}
		return null;
	};

	/**
	 * Whether the Animator class is currently paused.
	 *
	 * @property {Boolean} paused
	 * @readOnly
	 */
	Object.defineProperty(p, 'paused',
	{
		get: function()
		{
			return _paused;
		}
	});

	/**
	 * Start the updating
	 *
	 * @method _startUpdate
	 * @private
	 */
	p._startUpdate = function()
	{
		_app.on("update", this._update);
	};

	/**
	 * Stop the updating
	 *
	 * @method _stopUpdate
	 * @private
	 */
	p._stopUpdate = function()
	{
		_app.off("update", this._update);
	};

	/**
	 * The update every frame
	 *
	 * @method
	 * @param {int} elapsed The time in milliseconds since the last frame
	 * @private
	 */
	p._update = function(elapsed)
	{
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
					t.position = t.soundStart + audioPos;

					if (t.useCaptions)
					{
						this.captions.seek(t.soundInst.position);
					}
					//if the sound goes beyond the animation, then stop the animation
					//audio animations shouldn't loop, because doing that properly is difficult
					//letting the audio continue should be okay though
					if (t.position >= t.duration)
					{
						instance.gotoAndStop(t.lastFrame);
						extraTime = t.position - t.duration;
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
				t.position += delta * t.speed;
				if (t.position >= t.duration)
				{
					if (t.isLooping)
					{
						extraTime = t.position - t.duration;
						t._nextItem();
						onNext = true;
						//call the on complete function each time
						if (t.onComplete)
							t.onComplete();
					}
					else
					{
						extraTime = t.position - t.duration;
						if (t.firstFrame >= 0)
						{
							instance.gotoAndStop(t.lastFrame);
						}
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
				if (!onNext && t.playSound && t.position >= t.soundStart)
				{
					t.position = t.soundStart;
					t.playSound = false;
					t.soundInst = _app.sound.play(
						t.soundAlias,
						this._onSoundDone.bind(this, t, t.listIndex, t.soundAlias),
						onSoundStarted.bind(null, t, t.listIndex)
					);
					if (t.useCaptions)
					{
						this.captions.play(t.soundAlias);
					}
				}
			}
			if (onNext)
			{
				t.position += extraTime;
				while(t.position >= t.duration)
				{
					extraTime = t.position - t.duration;
					t._nextItem();
					if (t.complete)
					{
						if (t.firstFrame >= 0)
						{
							instance.gotoAndStop(t.lastFrame);
						}
						_removedTimelines.push(t);
						continue;
					}
					t.position += extraTime;
				}
				
				if (t.firstFrame >= 0)
				{
					instance.gotoAndPlay(t.firstFrame);
				}
				if (t.playSound && t.position >= t.soundStart)
				{
					t.position = t.soundStart;
					t.playSound = false;
					t.soundInst = _app.sound.play(
						t.soundAlias,
						this._onSoundDone.bind(this, t, t.listIndex, t.soundAlias),
						onSoundStarted.bind(null, t, t.listIndex)
					);
					if (t.useCaptions)
					{
						this.captions.play(t.soundAlias);
					}
				}
			}
			//if on an animation, not a pause
			if (t.firstFrame >= 0)
			{
				instance.elapsedTime = t.startTime + t.position;
			}
		}
		if (!_removedTimelines) return;
		//we need to save the length before iterating because we have seen _removedTimelines get
		//destroyed out from under us when this gets called at the end of an activity
		var len = _removedTimelines.length;
		for (i = 0; i < len; i++)
		{
			t = _removedTimelines[i];
			this._remove(t);
		}
	};

	/**
	 * The sound has been started
	 * @method onSoundStarted
	 * @private
	 * @param {springroll.AnimatorTimeline} timeline
	 * @param {int} playIndex
	 */
	var onSoundStarted = function(timeline, playIndex)
	{
		if (timeline.listIndex != playIndex) return;

		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};

	/**
	 * The sound is done
	 * @method _onSoundDone
	 * @private
	 * @param {springroll.AnimatorTimeline} timeline
	 * @param {int} playIndex
	 * @param {String} soundAlias
	 */
	p._onSoundDone = function(timeline, playIndex, soundAlias)
	{
		if (this.captions && this.captions.currentAlias == soundAlias)
		{
			this.captions.stop();
		}

		if (timeline.listIndex != playIndex) return;

		if (timeline.soundEnd > 0 && timeline.soundEnd > timeline.position)
		{
			timeline.position = timeline.soundEnd;
		}
		timeline.soundInst = null;
	};

	/**
	 * Stops all animations and cleans up the variables used.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stopAll(null, true);
		this.captions = null;
		_app = null;
		_timelines = null;
		_timelinePool = null;
		_removedTimelines = null;
		_timelinesMap = null;
		_definitions = null;
		_hasTimelines = false;
	};


	// Type checking, produces better uglify

	/**
	 * Check to see if object is a String
	 * @method isString
	 * @param {*} str The string
	 * @return {Boolean} if object is String
	 * @private
	 */
	function isString(str)
	{
		return typeof str == "string";
	}

	/**
	 * Check to see if object is a Number
	 * @method isNumber
	 * @param {*} num The object to check
	 * @return {Boolean} if object is Number
	 * @private
	 */
	function isNumber(num)
	{
		return typeof num == "number";
	}

	/**
	 * Check to see if object is a Function
	 * @method isFunction
	 * @param {*} func The object to check
	 * @return {Boolean} if object is Function
	 * @private
	 */
	function isFunction(func)
	{
		return typeof func == "function";
	}

	// Assign to the global namespace
	namespace('springroll').Animator = Animator;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	/**
	 * The auto-incrementing id for the clip
	 * @method
	 */
	var ANIMATOR_ID = 0;

	/**
	 * Animator Instance is a wrapper for different types of media
	 * files. They need to extend some basic methods.
	 *
	 * @class AnimatorTimeline
	 * @constructor
	 * @param {*} clip The animation to play
	 */
	var AnimatorInstance = function(clip)
	{
		/**
		 * The animation clip to play
		 * @param {*} clip 
		 */
		this.clip = clip;

		// Add a unique id to the clip
		clip.__animatorId = ++ANIMATOR_ID;
	};

	// Reference to the prototype
	var p = AnimatorInstance.prototype;

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	AnimatorInstance.test = function(clip)
	{
		return clip.framerate !== undefined &&
			clip.getLabels !== undefined &&
			clip.elapsedTime !== undefined && 
			clip.gotoAndStop !== undefined &&
			clip.gotoAndPlay !== undefined &&
			clip.stop !== undefined &&
			clip.play !== undefined;
	};

	/**
	 * Get and set the framerate
	 * @property {int} framerate
	 */
	Object.defineProperty(p, 'framerate',
	{
		get: function()
		{
			return this.clip.framerate;
		},
		set: function(framerate)
		{
			this.clip.framerate = framerate; 
		}
	});

	/**
	 * Get and set the elapsedTime
	 * @property {Number} elapsedTime
	 */
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function()
		{
			return this.clip.elapsedTime;
		},
		set: function(elapsedTime)
		{
			this.clip.elapsedTime = elapsedTime; 
		}
	});

	/**
	 * The unique id for this animation
	 * @property {Number} id
	 * @readOnly
	 */
	Object.defineProperty(p, 'id',
	{
		get: function()
		{
			return this.clip.__animatorId;
		}
	});

	/**
	 * Get the collection of labels
	 * @method getLabels
	 * @return {Array} The collection of label, object with a label key
	 */
	p.getLabels = function()
	{
		return this.clip.getLabels();
	};

	/**
	 * Goto and stop on a frame
	 * @method gotoAndStop
	 * @param {String|int} frame The frame to goto
	 */
	p.gotoAndStop = function(frame)
	{
		this.clip.gotoAndStop(frame);
	};

	/**
	 * Goto and play on a frame
	 * @method gotoAndPlay
	 * @param {String|int} frame The frame to goto
	 */
	p.gotoAndPlay = function(frame)
	{
		this.clip.gotoAndPlay(frame);
	};

	/**
	 * Play the animation
	 * @method play
	 */
	p.play = function()
	{
		this.clip.play();
	};

	/**
	 * Stop the animation
	 * @method stop
	 */
	p.stop = function()
	{
		this.clip.stop();
	};

	/**
	 * Checks if animation exists
	 *
	 * @method hasAnimation
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @public
	 * @return {Boolean} does this animation exist?
	 */
	p.hasAnimation = function(event)
	{
		var labels = this.getLabels();
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
	};

	/**
	 * Get the duration of an event label
	 * @method getDuration
	 * @param {String|Array} event The event or events
	 * @return {int} Duration of sequence in milliseconds
	 */
	p.getDuration = function(event)
	{
		if (Array.isArray(event))
		{
			var duration = 0;
			for (var j = 0, eventLength = event.length; j < eventLength; j++)
			{
				duration += this.getDuration(event[j]);
			}
			return duration;
		}
		else
		{
			if (typeof event == "number")
			{
				return event;	
			}
			else if (typeof event == "object" && event.anim)
			{
				event = event.anim;
			}
			else if (typeof event != "string")
			{
				return 0;
			}

			var labels = this.getLabels();
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
				if (!this.framerate)
				{
					var fps = _app.options.fps;
					if (!fps)
						fps = 15;
					this.framerate = fps;
				}

				return (stopFrame - startFrame) / this.framerate * 1000;
			}
			else
			{
				return 0;
			}
		}
	};

	/**
	 * Reset this animator instance
	 * so it can be re-used.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stop();
		delete this.clip.__animatorId;
		this.clip = null;
	};

	// Assign to namespace
	namespace('springroll').AnimatorInstance = AnimatorInstance;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.Animator');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(50);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * The class for playing animation
		 * @property {springroll.Animator} animator
		 */
		this.animator = new Animator(this);
		this.animator.captions = this.captions || null;
		this.animator.register('springroll.AnimatorInstance', 0);
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.animator)
		{
			this.animator.destroy();
			this.animator = null;	
		}
	};

}());