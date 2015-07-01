/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var MultiLoaderTask = include('springroll.MultiLoaderTask'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Class that represents a single multi load
	 * @class MultiLoaderResult
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {springroll.Loader} loader Reference to the loader
	 * @param {Object|Array} assets The collection of assets to load
	 * @param {Function} complete Function call when done, returns results
	 */
	var MultiLoaderResult = function(loader, assets, complete)
	{
		EventDispatcher.call(this);

		/**
		 * Handler when completed with all tasks
		 * @property {function} complete
		 */
		this.complete = complete;

		/**
		 * Reference to the loader
		 * @property {springroll.Loader} loader
		 */
		this.loader = loader;

		/**
		 * How to display the results, either as single (0), map (1) or list (2)
		 * @property {int} mode
		 * @default 1
		 */
		this.mode = MAP_MODE;

		/**
		 * The list of tasks to load
		 * @property {Array} tasks
		 */
		this.tasks = [];

		/**
		 * The results to return when we're done
		 * @property {springroll.LoaderResult|Array|Object} results
		 */
		this.results = null;

		// Collection of tasks to run
		this.tasks = [];

		// Update the results mode and tasks
		this.mode = this.addAssets(assets);

		// Set defaults for results
		switch(this.mode)
		{
			case MAP_MODE : this.results = {}; break;
			case LIST_MODE : this.results = []; break;
		}
	};

	// Reference to prototype
	var s = EventDispatcher.prototype;
	var p = extend(MultiLoaderResult, EventDispatcher);

	/**
	 * The result is a single LoaderResult
	 * @property {int} SINGLE_MODE
	 * @private
	 * @final
	 * @static
	 * @default 0
	 */
	var SINGLE_MODE = 0;

	/**
	 * The result is a map of LoaderResult objects
	 * @property {int} MAP_MODE
	 * @private
	 * @final
	 * @static
	 * @default 1
	 */
	var MAP_MODE = 1;

	/**
	 * The result is an array of LoaderResult objects
	 * @property {int} LIST_MODE
	 * @private
	 * @final
	 * @static
	 * @default 2
	 */
	var LIST_MODE = 2;

	/**
	 * Create a list of tasks from assets
	 * @method  addAssets
	 * @protected
	 * @param  {Object|Array} assets The assets to load
	 */
	p.addAssets = function(assets)
	{
		if (this.destroyed)
		{
			throw "load is done";
		}

		var mode = MAP_MODE;
		if (isObject(assets) && assets.src)
		{
			mode = SINGLE_MODE;
			tasks.push(new MultiLoaderTask(asset));
		}
		else
		{
			if (Array.isArray(assets))
			{
				assets.forEach(function(asset, id)
				{
					// If we don't have the id to return
					// a mapped result, we'll fallback to array results
					if ((isObject(asset) && !asset.id) || isString(asset))
					{
						mode = LIST_MODE;
					}
					this.addAsset(asset, id);
				}
				.bind(this));
			}
			else if (isObject(assets))
			{
				for(var id in assets)
				{
					this.addAsset(assets[id], id);
				}
			}
			else
			{
				throw "asset type unsupported";
			}
		}
		return mode;
	};

	/**
	 * Load a single asset
	 * @method addAsset
	 * @param {Object|String|Function} asset The asset to load, 
	 *        can either be an object, URL/path, or async function.
	 */
	p.addAsset = function(asset, id)
	{
		// async function
		if (isFunction(asset))
		{
			this.tasks.push(asset);
			asset(this.taskDone.bind(this, asset));
		}
		else
		{
			var task = new MultiLoaderTask(asset, id);
			this.tasks.push(task);

			// start loading asset
			this.loader.load(
				task.src,
				this.taskDone.bind(this, task),
				task.progress,
				task.priority,
				task.data
			);
		}
	};

	/**
	 * Handler when a task has completed
	 * @method  taskDone
	 * @protected
	 * @param  {Function|springroll.MultiLoaderTask} task Reference to original task
	 * @param  {springroll.LoaderResult} [result] The result of load
	 */
	p.taskDone = function(task, result)
	{
		// Ignore if we're destroyed
		if (this.destroyed) return;

		var index = this.tasks.indexOf(task);

		// Task was already removed, because a clear
		if (index === -1)
		{
			return;
		}

		// Remove the completed task
		this.tasks.splice(index, 1);

		// Assets
		var assets = this._getAssets();

		// Handle the file load tasks
		if (task instanceof MultiLoaderTask)
		{
			// Handle the result
			switch(this.mode)
			{
				case SINGLE_MODE: this.results = result; break;
				case LIST_MODE: this.results.push(result); break;
				case MAP_MODE: this.results[task.id] = result; break;
			}

			// If the task has a complete method
			// we'll make sure that gets called
			// with a reference to the tasks
			// can potentially add more
			if (task.complete)
			{
				task.complete(result, assets);
			}

			this.trigger('taskDone', result, assets);

			// Clean up the task
			task.destroy();
		}

		// Add new assets
		this.addAssets(assets);

		// All tasks finished!
		if (!this.tasks.length)
		{
			this.complete(this.results);

			/**
			 * When all events are completed
			 * @event completed
			 */
			this.trigger('completed');
		}
	};

	/**
	 * Get an empty assets collection
	 * @method _getAssets
	 * @return {Array|Object|null} Empty container for assets 
	 */
	p._getAssets = function()
	{
		switch(this.mode)
		{
			case SINGLE_MODE: return null;
			case LIST_MODE: return [];
			case MAP_MODE: return {};
		}
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		/**
		 * When the loader result has been destroyed
		 * @event destroyed
		 */
		this.trigger('destroyed');
		this.tasks.forEach(function(task)
		{
			task.destroy();
		});
		this.results = null;
		this.complete = null;
		this.tasks = null;
		s.destroy.call(this);
	};

	/**
	 * Check if an object is an Object type
	 * @method isObject
	 * @private
	 * @param  {*}  obj The object
	 * @return {Boolean} If it's an Object
	 */
	function isObject(obj)
	{
		return typeof obj == "object";
	}

	/**
	 * Check if an object is an String type
	 * @method isString
	 * @private
	 * @param  {*}  obj The object
	 * @return {Boolean} If it's an String
	 */
	function isString(obj)
	{
		return typeof obj == "string";
	}

	/**
	 * Check if an object is an function type
	 * @method isFunction
	 * @private
	 * @param  {*}  obj The object
	 * @return {Boolean} If it's an function
	 */
	function isFunction(obj)
	{
		return typeof obj == "function";
	}

	// Assign to namespace
	namespace('springroll').MultiLoaderResult = MultiLoaderResult;

}());