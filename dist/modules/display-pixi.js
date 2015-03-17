/*! SpringRoll 0.0.7 */
/**
*  @module PIXI Display
*  @namespace springroll.pixi
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
	*  @default PIXI.Circle
	*/
	DisplayAdapter.Circle = include('PIXI.Circle');

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default PIXI.Ellipse
	*/
	DisplayAdapter.Ellipse = include('PIXI.Ellipse');

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default PIXI.Rectangle
	*/
	DisplayAdapter.Rectangle = include('PIXI.Rectangle');

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default PIXI.Sector
	*/
	DisplayAdapter.Sector = include('PIXI.Sector', false);

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default PIXI.Point
	*/
	DisplayAdapter.Point = include('PIXI.Point');

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default PIXI.Polygon
	*/
	DisplayAdapter.Polygon = include('PIXI.Polygon');

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default true
	*/
	DisplayAdapter.useRadians = true;

	/**
	*  Gets the object's boundaries in its local coordinate space, without any scaling or
	*  rotation applied.
	*  @method getLocalBounds
	*  @static
	*  @param {PIXI.DisplayObject} object The createjs display object
	*  @return {PIXI.Rectangle} A rectangle with additional right and bottom properties.
	*/
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds;
		var width = object.width;
		var height = object.height;
		if(width && height)
		{
			bounds = new PIXI.Rectangle(-object.pivot.x, -object.pivot.y, width / object.scale.x, height / object.scale.y);
		}
		else
		{
			bounds = new PIXI.Rectangle();
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	*  Normalize the object scale
	*  @method getScale
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {String} [direction] Either "x" or "y" to return a specific value
	*  @return {object|Number} A scale object with x and y keys or a single number if direction is set
	*/
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.scale[direction];
		}
		return object.scale;
	};

	/**
	*  Normalize the object position setting
	*  @method setPosition
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {object|Number} position The position object or the value
	* 		if the direction is set.
	*  @param {Number} [position.x] The x value
	*  @param {Number} [position.y] The y value
	*  @param {String} [direction] Either "x" or "y" value
	*  @return {PIXI.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object.position[direction] = position;
		}
		else
		{
			if (position.x !== undefined) object.position.x = position.x;
			if (position.y !== undefined) object.position.y = position.y;
		}
		return object;
	};

	/**
	*  Normalize the object position getting
	*  @method getPosition
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {String} [direction] Either "x" or "y", default is an object of both
	*  @return {Object|Number} The position as an object with x and y keys if no direction
	*		value is set, or the value of the specific direction
	*/
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.position[direction];
		}
		return object.position;
	};

	/**
	*  Normalize the object scale setting
	*  @method setScale
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {Number} scale The scaling object or scale value for x and y
	*  @param {String} [direction] Either "x" or "y" if setting a specific value, default
	* 		sets both the scale x and scale y.
	*  @return {PIXI.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object.scale[direction] = scale;
		}
		else
		{
			object.scale.x = object.scale.y = scale;
		}
		return object;
	};

	/**
	*  Set the pivot or registration point of an object
	*  @method setPivot
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {object|Number} pivot The object pivot point or the value if the direction is set
	*  @param {Number} [pivot.x] The x position of the pivot point
	*  @param {Number} [pivot.y] The y position of the pivot point
	*  @param {String} [direction] Either "x" or "y" the value for specific direction, default
	* 		will set using the object.
	*  @return {PIXI.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object.pivot[direction] = pivot;
		}
		object.pivot = pivot;
		return object;
	};

	/**
	*  Set the hit area of the shape
	*  @method setHitArea
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {Object} shape The geometry object
	*  @return {PIXI.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitArea = shape;
		return object;
	};

	/**
	*  Get the original size of a bitmap
	*  @method getBitmapSize
	*  @static
	*  @param {PIXI.Bitmap} bitmap The bitmap to measure
	*  @return {object} The width (w) and height (h) of the actual bitmap size
	*/
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			h: bitmap.height / bitmap.scale.y,
			w: bitmap.width / bitmap.scale.x
		};
	};

	/**
	*  Remove all children from a display object
	*  @method removeChildren
	*  @static
	*  @param {PIXI.DisplayObjectContainer} container The display object container
	*/
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeChildren(true);
	};

	// Assign to namespace
	namespace('springroll.pixi').DisplayAdapter = DisplayAdapter;

}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function(undefined){

	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage = include('PIXI.Stage'),
		CanvasRenderer = include('PIXI.CanvasRenderer'),
		WebGLRenderer = include('PIXI.WebGLRenderer'),
		autoDetectRenderer = include('PIXI.autoDetectRenderer');

	/**
	* PixiDisplay is a display plugin for the springroll Framework
	* that uses the Pixi library for rendering.
	*
	* @class PixiDisplay
	* @extends springroll.AbstractDisplay
	* @constructor
	* @param {String} id The id of the canvas element on the page to draw to.
	* @param {Object} options The setup data for the Pixi stage.
	* @param {String} [options.forceContext=null] If a specific renderer should be used instead of
	*                                             WebGL falling back to Canvas. Use "webgl" or
	*                                             "canvas2d" to specify a renderer.
	* @param {Boolean} [options.clearView=false] If the stage should wipe the canvas between
	*                                            renders.
	* @param {uint} [options.backgroundColor=0x000000] The background color of the stage (if it is
	*                                                  not transparent).
	* @param {Boolean} [options.transparent=false] If the stage should be transparent.
	* @param {Boolean} [options.antiAlias=false] If the WebGL renderer should use anti-aliasing.
	* @param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all
	*                                               images as pre-multiplied alpha. In most cases,
	*                                               you probably do not want to set this option to
	*                                               true.
	* @param {Boolean} [options.preserveDrawingBuffer=false] Set this to true if you want to call
	*                                                        toDataUrl on the WebGL rendering
	*                                                        context.
	*/
	var PixiDisplay = function(id, options)
	{
		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		*  The rendering library's stage element, the root display object
		*  @property {PIXI.Stage} stage
		*  @readOnly
		*  @public
		*/
		this.stage = new Stage(options.backgroundColor || 0);

		/**
		*  The Pixi renderer.
		*  @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer
		*  @readOnly
		*  @public
		*/
		this.renderer = null;

		//make the renderer
		var rendererOptions =
		{
			view: this.canvas,
			transparent: !!options.transparent,
			antialias: !!options.antiAlias,
			preserveDrawingBuffer: !!options.preserveDrawingBuffer,
			clearBeforeRender: !!options.clearView
		};
		var preMultAlpha = !!options.preMultAlpha;
		if(rendererOptions.transparent && !preMultAlpha)
			rendererOptions.transparent = "notMultiplied";
		
		//check for IE11 because it tends to have WebGL problems (especially older versions)
		//if we find it, then make Pixi use to the canvas renderer instead
		if(options.forceContext != "webgl")
		{
			var ua = window.navigator.userAgent;
			if (ua.indexOf("Trident/7.0") > 0)
				options.forceContext = "canvas2d";
		}
		if(options.forceContext == "canvas2d")
		{
			this.renderer = new CanvasRenderer(this.width, this.height, rendererOptions);
		}
		else if(options.forceContext == "webgl")
		{
			this.renderer = new WebGLRenderer(this.width, this.height, rendererOptions);
		}
		else
		{
			this.renderer = autoDetectRenderer(this.width, this.height, rendererOptions);
		}

		/**
		*  If Pixi is being rendered with WebGL.
		*  @property {Boolean} isWebGL
		*  @readOnly
		*  @public
		*/
		this.isWebGL = this.renderer instanceof WebGLRenderer;
		
		// Set the animator and display adapter classes
		this.animator = include('springroll.pixi.Animator');
		this.adapter = include('springroll.pixi.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = extend(PixiDisplay, AbstractDisplay);

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
			
			var interactionManager = this.stage.interactionManager;
			if(!interactionManager) return;
			if(value)
			{
				//add events to the interaction manager's target
				interactionManager.setTargetDomElement(this.canvas);
			}
			else
			{
				//remove event listeners
				interactionManager.removeInteractionEvents();
			}
		}
	});

	/**
	* Resizes the canvas and the renderer. This is only called by the Application.
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		s.resize.call(this, width, height);
		this.renderer.resize(width, height);
	};

	/**
	* Updates the stage and draws it. This is only called by the Application.
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed
	* @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	*/
	p.render = function(elapsed, force)
	{
		if(force || (!this.paused && this._visible))
		{
			this.renderer.render(this.stage);
		}
	};

	/**
	*  Destroys the display. This method is called by the Application and should
	*  not be called directly, use Application.removeDisplay(id).
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.stage.removeChildren();
		this.stage.destroy();
		this.renderer.destroy();
		this.renderer = null;
		
		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').PixiDisplay = PixiDisplay;
	namespace('springroll.pixi').PixiDisplay = PixiDisplay;

}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function(){
	
	/**
	* Class for assisting in creating an array of Spine animations to play at the same time
	* on one skeleton through Animator. Concurrent animations will play until one non-looping
	* animation ends.
	*
	* @class ConcurrentSpineAnimData
	* @constructor
	* @param {String} anim The name of the animation on the skeleton.
	* @param {Boolean} [loop=false] If this animation should loop.
	* @param {Number} [speed=1] The speed at which this animation should be played.
	*/
	var ConcurrentSpineAnimData = function(anim, loop, speed)
	{
		this.anim = anim;
		this.loop = !!loop;
		this.speed = speed > 0 ? speed : 1;
	};
	
	// Assign to namespace
	namespace("springroll.pixi").ConcurrentSpineAnimData = ConcurrentSpineAnimData;

}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function(){
	
	var Spine = include('PIXI.Spine'),
		AnimationState = include('PIXI.spine.AnimationState'),
		Texture = include('PIXI.Texture'),
		ConcurrentSpineAnimData = include('springroll.pixi.ConcurrentSpineAnimData');
	
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
					else if(anim[0] instanceof ConcurrentSpineAnimData)
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
						state.setAnimationByName(anim[0], false);
						this.duration = skeletonData.findAnimation(anim[0]).duration;
						for(i = 1; i < anim.length; ++i)
						{
							state.addAnimationByName(anim[i],
								this.isLooping && i == anim.length - 1);
							this.duration += skeletonData.findAnimation(anim[i]).duration;
						}
					}
				}
				var startTime = typeof listItem.start == "number" ? listItem.start * 0.001 : 0;
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
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function(undefined) {
	
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
		Animator.stopAll(false);
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
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function(undefined) {
	
	// Import classes
	var DisplayObjectContainer = include('PIXI.DisplayObjectContainer'),
		Point = include('PIXI.Point'),
		Sprite = include('PIXI.Sprite'),
		BitmapText = include('PIXI.BitmapText'),
		Text = include('PIXI.Text');

	/**
	*  A Multipurpose button class. It is designed to have one image, and an optional text label.
	*  The button can be a normal button or a selectable button.
	*  The button functions similarly with both CreateJS and PIXI, but slightly differently in
	*  initialization and callbacks.
	*  Use releaseCallback and overCallback to know about button clicks and mouse overs, respectively.
	*  
	*  @class Button
	*  @extends PIXI.DisplayObjectContainer
	*  @constructor
	*  @param {Object} imageSettings Information about the art to be used for button states, as well as if the button is selectable or not.
	*  @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults to ["disabled", "down", "over", "up"].
	*         Previous versions of Button used a hard coded order: ["highlighted", "disabled", "down", "over", "selected", "up"].
	*  @param {Object|PIXI.Texture} [imageSettings.up] The texture for the up state of the button. This can be either the texture itself,
	*         or an object with 'tex' and 'label' properties.
	*  @param {PIXI.Texture} [imageSettings.up.tex] The sourceRect for the state within the image.
	*  @param {Object} [imageSettings.up.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" and "type" from the label parameter may be overridden.
	*  @param {Object|PIXI.Texture} [imageSettings.over=null] The texture for the over state of the button. If omitted, uses the up state.
	*  @param {PIXI.Texture} [imageSettings.over.tex] The sourceRect for the state within the image.
	*  @param {Object} [imageSettings.over.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" and "type" from the label parameter may be overridden.
	*  @param {Object|PIXI.Texture} [imageSettings.down=null] The texture for the down state of the button. If omitted, uses the up state.
	*  @param {PIXI.Texture} [imageSettings.down.tex] The sourceRect for the state within the image.
	*  @param {Object} [imageSettings.down.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" and "type" from the label parameter may be overridden.
	*  @param {Object|PIXI.Texture} [imageSettings.disabled=null] The texture for the disabled state of the button. If omitted, uses the up state.
	*  @param {PIXI.Texture} [imageSettings.disabled.tex] The sourceRect for the state within the image.
	*  @param {Object} [imageSettings.disabled.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" and "type" from the label parameter may be overridden.
	*  @param {Object|PIXI.Texture} [imageSettings.<yourCustomState>=null] The visual information about a custom state found in imageSettings.priority.
	*         Any state added this way has a property of the same name added to the button. Examples of previous states that have been
	*         moved to this system are "selected" and "highlighted".
	*  @param {PIXI.Texture} [imageSettings.<yourCustomState>.tex] The texture for the custom state.
	*  @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to this state. Properties on this parameter 
	*         override data in the label parameter for this button state only. All values except "text" from the label parameter may be
	*         overridden.
	*  @param {PIXI.Point} [imageSettings.origin=null] An optional offset for all button graphics, in case you want button 
	*         positioning to not include a highlight glow, or any other reason you would want to offset the button art and label.
	*  @param {Number} [imageSettings.scale=1] The scale to use for the textures. This allows smaller art assets than the designed size to be used.
	*  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	*  @param {String} [label.type] If label.type is "bitmap", then a PIXI.BitmapText text is created, otherwise a PIXI.Text is created for the label.
	*  @param {String} [label.text] The text to display on the label.
	*  @param {Object} [label.style] The style of the text field, in the format that PIXI.BitmapText and PIXI.Text expect.
	*  @param {String|Number} [label.x="center"] An x position to place the label text at relative to the button.
	*  @param {String|Number} [label.y="center"] A y position to place the label text at relative to the button. If omitted,
	*         "center" is used, which attempts to vertically center the label on the button.
	*  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	*/
	var Button = function(imageSettings, label, enabled)
	{
		if (!imageSettings && true)
		{
			throw "springroll.pixi.Button requires image as first parameter";
		}

		DisplayObjectContainer.call(this);

		/*
		*  The sprite that is the body of the button.
		*  @public
		*  @property {PIXI.Sprite} back
		*  @readOnly
		*/
		this.back = new Sprite(imageSettings.up);

		/*
		*  The text field of the button. The label is centered by both width and height on the button.
		*  @public
		*  @property {PIXI.Text|PIXI.BitmapText} label
		*  @readOnly
		*/
		this.label = null;

		/**
		*  The function that should be called when the button is released.
		*  @public
		*  @property {function} releaseCallback
		*/
		this.releaseCallback = null;

		/**
		*  The function that should be called when the button is moused over.
		*  @public
		*  @property {function} overCallback
		*/
		this.overCallback = null;
		
		/**
		*  The function that should be called when mouse leaves the button.
		*  @public
		*  @property {function} outCallback
		*/
		this.outCallback = null;

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
		this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;
		
		/**
		* A dictionary of state graphic data, keyed by state name.
		* Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
		* Additionally, each object will contain a 'label' object if the button has a text label.
		* @private
		* @property {Object} _stateData
		*/
		this._stateData = null;

		/**
		* The current style for the label, to avoid setting this if it is unchanged.
		* @private
		* @property {Object} _currentLabelStyle
		*/
		this._currentLabelStyle = null;

		/**
		* An offset to button positioning, generally used to adjust for a highlight around the button.
		* @private
		* @property {PIXI.Point} _offset
		*/
		this._offset = new Point();
		
		//===callbacks for mouse/touch events
		/*
		* Callback for mouse over, bound to this button.
		* @private
		* @property {Function} _overCB
		*/
		this._overCB = null;

		/*
		* Callback for mouse out, bound to this button.
		* @private
		* @property {Function} _outCB
		*/
		this._outCB = null;

		/*
		* Callback for mouse down, bound to this button.
		* @private
		* @property {Function} _downCB
		*/
		this._downCB = null;

		/*
		* Callback for mouse up, bound to this button.
		* @private
		* @property {Function} _upCB
		*/
		this._upCB = null;

		/**
		* Callback for mouse up outside, bound to this button.
		* @private
		* @property {Function} _upOutCB
		*/
		this._upOutCB = null;
		
		/*
		* The width of the button art, independent of the scaling of the button itself.
		* @private
		* @property {Number} _width
		*/
		this._width = 0;

		/*
		* The height of the button art, independent of the scaling of the button itself.
		* @private
		* @property {Number} _height
		*/
		this._height = 0;

		this.initialize(imageSettings, label, enabled);
	};
	
	// Reference to the prototype
	var p = Button.prototype = Object.create(DisplayObjectContainer.prototype);
	
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
	*  Constructor for the button when using PIXI.
	*  @method initialize
	*  @param  {Object} [imageSettings] Information about the art to be used for button states, as well as if the button is selectable or not.
	*  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	*  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	*/
	p.initialize = function(imageSettings, label, enabled)
	{
		this.addChild(this.back);
		
		this._overCB = this._onOver.bind(this);
		this._outCB = this._onOut.bind(this);
		this._downCB = this._onDown.bind(this);
		this._upCB = this._onUp.bind(this);
		this._upOutCB = this._onUpOutside.bind(this);

		var _stateData = this._stateData = {};
		
		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if (label)
		{
			labelData = clone(label);
			delete labelData.text;
			delete labelData.type;
			if (labelData.x === undefined)
				labelData.x = "center";
			if (labelData.y === undefined)
				labelData.y = "center";
			//clone the style object and set up the defaults from PIXI.Text or PIXI.BitmapText
			var style = labelData.style = clone(label.style);
			if (label.type == "bitmap")
			{
				style.align = style.align || "left";
			}
			else
			{
				style.font = style.font || "bold 20pt Arial";
				style.fill = style.fill || "black";
				style.align = style.align || "left";
				style.stroke = style.stroke || "black";
				style.strokeThickness = style.strokeThickness || 0;
				style.wordWrap = style.wordWrap || false;
				style.wordWrapWidth = style.wordWrapWidth || 100;
			}
		}
		
		for(var i = this._statePriority.length - 1; i >= 0; --i)//start at the end to start at the up state
		{
			var state = this._statePriority[i];
			//set up the property for the state so it can be set - the function will ignore reserved states
			this._addProperty(state);
			//set the default value for the state flag
			if (state != "disabled" && state != "up")
				this._stateFlags[state] = false;
			var inputData = imageSettings[state];
			
			if (inputData)
			{
				//if inputData is an object with a tex property, use that
				//otherwise it is a texture itself
				if (inputData.tex)
					_stateData[state] = {tex: inputData.tex};
				else
					_stateData[state] = {tex: inputData};
			}
			else
			{
				//it's established that over, down, and particularly disabled default to the up state
				_stateData[state] = _stateData.up;
			}
			//set up the label info for this state
			if (label)
			{
				//if there is actual label data for this state, use that
				if (inputData && inputData.label)
				{
					inputData = inputData.label;
					var stateLabel = _stateData[state].label = {};
					stateLabel.style = inputData.style || labelData.style;
					stateLabel.x = inputData.x || labelData.x;
					stateLabel.y = inputData.y || labelData.y;
				}
				//otherwise use the default
				else
					_stateData[state].label = labelData;
			}
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

		if (imageSettings.scale)
		{
			var s = imageSettings.scale || 1;
			this.back.scale.x = this.back.scale.y = s;
		}
		
		if (label)
		{
			this.label = label.type == "bitmap" ? new BitmapText(label.text, labelData.style) : new Text(label.text, labelData.style);
			this.addChild(this.label);
		}

		this.back.x = this._offset.x;
		this.back.y = this._offset.y;
		
		this._width = this.back.width;
		this._height = this.back.height;
		
		this.enabled = enabled === undefined ? true : !!enabled;
	};

	/*
	*  A simple function for making a shallow copy of an object.
	*/
	function clone(obj)
	{
		if (!obj || "object" != typeof obj) return null;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
	
	/*
	*  The width of the button, based on the width of back. This value is affected by scale.
	*  @public
	*  @property {Number} width
	*/
	Object.defineProperty(p, "width", {
		get:function(){return this._width * this.scale.x;},
		set:function(value){
			this.scale.x = value / this._width;
		}
	});
	/*
	*  The height of the button, based on the height of back. This value is affected by scale.
	*  @public
	*  @property {Number} height
	*/
	Object.defineProperty(p, "height", {
		get:function(){return this._height * this.scale.y;},
		set:function(value){
			this.scale.y = value / this._height;
		}
	});
	
	/*
	*  Sets the text of the label. This does nothing if the button was not initialized with a label.
	*  @public
	*  @method setText
	*  @param {String} text The text to set the label to.
	*/
	p.setText = function(text)
	{
		if (this.label)
		{
			this.label.setText(text);
			//make the text update so we can figure out the size for positioning
			if (this.label instanceof Text)
			{
				this.label.updateText();
				this.label.dirty = false;
			}
			else
				this.label.forceUpdateText();
			//position the text
			var data;
			for(var i = 0; i < this._statePriority.length; ++i)
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
			{
				var bW = this.back.width, lW = this.label.width;
				switch(this._currentLabelStyle.align)
				{
					case "center":
						this.label.position.x = bW * 0.5;
						break;
					case "right":
						this.label.position.x = (bW - lW) * 0.5 + lW;
						break;
					default://left or null (defaults to left)
						this.label.position.x = (bW - lW) * 0.5;
						break;
				}
			}
			else
				this.label.position.x = data.x + this._offset.x;
			if (data.y == "center")
			{
				this.label.position.y = (this.back.height - this.label.height) * 0.5;
			}
			else
				this.label.position.y = data.y + this._offset.y;
		}
	};
	
	/*
	*  Whether or not the button is enabled.
	*  @public
	*  @property {Boolean} enabled
	*  @default true
	*/
	Object.defineProperty(p, "enabled", {
		get: function() { return !this._stateFlags.disabled; },
		set: function(value)
		{
			this._stateFlags.disabled = !value;
			this.buttonMode = value;
			this.interactive = value;
			
			//make sure interaction callbacks are properly set
			if (value)
			{
				this.mousedown = this.touchstart = this._downCB;
				this.mouseover = this._overCB;
				this.mouseout = this._outCB;
			}
			else
			{
				this.mousedown = this.touchstart = this.mouseover = this.mouseout = null;
				this.mouseup = this.touchend = this.mouseupoutside = this.touchendoutside = null;
				this._stateFlags.down = this._stateFlags.over = false;
				//also turn off pixi values so that re-enabling button works properly
				this.__isOver = false;
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
		
		Object.defineProperty(this, propertyName, {
			get: function() { return this._stateFlags[propertyName]; },
			set: function(value)
			{
				this._stateFlags[propertyName] = value;
				this._updateState();
			}
		});
	};
	
	/*
	*  Updates back based on the current button state.
	*  @private
	*  @method _updateState
	*/
	p._updateState = function()
	{
		if (!this.back) return;

		var data;
		//use the highest priority state
		for(var i = 0; i < this._statePriority.length; ++i)
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
		this.back.setTexture(data.tex);
		//if we have a label, update that too
		if (this.label)
		{
			data = data.label;
			//update the text style
			if (!this._currentLabelStyle || !doObjectsMatch(this._currentLabelStyle, data.style))
			{
				this.label.setStyle(data.style);
				this._currentLabelStyle = data.style;
				//make the text update so we can figure out the size for positioning
				if (this.label instanceof Text)
				{
					this.label.updateText();
					this.label.dirty = false;
				}
				else
					this.label.forceUpdateText();
			}
			//position the text
			if (data.x == "center")
			{
				var bW = this.back.width, lW = this.label.width;
				switch(this._currentLabelStyle.align)
				{
					case "center":
						this.label.position.x = bW * 0.5;
						break;
					case "right":
						this.label.position.x = (bW - lW) * 0.5 + lW;
						break;
					default://left or null (defaults to left)
						this.label.position.x = (bW - lW) * 0.5;
						break;
				}
			}
			else
				this.label.position.x = data.x + this._offset.x;
			if (data.y == "center")
			{
				this.label.position.y = (this.back.height - this.label.height) * 0.5;
			}
			else
				this.label.position.y = data.y + this._offset.y;
		}
	};

	/*
	* A simple function for comparing the properties of two objects
	*/
	function doObjectsMatch(obj1, obj2)
	{
		if (obj1 === obj2)
			return true;
		for(var key in obj1)
		{
			if (obj1[key] != obj2[key])
				return false;
		}
		return true;
	}
	
	/**
	*  The callback for when the button is moused over.
	*  @private
	*  @method _onOver
	*/
	p._onOver = function(data)
	{
		this._stateFlags.over = true;
		this._updateState();
		if (this.overCallback)
			this.overCallback(this);
	};
	
	/**
	*  The callback for when the mouse leaves the button area.
	*  @private
	*  @method _onOut
	*/
	p._onOut = function(data)
	{
		this._stateFlags.over = false;
		this._updateState();
		if (this.outCallback)
			this.outCallback(this);
	};
	
	/**
	*  The callback for when the button receives a mouse down event.
	*  @private
	*  @method _onDown
	*/
	p._onDown = function(data)
	{
		data.originalEvent.preventDefault();
		this._stateFlags.down = true;
		this._updateState();
		
		this.mouseup = this.touchend = this._upCB;
		this.mouseupoutside = this.touchendoutside = this._upOutCB;
	};
	
	/**
	*  The callback for when the button for when the mouse/touch is released on the button
	*  - only when the button was held down initially.
	*  @private
	*  @method _onUp
	*/
	p._onUp = function(data)
	{
		data.originalEvent.preventDefault();
		this._stateFlags.down = false;
		this.mouseup = this.touchend = null;
		this.mouseupoutside = this.touchendoutside = null;
		
		this._updateState();
		if (this.releaseCallback)
			this.releaseCallback(this);
	};
	
	/**
	*  The callback for when the mouse/touch is released outside the button when the button was held down.
	*  @private
	*  @method _onUpOutside
	*/
	p._onUpOutside = function(data)
	{
		this._stateFlags.down = false;
		this.mouseup = this.touchend = null;
		this.mouseupoutside = this.touchendoutside = null;
		
		this._updateState();
	};
	
	/*
	*  Destroys the button.
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.mousedown = this.touchstart = this.mouseover = this.mouseout = null;
		this.mouseup = this.touchend = this.mouseupoutside = this.touchendoutside = null;
		this.removeChildren();
		this.label = null;
		this.back = null;
		this.releaseCallback = null;
		this.overCallback = null;
		this.outCallback = null;
		this._stateData = null;
		this._stateFlags = null;
		this._statePriority = null;
		this._downCB = null;
		this._upCB = null;
		this._overCB = null;
		this._outCB = null;
		this._upOutCB = null;
	};
	
	namespace('springroll').Button = Button;
	namespace('springroll.pixi').Button = Button;
}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function() {
	
	var DragData = function(obj)
	{
		this.obj = obj;
		this.mouseDownObjPos = {x:0, y:0};
		this.dragOffset = new PIXI.Point();
		this.mouseDownStagePos = {x:0, y:0};
	};
	
	/** Assign to the global namespace */
	namespace('springroll').DragData = DragData;
	namespace('springroll.pixi').DragData = DragData;
}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function() {
	
	var Application,
		Tween,
		Point,
		DragData = include("springroll.pixi.DragData");

	/**
	*  Drag manager is responsible for handling the dragging of stage elements
	*  supports click-n-stick and click-n-drag functionality.
	*
	*  @class DragManager
	*  @constructor
	*  @param {PIXI.Stage} stage The stage that this DragManager is monitoring.
	*  @param {function} startCallback The callback when when starting
	*  @param {function} endCallback The callback when ending
	*/
	var DragManager = function(stage, startCallback, endCallback)
	{
		if(!Application)
		{
			Application = include('springroll.Application');
			Tween = include('createjs.Tween', false);
			Point = include('PIXI.Point');
		}

		/**
		* The object that's being dragged, or a dictionary of DragData being dragged
		* by id if multitouch is true.
		* @public
		* @readOnly
		* @property {PIXI.DisplayObject|Dictionary} draggedObj
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
		* @property {PIXI.Point} mouseDownStagePos
		*/
		this.mouseDownStagePos = new Point(0, 0);

		/**
		* The position x, y of the object when interaction with it started. If multitouch is
		* true, then this will only be set during a drag stop callback, for the object that just
		* stopped getting dragged.
		* @property {PIXI.Point} mouseDownObjPos
		*/
		this.mouseDownObjPos = new Point(0, 0);
		
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
		* @property {PIXI.Stage} _theStage
		*/
		this._theStage = stage;
		
		/**
		* The offset from the dragged object's position that the initial mouse event
		* was at. This is only used when multitouch is false - the DragData has
		* it when multitouch is true.
		* @private
		* @property {PIXI.Point} _dragOffset
		*/
		this._dragOffset = null;
		
		/**
		* External callback when we start dragging
		* @private
		* @property {Function} _dragStartCallback
		*/
		this._dragStartCallback = startCallback;
		
		/**
		* External callback when we are done dragging
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
		* If this DragManager is using multitouch for dragging.
		* @private
		* @property {Boolean} _multitouch
		*/
		this._multitouch = false;

		this.helperPoint = new Point(0, 0);
	};
	
	/** Reference to the drag manager */
	var p = DragManager.prototype = {};
	
	/**
	* If the DragManager allows multitouch dragging. Setting this stops any current
	* drags.
	* @property {Boolean} multitouch
	*/
	Object.defineProperty(p, "multitouch", {
		get: function(){ return this._multitouch; },
		set: function(value)
		{
			if(this.draggedObj)
			{
				if(this._multitouch)
				{
					for(var id in this.draggedObj)
					{
						this._stopDrag(id, true);
					}
				}
				else
					this._stopDrag(null, true);
			}
			this._multitouch = !!value;
			this.draggedObj = value ? {} : null;
		}});
	
	/**
	*  Manually starts dragging an object. If a mouse down event is not supplied
	*  as the second argument, it defaults to a held drag, that ends as soon as
	*  the mouse is released. When using multitouch, passing a interaction data is
	*  required.
	*  @method startDrag
	*  @public
	*  @param {PIXI.DisplayObject} object The object that should be dragged.
	*  @param {PIXI.InteractionData} interactionData The interaction data about
	*                                                the input event that triggered this.
	*/
	p.startDrag = function(object, interactionData)
	{
		this._objMouseDown(object, interactionData);
	};
	
	/**
	* Mouse down on an obmect
	*  @method _objMouseDown
	*  @private
	*  @param {PIXI.DisplayObject} object The object that should be dragged.
	*  @param {PIXI.InteractionData} interactionData The interaction data about
	*                                                the input event that triggered this.
	*/
	p._objMouseDown = function(obj, interactionData)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !interactionData)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if(this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[interactionData.id] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new Point();
		}
		//Stop any tweens on the object (mostly the position)
		if(Tween)
		{
			Tween.removeTweens(obj);
			Tween.removeTweens(obj.position);
		}
		
		//get the mouse position and convert it to object parent space
		interactionData.getLocalPosition(obj.parent, dragOffset);
		
		//move the offset to respect the object's current position
		dragOffset.x -= obj.position.x;
		dragOffset.y -= obj.position.y;

		mouseDownObjPos.x = obj.position.x;
		mouseDownObjPos.y = obj.position.y;
		
		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if(!interactionData)
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			mouseDownStagePos.x = interactionData.global.x;
			mouseDownStagePos.y = interactionData.global.y;
			//if it is a touch event, force it to be the held drag type
			if(!this.allowStickyClick || interactionData.originalEvent.type == "touchstart")
			{
				this.isTouchMove = interactionData.originalEvent.type == "touchstart";
				this.isHeldDrag = true;
				this._startDrag(interactionData);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				obj.mousemove = this._triggerHeldDrag;
				this._theStage.interactionManager.stageUp = this._triggerStickyClick;
			}
		}
	};
	
	/**
	* Start the sticky click
	* @method _triggerStickyClick
	* @param {PIXI.InteractionData} interactionData The interaction data about
	*                                                the input event that triggered this.
	* @private
	*/
	p._triggerStickyClick = function(interactionData)
	{
		this.isStickyClick = true;
		var draggedObj = this._multitouch ?
							this.draggedObj[interactionData.id].obj :
							this.draggedObj;
		draggedObj.mousemove = null;
		this._theStage.interactionManager.stageUp = null;
		this._startDrag(interactionData);
	};

	/**
	* Start hold dragging
	* @method _triggerHeldDrag
	* @private
	* @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	*/
	p._triggerHeldDrag = function(interactionData)
	{
		var mouseDownStagePos, draggedObj;
		if(this._multitouch)
		{
			draggedObj = this.draggedObj[interactionData.id].obj;
			mouseDownStagePos = this.draggedObj[interactionData.id].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = interactionData.global.x - mouseDownStagePos.x;
		var yDiff = interactionData.global.y - mouseDownStagePos.y;
		if(xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			draggedObj.mousemove = null;
			this._theStage.interactionManager.stageUp = null;
			this._startDrag(interactionData);
		}
	};

	/**
	* Internal start dragging on the stage
	* @method _startDrag
	* @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	* @private
	*/
	p._startDrag = function(interactionData)
	{
		var im = this._theStage.interactionManager;
		im.stageUp = this._stopDrag;
		im.stageMove = this._updateObjPosition;
		
		var draggedObj;
		if(this._multitouch)
			draggedObj = this.draggedObj[interactionData.id].obj;
		else
			draggedObj = this.draggedObj;
		
		draggedObj.mousemove = draggedObj.touchmove = this._updateObjPosition;
		
		this._dragStartCallback(draggedObj);
	};
	
	/**
	* Stops dragging the currently dragged object.
	* @public
	* @method stopDrag
	* @param {Bool} [doCallback=false] If the drag end callback should be called.
	* @param {PIXI.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	*                                       is true. If this is omitted, it stops all drags.
	*/
	p.stopDrag = function(doCallback, obj)
	{
		var id = null;
		if(this._multitouch && obj)
		{
			for(var key in this.draggedObj)
			{
				if(this.draggedObj[key].obj == obj)
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
	* @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	* @param {Bool} doCallback If we should do the callback
	*/
	p._stopDrag = function(interactionData, doCallback)
	{
		var obj, id;
		if(this._multitouch)
		{
			if(interactionData)
			{
				//stop a specific drag
				id = interactionData;
				if(interactionData instanceof PIXI.InteractionData)
					id = interactionData.id;
				
				var data = this.draggedObj[id];
				if(!data) return;
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
				for(id in this.draggedObj)
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
		
		if(!obj) return;
		
		obj.touchmove = obj.mousemove = null;
		
		var removeGlobalListeners = !this._multitouch;
		if(this._multitouch)
		{
			//determine if this was the last drag
			var found = false;
			for(id in this.draggedObj)
			{
				found = true;
				break;
			}
			removeGlobalListeners = !found;
		}
		if(removeGlobalListeners)
			this._theStage.interactionManager.stageUp = null;
		
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
	* @param {PIXI.InteractionData} interactionData Mouse move event
	*/
	p._updateObjPosition = function(interactionData)
	{
		if(!this.isTouchMove && !this._theStage.interactionManager.mouseInStage) return;
		
		var draggedObj, dragOffset;
		if(this._multitouch)
		{
			var data = this.draggedObj[interactionData.id];
			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}
		
		if(!draggedObj || !draggedObj.parent)//not quite sure what chain of events would lead to this, but we'll stop dragging to be safe
		{
			this.stopDrag(false, draggedObj);
			return;
		}
		
		var mousePos = interactionData.getLocalPosition(draggedObj.parent, this.helperPoint);
		var bounds = draggedObj._dragBounds;
		if(bounds)
		{
			draggedObj.position.x = clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.position.y = clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.position.x = mousePos.x - dragOffset.x;
			draggedObj.position.y = mousePos.y - dragOffset.y;
		}
		if(this.snapSettings)
		{
			switch(this.snapSettings.mode)
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
	* @param {PIXI.Point} localMousePos The mouse position in the same space as the dragged object.
	* @param {PIXI.Point} dragOffset The drag offset for the dragged object.
	* @param {PIXI.DisplayObject} obj The object to snap.
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
			draggedObj.position.x = closestPoint.x;
			draggedObj.position.y = closestPoint.y;
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
	
	/**
	* Simple clamp function
	*/
	var clamp = function(x,a,b)
	{
		return (x < a ? a : (x > b ? b : x));
	};
	
	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		this.touchstart = this.mousedown = this._onMouseDownListener;
		this.buttonMode = this.interactive = true;
	};
	
	var disableDrag = function()
	{
		this.mousedown = this.touchstart = null;
		this.buttonMode = this.interactive = false;
	};
	
	var _onMouseDown = function(mouseData)
	{
		this._dragMan._objMouseDown(this, mouseData);
	};
	
	/**
	* Adds properties and functions to the object - use enableDrag() and disableDrag() on
	* objects to enable/disable them (they start out disabled). Properties added to objects:
	* _dragBounds (Rectangle), _onMouseDownListener (Function), _dragMan (springroll.DragManager) reference to the DragManager
	* these will override any existing properties of the same name
	* @method addObject
	* @public
	* @param {PIXI.DisplayObject} obj The display object
	* @param {PIXI.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	*                                      will be added to this object.
	*/
	p.addObject = function(obj, bounds)
	{
		if(bounds)
		{
			bounds.right = bounds.x + bounds.width;
			bounds.bottom = bounds.y + bounds.height;
		}
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
	* @param {PIXI.DisplayObject} obj The display object
	*/
	p.removeObject = function(obj)
	{
		var index = this._draggableObjects.indexOf(obj);
		if(index >= 0)
		{
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			this._draggableObjects.splice(index, 1);
		}
	};
	
	/**
	*  Destroy the manager
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		//clean up dragged obj
		this.stopDrag(false);
		
		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
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
	};
	
	/** Assign to the global namespace */
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.pixi').DragManager = DragManager;
}());
/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function() {
	
	var BitmapText = include('PIXI.BitmapText'),
		Texture = include('PIXI.Texture'),
		Loader = include('springroll.Loader'),
		AssetLoader = include('PIXI.AssetLoader'),
		Application = include('springroll.Application'),
		PixiTask,
		ListTask,
		TaskManager;

	/**
	*  AssetManager is responsible for managing different resolutions of assets and spritesheets
	*  based on the resolution of the stage. This is a helpful optimization for PIXI because some
	*  low-hardware devices have a problem keeping up with larger images, or just refuse large
	*  images entirely. The AssetManager does not load assets itself, or keep track of what is
	*  loaded. It merely assists in loading the appropriate assets, as well as easily unloading
	*  assets when you are done using them.
	*
	*  @class AssetManager
	*/
	var AssetManager = {};
	
	/**
	*  Dictionary of scales by asset id. Use this to return your asset to normal size.
	*  Assets are only added to this dictionary after a url has been retrieved with getUrl().
	*  @property {Object} scales
	*  @final
	*  @static
	*/
	AssetManager.scales = null;

	/**
	*  The available size definitions, e.g., {"maxSize":400, "order": ["tiny", "sd"]}
	*  @property {Array} sizes
	*  @private
	*  @static
	*/
	var sizes = null;

	/**
	*  Dictionary of assets by asset id
	*  @property {Object} assets
	*  @private
	*  @static
	*/
	var assets = null;

	/**
	*  The cache of asset url paths
	*  @property {Object} assetUrlCache
	*  @private
	*  @static
	*/
	var assetUrlCache = null;

	/**
	*  The scaling value for each asset size id, e.g., {"sd" : 1, "tiny" : 0.5}
	*  @property {Object} scales
	*  @private
	*  @static
	*/
	var scales = null;

	/**
	*  The paths to each resolution folder, e.g., {"sd":"images/sd/", "tiny":"images/tiny/"}
	*  @property {Object} paths
	*  @private
	*  @static
	*/
	var paths = null;

	/**
	*  The collection of perferred size to load
	*  @property {Array} sizeOrder
	*  @private
	*  @static
	*/
	var sizeOrder = null;

	/**
	*  If we should use low hardware, if we know we're on a slow device
	*  @property {Boolean} lowHW
	*  @static
	*/
	AssetManager.lowHW = false;
	
	/**
	*  Initialize the asset manager. The asset manager is capable of taking different paths for
	*  each size of image as well as an animation file path for Spine animations. Image assets
	*  do not have to exist in each size. Fonts are marked for unloading purposes.
	*  Example config file:
	*
			{
				"path": {
					"sd": "images/sd/",
					"tiny": "images/tiny/",
					"anim": "anims/"
				},
				"scale": {
					"sd": 1,
					"tiny": 2
				},
				"sizing": [
					{
						"maxSize": 400,
						"order": [
							"tiny",
							"sd"
						]
					},
					{
						"maxSize": 10000,
						"order": [
							"sd",
							"tiny"
						]
					}
				],
				"assets": {
					"transition": {
						"src": "transition.json",
						"anim": true
					},
					"TransitionSheet": {
						"src": "ui/TransitionSheet.json",
						"sd":true,
						"tiny":true
					},
					"FoodTruck_Title": {
						"src": "backgrounds/FoodTruck_Title.jpg",
						"sd":true,
						"tiny":true
					},
					"StartButton": {
						"src": "ui/StartButton.png",
						"split": {
							"srcReplace":".png",
							"alpha":"-alpha.png",
							"color":"-color.jpg"
						},
						"sd":true,
						"tiny":false
					},
					"LevelTitleFont": {
						"src": "ui/LevelTitleFont.xml",
						"sd": true,
						"tiny": false,
						"isFont": true
					},
					"AnAssetCollection": {
						"format": {
							"src": "backgrounds/%NAME%.jpg",
							"sd": true,
							"tiny": true
						},
						"assets": [
							"Select_Background",
							"Result_Background
						]
					}
				}
	*
	*  @method init
	*  @static
	*  @param {Object} config The configuration file which contains keys for "path", "scale",
	*                         "sizing", "assets"
	*  @param {Number} width The stage width
	*  @param {Number} height The stage height
	*/
	AssetManager.init = function(config, width, height)
	{
		PixiTask = include("springroll.PixiTask", false);
		TaskManager = include("springroll.TaskManager", false);
		ListTask = include("springroll.ListTask", false);
		AssetManager.scales = {};
		assets = config.assets;
		assetUrlCache = {};
		paths = config.path;
		sizes = config.sizing;
		scales = config.scale;
		pickScale(width, height);
		
		//go through the assets to look for collections
		for(var key in assets)
		{
			var asset = assets[key];
			if(asset && asset.format)
			{
				asset.isCollection = true;
				var assetArray = asset.assets;
				for(var i = 0, length = assetArray.length; i < length; ++i)
				{
					var newAsset = asset.format.clone();
					newAsset.src = newAsset.src.replace("%NAME%", assetArray[i]);
					assets[assetArray[i]] = newAsset;
				}
			}
		}
	};
	
	/**
	*  Get the alias of the preferred size to use
	*  @method getPreferredSize
	*  @static
	*  @return {String} The alias for the preferred size
	*/
	AssetManager.getPreferredSize = function()
	{
		return sizeOrder[0];
	};
	
	/**
	*  Get the preferred scale amount
	*  @method getPreferredScale
	*  @static
	*  @return {Number} The scale amount associated with the preferred size
	*/
	AssetManager.getPreferredScale = function()
	{
		return scales[sizeOrder[0]];
	};
	
	/**
	*  Pick the preferred scale based on the screen resolution
	*  @method pickScale
	*  @private
	*  @static
	*  @param {Number} width The stage width
	*  @param {Number} height The stage height
	*/
	var pickScale = function(width, height)
	{
		var minSize = width < height ? width : height;
		var s;
		for(var i = sizes.length - 1; i >= 0; --i)
		{
			if(sizes[i].maxSize > minSize)
				s = sizes[i];
			else
				break;
		}
		sizeOrder = s.order;
	};
	
	/**
	*  Get a asset url by asset id
	*  @method getUrl
	*  @static
	*  @param {String} assetId The unique asset id
	*  @return The url of the asset at the appropriate size.
	*/
	AssetManager.getUrl = function(assetId)
	{
		var a = assets[assetId];
		if(!a) return null;
		
		if(assetUrlCache[assetId])
			return assetUrlCache[assetId];
		
		var url;
		if(a.anim)
		{
			url = assetUrlCache[assetId] = paths.anim + a.src;
			return url;
		}

		if(AssetManager.lowHW && a.lowHW)
		{
			AssetManager.scales[assetId] = scales[a.lowHW];
			url = assetUrlCache[assetId] = paths[a.lowHW] + a.src;
			return url;
		}
		
		for(var i = 0; i < sizeOrder.length; ++i)
		{
			var typeId = sizeOrder[i];
			if(a[typeId])
			{
				AssetManager.scales[assetId] = scales[typeId];
				url = assetUrlCache[assetId] = paths[typeId] + a.src;
				return url;
			}
		}
		return null;
	};
	
	/**
	*  Loads an asset or list of assets, attempting to correctly apply texture resolution to all
	*  loaded textures, as well as recombining images that have been split into alpha and color
	*  portions. Currently the alpha/color split will only work when loading with a task list.
	*  @method load
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id
	*  @param {Function} callback A function to call when load is complete
	*  @param {Array|TaskManager} [taskList] An array or TaskManager to add a PixiTask to for
	*                                        loading. If omitted, loads immediately with
	*                                        PIXI.AssetLoader.
	*/
	AssetManager.load = function(assetOrAssets, callback, taskList)
	{
		var i, length, urls = [], asset, j, jLength, assetCollection, madeCopy = false, splits;
		if(!Array.isArray(assetOrAssets))
		{
			assetOrAssets = [assetOrAssets];
			madeCopy = true;
		}
		if(taskList)
		{
			//add to a list of tasks or a running TaskManager
			if(!PixiTask)
			{
				Debug.error("AssetManager.load() can't find springroll.PixiTask!");
				return;
			}
			for(i = 0, length = assetOrAssets.length; i < length; ++i)
			{
				asset = assets[assetOrAssets[i]];
				if(!asset)
				{
					if(true)
						Debug.warn("Asset not found: " + assetOrAssets[i]);
					continue;
				}
				//If a collection was requested, go through and load all the sub assets
				if(asset.isCollection)
				{
					if(!madeCopy)
					{
						assetOrAssets = assetOrAssets.slice();
						madeCopy = true;
					}
					assetCollection = asset.assets;
					for(j = 0, jLength = assetCollection.length; j < jLength; ++j)
					{
						assetOrAssets.push(assetCollection[j]);
						length++;
					}
				}
				else if(!asset._isLoaded)
				{
					var url = AssetManager.getUrl(assetOrAssets[i]);
					if(asset.split)
					{
						if(!splits)
						{
							splits = {};
						}
						var manifest = splits[url] = [];
						manifest.push(
							{
								"id":"color",
								"src":url.replace(asset.split.srcReplace, asset.split.color)
							});
						manifest.push(
							{
								"id":"alpha",
								"src":url.replace(asset.split.srcReplace, asset.split.alpha)
							});
					}
					urls.push(url);
				}
			}
			if(urls.length)
			{
				var task = new PixiTask("", urls,
										onLoaded.bind(AssetManager, assetOrAssets, callback));
				//if we have split textures to load, load them up first, then load the pixi tasks
				//this way spritesheets can be loaded properly
				if(splits)
				{
					var pixiTask = task;
					var splitTasks = [];
					for(var id in splits)
					{
						splitTasks.push(new ListTask(id, splits[id], onSplitLoaded));
					}
					task = new ListTask("", splitTasks,
										onAllSplitsLoaded.bind(AssetManager, pixiTask));
				}
				if(Array.isArray(taskList))
					taskList.push(task);
				else if(taskList instanceof TaskManager)
					taskList.addTask(task);
				else
				{
					Debug.error("AssetManager.load() was provided with a taskList that is neither an array or a springroll.TaskManager");
				}
			}
			else if(callback)
			{
				callback();
			}
		}
		else
		{
			//load immediately
			var cm = Loader.instance.cacheManager;
			for(i = 0, length = assetOrAssets.length; i < length; ++i)
			{
				asset = assets[assetOrAssets[i]];
				if(!asset)
				{
					if(true)
						Debug.warn("Asset not found: " + assetOrAssets[i]);
					continue;
				}
				//If a collection was requested, go through and load all the sub assets
				if(asset.isCollection)
				{
					if(!madeCopy)
					{
						assetOrAssets = assetOrAssets.slice();
						madeCopy = true;
					}
					assetCollection = asset.assets;
					for(j = 0, jLength = assetCollection.length; j < jLength; ++j)
					{
						asset = assets[assetCollection[j]];
						if(asset && !asset._isLoaded)
							urls.push(cm.prepare(AssetManager.getUrl(assetCollection[j]), true));
					}
				}
				else if(!asset._isLoaded)
					urls.push(cm.prepare(AssetManager.getUrl(assetOrAssets[i]), true));
			}
			if(urls.length)
			{
				var opts = Application.instance.options;
				var assetLoader = new AssetLoader(urls, opts.crossOrigin, opts.basePath);
				assetLoader.onComplete = onloaded.bind(AssetManager, assetOrAssets, callback);
				assetLoader.load();
			}
			else if(callback)
				callback();
		}
	};
	
	/**
	*  Callback for when a pair of split images are loaded to be reassembled.
	*  @method onSplitLoaded
	*  @static
	*  @private
	*  @param {Object} results Dictionary of LoaderResults.
	*  @param {ListTask} task The ListTask that loaded the manifest.
	*/
	var onSplitLoaded = function(results, task)
	{
		var canvas = mergeAlpha(results.color.content, results.alpha.content);
		var baseTexture = new PIXI.BaseTexture(canvas);
		var id = PIXI.filenameFromUrl(task.id);
		baseTexture.imageUrl = id;
		PIXI.BaseTextureCache[id] = baseTexture;
	};
	
	/**
	*  Callback for when all split textures have been loaded and recombined. This starts the loading
	*  of assets within PixiJS.
	*  @method onAllSplitsLoaded
	*  @static
	*  @private
	*  @param {PixiTask} pixiTask The PixiTask to load up all assets for PixiJS.
	*  @param {Object} results Dictionary of LoaderResults.
	*  @param {ListTask} task The ListTask that loaded the manifest.
	*  @param {TaskManager} taskManager The TaskManager that should run pixiTask.
	*/
	var onAllSplitsLoaded = function(pixiTask, results, task, taskManager)
	{
		taskManager.addTask(pixiTask);
	};
	
	/**
	*  Callback for when assets are loaded, to automatically apply the resolution of textures.
	*  @method onLoaded
	*  @static
	*  @private
	*  @param {Array} assetList Array of asset ids that were just loaded.
	*  @param {Function} callback The user callback for the load.
	*/
	var onLoaded = function(assetList, callback)
	{
		for(var i = 0, length = assetList.length; i < length; ++i)
		{
			var assetName = assetList[i];
			if(!assetName) continue;
			assets[assetName]._isLoaded = true;//keep track of the loaded status
			var url = AssetManager.getUrl(assetName);
			var texture = Texture.fromFrame(url, true);
			if(texture)
			{
				texture.baseTexture.resolution = this.scales[assetName];
			}
		}
		if(callback)
			callback();
	};
	
	/**
	*  Unload an asset or list of assets.
	*  @method unload
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id
	*/
	AssetManager.unload = function(assetOrAssets)
	{
		if(assetOrAssets instanceof Array)
		{
			for(var i = assetOrAssets.length - 1; i >= 0; --i)
			{
				var id = assetOrAssets[i];
				unloadAsset(id);
			}
		}
		else//string
		{
			unloadAsset(assetOrAssets);
		}
	};

	/**
	*  Unload an asset
	*  @method unloadAsset
	*  @static
	*  @private
	*  @param {String} asset The asset id to unload
	*/
	var unloadAsset = function(asset)
	{
		//if this doesn't exist, then it wasn't loaded
		if(!assetUrlCache[asset]) return;
		var a = assets[asset];
		//asset never existed in the master list
		if(!a) return;
		//don't unload animations, they are pretty small
		if(a.anim) return;
		//If the asset is a collection, unload each subasset
		if(a.isCollection)
		{
			AssetManager.unload(a.assets);
			return;
		}
		//remember that the asset is unloaded
		a._isLoaded = false;
		//unload the bitmap font if relevant
		if(a.isFont)
		{
			if(BitmapText.fonts[asset])
				delete BitmapText.fonts[asset];
		}
		//anything else is a texture
		Texture.destroyTexture(assetUrlCache[asset]);
		delete AssetManager.scales[asset];
		delete assetUrlCache[asset];
	};

	/**
	*  Assemble a dictionary of Texture arrays representing animations from the PixiJS
	*  texture cache.
	*  Example of a getAnims() call:

			var animationDictionary = AssetManager.getAnims(
				{
					"bobIdleHappy":{"name":"bob_idle_happy#", "numberMin":1, "numberMax":139},
					"bobIdleNeutral":{"name":"bob_idle_neutral#", "numberMin":1, "numberMax":140},
					"bobIdleMad":{"name":"bob_idle_mad#", "numberMin":1, "numberMax":140},
					"bobPos":{"name":"bob_react_pos#", "numberMin":1, "numberMax":23},
					"bobNeg":{"name":"bob_react_neg#", "numberMin":1, "numberMax":31},
				},
				4);

	*  @method getAnims
	*  @static
	*  @param {Object} anims The dictionary of animation assets
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported
	*                             as anim_0001.png
	*  @param {Object} [outObj] If already using an return object
	*  @return {Object} An collection of PIXI.Textures for each animation id suitable for
	*                   use in PIXI.MovieClip
	*/
	AssetManager.getAnims = function(anims, maxDigits, outObj)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		var zeros = [];
		var compares = [];
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
		var compareLength = compares.length;
		
		var rtnDict = outObj || {};
		var fromFrame = Texture.fromFrame;
		var prevTex, len;
		for(var a in anims)
		{
			var data = anims[a];
			var list = [];

			for(i = data.numberMin, len = data.numberMax; i <= len; ++i)
			{
				var num = null;
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
				
				//If the texture doesn't exist, use the previous texture - this should
				//allow us to use fewer textures that are in fact the same
				var texName = data.name.replace("#", num);
				var tex = fromFrame(texName, true);
				if(tex)
					prevTex = tex;
				list.push(prevTex);
			}
			rtnDict[a] = list;
		}
		return rtnDict;
	};
	
	/**
	 * Pulled from EaselJS's SpriteSheetUtils.
	 * Merges the rgb channels of one image with the alpha channel of another. This can be used to
	 * combine a compressed JPEG image containing color data with a PNG32 monochromatic image
	 * containing alpha data. With certain types of images (those with detail that lend itself to
	 * JPEG compression) this can provide significant file size savings versus a single RGBA PNG32.
	 * This method is very fast (generally on the order of 1-2 ms to run).
	 * @method mergeAlpha
	 * @static
	 * @private
	 * @param {Image} rbgImage The image (or canvas) containing the RGB channels to use.
	 * @param {Image} alphaImage The image (or canvas) containing the alpha channel to use.
	 * @param {Canvas} [canvas] If specified, this canvas will be used and returned. If not, a new
	 *                          canvas will be created.
	 * @return {Canvas} A canvas with the combined image data. This can be used as a source for a
	 *                  Texture.
	 */
	var mergeAlpha = function(rgbImage, alphaImage, canvas) {
		if (!canvas)
			canvas = document.createElement("canvas");
		canvas.width = Math.max(alphaImage.width, rgbImage.width);
		canvas.height = Math.max(alphaImage.height, rgbImage.height);
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.drawImage(rgbImage,0,0);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(alphaImage,0,0);
		ctx.restore();
		return canvas;
	};
	
	// Assign to the namespace
	namespace('springroll').AssetManager = AssetManager;
	namespace('springroll.pixi').AssetManager = AssetManager;
}());