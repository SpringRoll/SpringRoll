/*! CloudKidFramework 0.0.3 */
/**
*  @module cloudkid
*/
(function(){

	"use strict";

	/**
	*   CreateJSDisplay is a display plugin for the CloudKid Framework 
	*	that uses the EaselJS library for rendering.
	*
	*   @class CreateJSDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the CreateJS stage.
	*	@param {String} [options.stageType="stage"] If the stage should be a normal stage or a SpriteStage (use "spriteStage").
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To disable them, use 0 or -1.
	*/
	var CreateJSDisplay = function(id, options)
	{
		this.id = id;
		options = options || {};
		this.canvas = document.getElementById(id);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this._visible = this.canvas.style.display != "none";
		if(options.mouseOverRate !== undefined)
			this.mouseOverRate = options.mouseOverRate;
		//make stage
		if(options.stageType == "spriteStage")
		{
			//TODO: make a sprite stage (not officially released yet)
		}
		else
		{
			this.stage = new createjs.Stage(id);
		}
		this.stage.autoClear = !!options.clearView;
		// prevent mouse down turning into text cursor
		this.canvas.onmousedown = function(e)
		{
			e.preventDefault();
		};
		this.enabled = true;//enable mouse/touch input
		/**
		*  The Animator class to use when using this display.
		*  @property {Animator} Animator
		*  @readOnly
		*  @public
		*/
		this.Animator = cloudkid.createjs.Animator;
	};

	var p = CreateJSDisplay.prototype = {};

	/**
	*  the canvas managed by this display
	*  @property {DOMElement} canvas
	*  @readOnly
	*  @public
	*/
	p.canvas = null;

	/**
	*  The DOM id for the canvas
	*  @property {String} id
	*  @readOnly
	*  @public
	*/
	p.id = null;

	/**
	*  Convenience method for getting the width of the canvas element
	*  would be the same thing as canvas.width
	*  @property {int} width
	*  @readOnly
	*  @public
	*/
	p.width = 0;

	/**
	*  Convenience method for getting the height of the canvas element
	*  would be the same thing as canvas.height
	*  @property {int} height
	*  @readOnly
	*  @public
	*/
	p.height = 0;

	/**
	*  The rendering library's stage element, the root display object
	*  @property {createjs.Stage|createjs.SpriteStage}
	*  @readOnly
	*  @public
	*/
	p.stage = null;

	/**
	*  If rendering is paused on this display only. Pausing all displays can be done
	*  using Application.paused setter.
	*  @property {Boolean} paused
	*  @public
	*/
	p.paused = false;

	/**
	*  The rate at which EaselJS calculates mouseover events, in times/second.
	*  @property {int} mouseOverRate
	*  @public
	*  @default 30
	*/
	p.mouseOverRate = 30;

	/**
	*  If input is enabled on the stage.
	*  @property {Boolean} _enabled
	*  @private
	*/
	p._enabled = false;

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
			if(value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				createjs.Touch.enable(this.stage);
			}
			else
			{
				this.stage.enableMouseOver(false);
				this.stage.enableDOMEvents(false);
				createjs.Touch.disable(this.stage);
				this.canvas.style.cursor = "";//reset the cursor
			}
		}
	});

	/**
	*  If the display is visible.
	*  @property {Boolean} _visible
	*  @private
	*/
	p._visible = false;

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
		}
	});

	/**
	* Resizes the canvas. This is only called by the Application.
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	};

	/** 
	* Updates the stage and draws it. This is only called by the Application. 
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;

		this.stage.update(elapsed);
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.stage.removeAllChildren(true);
		this.canvas.onmousedown = null;
		this.stage = this.canvas = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').CreateJSDisplay = CreateJSDisplay;
	namespace('cloudkid.createjs').CreateJSDisplay = CreateJSDisplay;

}());
/**
*  @module cloudkid
*/
(function(undefined){

	"use strict";

	// Imports
	var Application = cloudkid.Application,
		AnimatorTimeline = null;//saved in global init for less complicated build order
	
	/**
	*   Animator is a static class designed to provided
	*   base animation functionality, using frame labels of MovieClips
	*
	*   @class Animator
	*   @static
	*/
	var Animator = function(){};
	
	/**
	* The current version of the Animator class 
	* 
	* @property {String} VERSION
	* @public
	* @static
	*/
	Animator.VERSION = "${version}";
	
	/**
	* If we fire debug statements 
	* 
	* @property {bool} debug
	* @public
	* @static
	*/
	Animator.debug = false;
	
	/**
	* The instance of cloudkid.Audio or cloudkid.Sound for playing audio along with animations.
	* This MUST be set in order to play synced animations.
	* 
	* @property {cloudkid.Audio|cloudkid.Sound} soundLib
	* @public
	* @static
	*/
	Animator.soundLib = null;

	/**
	*  The global captions object to use with animator
	*  @property {cloudkid.Captions} captions
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
	* @property {bool} _paused
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
		AnimatorTimeline = cloudkid.createjs.AnimatorTimeline;
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
	*   @param {AnimatorTimeline} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {Object|function} [options] The object of optional parameters or onComplete callback function
	*   @param {function} [options.onComplete=null] The callback function when the animation is done
	*   @param {Array} [options.onCompleteParams=null] Parameters to pass to onComplete function
	*	@param {int} [options.startTime=0] The time in milliseconds into the animation to start. A value of -1 makes the animation play at a random startTime.
	*	@param {Number} [options.speed=1] The speed at which to play the animation.
	*	@param {Object|String} [options.soundData=null] soundData Data about a sound to sync the animation to, as an alias or in the format {alias:"MyAlias", start:0}.
	*		start is the seconds into the animation to start playing the sound. If it is omitted or soundData is a string, it defaults to 0.
	*   @param {bool} [options.doCancelledCallback=false] Should an overridden animation's callback function still run?
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.play = function(instance, event, options, onCompleteParams, startTime, speed, soundData, doCancelledCallback)
	{
		var onComplete;

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
		onCompleteParams = options.onCompleteParams || onCompleteParams || null;
		startTime = options.startTime || startTime;
		startTime = startTime ? startTime * 0.001 : 0;//convert into seconds, as that is what the time uses internally
		speed = options.speed || speed || 1;
		doCancelledCallback = options.doCancelledCallback || doCancelledCallback || false;
		soundData = options.soundData || soundData || null;

		if (!_timelines) 
			Animator.init();
		
		if (_timelinesMap[instance.id] !== undefined)
		{
			Animator.stop(instance, doCancelledCallback);
		}
		var timeline = Animator._makeTimeline(instance, event, onComplete, onCompleteParams, speed, soundData);
		
		if (timeline.firstFrame > -1 && timeline.lastFrame > -1)//if the animation is present and complete
		{
			timeline.time = startTime == -1 ? Math.random() * timeline.duration : startTime;
			
			instance.elapsedTime = timeline.startTime + timeline.time;
			instance.play();//have it set its 'paused' variable to false
			instance._tick();//update the movieclip to make sure it is redrawn correctly at the next opportunity
			
			// Before we add the timeline, we should check to see
			// if there are no timelines, then start the enter frame
			// updating
			if (!Animator._hasTimelines()) Animator._startUpdate();
			
			_timelines.push(timeline);
			_timelinesMap[instance.id] = timeline;

			//If the sound doesn't play immediately and we can preload it, we should do that
			if(timeline.soundStart > 0 && Animator.soundLib.preloadSound)
			{
				Animator.soundLib.preloadSound(timeline.soundAlias);
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
	*   Play an animation for a frame label event, starting at a random frame within the animation
	*   
	*   @function playAtRandomFrame
	*   @param {AnimatorTimeline} instance The timeline to animate.
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose_stop").
	*   @param {Object|function} [options] The object of optional parameters or onComplete callback function
	*   @param {function} [options.onComplete=null] The callback function when the animation is done
	*   @param {Array} [options.onCompleteParams=null] Parameters to pass to onComplete function
	*	@param {Number} [options.speed=1] The speed at which to play the animation.
	*	@param {Object} [options.soundData=null] soundData Data about a sound to sync the animation to, as an alias or in the format {alias:"MyAlias", start:0}.
	*		start is the seconds into the animation to start playing the sound. If it is omitted or soundData is a string, it defaults to 0.
	*   @param {bool} [options.doCancelledCallback=false] Should an overridden animation's callback function still run?
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.playAtRandomFrame = function(instance, event, options, onCompleteParams, speed, soundData, doCancelledCallback)
	{
		return Animator.play(instance, event, options, onCompleteParams, -1, speed, soundData, doCancelledCallback);
	};
	
	/**
	*   Creates the AnimatorTimeline for a given animation
	*   
	*   @function _makeTimeline
	*   @param {easeljs.MovieClip} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {function} onComplete The function to callback when we're done
	*   @param {function} onCompleteParams Parameters to pass to onComplete function
	*   @param {Number} speed The speed at which to play the animation.
	*	@param {Object} soundData Data about sound to sync the animation to.
	*   @return {AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(instance, event, onComplete, onCompleteParams, speed, soundData)
	{
		var timeline = new AnimatorTimeline();
		if(!Animator._canAnimate(instance))//not a movieclip
		{
			return timeline;
		}
		instance.advanceDuringTicks = false;//make sure the movieclip doesn't play outside the control of Animator
		var fps;
		if(!instance.framerate)//make sure the movieclip is framerate independent
		{
			fps = Application.instance.options.fps;
			if(!fps)
				fps = Application.instance.fps;
			if(!fps)
				fps = 15;
			instance.framerate = fps;
		}
		else
			fps = instance.framerate;//we'll want this for some math later
		timeline.instance = instance;
		timeline.event = event;
		timeline.onComplete = onComplete;
		timeline.onCompleteParams = onCompleteParams;
		timeline.speed = speed;
		if(soundData)
		{
			timeline.playSound = true;
			if(typeof soundData == "string")
			{
				timeline.soundStart = 0;
				timeline.soundAlias = soundData;
			}
			else
			{
				timeline.soundStart = soundData.start > 0 ? soundData.start : 0;//seconds
				timeline.soundAlias = soundData.alias;
			}
			timeline.useCaptions = Animator.captions && Animator.captions.hasCaption(timeline.soundAlias);
		}
		
		//go through the list of labels (they are sorted by frame number)
		var labels = instance.getLabels();
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			var l = labels[i];
			if(l.label == event)
			{
				timeline.firstFrame = l.position;
			}
			else if(l.label == stopLabel)
			{
				timeline.lastFrame = l.position;
				break;
			}
			else if(l.label == loopLabel)
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
	*	MovieClips from EaselJS to be animated if they share the same API. Note - 'id' is a property with
	*	a unique value for each createjs.DisplayObject. If a custom object is made that does not inherit from DisplayObject,
	*	it needs to not have an id that is identical to anything from EaselJS.
	*   
	*   @function _canAnimate
	*   @param {easeljs.MovieClip} instance The object to check for animation properties.
	*   @return {Boolean} If the instance can be animated or not.
	*   @private
	*   @static
	*/
	Animator._canAnimate = function(instance)
	{
		if(instance instanceof createjs.MovieClip)//all createjs.MovieClips are A-OK
			return true;
		if(instance.framerate !== undefined &&//property - calculate timing
			instance.getLabels !== undefined &&//method - get framelabels
			instance.elapsedTime !== undefined &&//property - set time passed
			instance._tick !== undefined &&//method - update after setting elapsedTime
			instance.gotoAndStop !== undefined &&//method - stop at end of anim
			instance.play !== undefined &&//method - start playing
			instance.id !== undefined)//property - used to avoid duplication of timelines
			return true;
		if(DEBUG)
		{
			Debug.error("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
		}
		return false;
	};

	/**
	*   Checks if animation exists
	*   
	*   @function _makeTimeline
	*   @param {easeljs.MovieClip} instance The timeline to check
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @public
	*   @static
	*	@return {bool} does this animation exist?
	*/
	Animator.instanceHasAnimation = function(instance, event)
	{
		var labels = instance.getLabels();
		var startFrame = -1, stopFrame = -1;
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			var l = labels[i];
			if(l.label == event)
			{
				startFrame = l.position;
			}
			else if(l.label == stopLabel || l.label == loopLabel)
			{
				stopFrame = l.position;
				break;
			}
		}

		return startFrame >= 0 && stopFrame >= 0;
	};
	
	/**
	*   Stop the animation.
	*   
	*   @function stop
	*   @param {createjs.MovieClip} instance The MovieClip to stop the action on
	*   @param {bool} doOnComplete If we are suppose to do the complete callback when stopping (default is false)
	*   @static
	*/
	Animator.stop = function(instance, doOnComplete)
	{
		doOnComplete = doOnComplete || false;
		
		if (!_timelines) return;
		
		if (_timelinesMap[instance.id] === undefined)
		{
			if (DEBUG)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
			return;
		}
		var timeline = _timelinesMap[instance.id];
		Animator._remove(timeline, doOnComplete);
	};
	
	/**
	*   Stop all current Animator animations.
	*   This is good for cleaning up all animation, as it doesn't do a callback on any of them.
	*   
	*   @function stopAll
	*   @param {createjs.Container} container Optional - specify a container to stop timelines contained within
	*   @static
	*/
	Animator.stopAll = function(container)
	{
		if (!Animator._hasTimelines()) return;
		
		var timeline;
		var removedTimelines = _timelines.slice();

		for(var i=0; i < removedTimelines.length; i++)
		{
			timeline = removedTimelines[i];
			
			if (!container || container.contains(timeline.instance))
			{
				Animator._remove(timeline, false);
			}
		}
	};
	
	/**
	*   Remove a timeline from the stack
	*   
	*   @function _remove
	*   @param {AnimatorTimeline} timeline
	*   @param {bool} doOnComplete If we do the on complete callback
	*   @private
	*   @static
	*/
	Animator._remove = function(timeline, doOnComplete)
	{
		var index = _removedTimelines.indexOf(timeline);
		if (index >= 0)
		{
			_removedTimelines.splice(index, 1);
		}
		
		index = _timelines.indexOf(timeline);
		
		// We can't remove an animation twice
		if (index < 0) return;
		
		var onComplete = timeline.onComplete;
		var onCompleteParams = timeline.onCompleteParams;
		
		// Stop the animation
		timeline.instance.stop();

		//in most cases, if doOnComplete is true, it's a natural stop and the audio can be allowed to continue
		if(!doOnComplete && timeline.soundInst)
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
		
		if (doOnComplete && onComplete)
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
		
		for(var i = 0; i < _timelines.length; i++)
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
		if(!_timelines) return;
		
		if (!_paused) return;
		
		_paused = false;
		
		// Resume playing of all the instances
		for(var i = 0; i < _timelines.length; i++)
		{
			_timelines[i].paused = false;
		}
		if (Animator._hasTimelines()) Animator._startUpdate();
	};
	
	/**
	*   Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
	*   
	*   @function pauseInGroup
	*   @param {bool} paused If this should be paused or unpaused
	*   @param {createjs.Container} container The container to stop timelines contained within
	*   @static
	*/
	Animator.pauseInGroup = function(paused, container)
	{
		if (!Animator._hasTimelines() || !container) return;
		
		for(var i=0; i< _timelines.length; i++)
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
	*  @return {bool} if we're paused or not
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
		if(!_timelines) return;
		
		var delta = elapsed * 0.001;//ms -> sec
		
		var t;
		for(var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			var instance = t.instance;
			if(t.paused) continue;
			
			if(t.soundInst)
			{
				if(t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					var audioPos = t.soundInst.position * 0.001;
					if(audioPos < 0)
						audioPos = 0;
					t.time = t.soundStart + audioPos;
					
					if (t.useCaptions)
					{
						Animator.captions.seek(t.soundInst.position);
					}
					//if the sound goes beyond the animation, then stop the animation
					//audio animations shouldn't loop, because doing that properly is difficult
					//letting the audio continue should be okay though
					if(t.time >= t.duration)
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
				if(t.time >= t.duration)
				{
					if(t.isLooping)
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
				if(t.playSound && t.time >= t.soundStart)
				{
					t.time = t.soundStart;
					t.soundInst = Animator.soundLib.play(
						t.soundAlias, 
						onSoundDone.bind(this, t), 
						onSoundStarted.bind(this, t)
					);
					if (t.useCaptions)
					{
						Animator.captions.isSlave = true;
						Animator.captions.run(t.soundAlias);
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
			Animator._remove(t, true);
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
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;//convert sound length to seconds
	};
	
	/**
	*  The sound is done
	*  @method onSoundDone
	*  @private
	*  @param {AnimatorTimeline} timeline
	*/
	var onSoundDone = function(timeline)
	{
		if(timeline.soundEnd > 0 && timeline.soundEnd > timeline.time)
			timeline.time = timeline.soundEnd;
		timeline.soundInst = null;
	};
	
	/**
	*  Check to see if we have timeline
	*  
	*  @function _hasTimelines
	*  @return {bool} if we have timelines
	*  @private
	*  @static
	*/
	Animator._hasTimelines = function()
	{
		if(!_timelines) return false;
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
		return "[Animator version:" + Animator.VERSION + "]";
	};
	
	// Assign to the global namespace
	namespace('cloudkid').Animator = Animator;
	namespace('cloudkid.createjs').Animator = Animator;

}());
/**
*  @module cloudkid
*/
(function(){

	"use strict";

	/**
	*   Animator Timeline is a class designed to provide
	*   base animation functionality
	*   
	*   @class AnimatorTimeline
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
/**
 *  @module cloudkid
 */
(function(undefined)
{

	"use strict";

	/**
	 *  A Multipurpose button class. It is designed to have one image, and an optional text label.
	 *  The button can be a normal button or a selectable button.
	 *  The button functions similarly with both CreateJS and PIXI, but slightly differently in
	 *  initialization and callbacks. Add event listeners for click and mouseover to know about
	 *  button clicks and mouse overs, respectively.
	 *
	 *  @class Button
	 *  @extends createjs.Container
	 *  @constructor
	 *  @param {Object|Image|HTMLCanvasElement} [imageSettings] Information about the art to be used for button states, as well as if the button is selectable or not.
	 *         If this is an Image or Canvas element, then the button assumes that the image is full width and 3 images
	 *         tall, in the order (top to bottom) up, over, down. If so, then the properties of imageSettings are ignored.
	 *  @param {Image|HTMLCanvasElement} [imageSettings.image] The image to use for all of the button states.
	 *  @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults to ["disabled", "down", "over", "up"].
	 *         Previous versions of Button used a hard coded order: ["highlighted", "disabled", "down", "over", "selected", "up"].
	 *  @param {Object} [imageSettings.up] The visual information about the up state.
	 *  @param {createjs.Rectangle} [imageSettings.up.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.up.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.up.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.over=null] The visual information about the over state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.over.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.over.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.over.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.down=null] The visual information about the down state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.down.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.down.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.down.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.disabled=null] The visual information about the disabled state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.disabled.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.disabled.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.disabled.label=null] Label information specific to this state. Properties on this parameter override
	 *         data in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.<yourCustomState>=null] The visual information about a custom state found in imageSettings.priority.
	 *         Any state added this way has a property of the same name added to the button. Examples of previous states that have been
	 *         moved to this system are "selected" and "highlighted".
	 *  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.trim=null] Trim data about the state, where x & y are how many pixels
	 *         were trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to this state. Properties on this parameter
	 *         override data in the label parameter for this button state only. All values except "text" from the label parameter may be
	 *         overridden.
	 *  @param {createjs.Point} [imageSettings.origin=null] An optional offset for all button graphics, in case you want button
	 *         positioning to not include a highlight glow, or any other reason you would want to offset the button art and label.
	 *  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	 *  @param {String} [label.text] The text to display on the label.
	 *  @param {String} [label.font] The font name and size to use on the label, as createjs.Text expects.
	 *  @param {String} [label.color] The color of the text to use on the label, as createjs.Text expects.
	 *  @param {String} [label.textBaseline="middle"] The baseline for the label text, as createjs.Text expects.
	 *  @param {Object} [label.stroke=null] The stroke to use for the label text, if desired, as createjs.Text (CloudKid fork only) expects.
	 *  @param {createjs.Shadow} [label.shadow=null] A shadow object to apply to the label text.
	 *  @param {String|Number} [label.x="center"] An x position to place the label text at relative to the button. If omitted,
	 *         "center" is used, which attempts to horizontally center the label on the button.
	 *  @param {String|Number} [label.y="center"] A y position to place the label text at relative to the button. If omitted,
	 *         "center" is used, which attempts to vertically center the label on the button. This may be unreliable -
	 *         see documentation for createjs.Text.getMeasuredLineHeight().
	 *  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	var Button = function(imageSettings, label, enabled)
	{
		if (!imageSettings) return;
		this.initialize(imageSettings, label, enabled);
	};

	// Extend Container
	var p = Button.prototype = new createjs.Container();

	var s = createjs.Container.prototype; //super

	/**
	 *  The sprite that is the body of the button.
	 *  @public
	 *  @property {createjs.Bitmap} back
	 *  @readOnly
	 */
	p.back = null;

	/**
	 *  The text field of the button. The label is centered by both width and height on the button.
	 *  @public
	 *  @property {createjs.Text} label
	 *  @readOnly
	 */
	p.label = null;

	//===callbacks for mouse/touch events
	/**
	 * Callback for mouse over, bound to this button.
	 * @private
	 * @property {Function} _overCB
	 */
	p._overCB = null;

	/**
	 * Callback for mouse out, bound to this button.
	 * @private
	 * @property {Function} _outCB
	 */
	p._outCB = null;

	/**
	 * Callback for mouse down, bound to this button.
	 * @private
	 * @property {Function} _downCB
	 */
	p._downCB = null;

	/**
	 * Callback for press up, bound to this button.
	 * @private
	 * @property {Function} _upCB
	 */
	p._upCB = null;

	/**
	 * Callback for click, bound to this button.
	 * @private
	 * @property {Function} _clickCB
	 */
	p._clickCB = null;

	/**
	 * A dictionary of state booleans, keyed by state name.
	 * @private
	 * @property {Object} _stateFlags
	 */
	p._stateFlags = null;
	/**
	 * An array of state names (Strings), in their order of priority.
	 * The standard order previously was ["highlighted", "disabled", "down", "over", "selected", "up"].
	 * @private
	 * @property {Array} _statePriority
	 */
	p._statePriority = null;

	/**
	 * A dictionary of state graphic data, keyed by state name.
	 * Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
	 * Additionally, each object will contain a 'label' object if the button has a text label.
	 * @private
	 * @property {Object} _stateData
	 */
	p._stateData = null;

	/**
	 * The width of the button art, independent of the scaling of the button itself.
	 * @private
	 * @property {Number} _width
	 */
	p._width = 0;

	/**
	 * The height of the button art, independent of the scaling of the button itself.
	 * @private
	 * @property {Number} _height
	 */
	p._height = 0;

	/**
	 * An offset to button positioning, generally used to adjust for a highlight around the button.
	 * @private
	 * @property {createjs.Point} _offset
	 */
	p._offset = null;

	/**
	 * An event for when the button is pressed (while enabled).
	 * @public
	 * @static
	 * @property {String} BUTTON_PRESS
	 */
	Button.BUTTON_PRESS = "buttonPress";

	/*
	 * A list of state names that should not have properties autogenerated.
	 * @private
	 * @static
	 * @property {Array} RESERVED_STATES
	 */
	var RESERVED_STATES = ["disabled", "enabled", "up", "over", "down"];
	/*
	 * A state priority list to use as the default.
	 * @private
	 * @static
	 * @property {Array} DEFAULT_PRIORITY
	 */
	var DEFAULT_PRIORITY = ["disabled", "down", "over", "up"];

	/** 
	 *  Constructor for the button when using CreateJS.
	 *  @method initialize
	 *  @param {Object|Image|HTMLCanvasElement} [imageSettings] See the constructor for more information
	 *  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	 *  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	p.initialize = function(imageSettings, label, enabled)
	{
		s.initialize.call(this);

		this.mouseChildren = false; //input events should have this button as a target, not the child Bitmap.

		this._downCB = this._onMouseDown.bind(this);
		this._upCB = this._onMouseUp.bind(this);
		this._overCB = this._onMouseOver.bind(this);
		this._outCB = this._onMouseOut.bind(this);
		this._clickCB = this._onClick.bind(this);

		var _stateData = this._stateData = {};
		this._stateFlags = {};
		this._offset = new createjs.Point();

		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if (label)
		{
			labelData = clone(label);
			delete labelData.text;
			if (labelData.x === undefined)
				labelData.x = "center";
			if (labelData.y === undefined)
				labelData.y = "center";
		}

		var image, width, height, i, state;
		if (imageSettings.image) //is a settings object with rectangles
		{
			image = imageSettings.image;
			this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;
			//each rects object has a src property (createjs.Rectangle), and optionally a trim rectangle
			for (i = this._statePriority.length - 1; i >= 0; --i) //start at the end to start at the up state
			{
				state = this._statePriority[i];
				//set up the property for the state so it can be set - the function will ignore reserved states
				this._addProperty(state);
				//set the default value for the state flag
				if (state != "disabled" && state != "up")
					this._stateFlags[state] = false;
				var inputData = imageSettings[state];
				//it's established that over, down, and particularly disabled default to the up state
				_stateData[state] = inputData ? clone(inputData) : _stateData.up;
				//set up the label info for this state
				if (label)
				{
					//if there is actual label data for this state, use that
					if (inputData && inputData.label)
					{
						inputData = inputData.label;
						var stateLabel = _stateData[state].label = {};
						stateLabel.font = inputData.font || labelData.font;
						stateLabel.color = inputData.color || labelData.color;
						stateLabel.stroke = inputData.hasOwnProperty("stroke") ? inputData.stroke : labelData.stroke;
						stateLabel.shadow = inputData.hasOwnProperty("shadow") ? inputData.shadow : labelData.shadow;
						stateLabel.textBaseline = inputData.textBaseline || labelData.textBaseline;
						stateLabel.x = inputData.x || labelData.x;
						stateLabel.y = inputData.y || labelData.y;
					}
					//otherwise use the default
					else
						_stateData[state].label = labelData;
				}
			}
			if (_stateData.up.trim) //if the texture is trimmed, use that for the sizing
			{
				var upTrim = _stateData.up.trim;
				width = upTrim.width;
				height = upTrim.height;
			}
			else //texture is not trimmed and is full size
			{
				width = _stateData.up.src.width;
				height = _stateData.up.src.height;
			}
			//ensure that our required states exist
			if (!_stateData.up)
			{
				Debug.error("Button lacks an up state! This is a serious problem! Input data follows:");
				Debug.error(imageSettings);
			}
			if (!_stateData.over)
				_stateData.over = _stateData.up;
			if (!_stateData.down)
				_stateData.down = _stateData.up;
			if (!_stateData.disabled)
				_stateData.disabled = _stateData.up;
			//set up the offset
			if (imageSettings.offset)
			{
				this._offset.x = imageSettings.offset.x;
				this._offset.y = imageSettings.offset.y;
			}
			else
			{
				this._offset.x = this._offset.y = 0;
			}
		}
		else //imageSettings is just an image to use directly - use the old stacked images method
		{
			image = imageSettings;
			width = image.width;
			height = image.height / 3;
			this._statePriority = DEFAULT_PRIORITY;
			_stateData.disabled = _stateData.up = {
				src: new createjs.Rectangle(0, 0, width, height)
			};
			_stateData.over = {
				src: new createjs.Rectangle(0, height, width, height)
			};
			_stateData.down = {
				src: new createjs.Rectangle(0, height * 2, width, height)
			};
			if (labelData)
			{
				_stateData.up.label =
					_stateData.over.label =
					_stateData.down.label =
					_stateData.disabled.label = labelData;
			}
			this._offset.x = this._offset.y = 0;
		}

		this.back = new createjs.Bitmap(image);
		this.addChild(this.back);
		this._width = width;
		this._height = height;

		if (label)
		{
			this.label = new createjs.Text(label.text || "", _stateData.up.label.font, _stateData.up.label.color);
			this.addChild(this.label);
		}

		//set the button state initially
		this.enabled = enabled === undefined ? true : !!enabled;
	};

	/*
	 *  A simple function for making a shallow copy of an object.
	 */
	function clone(obj)
	{
		if (!obj || "object" != typeof obj) return null;
		var copy = obj.constructor();
		for (var attr in obj)
		{
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}

	/**
	 *  The width of the button, based on the width of back. This value is affected by scale.
	 *  @property {Number} width
	 */
	Object.defineProperty(p, "width",
	{
		get: function()
		{
			return this._width * this.scaleX;
		},
		set: function(value)
		{
			this.scaleX = value / this._width;
		}
	});

	/**
	 *  The height of the button, based on the height of back. This value is affected by scale.
	 *  @property {Number} height
	 */
	Object.defineProperty(p, "height",
	{
		get: function()
		{
			return this._height * this.scaleY;
		},
		set: function(value)
		{
			this.scaleY = value / this._height;
		}
	});

	/**
	 *  Sets the text of the label. This does nothing if the button was not initialized with a label.
	 *  @public
	 *  @method setText
	 *  @param {String} text The text to set the label to.
	 */
	p.setText = function(text)
	{
		if (this.label)
		{
			this.label.text = text;
			var data;
			for (var i = 0; i < this._statePriority.length; ++i)
			{
				if (this._stateFlags[this._statePriority[i]])
				{
					data = this._stateData[this._statePriority[i]];
					break;
				}
			}
			if (!data)
				data = this._stateData.up;
			data = data.label;
			if (data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if (data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};

	/**
	 *  Whether or not the button is enabled.
	 *  @property {Boolean} enabled
	 *  @default true
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return !this._stateFlags.disabled;
		},
		set: function(value)
		{
			this._stateFlags.disabled = !value;

			if (value)
			{
				this.cursor = 'pointer';
				this.addEventListener('mousedown', this._downCB);
				this.addEventListener('mouseover', this._overCB);
				this.addEventListener('mouseout', this._outCB);
			}
			else
			{
				this.cursor = null;
				this.removeEventListener('mousedown', this._downCB);
				this.removeEventListener('mouseover', this._overCB);
				this.removeEventListener('mouseout', this._outCB);
				this.removeEventListener('pressup', this._upCB);
				this.removeEventListener("click", this._clickCB);
				this._stateFlags.down = this._stateFlags.over = false;
			}

			this._updateState();
		}
	});

	/**
	 *  Adds a property to the button. Setting the property sets the value in
	 *  _stateFlags and calls _updateState().
	 *  @private
	 *  @method _addProperty
	 *  @param {String} propertyName The property name to add to the button.
	 */
	p._addProperty = function(propertyName)
	{
		//check to make sure we don't add reserved names
		if (RESERVED_STATES.indexOf(propertyName) >= 0) return;

		Object.defineProperty(this, propertyName,
		{
			get: function()
			{
				return this._stateFlags[propertyName];
			},
			set: function(value)
			{
				this._stateFlags[propertyName] = value;
				this._updateState();
			}
		});
	};

	/**
	 *  Updates back based on the current button state.
	 *  @private
	 *  @method _updateState
	 */
	p._updateState = function()
	{
		if (!this.back) return;
		var data;
		//use the highest priority state
		for (var i = 0; i < this._statePriority.length; ++i)
		{
			if (this._stateFlags[this._statePriority[i]])
			{
				data = this._stateData[this._statePriority[i]];
				break;
			}
		}
		//if no state is active, use the up state
		if (!data)
			data = this._stateData.up;
		this.back.sourceRect = data.src;
		//position the button back
		if (data.trim)
		{
			this.back.x = data.trim.x + this._offset.x;
			this.back.y = data.trim.y + this._offset.y;
		}
		else
		{
			this.back.x = this._offset.x;
			this.back.y = this._offset.y;
		}
		//if we have a label, update that too
		if (this.label)
		{
			data = data.label;
			//update the text properties
			this.label.textBaseline = data.textBaseline || "middle"; //Middle is easy to center
			this.label.stroke = data.stroke;
			this.label.shadow = data.shadow;
			this.label.font = data.font;
			this.label.color = data.color || "#000"; //default for createjs.Text
			//position the text
			if (data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if (data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};

	/**
	 *  The callback for when the button receives a mouse down event.
	 *  @private
	 *  @method _onMouseDown
	 */
	p._onMouseDown = function(e)
	{
		this.addEventListener('pressup', this._upCB);
		this.addEventListener("click", this._clickCB);
		this._stateFlags.down = true;
		this._updateState();
	};

	/**
	 *  The callback for when the button for when the mouse/touch is released on the button
	 *  - only when the button was held down initially.
	 *  @private
	 *  @method _onMouseUp
	 */
	p._onMouseUp = function(e)
	{
		this.removeEventListener('pressup', this._upCB);
		this.removeEventListener("click", this._clickCB);
		this._stateFlags.down = false;
		//if the over flag is true, then the mouse was released while on the button, thus being a click
		this._updateState();
	};

	/**
	 *  The callback for when the button the button is clicked or tapped on. This is
	 *  the most reliable way of detecting mouse up/touch end events that are on this button
	 *  while letting the pressup event handle the mouse up/touch ends on and outside the button.
	 *  @private
	 *  @method _onClick
	 */
	p._onClick = function(e)
	{
		this.dispatchEvent(new createjs.Event(Button.BUTTON_PRESS));
	};

	/**
	 *  The callback for when the button is moused over.
	 *  @private
	 *  @method _onMouseOver
	 */
	p._onMouseOver = function(e)
	{
		this._stateFlags.over = true;
		this._updateState();
	};

	/**
	 *  The callback for when the mouse leaves the button area.
	 *  @private
	 *  @method _onMouseOut
	 */
	p._onMouseOut = function(e)
	{
		this._stateFlags.over = false;
		this._updateState();
	};

	/**
	 *  Destroys the button.
	 *  @public
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.removeAllChildren();
		this.removeAllEventListeners();
		this._downCB = null;
		this._upCB = null;
		this._overCB = null;
		this._outCB = null;
		this.back = null;
		this.label = null;
		this._statePriority = null;
		this._stateFlags = null;
		this._stateData = null;
	};

	/**
	 *  Generates a desaturated up state as a disabled state, and an update with a solid colored glow for a highlighted state.
	 *  @method generateDefaultStates
	 *  @static
	 *  @param {Image|HTMLCanvasElement} image The image to use for all of the button states, in the standard up/over/down format.
	 *  @param {Object} [disabledSettings] The settings object for the disabled state. If omitted, no disabled state is created.
	 *  @param {Number} [disabledSettings.saturation] The saturation adjustment for the disabled state.
	 *			100 is fully saturated, 0 is unchanged, -100 is desaturated.
	 *  @param {Number} [disabledSettings.brightness] The brightness adjustment for the disabled state.
	 *			100 is fully bright, 0 is unchanged, -100 is completely dark.
	 *  @param {Number} [disabledSettings.contrast] The contrast adjustment for the disabled state.
	 *			100 is full contrast, 0 is unchanged, -100 is no contrast.
	 *  @param {Object} [highlightSettings] The settings object for the highlight state. If omitted, no state is created.
	 *  @param {Number} [highlightSettings.size] How many pixels to make the glow, eg 8 for an 8 pixel increase on each side.
	 *  @param {Number} [highlightSettings.red] The red value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.green] The green value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.blue] The blue value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.alpha=255] The alpha value for the glow, from 0 to 255, with 0 being transparent and 255 fully opaque.
	 *  @param {Array} [highlightSettings.rgba] An array of values to use for red, green, blue, and optionally alpha that can be used
	 *			instead of providing separate properties on highlightSettings.
	 */
	Button.generateDefaultStates = function(image, disabledSettings, highlightSettings)
	{
		//figure out the normal button size
		var buttonWidth = image.width;
		var buttonHeight = image.height / 3;
		//create a canvas element and size it
		var canvas = document.createElement("canvas");
		var width = buttonWidth;
		var height = image.height;
		if (disabledSettings)
		{
			height += buttonHeight;
		}
		if (highlightSettings)
		{
			Debug.log(highlightSettings.rgba);	
			width += highlightSettings.size * 2;
			height += buttonHeight + highlightSettings.size * 2;
			if (highlightSettings.rgba)
			{
				highlightSettings.red = highlightSettings.rgba[0];
				highlightSettings.green = highlightSettings.rgba[1];
				highlightSettings.blue = highlightSettings.rgba[2];

				if (highlightSettings.rgba[3])
				{
					highlightSettings.alpha = highlightSettings.rgba[3];
				}
			}
		}
		canvas.width = width;
		canvas.height = height;
		//get the drawing context
		var context = canvas.getContext("2d");
		//draw the image to it
		context.drawImage(image, 0, 0);
		//start setting up the output
		var output = {
			image: canvas,
			up:
			{
				src: new createjs.Rectangle(0, 0, buttonWidth, buttonHeight)
			},
			over:
			{
				src: new createjs.Rectangle(0, buttonHeight, buttonWidth, buttonHeight)
			},
			down:
			{
				src: new createjs.Rectangle(0, buttonHeight * 2, buttonWidth, buttonHeight)
			}
		};
		//set up a bitmap to draw other states with
		var drawingBitmap = new createjs.Bitmap(image);
		drawingBitmap.sourceRect = output.up.src;
		//set up a y position for where the next state should go in the canvas
		var nextY = image.height;
		if (disabledSettings)
		{
			context.save();
			//position the button to draw
			context.translate(0, nextY);
			//set up the desaturation matrix
			var matrix = new createjs.ColorMatrix();
			if (disabledSettings.saturation !== undefined)
				matrix.adjustSaturation(disabledSettings.saturation);
			if (disabledSettings.brightness !== undefined)
				matrix.adjustBrightness(disabledSettings.brightness * 2.55); //convert to CreateJS's -255->255 system from -100->100
			if (disabledSettings.contrast !== undefined)
				matrix.adjustContrast(disabledSettings.contrast);
			drawingBitmap.filters = [new createjs.ColorMatrixFilter(matrix)];
			//draw the state
			drawingBitmap.cache(0, 0, output.up.src.width, output.up.src.height);
			drawingBitmap.draw(context);
			//update the output with the state
			output.disabled = {
				src: new createjs.Rectangle(0, nextY, buttonWidth, buttonHeight)
			};
			nextY += buttonHeight; //set up the next position for the highlight state, if we have it
			context.restore(); //reset any transformations
		}
		if (highlightSettings)
		{
			context.save();
			//calculate the size of this state
			var highlightStateWidth = buttonWidth + highlightSettings.size * 2;
			var highlightStateHeight = buttonHeight + highlightSettings.size * 2;
			//set up the color changing filter
			drawingBitmap.filters = [new createjs.ColorFilter(0, 0, 0, 1,
				/*r*/
				highlightSettings.red,
				/*g*/
				highlightSettings.green,
				/*b*/
				highlightSettings.blue,
				highlightSettings.alpha !== undefined ? -255 + highlightSettings.alpha : 0)];
			//size the colored highlight
			drawingBitmap.scaleX = (highlightStateWidth) / buttonWidth;
			drawingBitmap.scaleY = (highlightStateHeight) / buttonHeight;
			//position it
			drawingBitmap.x = 0;
			drawingBitmap.y = nextY;
			//draw the state
			drawingBitmap.cache(0, 0, highlightStateWidth, highlightStateHeight);
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			context.restore(); //reset any transformations
			//size and position it to normal
			drawingBitmap.scaleX = drawingBitmap.scaleY = 1;
			drawingBitmap.x = highlightSettings.size;
			drawingBitmap.y = nextY + highlightSettings.size;
			drawingBitmap.filters = null;
			drawingBitmap.uncache();
			//draw the up state over the highlight state glow
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			//set up the trim values for the other states
			var trim = new createjs.Rectangle(
				highlightSettings.size,
				highlightSettings.size,
				highlightStateWidth,
				highlightStateHeight);
			output.up.trim = trim;
			output.over.trim = trim;
			output.down.trim = trim;
			if (output.disabled)
				output.disabled.trim = trim;
			//set up the highlight state for the button
			output.highlighted = {
				src: new createjs.Rectangle(0, nextY, highlightStateWidth, highlightStateHeight)
			};
			//set up the state priority to include the highlighted state
			output.priority = DEFAULT_PRIORITY.slice();
			output.priority.unshift("highlighted");
			//add in an offset to the button to account for the highlight glow without affecting button positioning
			output.offset = {
				x: -highlightSettings.size,
				y: -highlightSettings.size
			};
		}
		return output;
	};

	namespace('cloudkid').Button = Button;
	namespace('cloudkid.createjs').Button = Button;
}());
/**
*  @module cloudkid
*/
(function(){
	
	"use strict";

	/**
	*   CharacterClip is used by the CharacterController class
	*   
	*   @class CharacterClip
	*   @constructor
	*   @param {String} event Animator event to play
	*   @param {int} loops The number of loops
	*/
	var CharacterClip = function(event, loops)
	{
		this.initialize(event, loops);
	};
	
	var p = CharacterClip.prototype;
	
	/**
	* The event to play
	*
	*@property {String} event
	*/
	p.event = null;
	
	/**
	* The number of times to loop
	* 
	* @property {int} loops
	*/
	p.loops = 0;
	
	/**
	*   Initialiaze this character clip
	*   
	*   @function initialize
	*   @param {String} event The frame label to play using Animator.play
	*   @param {int} loops The number of times to loop, default of 0 plays continuously
	*/
	p.initialize = function(event, loops)
	{
		this.event = event;
		this.loops = loops || 0;
	};
	
	// Assign to the cloudkid namespace
	namespace('cloudkid').CharacterClip = CharacterClip;
	namespace('cloudkid.createjs').CharacterClip = CharacterClip;
}());
/**
*  @module cloudkid
*/
(function(){

	"use strict";

	// Imports
	var Animator = cloudkid.createjs.Animator;
	
	/**
	*   Character Controller class is designed to play animated
	*   sequences on the timeline. This is a flexible way to
	*   animate characters on a timeline
	*   
	*   @class CharacterController
	*/
	var CharacterController = function()
	{
		this.initialize();
	};
	
	var p = CharacterController.prototype;
	
	/**
	* The current stack of animations to play
	*
	* @property {Array} _animationStack
	* @private
	*/
	p._animationStack = null;
	
	/**
	* The currently playing animation 
	* 
	* @property {CharacterClip} _currentAnimation
	* @private
	*/
	p._currentAnimation = null;
	
	/**
	* Current number of loops for the current animation
	* 
	* @property {int} _loops
	* @private
	*/
	p._loops = 0;
	
	/**
	* If the current animation choreographies can't be interrupted 
	* 
	* @property {bool} _interruptable
	* @private
	*/
	p._interruptable = true;
	
	/**
	* If frame dropping is allowed for this animation set
	* 
	* @property {bool} _allowFrameDropping
	* @private
	*/
	p._allowFrameDropping = false;
	
	/**
	* The current character
	* 
	* @property {createjs.MovieClip} _character
	* @private
	*/
	p._character = null;
	
	/**
	* Callback function for playing animation 
	* 
	* @property {function} _callback
	* @private
	*/
	p._callback = null;
	
	/** 
	* If this instance has been destroyed
	* 
	* @property {bool} _destroyed
	* @private
	*/
	p._destroyed = false;
	
	/**
	* Initiliazes this Character controller
	* 
	* @function initialize
	*/
	p.initialize = function()
	{
		this._animationStack = [];
	};
	
	/**
	*   Set the current character, setting to null clears character
	*   
	*   @function setCharacter
	*   @param {createjs.MovieClip} character MovieClip
	*/
	p.setCharacter = function(character)
	{
		this.clear();
		this._character = character;
		if (this._character)
		{
			Debug.assert(this._character instanceof createjs.MovieClip, "character must subclass MovieClip");
			this._character.stop();
		}
	};
	
	/**
	*   If we want to play a static frame
	*   
	*   @function gotoFrameAndStop
	*   @param {String} event The frame label to stop on
	*/
	p.gotoFrameAndStop = function(event)
	{
		Debug.assert(this._character, "gotoFrameAndStop() requires a character!");
		Animator.stop(this._character);
		this._animationStack.length = 0;
		this._character.gotoAndStop(event);
	};
	
	/**
	 * Will play a sequence of animations
	 * 
	 * @function playClips
	 * @param {Array} clips an array of CharacterClip objects
	 * @param {function} callback Callback for when the animations are either done, or
	 *             have been interrupted. Will pass true is interrupted,
	 *             false if they completed
	 * @param {bool} interruptable If calling this can interrupt the current animation(s)
	 * @param {bool} cancelPreviousCallback Cancel the callback the last time this was called
	 * @param {bool} allowFrameDropping If frame dropping is allowed for this frame, if the Animator is doing frame drop checks
	 */
	p.playClips = function(clips, callback, interruptable, cancelPreviousCallback, allowFrameDropping)
	{
		callback = callback || null;
		interruptable = interruptable || true;
		cancelPreviousCallback = cancelPreviousCallback || true;
		allowFrameDropping = allowFrameDropping || true;
		
		Debug.assert(this._character, "playClips requires a character!");
		
		if (!this._interruptable) return;
		
		Animator.stop(this._character);
		
		this._interruptable = interruptable;
		
		if (this._callback && !cancelPreviousCallback)
		{
			this._callback(true);
		}
		
		this._callback = callback;
		this._animationStack.length = 0;
		for(var c in clips)
		{
			this._animationStack.push(clips[c]);
		}
		this._allowFrameDropping = allowFrameDropping;
		
		this.startNext();
	};
	
	/**
	*   Start the next animation in the sequence
	*   
	*   @function startNext
	*/
	p.startNext = function()
	{
		this._loops = 0;
		if (this._animationStack.length > 0)
		{
			this._currentAnimation = this._animationStack.shift();
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				[this], 
				this._allowFrameDropping
			);	
		}
		else if(this._callback)
		{
			this._interruptable = true;
			var cb = this._callback;
			this._callback = null;
			cb(false);
		}
	};
	
	/**
	*   When the animation has completed playing
	*   
	*   @function _animationComplete
	*   @private
	*/
	p._animationComplete = function()
	{		
		this._loops++;
		
		if(this._currentAnimation.loops === 0 || this._loops < this._currentAnimation.loops)
		{
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				null, 
				this._allowFrameDropping
			);
		}
		else if (this._currentAnimation.loops == this._loops)
		{
			this.startNext();
		}
	};
	
	/**
	*   Clear any animations for the current character
	*   
	*   @function clear
	*/
	p.clear = function()
	{
		if (this._character)
		{
			Animator.stop(this._character);
		}
		this._currentAnimation = null;
		this._interruptable = true;
		this._callback = null;
		this._animationStack.length = 0;
		this._loops = 0;
	};
	
	/**
	*  Don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if(this._destroyed) return;
		
		this._destroyed = true;
		this.clear();
		this._character = null;
		this._animationStack = null;
	};
	
	// Assign to the cloudkid namespace
	namespace('cloudkid').CharacterController = CharacterController;
	namespace('cloudkid.createjs').CharacterController = CharacterController;
}());
/**
*  @module cloudkid
*/
(function() {
	
	"use strict";
	
	/**
	*  Drag manager is responsible for handling the dragging of stage elements.
	*  Supports click-n-stick (click to start, move mouse, click to release) and click-n-drag (standard dragging) functionality.
	*  
	*  @class DragManager
	*  @constructor
	*  @param {createjs.Stage} stage The stage that this DragManager is monitoring.
	*  @param {function} startCallback The callback when when starting
	*  @param {function} endCallback The callback when ending
	*/
	var DragManager = function(stage, startCallback, endCallback)
	{
		this.initialize(stage, startCallback, endCallback);
	};
	
	/** Reference to the drag manager */
	var p = DragManager.prototype = {};
	
	/**
	* The object that's being dragged
	* @public
	* @readOnly
	* @property {createjs.DisplayObject} draggedObj
	*/
	p.draggedObj = null;
	
	/**
	* The radius in pixel to allow for dragging, or else does sticky click
	* @public
	* @property dragStartThreshold
	* @default 20
	*/
	p.dragStartThreshold = 20;
	
	/**
	* The position x, y of the mouse down on the stage
	* @private
	* @property {object} mouseDownStagePos
	*/
	p.mouseDownStagePos = null;

	/**
	* The position x, y of the object when interaction with it started.
	* @private
	* @property {object} mouseDownObjPos
	*/
	p.mouseDownObjPos = null;

	/**
	* If sticky click dragging is allowed.
	* @public
	* @property {Bool} allowStickyClick
	* @default true
	*/
	p.allowStickyClick = true;
	
	/**
	* Is the move touch based
	* @public
	* @readOnly
	* @property {Bool} isTouchMove
	* @default false
	*/
	p.isTouchMove = false;
	
	/**
	* Is the drag being held on mouse down (not sticky clicking)
	* @public
	* @readOnly
	* @property {Bool} isHeldDrag
	* @default false
	*/
	p.isHeldDrag = false;
	
	/**
	* Is the drag a sticky clicking (click on a item, then mouse the mouse)
	* @public
	* @readOnly
	* @property {Bool} isStickyClick
	* @default false
	*/
	p.isStickyClick = false;

	/**
	* Settings for snapping.
	*
	*  Format for snapping to a list of points:
	*	{
	*		mode:"points",
	*		dist:20,//snap when within 20 pixels/units
	*		points:[
	*			{ x: 20, y:30 },
	*			{ x: 50, y:10 }
	*		]
	*	}
	*
	* @public
	* @property {Object} snapSettings
	* @default null
	*/
	p.snapSettings = null;
	
	/**
	* Reference to the stage
	* @private
	* @property {createjsStage} _theStage
	*/
	p._theStage = null;
	
	/**
	* The local to global position of the drag
	* @private
	* @property {createjs.Point} _dragOffset
	*/
	p._dragOffset = null;
	
	/**
	* Callback when we start dragging
	* @private
	* @property {Function} _dragStartCallback
	*/
	p._dragStartCallback = null;
	
	/**
	* Callback when we are done dragging
	* @private
	* @property {Function} _dragEndCallback
	*/
	p._dragEndCallback = null;
	
	/**
	* Callback to test for the start a held drag
	* @private
	* @property {Function} _triggerHeldDragCallback
	*/
	p._triggerHeldDragCallback = null;
	
	/**
	* Callback to start a sticky click drag
	* @private
	* @property {Function} _triggerStickyClickCallback
	*/
	p._triggerStickyClickCallback = null;
	
	/**
	* Callback when we are done with the drag
	* @private
	* @property {Function} _stageMouseUpCallback
	*/
	p._stageMouseUpCallback = null;
	
	/**
	* The collection of draggable objects
	* @private
	* @property {Array} _draggableObjects
	*/
	p._draggableObjects = null;
		
	/**
	* The function call when the mouse/touch moves
	* @private
	* @property {function} _updateCallback 
	*/
	p._updateCallback = null;

	/**
	* A point for reuse instead of lots of object creation.
	* @private
	* @property {createjs.Point} _helperPoint 
	*/
	p._helperPoint = null;
	
	/** 
	* Constructor 
	* @method initialize
	* @constructor
	* @param {createjs.Stage} stage The stage that this DragManager is monitoring.
	* @param {function} startCallback The callback when when starting
	* @param {function} endCallback The callback when ending
	*/
	p.initialize = function(stage, startCallback, endCallback)
	{
		this._updateCallback = this._updateObjPosition.bind(this);
		this._triggerHeldDragCallback = this._triggerHeldDrag.bind(this);
		this._triggerStickyClickCallback = this._triggerStickyClick.bind(this);
		this._stageMouseUpCallback = this._stopDrag.bind(this);
		this._theStage = stage;
		this._dragStartCallback = startCallback;
		this._dragEndCallback = endCallback;
		this._draggableObjects = [];
		this.mouseDownStagePos = {x:0, y:0};
		this.mouseDownObjPos = {x:0, y:0};
	};
	
	/**
	*	Manually starts dragging an object. If a mouse down event is not supplied as the second argument, it 
	*   defaults to a held drag, that ends as soon as the mouse is released.
	*  @method startDrag
	*  @public
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*/
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};
	
	/**
	* Mouse down on an obmect
	*  @method _objMouseDown
	*  @private
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*/
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if(this.draggedObj !== null) return;

		this.draggedObj = obj;
		//stop any active tweens on the object, in case it is moving around or something
		createjs.Tween.removeTweens(obj);
		
		//get the mouse position in global space and convert it to parent space
		this._dragOffset = this.draggedObj.parent.globalToLocal(ev ? ev.stageX : 0, ev ? ev.stageY : 0);
		
		//move the offset to respect the object's current position
		this._dragOffset.x -= obj.x;
		this._dragOffset.y -= obj.y;

		//save the position of the object before dragging began, for easy restoration, if desired
		this.mouseDownObjPos.x = obj.x;
		this.mouseDownObjPos.y = obj.y;
		
		if(!ev)//if we don't get an event (manual call neglected to pass one) then default to a held drag
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;

			if(!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')//if it is a touch event, force it to be the held drag type
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag();
			}
			else//otherwise, wait for a movement or a mouse up in order to do a held drag or a sticky click drag
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDragCallback);
				obj.addEventListener("pressup", this._triggerStickyClickCallback);
			}
		}
	};
	
	/**
	* Start the sticky click
	* @method _triggerStickyClick
	* @private
	*/
	p._triggerStickyClick = function()
	{
		this.isStickyClick = true;
		this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._startDrag();
	};

	/**
	* Start hold dragging
	* @method _triggerHeldDrag
	* @private
	* @param {createjs.MouseEvent} ev The mouse down event
	*/
	p._triggerHeldDrag = function(ev)
	{
		var xDiff = ev.stageX - this.mouseDownStagePos.x;
		var yDiff = ev.stageY - this.mouseDownStagePos.y;
		if(xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._startDrag();
		}
	};

	/**
	* Internal start dragging on the stage
	* @method _startDrag
	* @private 
	*/
	p._startDrag = function()
	{
		var stage = this._theStage;
		stage.removeEventListener("stagemousemove", this._updateCallback);
		stage.addEventListener("stagemousemove", this._updateCallback);
		stage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		stage.addEventListener("stagemouseup", this._stageMouseUpCallback);
		
		this._dragStartCallback(this.draggedObj);
	};
	
	/**
	* Stops dragging the currently dragged object.
	* @public
	* @method stopDrag
	* @param {Bool} doCallback If the drag end callback should be called. Default is false.
	*/
	p.stopDrag = function(doCallback)
	{
		this._stopDrag(null, doCallback === true);//pass true if it was explicitly passed to us, false and undefined -> false
	};

	/**
	* Internal stop dragging on the stage
	* @method _stopDrag
	* @private 
	* @param {createjs.MouseEvent} ev Mouse up event
	* @param {Bool} doCallback If we should do the callback
	*/
	p._stopDrag = function(ev, doCallback)
	{
		var obj = this.draggedObj;
		obj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		obj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._theStage.removeEventListener("stagemousemove", this._updateCallback);
		this._theStage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		this.draggedObj = null;
		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if(doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	* Update the object position based on the mouse
	* @method _updateObjPosition
	* @private
	* @param {createjs.MouseEvent} e Mouse move event
	*/
	p._updateObjPosition = function(e)
	{
		if(!this.isTouchMove && !this._theStage.mouseInBounds) return;
		
		var draggedObj = this.draggedObj;
		var mousePos = draggedObj.parent.globalToLocal(e.stageX, e.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		draggedObj.x = clamp(mousePos.x - this._dragOffset.x, bounds.x, bounds.right);
		draggedObj.y = clamp(mousePos.y - this._dragOffset.y, bounds.y, bounds.bottom);
		if(this.snapSettings)
		{
			switch(this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos);
					break;
				case "grid":
					//not yet implemented
					break;
				case "line":
					//not yet implemented
					break;
			}
		}
	};

	/**
	* Handles snapping the dragged object to the nearest among a list of points
	* @method _handlePointSnap
	* @private
	* @param {createjs.Point} localMousePos The mouse position in the same space as the dragged object.
	*/
	p._handlePointSnap = function(localMousePos)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - this._dragOffset.x;
		var objY = localMousePos.y - this._dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;
		for(var i = points.length - 1; i >= 0; --i)
		{
			var p = points[i];
			var distSq = distSquared(objX, objY, p.x, p.y);
			if(distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if(closestPoint)
		{
			this.draggedObj.x = closestPoint.x;
			this.draggedObj.y = closestPoint.y;
		}
	};

	/*
	* Small distance squared function
	*/
	var distSquared = function(x1, y1, x2, y2)
	{
		var xDiff = x1 - x2;
		var yDiff = y1 - y2;
		return xDiff * xDiff + yDiff * yDiff;
	};
	
	/*
	* Simple clamp function
	*/
	var clamp = function(x,a,b)
	{
		return (x < a ? a : (x > b ? b : x));
	};
	
	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		this.addEventListener("mousedown", this._onMouseDownListener);
		this.cursor = "pointer";
	};
	
	var disableDrag = function()
	{
		this.removeEventListener("mousedown", this._onMouseDownListener);
		this.cursor = null;
	};
	
	var _onMouseDown = function(ev)
	{
		this._dragMan._objMouseDown(ev, this);
	};
	
	/** 
	* Adds properties and functions to the object - use enableDrag() and disableDrag() on 
	* objects to enable/disable them (they start out disabled). Properties added to objects:
	* _dragBounds (Rectangle), _onMouseDownListener (Function), _dragMan (cloudkid.DragManager) reference to the DragManager
	* these will override any existing properties of the same name
	* @method addObject
	* @public
	* @param {createjs.DisplayObject} obj The display object
	* @param {createjs.Rectangle} bound The rectangle bounds
	*/
	p.addObject = function(obj, bounds)
	{
		if(!bounds)
		{
			bounds = {x:0, y:0, width:this._theStage.canvas.width, height:this._theStage.canvas.height};
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		obj._dragBounds = bounds;
		if(this._draggableObjects.indexOf(obj) >= 0)
		{
			//don't change any of the functions or anything, just quit the function after having updated the bounds
			return;
		}
		obj.enableDrag = enableDrag;
		obj.disableDrag = disableDrag;
		obj._onMouseDownListener = _onMouseDown.bind(obj);
		obj._dragMan = this;
		this._draggableObjects.push(obj);
	};
	
	/** 
	* Removes properties and functions added by addObject().
	* @public
	* @method removeObject
	* @param {createjs.DisplayObject} obj The display object
	*/
	p.removeObject = function(obj)
	{
		obj.disableDrag();
		delete obj.enableDrag;
		delete obj.disableDrag;
		delete obj._onMouseDownListener;
		delete obj._dragMan;
		delete obj._dragBounds;
		var index = this._draggableObjects.indexOf(obj);
		if(index >= 0)
			this._draggableObjects.splice(index, 1);
	};
	
	/**
	*  Destroy the manager
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		if(this.draggedObj !== null)
		{
			//clean up dragged obj
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._theStage.removeEventListener("stagemousemove", this._updateCallback);
			this.draggedObj = null;
		}
		this._updateCallback = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDragCallback = null;
		this._triggerStickyClickCallback = null;
		this._stageMouseUpCallback = null;
		this._theStage = null;
		for(var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			var obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
		}
		this._draggableObjects = null;
		this._helperPoint = null;
	};
	
	/** Assign to the global namespace */
	namespace('cloudkid').DragManager = DragManager;
	namespace('cloudkid.createjs').DragManager = DragManager;
}());
(function() {
	
	"use strict";
	
	/**
	*  Initially layouts all interface elements
	*  @module cloudkid
	*  @class Positioner
	*/
	var Positioner = function(){};
	
	// Set the protype
	Positioner.prototype = {};
	
	/**
	*  Initial position of all layout items
	*  @method positionItems
	*  @static
	*  @param {createjs.DisplayObject} parent
	*  @param {Object} itemSettings JSON format with position information
	*/
	Positioner.positionItems = function(parent, itemSettings)
	{
		var pt;
		for(var iName in itemSettings)
		{
			var item = parent[iName];
			if(!item)
			{
				Debug.error("could not find object '" +  iName + "'");
				continue;
			}
			var setting = itemSettings[iName];
			if(setting.x !== undefined)
				item.x = setting.x;
			if(setting.y !== undefined)
				item.y = setting.y;
			pt = setting.scale;
			if(pt)
			{
				item.scaleX *= pt.x;
				item.scaleY *= pt.y;
			}
			pt = setting.pivot;
			if(pt)
			{
				item.regX = pt.x;
				item.regY = pt.y;
			}
			if(setting.rotation !== undefined)
				item.rotation = settings.rotation;
			//item.name = iName;
			if(setting.hitArea)
			{
				item.hitShape = Positioner.generateHitArea(setting.hitArea);
			}
		}
	};
	
	/**
	*  Create the polygon hit area for interface elements
	*  @static
	*  @method generateHitArea
	*  @param {Object|Array} hitArea One of the following: <br/>
	*  * An array of points for a polygon, e.g. 
	*
	*		[{x:0, y:0}, {x:0, y:20}, {x:20, y:0}]
	*
	*  * An object describing a rectangle, e.g.
	*
	*		{type:"rect", x:0, y:0, w:10, h:30}
	*
	*  * An object describing an ellipse, where x and y are the center, e.g. 
	*
	*		{type:"ellipse", x:0, y:0, w:10, h:30}
	*
	*  * An object describing a circle, where x and y are the center, e.g.
	*
	*		{type:"circle", x:0, y:0, r:20}
	*  @param {Number} scale=1 The size to scale hitArea by
	*  @return {Object} A geometric shape object for hit testing, either a Polygon, Rectangle, Ellipse, or Circle,
	*      depending on the hitArea object. The shape will have a contains() function for hit testing.
	*/
	Positioner.generateHitArea = function(hitArea, scale)
	{
		if(!scale)
			scale = 1;
		if(isArray(hitArea))
		{
			if(scale == 1)
				return new createjs.Polygon(hitArea);
			else
			{
				var temp = [];
				for(var i = 0, len = hitArea.length; i < len; ++i)
				{
					temp.push(new createjs.Point(hitArea[i].x * scale, hitArea[i].y * scale));
				}
				return new createjs.Polygon(temp);
			}
		}
		else if(hitArea.type == "rect" || !hitArea.type)
			return new createjs.Rectangle(hitArea.x * scale, hitArea.y * scale, hitArea.w * scale, hitArea.h * scale);
		else if(hitArea.type == "ellipse")
			return new createjs.Ellipse((hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale, hitArea.w * scale, hitArea.h * scale);//convert center to upper left corner
		else if(hitArea.type == "circle")
			return new createjs.Circle(hitArea.x * scale, hitArea.y * scale, hitArea.r * scale);
		else if(hitArea.type == "sector")
			return new createjs.Sector(hitArea.x * scale, hitArea.y * scale, hitArea.r * scale, hitArea.start, hitArea.end);
		return null;
	};

	var isArray = function(o)
	{
		return Object.prototype.toString.call(o) === '[object Array]';
	};
	
	namespace('cloudkid').Positioner = Positioner;
	namespace('cloudkid.createjs').Positioner = Positioner;
}());
(function() {
	
	"use strict";

	/**
	*   Object that contains the screen settings to help scaling
	*   @module cloudkid
	*   @class ScreenSettings
	*   @constructor
	*   @param {Number} width The screen width in pixels
	*   @param {Number} height The screen height in pixels
	*   @param {Number} ppi The screen pixel density (PPI)
	*/
	var ScreenSettings = function(width, height, ppi)
	{
		/**
		*  The screen width in pixels
		*  @property {Number} width 
		*/
		this.width = width;

		/**
		*  The screen height in pixels
		*  @property {Number} height 
		*/
		this.height = height;

		/**
		*  The screen pixel density (PPI)
		*  @property {Number} ppi
		*/
		this.ppi = ppi;
	};
	
	// Set the prototype
	ScreenSettings.prototype = {};
	
	// Assign to namespace
	namespace('cloudkid').ScreenSettings = ScreenSettings;
	namespace('cloudkid.createjs').ScreenSettings = ScreenSettings;

}());
(function() {

	"use strict";

	// Class imports
	var UIScaler;

	/**
	*   A single UI item that needs to be resized	
	*
	*   @module cloudkid
	*   @class UIElement
	*	@param {createjs.DisplayObject} item The item to affect  
	*   @param {UIElementSettings} settings The scale settings
	*	@param {ScreenSettings} designedScreen The original screen the item was designed for
	*/
	var UIElement = function(item, settings, designedScreen)
	{
		UIScaler = cloudkid.createjs.UIScaler;
		
		this._item = item;			
		this._settings = settings;
		this._designedScreen = designedScreen;
		
		this.origScaleX = item.scaleX;
		this.origScaleY = item.scaleY;

		this.origWidth = item.width;

		this.origBounds = {x:0, y:0, width:item.width, height:item.height};
		this.origBounds.right = this.origBounds.x + this.origBounds.width;
		this.origBounds.bottom = this.origBounds.y + this.origBounds.height;
		
		switch(settings.vertAlign)
		{
			case UIScaler.ALIGN_TOP:
			{
				this.origMarginVert = item.y + this.origBounds.y;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginVert = designedScreen.height * 0.5 - item.y;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				this.origMarginVert = designedScreen.height - (item.y + this.origBounds.bottom);
				break;
			}
		}

		switch(settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				this.origMarginHori = item.x + this.origBounds.x;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginHori = designedScreen.width * 0.5 - item.x;
				break;
			}
			case UIScaler.ALIGN_RIGHT:
			{
				this.origMarginHori = designedScreen.width - (item.x + this.origBounds.right);
				break;
			}
		}
	};
	
	var p = UIElement.prototype = {};

	/**
	*  Original horizontal margin in pixels
	*  @property {Number} origMarginHori
	*  @default 0
	*/
	p.origMarginHori = 0;

	/**
	*  Original vertical margin in pixels
	*  @property {Number} origMarginVert
	*  @default 0
	*/
	p.origMarginVert = 0;

	/** 
	*  Original width in pixels 
	*  @property {Number} origWidth
	*  @default 0
	*/
	p.origWidth = 0;

	/**
	*  Original X scale of the item
	*  @property {Number} origScaleX
	*  @default 0
	*/
	p.origScaleX = 0;

	/**
	*  The original Y scale of the item
	*  @property {Number} origScaleY
	*  @default 0
	*/
	p.origScaleY = 0;

	/**
	*  The original bounds of the item with x, y, right, bottom, width, height properties.
	*  Used to determine the distance to each edge of the item from its origin
	*  @property {Object} origBounds
	*/
	p.origBounds = null;

	/**
	*  The reference to the scale settings
	*  @private
	*  @property {UIElementSettings} _settings
	*/	
	p._settings = null;
	
	/**
	*  The reference to the interface item we're scaling
	*  @private
	*  @property {createjs.DisplayObject|PIXI.DisplayObject} _item
	*/
	p._item = null;
	
	/**
	*  The original screen the item was designed for
	*  @private
	*  @property {ScreenSettings} _designedScreen
	*/
	p._designedScreen = null;
	
	/**
	*  Adjust the item scale and position, to reflect new screen
	*  @method resize
	*  @param {ScreenSettings} newScreen The current screen settings
	*/
	p.resize = function(newScreen)
	{
		var overallScale = newScreen.height / this._designedScreen.height;
		var ppiScale = newScreen.ppi / this._designedScreen.ppi;
		var letterBoxWidth = (newScreen.width - this._designedScreen.width * overallScale) / 2;

		// Scale item to the overallScale to match rest of the app, 
		// then clamp its physical size as specified 
		// then set the item's scale to be correct - the screen is not scaled

		//Full math:
		/*var physicalScale:Number = overallScale / ppiScale;
		var itemScale:Number = MathUtils.clamp(physicalScale, minScale, maxScale) / physicalScale * overallScale;*/

		//Optimized math:
		var itemScale = overallScale / ppiScale;
		if(this._settings.minScale && itemScale < this._settings.minScale)
			itemScale = this._settings.minScale;
		else if(this._settings.maxScale && itemScale > this._settings.maxScale)
			itemScale = this._settings.maxScale;
		itemScale *= ppiScale;

		this._item.scaleX = this.origScaleX * itemScale;
		this._item.scaleY = this.origScaleY * itemScale;

		// positioning
		var m;

		// vertical move
		m = this.origMarginVert * overallScale;
		
		
		switch(this._settings.vertAlign)
		{
			case UIScaler.ALIGN_TOP:
			{
				this._item.y = m - this.origBounds.y * itemScale;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this._item.y = newScreen.height * 0.5 - m;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				this._item.y = newScreen.height - m - this.origBounds.bottom * itemScale;
				break;
			}
		}

		// horizontal move
		m = this.origMarginHori * overallScale;
		
		switch(this._settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				if(this._settings.titleSafe)
				{
					this._item.x = letterBoxWidth + m - this.origBounds.x * itemScale;
				}
				else
				{
					this._item.x = m - this.origBounds.x * itemScale;
				}
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				if(this._settings.centeredHorizontally)
				{
					this._item.x = (newScreen.width - this._item.width) * 0.5;
				}
				else
				{
					this._item.x = newScreen.width * 0.5 - m;
				}
				break;
			}	
			case UIScaler.ALIGN_RIGHT:
			{
				if(this._settings.titleSafe)
				{
					this._item.x = newScreen.width - letterBoxWidth - m - this.origBounds.right * itemScale;
				}
				else
				{
					this._item.x = newScreen.width - m - this.origBounds.right * itemScale;
				}
				break;
			}		
		}
	};
	
	/**
	*  Destroy this item, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.origBounds = null;
		this._item = null;
		this._settings = null;
		this._designedScreen = null;
	};
	
	namespace('cloudkid').UIElement = UIElement;
	namespace('cloudkid.createjs').UIElement = UIElement;
}());
(function() {
	
	"use strict";

	/**
	*  The UI Item Settings which is the positioning settings used to adjust each element
	*  @module cloudkid
	*  @class UIElementSettings
	*/
	var UIElementSettings = function(){};
	
	// Reference to the prototype
	var p = UIElementSettings.prototype = {};
	
	/** 
	*  What vertical screen location the item should be aligned to: "top", "center", "bottom"
	*  @property {String} vertAlign
	*/
	p.vertAlign = null;

	/** 
	*  What horizontal screen location the item should be aligned to: "left", "center", "right"
	*  @property {String} horiAlign
	*/
	p.horiAlign = null;

	/** 
	*  If this element should be aligned to the title safe area, not the actual screen 
	*  @property {Boolean} titleSafe
	*  @default false
	*/
	p.titleSafe = false;

	/** 
	*  Maximum scale allowed in physical size 
	*  @property {Number} maxScale
	*  @default 1
	*/
	p.maxScale = 1;

	/** 
	*  Minimum scale allowed in physical size 
	*  @property {Number} minScale
	*  @default 1
	*/
	p.minScale = 1;
	
	/**
	*  If the UI element is centered horizontally
	*  @property {Boolean} centeredHorizontally
	*  @default false
	*/
	p.centeredHorizontally = false;
	
	namespace('cloudkid').UIElementSettings = UIElementSettings;
	namespace('cloudkid.createjs').UIElementSettings = UIElementSettings;
}());
(function() {
	
	"use strict";

	// Class imports
	var UIElementSettings = cloudkid.createjs.UIElementSettings,
		UIElement = cloudkid.createjs.UIElement,
		ScreenSettings = cloudkid.createjs.ScreenSettings;

	/**
	*   The UI scale is responsible for scaling UI components
	*   to help easy the burden of different device aspect ratios
	*
	*  @module cloudkid
	*  @class UIScaler
	*  @constructor
	*  @param {createjs.DisplayObject} parent The UI display container
	*  @param {Number} designedWidth The designed width of the UI
	*  @param {Number} designedHeight The designed height of the UI
	*  @param {Number} designedPPI The designed PPI of the UI
	*/
	var UIScaler = function(parent, designedWidth, designedHeight, designedPPI)
	{
		this._parent = parent;
		this._items = [];
		this._designedScreen = new ScreenSettings(designedWidth, designedHeight, designedPPI);
	};
	
	// Reference to the prototype
	var p = UIScaler.prototype = {};
				
	/** 
	*  The current screen settings 
	*  @property {ScreenSettings} currentScreen
	*  @static
	*  @private
	*/
	var currentScreen = new ScreenSettings(0, 0, 0);
	
	/** 
	*  If the screensize has been set 
	*  @property {Boolean} initialized
	*  @static
	*  @private
	*/
	var initialized = false;
	
	/** 
	*  The UI display object to update 
	*  @property {createjs.DisplayObject} _parent
	*  @private
	*/
	p._parent = null;
	
	/** 
	*  The screen settings object, contains information about designed size 
	*  @property {ScreenSettings} _designedScreen
	*  @private
	*/
	p._designedScreen = null;
	
	/** 
	*  The configuration for each items
	*  @property {Array} _items
	*  @private
	*/
	p._items = null;
	
	/**
	*  Vertically align to the top
	*  @property {String} ALIGN_TOP
	*  @static
	*  @final
	*  @readOnly
	*  @default "top"
	*/
	UIScaler.ALIGN_TOP = "top";

	/**
	*  Vertically align to the bottom
	*  @property {String} ALIGN_BOTTOM
	*  @static
	*  @final
	*  @readOnly
	*  @default "bottom"
	*/
	UIScaler.ALIGN_BOTTOM = "bottom";

	/**
	*  Horizontally align to the left
	*  @property {String} ALIGN_LEFT
	*  @static
	*  @final
	*  @readOnly
	*  @default "left"
	*/
	UIScaler.ALIGN_LEFT = "left";

	/**
	*  Horizontally align to the right
	*  @property {String} ALIGN_RIGHT
	*  @static
	*  @final
	*  @readOnly
	*  @default "right"
	*/
	UIScaler.ALIGN_RIGHT = "right";

	/**
	*  Vertically or horizontally align to the center
	*  @property {String} ALIGN_CENTER
	*  @static
	*  @final
	*  @readOnly
	*  @default "center"
	*/
	UIScaler.ALIGN_CENTER = "center";
	
	/**
	*  Create the scaler from JSON data
	*  @method fromJSON
	*  @static
	*  @param {createjs.DisplayObject} parent The UI display container
	*  @param {Object} jsonSettings The json of the designed settings {designedWidth:800, designedHeight:600, designedPPI:72}
	*  @param {Object} jsonItems The json items object where the keys are the name of the property on the parent and the value
	*         is an object with keys of "titleSafe", "minScale", "maxScale", "centerHorizontally", "align"
	*  @param {Boolean} [immediateDestroy=true] If we should immediately cleanup the UIScaler after scaling items
	*  @return {UIScaler} The scaler object that can be reused
	*/
	UIScaler.fromJSON = function(parent, jsonSettings, jsonItems, immediateDestroy)
	{
		if (typeof immediateDestroy != "boolean") immediateDestroy = true;
			
		var scaler = new UIScaler(
			parent, 
			jsonSettings.designedWidth,
			jsonSettings.designedHeight,
			jsonSettings.designedPPI
		);
		
		// Temp variables
		var item, i, align, vertAlign, horiAlign;
		
		// Loop through all the items and register
		// each dpending on the settings
		for(i in jsonItems)
		{
			item = jsonItems[i];
			
			if (item.align)
			{
				align = item.align.split("-");
				vertAlign = align[0];
				horiAlign = align[1];
			}
			else
			{
				vertAlign = ALIGN_CENTER;
				horiAlign = ALIGN_CENTER;
			}
			scaler.add(
				parent[i], 
				vertAlign,
				horiAlign,
				item.titleSafe || false,
				item.minScale || NaN,
				item.maxScale || NaN,
				item.centeredHorizontally || false
			);
		}
		
		// Scale the items
		scaler.resize();
		
		if (immediateDestroy)
		{
			scaler.destroy();
		}
		return scaler;
	};
	
	/**
	*   Set the current screen settings. If the stage size changes at all, re-call this function
	*   @method init
	*   @static
	*   @param {Number} screenWidth The fullscreen width
	*   @param {Number} screenHeight The fullscreen height
	*   @param {Number} screenPPI The screen resolution density
	*/
	UIScaler.init = function(screenWidth, screenHeight, screenPPI)
	{
		currentScreen.width = screenWidth;
		currentScreen.height = screenHeight;
		currentScreen.ppi = screenPPI;
		initialized = true;
	};

	/**
	*  Get the current scale of the screen
	*  @method getScale
	*  @return {Number} The current stage scale
	*/
	p.getScale = function()
	{
		return currentScreen.height / this._designedScreen.height;
	};
	
	/**
	*   Manually add an item 
	*   @method add
	*   @param {createjs.DisplayObject} item The display object item to add
	*   @param {String} [vertAlign="center"] The vertical align of the item (cefault is center)
	*   @param {String} [horiAlign="center"] The horizontal align of the item (default is center)
	*   @param {Boolean} [titleSafe=false] If the item needs to be in the title safe area (default is false)
	*   @param {Number} [minScale=1] The minimum scale amount (default, scales the same size as the stage)
	*   @param {Number} [maxScale=1] The maximum scale amount (default, scales the same size as the stage)
	*   @param {Boolean} [centeredHorizontally=false] Makes sure that the center of the object was at the center of the screen, assuming an origin at the top left of the object
	*/
	p.add = function(item, vertAlign, horiAlign, titleSafe, minScale, maxScale, centeredHorizontally)
	{
		// Create the item settings
		var s = new UIElementSettings();
		
		s.vertAlign = vertAlign || UIScaler.ALIGN_CENTER;
		s.horiAlign = horiAlign || UIScaler.ALIGN_CENTER;
		s.titleSafe = (typeof titleSafe != "boolean") ? false : titleSafe;
		s.maxScale = (typeof maxScale != "number") ? NaN : maxScale;
		s.minScale = (typeof minScale != "number") ? NaN : minScale;
		s.centeredHorizontally = centeredHorizontally || false;
				
		this._items.push(new UIElement(item, s, this._designedScreen));
	};
	
	/**
	*   Scale a single background image according to the UIScaler.width and height
	*   @method resizeBackground
	*   @static
	*   @param {createjs.Bitmap} The bitmap to scale
	*/
	UIScaler.resizeBackground = function(bitmap)
	{
		if (!initialized) return;
		
		var h, w, scale;
		h = bitmap.image.height;
		w = bitmap.image.width;

		//scale the background
		scale = currentScreen.height / h;
		bitmap.scaleX = bitmap.scaleY = scale;
		
		//center the background
		bitmap.x = (currentScreen.width - w * scale) * 0.5;
	};
	
	/**
	*  Convenience function to scale a collection of backgrounds
	*  @method resizeBackgrounds
	*  @static
	*  @param {Array} bitmaps The collection of bitmap images
	*/
	UIScaler.resizeBackgrounds = function(bitmaps)
	{
		for(var i = 0, len = bitmaps.length; i < len; ++i)
		{
			UIScaler.resizeBackground(bitmaps[i]);
		}
	};
	
	/**
	*  Scale the UI items that have been registered to the current screen
	*  @method resize
	*/
	p.resize = function()
	{
		if (this._items.length > 0)
		{
			for(var i = 0, len = this._items.length; i < len; ++i)
			{
				this._items[i].resize(currentScreen);
			}
		}
	};
	
	/**
	*  Destroy the scaler object
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this._items.length > 0)
		{
			for(var i = 0, len = this._items.length; i < len; ++i)
			{
				this._items[i].destroy();
			}
		}
		
		this._parent = null;
		this._designedScreen = null;
		this._items = null;
	};
	
	namespace('cloudkid').UIScaler = UIScaler;
	namespace('cloudkid.createjs').UIScaler = UIScaler;
}());