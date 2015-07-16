/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug;

	/**
	 * Create an app plugin for Hinting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class ConfigPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin(80);

	/**
	 * The game has finished loading
	 * @event loaded
	 */

	/**
	 * The config has finished loading, in case you want to
	 * add additional tasks to the manager after this.
	 * @event configLoaded
	 * @param {Object} config The JSON object for config
	 * @param {Array} assets Container to add additional assets to
	 */

	/**
	 * The game has started loading
	 * @event loading
	 * @param {Array} assets The list of tasks to preload
	 */

	// Init the animator
	plugin.setup = function()
	{
		Debug = include('springroll.Debug', false);

		/**
		 * The path to the config file to load
		 * @property {String} options.configPath
		 * @default null
		 */
		this.options.add('configPath', null, true);

		/**
		 * The collection of assets to preload, can be individual
		 * URLs or objects with keys `src`, `complete`, `progress`, etc. 
		 * @property {String} options.preload
		 * @default []
		 */
		this.options.add('preload', [], true);

		/**
		 * The game configuration loaded from and external JSON file
		 * @property {Object} config
		 */
		this.config = null;
	};

	// async
	plugin.preload = function(done)
	{
		var assets = [];
		var configPath = this.options.configPath;

		// If there's a config path then add it
		if (configPath)
		{
			assets.push({
				id: 'config',
				src: configPath,
				cache: false,
				complete: onConfigLoaded.bind(this)
			});
		}
		else
		{
			addPreloadAssets(this, assets);
		}

		var callback = onLoadComplete.bind(this, done);

		if (assets.length)
		{
			this.load(assets, {
				complete: callback,
				cacheAll: true
			});
		}
		else
		{
			callback();
		}
	};

	/**
	 * Add the preload assets to the list of assets to load
	 * @method addPreloadAssets
	 * @private
	 * @param {springroll.Application} app Reference to the application
	 * @param {Array} assets The array to add new load tasks to
	 */
	var addPreloadAssets = function(app, assets)
	{
		var preload = app.options.preload;

		if (preload && preload.length)
		{
			preload.forEach(function(asset)
			{
				assets.push(asset);
			});
		}
		
		// Allow extending game to add additional tasks
		app.trigger('loading', assets);
	};

	/**
	 * Callback when the config is loaded
	 * @method onConfigLoaded
	 * @private
	 * @param {Object} config The Loader result from the load
	 * @param {Object} asset Original asset data
	 * @param {Array} assets The array to add new load tasks to
	 */
	var onConfigLoaded = function(config, asset, assets)
	{
		this.config = config;
		this.trigger('configLoaded', config, assets);
		addPreloadAssets(this, assets);
	};

	/**
	 * Callback when tasks are completed
	 * @method onLoadComplete
	 * @private
	 * @param {function} done Call when we're done
	 * @param {Array} results The collection of final LoaderResult objects
	 */
	var onLoadComplete = function(done, results)
	{
		this.trigger('loaded', results);
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		this.config = null;
	};

}());