/*! SpringRoll 1.0.3 */
/**
 * @module PIXI Spine
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
		this.assetManager.register('springroll.pixi.SpineAtlasTask', 40);
		this.assetManager.register('springroll.pixi.SpineAnimTask', 40);
		this.animator.register('springroll.pixi.SpineInstance', 10);
	};

}());
/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
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
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function(undefined)
{
	var Application = include("springroll.Application");
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var Spine = include('PIXI.spine.Spine', false);
	var ParallelSpineData = include('springroll.pixi.ParallelSpineData');

	if (!Spine) return;

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
	var p = AnimatorInstance.extend(SpineInstance);

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
		if (typeof anim == "string")
		{
			//single anim
			this.duration = skeletonData.findAnimation(anim).duration;
			spineState.setAnimationByName(0, anim, this.isLooping);
		}
		else //if(Array.isArray(anim))
		{
			var i;
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				//this.spineSpeeds = new Array(anim.length);
				this.duration = 0;
				var maxDuration = 0,
					maxLoopDuration = 0,
					duration;
				for (i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					spineState.setAnimationByName(i, anim[i].anim, animLoop);
					duration = skeletonData.findAnimation(anim[i].anim).duration;
					if (animLoop)
					{
						if (duration > maxLoopDuration)
							maxLoopDuration = duration;
					}
					else
					{
						if (duration > maxDuration)
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
				if (anim.length == 1)
				{
					spineState.setAnimationByName(0, anim[0], this.isLooping);
				}
				else
				{
					spineState.setAnimationByName(0, anim[0], false);
					for (i = 1; i < anim.length; ++i)
					{
						spineState.addAnimationByName(0, anim[i],
							this.isLooping && i == anim.length - 1);
						this.duration += skeletonData.findAnimation(anim[i]).duration;
					}
				}
			}
		}

		if (isRepeat)
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
		if (newPos < this.position)
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
		if (typeof anim == "string")
		{
			//single anim
			return !!skeletonData.findAnimation(anim);
		}
		else if (Array.isArray(anim))
		{
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				for (i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if (!skeletonData.findAnimation(anim[i].anim))
						return false;
				}
			}
			//list of sequential spine anims
			else
			{
				for (i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if (!skeletonData.findAnimation(anim[i]))
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
		if (typeof anim == "string")
		{
			//single anim
			return skeletonData.findAnimation(anim).duration;
		}
		else if (Array.isArray(anim))
		{
			var duration = 0;
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				var maxDuration = 0,
					maxLoopDuration = 0,
					tempDur;
				for (i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					tempDur = skeletonData.findAnimation(anim[i].anim).duration;
					if (animLoop)
					{
						if (tempDur > maxLoopDuration)
							maxLoopDuration = tempDur;
					}
					else
					{
						if (tempDur > maxDuration)
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
				if (anim.length > 1)
				{
					for (i = 1; i < anim.length; ++i)
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
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function(undefined)
{
	var AtlasReader = include('PIXI.spine.SpineRuntime.AtlasReader', false),
		AtlasPage = include('PIXI.spine.SpineRuntime.AtlasPage', false),
		AtlasRegion = include('PIXI.spine.SpineRuntime.AtlasRegion', false),
		Atlas = include('PIXI.spine.SpineRuntime.Atlas', false);

	if (!AtlasReader) return;

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

		if (!atlasText) return;

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
	var p = extend(SpineAtlas);

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

		for (name in atlas.frames)
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

			if (frame.trim)
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
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		SpineAtlas = include('springroll.pixi.SpineAtlas', false),
		PixiUtils = include('PIXI.utils');

	if (!SpineAtlas) return;

	/**
	 * Internal class for loading a texture atlas in the format exported by Spine.
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
	var p = TextureTask.extend(SpineAtlasTask);

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
		this.load(
		{
			_atlas: this.spineAtlas,
			_images: this.images
		}, function(results)
		{
			callback(new SpineAtlas(results._atlas, results._images), results);
		});
	};

	// Assign to namespace
	namespace('springroll.pixi').SpineAtlasTask = SpineAtlasTask;

}());
/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
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

	if (!atlasParser) return;

	/**
	 * SpineAnimTask loads a spine animation and the texture atlas(es) that it needs.
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
	var p = Task.extend(SpineAnimTask);

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
		if (!asset.spineAnim)
			return false;
		//if atlas exists, make sure it is a valid atlas
		if (asset.atlas &&
			!(TextureAtlasTask.test(asset.atlas) || SpineAtlasTask.test(asset.atlas)))
			return false;
		//if atlas does not exist, extraImages is required
		if (!asset.atlas)
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
		var asset = {
			_anim: this.spineAnim
		};
		if (this.atlas)
			asset._atlas = this.atlas;
		if (this.extraImages)
			asset._images = {
				assets: this.extraImages
			};

		this.load(asset, function(results)
		{
			var spineAtlas = results._atlas;
			//if we didn't load an atlas, then should make an atlas because we were probably
			//loading individual images
			if (!spineAtlas)
				spineAtlas = new SpineAtlas();
			//if a TextureAtlas was loaded, make a SpineAtlas out of it
			if (!(spineAtlas instanceof SpineAtlas))
			{
				var textureAtlas = spineAtlas;
				spineAtlas = new SpineAtlas();
				spineAtlas.fromTextureAtlas(textureAtlas);
			}
			//see if we need to add in any individual images
			if (results._images)
			{
				for (var name in results._images)
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