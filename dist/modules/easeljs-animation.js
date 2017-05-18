/*! SpringRoll 1.0.3 */
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		// Register the tasks
		this.assetManager.register('springroll.easeljs.BitmapMovieClipTask', 40);
		this.animator.register('springroll.easeljs.BitmapMovieClipInstance', 20);
		this.animator.register('springroll.easeljs.MovieClipInstance', 10);
	};

}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var Container = include("createjs.Container"),
		Point = include("createjs.Point"),
		Rectangle = include('createjs.Rectangle'),
		Bitmap = include('createjs.Bitmap');

	/**
	 * A class similar to createjs.MovieClip, but made to play animations from a
	 * springroll.easeljs.TextureAtlas. The EaselJS Sprite class requires a spritesheet with equal
	 * sized and spaced frames. By using TextureAtlas, you can use a much smaller spritesheet,
	 * sprites on screen with fewer extra transparent pixels, and use the same API as MovieClip.
	 *
	 * Format for BitmapMovieClip data:
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
	 * The example object describes a 30 fps animation that is 20 frames long, and was originally
	 * myAnim0001.png->myAnim0020.png, with frame labels on the first and 16th frames. 'digits' is
	 * optional, and defaults to 4.
	 *
	 * @class BitmapMovieClip
	 * @extends createjs.Container
	 * @constructor
	 * @param {springroll.easeljs.TextureAtlas} [atlas] The texture atlas to pull frames from.
	 * @param {Object} [data] Initialization data
	 * @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the
	 *                      current framerate.
	 * @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in
	 *                            playing animations.
	 * @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 * @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 * @param {String} [data.frames.name] The name to use for the frame sequence. This should
	 *                                 include a "#" to be replaced with the image number.
	 * @param {int} [data.frames.min] The first frame number in the frame sequence.
	 * @param {int} [data.frames.max] The last frame number in the frame sequence.
	 * @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames,
	 *                                  e.g. myAnim0001 has 4 digits.
	 * @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4
	 *                             means the art was increased in size to 140% before exporting
	 *                             and should be scaled back down before drawing to the screen.
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

		/**
		 * Boundaries of the animation, like the nominalBounds produced by Flash's HTML5 exporter.
		 * This uses the full, untrimmed size of the first frame.
		 * @property nominalBounds
		 * @type createjs.Rectangle
		 */
		this.nominalBounds = new Rectangle();

		//==== Private properties =====

		/**
		 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate
		 * for the BitmapMovieClip will cause it to advance based on elapsed time between ticks as
		 * appropriate to maintain the target framerate.
		 *
		 * @property _framerate
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		this._framerate = 0;

		/**
		 * When the BitmapMovieClip is framerate independent, this is the total time in seconds for
		 * the animation.
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
		 * @type Point
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
		this._bitmap = new Bitmap();
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
			if (value > 0)
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
	 *                            cache. For example, used for drawing the cache (to prevent it
	 *                            from simply drawing an existing cache back into itself).
	 */
	p.draw = function(ctx, ignoreCache)
	{
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache))
		{
			return true;
		}
		this._updateTimeline();
		s.draw.call(this, ctx, ignoreCache); //Container's call
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
	p.gotoAndCache = function(args) {};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. If 0 or null, time is not
	 *                      advanced but the timeline is still updated.
	 * @method advance
	 */
	p.advance = function(time)
	{
		if (!this.paused)
		{
			if (this._framerate > 0)
			{
				if (time)
					this._t += time * 0.001; //milliseconds -> seconds
				if (this._t > this._duration)
					this._t = this.loop ? this._t - this._duration : this._duration;
				//add a tiny amount to stop floating point errors in their tracks
				this._prevPosition = Math.floor(this._t * this._framerate + 0.0000001);
				if (this._prevPosition >= this._frames.length)
					this._prevPosition = this._frames.length - 1;
			}
			else
				this._prevPosition = this._prevPosition + 1;
			this._updateTimeline();
		}
	};

	/**
	 * Returns a sorted list of the labels defined on this BitmapMovieClip.
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame)
	 *                       properties.
	 */
	p.getLabels = function()
	{
		return this._labels;
	};

	/**
	 * Returns a sorted list of the labels which can be played with Animator.
	 * @method getEvents
	 * @return {Array} A sorted array of objects with label, length and position (aka frame)
	 *   properties.
	 */
	p.getEvents = function()
	{
		return this._events;
	};

	/**
	 * Returns the name of the label on or immediately before the current frame.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 */
	p.getCurrentLabel = function()
	{
		var labels = this._labels;
		var current = null;
		for (var i = 0, len = labels.length; i < len; ++i)
		{
			if (labels[i].position <= this.currentFrame)
				current = labels[i].label;
			else
				break;
		}
		return current;
	};

	/**
	 * Initializes or re-initializes the BitmapMovieClip.
	 * @method init
	 * @param {springroll.easeljs.TextureAtlas} atlas The texture atlas to pull frames from.
	 * @param {Object} data Initialization data
	 * @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the
	 *                        current framerate.
	 * @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in
	 *                              playing animations.
	 * @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 * @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 * @param {String} [data.frames.name] The name to use for the frame sequence. This should
	 *                                   include a "#" to be replaced with the image number.
	 * @param {int} [data.frames.min] The first frame number in the frame sequence.
	 * @param {int} [data.frames.max] The last frame number in the frame sequence.
	 * @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames,
	 *                                    e.g. myAnim0001 has 4 digits.
	 * @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4
	 *                               means the art was increased in size to 140% before exporting
	 *                               and should be scaled back down before drawing to the screen.
	 */
	p.init = function(atlas, data)
	{
		//collect the frame labels
		var labels = this._labels = [];
		var events = this._events = [];

		var name;
		if (data.labels)
		{
			var positions = {},
				position;

			for (name in data.labels)
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

		var index;
		for (var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];

			name = frameSet.name;
			index = name.lastIndexOf("/");
			//strip off any folder structure included in the name
			if (index >= 0)
				name = name.substring(index + 1);

			atlas.getFrames(
				name,
				frameSet.min,
				frameSet.max,
				frameSet.digits,
				this._frames
			);
		}

		//set up the framerate
		if (data.fps)
			this.framerate = data.fps;
		else if (this._framerate)
			this.framerate = this._framerate;
		if (data.scale && data.scale > 0)
			this._scale = 1 / data.scale;
		else
			this._scale = 1;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
		if (data.origin)
			this._origin = new Point(data.origin.x * this._scale, data.origin.y * this._scale);
		else
			this._origin = new Point();

		//set up a nominal bounds, to make it easier to determine boundaries
		//this uses the untrimmed size of the texture
		var frame = this._frames[0];
		var bounds = this.nominalBounds;
		bounds.x = -this._origin.x;
		bounds.y = -this._origin.y;
		bounds.width = frame.width * this._scale;
		bounds.height = frame.height * this._scale;
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
		this._events = other._events;
		this._origin = other._origin;
		this._framerate = other._framerate;
		this._duration = other._duration;
		this._scale = other._scale;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
	};

	/**
	 * Clone a sprite. Creates a shallow copy of loaded element
	 * @method clone
	 * @static
	 * @param {springroll.easeljs.BitmapMovieClip} sprite The sprite to clone
	 * @param {Number} [x=0] The initial x position
	 * @param {Number} [y=0] The initial y position
	 * @return {springroll.easeljs.BitmapMovieClip}
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
		this.advance(props && props.delta);
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
		if (typeof positionOrLabel == "string")
		{
			var labels = this._labels;
			for (var i = 0, len = labels.length; i < len; ++i)
			{
				if (labels[i].label == positionOrLabel)
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
		if (this._framerate > 0)
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
		if (this._prevPosition < 0)
			this._prevPosition = 0;
		else if (this._prevPosition >= this._frames.length)
			this._prevPosition = this._frames.length - 1;
		this.currentFrame = this._prevPosition;
		if (this._currentTexture != this._frames[this.currentFrame])
		{
			var tex = this._currentTexture = this._frames[this.currentFrame],
				_bitmap = this._bitmap;
			_bitmap.image = tex.image;
			_bitmap.sourceRect = tex.frame;
			_bitmap.x = -this._origin.x + tex.offset.x * _bitmap.scaleX;
			_bitmap.y = -this._origin.y + tex.offset.y * _bitmap.scaleY;
			if (tex.rotated)
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
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var MovieClip = include('createjs.MovieClip');
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var GenericMovieClipInstance = include('springroll.GenericMovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class MovieClipInstance
	 * @extends springroll.GenericMovieClipInstance
	 * @private
	 */
	var MovieClipInstance = function()
	{
		GenericMovieClipInstance.call(this);
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	MovieClipInstance.test = function(clip)
	{
		return clip instanceof MovieClip;
	};

	MovieClipInstance.hasAnimation = GenericMovieClipInstance.hasAnimation;
	MovieClipInstance.getDuration = GenericMovieClipInstance.getDuration;

	// Inherit the AnimatorInstance
	var s = AnimatorInstance.prototype;
	var p = AnimatorInstance.extend(MovieClipInstance, GenericMovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').MovieClipInstance = MovieClipInstance;

}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip');
	var GenericMovieClipInstance = include('springroll.GenericMovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class BitmapMovieClipInstance
	 * @extends springroll.GenericMovieClipInstance
	 * @private
	 */
	var BitmapMovieClipInstance = function()
	{
		GenericMovieClipInstance.call(this);
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	BitmapMovieClipInstance.test = function(clip)
	{
		return clip instanceof BitmapMovieClip;
	};

	BitmapMovieClipInstance.hasAnimation = GenericMovieClipInstance.hasAnimation;
	BitmapMovieClipInstance.getDuration = GenericMovieClipInstance.getDuration;

	// Extend class
	AnimatorInstance.extend(BitmapMovieClipInstance, GenericMovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipInstance = BitmapMovieClipInstance;

}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	 * Create an update listener that checks plays the animation
	 * in reverse. Requires the animation to have the same labeling
	 * system as the springroll.Animator system.
	 * 	i.e. each animation must have a corresponding ending frame
	 * 	marked with	a '_stop' and '_loop' suffixes,
	 * for instance: "walk" requires "walk_loop"
	 * @class ReversePlayback
	 * @static
	 * @param {createjs.MovieClip} clip
	 * The MovieClip containing the timeline and animation
	 */
	var ReversePlayback = function(clip)
	{
		/**
		 * The animation clip to play
		 * @property {createjs.MovieClip} clip
		 */
		this.clip = clip;

		/**
		 * The framerate which to playback the clip
		 * @property {int} frameRate
		 */
		this.frameRate = 24;

		/**
		 * The list of frame events
		 * @property {object} frameDictionary
		 */
		this.frameDictionary = buildDictionary(clip);

		// Update binding
		this.update = this.update.bind(this);
	};

	// Reference to prototype
	var p = extend(ReversePlayback);

	/**
	 * Build a dictionary of all animations start and end
	 * frame positions'
	 * @method _buildDictionary
	 * @private
	 */
	var buildDictionary = function(clip)
	{
		var str, i, label, dict = {};
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			if (str.indexOf('_stop') > -1 || str.indexOf('_loop') > -1)
			{
				continue;
			}

			if (!dict[str])
			{
				dict[str] = {
					first: label.position,
					last: null
				};
			}
		}

		var stop, loop;
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			stop = str.indexOf('_stop');
			loop = str.indexOf('_loop');
			if (loop > -1)
			{
				dict[str.substring(0, loop)].last = label.position;
			}
		}
		return dict;
	};

	/**
	 * Play the specificied animation
	 * @method  play
	 * @param {string} label
	 */
	p.play = function(label)
	{
		this.stop();

		var frame = this.frameDictionary[label];
		this.startFrame = frame.last;
		this.endFrame = frame.first;
		this.framePassed = this.frameRate;
		this.clip.gotoAndStop(this.endFrame);
		Application.instance.on('update', this.update);
	};

	/**
	 * Go to the previous frame of the animation
	 * @method  goToPreviousFrame
	 */
	p.goToPreviousFrame = function()
	{
		var prevFrame = this.clip.currentFrame - 1;
		if (prevFrame < this.endFrame)
		{
			//loop back to last-frame
			prevFrame = this.startFrame;
		}
		this.clip.gotoAndStop(prevFrame);
	};

	/**
	 * Update the animation when framerate matches animation's framerate
	 * @method  update
	 * @param {number} elapsed Time in milleseconds since last frame update
	 */
	p.update = function(elapsed)
	{
		this.framePassed -= elapsed;
		if (this.framePassed <= 0)
		{
			this.framePassed = this.frameRate;
			this.goToPreviousFrame();
		}
	};

	/**
	 * End the frame update loop
	 * @method stop
	 */
	p.stop = function()
	{
		Application.instance.off('update', this.update);
	};

	//Assign to namespace
	namespace('springroll.easeljs').ReversePlayback = ReversePlayback;
}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function()
{
	var TextureAtlasTask = include('springroll.easeljs.TextureAtlasTask'),
		BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip');

	/**
	 * Internal class for loading an instantiating a BitmapMovieClip.
	 * @class BitmapMovieClipTask
	 * @extends springroll.TextureAtlasTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.anim Path to the JSON configuration for BitmapMovieClip
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var BitmapMovieClipTask = function(asset)
	{
		TextureAtlasTask.call(this, asset);

		/**
		 * The BitmapMovieClip data source path
		 * @property {String} anim
		 */
		this.anim = this.filter(asset.anim);
	};

	// Reference to prototype
	var p = TextureAtlasTask.extend(BitmapMovieClipTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	BitmapMovieClipTask.test = function(asset)
	{
		return asset.anim && TextureAtlasTask.test(asset);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas(
		{
			_anim: this.anim
		}, function(textureAtlas, results)
		{
			callback(new BitmapMovieClip(
				textureAtlas,
				results._anim
			), results);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipTask = BitmapMovieClipTask;

}());
/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	 * See {{#crossLink "springroll.Animator"}}{{/crossLink}}
	 * @class Animator
	 * @deprecated since version 0.4.0
	 */
	var Animator = namespace('springroll').Animator = namespace('springroll.easeljs').Animator = {};

	/**
	 * If an instance can be animated, See {{#crossLink "springroll.Animator/canAnimate:method"}}{{/crossLink}}
	 * @static
	 * @method canAnimate
	 * @deprecated since version 0.4.0
	 * @param {*} instance The instance to check
	 * @return {Boolean} If the instance is animate-able
	 */
	Animator.canAnimate = function(instance)
	{
		if (true) console.warn('Animator.canAnimate() is now deprecated, please use the app.animator.canAnimate()');
		return Application.instance.animator.canAnimate(instance);
	};

	/**
	 * Get the duration for an instance by event, see {{#crossLink "springroll.Animator/getDuration:method"}}{{/crossLink}}
	 * @method getDuration
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {string} event The event name
	 * @return {int} The length in milliseconds
	 */
	Animator.getDuration = function(instance, event)
	{
		if (true) console.warn('Animator.getDuration() is now deprecated, please use the app.animator.getDuration()');
		return Application.instance.animator.getDuration(instance, event);
	};

	/**
	 * Get a timeline by instance, see {{#crossLink "springroll.Animator/getTimeline:method"}}{{/crossLink}}
	 * @static
	 * @method getTimeline
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @return {springroll.AnimatorTimeline} The timeline instance
	 */
	Animator.getTimeline = function(instance)
	{
		if (true) console.warn('Animator.getTimeline() is now deprecated, please use the app.animator.getTimeline()');
		return Application.instance.animator.getTimeline(instance);
	};

	/**
	 * If an instance has an animation event label, see {{#crossLink "springroll.Animator/hasAnimation:method"}}{{/crossLink}}
	 * @static
	 * @method instanceHasAnimation
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {String} event The event label to check
	 * @return {Boolean} If the instance has the event
	 */
	Animator.instanceHasAnimation = function(instance, event)
	{
		if (true) console.warn('Animator.instanceHasAnimation() is now deprecated, please use the app.animator.hasAnimation()');
		return Application.instance.animator.hasAnimation(instance, event);
	};

	/**
	 * Pause all animations in a group, see {{#crossLink "springroll.Animator/pauseInGroup:method"}}{{/crossLink}}
	 * @method pauseInGroup
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {Boolean} paused The paused state
	 * @param {PIXI.Container} container The container of instances
	 */
	Animator.pauseInGroup = function(paused, container)
	{
		if (true) console.warn('Animator.pauseInGroup() is now deprecated, please use the app.animator.pauseInGroup()');
		Application.instance.animator.pauseInGroup(paused, container);
	};

	/**
	 * Resume all animations, see {{#crossLink "springroll.Animator/resume:method"}}{{/crossLink}}
	 * @static
	 * @method resume
	 * @deprecated since version 0.4.0
	 */
	Animator.resume = function()
	{
		if (true) console.warn('Animator.resume() is now deprecated, please use the app.animator.resume()');
		Application.instance.animator.resume();
	};

	/**
	 * Stop all animations, see {{#crossLink "springroll.Animator/stopAll:method"}}{{/crossLink}}
	 * @method stopAll
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.stopAll = function(container, removeCallbacks)
	{
		if (true) console.warn('Animator.stopAll() is now deprecated, please use the app.animator.stopAll()');
		Application.instance.animator.stopAll(container, removeCallbacks);
	};

	/**
	 * Destroy the animator, see {{#crossLink "springroll.Animator/destroy:method"}}{{/crossLink}}
	 * @method destroy
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.destroy = function()
	{
		if (true) console.warn('Animator.destroy() is now deprecated, please use the app.animator.destroy()');
		Application.instance.animator.destroy();
	};

	/**
	 * Get the paused state of instance, see {{#crossLink "springroll.Animator/paused:property"}}{{/crossLink}}
	 * @method getPaused
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The instance to get
	 * @return {Boolean} Is paused
	 */
	Animator.getPaused = function(instance)
	{
		if (true) console.warn('Animator.getPaused() is now deprecated, please use the app.animator.paused');
		return Application.instance.animator.paused;
	};

	/**
	 * Initialize the animator, see {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @method init
	 * @static
	 * @deprecated since version 0.4.0
	 * @return {springroll.Animator} The animator instance
	 */
	Animator.init = function()
	{
		if (true) console.warn('Animator.init() is now deprecated, please use the app.animator property');
		return Application.intance.animator;
	};

	/**
	 * Pause all animations, see {{#crossLink "springroll.Animator/pause:method"}}{{/crossLink}}
	 * @method pause
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.pause = function()
	{
		if (true) console.warn('Animator.pause() is now deprecated, please use the app.animator.pause()');
		Application.instance.animator.pause();
	};

	/**
	 * Play an instance event, see {{#crossLink "springroll.Animator/play:method"}}{{/crossLink}}
	 * @method play
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {Object|String} eventList The event information to play
	 * @param {Function} onComplete The completed function
	 * @param {Function} [onCancelled] The cancelled function
	 */
	Animator.play = function(instance, eventList, onComplete, onCancelled)
	{
		if (true) console.warn('Animator.play() is now deprecated, please use the app.animator.play');
		return Application.instance.animator.play(instance, eventList, onComplete, onCancelled);
	};

	/**
	 * See {{#crossLink "springroll.Animator/stop:method"}}{{/crossLink}}
	 * @method stop
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip to play
	 * @param {Boolean} [removeCallbacks=false] If we should remove callbacks
	 */
	Animator.stop = function(instance, removeCallbacks)
	{
		if (true) console.warn('Animator.stop() is now deprecated, please use the app.animator.stop()');
		Application.instance.animator.stop(instance, removeCallbacks);
	};

	/**
	 * @method toString
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.toString = function()
	{
		if (true) console.warn('Animator.toString is now deprecated');
		return '[Animator]';
	};

	Object.defineProperties(Animator,
	{
		/**
		 * See {{#crossLink "springroll.Animator/captions:property"}}{{/crossLink}}
		 * @property {springroll.Captions} captions
		 * @static
		 * @deprecated since version 0.4.0
		 */
		captions:
		{
			get: function()
			{
				if (true) console.warn('Animator.captions is now deprecated, please use the app.animator.captions');
				return Application.instance.animator.captions;
			}
		},
		/**
		 * See {{#crossLink "springroll.Animator/debug:property"}}{{/crossLink}}
		 * @property {Boolean} debug
		 * @static
		 * @deprecated since version 0.4.0
		 */
		debug:
		{
			get: function()
			{
				if (true) console.warn('Animator.debug is now deprecated, please use the app.animator.debug');
				return Application.instance.animator.debug;
			}
		}
	});

}());