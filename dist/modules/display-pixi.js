/*! CloudKidFramework 0.0.3 */
!function(){"use strict";/**
*  @modules cloudkid.pixi
*/
(function(undefined){
	
	/**
	*  Provide a normalized way to get size, position, scale values
	*  as well as provide reference for different geometry classes.
	*  @class pixi.DisplayAdapter
	*/
	var DisplayAdapter = {};

	/**
	*  The geometry class for Circle
	*  @property {Function} Circle
	*  @readOnly
	*  @static
	*  @default PIXI.Circle
	*/
	DisplayAdapter.Circle = PIXI.Circle;

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default PIXI.Ellipse
	*/
	DisplayAdapter.Ellipse = PIXI.Ellipse;

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default PIXI.Rectangle
	*/
	DisplayAdapter.Rectangle = PIXI.Rectangle;

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default PIXI.Sector
	*/
	DisplayAdapter.Sector = PIXI.Sector;

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default PIXI.Point
	*/
	DisplayAdapter.Point = PIXI.Point;

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default PIXI.Polygon
	*/
	DisplayAdapter.Polygon = PIXI.Polygon;

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default true
	*/
	DisplayAdapter.useRadians = true;

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
			if (position.x) object.position.x = position.x;
			if (position.y) object.position.y = position.y;
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

	// Assign to namespace
	namespace('cloudkid.pixi').DisplayAdapter = DisplayAdapter;

}());
/**
*  @module cloudkid.pixi
*/
(function(undefined){

	/**
	*   PixiDisplay is a display plugin for the CloudKid Framework 
	*	that uses the Pixi library for rendering.
	*
	*   @class pixi.PixiDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the Pixi stage.
	*	@param {String} [options.forceContext=null] If a specific renderer should be used instead of WebGL 
	*	                                            falling back to Canvas. Use "webgl" or "canvas2d" to specify a renderer.
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {uint} [options.backgroundColor=0x000000] The background color of the stage (if it is not transparent).
	*	@param {Boolean} [options.transparent=false] If the stage should be transparent.
	*	@param {Boolean} [options.antiAlias=false] If the WebGL renderer should use anti-aliasing.
	*	@param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all images as pre-multiplied alpha.
	*	                                              In most cases, you probably do not want to set this option to true.
	*	@param {Boolean} [options.preserveDrawingBuffer=false] Set this to true if you want to call toDataUrl
	*	                                                       on the WebGL rendering context.
	*/
	var PixiDisplay = function(id, options)
	{
		this.id = id;
		options = options || {};
		this.canvas = document.getElementById(id);
		// prevent mouse down turning into text cursor
		this.canvas.onmousedown = function(e)
		{
			e.preventDefault();
		};
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this._visible = this.canvas.style.display != "none";
		//make stage
		this.stage = new PIXI.Stage(options.backgroundColor || 0);
		//make the renderer
		var preMultAlpha = !!options.preMultAlpha;
		var transparent = !!options.transparent;
		var antiAlias = !!options.antiAlias;
		var preserveDrawingBuffer = !!options.preserveDrawingBuffer;
		if(transparent && !preMultAlpha)
			transparent = "notMultiplied";
		if(options.forceContext == "canvas2d")
		{
			this.renderer = new PIXI.CanvasRenderer(
				this.width, 
				this.height, 
				this.canvas, 
				transparent
			);
		}
		else if(options.forceContext == "webgl")
		{
			this.renderer = new PIXI.WebGLRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				antiAlias,//antiAlias, not all browsers may support it
				preserveDrawingBuffer
			);
		}
		else
		{
			this.renderer = PIXI.autoDetectRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				false,//antialias, not all browsers may support it
				preMultAlpha
			);
		}
		this.renderer.clearView = !!options.clearView;
		this.enabled = true;//enable mouse/touch input
		this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;
		
		/**
		*  The Animator class to use when using this display.
		*  @property {Animator} Animator
		*  @readOnly
		*  @public
		*/
		this.Animator = cloudkid.pixi.Animator;

		/**
		*  The DisplayAdapter class to use when providing standard
		*  ways for accessing properties like position, scale, etc.
		*  @property {pixi.DisplayAdapter} DisplayAdapter
		*  @readOnly
		*  @public
		*/
		this.DisplayAdapter = cloudkid.pixi.DisplayAdapter;
	};

	var p = PixiDisplay.prototype = {};

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
	*  @property {PIXI.Stage}
	*  @readOnly
	*  @public
	*/
	p.stage = null;

	/**
	*  The Pixi renderer.
	*  @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
	*  @readOnly
	*  @public
	*/
	p.renderer = null;

	/**
	*  If Pixi is being rendered with WebGL.
	*  @property {Boolean}
	*  @readOnly
	*  @public
	*/
	p.isWebGL = null;

	/**
	*  If rendering is paused on this display only. Pausing all displays can be done
	*  using Application.paused setter.
	*  @property {Boolean} paused
	*  @public
	*/
	p.paused = false;

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
				this.stage.setInteractive(true);
			}
			else
			{
				this.stage.setInteractive(false);
				// force an update that disables the whole stage (the stage doesn't 
				// update the interaction manager if interaction is false)
				this.stage.forceUpdateInteraction();
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
	* Resizes the canvas and the renderer. This is only called by the Application.
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
		this.renderer.resize(width, height);
	};

	/** 
	* Updates the stage and draws it. This is only called by the Application.
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;

		this.renderer.render(this.stage);
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
		this.stage.removeChildren(true);
		this.stage.destroy();
		this.renderer.destroy();
		this.canvas.onmousedown = null;
		this.renderer = this.stage = this.canvas = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').PixiDisplay = PixiDisplay;
	namespace('cloudkid.pixi').PixiDisplay = PixiDisplay;

}());
/**
*  @module cloudkid.pixi
*/
(function() {
	
	var AnimatorTimeline = cloudkid.pixi.AnimatorTimeline,
		Application = cloudkid.Application;

	/**
	*  Animator for interacting with Spine animations
	*  @class pixi.Animator
	*  @static
	*/
	var Animator = function(){};
	
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
	* The instance of cloudkid.Audio or cloudkid.Sound for playing audio along with animations.
	* 
	* @property {cloudkid.Audio|cloudkid.Sound} soundLib
	* @public
	*/
	Animator.soundLib = null;
	
	/**
	*  The global captions object to use with animator
	*  @property {Captions} captions
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
	};
	
	/**
	* Play a specified animation
	* 
	* @function play
	* @param {PIXI.MovieClip|PIXI.Spine} clip The clip to play
	* @param {String|Array} anim Depending on the type of clip, this could be one of several things.
	*
	* If animating a MovieClip, this should be the array of Textures that is the animation (or null to use the existing array on the clip).
	*
	* If animating a Spine object:
	* - If anim is a string it will play that single animation by name.
	* - If anim is an array of strings it will play as a list of animations (only the last one can loop).
	* - If anim is an array of objects (with anim, loop, and speed properties) then multiple animations will be played simultaneously.
	*    When multiple animations play, animation stops when any non looping animation ends.
	* @param {Object|function} [options] The object of optional parameters or onComplete callback function
	* @param {function} [options.onComplete=null] The function to call once the animation has finished
	* @param {bool} [options.loop=false] Whether the animation should loop
	* @param {int} [options.speed=1] The speed at which to play the animation
	* @param {int} [options.startTime=0] The time in milliseconds into the animation to start.
	* @param {Object|String} [options.soundData=null] Data about a sound to sync the animation to, as an alias or in the format {alias:"MyAlias", start:0}.
	*        start is the seconds into the animation to start playing the sound. If it is omitted or soundData is a string, it defaults to 0.
	* @return {pixi.AnimatorTimeline} The timeline object
	*/
	Animator.play = function(clip, anim, options, loop, speed, startTime, soundData)
	{
		var callback = null;

		if (options && typeof options == "function")
		{
			callback = options;
			options = {};
		}
		else if(options)
		{
			callback = options.onComplete || null;
		}
		else
		{
			options = {};
		}

		if(clip === null || (!(clip instanceof PIXI.Spine) && !(clip.updateAnim/*clip instanceof PIXI.MovieClip*/)))
		{
			if(callback) callback();
			return;
		}
		
		Animator.stop(clip);
		loop = options.loop || loop || false;
		speed = options.speed || speed || 1;
		startTime = options.startTime || startTime;
		startTime = startTime ? startTime * 0.001 : 0;//convert into seconds, as that is what the time uses internally
		soundData = options.soundData || soundData || null;

		var t = _animPool.length ? 
			_animPool.pop().init(clip, callback, speed) : 
			new AnimatorTimeline(clip, callback, speed);

		if(t.isSpine)//PIXI.Spine
		{
			var i;
			
			if(typeof anim == "string")//allow the animations to be a string, or an array of strings
			{
				if(!checkSpineForAnimation(clip, anim))
				{
					_repool(t);
					if(callback)
						callback();
					return;
				}
				clip.state.setAnimationByName(anim, loop);
				clip.updateAnim(startTime > 0 ? startTime * t.speed : 0);
			}
			else//Array - either animations in order or animations at the same time
			{
				if(typeof anim[0] == "string")//array of Strings, play animations by name in order
				{
					clip.state.setAnimationByName(anim[0], false);
					for(i = 1; i < anim.length; ++i)
					{
						clip.state.addAnimationByName(anim[i], loop && i == anim.length - 1);
					}
					clip.updateAnim(startTime > 0 ? startTime * t.speed : 0);
				}
				else//array of objects - play different animations at the same time
				{
					t.spineStates = new Array(anim.length);
					t.speed = new Array(anim.length);
					for(i = 0; i < anim.length; ++i)
					{
						var s = new PIXI.spine.AnimationState(clip.stateData);
						t.spineStates[i] = s;
						s.setAnimationByName(anim[i].anim, loop || anim[i].loop);
						if(anim[i].speed)
							t.speed[i] = anim[i].speed;
						else
							t.speed[i] = speed || 1;
						if(startTime > 0)
							s.update(startTime * t.speed[i]);
						s.apply(clip.skeleton);
					}
				}
			}
		}
		else//standard PIXI.MovieClip
		{
			if(anim && anim instanceof Array)
			{
				clip.textures = anim;
				clip.updateDuration();
			}
			clip.loop = loop;
			clip.onComplete = _onMovieClipDone.bind(this, t);
			clip.gotoAndPlay(0);
			if(startTime > 0)
				clip.updateAnim(startTime * t.speed);
		}
		if(soundData)
		{
			t.playSound = true;
			if(typeof soundData == "string")
			{
				t.soundStart = 0;
				t.soundAlias = soundData;
			}
			else
			{
				t.soundStart = soundData.start > 0 ? soundData.start : 0;//seconds
				t.soundAlias = soundData.alias;
			}
			t.useCaptions = Animator.captions && Animator.captions.hasCaption(t.soundAlias);

			if(t.soundStart === 0)
			{
				t.soundInst = Animator.soundLib.play(t.soundAlias, onSoundDone.bind(this, t), onSoundStarted.bind(this, t));
			}
			else if(Animator.soundLib.preloadSound)//if it can preload sound this way
				Animator.soundLib.preloadSound(soundData.alias);
		}
		t.loop = loop;
		t.time = startTime > 0 ? startTime : 0;
		_timelines.push(t);
		if(++_numAnims == 1)
			Application.instance.on("update", _update);
		return t;
	};

	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 * 
	 * @function instanceHasAnimation
	 * @param {PIXI.Spine} instance The animation to search. This has to be a Spine animation.
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	Animator.instanceHasAnimation = function(instance, anim)
	{
		if(instance instanceof PIXI.Spine)
			return checkSpineForAnimation(instance, anim);
		return false;
	};
	
	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 * 
	 * @function checkSpineForAnimation
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
	 * @function stop
	 * @param {PIXI.MovieClip|PIXI.Spine} clip The clip to stop
	 * @param {bool} doCallback Whether the animations callback should be run
	 */
	Animator.stop = function(clip, doCallback)
	{
		for(var i = 0; i < _numAnims; ++i)
		{
			if(_timelines[i].clip === clip)
			{
				var t = _timelines[i];
				_timelines.splice(i, 1);
				if(--_numAnims === 0)
					Application.instance.off("update", _update);
				if(doCallback && t.callback)
					t.callback();
				if(t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
			}
		}
	};
	
	/**
	 * Stops all current animations
	 * 
	 * @function stop
	 */
	Animator.stopAll = function()
	{
		for(var i = 0; i < _numAnims; ++i)
		{
				var t = _timelines[i];
				if(t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
		}		
		Application.instance.off("update", _update);
		_timelines.length = _numAnims = 0;
	};
	
	/**
	 * Put an AnimatorTimeline back into the general pool after it's done playing
	 * or has been manually stopped
	 * 
	 * @function _repool
	 * @param {pixi.AnimatorTimeline} timeline
	 * @private
	 */
	var _repool = function(timeline)
	{
		timeline.clip = null;
		timeline.callback = null;
		timeline.loop = false;
		timeline.spineStates = null;
		timeline.speed = null;
		timeline.soundInst = null;
		_animPool.push(timeline);
	};
	
	/**
	 * Update each frame
	 * 
	 * @function _update
	 * @param {int} elapsed The time since the last frame
	 * @private
	 */
	var _update = function(elapsed)
	{
		var delta = elapsed * 0.001;//ms -> sec
		
		for(var i = _numAnims - 1; i >= 0; --i)
		{
			var t = _timelines[i];
			if(t.paused) continue;
			var prevTime = t.time;
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
				}
				else//if sound is no longer valid, stop animation immediately
				{
					_onMovieClipDone(t);
					continue;
				}
			}
			else
			{
				t.time += delta;
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
			var c = t.clip;
			if(t.isSpine)//PIXI.Spine
			{
				if(t.spineStates)
				{
					var complete = false;
					for(var j = 0, len = t.spineStates.length; j < len; ++j)
					{
						var s = t.spineStates[j];
						s.update((t.time - prevTime) * t.speed[j]);
						s.apply(c.skeleton);
						if(!s.currentLoop && s.isComplete())
							complete = true;
					}
					if(complete)
					{
						_timelines.splice(i, 1);
						_numAnims--;
						if(t.useCaptions)
							Animator.captions.stop();
						if(t.callback)
							t.callback();
						_repool(t);
					}
				}
				else
				{
					c.updateAnim((t.time - prevTime) * t.speed);
					var state = c.state;
					if(!state.currentLoop && state.queue.length === 0 && state.currentTime >= state.current.duration)
					{
						_timelines.splice(i, 1);
						_numAnims--;
						if(t.useCaptions)
							captions.stop();
						if(t.callback)
							t.callback();
						_repool(t);
					}
				}
			}
			else//standard PIXI.MovieClip
			{
				c.updateAnim((t.time - prevTime) * t.speed);
			}
		}
		if(_numAnims === 0)
			Application.instance.off("update", _update);
	};
	
	var onSoundStarted = function(timeline)
	{
		timeline.playSound = false;
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;//convert sound length to seconds
	};
	
	var onSoundDone = function(timeline)
	{
		if(timeline.soundEnd > 0 && timeline.time < timeline.soundEnd)
			timeline.time = timeline.soundEnd;
		timeline.soundInst = null;
	};
	
	/**
	 * Called when a movie clip is done playing, calls the AnimatorTimeline's
	 * callback if it has one
	 * 
	 * @function _onMovieClipDone
	 * @param {pixi.AnimatorTimeline} timeline
	 * @private
	 */
	var _onMovieClipDone = function(timeline)
	{
		for(var i = 0; i < _numAnims; ++i)
		{
			if(_timelines[i] === timeline)
			{
				var t = _timelines[i];
				if(t.useCaptions)
					Animator.captions.stop();
				t.clip.onComplete = null;
				_timelines.splice(i, 1);
				if(--_numAnims === 0)
					Application.instance.off("update", _update);
				if(t.callback)
					t.callback();
				_repool(t);
				break;
			}
		}
	};
	
	/**
	 * Destroy this
	 * 
	 * @function destroy
	 */
	Animator.destroy = function()
	{
		captions = null;
		_instance = null;
		_animPool = null;
		_timelines = null;
		Application.instance.off("update", _update);
		_boundUpdate = null;
	};

	//set up the global initialization and destroy
	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);
	
	namespace('cloudkid').Animator = Animator;
	namespace('cloudkid.pixi').Animator = Animator;
}());
/**
*  @module cloudkid.pixi
*/
(function(undefined) {
	
	/**
	*  A Multipurpose button class. It is designed to have one image, and an optional text label.
	*  The button can be a normal button or a selectable button.
	*  The button functions similarly with both CreateJS and PIXI, but slightly differently in
	*  initialization and callbacks.
	*  Use releaseCallback and overCallback to know about button clicks and mouse overs, respectively.
	*  
	*  @class pixi.Button
	*  @extends PIXI.DisplayObjectContainer
	*  @constructor
	*  @param {Object} [imageSettings] Information about the art to be used for button states, as well as if the button is selectable or not.
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
		if(!imageSettings) return;
		PIXI.DisplayObjectContainer.call(this);
		this.initialize(imageSettings, label, enabled);
	};
	
	// Reference to the prototype
	var p = Button.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
	
	/*
	*  The sprite that is the body of the button.
	*  @public
	*  @property {PIXI.Sprite} back
	*  @readOnly
	*/
	p.back = null;

	/*
	*  The text field of the button. The label is centered by both width and height on the button.
	*  @public
	*  @property {PIXI.Text|PIXI.BitmapText} label
	*  @readOnly
	*/
	p.label = null;

	/**
	*  The function that should be called when the button is released.
	*  @public
	*  @property {function} releaseCallback
	*/
	p.releaseCallback = null;

	/**
	*  The function that should be called when the button is moused over.
	*  @public
	*  @property {function} overCallback
	*/
	p.overCallback = null;
	
	/**
	*  The function that should be called when mouse leaves the button.
	*  @public
	*  @property {function} outCallback
	*/
	p.outCallback = null;

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
	* The current style for the label, to avoid setting this if it is unchanged.
	* @private
	* @property {Object} _currentLabelStyle
	*/
	p._currentLabelStyle = null;

	/**
	* An offset to button positioning, generally used to adjust for a highlight around the button.
	* @private
	* @property {PIXI.Point} _offset
	*/
	p._offset = null;
	
	//===callbacks for mouse/touch events
	/*
	* Callback for mouse over, bound to this button.
	* @private
	* @property {Function} _overCB
	*/
	p._overCB = null;

	/*
	* Callback for mouse out, bound to this button.
	* @private
	* @property {Function} _outCB
	*/
	p._outCB = null;

	/*
	* Callback for mouse down, bound to this button.
	* @private
	* @property {Function} _downCB
	*/
	p._downCB = null;

	/*
	* Callback for mouse up, bound to this button.
	* @private
	* @property {Function} _upCB
	*/
	p._upCB = null;

	/**
	* Callback for mouse up outside, bound to this button.
	* @private
	* @property {Function} _upOutCB
	*/
	p._upOutCB = null;
	
	/*
	* The width of the button art, independent of the scaling of the button itself.
	* @private
	* @property {Number} _width
	*/
	p._width = 0;

	/*
	* The height of the button art, independent of the scaling of the button itself.
	* @private
	* @property {Number} _height
	*/
	p._height = 0;

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
		this.back = new PIXI.Sprite(imageSettings.up);
		this.addChild(this.back);
		
		this._overCB = this._onOver.bind(this);
		this._outCB = this._onOut.bind(this);
		this._downCB = this._onDown.bind(this);
		this._upCB = this._onUp.bind(this);
		this._upOutCB = this._onUpOutside.bind(this);

		var _stateData = this._stateData = {};
		this._stateFlags = {};
		this._offset = new PIXI.Point();
		
		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if(label)
		{
			labelData = clone(label);
			delete labelData.text;
			delete labelData.type;
			if(labelData.x === undefined)
				labelData.x = "center";
			if(labelData.y === undefined)
				labelData.y = "center";
			//clone the style object and set up the defaults from PIXI.Text or PIXI.BitmapText
			var style = labelData.style = clone(label.style);
			if(label.type == "bitmap")
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
		
		this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;
		for(var i = this._statePriority.length - 1; i >= 0; --i)//start at the end to start at the up state
		{
			var state = this._statePriority[i];
			//set up the property for the state so it can be set - the function will ignore reserved states
			this._addProperty(state);
			//set the default value for the state flag
			if(state != "disabled" && state != "up")
				this._stateFlags[state] = false;
			var inputData = imageSettings[state];
			
			if(inputData)
			{
				//if inputData is an object with a tex property, use that
				//otherwise it is a texture itself
				if(inputData.tex)
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
			if(label)
			{
				//if there is actual label data for this state, use that
				if(inputData && inputData.label)
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
		if(!_stateData.up)
		{
			Debug.error("Button lacks an up state! This is a serious problem! Input data follows:");
			Debug.error(imageSettings);
		}
		if(!_stateData.over)
			_stateData.over = _stateData.up;
		if(!_stateData.down)
			_stateData.down = _stateData.up;
		if(!_stateData.disabled)
			_stateData.disabled = _stateData.up;
		//set up the offset
		if(imageSettings.offset)
		{
			this._offset.x = imageSettings.offset.x;
			this._offset.y = imageSettings.offset.y;
		}
		else
		{
			this._offset.x = this._offset.y = 0;
		}

		if(imageSettings.scale)
		{
			var s = imageSettings.scale || 1;
			this.back.scale.x = this.back.scale.y = s;
		}
		
		if(label)
		{
			this.label = label.type == "bitmap" ? new PIXI.BitmapText(label.text, labelData.style) : new PIXI.Text(label.text, labelData.style);
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
		if(this.label)
		{
			this.label.setText(text);
			//make the text update so we can figure out the size for positioning
			if(this.label instanceof PIXI.Text)
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
				if(this._stateFlags[this._statePriority[i]])
				{
					data = this._stateData[this._statePriority[i]];
					break;
				}
			}
			if(!data)
				data = this._stateData.up;
			data = data.label;
			if(data.x == "center")
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
			if(data.y == "center")
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
			if(value)
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
		if(RESERVED_STATES.indexOf(propertyName) >= 0) return;
		
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
		if(!this.back) return;

		var data;
		//use the highest priority state
		for(var i = 0; i < this._statePriority.length; ++i)
		{
			if(this._stateFlags[this._statePriority[i]])
			{
				data = this._stateData[this._statePriority[i]];
				break;
			}
		}
		//if no state is active, use the up state
		if(!data)
			data = this._stateData.up;
		this.back.setTexture(data.tex);
		//if we have a label, update that too
		if(this.label)
		{
			data = data.label;
			//update the text style
			if(!this._currentLabelStyle || !doObjectsMatch(this._currentLabelStyle, data.style))
			{
				this.label.setStyle(data.style);
				this._currentLabelStyle = data.style;
				//make the text update so we can figure out the size for positioning
				if(this.label instanceof PIXI.Text)
				{
					this.label.updateText();
					this.label.dirty = false;
				}
				else
					this.label.forceUpdateText();
			}
			//position the text
			if(data.x == "center")
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
			if(data.y == "center")
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
		if(obj1 === obj2)
			return true;
		for(var key in obj1)
		{
			if(obj1[key] != obj2[key])
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
		if(this.overCallback)
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
		if(this.outCallback)
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
		if(this.releaseCallback)
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
	
	namespace('cloudkid').Button = Button;
	namespace('cloudkid.pixi').Button = Button;
}());
/**
*  @module cloudkid.pixi
*/
(function() {
		
	/**
	*  Drag manager is responsible for handling the dragging of stage elements
	*  supports click-n-stick and click-n-drag functionality.
	*
	*  @class pixi.DragManager
	*  @constructor
	*  @param {PIXI.Stage} stage The stage that this DragManager is monitoring.
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
	* @property {PIXI.DisplayObject} draggedObj
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
	* @property {PIXI.Point} mouseDownStagePos
	*/
	p.mouseDownStagePos = null;

	/**
	* The position x, y of the object when interaction with it started.
	* @private
	* @property {PIXI.Point} mouseDownObjPos
	*/
	p.mouseDownObjPos = null;
	
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
	* If sticky click dragging is allowed.
	* @public
	* @property {Bool} allowStickyClick
	* @default true
	*/
	p.allowStickyClick = true;

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
	* @property {PIXI.Stage} _theStage
	*/
	p._theStage = null;
	
	/**
	* The local to global position of the drag
	* @private
	* @property {PIXI.Point} _dragOffset
	*/
	p._dragOffset = null;
	
	/**
	* External callback when we start dragging
	* @private
	* @property {Function} _dragStartCallback
	*/
	p._dragStartCallback = null;
	
	/**
	* External callback when we are done dragging
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
	* The function call when the mouse/touch moves
	* @private
	* @property {function} _updateCallback 
	*/
	p._updateCallback = null;
	
	/**
	* The collection of draggable objects
	* @private
	* @property {Array} _draggableObjects
	*/
	p._draggableObjects = null;
	
	var helperPoint = null;
	
	var TYPE_MOUSE = 0;
	var TYPE_TOUCH = 1;
	
	/** 
	* Constructor 
	* @method initialize
	* @param {PIXI.Stage} stage The stage that this DragManager is monitoring.
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
		this.mouseDownStagePos = new PIXI.Point(0, 0);
		this.mouseDownObjPos = new PIXI.Point(0, 0);
		helperPoint = new PIXI.Point(0, 0);
	};
	
	/**
	*	Manually starts dragging an object. If a mouse down event is not supplied as the second argument, it 
	*   defaults to a held drag, that ends as soon as the mouse is released.
	*  @method startDrag
	*  @public
	*  @param {PIXI.DisplayObject} object The object that should be dragged.
	*  @param {PIXI.InteractionData} interactionData The interaction data about the input event that triggered this.
	*/
	p.startDrag = function(object, interactionData)
	{
		this._objMouseDown(TYPE_MOUSE, object, interactionData);
	};
	
	/**
	* Mouse down on an obmect
	*  @method _objMouseDown
	*  @private
	*  @param {int} type The type of input that triggered this call - either TYPE_MOUSE or TYPE_TOUCH.
	*  @param {PIXI.DisplayObject} object The object that should be dragged.
	*/
	p._objMouseDown = function(type, obj, interactionData)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if(this.draggedObj !== null) return;

		this.draggedObj = obj;
		createjs.Tween.removeTweens(this.draggedObj);
		createjs.Tween.removeTweens(this.draggedObj.position);
		
		//get the mouse position and convert it to object parent space
		this._dragOffset = interactionData.getLocalPosition(this.draggedObj.parent);
		
		//move the offset to respect the object's current position
		this._dragOffset.x -= this.draggedObj.position.x;
		this._dragOffset.y -= this.draggedObj.position.y;

		this.mouseDownObjPos.x = this.draggedObj.position.x;
		this.mouseDownObjPos.y = this.draggedObj.position.y;
		
		this.mouseDownStagePos.x = interactionData.global.x;
		this.mouseDownStagePos.y = interactionData.global.y;
		if(!this.allowStickyClick || type == TYPE_TOUCH)//if it is a touch event, force it to be the held drag type
		{
			this.isTouchMove = type == TYPE_TOUCH;
			this.isHeldDrag = true;
			this._startDrag();
		}
		else//otherwise, wait for a movement or a mouse up in order to do a held drag or a sticky click drag
		{
			this.draggedObj.mousemove = this._triggerHeldDragCallback;
			this._theStage.interactionManager.stageUp = this._triggerStickyClickCallback;
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
		this.draggedObj.mousemove = null;
		this._theStage.interactionManager.stageUp = null;
		this._startDrag();
	};

	/**
	* Start hold dragging
	* @method _triggerHeldDrag
	* @private
	* @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	*/
	p._triggerHeldDrag = function(interactionData)
	{
		var xDiff = interactionData.global.x - this.mouseDownStagePos.x;
		var yDiff = interactionData.global.y - this.mouseDownStagePos.y;
		if(xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this.draggedObj.mousemove = null;
			this._theStage.interactionManager.stageUp = null;
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
		var im = this._theStage.interactionManager;
		im.stageUp = this._stageMouseUpCallback;
		this.draggedObj.mousemove = this.draggedObj.touchmove = this._updateCallback;
		
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
	* @param {Event} ev Mouse up event
	* @param {Bool} doCallback If we should do the callback
	*/
	p._stopDrag = function(origMouseEv, doCallback)
	{
		if(this.draggedObj)
			this.draggedObj.touchmove = this.draggedObj.mousemove = null;
		var im = this._theStage.interactionManager;
		im.stageUp = null;
		var obj = this.draggedObj;
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
	* @param {PIXI.InteractionData} interactionData Mouse move event
	*/
	p._updateObjPosition = function(interactionData)
	{
		if(!this.isTouchMove && !this._theStage.interactionManager.mouseInStage) return;
		if(!this.draggedObj || !this.draggedObj.parent)//not quite sure what chain of events would lead to this, but we'll stop dragging to be safe
		{
			this._stopDrag(null, false);
			return;
		}
		
		var mousePos = interactionData.getLocalPosition(this.draggedObj.parent, helperPoint);
		var bounds = this.draggedObj._dragBounds;
		this.draggedObj.position.x = clamp(mousePos.x - this._dragOffset.x, bounds.x, bounds.right);
		this.draggedObj.position.y = clamp(mousePos.y - this._dragOffset.y, bounds.y, bounds.bottom);
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
			this.draggedObj.position.x = closestPoint.x;
			this.draggedObj.position.y = closestPoint.y;
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
		this.mousedown = this._onMouseDownListener;
		this.touchstart = this._onTouchStartListener;
		this.buttonMode = this.interactive = true;
	};
	
	var disableDrag = function()
	{
		this.mousedown = this.touchstart = null;
		this.buttonMode = this.interactive = false;
	};
	
	var _onMouseDown = function(type, mouseData)
	{
		this._dragMan._objMouseDown(type, this, mouseData);
	};
	
	/** 
	* Adds properties and functions to the object - use enableDrag() and disableDrag() on 
	* objects to enable/disable them (they start out disabled). Properties added to objects:
	* _dragBounds (Rectangle), _onMouseDownListener (Function), _dragMan (cloudkid.DragManager) reference to the DragManager
	* these will override any existing properties of the same name
	* @method addObject
	* @public
	* @param {PIXI.DisplayObject} obj The display object
	* @param {PIXI.Rectangle} bound The rectangle bounds
	*/
	p.addObject = function(obj, bounds)
	{
		if(!bounds)
		{
			//use the primary display size, since the Pixi stage does not have height/width
			var display = cloudkid.Application.instance.display;
			bounds = {x:0, y:0, width:canvas.width, height:canvas.height};
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
		obj._onMouseDownListener = _onMouseDown.bind(obj, TYPE_MOUSE);
		obj._onTouchStartListener = _onMouseDown.bind(obj, TYPE_TOUCH);
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
			delete obj._onTouchStartListener;
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
		if(this.draggedObj !== null)
		{
			//clean up dragged obj
			this._stopDrag(null, false);
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
	};
	
	/** Assign to the global namespace */
	namespace('cloudkid').DragManager = DragManager;
	namespace('cloudkid.pixi').DragManager = DragManager;
}());
/**
*  @module cloudkid.pixi
*/
(function() {
	
	/**
	*  AssetManager is responsible for managing different resolutions of assets and spritesheets
	*  based on the resolution of the stage. This is a helpful optimization for PIXI because some low-hardware
	*  devices have a problem keeping up with larger images, or just refuse large images entirely.
	*  The AssetManager does not load assets itself, or keep track of what is loaded. It merely assists in 
	*  loading the appropriate assets, as well as easily unloading assets when you are done using them.
	*
	*  @class pixi.AssetManager
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
	*  The scaling value for each asset size id, e.g., {"sd" : 1, "tiny" : 2}
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
	*  each size of image as well as an animation file path for Spine animations. Image assets do not
	*  have to exist in each size. Fonts are marked for unloading purposes. Example config file:
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
						"sd":true,
						"tiny":false
					},
			        "LevelTitleFont": {
						"src": "ui/LevelTitleFont.xml",
						"sd": true,
						"tiny": false,
						"isFont": true
					}
        		}
	*
	*  @method init
	*  @static
	*  @param {Object} config The configuration file which contains keys for "path", "scale", "sizing", "assets"
	*  @param {Number} width The stage width
	*  @param {Number} height The stage height
	*/
	AssetManager.init = function(config, width, height)
	{
		AssetManager.scales = {};
		assets = config.assets;
		assetUrlCache = {};
		paths = config.path;
		sizes = config.sizing;
		scales = config.scale;
		pickScale(width, height);
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
	*  Unload an asset or list of assets.
	*  @method unload
	*  @static
	*  @param {Array|String} assetOrAsset The collection of asset ids or single asset id
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
		if(!assetUrlCache[asset]) return;//if this doesn't exist, then it wasn't loaded
		var a = assets[asset];
		if(!a) return;//asset never existed in the master list
		if(a.anim) return;//don't unload these, they are pretty small
		if(a.isFont)
		{
			if(PIXI.BitmapText.fonts[asset])
				delete PIXI.BitmapText.fonts[asset];
		}
		//anything else is a texture
		PIXI.Texture.destroyTexture(assetUrlCache[asset]);
		delete AssetManager.scales[asset];
		delete assetUrlCache[asset];
	};

	/**
	*  Assemble a dictionary of Texture arrays representing animations from the PixiJS texture cache.
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
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as anim_0001.png
	*  @param {Object} [outObj] If already using an return object
	*  @return {Object} An collection of PIXI.Textures for each animation id suitable for use in PIXI.MovieClip
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
		var fromFrame = PIXI.Texture.fromFrame;
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
				
				//If the texture doesn't exist, use the previous texture - this should allow us to use fewer textures
				//that are in fact the same
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
	
	// Assign to the namespace
	namespace('cloudkid').AssetManager = AssetManager;
	namespace('cloudkid.pixi').AssetManager = AssetManager;
}());}();