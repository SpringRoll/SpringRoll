/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlas = include('springroll.easeljs.TextureAtlas'),
		ColorAlphaTask = include('springroll.ColorAlphaTask'),
		BitmapUtils = include('springroll.easeljs.BitmapUtils');

	/**
	 * Internal class for loading a texture atlas for a FlashArt load.
	 * @class FlashArtAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.format The asset format must be "FlashAtlas".
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.libName='lib'] The global window object for symbols
	 * @param {String} [asset.id] Id of asset
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtAtlasTask = function(asset)
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

		this.libName = asset.libName || "lib";
	};

	// Reference to prototype
	var p = Task.extend(FlashArtAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtAtlasTask.test = function(asset)
	{
		// animation data and atlas data and an image or color/alpha split
		return asset.type == "easeljs" &&
			asset.format == "FlashAtlas" &&
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

			//prefer the spritesheet's exported scale
			var scale = results._atlas.meta ? 1 / parseFloat(results._atlas.meta.scale) : 0;
			//if it doesn't have one, then use the asset scale specified by the
			//AssetManager.
			if (!scale)
				scale = 1 / this.original.scale;


			var asset = {};

			var libName = this.libName;
			asset.create = function()
			{
				BitmapUtils.loadSpriteSheet(results._atlas, image, scale, libName);
			};

			var lib = namespace(this.libName);
			var frames = results._atlas.frames;
			asset.destroy = function()
			{
				for (var id in frames)
				{
					delete lib[id];
				}
				image.src = null;
			};

			done(asset, results);
		}.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtAtlasTask = FlashArtAtlasTask;

}());