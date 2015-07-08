/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Loader = include('springroll.Loader'),
		MultiLoader = include('springroll.MultiLoader');

	/**
	 * Create an app plugin for Loader, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LoaderPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin(100);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Reference to the loader singleton
		 * @property {springroll.Loader} loader
		 */
		var loader = this.loader = Loader.init(this);

		/**
		 * Reference to the multiple asset loader
		 * @property {springroll.MultiLoader} multiLoader
		 */
		this.multiLoader = new MultiLoader();

		/**
		 * Override the end-user browser cache by adding
		 * "?v=" to the end of each file path requested. Use
		 * for developmently, debugging only!
		 * @property {Boolean} options.cacheBust
		 * @default DEBUG
		 */
		this.options.add('cacheBust', DEBUG)
		.respond('cacheBust', function()
		{
			return loader.cacheManager.cacheBust;
		})
		.on('cacheBust', function(value)
		{
			loader.cacheManager.cacheBust = (value == "true" || !!value);
		});

		/**
		 * The optional file path to prefix to any relative file
		 * requests this is a great way to load all load requests
		 * with a CDN path.
		 * @property {String} options.basePath
		 */
		this.options.add('basePath', null);

		/**
		 * The current version number for your application. This
		 * number will automatically be appended to all file
		 * requests. For instance, if the version is "0.0.1" all
		 * file requests will be appended with "?v=0.0.1"
		 * @property {String} options.version
		 */
		this.options.add('version', null, true);

		/**
		 * Path to a text file which contains explicit version
		 * numbers for each asset. This is useful for controlling
		 * the live browser cache. For instance, this text file
		 * would have an asset on each line followed by a number:
		 * `assets/config/config.json 2` would load
		 * `assets/config/config.json?v=2`
		 * @property {String} options.versionsFile
		 */
		this.options.add('versionsFile', null, true);

		/**
		 * Simple load of a single file.
		 * @method load
		 * @param {String} source The file to load
		 * @param {Function} complete The completed callback with a single
		 *        parameters which is a `springroll.LoaderResult` object.
		 * @param {Function} [progress] Update callback, return 0-1
		 * @param {int} [priority] The load priority to use
		 * @param {*} [data] The data to attach to load item
		 * @return {springroll.MultiLoaderResult} The multi files loading
		 */
		/**
		 * Load a single file with options.
		 * @method load
		 * @param {Object} options The file resource to load
		 * @param {String} options.src The file to load
		 * @param {Function} [options.complete=null] Callback when finished
		 * @param {Function} [options.progress=null] Callback on load progress,
		 *        has a parameter which is the percentage loaded from 0 to 1.
		 * @param {int} [options.priority=0] The load priority. See `Loader.load`
		 *        for more information about load priority.
		 * @param {*} [options.data] Additional data to attach to load is
		 *        accessible in the loader's result. 
		 * @param {Function} [complete] The completed callback with a single
		 *        parameters which is a `springroll.LoaderResult` object. will
		 *        only use if `options.complete` is undefined.
		 * @param {Boolean} [startAll=true] If tasks should be run in parallel
		 * @return {springroll.MultiLoaderResult} The multi files loading
		 */
		/**
		 * Load a map of multiple assets and return mapped LoaderResult objects.
		 * @method load
		 * @param {Object} assets Load a map of assets where the key is the asset
		 *        id and the value is either a string or an Object with `src`,
		 *        `complete`, `progress`, `priority`, and `data` keys.
		 * @param {Function} complete Callback where the only parameter is the
		 *        map of the results by ID.
		 * @param {Boolean} [startAll=true] If tasks should be run in parallel
		 * @return {springroll.MultiLoaderResult} The multi files loading
		 */
		/**
		 * Load a list of multiple assets and return array of LoaderResult objects.
		 * @method load
		 * @param {Array} assets The list of assets where each value 
		 *        is either a string or an Object with `src`,
		 *        `complete`, `progress`, `priority`, and `data` keys.
		 *        If each object has a `id` the result will be a mapped object.
		 * @param {Function} complete Callback where the only parameter is the
		 *        collection or map of the results.
		 * @param {Boolean} [startAll=true] If tasks should be run in parallel
		 * @return {springroll.MultiLoaderResult} The multi files loading
		 */
		this.load = function(source, complete, progressOrStartAll, priority, data)
		{
			// If the load arguments are setup like the Loader.load call
			// then we'll convert to an object that we can use
			if (typeof source == "string")
			{
				source = {
					src: source,
					complete: complete,
					progress: progressOrStartAll,
					priority: priority,
					data: data
				};
			}

			return this.multiLoader.load(
				source, 
				complete, 
				progressOrStartAll
			);
		};
	};

	// Preload task
	plugin.preload = function(done)
	{
		var versionsFile = this.options.versionsFile;
		if (versionsFile)
		{
			// Try to load the default versions file
			this.loader.cacheManager.addVersionsFile(versionsFile, done);
		}
		else
		{
			done();
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.loader)
		{
			this.loader.destroy();
			this.loader = null;
		}

		if (this.multiLoader)
		{
			this.multiLoader.destroy();
			this.multiLoader = null;
		}
	};

}());