/*! SpringRoll 1.0.3 */
/**
 * @module PIXI Animation
 * @namespace springroll
 * @requires  Core, PIXI Display, Animation
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
		this.assetManager.register('springroll.pixi.AdvancedMovieClipTask', 80);
		this.animator.register('springroll.pixi.AdvancedMovieClipInstance', 10);
	};

}());
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function(undefined)
{

	"use strict";

	var Sprite = include('PIXI.Sprite'),
		Texture = include("PIXI.Texture");

	/**
	 *  A class similar to PIXI.extras.MovieClip, but made to play animations _exclusively_ using
	 *  the Animator, with data exported by the BitmapMovieClip exporter.
	 *
	 *  Format for AdvancedMovieClip data (the same as BitmapMovieClip):
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
	 *  @class AdvancedMovieClip
	 *  @extends PIXI.Sprite
	 *  @constructor
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
	 *  @param {springroll.pixi.TextureAtlas} [atlas] A TextureAtlas to pull frames from. If omitted,
	 *                                                frames are pulled from Pixi's global texture
	 *                                                cache.
	 */
	var AdvancedMovieClip = function(data, atlas)
	{
		Sprite.call(this);

		//==== Public properties =====
		/**
		 * The current frame of the movieclip.
		 * @property currentFrame
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		this.currentFrame = 0;

		//==== Private properties =====

		/**
		 * The speed at which the AdvancedMovieClip should play.
		 *
		 * @property _framerate
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		this._framerate = 0;

		/**
		 * The total time in seconds for the animation.
		 *
		 * @property _duration
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._duration = 0;

		/**
		 * The time elapsed from frame 0 in seconds.
		 * @property _t
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._t = 0;

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
		 * The array of Textures that are the MovieClip's frames.
		 * @property _textures
		 * @private
		 * @type Array
		 */
		this._textures = null;

		if (data)
		{
			this.init(data, atlas);
		}
	};

	var p = extend(AdvancedMovieClip, Sprite);
	var s = Sprite.prototype;

	/**
	 * The speed at which the AdvancedMovieClip should play.
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
				this._duration = value ? this._textures.length / value : 0;
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
			if (this._t > this._duration)
				this._t = this._duration;
			//add a tiny amount to stop floating point errors in their tracks
			this.currentFrame = Math.floor(this._t * this._framerate + 0.0000001);
			if (this.currentFrame >= this._textures.length)
				this.currentFrame = this._textures.length - 1;
			this.texture = this._textures[this.currentFrame] || Texture.EMPTY;
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
			return this._textures.length;
		}
	});

	//==== Public Methods =====

	/**
	 * Advances this movie clip to the specified position or label.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 */
	p.gotoAndStop = function(positionOrLabel)
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
		if (pos >= this._textures.length)
			pos = this._textures.length - 1;
		this.currentFrame = pos;
		if (this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;

		this.texture = this._textures[pos] || Texture.EMPTY;
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in milliseconds to advance by.
	 * @method advance
	 */
	p.advance = function(time)
	{
		if (this._framerate > 0 && time)
		{
			this._t += time * 0.001; //milliseconds -> seconds
			if (this._t > this._duration)
				this._t = this._duration;
			//add a tiny amount to stop floating point errors in their tracks
			this.currentFrame = Math.floor(this._t * this._framerate + 0.0000001);
			if (this.currentFrame >= this._textures.length)
				this.currentFrame = this._textures.length - 1;
			this.texture = this._textures[this.currentFrame] || Texture.EMPTY;
		}
	};

	/**
	 * Returns a sorted list of the labels defined on this AdvancedMovieClip.
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame)
	 *                        properties.
	 */
	p.getLabels = function()
	{
		return this._labels;
	};

	/**
	 * Returns a sorted list of the labels which can be played with Animator.
	 * @method getEvents
	 * @return {Array} A sorted array of objects with label, length and position (aka frame)
	 *    properties.
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
	 * Initializes or re-initializes the AdvancedMovieClip.
	 * @method init
	 * @param {Object} data Initialization data
	 * @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the
	 *                         current framerate.
	 * @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in
	 *                               playing animations.
	 * @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 * @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 * @param {String} [data.frames.name] The name to use for the frame sequence. This should
	 *                                    include a "#" to be replaced with the image number.
	 * @param {int} [data.frames.min] The first frame number in the frame sequence.
	 * @param {int} [data.frames.max] The last frame number in the frame sequence.
	 * @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames,
	 *                                     e.g. myAnim0001 has 4 digits.
	 * @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4
	 *                                means the art was increased in size to 140% before exporting
	 *                                and should be scaled back down before drawing to the screen.
	 * @param {springroll.pixi.TextureAtlas} [atlas] A TextureAtlas to pull frames from. If omitted,
	 *                                               frames are pulled from Pixi's global texture
	 *                                               cache.
	 */
	p.init = function(data, atlas)
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
		this._textures = [];

		var index;
		for (var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];

			name = frameSet.name;
			index = name.lastIndexOf("/");
			//strip off any folder structure included in the name
			if (index >= 0)
				name = name.substring(index + 1);

			if (atlas)
			{
				atlas.getFrames(
					name,
					frameSet.min,
					frameSet.max,
					frameSet.digits,
					this._textures
				);
			}
			else
			{
				getFrames(
					name,
					frameSet.min,
					frameSet.max,
					frameSet.digits,
					this._textures
				);
			}
		}

		//set up the framerate
		if (data.fps)
			this.framerate = data.fps;
		else if (this._framerate)
			this.framerate = this._framerate;
		if (data.origin)
		{
			this.pivot.x = data.origin.x;
			this.pivot.y = data.origin.y;
		}
		else
		{
			this.pivot.x = this.pivot.y = 0;
		}

		this.gotoAndStop(0);
	};

	function labelSorter(a, b)
	{
		return a.position - b.position;
	}

	function getFrames(name, numberMin, numberMax, maxDigits, outArray)
	{
		if (maxDigits === undefined)
			maxDigits = 4;
		if (maxDigits < 0)
			maxDigits = 0;
		if (!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
		var zeros = []; //preceding zeroes array
		var compares = []; //powers of 10 array for determining how many preceding zeroes to use
		var i, c;
		for (i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for (var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length; //the length of the compare

		//the previous Texture, so we can place the same object in multiple times to control
		//animation rate
		var prevTex;
		var len;
		var fromFrame = Texture.fromFrame;
		for (i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
			for (c = 0; c < compareLength; ++c)
			{
				if (i < compares[c])
				{
					num = zeros[c] + i;
					break;
				}
			}
			if (!num)
				num = i.toString();

			//If the texture doesn't exist, use the previous texture - this should allow us to use
			//fewer textures that are in fact the same, if those textures were removed before
			//making the spritesheet
			var texName = name.replace("#", num);
			var tex = fromFrame(texName, true);
			if (tex)
				prevTex = tex;
			if (prevTex)
				outArray.push(prevTex);
		}
		return outArray;
	}

	/**
	 *	Copies the labels, textures, origin, and framerate from another AdvancedMovieClip.
	 *	The labels and textures are copied by reference, instead of a deep copy.
	 *	@method copyFrom
	 *	@param {AdvancedMovieClip} other The movieclip to copy data from.
	 */
	p.copyFrom = function(other)
	{
		this._textures = other._textures;
		this._labels = other._labels;
		this._events = other._events;
		this.pivot.x = other.pivot.x;
		this.pivot.y = other.pivot.y;
		this._framerate = other._framerate;
		this._duration = other._duration;
	};

	/**
	 *	Destroys the AdvancedMovieClip.
	 *	@method destroy
	 */
	p.destroy = function()
	{
		this._labels = this._events = null;
		s.destroy.call(this);
	};

	namespace("springroll.pixi").AdvancedMovieClip = AdvancedMovieClip;
}());
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function(undefined)
{
	var Application = include("springroll.Application");
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip');

	/**
	 * The plugin for working with AdvancedMovieClips and animator
	 * @class AdvancedMovieClipInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 */
	var AdvancedMovieClipInstance = function()
	{
		AnimatorInstance.call(this);

		/**
		 * The start time of the current animation on the movieclip's timeline.
		 * @property {Number} startTime
		 */
		this.startTime = 0;

		/**
		 * Length of current animation in frames.
		 *
		 * @property {int} length
		 */
		this.length = 0;

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
	};

	// Reference to the prototype
	var p = AnimatorInstance.extend(AdvancedMovieClipInstance);

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

		if (anim == "*")
		{
			first = 0;
			last = this.clip.totalFrames - 1;
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
			this.position = 0;
		else
		{
			var animStart = animObj.start || 0;
			this.position = animStart < 0 ? Math.random() * this.duration : animStart;
		}

		this.clip.elapsedTime = this.startTime + this.position;
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
	};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	AdvancedMovieClipInstance.test = function(clip)
	{
		return clip instanceof AdvancedMovieClip;
	};

	/**
	 * Checks if animation exists
	 *
	 * @method hasAnimation
	 * @static
	 * @param {*} clip The clip to check for an animation.
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @return {Boolean} does this animation exist?
	 */
	AdvancedMovieClipInstance.hasAnimation = function(clip, event)
	{
		//the wildcard event plays the entire timeline
		if (event == "*")
		{
			return true;
		}

		var labels = clip.getLabels();
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
	AdvancedMovieClipInstance.getDuration = function(clip, event)
	{
		//make sure the movieclip has a framerate
		if (!clip.framerate)
		{
			clip.framerate = Application.instance.options.fps || 15;
		}

		//the wildcard event plays the entire timeline
		if (event == "*")
		{
			return clip.totalFrames / clip.framerate;
		}

		var labels = clip.getLabels();
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

	// Assign to namespace
	namespace('springroll.pixi').AdvancedMovieClipInstance = AdvancedMovieClipInstance;

}());
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	var TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip');

	/**
	 * Internal class for loading and instantiating an AdvancedMovieClip.
	 * @class AdvancedMovieClipTask
	 * @extends springroll.TextureAtlasTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type This must be "pixi" to signify that this asset should be
	 *                            handled as an AdvancedMovieClip, instead of the otherwise
	 *                            identical BitmapMovieClip.
	 * @param {String} asset.anim Path to the JSON configuration for AdvancedMovieClip
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var AdvancedMovieClipTask = function(asset)
	{
		TextureAtlasTask.call(this, asset, asset.anim);

		/**
		 * The AdvancedMovieClip data source path
		 * @property {String} anim
		 */
		this.anim = this.filter(asset.anim);
	};

	// Reference to prototype
	var p = TextureAtlasTask.extend(AdvancedMovieClipTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	AdvancedMovieClipTask.test = function(asset)
	{
		return !!asset.anim && TextureAtlasTask.test(asset);
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
			var clip = new AdvancedMovieClip(results._anim, textureAtlas);
			//override destroy on clip to destroy textureAtlas as well
			clip.__AMC_destroy = clip.destroy;
			clip.destroy = function()
			{
				clip.__AMC_destroy();
				textureAtlas.destroy();
			};
			callback(clip, results);
		}, true);
	};

	// Assign to namespace
	namespace('springroll.pixi').AdvancedMovieClipTask = AdvancedMovieClipTask;

}());
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires Core, PIXI Display
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	 * See {{#crossLink "springroll.Animator"}}{{/crossLink}}
	 * @class Animator
	 * @deprecated since version 0.4.0
	 */
	var Animator = namespace('springroll').Animator = namespace('springroll.pixi').Animator = {};

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
		if (true) console.warn('Animator.instanceHasAnimation() is now deprecated, please use the app.animator.instanceHasAnimation()');
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