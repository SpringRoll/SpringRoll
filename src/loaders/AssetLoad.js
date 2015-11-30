/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var Debug,
		Task = include('springroll.Task'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Class that represents a single multi load
	 * @class AssetLoad
	 * @private
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {springroll.AssetManager} manager Reference to the manager
	 */
	var AssetLoad = function(manager)
	{
		EventDispatcher.call(this);

		if (DEBUG)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * Reference to the Task Manager
		 * @property {springroll.AssetManager} manager
		 */
		this.manager = manager;

		if (DEBUG)
		{
			this.id = AssetLoad.ID++;
		}

		/**
		 * How to display the results, either as single (0), map (1) or list (2)
		 * @property {int} mode
		 * @default 1
		 */
		this.mode = MAP_MODE;

		/**
		 * If we should run the tasks in parallel (true) or serial (false)
		 * @property {Boolean} startAll
		 * @default true
		 */
		this.startAll = true;

		/**
		 * If we should try to cache all items in the load
		 * @property {Boolean} cacheAll
		 * @default false
		 */
		this.cacheAll = false;

		/**
		 * The list of tasks to load
		 * @property {Array} tasks
		 */
		this.tasks = [];

		/**
		 * The results to return when we're done
		 * @property {Array|Object} results
		 */
		this.results = null;

		/**
		 * If the load is currently running
		 * @property {Boolean} running
		 * @default false
		 */
		this.running = false;

		/**
		 * The total number of assets loaded
		 * @property {int} numLoaded
		 * @default 0
		 */
		this.numLoaded = 0;

		/**
		 * The total number of assets
		 * @property {int} total
		 * @default 0
		 */
		this.total = 0;

		/**
		 * The default asset type if not defined
		 * @property {String} type
		 * @default null
		 */
		this.type = null;
	};

	// Reference to prototype
	var p = EventDispatcher.extend(AssetLoad);

	/**
	 * When an asset is finished
	 * @event taskDone
	 * @param {*} result The loader result
	 * @param {Object} originalAsset The original load asset
	 * @param {Array} assets Collection to add additional assets to
	 */

	/**
	 * When all assets have been completed loaded
	 * @event complete
	 * @param {Array|Object} results The results of load
	 */

	/**
	 * Check how many assets have finished loaded
	 * @event progress
	 * @param {Number} percentage The amount loaded from 0 to 1
	 */

	if (DEBUG)
	{
		/**
		 * Debugging Keep track of how many we've created
		 * @property {int} ID
		 * @static
		 * @private
		 */
		AssetLoad.ID = 1;

		/**
		 * Debugging purposes
		 * @method toString
		 */
		p.toString = function()
		{
			return "[AssetLoad (index: " + this.id + ")]";
		};
	}

	/**
	 * Initialize the Load
	 * @method setup
	 * @param {Object|Array} assets The collection of assets to load
	 * @param {Object} [options] The loading options
	 * @param {Boolean} [options.startAll=true] If we should run the tasks in order
	 * @param {Boolean} [options.autoStart=true] Automatically start running
	 * @param {Boolean} [options.cacheAll=false] If we should run the tasks in order
	 * @param {String} [options.type] The default asset type of load, gets attached to each asset
	 */
	p.setup = function(assets, options)
	{
		// Save options to load
		this.startAll = options.startAll;
		this.cacheAll = options.cacheAll;
		this.type = options.type;

		// Update the results mode and tasks
		this.mode = this.addTasks(assets);

		// Set the default container for the results
		this.results = getAssetsContainer(this.mode);

		// Start running
		if (options.autoStart)
		{
			this.start();
		}
	};

	/**
	 * Start the load process
	 * @method start
	 */
	p.start = function()
	{
		// Empty load percentage
		this.trigger('progress', 0);

		// Keep track if we're currently running
		this.running = true;
		this.nextTask();
	};

	/**
	 * Set back to the original state
	 * @method reset
	 */
	p.reset = function()
	{
		// Cancel any tasks
		this.tasks.forEach(function(task)
		{
			task.status = Task.FINISHED;
			task.destroy();
		});
		this.total = 0;
		this.numLoaded = 0;
		this.mode = MAP_MODE;
		this.tasks.length = 0;
		this.results = null;
		this.type = null;
		this.startAll = true;
		this.cacheAll = false;
		this.running = false;
	};

	/**
	 * The result is a single result
	 * @property {int} SINGLE_MODE
	 * @private
	 * @final
	 * @static
	 * @default 0
	 */
	var SINGLE_MODE = 0;

	/**
	 * The result is a map of result objects
	 * @property {int} MAP_MODE
	 * @private
	 * @final
	 * @static
	 * @default 1
	 */
	var MAP_MODE = 1;

	/**
	 * The result is an array of result objects
	 * @property {int} LIST_MODE
	 * @private
	 * @final
	 * @static
	 * @default 2
	 */
	var LIST_MODE = 2;

	/**
	 * Create a list of tasks from assets
	 * @method  addTasks
	 * @private
	 * @param  {Object|Array} assets The assets to load
	 */
	p.addTasks = function(assets)
	{
		var asset;
		var mode = MAP_MODE;

		// Apply the defaults incase this is a single
		// thing that we're trying to load
		assets = applyDefaults(assets);

		// Check for a task definition on the asset
		// add default type for proper task recognition
		if (assets.type === undefined && this.type)
		{
			assets.type = this.type;
		}
		var isSingle = this.getTaskByAsset(assets);

		if (isSingle)
		{
			this.addTask(assets);
			return SINGLE_MODE;
		}
		else
		{
			//if we added a default type for task recognition, remove it
			if (assets.type === this.type && this.type)
			{
				delete assets.type;
			}
			var task;
			if (Array.isArray(assets))
			{
				for (var i = 0; i < assets.length; i++)
				{
					asset = applyDefaults(assets[i]);
					task = this.addTask(asset);
					if (!task.id)
					{
						// If we don't have the id to return
						// a mapped result, we'll fallback to array results
						mode = LIST_MODE;
					}
				}
			}
			else if (Object.isPlain(assets))
			{
				for (var id in assets)
				{
					asset = applyDefaults(assets[id]);
					task = this.addTask(asset);
					if (!task.id)
					{
						task.id = id;
					}
				}
			}
			else if (DEBUG && Debug)
			{
				Debug.error("Asset type unsupported", asset);
			}
		}
		return mode;
	};

	/**
	 * Convert assets into object defaults
	 * @method applyDefaults
	 * @private
	 * @static
	 * @param  {*} asset The function to convert
	 * @return {Object} The object asset to use
	 */
	function applyDefaults(asset)
	{
		// convert to a LoadTask
		if (isString(asset))
		{
			return {
				src: asset
			};
		}
		// convert to a FunctionTask
		else if (isFunction(asset))
		{
			return {
				async: asset
			};
		}
		return asset;
	}

	/**
	 * Load a single asset
	 * @method addTask
	 * @private
	 * @param {Object} asset The asset to load,
	 *      can either be an object, URL/path, or async function.
	 */
	p.addTask = function(asset)
	{
		if (asset.type === undefined && this.type)
		{
			asset.type = this.type;
		}
		var TaskClass = this.getTaskByAsset(asset);
		var task;
		if (TaskClass)
		{
			if (asset.cache === undefined && this.cacheAll)
			{
				asset.cache = true;
			}
			task = new TaskClass(asset);
			this.tasks.push(task);
			++this.total;
		}
		else if (true && Debug)
		{
			Debug.error("Unable to find a task definition for asset", asset);
		}
		return task;
	};

	/**
	 * Get the Task definition for an asset
	 * @method  getTaskByAsset
	 * @private
	 * @static
	 * @param  {Object} asset The asset to check
	 * @return {Function} The Task class
	 */
	p.getTaskByAsset = function(asset)
	{
		var TaskClass;
		var taskDefs = this.manager.taskDefs;

		// Loop backwards to get the registered tasks first
		// then will default to the basic Loader task
		for (var i = 0, len = taskDefs.length; i < len; i++)
		{
			TaskClass = taskDefs[i];
			if (TaskClass.test(asset))
			{
				return TaskClass;
			}
		}
		return null;
	};

	/**
	 * Run the next task that's waiting
	 * @method  nextTask
	 * @private
	 */
	p.nextTask = function()
	{
		var tasks = this.tasks;
		for (var i = 0; i < tasks.length; i++)
		{
			var task = tasks[i];
			if (task.status === Task.WAITING)
			{
				task.status = Task.RUNNING;
				task.start(this.taskDone.bind(this, task));

				// If we aren't running in parallel, then stop
				if (!this.startAll) return;
			}
		}
	};

	/**
	 * Handler when a task has completed
	 * @method  taskDone
	 * @private
	 * @param  {springroll.Task} task Reference to original task
	 * @param  {*} [result] The result of load
	 */
	p.taskDone = function(task, result)
	{
		// Ignore if we're destroyed
		if (!this.running) return;

		// Default to null
		result = result || null;

		var index = this.tasks.indexOf(task);

		// Task was already removed, because a clear
		if (index === -1)
		{
			return;
		}

		// Remove the completed task
		this.tasks.splice(index, 1);

		// Assets
		var assets = [];

		// Handle the file load tasks
		if (result)
		{
			// Handle the result
			switch (this.mode)
			{
				case SINGLE_MODE:
					this.results = result;
					break;
				case LIST_MODE:
					this.results.push(result);
					break;
				case MAP_MODE:
					this.results[task.id] = result;
					break;
			}

			// Should we cache the task?
			if (task.cache)
			{
				this.manager.cache.write(task.id, result);
			}
		}

		// If the task has a complete method
		// we'll make sure that gets called
		// with a reference to the tasks
		// can potentially add more
		if (task.complete)
		{
			task.complete(result, task.original, assets);
		}

		// Asset is finished
		this.trigger('taskDone', result, task.original, assets);

		task.destroy();

		// Add new assets to the things to load
		var mode = this.addTasks(assets);

		// Update the progress total
		this.trigger('progress', ++this.numLoaded / this.total);

		// Check to make sure if we're in
		// map mode, we keep it that way
		if (this.mode === MAP_MODE && mode !== this.mode)
		{
			if (DEBUG && Debug)
			{
				Debug.error("Load assets require IDs to return mapped results", assets);
				return;
			}
			else
			{
				throw "Assets require IDs";
			}
		}

		if (this.tasks.length)
		{
			// Run the next task
			this.nextTask();
		}
		else
		{
			// We're finished!
			this.trigger('complete', this.results);
		}
	};

	/**
	 * Get an empty assets collection
	 * @method getAssetsContainer
	 * @private
	 * @param {int} mode The mode
	 * @return {Array|Object|null} Empty container for assets
	 */
	var getAssetsContainer = function(mode)
	{
		switch (mode)
		{
			case SINGLE_MODE:
				return null;
			case LIST_MODE:
				return [];
			case MAP_MODE:
				return {};
		}
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		EventDispatcher.prototype.destroy.call(this);
		this.reset();
		this.tasks = null;
		this.manager = null;
	};

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
	namespace('springroll').AssetLoad = AssetLoad;

}());