/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	// Classes to import
	var LoaderItem = include('springroll.LoaderItem'),
		CacheManager = include('springroll.CacheManager'),
		LoaderResult = include('springroll.LoaderResult');

	/**
	 * The Loader is the singleton loader for loading all assets
	 * including images, data, code and sounds. Loader supports cache-busting
	 * in the browser using dynamic query string parameters.
	 * @class Loader
	 */
	var Loader = function(app)
	{
		/**
		 * The current application
		 * @property {springroll.Application} app 
		 * @private
		 */
		this.app = app;
		
		/**
		 * The maximum number of simulaneous loads
		 * @public
		 * @property {int} maxCurrentLoads
		 * @default 2
		 */
		this.maxCurrentLoads = 2;
		
		/**
		 * The reference to the cache manager
		 * @public
		 * @property {CacheManager} cacheManager
		 */
		this.cacheManager = new CacheManager(app);

		/**
		 * The collection of LoaderItems by url
		 * @private
		 * @property {Object} loads
		 */
		this.loads = {};
		
		/**
		 * The pool of queue items
		 * @private
		 * @property {array} loadPool
		 */
		this.loadPool = [];
	};
	
	/** The prototype */
	var p = Loader.prototype;

	if (DEBUG)
	{
		/**
		 * If the logging should be verbose (unminified library only)
		 * @property {Boolean} verbose
		 * @default  false
		 */
		Object.defineProperty(p, 'verbose', 
		{
			set: function(verbose)
			{
				LoaderItem.verbose = verbose;
			}
		});
	}
	
	/**
	 * Destroy the Loader singleton, don't use after this
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		var i, len, key;

		this.loadPool.forEach(function(load)
		{
			load.clear();
		});
		this.loadPool = null;

		if (this.cacheManager)
		{
			this.cacheManager.destroy();
		}
		this.cacheManager = null;
		this.loads = null;
	};

	/**
	 * Load a file
	 * @method load
	 * @public
	 * @param {string} url The file path to load
	 * @param {function} complete The callback function when completed
	 * @param {function} [progress] The callback for load progress update, passes 0-1 as param
	 * @param {*} [data] optional data
	 * @return {createjs.LoadQueue} The load queue item
	 */
	p.load = function(url, complete, progress, data)
	{
		var options = this.app.options;

		// Get a new loader object
		var load = this._getLoad();

		var basePath = options.basePath;
		if (basePath !== undefined && 
			/^http(s)?\:/.test(url) === false && 
			url.search(basePath) == -1)
		{
			load.basePath = basePath;
		}
		load.crossOrigin = options.crossOrigin;
		load.url = url;
		load.preparedUrl = this.cacheManager.prepare(url);
		load.onComplete = this._onComplete.bind(this, complete);
		load.onProgress = progress || null;
		load.data = data || null;
		load.setMaxConnections(this.maxCurrentLoads);

		this.loads[url] = load;

		load.start();

		return load;
	};

	/**
	 * Handler for the file complete
	 * @method _onComplete
	 * @private
	 * @param  {function} complete Callback function when done
	 * @param  {springroll.LoaderQueueResult} load The LoadQueue
	 * @param  {null|*} result   [description]
	 */
	p._onComplete = function(complete, load, result)
	{
		if (result)
		{
			result = new LoaderResult(
				result,
				load.url,
				load.data
			);
		}
		complete(result);
		this._putLoad(load);
	};
	
	/**
	 * Cancel a load that's currently in progress
	 * @public
	 * @method cancel
	 * @param {string} url The url
	 * @return {bool} If canceled returns true, false if not canceled
	 */
	p.cancel = function(url)
	{
		var load = this.loads[url];
		
		if (load)
		{
			load.clear();
			this._putLoad(load);
			return true;
		}
		return false;
	};
	
	/**
	 * Get a Queue item from the pool or new
	 * @method  _getLoad
	 * @private
	 * @return  {springroll.LoaderItem} The Queue item to use
	 */
	p._getLoad = function()
	{
		var loadPool = this.loadPool;
		return loadPool.length ? loadPool.pop(): new LoaderItem();
	};
	
	/**
	 * Pool the loader queue item
	 * @method  _putLoad
	 * @private
	 * @param  {springroll.LoaderItem} load Queue item that's done
	 */
	p._putLoad = function(load)
	{
		delete this.loads[load.url];
		load.clear();
		this.loadPool.push(load);
	};
	
	namespace('springroll').Loader = Loader;
	
}());