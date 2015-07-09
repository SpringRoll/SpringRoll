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
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class TextureAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 */
	var TextureAtlasTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = asset.atlas;

		/**
		 * The atlas source path
		 * @property {String} image
		 */
		this.image = asset.image;

		/**
		 * The atlas color source path
		 * @property {String} color
		 */
		this.color = asset.color;

		/**
		 * The atlas alpha source path
		 * @property {String} alpha
		 */
		this.alpha = asset.alpha;
	};

	// Reference to prototype
	var p = extend(TextureAtlasTask, Task);

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
		return !!asset.atlas && (!!asset.image || (!!asset.alpha && !!asset.color));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas({}, callback);
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
			var atlas = new TextureAtlas(image, results._atlas.content);
			done(atlas, results);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').TextureAtlasTask = TextureAtlasTask;

}());