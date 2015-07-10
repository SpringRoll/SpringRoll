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
	 * @class SpritesheetTask
	 * @extends springroll.Task
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The source
	 * @param {String} asset.spritesheet The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The spritesheet image path
	 * @param {String} [asset.color] The spritesheet color image path, if not using image property
	 * @param {String} [asset.alpha] The spritesheet alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libItem='lib'] The global window object for symbols
	 * @param {Number} [asset.scale=1] The scale for BitmapUtils.loadSpriteSheet();
	 */
	var SpritesheetTask = function(asset)
	{
		Task.call(this, asset);

		if (!BitmapUtils)
		{
			BitmapUtils = include('springroll.easeljs.BitmapUtils');
		}

		/**
		 * The path to the flash asset
		 * @property {String} src
		 */
		this.src = asset.src;

		/**
		 * The spritesheet data source path
		 * @property {String} spritesheet
		 */
		this.spritesheet = asset.spritesheet;

		/**
		 * The spritesheet source path
		 * @property {String} image
		 */
		this.image = asset.image;

		/**
		 * The spritesheet color source path
		 * @property {String} color
		 */
		this.color = asset.color;

		/**
		 * The spritesheet alpha source path
		 * @property {String} alpha
		 */
		this.alpha = asset.alpha;

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';

		/**
		 * The scale for the spritesheet
		 * @property {Number} scale
		 * @default  1
		 */
		this.scale = asset.scale || 1;
	};

	// Reference to prototype
	var p = extend(SpritesheetTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SpritesheetTask.test = function(asset)
	{
		return asset.src && 
			asset.src.search(/\.js$/i) > -1 && 
			asset.spritesheet && 
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
			_spritesheet: this.spritesheet
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
				image = results._image.content;
			}
			else
			{
				image = ColorAlphaTask.mergeAlpha(
					results._color.content,
					results._alpha.content
				);
			}

			BitmapUtils.loadSpriteSheet(results._spritesheet.content, image, this.scale);

			callback(new FlashArt(
				this.id,
				results._flash.content,
				this.libName 
			));
		}
		.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').SpritesheetTask = SpritesheetTask;

}());