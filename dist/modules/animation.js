/*! SpringRoll 1.0.3 */
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
	 * @class AnimatorTimeline
	 */
	var AnimatorTimeline = function()
	{
		/**
		 * The function to call when we're done
		 * @property {Function} onComplete
		 */
		this.onComplete = null;

		/**
		 * The function to call when stopped early.
		 * @property {Function} onCancelled
		 */
		this.onCancelled = null;

		/**
		 * An array of animations and pauses.
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
		 * @property {springroll.AnimatorInstance} instance
		 */
		this.instance = null;

		/**
		 * If the current animation loops - determined by looking to see if it ends
		 * in "_stop" or "_loop"
		 * @property {Boolean} isLooping
		 */
		this.isLooping = false;

		/**
		 * If this timeline plays captions for the current sound.
		 * @property {Boolean} useCaptions
		 * @readOnly
		 */
		this.useCaptions = false;

		/**
		 * If the timeline is paused.
		 * @property {Boolean} _paused
		 * @private
		 */
		this._paused = false;

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
		 * Sound alias to sync to during the current animation.
		 * @property {String} soundAlias
		 */
		this.soundAlias = null;

		/**
		 * A sound instance object from springroll.Sound, used for tracking sound
		 * position for the current animation.
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

		this._position = 0;

		this.isTimer = false;
	};

	var p = extend(AnimatorTimeline);

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
		this.speed = 1;
		this._position = 0;
		this.duration = 0;
		this._paused = false;
		this.useCaptions = false;
		this.isLooping = false;
		this.isTimer = false;
		this.listIndex = -1;
		this.eventList = null;
		this.onCancelled = null;
		this.onComplete = null;
		return this;
	};

	Object.defineProperty(p, "position",
	{
		get: function()
		{
			return this._position;
		},
		set: function(value)
		{
			this._position = value;
			if (!this.isTimer)
			{
				this.instance.setPosition(value);
			}
		}
	});

	/**
	 * Advances to the next item in the list of things to play.
	 * @method _nextItem
	 * @private
	 */
	p._nextItem = function()
	{
		var repeat = false;
		if (this.soundInst) this.soundInst._endCallback = null;
		//if on a looping animation, set up the animation to be replayed
		//(this will only happen on looping animations with audio)
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
			if (!this.isTimer)
				this.instance.endAnim();
			//reset variables
			this.soundEnd = this.soundStart = 0;
			this.isLooping = this.playSound = this.useCaptions = false;
			this.soundInst = this.soundAlias = null;

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
					this.isTimer = false;
					var instance = this.instance;
					instance.beginAnim(listItem, repeat);
					this.duration = instance.duration;
					this.speed = listItem.speed;
					this.isLooping = instance.isLooping || listItem.loop;
					this._position = instance.position;

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
					this.isTimer = true;
					this.duration = listItem;
					this._position = 0;
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
			if (value == this._paused)
				return;

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
					sound.resume();
				}
			}
		}
	});

	//assign to the name space
	namespace('springroll').AnimatorTimeline = AnimatorTimeline;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	//imports
	var AnimatorTimeline = include('springroll.AnimatorTimeline'),
		Debug;

	/**
	 * Animator is a static class designed to provided
	 * base animation functionality, using frame labels of MovieClips
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
		 * @property {Array} _timelines
		 * @private
		 */
		_timelines = [];

		/**
		 * The collection of active timelines, indexed by MovieClip/instance. This will be
		 * null in browsers where Map is not supported.
		 * @property {Map} _timelineMap
		 * @private
		 */
		try
		{
			//having a parameter causes an error in non-fully compliant implementations,
			//like iOS 8.X - there is a serious issue that sometimes happens in iOS 8.0-8.2
			//This prevents 8.3 from using the faster map, but beyond attempting to detect exactly
			//which version of iOS is being used, there isn't much of a choice.
			_timelineMap = new Map([]);
			//ensure that all the Map features we need are supported
			if (typeof _timelineMap.delete != "function" ||
				typeof _timelineMap.has != "function" ||
				typeof _timelineMap.set != "function" ||
				typeof _timelineMap.get != "function")
			{
				_timelineMap = null;
			}
		}
		catch (e)
		{
			// no catch
		}

		/**
		 * The collection of used timeline objects
		 * @property {Array} _timelinePool
		 * @private
		 */
		_timelinePool = [];

		/**
		 * If there are timelines available
		 * @property {Boolean} _hasTimelines
		 * @private
		 */
		_hasTimelines = false;

		/**
		 * If the Animator is paused
		 * @property {Boolean} _paused
		 * @private
		 */
		_paused = false;

		//update bind
		this._update = this._update.bind(this);

		Debug = include('springroll.Debug', false);
	};

	//reference to the prototype
	var p = extend(Animator);

	//private local vars
	var _timelines,
		_timelineMap,
		_definitions,
		_hasTimelines,
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
		var plugin = include(qualifiedClassName, false);
		if (!plugin)
		{
			return;
		}
		plugin.priority = priority;
		_definitions.push(plugin);
		_definitions.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	/**
	 * Play an animation for a frame label event, with more verbose play options.
	 * @method play
	 * @param {*} clip The display object with the same API to animate.
	 * @param {Object} options One of or an array of the following
	 * @param {String} options.anim the frame label of the animation to play,
	 * e.g. "onClose" to "onClose_stop".
	 * @param {int} [options.start=0] Milliseconds into the animation to start.
	 * A value of -1 starts from a random time in the animation.
	 * @param {int} [options.speed=1] a multiplier for the animation speed.
	 * @param {Object|String} [options.audio] Audio to sync the animation to using
	 * springroll.Sound. audio can be a String if you want the audio to start 0 milliseconds
	 * into the animation.
	 * @param {String} [options.audio.alias] The sound alias
	 * @param {int} [options.audio.start] The sound delay
	 * @param {Function} [onComplete] The callback function for when the animation is done.
	 * @param {Function|Boolean} [onCancelled] A callback function for when an animation
	 * is stopped with Animator.stop() or to play another  animation. A value of 'true'
	 * uses onComplete for onCancelled.
	 * @return {springroll.AnimatorTimeline} The Timeline object that represents this play() call.
	 */

	/**
	 * Play an animation for a frame label event or events
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

		if (onCancelled === true)
		{
			onCancelled = onComplete;
		}
		if (!Array.isArray(eventList))
		{
			eventList = [eventList];
		}

		this.stop(clip);

		var timeline = this._makeTimeline(
			clip,
			eventList,
			onComplete,
			onCancelled
		);

		//if the animation is present and complete
		if (timeline.eventList && timeline.eventList.length >= 1)
		{
			timeline._nextItem(); //advance the timeline to the first item

			//Before we add the timeline, we should check to see
			//if there are no timelines, then start the enter frame
			//updating
			if (!_hasTimelines)
			{
				this._startUpdate();
			}

			if (_timelineMap)
			{
				_timelineMap.set(clip, timeline);
			}
			_timelines.push(timeline);
			_hasTimelines = true;

			return timeline;
		}

		if (true && Debug)
		{
			var label = eventList[0].anim ||
				eventList[0].audio ||
				eventList[0] ||
				'<label unknown>';
			var readableInstance = clip.name ||
				clip.key ||
				clip.label ||
				clip.id ||
				clip.toString() ||
				clip;
			Debug.groupCollapsed("No valid animation label \"" + label + "\" in MovieClip " + readableInstance);
			Debug.red("eventList:", eventList);
			Debug.red("instance:", clip);
			Debug.trace("Animator.play");
			Debug.groupEnd();
		}

		//reset the timeline and add to the pool of timeline objects
		_timelinePool.push(timeline.reset());

		if (onComplete)
		{
			onComplete();
		}
		return null;
	};

	/**
	 * Creates the AnimatorTimeline for a given animation
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

		var Definition = getDefinitionByClip(clip);
		if (!Definition) return timeline;
		var instance = Definition.create(clip);

		if (!instance)
		{
			if (true && Debug)
			{
				Debug.warn("Attempting to use Animator to play something that is not compatible: ", clip);
			}
			return timeline;
		}

		var fps;

		timeline.instance = instance;
		timeline.eventList = []; //create a duplicate event list with specific info
		timeline.onComplete = onComplete;
		timeline.onCancelled = onCancelled;
		timeline.speed = speed;
		var anim, audio, start, speed, alias;

		for (var j = 0, jLen = eventList.length; j < jLen; ++j)
		{
			var listItem = eventList[j];

			if (isString(listItem))
			{
				if (!Definition.hasAnimation(clip, listItem))
					continue;

				timeline.eventList.push(
				{
					anim: listItem,
					audio: null,
					start: 0,
					speed: 1
				});
			}
			else if (typeof listItem == "object")
			{
				if (!Definition.hasAnimation(clip, listItem.anim))
				{
					continue;
				}

				var animData = {
					anim: listItem.anim,
					//convert into seconds, as that is what the time uses internally
					start: isNumber(listItem.start) ? listItem.start * 0.001 : 0,
					speed: listItem.speed > 0 ? listItem.speed : 1,
					loop: listItem.loop
				};
				audio = listItem.audio;
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
					if (_app.sound.isSupported && !_app.sound.systemMuted &&
						_app.sound.exists(alias))
					{
						_app.sound.preload(alias);
						animData.alias = alias;
						animData.audioStart = start;

						animData.useCaptions = this.captions && this.captions.hasCaption(alias);
					}
				}
				timeline.eventList.push(animData);
			}
			else if (isNumber(listItem))
			{
				//convert to seconds
				timeline.eventList.push(listItem * 0.001);
			}
			else if (isFunction(listItem))
			{
				//add functions directly
				timeline.eventList.push(listItem);
			}
		}
		return timeline;
	};

	/**
	 * Determines if a given instance can be animated by Animator. Note - `id` is a property
	 * with a unique value for each `createjs.DisplayObject`. If a custom object is made that does
	 * not inherit from DisplayObject, it needs to not have an id that is identical to anything
	 * from EaselJS.
	 * @method canAnimate
	 * @param {*} clip The object to check for animation properties.
	 * @return {Boolean} If the instance can be animated or not.
	 */
	p.canAnimate = function(clip)
	{
		if (!clip)
		{
			return false;
		}
		return !!getDefinitionByClip(clip);
	};

	/**
	 * Create an instance by clip
	 * @method  createInstance
	 * @private
	 * @param  {*} clip The animation object to animate
	 * @return {springroll.AnimatorInstance} The animator instance
	 */
	var createInstance = function(clip)
	{
		if (!clip)
		{
			return null;
		}
		var Definition = getDefinitionByClip(clip);
		return Definition ? Definition.create(clip) : null;
	};

	/**
	 * Destroy an instance
	 * @method  poolInstance
	 * @private
	 * @param  {springroll.AnimatorInstance} instance The instance to destroy
	 */
	var poolInstance = function(instance)
	{
		var Definition = getDefinitionByClip(instance.clip);
		Definition.pool(instance);
	};

	/**
	 * Get a definition by clip
	 * @private
	 * @method  getDefinitionByClip
	 * @param  {*} clip The animation clip
	 * @return {function|null} The new definition
	 */
	var getDefinitionByClip = function(clip)
	{
		for (var Definition, i = 0, len = _definitions.length; i < len; i++)
		{
			Definition = _definitions[i];
			if (Definition.test(clip))
			{
				return Definition;
			}
		}
		return null;
	};

	/**
	 * Checks if animation exists
	 * @method hasAnimation
	 * @param {*} clip The instance to check
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @public
	 * @return {Boolean} does this animation exist?
	 */
	p.hasAnimation = function(clip, event)
	{
		var Definition = getDefinitionByClip(clip);
		if (!Definition)
		{
			return false;
		}
		return Definition.hasAnimation(clip, event);
	};

	/**
	 * Get duration of animation event (or sequence of events) in seconds
	 * @method getDuration
	 * @param {*} instance The timeline to check
	 * @param {String|Array} event The frame label event or array, in the format that play() uses.
	 * @public
	 * @return {Number} Duration of animation event in milliseconds
	 */
	p.getDuration = function(clip, event)
	{
		var Definition = getDefinitionByClip(clip);
		if (!Definition)
		{
			return 0;
		}
		if (!Array.isArray(event))
		{
			return Definition.getDuration(clip, event.anim || event);
		}

		var duration = 0;
		for (var i = 0; i < event.length; ++i)
		{
			var item = event[i];
			if (typeof item == "number")
			{
				duration += item;
			}
			else if (typeof item == "string")
			{
				duration += Definition.getDuration(clip, item);
			}
			else if (typeof item == "object" && item.anim)
			{
				duration += Definition.getDuration(clip, item.anim);
			}
		}
		return duration;
	};

	/**
	 * Stop the animation.
	 * @method stop
	 * @param {*} clip The instance to stop the action on
	 * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete
	 * or on cancelled callback of this animation.
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
	 * Stop all current Animator animations. This is good for cleaning up all
	 * animation, as it doesn't do a callback on any of them.
	 * @method stopAll
	 * @param {createjs.Container} [container] Specify a container to stop timelines
	 * contained within. This only checks one layer deep.
	 * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete
	 * or on cancelled callback of the current animations.
	 */
	p.stopAll = function(container, removeCallbacks)
	{
		if (!_hasTimelines)
		{
			return;
		}

		var timeline;
		for (var i = _timelines.length - 1; i >= 0; --i)
		{
			timeline = _timelines[i];

			if (!container || container.contains(timeline.instance.clip))
			{
				if (removeCallbacks)
				{
					timeline.onComplete = timeline.onCancelled = null;
				}
				this._remove(timeline, true);
			}
		}
	};

	/**
	 * Remove a timeline from the stack
	 * @method _remove
	 * @param {springroll.AnimatorTimeline} timeline
	 * @param {Boolean} doCancelled If we do the on complete callback
	 * @private
	 */
	p._remove = function(timeline, doCancelled)
	{
		var index = _timelines.indexOf(timeline);

		//We can't remove an animation twice
		if (index < 0)
		{
			return;
		}

		var onComplete = timeline.onComplete,
			onCancelled = timeline.onCancelled;

		//in most cases, if doOnComplete is true, it's a natural stop and
		//the audio can be allowed to continue
		if (doCancelled && timeline.soundInst)
		{
			timeline.soundInst.stop(); //stop the sound from playing
		}

		if (_timelineMap)
		{
			_timelineMap.delete(timeline.instance.clip);
		}

		//Remove from the stack
		if (index == _timelines.length - 1)
		{
			_timelines.pop();
		}
		else
		{
			_timelines.splice(index, 1);
		}
		_hasTimelines = _timelines.length > 0;

		//stop the captions, if relevant
		if (timeline.useCaptions)
		{
			this.captions.stop();
		}

		//Reset the timeline and add to the pool
		//of timeline objects
		_timelinePool.push(timeline.reset());

		//Check if we should stop the update
		if (!_hasTimelines)
		{
			this._stopUpdate();
		}

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
	 * @method pause
	 */
	p.pause = function()
	{
		if (_paused)
		{
			return;
		}
		_paused = true;

		for (var i = _timelines.length - 1; i >= 0; --i)
		{
			_timelines[i].paused = true;
		}
		this._stopUpdate();
	};

	/**
	 * Resumes all tweens executed by the `play()`
	 * @method resume
	 */
	p.resume = function()
	{
		if (!_paused)
		{
			return;
		}
		_paused = false;

		//Resume playing of all the instances
		for (var i = _timelines.length - 1; i >= 0; --i)
		{
			_timelines[i].paused = false;
		}
		if (_hasTimelines)
		{
			this._startUpdate();
		}
	};

	/**
	 * Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
	 * @method pauseInGroup
	 * @param {Boolean} paused If this should be paused or unpaused
	 * @param {createjs.Container} container The container to stop timelines contained within
	 */
	p.pauseInGroup = function(paused, container)
	{
		if (!_hasTimelines || !container)
		{
			return;
		}
		for (var i = _timelines.length - 1; i >= 0; --i)
		{
			if (container.contains(_timelines[i].instance.clip))
			{
				_timelines[i].paused = paused;
			}
		}
	};

	/**
	 * Get the timeline object for an instance
	 * @method getTimeline
	 * @param {*} clip The animation clip
	 * @return {springroll.AnimatorTimeline} The timeline
	 */
	p.getTimeline = function(clip)
	{
		if (!_hasTimelines)
		{
			return null;
		}
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
		if (_timelineMap)
		{
			return _timelineMap.has(clip) ? _timelineMap.get(clip) : null;
		}
		else
		{
			for (var i = _timelines.length - 1; i >= 0; --i)
			{
				if (_timelines[i].instance.clip === clip)
				{
					return _timelines[i];
				}
			}
		}
		return null;
	};

	/**
	 * Whether the Animator class is currently paused.
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
	 * @method _startUpdate
	 * @private
	 */
	p._startUpdate = function()
	{
		_app.on("update", this._update);
	};

	/**
	 * Stop the updating
	 * @method _stopUpdate
	 * @private
	 */
	p._stopUpdate = function()
	{
		_app.off("update", this._update);
	};

	/**
	 * The update every frame
	 * @method
	 * @param {int} elapsed The time in milliseconds since the last frame
	 * @private
	 */
	p._update = function(elapsed)
	{
		var delta = elapsed * 0.001; //ms -> sec

		var t;
		var instance;
		var audioPos;
		var position;
		for (var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			if (!t)
			{
				return; //error checking or stopping of all timelines during update
			}
			instance = t.instance;
			if (t.paused)
			{
				continue;
			}

			//we'll use this to figure out if the timeline is on the next item
			//to avoid code repetition
			position = 0;

			if (t.soundInst)
			{
				if (t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					audioPos = t.soundInst.position * 0.001;
					if (audioPos < 0)
					{
						audioPos = 0;
					}
					position = t.soundStart + audioPos;

					if (t.useCaptions)
					{
						this.captions.seek(t.soundInst.position);
					}
				}
				//if sound is no longer valid, stop animation playback immediately
				else
				{
					position = t.duration;
				}
			}
			else
			{
				position = t.position + delta * t.speed;
			}

			if (position >= t.duration)
			{
				while (position >= t.duration)
				{
					position -= t.duration;
					if (t.isLooping)
					{
						//error checking
						if (!t.duration)
						{
							t.complete = true;
							break;
						}
						//call the on complete function each time
						if (t.onComplete)
							t.onComplete();
					}
					t._nextItem();
					if (t.complete)
					{
						break;
					}
				}
				if (t.complete)
				{
					this._remove(t);
					continue;
				}
			}

			if (t.playSound && position >= t.soundStart)
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
			else
			{
				t.position = position;
			}
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
		if (timeline.listIndex != playIndex)
		{
			return;
		}
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

		if (timeline.listIndex != playIndex)
		{
			return;
		}

		if (timeline.soundEnd > timeline.position)
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
		_timelineMap = null;
		_definitions = null;
	};


	//Type checking, produces better uglify

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

	//Assign to the global namespace
	namespace('springroll').Animator = Animator;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	var Application = include("springroll.Application");

	/**
	 * Animator Instance is a wrapper for different types of media
	 * files. They need to extend some basic methods.
	 * @class AnimatorTimeline
	 */
	var AnimatorInstance = function()
	{
		/**
		 * The animation clip to play
		 * @property {*} clip
		 */
		this.clip = null;

		/**
		 * Time, in seconds, of the current animation playback, from 0 -> duration.
		 * @property {Number} position
		 */
		this.position = 0;

		/**
		 * Duration, in seconds, of the current animation.
		 * @property {Number} duration
		 */
		this.duration = 0;

		/**
		 * If the current animation is a looping animation.
		 * @property {Boolean} isLooping
		 */
		this.isLooping = false;

		/**
		 * The name of the current animation.
		 * @property {String} currentName
		 */
		this.currentName = null;
	};

	//reference to the prototype
	var p = extend(AnimatorInstance);

	/**
	 * The initialization method
	 * @method init
	 * @param  {*} clip The movieclip
	 */
	p.init = function(clip)
	{
		this.clip = clip;
	};

	/**
	 * Sets up variables that are needed (including duration), and does any other setup else needed.
	 * @method beginAnim
	 * @param {Object} animObj The animation data object.
	 * @param {Boolean} isRepeat If this animation is restarting a loop.
	 */
	p.beginAnim = function(animObj, isRepeat) {};

	/**
	 * Ends animation playback.
	 * @method endAnim
	 */
	p.endAnim = function() {};

	/**
	 * Updates position to a new value, and does anything that the clip needs, like updating
	 * timelines.
	 * @method setPosition
	 * @param  {Number} newPos The new position in the animation.
	 */
	p.setPosition = function(newPos) {};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	AnimatorInstance.test = function(clip)
	{
		return false;
	};

	/**
	 * Determines if a clip has an animation.
	 * @method hasAnimation
	 * @static
	 * @param  {*} clip The clip to check for an animation.
	 * @param  {String|Object} event The animation.
	 * @return {Boolean} If the clip has the animation.
	 */
	AnimatorInstance.hasAnimation = function(clip, event)
	{
		return false;
	};

	/**
	 * Calculates the duration of an animation or list of animations.
	 * @method getDuration
	 * @static
	 * @param  {*} clip The clip to check.
	 * @param  {String|Object|Array} event The animation or animation list.
	 * @return {Number} Animation duration in milliseconds.
	 */
	AnimatorInstance.getDuration = function(clip, event)
	{
		return 0;
	};

	/**
	 * Create pool and add create and remove functions
	 * @method extend
	 * @param {function} InstanceClass The instance class
	 * @param {function} [ParentClass=springroll.AnimatorTimeline] The class to extend
	 * @return {object} The prototype for new class
	 */
	AnimatorInstance.extend = function(InstanceClass, ParentClass)
	{
		/**
		 * The pool of used up instances
		 * @property {Array} _pool
		 * @static
		 * @protected
		 */
		InstanceClass._pool = [];

		/**
		 * Get an instance either from a recycled pool or new
		 * @method create
		 * @static
		 * @param  {*} clip The animation clip or display object
		 * @return {springroll.AnimatorInstance} The new instance
		 */
		InstanceClass.create = function(clip)
		{
			var instance = InstanceClass._pool.length > 0 ?
				InstanceClass._pool.pop() :
				new InstanceClass();

			instance.init(clip);
			return instance;
		};

		/**
		 * Recycle an instance to the class's pool
		 * @method pool
		 * @static
		 * @param  {springroll.AnimatorInstance} instance The instance to pool
		 */
		InstanceClass.pool = function(instance)
		{
			instance.destroy();
			InstanceClass._pool.push(instance);
		};

		//Extend the parent class
		return extend(InstanceClass, ParentClass || AnimatorInstance);
	};

	/**
	 * Reset this animator instance
	 * so it can be re-used.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.clip = null;
	};

	//assign to namespace
	namespace('springroll').AnimatorInstance = AnimatorInstance;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	var Application = include("springroll.Application");
	var AnimatorInstance = include('springroll.AnimatorInstance');

	/**
	 * Animator Instance is a wrapper for different types of media
	 * files. They need to extend some basic methods.
	 * @class AnimatorTimeline
	 */
	var GenericMovieClipInstance = function()
	{
		AnimatorInstance.call(this);

		/**
		 * The start time of the current animation on the movieclip's timeline.
		 * @property {Number} startTime
		 */
		this.startTime = 0;

		/**
		 * Length of current animation in frames.
		 * @property {int} length
		 */
		this.length = 0;

		/**
		 * The frame number of the first frame of the current animation. If this is -1, then the
		 * animation is currently a pause instead of an animation.
		 * @property {int} firstFrame
		 */
		this.firstFrame = -1;

		/**
		 * The frame number of the last frame of the current animation.
		 * @property {int} lastFrame
		 */
		this.lastFrame = -1;
	};

	//Reference to the prototype
	var p = AnimatorInstance.extend(GenericMovieClipInstance);

	/**
	 * The initialization method
	 * @method init
	 * @param  {*} clip The movieclip
	 */
	p.init = function(clip)
	{
		//make sure the movieclip is framerate independent
		if (!clip.framerate)
		{
			clip.framerate = Application.instance.options.fps || 15;
		}
		clip.tickEnabled = false;

		this.clip = clip;
		this.isLooping = false;
		this.currentName = null;
		this.position = this.duration = 0;
		//ensure that if we call endAnim() before any animation
		//that it stays on the current frame
		this.lastFrame = clip.currentFrame;
	};

	p.beginAnim = function(animObj, isRepeat)
	{
		//calculate frames, duration, etc
		//then gotoAndPlay on the first frame
		var anim = this.currentName = animObj.anim;

		var l, first = -1,
			last = -1,
			loop = false;
		//the wildcard event plays the entire timeline
		if (anim == "*" && !this.clip.timeline.resolve(anim))
		{
			first = 0;
			last = this.clip.timeline.duration - 1;
			loop = !!animObj.loop;
		}
		else
		{
			var labels = this.clip.getLabels();
			//go through the list of labels (they are sorted by frame number)
			var stopLabel = anim + "_stop";
			var loopLabel = anim + "_loop";

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
		}

		this.firstFrame = first;
		this.lastFrame = last;
		this.length = last - first;
		this.isLooping = loop;
		var fps = this.clip.framerate;
		this.startTime = this.firstFrame / fps;
		this.duration = this.length / fps;
		if (isRepeat)
		{
			this.position = 0;
		}
		else
		{
			var animStart = animObj.start || 0;
			this.position = animStart < 0 ? Math.random() * this.duration : animStart;
		}

		this.clip.play();
		this.clip.elapsedTime = this.startTime + this.position;
		this.clip.advance();
	};

	/**
	 * Ends animation playback.
	 * @method endAnim
	 */
	p.endAnim = function()
	{
		this.clip.gotoAndStop(this.lastFrame);
	};

	/**
	 * Updates position to a new value, and does anything that the clip needs, like updating
	 * timelines.
	 * @method setPosition
	 * @param  {Number} newPos The new position in the animation.
	 */
	p.setPosition = function(newPos)
	{
		this.position = newPos;
		this.clip.elapsedTime = this.startTime + newPos;
		//because the movieclip only checks the elapsed time here (tickEnabled is false),
		//calling advance() with no parameters is fine - it won't advance the time
		this.clip.advance();
	};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	GenericMovieClipInstance.test = function(clip)
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
	 * Checks if animation exists
	 * @method hasAnimation
	 * @static
	 * @param {*} clip The clip to check for an animation.
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @return {Boolean} does this animation exist?
	 */
	GenericMovieClipInstance.hasAnimation = function(clip, event)
	{
		//the wildcard event plays the entire timeline
		if (event == "*" && !clip.timeline.resolve(event))
		{
			return true;
		}

		var labels = clip.getLabels();
		var startFrame = -1;
		var stopFrame = -1;
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
		return startFrame >= 0 && stopFrame > 0;
	};

	/**
	 * Calculates the duration of an animation or list of animations.
	 * @method getDuration
	 * @static
	 * @param  {*} clip The clip to check.
	 * @param  {String} event The animation or animation list.
	 * @return {Number} Animation duration in milliseconds.
	 */
	GenericMovieClipInstance.getDuration = function(clip, event)
	{
		//make sure the movieclip has a framerate
		if (!clip.framerate)
		{
			clip.framerate = Application.instance.options.fps || 15;
		}

		//the wildcard event plays the entire timeline
		if (event == "*" && !clip.timeline.resolve(event))
		{
			return clip.timeline.duration / clip.framerate * 1000;
		}

		var labels = clip.getLabels();
		var startFrame = -1;
		var stopFrame = -1;
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
			return (stopFrame - startFrame) / clip.framerate * 1000;
		}
		else
		{
			return 0;
		}
	};

	/**
	 * Reset this animator instance
	 * so it can be re-used.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.clip = null;
	};

	//Assign to namespace
	namespace('springroll').GenericMovieClipInstance = GenericMovieClipInstance;

}());
/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.Animator');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(50);

	//init the animator
	plugin.setup = function()
	{
		/**
		 * The class for playing animation
		 * @property {springroll.Animator} animator
		 */
		this.animator = new Animator(this);
		this.animator.captions = this.captions || null;
		this.animator.register('springroll.GenericMovieClipInstance', 0);
	};

	//destroy the animator
	plugin.teardown = function()
	{
		if (this.animator)
		{
			this.animator.destroy();
			this.animator = null;
		}
	};

}());