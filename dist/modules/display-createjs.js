/*! SpringRoll 0.0.7 */
/**
 * @module CreateJS Display
 * @namespace springroll.createjs
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
		if (movieClip.timeline)
		{
			movieClip.gotoAndStop(frame);
		}
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
	namespace('springroll').MovieClipUtils = MovieClipUtils;
	namespace('springroll.createjs').MovieClipUtils = MovieClipUtils;

}());
/**
*  @module CreateJS Display
*  @namespace springroll.createjs
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
	namespace('springroll.createjs').DisplayAdapter = DisplayAdapter;

}());
/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function(undefined){

	// Import createjs classes
	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage,
		Touch;

	/**
	*   CreateJSDisplay is a display plugin for the springroll Framework
	*	that uses the EaselJS library for rendering.
	*
	*   @class CreateJSDisplay
	*   @extends springroll.AbstractDisplay
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

		this.animator = include('springroll.createjs.Animator');
		this.adapter = include('springroll.createjs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = CreateJSDisplay.prototype = Object.create(s);
	
	/**
	 * An internal helper to avoid creating an object each render
	 * while telling CreateJS the amount of time elapsed.
	 * @property DELTA_HELPER
	 * @static
	 * @private
	 */
	var DELTA_HELPER = {delta:0};

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
	* @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	*/
	p.render = function(elapsed, force)
	{
		if (force || (!this.paused && this._visible))
		{
			DELTA_HELPER.delta = elapsed;
			this.stage.update(DELTA_HELPER);
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
		this.stage.removeAllChildren(true);
		
		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').CreateJSDisplay = CreateJSDisplay;
	namespace('springroll.createjs').CreateJSDisplay = CreateJSDisplay;

}());
/**
*  @module CreateJS Display
*  @namespace springroll.createjs
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
	namespace('springroll.createjs').AnimatorTimeline = AnimatorTimeline;
	
}());
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
	*   @return {springroll.createjs.AnimatorTimeline} The Timeline object that represents this play() call.
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
		else if(onCancelled === true)
			onCancelled = onComplete;
		//deprecation fallback
		if(typeof eventList == "string" && options)
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
		var timeline = Animator._makeTimeline(instance, eventList, onComplete, onCancelled);

		//if the animation is present and complete
		if (timeline.eventList && timeline.eventList.length >= 1)
		{
			timeline._nextItem();//advance the timeline to the first item

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

		if (true)
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
	*   @method _makeTimeline
	*   @param {createjs.MovieClip} instance The instance to animate
	*   @param {Array} eventList List of animation events
	*   @param {Function} onComplete The function to callback when we're done
	*   @param {Function} onCancelled The function to callback when cancelled
	*   @return {springroll.createjs.AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(instance, eventList, onComplete, onCancelled)
	{
		var timeline = new AnimatorTimeline();
		if (!Animator.canAnimate(instance))//not a movieclip
		{
			if (true)
			{
				Debug.warn("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
			}
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
		var anim, audio, start, speed, alias;
		for(var j = 0, jLen = eventList.length; j < jLen; ++j)
		{
			var listItem = eventList[j];
			switch(typeof listItem)
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
					start = audio.start > 0 ? audio.start * 0.001 : 0;//seconds
					alias = audio.alias;
				}
				if(Sound.instance.exists(alias))
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
		if(!instance)
			return false;
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
	*   @method getDuration
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
			if (true)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
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

		for (var i=0, len = removedTimelines.length; i < len; i++)
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
	*   @param {springroll.createjs.AnimatorTimeline} timeline
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
	*   @return {springroll.createjs.AnimatorTimeline} The timeline
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
						if(t.firstFrame >= 0)
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
			if(onNext)
			{
				t._time_sec += extraTime;
				if(t.firstFrame >= 0)
					instance.gotoAndPlay(t.firstFrame);
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
	*  @param {springroll.createjs.AnimatorTimeline} timeline
	*/
	var onSoundStarted = function(timeline, playIndex)
	{
		if(timeline.listIndex != playIndex) return;

		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};

	/**
	*  The sound is done
	*  @method onSoundDone
	*  @private
	*  @param {springroll.createjs.AnimatorTimeline} timeline
	*/
	var onSoundDone = function(timeline, playIndex, soundAlias)
	{
		if (Animator.captions && Animator.captions.currentAlias == soundAlias)
			Animator.captions.stop();
		
		if(timeline.listIndex != playIndex) return;

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
		return "[springroll.createjs.Animator]";
	};

	// Assign to the global namespace
	namespace('springroll').Animator = Animator;
	namespace('springroll.createjs').Animator = Animator;

}());

/**
*  @module CreateJS Display
*  @namespace springroll.createjs
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
	 *  @param {Object} [label.stroke=null] The stroke to use for the label text, if desired, as createjs.Text (springroll fork only) expects.
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
			throw "springroll.createjs.Button requires an image as the first parameter";
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
			var inputData, stateLabel;
			for (i = this._statePriority.length - 1; i >= 0; --i) //start at the end to start at the up state
			{
				state = this._statePriority[i];
				//set up the property for the state so it can be set - the function will ignore reserved states
				this._addProperty(state);
				//set the default value for the state flag
				if (state != "disabled" && state != "up")
				{
					this._stateFlags[state] = false;
				}
				inputData = imageSettings[state];
				//it's established that over, down, and particularly disabled default to the up state
				_stateData[state] = inputData ? clone(inputData) : _stateData.up;
				//set up the label info for this state
				if (label)
				{
					//if there is actual label data for this state, use that
					if (inputData && inputData.label)
					{
						inputData = inputData.label;
						stateLabel = _stateData[state].label = {};
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
					{
						_stateData[state].label = labelData;
					}
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
			{
				_stateData.over = _stateData.up;
			}
			if (!_stateData.down)
			{
				_stateData.down = _stateData.up;
			}
			if (!_stateData.disabled)
			{
				_stateData.disabled = _stateData.up;
			}
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
		if(!copy)
			copy = {};
		for (var attr in obj)
		{
			if (obj.hasOwnProperty(attr))
			{
				copy[attr] = obj[attr];
			}
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
			for (var i = 0, len = this._statePriority.length; i < len; ++i)
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
		for (var i = 0, len = this._statePriority.length; i < len; ++i)
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

	namespace('springroll').Button = Button;
	namespace('springroll.createjs').Button = Button;
}());

/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function(){

	var Button = include('springroll.createjs.Button'),
		Sound;

	/**
	 *  A button with audio events for click and over mouse events
	 *  @class SoundButton
	 *  @extends springroll.createjs.Button
	 *  @constructor
	 *  @param {DOMElement|object} imageSettings The loaded image element, see springroll.createjs.Button constructor
	 *  @param {Object} [label=null] See springroll.createjs.Button constructor
	 *  @param {Boolean} [enabled=true] If the button should be enabled by default
	 *  @param {String} [clickAlias="ButtonClick"] The button click audio alias
	 *  @param {String} [overAlias="ButtonRollover"] The button rollover audio alias
	 */
	var SoundButton = function(imageSettings, label, enabled, clickAlias, overAlias)
	{
		Sound = include('springroll.Sound');

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
		this.addEventListener('rollover', this._onRollover);
		this.addEventListener(Button.BUTTON_PRESS, this._onButtonPress);
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
		if (this.clickAlias && this._audioEnabled)
		{
			Sound.instance.play(this.clickAlias);
		}
	};

	/**
	 *  Handler for rollover event.
	 *  @method _onRollover
	 *  @private
	 */
	p._onRollover = function(e)
	{
		if (this.overAlias && this.enabled && this._audioEnabled)
		{
			Sound.instance.play(this.overAlias);
		}	
	};

	/**
	 *  If audio should be played for this button.
	 *  @property {Boolean} audioEnabled
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
		this.removeEventListener("rollover", this._onRollover);
		this.removeEventListener(Button.BUTTON_PRESS, this._onButtonPress);
		this.audioEnabled = false;
		s.destroy.apply(this);
	};

	// Assign to namespace
	namespace('springroll').SoundButton = SoundButton;
	namespace('springroll.createjs').SoundButton = SoundButton;

}());
/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function() {
	
	var DragData = function(obj)
	{
		this.obj = obj;
		this.mouseDownObjPos = {x:0, y:0};
		this.dragOffset = new createjs.Point();
		this.mouseDownStagePos = {x:0, y:0};
	};
	
	/** Assign to the global namespace */
	namespace('springroll').DragData = DragData;
	namespace('springroll.createjs').DragData = DragData;
}());
/**
 *  @module CreateJS Display
 *  @namespace springroll.createjs
 */
(function()
{

	var Tween,
		DragData = include("springroll.createjs.DragData");

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
		if (!Tween)
		{
			Tween = include('createjs.Tween', false);
		}

		/**
		 * The object that's being dragged, or a dictionary of DragData being dragged
		 * by id if multitouch is true.
		 * @public
		 * @readOnly
		 * @property {createjs.DisplayObject|Dictionary} draggedObj
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
		 * The position x, y of the mouse down on the stage. This is only used
		 * when multitouch is false - the DragData has it when multitouch is true.
		 * @private
		 * @property {object} mouseDownStagePos
		 */
		this.mouseDownStagePos = {
			x: 0,
			y: 0
		};

		/**
		 * The position x, y of the object when interaction with it started. If multitouch is
		 * true, then this will only be set during a drag stop callback, for the object that just
		 * stopped getting dragged.
		 * @property {object} mouseDownObjPos
		 */
		this.mouseDownObjPos = {
			x: 0,
			y: 0
		};

		/**
		 * If sticky click dragging is allowed.
		 * @public
		 * @property {Boolean} allowStickyClick
		 * @default true
		 */
		this.allowStickyClick = true;

		/**
		 * Is the move touch based
		 * @public
		 * @readOnly
		 * @property {Boolean} isTouchMove
		 * @default false
		 */
		this.isTouchMove = false;

		/**
		 * Is the drag being held on mouse down (not sticky clicking)
		 * @public
		 * @readOnly
		 * @property {Boolean} isHeldDrag
		 * @default false
		 */
		this.isHeldDrag = false;

		/**
		 * Is the drag a sticky clicking (click on a item, then mouse the mouse)
		 * @public
		 * @readOnly
		 * @property {Boolean} isStickyClick
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
		 * The offset from the dragged object's position that the initial mouse event
		 * was at. This is only used when multitouch is false - the DragData has
		 * it when multitouch is true.
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

		this._triggerHeldDrag = this._triggerHeldDrag.bind(this);
		this._triggerStickyClick = this._triggerStickyClick.bind(this);
		this._stopDrag = this._stopDrag.bind(this);
		this._updateObjPosition = this._updateObjPosition.bind(this);

		/**
		 * The collection of draggable objects
		 * @private
		 * @property {Array} _draggableObjects
		 */
		this._draggableObjects = [];

		/**
		 * A point for reuse instead of lots of object creation.
		 * @private
		 * @property {createjs.Point} _helperPoint
		 */
		this._helperPoint = null;

		/**
		 * If this DragManager is using multitouch for dragging.
		 * @private
		 * @property {Boolean} _multitouch
		 */
		this._multitouch = false;
	};

	/** Reference to the drag manager */
	var p = DragManager.prototype = {};

	/**
	 * If the DragManager allows multitouch dragging. Setting this stops any current
	 * drags.
	 * @property {Boolean} multitouch
	 */
	Object.defineProperty(p, "multitouch",
	{
		get: function()
		{
			return this._multitouch;
		},
		set: function(value)
		{
			if (this.draggedObj)
			{
				if (this._multitouch)
				{
					for (var id in this.draggedObj)
					{
						this._stopDrag(id, true);
					}
				}
				else
					this._stopDrag(null, true);
			}
			this._multitouch = !!value;
			this.draggedObj = value ?
			{} : null;
		}
	});

	/**
	 *  Manually starts dragging an object. If a mouse down event is not
	 *  supplied as the second argument, it defaults to a held drag, that ends as
	 *  soon as the mouse is released. When using multitouch, passing a mouse event is
	 *  required.
	 *  @method startDrag
	 *  @public
	 *  @param {createjs.DisplayObject} object The object that should be dragged.
	 *  @param {createjs.MouseEvent} ev A mouse down event that should be considered to have
	 *                                  started the drag, to determine what type of drag should be
	 *                                  used.
	 */
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};

	/**
	 * Mouse down on an obmect
	 *  @method _objMouseDown
	 *  @private
	 *  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine
	 *                                  what type of drag should be used.
	 *  @param {createjs.DisplayObject} object The object that should be dragged.
	 */
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if ((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !ev)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if (this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[ev.pointerID] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new createjs.Point();
		}
		//stop any active tweens on the object, in case it is moving around or something
		if (Tween)
			Tween.removeTweens(obj);

		if (ev)
		{
			//get the mouse position in global space and convert it to parent space
			dragOffset = obj.parent.globalToLocal(ev.stageX, ev.stageY, dragOffset);
			//move the offset to respect the object's current position
			dragOffset.x -= obj.x;
			dragOffset.y -= obj.y;
		}

		//save the position of the object before dragging began, for easy restoration, if desired
		mouseDownObjPos.x = obj.x;
		mouseDownObjPos.y = obj.y;

		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if (!ev)
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be
			//this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;
			//if it is a touch event, force it to be the held drag type
			if (!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')
			{
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag(ev);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				mouseDownStagePos.x = ev.stageX;
				mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDrag);
				obj.addEventListener("pressup", this._triggerStickyClick);
			}
		}
	};

	/**
	 * Start the sticky click
	 * @method _triggerStickyClick
	 * @param {createjs.MouseEvent} ev The mouse down event
	 * @private
	 */
	p._triggerStickyClick = function(ev)
	{
		this.isStickyClick = true;
		var draggedObj = this._multitouch ? this.draggedObj[ev.pointerID].obj : this.draggedObj;
		draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
		draggedObj.removeEventListener("pressup", this._triggerStickyClick);
		this._startDrag(ev);
	};

	/**
	 * Start hold dragging
	 * @method _triggerHeldDrag
	 * @private
	 * @param {createjs.MouseEvent} ev The mouse down event
	 */
	p._triggerHeldDrag = function(ev)
	{
		this.isHeldMove = true;
		var mouseDownStagePos, draggedObj;
		if (this._multitouch)
		{
			draggedObj = this.draggedObj[ev.pointerID].obj;
			mouseDownStagePos = this.draggedObj[ev.pointerID].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = ev.stageX - mouseDownStagePos.x;
		var yDiff = ev.stageY - mouseDownStagePos.y;
		if (xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
			draggedObj.removeEventListener("pressup", this._triggerStickyClick);
			this._startDrag(ev);
		}
	};

	/**
	 * Internal start dragging on the stage
	 * @method _startDrag
	 * @private
	 */
	p._startDrag = function(ev)
	{
		var stage = this._theStage;
		//duplicate listeners are ignored
		stage.addEventListener("stagemousemove", this._updateObjPosition);
		stage.addEventListener("stagemouseup", this._stopDrag);

		this._dragStartCallback(this._multitouch ?
			this.draggedObj[ev.pointerID].obj :
			this.draggedObj);
	};

	/**
	 * Stops dragging the currently dragged object.
	 * @public
	 * @method stopDrag
	 * @param {Boolean} [doCallback=false] If the drag end callback should be called.
	 * @param {createjs.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	 *                                       is true. If this is omitted, it stops all drags.
	 */
	p.stopDrag = function(doCallback, obj)
	{
		var id = null;
		if (this._multitouch && obj)
		{
			for (var key in this.draggedObj)
			{
				if (this.draggedObj[key].obj == obj)
				{
					id = key;
					break;
				}
			}
		}
		//pass true if it was explicitly passed to us, false and undefined -> false
		this._stopDrag(id, doCallback === true);
	};

	/**
	 * Internal stop dragging on the stage
	 * @method _stopDrag
	 * @private
	 * @param {createjs.MouseEvent} ev Mouse up event
	 * @param {Boolean} doCallback If we should do the callback
	 */
	p._stopDrag = function(ev, doCallback)
	{
		var obj, id;
		if (this._multitouch)
		{
			if (ev)
			{
				//stop a specific drag
				id = ev;
				if (ev instanceof createjs.MouseEvent)
					id = ev.pointerID;

				var data = this.draggedObj[id];
				if (!data) return;
				obj = data.obj;
				//save the position that it started at so the callback can make use of it
				//if they want
				this.mouseDownObjPos.x = data.mouseDownObjPos.x;
				this.mouseDownObjPos.y = data.mouseDownObjPos.y;
				delete this.draggedObj[id];
			}
			else
			{
				//stop all drags
				for (id in this.draggedObj)
				{
					this._stopDrag(id, doCallback);
				}
				return;
			}
		}
		else
		{
			obj = this.draggedObj;
			this.draggedObj = null;
		}

		if (!obj) return;

		obj.removeEventListener("pressmove", this._triggerHeldDrag);
		obj.removeEventListener("pressup", this._triggerStickyClick);
		var removeGlobalListeners = !this._multitouch;
		if (this._multitouch)
		{
			//determine if this was the last drag
			var found = false;
			for (id in this.draggedObj)
			{
				found = true;
				break;
			}
			removeGlobalListeners = !found;
		}
		if (removeGlobalListeners)
		{
			this._theStage.removeEventListener("stagemousemove", this._updateObjPosition);
			this._theStage.removeEventListener("stagemouseup", this._stopDrag);
		}
		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if (doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	 * Update the object position based on the mouse
	 * @method _updateObjPosition
	 * @private
	 * @param {createjs.MouseEvent} ev Mouse move event
	 */
	p._updateObjPosition = function(ev)
	{
		if (!this.isTouchMove && !this._theStage.mouseInBounds) return;

		var draggedObj, dragOffset;
		if (this._multitouch)
		{
			var data = this.draggedObj[ev.pointerID];
			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}
		var mousePos = draggedObj.parent.globalToLocal(ev.stageX, ev.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		if (bounds)
		{
			draggedObj.x = clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.y = clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.x = mousePos.x - dragOffset.x;
			draggedObj.y = mousePos.y - dragOffset.y;
		}
		if (this.snapSettings)
		{
			switch (this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos, dragOffset, draggedObj);
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
	 * @param {createjs.Point} localMousePos The mouse position in the same
	 *                                       space as the dragged object.
	 * @param {createjs.Point} dragOffset The drag offset for the dragged object.
	 * @param {createjs.DisplayObject} obj The object to snap.
	 */
	p._handlePointSnap = function(localMousePos, dragOffset, obj)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - dragOffset.x;
		var objY = localMousePos.y - dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;

		var p, distSq;
		for (var i = points.length - 1; i >= 0; --i)
		{
			p = points[i];
			distSq = distSquared(objX, objY, p.x, p.y);
			if (distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if (closestPoint)
		{
			obj.x = closestPoint.x;
			obj.y = closestPoint.y;
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
	var clamp = function(x, a, b)
	{
		return (x < a ? a : (x > b ? b : x));
	};

	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		// Allow for the enableDrag(false) 
		if (enable === false)
		{
			disableDrag.apply(this);
			return;
		}

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
	 * _dragBounds (Rectangle), _onMouseDownListener (Function),
	 * _dragMan (springroll.DragManager) reference to the DragManager
	 * these will override any existing properties of the same name
	 * @method addObject
	 * @public
	 * @param {createjs.DisplayObject} obj The display object
	 * @param {createjs.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	 *                                      will be added to this object.
	 */
	p.addObject = function(obj, bounds)
	{
		if (bounds)
		{
			bounds.right = bounds.x + bounds.width;
			bounds.bottom = bounds.y + bounds.height;
		}
		obj._dragBounds = bounds;
		if (this._draggableObjects.indexOf(obj) >= 0)
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
		if (index >= 0)
			this._draggableObjects.splice(index, 1);
	};

	/**
	 *  Destroy the manager
	 *  @public
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.stopDrag(false);
		this.draggedObj = null;
		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
		this._theStage = null;

		var obj;
		for (var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			obj = this._draggableObjects[i];
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
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.createjs').DragManager = DragManager;
}());
/**
*  @module CreateJS Display
*  @namespace springroll.createjs
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
	*  Cutscene is a class for playing a single EaselJS animation synced to a
	*  single audio file with springroll.Sound, with optional captions. Utilizes the Tasks module.
	*
	*  @class Cutscene
	*  @constructor
	*  @param {Object} options The runtime specific setup data for the cutscene.
	*  @param {String|Display} options.display The display or display id of the CreateJSDisplay
	*                                          to draw on.
	*  @param {String} options.configUrl The url of the json config file describing the cutscene.
	*                                    See the example project.
	*  @param {Function} [options.loadCallback] A function to call when loading is complete.
	*  @param {String} [options.pathReplaceTarg] A string found in the paths of images that should
	*                                            be replaced with another value.
	*  @param {String} [options.pathReplaceVal] The string to use when replacing
	*                                           options.pathReplaceTarg.
	*  @param {Number} [options.imageScale=1] Scaling to apply to all images loaded for the
	*                                         cutscene.
	*  @param {Captions} [options.captions] A Captions instance to display captions text on.
	*/
	var Cutscene = function(options)
	{
		if(!Application)
		{
			Application = include('springroll.Application');
			LoadTask = include('springroll.LoadTask');
			TaskManager = include('springroll.TaskManager');
			Sound = include('springroll.Sound');
			ListTask = include('springroll.ListTask');
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
		this.display = typeof options.display == "string" ?
			Application.instance.getDisplay(options.display) :
			options.display;

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
		*	All audio aliases used by this Cutscene, for preloading and later unloading.
		*	@property {Array} _audioAliases
		*	@private
		*/
		this._audioAliases = null;
		
		/**
		*	Time sorted list of audio that needs to be played, as well as information on if they
		*	should be synced or not.
		*	@property {Array} _audio
		*	@private
		*/
		this._audio = null;
		
		/**
		*	Index of the sound that is next up in _audio.
		*	@property {int} _audioIndex
		*	@private
		*/
		this._audioIndex = 0;
		
		/**
		*	Time sorted list of audio that needs to be played, as well as information on if they
		*	should be synced or not.
		*	@property {Array} _audio
		*	@private
		*/
		this._audio = null;

		/**
		*	The clip that is being animated.
		*	@property {createjs.MovieClip} _clip
		*	@private
		*/
		this._clip = null;

		/**
		*	The sound instance of the playing audio that the animation should be synced to.
		*	@property {springroll.SoundInstance} _currentAudioInstance
		*	@private
		*/
		this._currentAudioInstance = null;
		
		/**
		*	The time in seconds into the animation that the current synced audio started.
		*	@property {Number} _soundStartTime
		*	@private
		*/
		this._soundStartTime = -1;
		
		/**
		*	Array of active SoundInstances that are not the currently synced one.
		*	@property {Array} _activeAudio
		*	@private
		*/
		this._activeAudio = [];

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

		// Make sure the captions don't update themselves
		if (this._captionsObj) this._captionsObj.selfUpdate = false;

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

		//parse config
		this.framerate = this.config.settings.fps;

		//figure out what to load
		var manifest = [];
		//the javascript file
		manifest.push({id:"clip", src:this.config.settings.clip});
		//all the images
		var url;
		for (var key in this.config.images)
		{
			url = this.pathReplaceTarg ?
				this.config.images[key].replace(this.pathReplaceTarg, this.pathReplaceVal) :
				this.config.images[key];
			manifest.push({id:key, src:url});
		}

		this._taskMan.addTask(new ListTask("art", manifest, this.onArtLoaded.bind(this)));
		if(this.config.settings.audioAlias)
		{
			this._audioAliases = [this.config.settings.audioAlias];
			this._audio = [{alias:this.config.settings.audioAlias, start:0, sync:true}];
		}
		else if(this.config.settings.audio)
		{
			this._audio = this.config.settings.audio.slice();
			this._audio.sort(audioSorter);
			this._audioAliases = [];
			for(var i = 0, length = this._audio.length; i < length; ++i)
			{
				if(this._audioAliases.indexOf(this._audio[i].alias) == -1)
					this._audioAliases.push(this._audio[i].alias);
			}
		}
		else
		{
			Debug.error("Cutscene really needs some audio to play");
			return;
		}
		if(this._audioAliases.length)
		{
			this._taskMan.addTask(Sound.instance.createPreloadTask("audio",
				this._audioAliases, this.onAudioLoaded));
		}
	};
	
	function audioSorter(a, b)
	{
		return a.start - b.start;
	}

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

		var result, imgScale, key;
		for (id in results)
		{
			result = results[id].content;
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
				//if bitmaps need scaling, then do black magic to the object prototypes so the
				//scaling is built in
				if(this.imageScale != 1)
				{
					imgScale = this.imageScale;
					for (key in this.config.images)
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
		for (id in atlasData)//if we loaded any spritesheets, load them up
		{
			if(atlasData[id] && atlasImages[id])
			{
				BitmapUtils.loadSpriteSheet(
					atlasData[id].frames,
					atlasImages[id],
					this.imageScale);
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
		//so if the clip only has one frame or is a container, then we get the child of the clip
		//as the animation
		if(!this._clip.timeline || this._clip.timeline.duration == 1)
		{
			clip = this._clip.getChildAt(0);
		}
		clip.mouseEnabled = false;
		clip.framerate = this.framerate;
		clip.advanceDuringTicks = false;
		//internally, movieclip has to be playing to change frames during tick() or advance().
		clip.gotoAndPlay(0);
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
		
		var settings = this.config.settings;
		var designedRatio = settings.designedWidth / settings.designedHeight,
			currentRatio = width / height,
			scale;
		
		if(designedRatio > currentRatio)
		{
			//current ratio is narrower than the designed ratio, scale to width
			scale = width / settings.designedWidth;
			this.x = 0;
			this.y = (height - settings.designedHeight * scale) * 0.5;
		}
		else
		{
			scale = height / settings.designedHeight;
			this.x = (width - settings.designedWidth * scale) * 0.5;
			this.y = 0;
		}
		this._clip.scaleX = this._clip.scaleY = scale;
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

		this._elapsedTime = 0;
		this._animFinished = false;
		this._audioFinished = false;
		for(var i = 0; i < this._audio.length; ++i)
		{
			var data = this._audio[i];
			if(data.start === 0)
			{
				var alias = data.alias;
				var instanceRef = {};
				if(data.sync)
				{
					if(this._currentAudioInstance)
						this._activeAudio.push(this._currentAudioInstance);
					this._currentAudioInstance = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					instanceRef.instance = this._currentAudioInstance;
					this._soundStartTime = data.start;
					if(this._captionsObj)
					{
						this._captionsObj.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					instanceRef.instance = instance;
					this._activeAudio.push(instance);
				}
				++this._audioIndex;
			}
			else
				break;
		}
		
		Application.instance.on("update", this.update);
	};

	/**
	*	Callback for when the audio has finished playing.
	*	@method _audioCallback
	*	@private
	*/
	p._audioCallback = function(instanceRef)
	{
		if(instanceRef.instance == this._currentAudioInstance)
		{
			this._audioFinished = true;
			this._currentAudioInstance = null;
			this._soundStartTime = -1;
			if(this._captionsObj)
				this._captionsObj.stop();
			if(this._animFinished)
			{
				this.stop(true);
			}
		}
		else
		{
			var index = this._activeAudio.indexOf(instanceRef.instance);
			if(index != -1)
				this._activeAudio.splice(index, 1);
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
		
		for(var i = this._audioIndex; i < this._audio.length; ++i)
		{
			var data = this._audio[i];
			if(data.start <= this._elapsedTime)
			{
				var alias = data.alias;
				var instanceRef = {};
				if(data.sync)
				{
					this._audioFinished = false;
					if(this._currentAudioInstance)
						this._activeAudio.push(this._currentAudioInstance);
					this._currentAudioInstance = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					instanceRef.instance = this._currentAudioInstance;
					this._soundStartTime = data.start;
					if(this._captionsObj)
					{
						this._captionsObj.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(
						alias,
						{
							complete: this._audioCallback.bind(this, instanceRef),
							offset: (this._elapsedTime - data.start) * 1000
						});
					instanceRef.instance = instance;
					this._activeAudio.push(instance);
				}
				++this._audioIndex;
			}
			else
				break;
		}

		if(this._currentAudioInstance)
		{
			var pos = this._currentAudioInstance.position * 0.001;
			//sometimes (at least with the flash plugin), the first check of the
			//position would be very incorrect
			if(this._elapsedTime === 0 && pos > elapsed * 2)
			{
				//do nothing here
			}
			else if(this._currentAudioInstance)
			{
				//random bug? - else if check avoids an unlikely null ref error
				
				//save the time elapsed
				this._elapsedTime = this._soundStartTime +
										this._currentAudioInstance.position * 0.001;
			}
		}
		else
		{
			this._elapsedTime += elapsed * 0.001;
		}

		if(this._captionsObj && this._soundStartTime >= 0)
		{
			this._captionsObj.seek(this._currentAudioInstance.position);
		}
		if(!this._animFinished)
		{
			//set the elapsed time of the clip
			var clip = (!this._clip.timeline || this._clip.timeline.duration == 1) ?
				this._clip.getChildAt(0) :
				this._clip;
			clip.elapsedTime = this._elapsedTime;
			clip.advance();
			if(clip.currentFrame == clip.timeline.duration)
			{
				this._animFinished = true;
				if(this._audioFinished)
				{
					this.stop(true);
				}
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
			this._currentAudioInstance.stop();
		for(var i = 0; i < this._activeAudio.length; ++i)
			this._activeAudio[i].stop();
		if(this._captionsObj)
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
		Sound.instance.unload(this._audioAliases);//unload audio
		this.config = null;
		if(this._taskMan)
		{
			this._taskMan.off();
			this._taskMan.destroy();
			this._taskMan = null;
		}
		this._currentAudioInstance = null;
		this._activeAudio = null;
		this._audioAliases = this._audio = null;
		this._loadCallback = null;
		this._endCallback = null;
		this._clip = null;
		this._captionsObj = null;
		if(this.parent)
			this.parent.removeChild(this);
		this.display = null;
	};

	namespace("springroll").Cutscene = Cutscene;
	namespace("springroll.createjs").Cutscene = Cutscene;
}());
