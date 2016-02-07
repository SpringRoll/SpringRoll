/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var LoadQueue = include('createjs.LoadQueue'),
		Debug,
		Sound = include('createjs.Sound', false);

	/**
	 * Represents a single item in the loader queue 
	 * @class LoaderItem
	 * @extends createjs.LoadQueue
	 */
	var LoaderItem = function()
	{
		LoadQueue.call(this, true); // preferXHR is always true!

		if (Debug === undefined)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The number of times this load has been retried
		 * @property {int} retries
		 * @default
		 */
		this.retries = 0;

		/**
		 * The original input url of the load
		 * @public
		 * @property {string} url
		 */
		this.url = null;

		/**
		 * The actual url of the load
		 * @public
		 * @property {string} preparedUrl
		 */
		this.preparedUrl = null;

		/**
		 * Data associate with the load
		 * @public
		 * @property {*} data
		 */
		this.data = null;

		/**
		 * The callback function of the load, to call when 
		 * the load as finished, takes one argument as result
		 * @public
		 * @property {function} onComplete
		 */
		this.onComplete = null;

		/**
		 * The progress callback
		 * @public
		 * @property {function} onProgress
		 */
		this.onProgress = null;

		/**
		 * The callback when a load queue item fails
		 * @private
		 * @property {function} _onFailed
		 */
		this._onFailed = this._onFailed.bind(this);

		/**
		 * The callback when a load queue item progresses
		 * @private
		 * @property {function} _onProgress
		 */
		this._onProgress = this._onProgress.bind(this);

		/**
		 * The callback when a load queue item completes
		 * @private
		 * @property {function} _onCompleted
		 */
		this._onCompleted = this._onCompleted.bind(this);

		// Install the sound plugin if we have sound module
		if (Sound)
		{
			this.installPlugin(Sound);
		}
	};

	// Reference to the prototype
	var p = extend(LoaderItem, LoadQueue);

	/**
	 * Represent this object as a string
	 * @property {int} MAX_RETRIES
	 * @static
	 * @default 3
	 */
	LoaderItem.MAX_RETRIES = 3;

	if (DEBUG)
	{
		/**
		 * If the loads should be verbose
		 * @property {Boolean} verbose
		 * @static
		 * @default false
		 */
		LoaderItem.verbose = false;
	}

	/**
	 * Represent this object as a string
	 * @public
	 * @method toString
	 * @return {string} The string representation of this object
	 */
	p.toString = function()
	{
		return "[LoaderItem(url:'" + this.url + "')]";
	};

	/**
	 * The base path of the load
	 * @property {String} basePath
	 * @default null
	 */
	Object.defineProperty(p, 'basePath',
	{
		set: function(basePath)
		{
			this._basePath = basePath;
		}
	});

	/**
	 * If this load should be cross origin
	 * @property {Boolean} crossOrigin
	 * @default false
	 */
	Object.defineProperty(p, 'crossOrigin',
	{
		set: function(crossOrigin)
		{
			this._crossOrigin = crossOrigin;
		}
	});

	/**
	 * Clear all the data
	 * @method clear
	 */
	p.clear = function()
	{
		this.basePath = "";
		this.crossOrigin = false;
		this.retries = 0;
		this.onComplete = null;
		this.onProgress = null;
		this.data = null;
		this.preparedUrl = null;
		this.url = null;

		this.removeAllEventListeners();
		this.removeAll();
		this.close();
	};

	/**
	 * Start the loading
	 * @method  start
	 * @param {int} maxCurrentLoads The max number of simultaneous load
	 */
	p.start = function(maxCurrentLoads)
	{
		if (DEBUG && Debug && LoaderItem.verbose)
		{
			Debug.log("Attempting to load file '" + this.url + "'");
		}
		this.addEventListener('fileload', this._onCompleted);
		this.addEventListener('error', this._onFailed);
		this.addEventListener('fileprogress', this._onProgress);
		this._internalStart();
	};

	/**
	 * Start the loading internally
	 * @method  _internalStart
	 * @private
	 */
	p._internalStart = function()
	{
		var url = this.preparedUrl;

		// Special loading for the Sound, requires the ID
		if (this.data && this.data.id)
		{
			url = {
				id: this.data.id,
				src: url,
				data: this.data
			};
		}

		// Load the file
		this.loadFile(url);
	};

	/**
	 * The file load progress event
	 * @method _onProgress
	 * @private
	 * @param {object} event The progress event
	 */
	p._onProgress = function(event)
	{
		if (this.onProgress)
		{
			this.onProgress(this.progress);
		}
	};

	/**
	 * There was an error loading the file
	 * @private
	 * @method _onFailed
	 */
	p._onFailed = function(event)
	{
		if (DEBUG && Debug)
		{
			Debug.error("Unable to load file: " + this.url + " - reason: " + event.error);
		}
		this.retry();
	};

	/**
	 * Retry the current load
	 * @method  retry
	 */
	p.retry = function()
	{
		this.retries++;
		if (this.retries > LoaderItem.MAX_RETRIES)
		{
			this.onComplete(this, null);
		}
		else
		{
			this._internalStart();
		}
	};

	/**
	 * The file was loaded successfully
	 * @private
	 * @method _onCompleted
	 * @param {object} ev The load event
	 */
	p._onCompleted = function(ev)
	{
		if (DEBUG && Debug && LoaderItem.verbose)
		{
			Debug.log("File loaded successfully from " + this.url);
		}
		this.onComplete(this, ev.result);
	};

	// Assign to the name space
	namespace('springroll').LoaderItem = LoaderItem;

}());