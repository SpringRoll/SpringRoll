/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var ColorAlphaTask = include('springroll.ColorAlphaTask'),
		Task = include('springroll.Task'),
		Texture = include('PIXI.Texture'),
		BaseTexture = include('PIXI.BaseTexture'),
		PixiUtils = include('PIXI.utils'),
		Application = include('springroll.Application');
	var PixiDisplay;

	/**
	 * TextureTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
	 * @class TextureTask
	 * @constructor
	 * @private
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} [asset.image] The texture image path.
	 * @param {String} [asset.color] The color image path, if not using image property.
	 * @param {String} [asset.alpha] The alpha image path, if not using image property.
	 * @param {Boolean} [asset.cache=false] If we should cache the result - caching results in
	 *                                      caching in the global Pixi texture cache as well as
	 *                                      Application's asset cache.
	 * @param {String} [asset.id] The id of the task.
	 * @param {Function} [asset.complete] The callback to call when the load is completed.
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureTask = function(asset, fallbackId)
	{
		if (!PixiDisplay) PixiDisplay = include('springroll.pixi.PixiDisplay');

		Task.call(this, asset, fallbackId || asset.image);

		/**
		 * The atlas source path
		 * @property {String} image
		 */
		this.image = this.filter(asset.image);

		/**
		 * The atlas color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The atlas alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);

		/**
		 * If the texture should be uploaded to the GPU immediately.
		 * @property {Boolean} uploadToGPU
		 */
		this.uploadToGPU = !!asset.uploadToGPU;
	};

	// Extend the base Task
	var p = Task.extend(TextureTask);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	TextureTask.test = function(asset)
	{
		return asset.type == "pixi" && (!!asset.image || (!!asset.alpha && !!asset.color));
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		this.loadImage(
		{}, callback);
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
		this.load(assets, function(results)
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
			if (!scale || scale === 1)
			{
				scale = PixiUtils.getResolutionOfUrl(this.image || this.color);
			}
			//create the Texture and BaseTexture
			var texture = new Texture(new BaseTexture(image, null, scale));
			texture.baseTexture.imageUrl = this.image;

			if (this.cache && !ignoreCacheSetting)
			{
				//for cache id, prefer task id, but if Pixi global texture cache is using urls, then
				//use that
				var id = this.id;
				//if pixi is expecting URLs, then use the URL
				if (!PixiUtils.useFilenamesForTextures)
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
					if (this.__destroyed) return;
					this.__destroyed = true;
					//destroy the base texture as well
					this.__T_destroy(true);

					//remove it from the global texture cache, if relevant
					if (PixiUtils.TextureCache[id] == this)
						delete PixiUtils.TextureCache[id];
				};
			}
			if (this.uploadToGPU)
			{
				var displays = Application.instance.displays;
				for (var dispId in displays)
				{
					var display = displays[dispId];
					if (display instanceof PixiDisplay && display.isWebGL)
					{
						display.renderer.updateTexture(texture);
						break;
					}
				}
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
	namespace('springroll.pixi').TextureTask = TextureTask;

}());