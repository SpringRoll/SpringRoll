/**
*  @module Core
*  @namespace springroll
*/
(function(){
	
	// Classes to import
	var LoaderQueueItem,
		CacheManager,
		Application,
		Sound,
		LoadQueue,
		LoaderResult,
		Debug;

	/**
	*  The Loader is the singleton loader for loading all assets
	*  including images, data, code and sounds. Loader supports cache-busting
	*  in the browser using dynamic query string parameters.
	*
	*  @class Loader
	*/
	var Loader = function()
	{
		if (!Application)
		{
			LoaderQueueItem = include('springroll.LoaderQueueItem');
			CacheManager = include('springroll.CacheManager');
			Application = include('springroll.Application');
			LoaderResult = include('springroll.LoaderResult');
			LoadQueue = include('createjs.LoadQueue');
			Sound = include('createjs.Sound', false);
			Debug = include('springroll.Debug', false);
		}

		/**
		*  If we can load
		*  @private
		*/
		this._canLoad = true;
		
		/**
		*  The maximum number of simulaneous loads
		*  @public
		*  @property {int} maxSimultaneousLoads
		*  @default 2
		*/
		this.maxSimultaneousLoads = 2;
		
		/**
		*  The reference to the cache manager
		*  @public
		*  @property {CacheManager} cacheManager
		*/
		this.cacheManager = null;
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
	*  The collection of LoaderQueueItems
	*  @private
	*/
	var queue = null;
	
	/**
	*  The collection of LoaderQueueItems by url
	*  @private
	*/
	var queueItems = null;
	
	/**
	*  The collection of loaders
	*  @private
	*  @property {object} loaders
	*/
	var loaders = null;
	
	/**
	*  The pool of queue items
	*  @private
	*  @property {array} loaders
	*/
	var qiPool = null;

	/**
	*  The pool of loader items
	*  @private
	*  @property {array} loaders
	*/
	var loaderPool = null;

	/**
	*  The pool of result items
	*  @private
	*  @property {array} loaders
	*/
	var resultPool = null;
	
	/**
	*  The current number of items loading
	*  @private
	*  @property {int} numLoads
	*  @default 0
	*/
	var numLoads = 0;
	
	/**
	*  The retry attempts
	*  @private
	*  @property {Object} retries
	*/
	var retries = null;
	
	/**
	*  Static constructor creating the singleton
	*  @method init
	*  @static
	*  @public
	*/
	Loader.init = function()
	{
		if (!_instance)
		{
			_instance = new Loader();
			_instance._initialize();
			//register the destroy function
			Application.registerDestroy(
				_instance.destroy.bind(_instance)
			);
		}
		return _instance;
	};

	//register the global init function
	springroll.Application.registerInit(Loader.init);
		
	/**
	*  Static function for getting the singleton instance
	*  @static
	*  @readOnly
	*  @public
	*  @property {Loader} instance
	*/
	Object.defineProperty(Loader, "instance", {
		get:function()
		{
			return _instance;
		}
	});
	
	/**
	*  Destroy the Loader singleton, don't use after this
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		var i, len, key, arr = this.queue;
		if(arr)
		{
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			arr = qiPool;
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			arr = resultPool;
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			for(key in loaders)
			{
				queueItems[key].destroy();
				loaders[key].close();
			}
		}
		_instance = null;
		if (this.cacheManager)
			this.cacheManager.destroy();
		this.cacheManager = null;
		queue = null;
		resultPool = null;
		loaderPool = null;
		qiPool = null;
		queueItems = null;
		retries = null;
		loaders = null;
	};
	
	/**
	*  Initilize the object
	*  @protected
	*  @method _initialize
	*/
	p._initialize = function()
	{
		qiPool = [];
		loaderPool = [];
		resultPool = [];
		queue = [];
		queueItems = {};
		loaders = {};
		retries = {};
		this.cacheManager = new CacheManager();
	};
	
	/**
	*  Load a file
	*  @method load
	*  @public
	*  @param {string} url The file path to load
	*  @param {function} callback The callback function when completed
	*  @param {function*} updateCallback The callback for load progress update, passes 0-1 as param
	*  @param {int*} priority The priority of the load
	*  @param {*} data optional data
	*/
	p.load = function(url, callback, updateCallback, priority, data)
	{
		var qi = this._getQI();
		
		var basePath = Application.instance.options.basePath;
		if (basePath !== undefined && /^http(s)?\:/.test(url) === false && url.search(basePath) == -1)
		{
			qi.basePath = basePath;
		}
		
		qi.url = url;
		qi.callback = callback;
		qi.updateCallback = updateCallback || null;
		qi.priority = priority || LoaderQueueItem.PRIORITY_NORMAL;
		qi.data = data || null;
		
		queue.push(qi);
		
		// Sory by priority
		queue.sort(function(a, b){
			return a.priority - b.priority;
		});
		
		// Try to load the next queue item
		this._tryNextLoad();
	};
	
	/**
	*  There was an error loading the file
	*  @private
	*  @method _onLoadFailed
	*  @param {LoaderQueueItem} qi The loader queue item
	*/
	p._onLoadFailed = function(qi, event)
	{
		if(!_instance)
			return;
		
		if (DEBUG && Debug) Debug.error("Unable to load file: " + qi.url  + " - reason: " + event.error);
		
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		this._poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];
		
		if(retries[qi.url])
			retries[qi.url]++;
		else
			retries[qi.url] = 1;
		if(retries[qi.url] > 3)
			this._loadDone(qi, null);
		else
		{
			numLoads--;
			queue.push(qi);
			this._tryNextLoad();
		}
	};
	
	/**
	*  The file load progress event
	*  @method _onLoadProgress
	*  @private
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} event The progress event
	*/
	p._onLoadProgress = function(qi, event)
	{
		qi.progress = event.progress;
		if (qi.updateCallback){
			qi.updateCallback(qi.progress);
		}
	};
	
	/**
	*  The file was loaded successfully
	*  @private
	*  @method _onLoadCompleted
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} ev The load event
	*/
	p._onLoadCompleted = function(qi, ev)
	{
		if(!_instance)
			return;

		if(DEBUG && Debug)
		{
			Debug.log("File loaded successfully from " + qi.url);
		}
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		this._poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];
		this._loadDone(qi, this._getResult(ev.result, qi.url, loader));
	};
	
	/**
	*  Attempt to do the next load
	*  @method _tryNextLoad
	*  @private
	*/
	p._tryNextLoad = function()
	{
		if (numLoads > this.maxSimultaneousLoads - 1 || queue.length === 0) return;
		
		numLoads++;
		
		var qi = queue.shift();
		
		if(DEBUG && Debug)
		{
			Debug.log("Attempting to load file '" + qi.url + "'");
		}
		
		queueItems[qi.url] = qi;
		
		var loader = this._getLoader(qi.basePath);
		
		// Add to the list of loaders
		loaders[qi.url] = loader;
		
		loader.addEventListener("fileload", qi._boundComplete);
		loader.addEventListener("error", qi._boundFail);
		loader.addEventListener("fileprogress", qi._boundProgress);
		var url = this.cacheManager.prepare(qi.url);
		loader.loadFile(qi.data ? {id:qi.data.id, src:url, data:qi.data} : url);
	};
	
	/**
	*  Alert that the loading is finished
	*  @private
	*  @method _loadDone
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} result The event from preloadjs or null
	*/
	p._loadDone = function(qi, result)
	{
		numLoads--;
		if(qi.data && result)//a way to keep track of load results without excessive function binding
			result.id = qi.data.id;
		qi.callback(result);
		//qi.destroy();
		this._poolQI(qi);
		this._tryNextLoad();
	};
	
	/**
	*  Cancel a load that's currently in progress
	*  @public
	*  @method cancel
	*  @param {string} url The url
	*  @return {bool} If canceled returns true, false if not canceled
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
			this._poolLoader(loader);
			this._poolQI(qi);
			return true;
		}
		
		for(var i = 0, len = queue.length; i < len; i++)
		{
			qi = queue[i];
			if (qi.url == url){
				queue.splice(i, 1);
				this._poolQI(qi);
				return true;
			}
		}
		return false;
	};
	
	p._getQI = function()
	{
		var rtn;
		if(qiPool.length)
			rtn = qiPool.pop();
		else
		{
			rtn = new LoaderQueueItem();
			rtn._boundFail = this._onLoadFailed.bind(this, rtn);
			rtn._boundProgress = this._onLoadProgress.bind(this, rtn);
			rtn._boundComplete = this._onLoadCompleted.bind(this, rtn);
		}
		return rtn;
	};
	
	p._poolQI = function(qi)
	{
		qiPool.push(qi);
		qi.callback = qi.updateCallback = qi.data = qi.url = null;
		qi.progress = 0;
	};
	
	p._getLoader = function(basePath)
	{
		var rtn;
		if(loaderPool.length)
		{
			rtn = loaderPool.pop();
			rtn._basePath = basePath;//apparently they neglected to make this public
		}
		else
			rtn = new LoadQueue(true, basePath, Application.instance.options.crossOrigin);
		//allow the loader to handle sound as well
		if(Sound)
		{
			rtn.installPlugin(Sound);
		}
		return rtn;
	};
	
	p._poolLoader = function(loader)
	{
		loader.removeAll();//clear the loader for reuse
		loaderPool.push(loader);
	};
	
	p._getResult = function(result, url, loader)
	{
		var rtn;
		if(resultPool.length)
		{
			rtn = resultPool.pop();
			rtn.content = result;
			rtn.url = url;
			rtn.loader = loader;
		}
		else
			rtn = new LoaderResult(result, url, loader);
		return rtn;
	};
	
	p._poolResult = function(result)
	{
		result.content = result.url = result.loader = result.id = null;
		resultPool.push(result);
	};
	
	// MediaLoader name is deprecated
	namespace('springroll').MediaLoader = Loader;
	namespace('springroll').Loader = Loader;
}());