/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var Application = include('springroll.Application'),
		AssetLoader = include('PIXI.AssetLoader'),
		PixiAssets = include('springroll.pixi.PixiAssets'),
		Task = include('springroll.Task');

	/**
	 * PixiLoadTask loads things through PIXI.AssetLoader for pixi.js.
	 * This means textures, spritesheets, and bitmap fonts.
	 * @class PixiLoadTask
	 * @constructor
	 * @private
	 * @param {Array} asset.urls The urls to load using PIXI.AssetLoader
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] The id of the task
	 * @param {Function} [asset.complete] The callback to call when the load is completed
	 * @param {Function} [asset.progress] The optional callback to call each time 
	 * an itemfinishes loading
	 */
	var PixiLoadTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The optional callback to get updates (to show load progress)
		 * @property {Function} progress
		 * @private
		 */
		this.progress = asset.progress;

		/**
		 * The AssetLoader used to load all files.
		 * @property {PIXI.AssetLoader} _assetLoader
		 * @private
		 */
		this._assetLoader = null;

		/**
		 * The urls of the files to load (passed through cache manager)
		 * @property {Array} urls
		 */
		this.urls = asset.urls.slice(0);

		/**
		 * The original urls of the files to load
		 * @property {Array} originalUrls
		 */
		this.originalUrls = asset.urls;

		// Prepare each url via the cache manager
		this.urls.forEach(function(url, i, urls)
		{
			urls[i] = Application.instance.loader.cacheManager.prepare(url, true);
		});
	};

	// Extend the base Task
	var p = extend(PixiLoadTask, Task);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	PixiLoadTask.test = function(asset)
	{
		return asset.urls && 
			asset.type == "pixi" && 
			Array.isArray(asset.urls);
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		var options = Application.instance.options;

		this._assetLoader = new AssetLoader(
			this.urls,
			options.crossOrigin,
			options.basePath
		);

		var assets = new PixiAssets(this.originalUrls);
		this._assetLoader.onComplete = callback.bind(null, assets);
		// Loop through urls on complete and set the baseTexture scale according to the asset scale

		if (this.progress)
		{
			this._assetLoader.onProgress = this.progress;
		}
		this._assetLoader.load();
	};

	/**
	 * Destroy this load task and don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);

		this.progress = null;
		this.urls = null;

		if (this._assetLoader)
		{
			this._assetLoader.onComplete = null;
			this._assetLoader.onProgress = null;
		}
		this._assetLoader = null;
	};

	// Assign to the namespace
	namespace('springroll.pixi').PixiLoadTask = PixiLoadTask;

}());