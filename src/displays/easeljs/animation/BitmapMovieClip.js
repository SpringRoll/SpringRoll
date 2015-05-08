/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
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

		//==== Public properties =====
		
		/**
		 * Indicates whether this BitmapMovieClip should loop when it reaches the end of its timeline.
		 * @property loop
		 * @type Boolean
		 * @default true
		 */
		this.loop = true;

		/**
		 * The current frame of the movieclip.
		 * @property currentFrame
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		this.currentFrame = 0;

		/**
		 * If true, the BitmapMovieClip's position will not advance when ticked.
		 * @property paused
		 * @type Boolean
		 * @default false
		 */
		this.paused = false;

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
		 */
		this._framerate = 0;

		/**
		 * When the BitmapMovieClip is framerate independent, this is the total time in seconds for the
		 * animation.
		 *
		 * @property _duration
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._duration = 0;

		/**
		 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in
		 * seconds.
		 * @property _t
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._t = 0;

		/**
		 * @property _prevPosition
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._prevPosition = 0;

		/**
		 * The Bitmap used to render the current frame of the animation.
		 * @property _bitmap
		 * @type createjs.Bitmap
		 * @private
		 */
		this._bitmap = 0;

		/**
		 * An array of frame labels.
		 * @property _labels
		 * @type Array
		 * @private
		 */
		this._labels = 0;

		/**
		 * An array of event labels.
		 * @property _events
		 * @type Array
		 * @private
		 */
		this._events = 0;

		/**
		 * An array of textures.
		 * @property _frames
		 * @type Array
		 * @private
		 */
		this._frames = null;

		/**
		 * The current texture.
		 * @property _currentTexture
		 * @type createjs.TextureAtlas.Texture
		 * @private
		 */
		this._currentTexture = null;

		/**
		 * The origin point of the BitmapMovieClip.
		 * @property _origin
		 * @type createjs.Point
		 * @private
		 */
		this._origin = null;

		/**
		 * A scale to apply to the images in the BitmapMovieClip
		 * to restore normal size (if spritesheet was exported at a smaller or larger size).
		 * @property _scale
		 * @type Number
		 * @private
		 */
		this._scale = 1;

		// mouse events should reference this, not the child bitmap
		this.mouseChildren = false;
		this._bitmap = new createjs.Bitmap();
		this.addChild(this._bitmap);
		
		if (atlas && data)
		{
			this.init(atlas, data);
		}
	};

	var p = extend(BitmapMovieClip, Container);
	var s = Container.prototype;

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
	 */
	Object.defineProperty(p, 'framerate',
	{
		get: function()
		{
			return this._framerate;
		},
		set: function(value)
		{
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
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function()
		{
			return this._t;
		},
		set: function(value)
		{
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
	Object.defineProperty(p, 'totalFrames',
	{
		get: function()
		{
			return this._frames.length;
		}
	});

	/**
	 * (Read-Only) The Texture of the current frame
	 * @property currentTexture
	 * @type createjs.TextureAtlas.Texture
	 * @readOnly
	 */
	Object.defineProperty(p, 'currentTexture',
	{
		get: function()
		{
			return this._currentTexture;
		}
	});

	//==== Public Methods =====

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a
	 * canvas. This does not account for whether it would be visible within the boundaries of the
	 * stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 */
	p.isVisible = function()
	{
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
	 */
	p.draw = function(ctx, ignoreCache)
	{
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		s.draw.call(this, ctx, ignoreCache);//Container's call
		return true;
	};

	/**
	 * Sets paused to false.
	 * @method play
	 */
	p.play = function()
	{
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 */
	p.stop = function()
	{
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 */
	p.gotoAndPlay = function(positionOrLabel)
	{
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 */
	p.gotoAndStop = function(positionOrLabel)
	{
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * To provide feature parity with the createjs.MovieClip mixin
	 * @method gotoAndCache
	 */
	p.gotoAndCache = function(args)
	{
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. If 0 or null, time is not
	 *                        advanced but the timeline is still updated.
	 * @method advance
	*/
	p.advance = function(time)
	{
		if(!this.paused)
		{
			if(this._framerate > 0)
			{
				if(time)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.loop ? this._t - this._duration : this._duration;
				//add a tiny amount to stop floating point errors in their tracks
				this._prevPosition = Math.floor(this._t * this._framerate * 0.0000001);
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
	 */
	p.getLabels = function()
	{
		return this._labels;
	};

	/**
	 * Returns a sorted list of the labels which can be played with Animator.
	 * @method getEvents
	 * @return {Array} A sorted array of objects with label, length and position (aka frame)
	 *     properties.
	 */
	p.getEvents = function()
	{
		return this._events;
	};
	
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS:
	 * Timeline.getCurrentLabel() for more information.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 */
	p.getCurrentLabel = function()
	{
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
	 */
	p.init = function(atlas, data)
	{
		//collect the frame labels
		var labels = this._labels = [];
		var events = this._events = [];
		
		if (data.labels)
		{
			var positions = {}, position;

			for(var name in data.labels)
			{
				var label = {
					label: name,
					position: data.labels[name],
					length: 1
				};

				positions[name] = label.position;

				// Exclude animation-end tags
				if (!/_(loop|stop)$/.test(name))
				{
					events.push(label);
				}
				labels.push(label);
			}
			// Calculate the lengths for all the event labels
			var start = null;
			for (var j = 0; j < events.length; j++)
			{
				var event = events[j];
				start = event.position;
				event.length =
					positions[name + '_stop'] - start ||
					positions[name + '_loop'] - start ||
					0;
			}
			labels.sort(labelSorter);
			events.sort(labelSorter);
		}

		//collect the frames
		this._frames = [];

		for(var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];

			atlas.getFrames(
				frameSet.name,
				frameSet.min,
				frameSet.max,
				frameSet.digits,
				this._frames
			);
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
	 *  Clone a sprite. Creates a shallow copy of loaded element
	 *  @method clone
	 *  @static
	 *  @param {springroll.easeljs.BitmapMovieClip} sprite The sprite to clone
	 *  @param {Number} [x=0] The initial x position
	 *  @param {Number} [y=0] The initial y position
	 *  @return {springroll.easeljs.BitmapMovieClip}
	 */
	BitmapMovieClip.clone = function(sprite, x, y)
	{
		var clone = new BitmapMovieClip();
		clone.copyFrom(sprite);
		clone.x = x || sprite.x;
		clone.y = y || sprite.y;
		return clone;
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
	 */
	p._tick = function(props)
	{
		this.advance(props&&props.delta);
		s._tick.call(this, props);
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 */
	p._goto = function(positionOrLabel)
	{
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
		if (pos === null) return;
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
	 */
	p._updateTimeline = function()
	{
		if(this._prevPosition < 0)
			this._prevPosition = 0;
		else if(this._prevPosition >= this._frames.length)
			this._prevPosition = this._frames.length - 1;
		this.currentFrame = this._prevPosition;
		if(this._currentTexture != this._frames[this.currentFrame])
		{
			var tex = this._currentTexture = this._frames[this.currentFrame],
				_bitmap = this._bitmap;
			_bitmap.image = tex.image;
			_bitmap.sourceRect = tex.frame;
			_bitmap.x = -this._origin.x + tex.offset.x * _bitmap.scaleX;
			_bitmap.y = -this._origin.y + tex.offset.y * _bitmap.scaleY;
			if(tex.rotated)
			{
				_bitmap.rotation = -90;
				_bitmap.regX = _bitmap.sourceRect.width;
			}
			else
			{
				_bitmap.rotation = _bitmap.regX = 0;
			}
		}
	};
	
	/**
	 * @method _reset
	 * @private
	 */
	p._reset = function()
	{
		this._prevPosition = 0;
		this._t = 0;
		this.currentFrame = 0;
	};

	namespace("createjs").BitmapMovieClip = BitmapMovieClip;
	namespace("springroll.easeljs").BitmapMovieClip = BitmapMovieClip;
}());