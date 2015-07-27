/**
 * @module Pixi Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		Texture = include('PIXI.Texture'),
		TextureAtlas = include('springroll.pixi.TextureAtlas'),
		PixiUtils = include('PIXI.utils'),
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class TextureAtlasTask
	 * @extends springroll.pixi.TextureTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureAtlasTask = function(asset, fallbackId)
	{
		TextureTask.call(this, asset, asset.atlas);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);
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
		// atlas data and an image or color/alpha split
		return !!asset.atlas && TextureTask.test(asset);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas({}, callback, true);
	};

	/**
	 * Load a texture atlas from the properties
	 * @method loadAtlas
	 * @param {Object} assets The assets object to load
	 * @param {Function} done Callback when complete, returns new TextureAtlas
	 * @param {Boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
	 *                                       because this task is still returning stuff to another
	 *                                       task.
	 */
	p.loadAtlas = function(assets, done, ignoreCacheSetting)
	{
		assets._atlas = this.atlas;
		
		this.loadImage(assets, function(texture, results)
		{
			var data = results._atlas;
			
			var atlas = new TextureAtlas(texture, data, this.cache && !ignoreCacheSetting);
			
			done(atlas, results);
		}.bind(this));
	};

	// Assign to namespace
	namespace('springroll.pixi').TextureAtlasTask = TextureAtlasTask;

}());