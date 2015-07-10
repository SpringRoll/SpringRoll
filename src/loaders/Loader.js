/**
 * @module Core
 * @namespace springroll
*/
(function()
{
	// Classes to import
	var LoaderQueueItem = include('springroll.LoaderQueueItem'),
		CacheManager = include('springroll.CacheManager'),
		LoaderResult = include('springroll.LoaderResult'),
		LoadQueue,
		Sound,
		Debug;

	/**
	 * The Loader is the singleton loader for loading all assets
	 * including images, data, code and sounds. Loader supports cache-busting
	 * in the browser using dynamic query string parameters.
	*
	 * @class Loader
	 */
	var Loader = function(app)
	{
		if (!LoadQueue)
		{
			LoadQueue = include('createjs.LoadQueue');
			Sound = include('createjs.Sound', false);
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The current application
		 * @property {springroll.Application} _app 
		 * @private
		 */
		this._app = app;

		/**
		 * If we can load
		 * @property {Boolean} _canLoad 
		 * @default true
		 * @private
		 */
		this._canLoad = true;

		if (DEBUG)
		{
			/**
			 * If the logging should be verbose (unminified library only)
			 * @property {Boolean} verbose
			 * @default  false
			 */
			this.verbose = false;
		}
		
		/**
		 * The maximum number of simulaneous loads
		 * @public
		 * @property {int} maxSimultaneousLoads
		 * @default 2
		 */
		this.maxSimultaneousLoads = 2;
		
		/**
		 * The reference to the cache manager
		 * @public
		 * @property {CacheManager} cacheManager
		 */
		this.cacheManager = new CacheManager(app);

		// Create objects
		qiPool = [];
		loaderPool = [];
		queue = [];
		queueItems = {};
		loaders = {};
		retries = {};
	};
	
	/** The prototype */
	var p = Loader.prototype;
	
	/**
	* Reference to the private instance object
	* @static
	* @protected
	 */
	var _instance = null;
	
	/**
	 * The collection of LoaderQueueItems
	 * @private
	 */
	var queue = null;
	
	/**
	 * The collection of LoaderQueueItems by url
	 * @private
	 */
	var queueItems = null;
	
	/**
	 * The collection of loaders
	 * @private
	 * @property {object} loaders
	 */
	var loaders = null;
	
	/**
	 * The pool of queue items
	 * @private
	 * @property {array} loaders
	 */
	var qiPool = null;

	/**
	 * The pool of loader items
	 * @private
	 * @property {array} loaders
	 */
	var loaderPool = null;
	
	/**
	 * The current number of items loading
	 * @private
	 * @property {int} numLoads
	 * @default 0
	 */
	var numLoads = 0;
	
	/**
	 * The retry attempts
	 * @private
	 * @property {Object} retries
	 */
	var retries = null;
	
	/**
	 * Static constructor creating the singleton
	 * @method init
	 * @static
	 * @public
	 * @param {springroll.Application} app The current application
	 */
	Loader.init = function(app)
	{
		if (!_instance)
		{
			_instance = new Loader(app);
		}
		return _instance;
	};
		
	/**
	 * Static function for getting the singleton instance
	 * @static
	 * @readOnly
	 * @public
	 * @property {Loader} instance
	 */
	Object.defineProperty(Loader, "instance",
	{
		get: function()
		{
			return _instance;
		}
	});
	
	/**
	 * Destroy the Loader singleton, don't use after this
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		var i, len, key, arr = this.queue;
		if (arr)
		{
			this.queue.forEach(function(item)
			{
				item.destroy();
			});

			qiPool.forEach(function(qi)
			{
				qi.destroy();
			});
			for(key in loaders)
			{
				queueItems[key].destroy();
				loaders[key].close();
			}
		}
		_instance = null;
		if (this.cacheManager)
		{
			this.cacheManager.destroy();
		}
		this.cacheManager = null;
		queue = null;
		loaderPool = null;
		qiPool = null;
		queueItems = null;
		retries = null;
		loaders = null;
	};

	/**
	 * Load a file
	 * @method load
	 * @public
	 * @param {string} url The file path to load
	 * @param {function} complete The callback function when completed
	 * @param {function} [progress] The callback for load progress update, passes 0-1 as param
	 * @param {*} [data] optional data
	 */
	p.load = function(url, complete, progress, data)
	{
		var qi = this._getQI();
		var basePath = this._app.options.basePath;
		if (basePath !== undefined && /^http(s)?\:/.test(url) === false && url.search(basePath) == -1)
		{
			qi.basePath = basePath;
		}
		qi.url = url;
		qi.complete = complete;
		qi.progress = progress || null;
		qi.data = data || null;
		
		queue.push(qi);
		
		// Try to load the next queue item
		this._tryNextLoad();
	};
	
	/**
	 * There was an error loading the file
	 * @private
	 * @method _onLoadFailed
	 * @param {LoaderQueueItem} qi The loader queue item
	 */
	p._onLoadFailed = function(qi, event)
	{
		if (!_instance) return;
		
		if (DEBUG && Debug) 
		{
			Debug.error("Unable to load file: " + qi.url  + " - reason: " + event.error);
		}
		
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		_poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];
		
		if (retries[qi.url])
		{
			retries[qi.url]++;
		}
		else
		{
			retries[qi.url] = 1;
		}
		if (retries[qi.url] > 3)
		{
			this._loadDone(qi, null);
		}
		else
		{
			numLoads--;
			queue.push(qi);
			this._tryNextLoad();
		}
	};
	
	/**
	 * The file load progress event
	 * @method _onLoadProgress
	 * @private
	 * @param {LoaderQueueItem} qi The loader queue item
	 * @param {object} event The progress event
	 */
	p._onLoadProgress = function(qi, event)
	{
		qi.loaded = event.progress;

		if (qi.progress)
		{
			qi.progress(qi.loaded);
		}
	};
	
	/**
	 * The file was loaded successfully
	 * @private
	 * @method _onLoadCompleted
	 * @param {LoaderQueueItem} qi The loader queue item
	 * @param {object} ev The load event
	 */
	p._onLoadCompleted = function(qi, ev)
	{
		if (!_instance) return;

		if (DEBUG && Debug && this.verbose)
		{
			Debug.log("File loaded successfully from " + qi.url);
		}
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		_poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];

		this._loadDone(qi, this._getResult(
			ev.result, 
			qi.url, 
			loader, 
			qi.data
		));
	};
	
	/**
	 * Attempt to do the next load
	 * @method _tryNextLoad
	 * @private
	 */
	p._tryNextLoad = function()
	{
		if (numLoads > this.maxSimultaneousLoads - 1 || queue.length === 0) return;
		
		numLoads++;
		
		var qi = queue.shift();
		
		if (DEBUG && Debug && this.verbose)
		{
			Debug.log("Attempting to load file '" + qi.url + "'");
		}
		
		queueItems[qi.url] = qi;
		
		var loader = this._getLoader(qi.basePath);
		
		// Add to the list of loaders
		loaders[qi.url] = loader;
		loader.addEventListener("fileload", qi._complete);
		loader.addEventListener("error", qi._fail);
		loader.addEventListener("fileprogress", qi._progress);
		
		// Load the file, format the URL
		var url = this.cacheManager.prepare(qi.url);
		loader.loadFile(qi.data && qi.data.id ? 
			{id:qi.data.id, src:url, data:qi.data} : url);
	};
	
	/**
	 * Alert that the loading is finished
	 * @private
	 * @method _loadDone
	 * @param {LoaderQueueItem} qi The loader queue item
	 * @param {object} result The event from preloadjs or null
	 */
	p._loadDone = function(qi, result)
	{
		numLoads--;
		qi.complete(result);
		_poolQI(qi);
		this._tryNextLoad();
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
		var qi = queueItems[url];
		var loader = loaders[url];
		
		if (qi && loader)
		{
			loader.close();
			delete loaders[url];
			delete queueItems[qi.url];
			numLoads--;
			_poolLoader(loader);
			_poolQI(qi);
			return true;
		}
		
		for(var i = 0, len = queue.length; i < len; i++)
		{
			qi = queue[i];
			if (qi.url == url){
				queue.splice(i, 1);
				_poolQI(qi);
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Get a Queue item from the pool or new
	 * @method  _getQI
	 * @private
	 * @return  {springroll.LoaderQueueItem} The Queue item to use
	 */
	p._getQI = function()
	{
		var qi;
		if (qiPool.length)
		{
			qi = qiPool.pop();
		}
		else
		{
			qi = new LoaderQueueItem();
			qi._fail = this._onLoadFailed.bind(this, qi);
			qi._progress = this._onLoadProgress.bind(this, qi);
			qi._complete = this._onLoadCompleted.bind(this, qi);
		}
		return qi;
	};
	
	/**
	 * Pool the loader queue item
	 * @method  _poolQI
	 * @private
	 * @param  {springroll.LoaderQueueItem} qi Queue item that's done
	 */
	var _poolQI = function(qi)
	{
		qi.reset();
		qiPool.push(qi);
	};
	
	/**
	 * Get a loader from the pool or create new
	 * @method  _getLoader
	 * @private
	 * @param  {String} basePath
	 * @return {createjs.LoadQueue} The load queue
	 */
	p._getLoader = function(basePath)
	{
		var result;
		if (loaderPool.length)
		{
			result = loaderPool.pop();
			result._basePath = basePath; //apparently they neglected to make this public
		}
		else
		{
			result = new LoadQueue(true, basePath, this._app.options.crossOrigin);
		}
		//allow the loader to handle sound as well
		if (Sound)
		{
			result.installPlugin(Sound);
		}
		return result;
	};
	
	/**
	 * Add loader to the loader pool
	 * @method  _poolLoader
	 * @private
	 * @param {createjs.LoadQueue} loader The load queue
	 */
	var _poolLoader = function(loader)
	{
		loader.removeAll();
		loaderPool.push(loader);
	};
	
	/**
	 * Get the result of the load
	 * @method _getResult
	 * @private
	 * @param  {*} content The loader result
	 * @param  {String} url The URL that was loaded
	 * @param  {createjs.Loader} loader Loader instance
	 * @param  {*} data Optional data to associate with load
	 * @return {springroll.LoaderResult} The resulting load
	 */
	p._getResult = function(content, url, loader, data)
	{
		return new LoaderResult(
			content,
			url,
			loader,
			data
		);
	};
	
	namespace('springroll').Loader = Loader;
	
}());