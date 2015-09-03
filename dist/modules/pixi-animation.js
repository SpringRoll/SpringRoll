/*! SpringRoll 0.4.0-alpha */
/**
 * @module PIXI Animation
 * @namespace springroll
 * @requires  Core, PIXI Display
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
		this.assetManager.register('springroll.pixi.SpineAtlasTask', 40);
		this.assetManager.register('springroll.pixi.SpineAnimTask', 40);
		
		this.animator.register('springroll.pixi.AdvancedMovieClipInstance', 10);
		this.animator.register('springroll.pixi.SpineInstance', 10);
	};

}());
/**
 * @module Pixi Animation
 * @namespace springroll.pixi
 * @requires Core, Pixi Display
 */
(function(undefined) {

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
			if(value > 0)
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
			if(this._t > this._duration)
				this._t = this._duration;
			//add a tiny amount to stop floating point errors in their tracks
			this.currentFrame = Math.floor(this._t * this._framerate + 0.0000001);
			if(this.currentFrame >= this._textures.length)
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
		if(pos >= this._textures.length)
			pos = this._textures.length - 1;
		this.currentFrame = pos;
		if(this._framerate > 0)
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
		if(this._framerate > 0 && time)
		{
			this._t += time * 0.001;//milliseconds -> seconds
			if(this._t > this._duration)
				this._t = this._duration;
			//add a tiny amount to stop floating point errors in their tracks
			this.currentFrame = Math.floor(this._t * this._framerate + 0.0000001);
			if(this.currentFrame >= this._textures.length)
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
			var positions = {}, position;

			for(name in data.labels)
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
		for(var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];
			
			name = frameSet.name;
			index = name.lastIndexOf("/");
			//strip off any folder structure included in the name
			if(index >= 0)
				name = name.substring(index + 1);
			
			if(atlas)
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
		if(data.fps)
			this.framerate = data.fps;
		else if(this._framerate)
			this.framerate = this._framerate;
		if(data.origin)
		{
			this.pivot.x = data.origin.x;
			this.pivot.y = data.origin.y;
		}
		else
		{
			this.pivot.x =  this.pivot.y = 0;
		}
		
		this.gotoAndStop(0);
	};

	function labelSorter(a, b)
	{
		return a.position - b.position;
	}
	
	function getFrames(name, numberMin, numberMax, maxDigits, outArray)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		if(!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
		var zeros = [];//preceding zeroes array
		var compares = [];//powers of 10 array for determining how many preceding zeroes to use
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
		var compareLength = compares.length;//the length of the compare
		
		//the previous Texture, so we can place the same object in multiple times to control
		//animation rate
		var prevTex;
		var len;
		var fromFrame = Texture.fromFrame;
		for(i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
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
			
			//If the texture doesn't exist, use the previous texture - this should allow us to use
			//fewer textures that are in fact the same, if those textures were removed before
			//making the spritesheet
			var texName = name.replace("#", num);
			var tex = fromFrame(texName, true);
			if(tex)
				prevTex = tex;
			if(prevTex)
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
 * @module Animation
 * @namespace springroll
 * @requires Core
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
	var p = AnimatorInstance.extend(AdvancedMovieClipInstance, AnimatorInstance);

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
	};
	
	p.beginAnim = function(animObj, isRepeat)
	{
		//calculate frames, duration, etc
		//then gotoAndPlay on the first frame
		var anim = this.currentName = animObj.anim;
		
		var l, first = -1,
			last = -1,
			loop = false;
		
		if(anim == "*")
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
		if(isRepeat)
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
		if(event == "*")
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
		if(event == "*")
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
 * @module Pixi Animation
 * @namespace springroll.pixi
 * @requires Core, Pixi Display
 */
(function()
{
	var TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip');

	/**
	 * Internal class for dealing with async load assets through Loader.
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
		 * The AdvancedMovieclip data source path
		 * @property {String} anim
		 */
		this.anim = this.filter(asset.anim);
	};

	// Reference to prototype
	var p = extend(AdvancedMovieClipTask, TextureAtlasTask);

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
		this.loadAtlas({ _anim: this.anim }, function(textureAtlas, results)
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
 * @requires  Core, Animation, PIXI Display
 */
(function()
{
	/**
	 * Class for assisting in creating an array of Spine animations to play at the same time
	 * on one skeleton through Animator. Concurrent animations will play until one non-looping
	 * animation ends.
	 *
	 * @class ParallelSpineData
	 * @constructor
	 * @param {String} anim The name of the animation on the skeleton.
	 * @param {Boolean} [loop=false] If this animation should loop.
	 * @param {Number} [speed=1] The speed at which this animation should be played.
	 */
	var ParallelSpineData = function(anim, loop, speed)
	{
		this.anim = anim;
		this.loop = !!loop;
		this.speed = speed > 0 ? speed : 1;
	};
	
	// Assign to namespace
	namespace("springroll.pixi").ParallelSpineData = ParallelSpineData;

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
	var Spine = include('PIXI.spine.Spine', false);
	var ParallelSpineData = include('springroll.pixi.ParallelSpineData');
	
	if(!Spine) return;
	
	/**
	 * The plugin for working with Spine skeletons and animator
	 * @class SpineInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 */
	var SpineInstance = function()
	{
		AnimatorInstance.call(this);
		
		this.prevPosition = 0;
	};

	// Reference to the prototype
	var p = AnimatorInstance.extend(SpineInstance, AnimatorInstance);

	/**
	 * The initialization method
	 * @method init
	 * @param  {*} clip The movieclip
	 */
	p.init = function(clip)
	{
		//we don't want Spine animations to advance every render, only when Animator tells them to
		clip.autoUpdate = false;
		
		this.clip = clip;
		this.isLooping = false;
		this.currentName = null;
		this.position = this.duration = 0;
	};
	
	p.beginAnim = function(animObj, isRepeat)
	{
		var spineState = this.clip.state;
		spineState.clearTracks();
		var skeletonData = this.clip.stateData.skeletonData;

		this.isLooping = !!animObj.loop;
		
		var anim = this.currentName = animObj.anim;
		if(typeof anim == "string")
		{
			//single anim
			this.duration = skeletonData.findAnimation(anim).duration;
			spineState.setAnimationByName(0, anim, this.isLooping);
		}
		else //if(Array.isArray(anim))
		{
			var i;
			//concurrent spine anims
			if(anim[0] instanceof ParallelSpineData)
			{
				//this.spineSpeeds = new Array(anim.length);
				this.duration = 0;
				var maxDuration = 0, maxLoopDuration = 0, duration;
				for(i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					spineState.setAnimationByName(i, anim[i].anim, animLoop);
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
					/*if (anim[i].speed > 0)
						this.spineSpeeds[i] = anim[i].speed;
					else
						this.spineSpeeds[i] = 1;*/
				}
				//set the duration to be the longest of the non looping animations
				//or the longest loop if they all loop
				this.duration = maxDuration || maxLoopDuration;
			}
			//list of sequential spine anims
			else
			{
				this.duration = skeletonData.findAnimation(anim[0]).duration;
				if(anim.length == 1)
				{
					spineState.setAnimationByName(0, anim[0], this.isLooping);
				}
				else
				{
					spineState.setAnimationByName(0, anim[0], false);
					for(i = 1; i < anim.length; ++i)
					{
						spineState.addAnimationByName(0, anim[i],
							this.isLooping && i == anim.length - 1);
						this.duration += skeletonData.findAnimation(anim[i]).duration;
					}
				}
			}
		}
		
		if(isRepeat)
			this.position = 0;
		else
		{
			var animStart = animObj.start || 0;
			this.position = animStart < 0 ? Math.random() * this.duration : animStart;
		}
		
		this.clip.update(this.position);
	};
	
	/**
	 * Ends animation playback.
	 * @method endAnim
	 */
	p.endAnim = function()
	{
		this.clip.update(this.duration - this.position);
	};
	
	/**
	 * Updates position to a new value, and does anything that the clip needs, like updating
	 * timelines.
	 * @method setPosition
	 * @param  {Number} newPos The new position in the animation.
	 */
	p.setPosition = function(newPos)
	{
		if(newPos < this.position)
			this.clip.update(this.duration - this.position + newPos);
		else
			this.clip.update(newPos - this.position);
		this.position = newPos;
	};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	SpineInstance.test = function(clip)
	{
		return clip instanceof Spine;
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
	SpineInstance.hasAnimation = function(clip, anim)
	{
		var i;
		var skeletonData = clip.stateData.skeletonData;
		if(typeof anim == "string")
		{
			//single anim
			return !!skeletonData.findAnimation(anim);
		}
		else if(Array.isArray(anim))
		{
			//concurrent spine anims
			if(anim[0] instanceof ParallelSpineData)
			{
				for(i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if(!skeletonData.findAnimation(anim[i].anim))
						return false;
				}
			}
			//list of sequential spine anims
			else
			{
				for(i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if(!skeletonData.findAnimation(anim[i]))
						return false;
				}
			}
			return true;
		}
		return false;
	};

	/**
	 * Calculates the duration of an animation or list of animations.
	 * @method getDuration
	 * @static
	 * @param  {*} clip The clip to check.
	 * @param  {String} event The animation or animation list.
	 * @return {Number} Animation duration in milliseconds.
	 */
	SpineInstance.getDuration = function(clip, event)
	{
		var i;
		var skeletonData = this.clip.stateData.skeletonData;
		if(typeof anim == "string")
		{
			//single anim
			return skeletonData.findAnimation(anim).duration;
		}
		else if(Array.isArray(anim))
		{
			var duration = 0;
			//concurrent spine anims
			if(anim[0] instanceof ParallelSpineData)
			{
				var maxDuration = 0, maxLoopDuration = 0, tempDur;
				for(i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					tempDur = skeletonData.findAnimation(anim[i].anim).duration;
					if(animLoop)
					{
						if(tempDur > maxLoopDuration)
							maxLoopDuration = tempDur;
					}
					else
					{
						if(tempDur > maxDuration)
							maxDuration = tempDur;
					}
				}
				//set the duration to be the longest of the non looping animations
				//or the longest loop if they all loop
				duration = maxDuration || maxLoopDuration;
			}
			//list of sequential spine anims
			else
			{
				duration = skeletonData.findAnimation(anim[0]).duration;
				if(anim.length > 1)
				{
					for(i = 1; i < anim.length; ++i)
					{
						duration += skeletonData.findAnimation(anim[i]).duration;
					}
				}
			}
			return duration;
		}
		return 0;
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
	namespace('springroll.pixi').SpineInstance = SpineInstance;

}());
/**
 * @module Pixi Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	var AtlasReader = include('PIXI.spine.SpineRuntime.AtlasReader', false),
		AtlasPage = include('PIXI.spine.SpineRuntime.AtlasPage', false),
		AtlasRegion = include('PIXI.spine.SpineRuntime.AtlasRegion', false),
		Atlas = include('PIXI.spine.SpineRuntime.Atlas', false);
	
	if(!AtlasReader) return;
	
	/**
	 * Handles an atlas exported from Spine. This class is created during Spine loading, and
	 * should probably never be used on its own. Code in this class is pulled from
	 * https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/Atlas.js
	 *
	 * @class SpineAtlas
	 * @constructor
	 * @param {String} atlasText The Spine Atlas data
	 * @param {Object} textureDictionary All of the images required by the atlas.
	 */
	var SpineAtlas = function(atlasText, textureDictionary)
	{
		this.pages = [];
		this.regions = [];
		
		if(!atlasText) return;
		
		var reader = new AtlasReader(atlasText);
		var tuple = [];
		tuple.length = 4;
		var page = null;
		while (true)
		{
			var line = reader.readLine();
			if (line === null) break;
			line = reader.trim(line);
			if (!line.length)
			{
				page = null;
			}
			else if (!page)
			{
				page = new AtlasPage();
				page.name = line;
		
				if (reader.readTuple(tuple) == 2)
				{
					// size is only optional for an atlas packed with an old TexturePacker.
					page.width = parseInt(tuple[0]);
					page.height = parseInt(tuple[1]);
					reader.readTuple(tuple);
				}
				page.format = Atlas.Format[tuple[0]];
		
				reader.readTuple(tuple);
				page.minFilter = Atlas.TextureFilter[tuple[0]];
				page.magFilter = Atlas.TextureFilter[tuple[1]];
		
				var direction = reader.readValue();
				page.uWrap = Atlas.TextureWrap.clampToEdge;
				page.vWrap = Atlas.TextureWrap.clampToEdge;
				if (direction == "x")
					page.uWrap = Atlas.TextureWrap.repeat;
				else if (direction == "y")
					page.vWrap = Atlas.TextureWrap.repeat;
				else if (direction == "xy")
					page.uWrap = page.vWrap = Atlas.TextureWrap.repeat;
		
				page.rendererObject = textureDictionary[line].baseTexture;
		
				this.pages.push(page);
		
			}
			else
			{
				var region = new AtlasRegion();
				region.name = line;
				region.page = page;
		
				region.rotate = reader.readValue() == "true";
		
				reader.readTuple(tuple);
				var x = parseInt(tuple[0]);
				var y = parseInt(tuple[1]);
		
				reader.readTuple(tuple);
				var width = parseInt(tuple[0]);
				var height = parseInt(tuple[1]);
		
				region.u = x / page.width;
				region.v = y / page.height;
				if (region.rotate)
				{
					region.u2 = (x + height) / page.width;
					region.v2 = (y + width) / page.height;
				}
				else
				{
					region.u2 = (x + width) / page.width;
					region.v2 = (y + height) / page.height;
				}
				region.x = x;
				region.y = y;
				region.width = Math.abs(width);
				region.height = Math.abs(height);
		
				if (reader.readTuple(tuple) == 4)
				{
					// split is optional
					region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
		
					if (reader.readTuple(tuple) == 4)
					{
						// pad is optional, but only present with splits
						region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
						
						reader.readTuple(tuple);
					}
				}
		
				region.originalWidth = parseInt(tuple[0]);
				region.originalHeight = parseInt(tuple[1]);
		
				reader.readTuple(tuple);
				region.offsetX = parseInt(tuple[0]);
				region.offsetY = parseInt(tuple[1]);
		
				region.index = parseInt(reader.readValue());
		
				this.regions.push(region);
			}
		}
	};
	
	// Extend Object
	var p = SpineAtlas.prototype = {};
	
	p.findRegion = function(name)
	{
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++)
			if (regions[i].name == name) return regions[i];
		return null;
	};
	
	p.dispose = function()
	{
		var pages = this.pages;
		for (var i = 0, n = pages.length; i < n; i++)
			pages[i].rendererObject.destroy(true);
	};
	
	p.updateUVs = function(page)
	{
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++)
		{
			var region = regions[i];
			if (region.page != page) continue;
			region.u = region.x / page.width;
			region.v = region.y / page.height;
			if (region.rotate)
			{
				region.u2 = (region.x + region.height) / page.width;
				region.v2 = (region.y + region.width) / page.height;
			}
			else
			{
				region.u2 = (region.x + region.width) / page.width;
				region.v2 = (region.y + region.height) / page.height;
			}
		}
	};
	
	/**
	 * Adds a standalone image as a page and region
	 * @method addImage
	 * @param  {String} name The name of the texture, so it can get recognized by the Spine
	 *                       skeleton data.
	 * @param  {PIXI.Texture} texture The loaded texture for the image to add.
	 */
	p.addImage = function(name, texture)
	{
		var page = new AtlasPage();
		page.name = name;
		page.width = texture.width;
		page.height = texture.height;
		//shouldn't really be relevant in Pixi
		page.format = "RGBA8888";
		//also shouldn't be relevant in Pixi
		page.minFilter = page.magFilter = "Nearest";
		//use the clamping defaults
		page.uWrap = Atlas.TextureWrap.clampToEdge;
		page.vWrap = Atlas.TextureWrap.clampToEdge;
		//set the texture
		page.rendererObject = texture.baseTexture;
		//keep page
		this.pages.push(page);
		
		//set up the region
		var region = new AtlasRegion();
		region.name = name;
		region.page = page;
		region.rotate = false;
		//region takes up the full image
		region.u = region.v = 0;
		region.u2 = region.v2 = 1;
		region.x = region.y = 0;
		region.originalWidth = region.width = page.width;
		region.originalHeight = region.height = page.height;
		region.offsetX = region.offsetY = 0;
		//no index
		region.index = -1;
		//keep region
		this.regions.push(region);
	};
	
	/**
	 * Sets up this SpineAtlas from an instance of our TextureAtlas class to allow for
	 * the use of atlases exported from TexturePacker.
	 * @method fromTextureAtlas
	 * @param  {springroll.pixi.TextureAtlas} atlas The atlas to generate from
	 * @param {String} [name] The name to use for the name of the singular AtlasPage.
	 */
	p.fromTextureAtlas = function(atlas, name)
	{
		var page = new AtlasPage();
		page.name = name;
		page.width = atlas.baseTexture.width;
		page.height = atlas.baseTexture.height;
		//shouldn't really be relevant in Pixi
		page.format = "RGBA8888";
		//also shouldn't be relevant in Pixi
		page.minFilter = page.magFilter = "Nearest";
		//use the clamping defaults
		page.uWrap = Atlas.TextureWrap.clampToEdge;
		page.vWrap = Atlas.TextureWrap.clampToEdge;
		//set the texture
		page.rendererObject = atlas.baseTexture;
		//keep page
		this.pages.push(page);
		
		for(name in atlas.frames)
		{
			var frame = atlas.frames[name];
			var region = new AtlasRegion();
			region.name = name;
			region.page = page;
			region.rotate = frame.rotate;
			//figure out region coordinates
			var x = frame.crop.x;
			var y = frame.crop.y;
	
			var width = frame.crop.width;
			var height = frame.crop.height;
	
			region.u = x / page.width;
			region.v = y / page.height;
			if (region.rotate)
			{
				region.u2 = (x + height) / page.width;
				region.v2 = (y + width) / page.height;
			}
			else
			{
				region.u2 = (x + width) / page.width;
				region.v2 = (y + height) / page.height;
			}
			region.x = x;
			region.y = y;
			region.width = Math.abs(width);
			region.height = Math.abs(height);
	
			region.originalWidth = frame.width;
			region.originalHeight = frame.height;
	
			if(frame.trim)
			{
				region.offsetX = frame.trim.x;
				region.offsetY = frame.trim.y;
			}
			else
				region.offsetX = region.offsetY = 0;
			//no index
			region.index = -1;
			//keep region
			this.regions.push(region);
		}
	};

	/**
	 * Destroys the SpineAtlas by nulling the image and frame dictionary references.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.dispose();
		this.pages = this.regions = null;
	};

	namespace("springroll.pixi").SpineAtlas = SpineAtlas;
}());
/**
 * @module Pixi Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		SpineAtlas = include('springroll.pixi.SpineAtlas', false),
		PixiUtils = include('PIXI.utils');
	
	if(!SpineAtlas) return;

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class SpineAtlasTask
	 * @extends springroll.pixi.TextureTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} asset.spineAtlas The Spine Atlas source data url - a .txt or .atlas file.
	 * @param {Object} asset.images A number of Texture assets, as referenced by the Atlas data.
	 *                              The property used to index each asset in asset.images should be
	 *                              the file name used in the Atlas data.
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var SpineAtlasTask = function(asset, fallbackId)
	{
		TextureTask.call(this, asset, fallbackId || asset.spineAtlas);

		/**
		 * The Spine Atlas data source path
		 * @property {String} spineAtlas
		 */
		this.spineAtlas = this.filter(asset.spineAtlas);
		
		this.images = asset.images;
	};

	// Reference to prototype
	var p = extend(SpineAtlasTask, TextureTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SpineAtlasTask.test = function(asset)
	{
		// atlas data and one or more images or color/alpha splits
		return !!asset.spineAtlas &&
				Array.isArray(asset.images) &&
				TextureTask.test(asset.images[0]);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.load({_atlas: this.spineAtlas, _images: this.images}, function(results)
		{
			callback(new SpineAtlas(results._atlas, results._images), results);
		});
	};

	// Assign to namespace
	namespace('springroll.pixi').SpineAtlasTask = SpineAtlasTask;

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		atlasParser = include('PIXI.spine.loaders.atlasParser', false),
		SkeletonJsonParser = include('PIXI.spine.SpineRuntime.SkeletonJsonParser', false),
		AtlasAttachmentParser = include('PIXI.spine.SpineRuntime.AtlasAttachmentParser', false),
		SpineAtlasTask = include('springroll.pixi.SpineAtlasTask', false),
		SpineAtlas = include('springroll.pixi.SpineAtlas', false);
	
	if(!atlasParser) return;

	/**
	 * SpineAnimTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
	 * @class SpineAnimTask
	 * @constructor
	 * @private
	 * @param {String} asset.spineAnim The Spine skeleton data image path.
	 * @param {Object} asset.atlas The atlas for the skeleton. This can be a Pixi TextureAtlas
	 *                                  asset or a Spine specific atlas.
	 * @param {String} asset.atlas.type Must be "pixi" to ensure that the atlas is loaded for Pixi.
	 * @param {String} [asset.atlas.atlas] (TextureAtlas) The source data path for a TextureAtlas.
	 * @param {String} [asset.atlas.image] (TextureAtlas) A image path for a TextureAtlas
	 * @param {String} [asset.atlas.color] (TextureAtlas) The color image path, if not using image
	 *                                     property
	 * @param {String} [asset.atlas.alpha] (TextureAtlas) The alpha image path, if not using image
	 *                                     property
	 * @param {String} [asset.atlas.spineAtlas] (Spine Atlas) The source data path for an atlas
	 *                                          exported from Spine, with a .txt or .atlas
	 *                                          extension.
	 * @param {Array} [asset.atlas.images] (Spine Atlas) A set of image paths for the spineAtlas
	 *                                     data file to pull from.
	 * @param {Object} [asset.extraImages] A dictionary of extra Texture assets to add to the atlas.
	 *                                     This should be useful if you have individual images not
	 *                                     added to a TextureAtlas.
	 * @param {Boolean} [asset.cache=false] If we should cache the result - caching results in
	 *                                      caching in the global Pixi texture cache as well as
	 *                                      Application's asset cache.
	 * @param {String} [asset.id] The id of the task.
	 * @param {Function} [asset.complete] The callback to call when the load is completed.
	 */
	var SpineAnimTask = function(asset)
	{
		Task.call(this, asset, asset.spineAnim);

		/**
		 * The skeleton data source path
		 * @property {String} spineAnim
		 */
		this.spineAnim = this.filter(asset.spineAnim);

		/**
		 * The spine atlas data source path
		 * @property {String} atlas
		 */
		this.atlas = asset.atlas;
		
		/**
		 * Extra images to be added to the atlas
		 * @property {String} extraImages
		 */
		this.extraImages = asset.extraImages;
	};

	// Extend the base Task
	var p = extend(SpineAnimTask, Task);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	SpineAnimTask.test = function(asset)
	{
		//anim data is required
		if(!asset.spineAnim)
			return false;
		//if atlas exists, make sure it is a valid atlas
		if(asset.atlas &&
			!(TextureAtlasTask.test(asset.atlas) || SpineAtlasTask.test(asset.atlas)))
			return false;
		//if atlas does not exist, extraImages is required
		if(!asset.atlas)
			return !!asset.extraImages;
		//if it made it this far, it checks out
		return true;
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		var asset = {_anim: this.spineAnim};
		if(this.atlas)
			asset._atlas = this.atlas;
		if(this.extraImages)
			asset._images = {assets:this.extraImages};
		
		this.load(asset, function(results)
		{
			var spineAtlas = results._atlas;
			//if we didn't load an atlas, then should make an atlas because we were probably
			//loading individual images
			if(!spineAtlas)
				spineAtlas = new SpineAtlas();
			//if a TextureAtlas was loaded, make a SpineAtlas out of it
			if(!(spineAtlas instanceof SpineAtlas))
			{
				var textureAtlas = spineAtlas;
				spineAtlas = new SpineAtlas();
				spineAtlas.fromTextureAtlas(textureAtlas);
			}
			//see if we need to add in any individual images
			if(results._images)
			{
				for(var name in results._images)
				{
					spineAtlas.addImage(name, results._images[name]);
				}
			}

			// spine animation
			var spineJsonParser = new SkeletonJsonParser(new AtlasAttachmentParser(spineAtlas));
			var skeletonData = spineJsonParser.readSkeletonData(results._anim);
			
			//store both the atlas and the skeleton data for later cleanup
			var asset = {
				id: this.id,
				spineData: skeletonData,
				spineAtlas: spineAtlas
			};
			//store the skeletonData in the external cache, for standardization
			if (atlasParser.enableCaching && this.cache)
				atlasParser.AnimCache[this.id] = skeletonData;
			
			//set up a destroy function for cleanly unloading the asset (in particular the atlas)
			asset.destroy = function()
			{
				//remove from external cache
				delete atlasParser.AnimCache[this.id];
				//destroy atlas
				this.spineAtlas.destroy();
				//destroy skeleton data - skeleton data is just a bunch of organized arrays
				//of spine runtime objects, no display objects or anything
				this.spineData = this.spineAtlas = null;
			};
			
			//return the asset object
			callback(asset, results);
		}.bind(this));
	};

	/**
	 * Destroy this load task and don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
	};

	// Assign to the namespace
	namespace('springroll.pixi').SpineAnimTask = SpineAnimTask;

}());
(function()
{
	var Application = include('springroll.Application');

	/**
	 * @class Animator
	 * @namespace springroll.pixi
	 * @see {@link springroll.Animator}
	 * @deprecated since version 0.4.0
	 */
	var Animator = namespace('springroll').Animator = namespace('springroll.pixi').Animator = {};

	/**
	 * @method
	 * @name springroll.pixi.Animator#canAnimate
	 * @see {@link springroll.Animator#canAnimate}
	 * @deprecated since version 0.4.0
	 */
	Animator.canAnimate = function(instance)
	{
		if (true) console.warn('Animator.canAnimate() is now deprecated, please use the app.animator.canAnimate()');
		return Application.instance.animator.canAnimate(instance);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getDuration
	 * @see {@link springroll.Animator#getDuration}
	 * @deprecated since version 0.4.0
	 */
	Animator.getDuration = function(instance, event)
	{
		if (true) console.warn('Animator.getDuration() is now deprecated, please use the app.animator.getDuration()');
		return Application.instance.animator.getDuration(instance, event);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getTimeline
	 * @see {@link springroll.Animator#getTimeline}
	 * @deprecated since version 0.4.0
	 */
	Animator.getTimeline = function(instance)
	{
		if (true) console.warn('Animator.getTimeline() is now deprecated, please use the app.animator.getTimeline()');
		return Application.instance.animator.getTimeline(instance);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#instanceHasAnimation
	 * @see {@link springroll.Animator#instanceHasAnimation}
	 * @deprecated since version 0.4.0
	 */
	Animator.instanceHasAnimation = function(instance, event)
	{
		if (true) console.warn('Animator.instanceHasAnimation() is now deprecated, please use the app.animator.instanceHasAnimation()');
		return Application.instance.animator.hasAnimation(instance, event);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#pauseInGroup
	 * @see {@link springroll.Animator#pauseInGroup}
	 * @deprecated since version 0.4.0
	 */
	Animator.pauseInGroup = function(paused, container)
	{
		if (true) console.warn('Animator.pauseInGroup() is now deprecated, please use the app.animator.pauseInGroup()');
		Application.instance.animator.pauseInGroup(paused, container);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#resume
	 * @see {@link springroll.Animator#resume}
	 * @deprecated since version 0.4.0
	 */
	Animator.resume = function()
	{
		if (true) console.warn('Animator.resume() is now deprecated, please use the app.animator.resume()');
		Application.instance.animator.resume();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#stopAll
	 * @see {@link springroll.Animator#stopAll}
	 * @deprecated since version 0.4.0
	 */
	Animator.stopAll = function(container, removeCallbacks)
	{
		if (true) console.warn('Animator.stopAll() is now deprecated, please use the app.animator.stopAll()');
		Application.instance.animator.stopAll(container, removeCallbacks);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#destroy
	 * @see {@link springroll.Animator#destroy}
	 * @deprecated since version 0.4.0
	 */
	Animator.destroy = function()
	{
		if (true) console.warn('Animator.destroy() is now deprecated, please use the app.animator.destroy()');
		Application.instance.animator.destroy();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getPaused
	 * @see {@link springroll.Animator#paused}
	 * @deprecated since version 0.4.0
	 */
	Animator.getPaused = function(instance)
	{
		if (true) console.warn('Animator.getPaused() is now deprecated, please use the app.animator.paused');
		return Application.instance.animator.paused;
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#init
	 * @see {@link springroll.Animator#init}
	 * @deprecated since version 0.4.0
	 */
	Animator.init = function()
	{
		if (true) console.warn('Animator.init() is now deprecated, please use the app.animator property');
		return Application.intance.animator;
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#pause
	 * @see {@link springroll.Animator#pause}
	 * @deprecated since version 0.4.0
	 */
	Animator.pause = function()
	{
		if (true) console.warn('Animator.pause() is now deprecated, please use the app.animator.pause()');
		Application.instance.animator.pause();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#play
	 * @see {@link springroll.Animator#play}
	 * @deprecated since version 0.4.0
	 */
	Animator.play = function(instance, eventList, onComplete, onCancelled)
	{
		if (true) console.warn('Animator.play() is now deprecated, please use the app.animator.play');
		return Application.instance.animator.play(instance, eventList, onComplete, onCancelled);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#stop
	 * @see {@link springroll.Animator#stop}
	 * @deprecated since version 0.4.0
	 */
	Animator.stop = function(instance, removeCallbacks)
	{
		if (true) console.warn('Animator.stop() is now deprecated, please use the app.animator.stop()');
		Application.instance.animator.stop(instance, removeCallbacks);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#toString
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
		 * @property
		 * @name springroll.pixi.Animator#captions
		 * @see {@link springroll.Animator#captions}
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
		 * @property
		 * @name springroll.pixi.Animator#debug
		 * @see {@link springroll.Animator#debug}
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