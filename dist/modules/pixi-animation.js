/*! SpringRoll 0.4.0 */
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
 * @module Pixi Animation
 * @namespace springroll.pixi
 * @requires Core, Pixi Display
 */
(function()
{
	var TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip'),
		Application = include('springroll.Application');

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
		PixiUtils = include('PIXI.utils'),
		Application = include('springroll.Application');
	
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
		Application.instance.load({_atlas: this.spineAtlas, _images: this.images}, function(results)
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
	var Application = include('springroll.Application'),
		Task = include('springroll.Task'),
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
		
		Application.instance.load(asset, function(results)
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
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
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
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	var Spine = include('PIXI.spine.Spine', false),
		AnimationState = include('PIXI.spine.AnimationState', false),
		ParallelSpineData = include('springroll.pixi.ParallelSpineData'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip');
	
	/**
	 * Internal Animator class for keeping track of animations. AnimatorTimelines are pooled
	 * internally, so please only keep references to them while they are actively playing an
	 * animation.
	 *
	 * @class AnimatorTimeline
	 * @constructor
	 * @private
	 * @param {PIXI.MovieClip|Pixi.Spine} clip The AnimatorTimeline's clip
	 * @param {Function} callback The function to call when the clip is finished playing
	 * @param {Number} speed The speed at which the clip should be played
	 * @param {Function} cancelledCallback The function to call if the clip's playback is
	 *                                   interrupted.
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
	 *                                   interrupted.
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
		this.isSpine = Spine && clip instanceof Spine;
		
		//we don't want Spine animations to advance every render, only when Animator tells them to
		if(this.isSpine)
			clip.autoUpdate = false;

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
		 * The frame number of the last frame of the current animation.
		 *
		 * @property {int} lastFrame
		 */
		this.lastFrame = -1;
		
		/**
		 * The start time of the current animation on the movieclip's timeline.
		 * @property {Number} startTime
		 * @public
		 */
		this.startTime = 0;

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
		 * If this timeline plays captions
		 *
		 * @property {Boolean} useCaptions
		 * @readOnly
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
		var repeat = false;
		//if on a looping animation, set up the animation to be replayed
		// - this will only happen on looping animations with audio
		if(this.isLooping)
		{
			//if sound is playing, we need to stop it immediately
			//otherwise it can interfere with replaying the audio
			if(this.soundInst)
				this.soundInst.stop();
			//say that we are repeating, so that we start at the beginning of the loop
			//in case it started part way in
			repeat = true;
		}
		else
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
		}
		var i, skeletonData;
		//take action based on the type of item in the list
		var listItem = this.eventList[this.listIndex];
		switch(typeof listItem)
		{
			case "object":
				var animStart = 0;
				this.isAnim = true;
				var anim = listItem.anim, clip = this.clip;
				this.isLooping = !!listItem.loop;
				this.speed = listItem.speed > 0 ? listItem.speed : 1;
				var spineState;
				if(Spine && clip instanceof Spine)
				{
					spineState = clip.state;
					spineState.clearTracks();
				}
				if(typeof anim == "string")
				{
					if(Spine && clip instanceof Spine)
					{
						//single spine anim
						this.duration = clip.stateData.skeletonData.findAnimation(anim).duration;
						spineState.clearTracks();
						spineState.setAnimationByName(0, anim, this.isLooping);
					}
					else
					{
						//AdvancedMovieClip
						this.lastFrame = listItem.last;
						var length = listItem.last - listItem.first;
						var fps = clip.framerate;
						this.startTime = listItem.first / fps;
						this.duration = length / fps;
						this.speed = listItem.speed;
						this.isLooping = listItem.loop;
					}
				}
				else //if(Array.isArray(anim))
				{
					//concurrent spine anims
					if(anim[0] instanceof ParallelSpineData)
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
							s.setAnimationByName(i, anim[i].anim, animLoop);
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
						skeletonData = clip.stateData.skeletonData;
						this.duration = skeletonData.findAnimation(anim[0]).duration;
						if(anim.length == 1)
						{
							state.setAnimationByName(0, anim[0], this.isLooping);
						}
						else
						{
							state.setAnimationByName(0, anim[0], false);
							for(i = 1; i < anim.length; ++i)
							{
								state.addAnimationByName(0, anim[i],
									this.isLooping && i == anim.length - 1);
								this.duration += skeletonData.findAnimation(anim[i]).duration;
							}
						}
					}
				}
				
				this._time_sec = 0;
				if(!repeat)
				{
					var startTime = typeof listItem.start == "number" ? listItem.start * 0.001 : 0;
					this._time_sec = startTime < 0 ? Math.random() * this.duration : startTime;
				}
				if(clip instanceof AdvancedMovieClip)
					clip.elapsedTime = this.startTime + this._time_sec;
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
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function(undefined)
{
	var Spine = include('PIXI.spine.Spine', false),
		AnimatorTimeline = include('springroll.pixi.AnimatorTimeline'),
		ParallelSpineData = include('springroll.pixi.ParallelSpineData'),
		Application = include('springroll.Application'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip'),
		Sound;

	/**
	 * Animator for interacting with Spine animations
	 * @class Animator
	 * @static
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
	 * The global captions object to use with animator
	 * @property {springroll.Captions} captions
	 * @public
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
	 * @param {springroll.pixi.AdvancedMovieClip|PIXI.spine.Spine} clip The clip to play. Animation
	 *                                                                  options vary depending on
	 *                                                                  object type.
	 * @param {String|Array} animData One of or an array of the following
	 * * objects in the format:
	 *
	 *   {
	 *       anim:<string|array of strings|array of ParallelSpineData>,
	 *       start:0,
	 *       speed:1,
	 *       loop:false,
	 *       audio:{alias:"MyAlias", start:300}
	 *   }
	 *
	 *   * anim is the data about the animation to play. See below for more info
	 *   * start is milliseconds into the animation to start (0 if omitted). A value of -1
	 *       starts from a random time in the animation.
	 *   * speed is a multiplier for the animation speed (1 if omitted).
	 *   * loop is if the animation should loop (false if omitted).
	 *   * audio is audio to sync the animation to using springroll.Sound. audio can be a String
	 *       if you want the audio to start 0 milliseconds into the animation.
	 *   * strings - A single animation to play on a Spine skeleton or AdvancedMovieClip.
	 *   * arrays of strings - An array of animations to play sequentially on a Spine skeleton or
	 *       AdvancedMovieClip.
	 * * arrays of ParallelSpineData - An array of animations to play at the same time on a
	 *   Spine skeleton.
	 * * numbers - milliseconds to wait.
	 * * functions - called upon reaching, followed immediately by the next item.
	 * @param {Function} [onComplete] The function to call once the animation has finished.
	 * @param {Function} [onCancelled] A callback function for when an animation is stopped with
	 *                             Animator.stop() or to play another animation.
	 * @return {springroll.pixi.AnimatorTimeline} The timeline object
	 */
	Animator.play = function(clip, animData, onComplete, onCancelled)
	{
		if(onCancelled === true)
			onCancelled = onComplete;
		
		//ensure that we can play the clip
		if (!Animator.canAnimate(clip))
		{
			if (onComplete) onComplete();
			return;
		}
		
		Animator.stop(clip);
		
		//convert individual items into arrays of properly formatted items
		if(typeof animData == "string")
		{
			animData = [{anim: animData}];
		}
		else if(Array.isArray(animData))
		{
			var firstItem = animData[0];
			if(typeof firstItem == "string" && Spine && clip instanceof Spine)
			{
				animData = [{anim: animData}];
			}
			else if(firstItem instanceof ParallelSpineData)
			{
				animData = [{anim: animData}];
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
	 * Creates the AnimatorTimeline for a given animation
	 *
	 * @method _makeTimeline
	 * @param {springroll.pixi.AdvancedMovieClip|PIXI.spine.Spine} clip The instance to animate
	 * @param {Array} animData List of animation events.
	 * @param {Function} callback The function to callback when we're done
	 * @param {Function} cancelledCallback The function to callback when cancelled
	 * @return {springroll.pixi.AnimatorTimeline} The Timeline object
	 * @private
	 * @static
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
			//convert strings into object to attach more data to
			if(typeof data == "string")
			{
				anim = data;
				audio = null;
			}
			else
			{
				anim = data.anim;
				audio = data.audio;
			}
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
			//AdvancedMovieClip
			else if (typeof anim == "string")
			{
				//go through the list of labels (they are sorted by frame number)
				var stopLabel = anim + "_stop";
				var loopLabel = anim + "_loop";
	
				var l,
					first = -1,
					last = -1,
					loop = false,
					labels = clip.getLabels();
				for (j = 0, length = labels.length; j < length; ++j)
				{
					l = labels[j];
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
				if (first >= 0 && last > 0)
				{
					data = {
						anim: anim,
						first: first,
						last: last,
						loop: loop,
						speed: data.speed || 1,
						start: data.start || 0
					};
				}
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
					Sound.instance.preload(alias);
					data.alias = alias;
					data.audioStart = start;
				
					data.useCaptions = Animator.captions && Animator.captions.hasCaption(alias);
				}
			}
		}
		
		return t;
	};
	
	/**
	 * Determines if a given instance can be animated by Animator.
	 * @method canAnimate
	 * @param {PIXI.DisplayObject} instance The object to check for animation properties.
	 * @return {Boolean} If the instance can be animated or not.
	 * @static
	 */
	Animator.canAnimate = function(instance)
	{
		if(!instance)
			return false;
		//check for instance of Spine, MovieClip
		if((Spine && instance instanceof Spine) || instance instanceof AdvancedMovieClip)
			return true;
		return false;
	};
	
	/**
	 * Get duration of animation (or sequence of animations) in seconds
	 *
	 * @method getDuration
	 * @param {springroll.pixi.AdvancedMovieClip|PIXI.spine.Spine} clip The display object that
	 *                                                                  the animation matches.
	 * @param {String|Array} animData The animation data or array, in the format that play() uses.
	 * @public
	 * @static
	 *	@return {Number} Duration of animation event in milliseconds
	 */
	Animator.getDuration = function(clip, animData)
	{
		//calculated in seconds
		var duration = 0;
		
		var j, events;
		//ensure that everything is an array in a useful manner
		if(typeof animData == "string")
		{
			animData = [{anim: animData}];
		}
		else if(Array.isArray(animData))
		{
			var firstItem = animData[0];
			if(typeof firstItem == "string" && Spine && clip instanceof Spine)
			{
				animData = [{anim: animData}];
			}
			else if(firstItem instanceof ParallelSpineData)
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
						if(Spine && clip instanceof Spine)
							duration += clip.stateData.skeletonData.findAnimation(anim).duration;
						//animation for an AdvancedMovieClip
						else
						{
							events = clip.getEvents();
							for(j = 0; j < events.length; ++j)
							{
								if(events[j].name == anim)
								{
									duration += events[j].length * clip.framerate;
									break;
								}
							}
						}
					}
					else //if(Array.isArray(anim))
					{
						//concurrent spine anims
						if(anim[0] instanceof ParallelSpineData)
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
				case "string":
					//animation for an AdvancedMovieClip
					events = clip.getEvents();
					for(j = 0; j < events.length; ++j)
					{
						if(events[j].name == anim)
						{
							duration += events[j].length * clip.framerate;
							break;
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
	 * @param {springroll.pixi.AdvancedMovieClip|PIXI.spine.Spine} instance The animation to
	 *                                                                      search.
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	Animator.instanceHasAnimation = function(instance, anim)
	{
		if (Spine && instance instanceof Spine)
			return checkSpineForAnimation(instance, anim);
		else if(instance instanceof AdvancedMovieClip)
		{
			var events = clip.getEvents();
			for(var j = 0; j < events.length; ++j)
			{
				if(events[j].name == anim)
				{
					return true;
				}
			}
		}
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
						{
							extraTime = t._time_sec - t.duration;
							t._nextItem();
							onNext = true;
						}
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
				else//AdvancedMovieClip
				{
					if (t._time_sec >= t.duration)
					{
						if (t.isLooping && t.listIndex == t.eventList.length - 1)
						{
							extraTime = t._time_sec - t.duration;
							t._nextItem();//reset any audio and such
							//call the on complete function each time
							if (t.onComplete)
								t.onComplete();
							onNext = true;
						}
						else
						{
							extraTime = t._time_sec - t.duration;
							c.gotoAndStop(t.lastFrame);
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
						c.elapsedTime = t.startTime + t._time_sec;
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
				while(t._time_sec >= t.duration)
				{
					extraTime = t._time_sec - t.duration;
					t._nextItem();
					if (t.complete)
					{
						if(t.isAnim)
							updateClip(t, t._time_sec, prevTime);
						_onMovieClipDone(t);
						continue;
					}
					t._time_sec += extraTime;
				}
				
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
				c.update(time - prevTime);
			}
		}
		else
		{
			c.elapsedTime = t.startTime + time;
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
	
	namespace('springroll').Animator = Animator;
	namespace('springroll.pixi').Animator = Animator;
}());
/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.pixi.Animator');

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
		
		Animator.init();
		Animator.captions = this.captions || null;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (Animator) Animator.destroy();
	};

}());