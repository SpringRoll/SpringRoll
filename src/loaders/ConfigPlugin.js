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
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(80);

	/**
	 * The game has finished loading
	 * @event loaded
	 */

	/**
	 * The amount of progress of the preload from 0 to 1
	 * @event progress
	 * @param {Number} percentage The amount preloaded
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

		var options = this.options;

		/**
		 * The path to the config file to load
		 * @property {String} options.configPath
		 * @default null
		 */
		options.add('configPath', null, true);

		/**
		 * The collection of assets to preload, can be individual
		 * URLs or objects with keys `src`, `complete`, `progress`, etc. 
		 * @property {String|Array|Object} options.preload
		 * @default []
		 */
		options.add('preload', [], true);

		/**
		 * The game configuration loaded from and external JSON file
		 * @property {Object} config
		 */
		this.config = null;

		/**
		 * The asset load for preloading
		 * @property {springroll.AssetLoad} _assetLoad
		 * @private
		 */
		this._assetLoad = null;

		/**
		 * The total number of assets loaded
		 * @property {int} _numLoaded
		 * @private
		 */
		this._numLoaded = 0;

		/**
		 * The total assets to preload
		 * @property {int} _total
		 * @private
		 */
		this._total = 0;

		/**
		 * The current combined progress with plugin and asset load
		 * @property {Number} _progress
		 * @private
		 * @default -1
		 */
		this._progress = -1;

		// Listen for changes to the plugin progress
		this.on('pluginProgress', onProgress.bind(this));
	};

	// async
	plugin.preload = function(done)
	{
		var assets = [];
		var configPath = this.options.configPath;

		// If there's a config path then add it
		if (configPath)
		{
			assets.push(
			{
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
			this._assetLoad = this.load(assets,
			{
				complete: callback,
				progress: onProgress.bind(this),
				cacheAll: true
			});
		}
		else
		{
			callback();
		}
	};

	/**
	 * Callback when progress is finished
	 * @method onProgress
	 * @private
	 * @param {Number} progress The amount loaded from 0 to 1
	 */
	var onProgress = function()
	{
		if (this._assetLoad)
		{
			this._numLoaded = this._assetLoad.numLoaded;
			this._total = this._assetLoad.total;
		}
		var numLoaded = (this._numLoaded + this.pluginLoad.numLoaded);
		var total = (this._total + this.pluginLoad.total);
		var progress = numLoaded / total;
		if (progress > this._progress)
		{
			this._progress = progress;
			this.trigger('progress', progress);
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
		assets.append(app.options.preload);

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
		this._assetLoad = null;
		this.trigger('loaded', results);
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		this.config = null;
	};

}());