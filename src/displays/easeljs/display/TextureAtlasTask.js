/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlas = include('springroll.easeljs.TextureAtlas'),
		ColorAlphaTask = include('springroll.ColorAlphaTask');

	/**
	 * Internal class for loading a texture atlas, creating a 'springroll.easeljs.TextureAtlas'.
	 * @class TextureAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureAtlasTask = function(asset)
	{
		Task.call(this, asset, asset.atlas);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);

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
	};

	// Reference to prototype
	var p = Task.extend(TextureAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	TextureAtlasTask.test = function(asset)
	{
		// animation data and atlas data and an image or color/alpha split
		return asset.type == "easeljs" &&
			asset.atlas &&
			(asset.image || (asset.alpha && asset.color));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas(
		{}, callback);
	};

	/**
	 * Load a texture atlas from the properties
	 * @method loadAtlas
	 * @param {Object} assets The assets object to load
	 * @param {Function} done Callback when complete, returns new TextureAtlas
	 */
	p.loadAtlas = function(assets, done)
	{
		assets._atlas = this.atlas;

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
			var atlas = new TextureAtlas(image, results._atlas);
			done(atlas, results);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').TextureAtlasTask = TextureAtlasTask;

}());