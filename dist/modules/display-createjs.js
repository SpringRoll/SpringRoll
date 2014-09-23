/*! CloudKidFramework 0.0.6 */
!function(){"use strict";/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function()
{
	/**
	 * Utility methods for dealing with createjs movieclips
	 * @class MovieClipUtils
	 */
	var MovieClipUtils = {};

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away
	 * @method gotoAndCache
	 * @static
	 * @param {createjs.MovieClip} movieClip The movieclip
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=15] The space around the nominal bounds to include in cache image
	 */
	MovieClipUtils.gotoAndCache = function(movieClip, frame, buffer)
	{
		frame = (frame === undefined) ? 0 : frame;
		buffer = (buffer === undefined) ? 15 : buffer;
		movieClip.gotoAndStop(frame);
		var bounds = movieClip.nominalBounds;
		movieClip.cache(
			bounds.x - buffer,
			bounds.y - buffer,
			bounds.width + (buffer * 2),
			bounds.height + (buffer * 2),
			1
		);
	};

	//assign to namespace
	namespace('cloudkid').MovieClipUtils = MovieClipUtils;
	namespace('cloudkid.createjs').MovieClipUtils = MovieClipUtils;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(undefined){
	
	/**
	*  Provide a normalized way to get size, position, scale values
	*  as well as provide reference for different geometry classes.
	*  @class DisplayAdapter
	*/
	var DisplayAdapter = {};

	/**
	*  The geometry class for Circle
	*  @property {Function} Circle
	*  @readOnly
	*  @static
	*  @default createjs.Circle
	*/
	DisplayAdapter.Circle = include('createjs.Circle', false);

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default createjs.Ellipse
	*/
	DisplayAdapter.Ellipse = include('createjs.Ellipse', false);

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default createjs.Rectangle
	*/
	DisplayAdapter.Rectangle = include('createjs.Rectangle');

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default createjs.Sector
	*/
	DisplayAdapter.Sector = include('createjs.Sector', false);

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default createjs.Point
	*/
	DisplayAdapter.Point = include('createjs.Point');

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default createjs.Polygon
	*/
	DisplayAdapter.Polygon = include('createjs.Polygon', false);

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default false
	*/
	DisplayAdapter.useRadians = false;

	/**
	*  Gets the object's boundaries in its local coordinate space, without any scaling or
	*  rotation applied.
	*  @method getLocalBounds
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @return {createjs.Rectangle} A rectangle with additional right and bottom properties.
	*/
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds;
		if(object.nominalBounds)
		{
			//start by using nominal bounds, if it was exported from Flash, since it
			//should be fast and pretty accurate
			bounds = object.nominalBounds.clone();
		}
		else if(object.width !== undefined && object.height !== undefined)
		{
			//next check for a width and height that someone might have set up,
			//like our Button class has.
			//this also needs to take into account the registration point, as that affects the
			//positioning of the art
			var actW = object.width / object.scaleX;
			var actH = object.height / object.scaleY;
			bounds = new createjs.Rectangle(-object.regX, -object.regY, actW, actH);
		}
		else
		{
			//finally fall back to using EaselJS's getBounds().
			if(object.getLocalBounds)
			{
				bounds = object.getLocalBounds();
				if(bounds)
					bounds = bounds.clone();//clone the rectangle in case it gets changed
			}
			if(!bounds)//make sure we actually got a rectangle, if getLocalBounds failed for some reason
				bounds = new createjs.Rectangle();
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	*  Normalize the object scale
	*  @method getScale
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {String} [direction] Either "x" or "y" to return a specific value
	*  @return {object|Number} A scale object with x and y keys or a single number if direction is set
	*/
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object["scale" + direction.toUpperCase()];
		}
		return {
			x : object.scaleX,
			y : object.scaleY
		};
	};

	/**
	*  Normalize the object position setting
	*  @method setPosition
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {object|Number} position The position object or the value
	* 		if the direction is set.
	*  @param {Number} [position.x] The x value
	*  @param {Number} [position.y] The y value
	*  @param {String} [direction] Either "x" or "y" value
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object[direction] = position;
		}
		else
		{
			if (position.x !== undefined) object.x = position.x;
			if (position.y !== undefined) object.y = position.y;
		}
		return object;
	};

	/**
	*  Normalize the object position getting
	*  @method getPosition
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {String} [direction] Either "x" or "y", default is an object of both
	*  @return {Object|Number} The position as an object with x and y keys if no direction
	*		value is set, or the value of the specific direction
	*/
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object[direction];
		}
		return {
			x : object.x,
			y : object.y
		};
	};

	/**
	*  Normalize the object scale setting
	*  @method setScale
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {Number} scale The scaling object or scale value for x and y
	*  @param {String} [direction] Either "x" or "y" if setting a specific value, default
	* 		sets both the scale x and scale y.
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object["scale" + direction.toUpperCase()] = scale;
		}
		else
		{
			object.scaleX = object.scaleY = scale;
		}
		return object;
	};

	/**
	*  Set the pivot or registration point of an object
	*  @method setPivot
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {object|Number} pivot The object pivot point or the value if the direction is set
	*  @param {Number} [pivot.x] The x position of the pivot point
	*  @param {Number} [pivot.y] The y position of the pivot point
	*  @param {String} [direction] Either "x" or "y" the value for specific direction, default
	* 		will set using the object.
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object["reg" + direction.toUpperCase()] = pivot;
		}
		object.regX = pivot.x;
		object.regY = pivot.y;
		return object;
	};

	/**
	*  Set the hit area of the shape
	*  @method setHitArea
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {Object} shape The geometry object
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitShape = shape;
		return object;
	};

	/**
	*  Get the original size of a bitmap
	*  @method getBitmapSize
	*  @static
	*  @param {createjs.Bitmap} bitmap The bitmap to measure
	*  @return {object} The width (w) and height (h) of the actual bitmap size
	*/
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			h: bitmap.image.height,
			w: bitmap.image.width
		};
	};

	/**
	*  Remove all children from a display object
	*  @method removeChildren
	*  @static
	*  @param {createjs.Container} container The display object container
	*/
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeAllChildren();
	};

	// Assign to namespace
	namespace('cloudkid.createjs').DisplayAdapter = DisplayAdapter;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(undefined){

	// Import createjs classes
	var AbstractDisplay = include('cloudkid.AbstractDisplay'),
		Stage,
		Touch;

	/**
	*   CreateJSDisplay is a display plugin for the CloudKid Framework 
	*	that uses the EaselJS library for rendering.
	*
	*   @class CreateJSDisplay
	*   @extends cloudkid.AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the CreateJS stage.
	*	@param {String} [options.stageType="stage"] If the stage should be a normal stage or a SpriteStage (use "spriteStage").
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To disable them, use 0 or -1.
	*/
	var CreateJSDisplay = function(id, options)
	{
		if (!Stage)
		{
			Stage = include('createjs.Stage');
			Touch = include('createjs.Touch');
		}

		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		*  The rate at which EaselJS calculates mouseover events, in times/second.
		*  @property {int} mouseOverRate
		*  @public
		*  @default 30
		*/
		this.mouseOverRate = options.mouseOverRate || 30;

		if (options.stageType == "spriteStage")
		{
			//TODO: make a sprite stage (not officially released yet)
			// this.stage = new SpriteStage(id);
		}
		else
		{
			/**
			*  The rendering library's stage element, the root display object
			*  @property {createjs.Stage|createjs.SpriteStage} stage
			*  @readOnly
			*  @public
			*/
			this.stage = new Stage(id);
		}
		this.stage.autoClear = !!options.clearView;

		this.animator = include('cloudkid.createjs.Animator');
		this.adapter = include('cloudkid.createjs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = CreateJSDisplay.prototype = Object.create(s);

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);

			if(value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				Touch.enable(this.stage);
			}
			else
			{
				this.stage.enableMouseOver(false);
				this.stage.enableDOMEvents(false);
				Touch.disable(this.stage);
				this.canvas.style.cursor = "";//reset the cursor
			}
		}
	});

	/** 
	* Updates the stage and draws it. This is only called by the Application. 
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	*/
	p.render = function(elapsed)
	{
		if (!this.paused && this._visible)
		{
			this.stage.update(elapsed);
		}		
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
		s.destroy.call(this);

		this.stage.removeAllChildren(true);
		this.stage = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').CreateJSDisplay = CreateJSDisplay;
	namespace('cloudkid.createjs').CreateJSDisplay = CreateJSDisplay;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
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
		* The event to callback when we're done
		* 
		* @event onComplete
		*/
		this.onComplete = null;
		
		/** 
		* The parameters to pass when completed 
		* 
		* @property {Array} onCompleteParams
		*/
		this.onCompleteParams = null;
		
		/**
		* The event label
		* 
		* @property {String} event
		*/
		this.event = null;
		
		/**
		* The instance of the timeline to animate 
		* 
		* @property {AnimatorTimeline} instance
		*/
		this.instance = null;
		
		/**
		* The frame number of the first frame
		* 
		* @property {int} firstFrame
		*/
		this.firstFrame = -1;
		
		/**
		* The frame number of the last frame
		* 
		* @property {int} lastFrame
		*/
		this.lastFrame = -1;
		
		/**
		* If the animation loops - determined by looking to see if it ends in " stop" or " loop"
		* 
		* @property {bool} isLooping
		*/
		this.isLooping = false;
		
		/**
		* Ensure we show the last frame before looping
		* 
		* @property {bool} isLastFrame
		*/
		this.isLastFrame = false;
		
		/**
		* length of timeline in frames
		* 
		* @property {int} length
		*/
		this.length = 0;

		/**
		*  If this timeline plays captions
		*
		*  @property {bool} useCaptions
		*  @readOnly
		*/
		this.useCaptions = false;
		
		/**
		* If the timeline is paused.
		* 
		* @property {bool} _paused
		* @private
		*/
		this._paused = false;
		
		/**
		* The animation start time in seconds on the movieclip's timeline.
		* @property {Number} startTime
		* @public
		*/
		this.startTime = 0;
		
		/**
		* The animation duration in seconds.
		* @property {Number} duration
		* @public
		*/
		this.duration = 0;

		/**
		* The animation speed. Default is 1.
		* @property {Number} speed
		* @public
		*/
		this.speed = 1;

		/**
		* The position of the animation in seconds.
		* @property {Number} time
		* @public
		*/
		this.time = 0;

		/**
		* Sound alias to sync to during the animation.
		* @property {String} soundAlias
		* @public
		*/
		this.soundAlias = null;

		/**
		* A sound instance object from cloudkid.Sound used for tracking sound position.
		* @property {Object} soundInst
		* @public
		*/
		this.soundInst = null;

		/**
		* If the timeline will, but has yet to play a sound.
		* @property {bool} playSound
		* @public
		*/
		this.playSound = false;

		/**
		* The time (seconds) into the animation that the sound starts.
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
	};
	
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
	
	// Assign to the name space
	namespace('cloudkid').AnimatorTimeline = AnimatorTimeline;
	namespace('cloudkid.createjs').AnimatorTimeline = AnimatorTimeline;
	
}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(undefined){

	// Imports
	var Application = include('cloudkid.Application'),
		AnimatorTimeline = include('cloudkid.createjs.AnimatorTimeline'),
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
	* The current version of the Animator class 
	* 
	* @property {String} VERSION
	* @public
	* @static
	*/
	Animator.VERSION = "0.0.6";
	
	/**
	* If we fire debug statements 
	* 
	* @property {bool} debug
	* @public
	* @static
	*/
	Animator.debug = false;

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
	 * An object to allow stop() calls to be better differentiated
	 * from animations ending naturally.
	 * @property {Object} EXTERNAL_STOP
	 * @private
	 */
	var EXTERNAL_STOP = {};
	
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

		Sound = include('cloudkid.Sound', false);
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

			//start preloading the sound, for less wait time when the animation gets to it
			if (timeline.soundStart > 0)
			{
				Sound.instance.preloadSound(timeline.soundAlias);
			}
			
			return timeline;
		}
		
		if (true)
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
		if (!Animator._canAnimate(instance))//not a movieclip
		{
			return timeline;
		}
		instance.advanceDuringTicks = false;//make sure the movieclip doesn't play outside the control of Animator
		var fps;
		if (!instance.framerate)//make sure the movieclip is framerate independent
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
		timeline.speed = speed;
		if (soundData && Sound)
		{
			timeline.playSound = true;
			if (typeof soundData == "string")
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
		if (true)
		{
			Debug.warn("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
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
			if (true)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
			return;
		}
		var timeline = _timelinesMap[instance.id];
		Animator._remove(timeline, doOnComplete ? EXTERNAL_STOP : false);
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
		if ((!doOnComplete || doOnComplete === EXTERNAL_STOP) && timeline.soundInst)
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
		if (!_timelines) return;
		
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
		if (!_timelines) return;
		
		var delta = elapsed * 0.001;//ms -> sec
		
		var t;
		for(var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			var instance = t.instance;
			if (t.paused) continue;
			
			if (t.soundInst)
			{
				if (t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					var audioPos = t.soundInst.position * 0.001;
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
		if (timeline.soundEnd > 0 && timeline.soundEnd > timeline.time)
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
		return "[Animator version:" + Animator.VERSION + "]";
	};
	
	// Assign to the global namespace
	namespace('cloudkid').Animator = Animator;
	namespace('cloudkid.createjs').Animator = Animator;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(undefined){
	
	var Rectangle = include('createjs.Rectangle'),
		Container = include('createjs.Container'),
		ColorMatrix = include('createjs.ColorMatrix'),
		ColorFilter = include('createjs.ColorFilter'),
		ColorMatrixFilter = include('createjs.ColorMatrixFilter'),
		Text = include('createjs.Text'),
		Event = include('createjs.Event'),
		Point = include('createjs.Point'),
		Bitmap = include('createjs.Bitmap');

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
		if (!imageSettings && true)
		{
			throw "cloudkid.createjs.Button requires an image as the first parameter";
		}

		Container.call(this);

		/**
		 *  The sprite that is the body of the button.
		 *  @public
		 *  @property {createjs.Bitmap} back
		 *  @readOnly
		 */
		this.back = null;

		/**
		 *  The text field of the button. The label is centered by both width and height on the button.
		 *  @public
		 *  @property {createjs.Text} label
		 *  @readOnly
		 */
		this.label = null;

		//===callbacks for mouse/touch events
		/**
		 * Callback for mouse over, bound to this button.
		 * @private
		 * @property {Function} _overCB
		 */
		this._overCB = this._onMouseOver.bind(this);

		/**
		 * Callback for mouse out, bound to this button.
		 * @private
		 * @property {Function} _outCB
		 */
		this._outCB = this._onMouseOut.bind(this);

		/**
		 * Callback for mouse down, bound to this button.
		 * @private
		 * @property {Function} _downCB
		 */
		this._downCB = this._onMouseDown.bind(this);

		/**
		 * Callback for press up, bound to this button.
		 * @private
		 * @property {Function} _upCB
		 */
		this._upCB = this._onMouseUp.bind(this);

		/**
		 * Callback for click, bound to this button.
		 * @private
		 * @property {Function} _clickCB
		 */
		this._clickCB = this._onClick.bind(this);

		/**
		 * A dictionary of state booleans, keyed by state name.
		 * @private
		 * @property {Object} _stateFlags
		 */
		this._stateFlags = {};

		/**
		 * An array of state names (Strings), in their order of priority.
		 * The standard order previously was ["highlighted", "disabled", "down", "over", "selected", "up"].
		 * @private
		 * @property {Array} _statePriority
		 */
		this._statePriority = null;

		/**
		 * A dictionary of state graphic data, keyed by state name.
		 * Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
		 * Additionally, each object will contain a 'label' object if the button has a text label.
		 * @private
		 * @property {Object} _stateData
		 */
		this._stateData = {};

		/**
		 * The width of the button art, independent of the scaling of the button itself.
		 * @private
		 * @property {Number} _width
		 */
		this._width = 0;

		/**
		 * The height of the button art, independent of the scaling of the button itself.
		 * @private
		 * @property {Number} _height
		 */
		this._height = 0;

		/**
		 * An offset to button positioning, generally used to adjust for a highlight around the button.
		 * @private
		 * @property {createjs.Point} _offset
		 */
		this._offset = new Point();

		this.buttonInitialize(imageSettings, label, enabled);
	};

	// Extend Container
	var p = Button.prototype = Object.create(Container.prototype);

	var s = Container.prototype; //super

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
	 *  @method buttonInitialize
	 *  @param {Object|Image|HTMLCanvasElement} [imageSettings] See the constructor for more information
	 *  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	 *  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	p.buttonInitialize = function(imageSettings, label, enabled)
	{
		this.mouseChildren = false; //input events should have this button as a target, not the child Bitmap.

		var _stateData = this._stateData;

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
				src: new Rectangle(0, 0, width, height)
			};
			_stateData.over = {
				src: new Rectangle(0, height, width, height)
			};
			_stateData.down = {
				src: new Rectangle(0, height * 2, width, height)
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

		this.back = new Bitmap(image);
		this.addChild(this.back);
		this._width = width;
		this._height = height;

		if (label)
		{
			this.label = new Text(label.text || "", _stateData.up.label.font, _stateData.up.label.color);
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
		this.dispatchEvent(new Event(Button.BUTTON_PRESS));
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
				src: new Rectangle(0, 0, buttonWidth, buttonHeight)
			},
			over:
			{
				src: new Rectangle(0, buttonHeight, buttonWidth, buttonHeight)
			},
			down:
			{
				src: new Rectangle(0, buttonHeight * 2, buttonWidth, buttonHeight)
			}
		};
		//set up a bitmap to draw other states with
		var drawingBitmap = new Bitmap(image);
		drawingBitmap.sourceRect = output.up.src;
		//set up a y position for where the next state should go in the canvas
		var nextY = image.height;
		if (disabledSettings)
		{
			context.save();
			//position the button to draw
			context.translate(0, nextY);
			//set up the desaturation matrix
			var matrix = new ColorMatrix();
			if (disabledSettings.saturation !== undefined)
				matrix.adjustSaturation(disabledSettings.saturation);
			if (disabledSettings.brightness !== undefined)
				matrix.adjustBrightness(disabledSettings.brightness * 2.55); //convert to CreateJS's -255->255 system from -100->100
			if (disabledSettings.contrast !== undefined)
				matrix.adjustContrast(disabledSettings.contrast);
			drawingBitmap.filters = [new ColorMatrixFilter(matrix)];
			//draw the state
			drawingBitmap.cache(0, 0, output.up.src.width, output.up.src.height);
			drawingBitmap.draw(context);
			//update the output with the state
			output.disabled = {
				src: new Rectangle(0, nextY, buttonWidth | 0, buttonHeight | 0)
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
			drawingBitmap.filters = [new ColorFilter(0, 0, 0, 1,
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
			var trim = new Rectangle(
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
				src: new Rectangle(0, nextY, highlightStateWidth | 0, highlightStateHeight | 0)
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
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(){

	var Button = include('cloudkid.createjs.Button'),
		Sound;

	/**
	 *  A button with audio events for click and over mouse events
	 *  @class SoundButton
	 *  @extends cloudkid.createjs.Button
	 *  @constructor
	 *  @param {DOMElement}|object} imageSettings The loaded image element, see cloudkid.createjs.Button constructor
	 *  @param {Object} [label=null] See cloudkid.createjs.Button constructor
	 *  @param {Boolean} [enabled=true] If the button should be enabled by default
	 *  @param {String} [clickAlias="ButtonClick"] The button click audio alias
	 *  @param {String} [overAlias="ButtonRollover"] The button rollover audio alias
	 */
	var SoundButton = function(imageSettings, label, enabled, clickAlias, overAlias)
	{
		Sound = include('cloudkid.Sound');

		Button.call(this, imageSettings, label, enabled);

		/**
		 *  The audio alias to use for click events
		 *  @property {String} clickAlias
		 */
		this.clickAlias = clickAlias || "ButtonClick";

		/**
		 *  The audio alias to use for mouse over events
		 *  @property {String} overAlias
		 */
		this.overAlias = overAlias || "ButtonRollover";

		/**
		 *  If the audio is enabled
		 *  @property {Boolean} _audioEnabled
		 *  @private
		 */
		this._audioEnabled = true;

		this._onRollover = this._onRollover.bind(this);
		this._onButtonPress = this._onButtonPress.bind(this);

		// add listeners
		this.on('rollover', this._onRollover);
		this.on(Button.BUTTON_PRESS, this._onButtonPress);
	};

	// Reference to the super prototype
	var s = Button.prototype;

	// Reference to the prototype
	var p = SoundButton.prototype = Object.create(s);

	/**
	 *  Handler for the BUTTON_PRESS event
	 *  @method _onButtonPress
	 *  @private
	 */
	p._onButtonPress = function(e)
	{
		if (this.clickAlias)
		{
			Sound.instance.play(this.clickAlias);
		}
	};

	/**
	 *  Override for _onRollover function.
	 *  @method _onRollover
	 *  @private
	 */
	p._onRollover = function(e)
	{
		if (this.overAlias)
		{
			Sound.instance.play(this.overAlias);
		}	
	};

	/**
	 *  Handler for the on mouse over event
	 *  @property {Boolean} enabled
	 */
	Object.defineProperty(p, "audioEnabled",
	{
		get: function()
		{
			return this._audioEnabled;
		},
		set: function(enabled)
		{
			this._audioEnabled = enabled;
		}
	});

	/**
	 *  Don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.off("rollover", this._onRollover);
		this.off(Button.BUTTON_PRESS, this._onButtonPress);
		this.audioEnabled = false;
		s.destroy.apply(this);
	};

	// Assign to namespace
	namespace('cloudkid').SoundButton = SoundButton;
	namespace('cloudkid.createjs').SoundButton = SoundButton;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(){
	
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
		/**
		* The event to play
		*
		* @property {String} event
		*/
		this.event = event;
		
		/**
		* The number of times to loop
		* 
		* @property {int} loops
		*/
		this.loops = loops || 0;
	};
		
	
	// Assign to the cloudkid namespace
	namespace('cloudkid').CharacterClip = CharacterClip;
	namespace('cloudkid.createjs').CharacterClip = CharacterClip;

}());
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(){

	// Imports
	var Animator = include('cloudkid.createjs.Animator');
	
	/**
	*   Character Controller class is designed to play animated
	*   sequences on the timeline. This is a flexible way to
	*   animate characters on a timeline
	*   
	*   @class CharacterController
	*/
	var CharacterController = function()
	{
		/**
		* The current stack of animations to play
		*
		* @property {Array} _animationStack
		* @private
		*/
		this._animationStack = [];
		
		/**
		* The currently playing animation 
		* 
		* @property {CharacterClip} _currentAnimation
		* @private
		*/
		this._currentAnimation = null;
		
		/**
		* Current number of loops for the current animation
		* 
		* @property {int} _loops
		* @private
		*/
		this._loops = 0;
		
		/**
		* If the current animation choreographies can't be interrupted 
		* 
		* @property {bool} _interruptable
		* @private
		*/
		this._interruptable = true;
		
		/**
		* If frame dropping is allowed for this animation set
		* 
		* @property {bool} _allowFrameDropping
		* @private
		*/
		this._allowFrameDropping = false;
		
		/**
		* The current character
		* 
		* @property {createjs.MovieClip} _character
		* @private
		*/
		this._character = null;
		
		/**
		* Callback function for playing animation 
		* 
		* @property {function} _callback
		* @private
		*/
		this._callback = null;
		
		/** 
		* If this instance has been destroyed
		* 
		* @property {bool} _destroyed
		* @private
		*/
		this._destroyed = false;
	};
	
	var p = CharacterController.prototype;
	
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
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function() {
		
	var Tween;

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
		if(!Tween)
		{
			Tween = include('createjs.Tween', false);
		}

		/**
		* The object that's being dragged
		* @public
		* @readOnly
		* @property {createjs.DisplayObject} draggedObj
		*/
		this.draggedObj = null;
		
		/**
		* The radius in pixel to allow for dragging, or else does sticky click
		* @public
		* @property dragStartThreshold
		* @default 20
		*/
		this.dragStartThreshold = 20;
		
		/**
		* The position x, y of the mouse down on the stage
		* @private
		* @property {object} mouseDownStagePos
		*/
		this.mouseDownStagePos = {x:0, y:0};

		/**
		* The position x, y of the object when interaction with it started.
		* @private
		* @property {object} mouseDownObjPos
		*/
		this.mouseDownObjPos = {x:0, y:0};

		/**
		* If sticky click dragging is allowed.
		* @public
		* @property {Bool} allowStickyClick
		* @default true
		*/
		this.allowStickyClick = true;
		
		/**
		* Is the move touch based
		* @public
		* @readOnly
		* @property {Bool} isTouchMove
		* @default false
		*/
		this.isTouchMove = false;
		
		/**
		* Is the drag being held on mouse down (not sticky clicking)
		* @public
		* @readOnly
		* @property {Bool} isHeldDrag
		* @default false
		*/
		this.isHeldDrag = false;
		
		/**
		* Is the drag a sticky clicking (click on a item, then mouse the mouse)
		* @public
		* @readOnly
		* @property {Bool} isStickyClick
		* @default false
		*/
		this.isStickyClick = false;

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
		this.snapSettings = null;
		
		/**
		* Reference to the stage
		* @private
		* @property {createjsStage} _theStage
		*/
		this._theStage = stage;
		
		/**
		* The local to global position of the drag
		* @private
		* @property {createjs.Point} _dragOffset
		*/
		this._dragOffset = null;
		
		/**
		* Callback when we start dragging
		* @private
		* @property {Function} _dragStartCallback
		*/
		this._dragStartCallback = startCallback;
		
		/**
		* Callback when we are done dragging
		* @private
		* @property {Function} _dragEndCallback
		*/
		this._dragEndCallback = endCallback;
		
		/**
		* Callback to test for the start a held drag
		* @private
		* @property {Function} _triggerHeldDragCallback
		*/
		this._triggerHeldDragCallback = this._triggerHeldDrag.bind(this);
		
		/**
		* Callback to start a sticky click drag
		* @private
		* @property {Function} _triggerStickyClickCallback
		*/
		this._triggerStickyClickCallback = this._triggerStickyClick.bind(this);
		
		/**
		* Callback when we are done with the drag
		* @private
		* @property {Function} _stageMouseUpCallback
		*/
		this._stageMouseUpCallback = this._stopDrag.bind(this);
		
		/**
		* The collection of draggable objects
		* @private
		* @property {Array} _draggableObjects
		*/
		this._draggableObjects = [];
			
		/**
		* The function call when the mouse/touch moves
		* @private
		* @property {function} _updateCallback 
		*/
		this._updateCallback = this._updateObjPosition.bind(this);

		/**
		* A point for reuse instead of lots of object creation.
		* @private
		* @property {createjs.Point} _helperPoint 
		*/
		this._helperPoint = null;
	};
	
	/** Reference to the drag manager */
	var p = DragManager.prototype = {};
	
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
		if(Tween)
			Tween.removeTweens(obj);
		
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
/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(){
	
	var Container = include('createjs.Container'),
		BitmapUtils,
		Application,
		LoadTask,
		TaskManager,
		Sound,
		ListTask;

	/**
	*   Cutscene is a class for playing a single EaselJS animation synced to a
	*	single audio file with cloudkid.Sound, with optional captions. Utilizes the Tasks module.
	*
	*   @class Cutscene
	*	@constructor
	*	@param {Object} options The runtime specific setup data for the cutscene.
	*	@param {String|Display} options.display The display or display id of the CreateJSDisplay to draw on.
	*	@param {String} options.configUrl The url of the json config file describing the cutscene. See the example project.
	*	@param {Function} [options.loadCallback] A function to call when loading is complete.
	*	@param {String} [options.pathReplaceTarg] A string found in the paths of images that should be replaced with another value.
	*	@param {String} [options.pathReplaceVal] The string to use when replacing options.pathReplaceTarg.
	*	@param {Number} [options.imageScale=1] Scaling to apply to all images loaded for the cutscene.
	*	@param {Captions} [options.captions] A Captions instance to display captions text on.
	*/
	var Cutscene = function(options)
	{
		if(!Application)
		{
			Application = include('cloudkid.Application');
			LoadTask = include('cloudkid.LoadTask');
			TaskManager = include('cloudkid.TaskManager');
			Sound = include('cloudkid.Sound');
			ListTask = include('cloudkid.ListTask');
			BitmapUtils = include('createjs.BitmapUtils');
		}

		Container.call(this);

		if(!options)
			throw new Error("need options to create Cutscene");

		/**
		*	When the cutscene is ready to use
		*	@property {Boolean} isReady
		*	@public
		*/
		this.isReady = false;
		
		/**
		*	The framerate the cutscene should play at.
		*	@property {int} framerate
		*	@private
		*/
		this.framerate = 0;
		
		/**
		*	Reference to the display we are drawing on
		*	@property {Display} display
		*	@public
		*/
		this.display = typeof options.display == "string" ? Application.instance.getDisplay(options.display) : options.display;
		
		/**
		*	The source url for the config until it is loaded, then the config object.
		*	@property {String|Object} config
		*	@private
		*/
		this.config = options.configUrl;

		/**
		*	The scaling value for all images.
		*	@property {Number} imageScale
		*	@private
		*/
		this.imageScale = options.imageScale || 1;

		/**
		*	A string found in the paths of images that should be replaced with another value.
		*	@property {String} pathReplaceTarg
		*	@private
		*/
		this.pathReplaceTarg = options.pathReplaceTarg || null;

		/**
		*	The string to use when replacing options.pathReplaceTarg.
		*	@property {String} pathReplaceVal
		*	@private
		*/
		this.pathReplaceVal = options.pathReplaceVal || null;

		/**
		*	The TaskManager used to load up assets.
		*	@property {TaskManager} _taskMan
		*	@private
		*/
		this._taskMan = null;

		/**
		*	The time elapsed in seconds.
		*	@property {Number} _elapsedTime
		*	@private
		*/
		this._elapsedTime = 0;

		/**
		*	The clip that is being animated.
		*	@property {easeljs.MovieClip} _clip
		*	@private
		*/
		this._clip = null;

		/**
		*	The sound instance of the playing audio
		*	@property {Sound.soundInst} _currentAudioInstance
		*	@private
		*/
		this._currentAudioInstance = null;

		/**
		*	If the animation has finished playing.
		*	@property {Boolean} _animFinished
		*	@private
		*/
		this._animFinished = false;

		/**
		*	If the audio has finished playing.
		*	@property {Boolean} _audioFinished
		*	@private
		*/
		this._audioFinished = false;

		/**
		*	The Captions object to use to manage captions.
		*	@property {Captions} _captionsObj
		*	@private
		*/
		this._captionsObj = options.captions || null;

		/**
		*	The function to call when loading is complete.
		*	@property {Function} _loadCallback
		*	@private
		*/
		this._loadCallback = options.loadCallback || null;

		/**
		*	The function to call when playback is complete.
		*	@property {Function} _endCallback
		*	@private
		*/
		this._endCallback = null;

		//bind some callbacks
		this.update = this.update.bind(this);
		this._audioCallback = this._audioCallback.bind(this);

		this.resize = this.resize.bind(this);

		this.setup();
	};
	
	var p = Cutscene.prototype = new Container();
	
	/**
	*   Called from the constructor to complete setup and start loading.
	*
	*   @method setup
	*   @private
	*/
	p.setup = function()
	{
		this.display.stage.addChild(this);

		// create a texture from an image path
		this._taskMan = new TaskManager([new LoadTask(
			"config", this.config, this.onConfigLoaded.bind(this)
		)]);

		this._taskMan.on(TaskManager.ALL_TASKS_DONE, this.onLoadComplete.bind(this));
		this._taskMan.startAll();
	};
	
	/**
	*	Callback for when the config file is loaded.
	*	@method onConfigLoaded
	*	@param {LoaderResult} result The loaded result.
	*	@private
	*/
	p.onConfigLoaded = function(result)
	{
		this.config = result.content;
		
		if(this._captionsObj)
			this._captionsObj.setDictionary(this.config.captions);
		
		//parse config
		this.framerate = this.config.settings.fps;
		
		//figure out what to load
		var manifest = [];
		//the javascript file
		manifest.push({id:"clip", src:this.config.settings.clip});
		//all the images
		for(var key in this.config.images)
		{
			var url = this.pathReplaceTarg ? this.config.images[key].replace(this.pathReplaceTarg, this.pathReplaceVal) : this.config.images[key];
			manifest.push({id:key, src:url});
		}
		
		var soundConfig = this.config.audio;
		Sound.instance.loadConfig(soundConfig);//make sure Sound knows about the audio
		
		this._taskMan.addTask(new ListTask("art", manifest, this.onArtLoaded.bind(this)));
		this._taskMan.addTask(Sound.instance.createPreloadTask("audio", [soundConfig.soundManifest[0].id], this.onAudioLoaded));
	};
	
	/**
	*	Callback for when the audio has been preloaded.
	*	@method onAudioLoaded
	*	@private
	*/
	p.onAudioLoaded = function()
	{
		//do nothing
	};
	
	/**
	*	Callback for when all art assets have been loaded.
	*	@method onArtLoaded
	*	@param {Object} results The loaded results.
	*	@private
	*/
	p.onArtLoaded = function(results)
	{
		if(!window.images)
			window.images = {};
		var atlasData = {}, atlasImages = {}, id;
		for(id in results)
		{
			var result = results[id].content;
			if(id.indexOf("atlasData_") === 0)//look for spritesheet data
			{
				atlasData[id.replace("atlasData_", "")] = result;
			}
			else if(id.indexOf("atlasImage_") === 0)//look for spritesheet images
			{
				atlasImages[id.replace("atlasImage_", "")] = result;
			}
			else if(id == "clip")//look for the javascript animation file
			{
				//the javascript file
				//if bitmaps need scaling, then do black magic to the object prototypes so the scaling is built in
				if(this.imageScale != 1)
				{
					var imgScale = this.imageScale;
					for(var key in this.config.images)
					{
						BitmapUtils.replaceWithScaledBitmap(key, imgScale);
					}
				}
			}
			else//anything left must be individual images that we were expecting
			{
				images[id] = result;
			}
		}
		for(id in atlasData)//if we loaded any spritesheets, load them up
		{
			if(atlasData[id] && atlasImages[id])
			{
				BitmapUtils.loadSpriteSheet(atlasData[id].frames, atlasImages[id], this.imageScale);
			}
		}
	};

	/**
	*	Callback for when all loading is complete.
	*	@method onLoadComplete
	*	@param {Event} evt An event
	*	@private
	*/
	p.onLoadComplete = function(evt)
	{
		this._taskMan.off();
		this._taskMan.destroy();
		this._taskMan = null;
		
		var clip = this._clip = new lib[this.config.settings.clipClass]();
		//if the animation was for the older ComicCutscene, we should handle it gracefully
		//so if the clip only has one frame or is a container, then we get the child of the clip as the animation
		if(!this._clip.timeline || this._clip.timeline.duration == 1)
			clip = this._clip.getChildAt(0);
		clip.mouseEnabled = false;
		clip.framerate = this.framerate;
		clip.advanceDuringTicks = false;
		clip.gotoAndPlay(0);//internally, movieclip has to be playing to change frames during tick() or advance().
		clip.loop = false;
		this.addChild(this._clip);
		
		this.resize(this.display.width, this.display.height);
		Application.instance.on("resize", this.resize);
		
		this.isReady = true;
		
		if(this._loadCallback)
		{
			this._loadCallback();
			this._loadCallback = null;
		}
	};
	
	/**
	*	Listener for when the Application is resized.
	*	@method resize
	*	@param {int} width The new width of the display.
	*	@param {int} height The new height of the display.
	*	@private
	*/
	p.resize = function(width, height)
	{
		if(!this._clip) return;
		
		var scale = height / this.config.settings.designedHeight;
		this._clip.scaleX = this._clip.scaleY = scale;
		this.x = (width - this.config.settings.designedWidth * scale) * 0.5;

		//if the display is paused, tell it to render once since the display just got wiped
		if(this.isReady && this.display.paused)
		{
			this.display.paused = false;
			this.display.render(0);
			this.display.paused = true;
		}
	};
	
	/**
	*	Starts playing the cutscene.
	*	@method start
	*	@param {Function} callback The function to call when playback is complete.
	*	@public
	*/
	p.start = function(callback)
	{
		this._endCallback = callback;

		this._timeElapsed = 0;
		this._animFinished = false;
		this._audioFinished = false;
		var id = this.config.audio.soundManifest[0].id;
		this._currentAudioInstance = Sound.instance.play(id, this._audioCallback);
		if(this._captionsObj)
			this._captionsObj.play(id);
		Application.instance.on("update", this.update);
	};
	
	/**
	*	Callback for when the audio has finished playing.
	*	@method _audioCallback
	*	@private
	*/
	p._audioCallback = function()
	{
		this._audioFinished = true;
		this._currentAudioInstance = null;
		if(this._animFinished)
		{
			this.stop(true);
		}
	};
	
	/**
	*	Listener for frame updates.
	*	@method update
	*	@param {int} elapsed Time in milliseconds
	*	@private
	*/
	p.update = function(elapsed)
	{
		if(this._animFinished) return;
		
		if(this._currentAudioInstance)
		{
			var pos = this._currentAudioInstance.position * 0.001;
			//sometimes (at least with the flash plugin), the first check of the position would be very incorrect
			if(this._timeElapsed === 0 && pos > elapsed * 2)
			{
				//do nothing here
			}
			else if(this._currentAudioInstance)//random bug? - check avoids an unlikely null ref error
				this._timeElapsed = this._currentAudioInstance.position * 0.001;//save the time elapsed
		}
		else
			this._timeElapsed += elapsed * 0.001;
		if(this._captionsObj)
			this._captionsObj.seek(this._timeElapsed * 1000);
		//set the elapsed time of the clip
		var clip = (!this._clip.timeline || this._clip.timeline.duration == 1) ? this._clip.getChildAt(0) : this._clip;
		clip.elapsedTime = this._timeElapsed;
		if(clip.currentFrame == clip.timeline.duration)
		{
			this._animFinished = true;
			if(this._audioFinished)
			{
				this.stop(true);
			}
		}
	};

	/**
	*	Stops playback of the cutscene.
	*	@method stop
	*	@param {Boolean} [doCallback=false] If the end callback should be performed.
	*	@public
	*/
	p.stop = function(doCallback)
	{
		Application.instance.off("update", this.update);
		if(this._currentAudioInstance)
			Sound.instance.stop(this.config.audio.soundManifest[0].id);
		this._captionsObj.stop();

		if(doCallback && this._endCallback)
		{
			this._endCallback();
			this._endCallback = null;
		}
	};
	
	/**
	*	Destroys the cutscene.
	*	@method destroy
	*	@public
	*/
	p.destroy = function()
	{
		Application.instance.off("resize", this.resize);
		this.removeAllChildren(true);
		Sound.instance.unload([this.config.audio.soundManifest[0].id]);//unload audio
		this.config = null;
		if(this._taskMan)
		{
			this._taskMan.off();
			this._taskMan.destroy();
			this._taskMan = null;
		}
		this._currentAudioInstance = null;
		this._loadCallback = null;
		this._endCallback = null;
		this._clip = null;
		this._captionsObj = null;
		this.display.stage.removeChild(this);
		this.display = null;
	};
	
	namespace("cloudkid").Cutscene = Cutscene;
	namespace("cloudkid.createjs").Cutscene = Cutscene;
}());}();