/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var Application = include('springroll.Application'),
		Task = include('springroll.Task'),
		Texture = include('PIXI.Texture'),
		BaseTexture = include('PIXI.BaseTexture'),
		PixiUtils = include('PIXI.utils');
	
	//TODO:
	// atlasParser - primary entry point : https://github.com/pixijs/pixi-spine/blob/master/src/loaders/atlasParser.js
	// Atlas - needs TextureTasks to load : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/Atlas.js
	// AtlasAttachmentParser - provides regions to skeleton parser : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/AtlasAttachmentParser.js
	// SkeletonJsonParser - final step : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/SkeletonJsonParser.js

	/**
	 * SpineAnimTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
	 * @class SpineAnimTask
	 * @constructor
	 * @private
	 * @param {String} asset.spineAnim The Spine skeleton data image path.
	 * @param {String} asset.spineAtlas The Spine atlas data path. TODO - detect JSON vs .atlas here?
	 * @param {Object} asset.images A set of image asset objects to use for the Spine atlas.
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
		 * @property {String} spineAtlas
		 */
		this.spineAtlas = this.filter(asset.spineAtlas);

		/**
		 * A collection of image assets to use as Textures supporting the spine atlas.
		 * @property {Object} images
		 */
		this.images = asset.images;
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
		return asset.forPixi && (!!asset.image || (!!asset.alpha && !!asset.color));
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		this.loadImage({}, callback);
	};

	/**
	 * Load the texture from the properties
	 * @method loadImage
	 * @param {Object} assets The assets object to load
	 * @param {Function} done Callback when complete, returns new TextureAtlas
	 * @param {Boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
	 *                                       because this task is still returning stuff to another
	 *                                       task.
	 */
	p.loadImage = function(assets, done, ignoreCacheSetting)
	{
		if (this.image)
		{
			assets._image = this.image;
		}
		else
		{
			assets._color = this.color;
			assets._alpha = this.alpha;
		}

		// Do the load
		Application.instance.load(assets, function(results)
		{
			var image;
			if (results._image)
			{
				image = results._image;
			}
			else
			{
				image = ColorAlphaTask.mergeAlpha(
					results._color,
					results._alpha
				);
			}
			
			//determine scale using SpringRoll's scale management
			var scale = this.original.scale;
			//if the scale doesn't exist, or is 1, then see if the devs are trying to use Pixi's
			//built in scale recognition
			if(!scale || scale === 1)
			{
				scale = PixiUtils.getResolutionOfUrl(this.image || this.color);
			}
			//create the Texture and BaseTexture
			var texture = new Texture(new BaseTexture(image, null, scale));
			texture.baseTexture.imageUrl = this.image;
			
			if(this.cache && !ignoreCacheSetting)
			{
				//for cache id, prefer task id, but if Pixi global texture cache is using urls, then
				//use that
				var id = this.id;
				//if pixi is expecting URLs, then use the URL
				if(!PixiUtils.useFilenamesForTextures)
				{
					//use color image if regular image is not available
					id = this.image || this.color;
				}
				//also add the frame to Pixi's global cache for fromFrame and fromImage functions
				PixiUtils.TextureCache[id] = texture;
				PixiUtils.BaseTextureCache[id] = texture.baseTexture;
				
				//set up a special destroy wrapper for this texture so that Application.instance.unload
				//works properly to completely unload it
				texture.__T_destroy = texture.destroy;
				texture.destroy = function()
				{
					//destroy the base texture as well
					this.__T_destroy(true);
					
					//remove it from the global texture cache, if relevant
					if(PixiUtils.TextureCache[id] == this)
						delete PixiUtils.TextureCache[id];
				};
			}
			
			done(texture, results);
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