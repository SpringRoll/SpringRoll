/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		FlashArt = include('springroll.easeljs.FlashArt'),
		Application = include('springroll.Application'),
		ColorAlphaTask = include('springroll.ColorAlphaTask'),
		BitmapUtils = include('springroll.easeljs.BitmapUtils');

	/**
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that pulls the image from a spritesheet.
	 * @class FlashArtAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The source
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The spritesheet image path
	 * @param {String} [asset.color] The spritesheet color image path, if not using image property
	 * @param {String} [asset.alpha] The spritesheet alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libItem='lib'] The global window object for symbols
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtAtlasTask = function(asset)
	{
		Task.call(this, asset, asset.src);

		if (!BitmapUtils)
		{
			BitmapUtils = include('springroll.easeljs.BitmapUtils');
		}

		/**
		 * The path to the flash asset
		 * @property {String} src
		 */
		this.src = this.filter(asset.src);

		/**
		 * The spritesheet data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);

		/**
		 * The spritesheet source path
		 * @property {String} image
		 */
		this.image = this.filter(asset.image);

		/**
		 * The spritesheet color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The spritesheet alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';
	};

	// Reference to prototype
	var p = extend(FlashArtAtlasTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtAtlasTask.test = function(asset)
	{
		return asset.src &&
			asset.src.search(/\.js$/i) > -1 &&
			asset.type == "easeljs" &&
			asset.atlas &&
			(asset.image || (asset.color && asset.alpha));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var assets = {
			_flash : this.src,
			_atlas: this.atlas
		};

		if (this.image)
		{
			assets._image = this.image;
		}
		else
		{
			assets._color = this.color;
			assets._alpha = this.alpha;
		}

		// Load all the assets
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
			
			var art = new FlashArt(
				this.id,
				results._flash,
				this.libName
			);
			
			//prefer the spritesheet's exported scale
			var scale = results._atlas.meta ? 1 / parseFloat(results._atlas.meta.scale) : 0;
			//if it doesn't have one, then use the asset scale specified by the AssetManager.
			if(!scale)
				scale = this.original.scale;
			BitmapUtils.loadSpriteSheet(results._atlas, image, scale);

			callback(art);
		}
		.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtAtlasTask = FlashArtAtlasTask;

}());