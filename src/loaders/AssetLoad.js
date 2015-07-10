/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Debug,
		AssetManager,
		Task = include('springroll.Task'),
		LoaderResult = include('springroll.LoaderResult'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Class that represents a single multi load
	 * @class AssetLoad
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {Object|Array} assets The collection of assets to load
	 * @param {Function} [complete=null] Function call when done, returns results
	 * @param {Boolean} [parallel=false] If we should run the tasks in ordeer
	 */
	var AssetLoad = function(manager, assets, complete, parallel)
	{
		EventDispatcher.call(this);

		if (!AssetManager)
		{
			AssetManager = include('springroll.AssetManager');
		}

		if (DEBUG)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * Reference to the Task Manager
		 * @property {springroll.AssetManager} manager
		 */
		this.manager = manager;

		/**
		 * Handler when completed with all tasks
		 * @property {function} complete
		 * @default  null
		 */
		this.complete = complete || null;

		/**
		 * How to display the results, either as single (0), map (1) or list (2)
		 * @property {int} mode
		 * @default 1
		 */
		this.mode = MAP_MODE;

		/**
		 * If we should run the tasks in parallel (true) or serial (false)
		 * @property {Boolean} parallel
		 * @default false
		 */
		this.parallel = !!parallel;

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

		// Update the results mode and tasks
		this.mode = this.addTasks(assets);

		// Set the default container for the results
		this.results = getAssetsContainer(this.mode);

		// Start running
		this.nextTask();
	};

	// Reference to prototype
	var s = EventDispatcher.prototype;
	var p = extend(AssetLoad, EventDispatcher);

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
	 * When all events are completed
	 * @event complete
	 */
		
	/**
	 * When the loader result has been destroyed
	 * @event destroyed
	 */
	
	/**
	 * When a task is finished
	 * @event progress
	 * @param {springroll.LoaderResult|*} result The load result
	 * @param {Object} originalAsset The original asset loaded
	 * @param {Array} assets The object collection to add new assets to.
	 */

	/**
	 * Create a list of tasks from assets
	 * @method  addTasks
	 * @private
	 * @param  {Object|Array} assets The assets to load
	 */
	p.addTasks = function(assets)
	{
		if (this.destroyed)
		{
			if (DEBUG && Debug)
			{
				Debug.warn("AssetLoad is already destroyed");
			}
			return;
		}
		
		var asset;
		var mode = MAP_MODE;

		// Apply the defaults incase this is a single 
		// thing that we're trying to load
		assets = applyDefaults(assets);

		// Check for a task definition on the asset
		var isSingle = this.getTaskByAsset(assets);

		if (isSingle)
		{
			this.addTask(assets);
			return SINGLE_MODE;
		}
		else
		{
			if (Array.isArray(assets))
			{
				for (var i = 0; i < assets.length; i++)
				{
					asset = applyDefaults(assets[i]);

					if (!asset.id)
					{
						// If we don't have the id to return
						// a mapped result, we'll fallback to array results
						mode = LIST_MODE;
					}
					this.addTask(asset);
				}
			}
			else if (isObject(assets))
			{
				for(var id in assets)
				{
					asset = applyDefaults(assets[id]);

					if (!asset.id)
					{
						asset.id = id;
					}
					this.addTask(asset);
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
			return { src: asset };
		}
		// convert to a FunctionTask
		else if (isFunction(asset))
		{
			return { async: asset };
		}
		return asset;
	}

	/**
	 * Load a single asset
	 * @method addTask
	 * @private
	 * @param {Object} asset The asset to load, 
	 *        can either be an object, URL/path, or async function.
	 */
	p.addTask = function(asset)
	{
		var TaskClass = this.getTaskByAsset(asset);
		if (TaskClass)
		{
			this.tasks.push(new TaskClass(asset));
		}
		else if (DEBUG && Debug)
		{
			Debug.error("Unable to find a task definitation for asset", asset);
		}
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
				if (!this.parallel) return;
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
		if (this.destroyed) return;

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
		var additionalAssets = [];

		// Handle the file load tasks
		if (result)
		{
			// Handle the result
			switch(this.mode)
			{
				case SINGLE_MODE: this.results = result; break;
				case LIST_MODE: this.results.push(result); break;
				case MAP_MODE: this.results[task.id] = result; break;
			}

			// Should we cache the task?
			if (task.cache)
			{
				this.manager.cache.write(
					task.id, 
					(result instanceof LoaderResult) ? 
						result.content : 
						result
				);
			}
		}

		// If the task has a complete method
		// we'll make sure that gets called
		// with a reference to the tasks
		// can potentially add more
		if (task.complete)
		{
			task.complete(result, task.originalAsset, additionalAssets);
		}
		this.trigger('progress', result, task.originalAsset, additionalAssets);

		task.destroy();

		// Add new assets to the things to load
		var mode = this.addTasks(additionalAssets);

		// Check to make sure if we're in 
		// map mode, we keep it that way
		if (this.mode === MAP_MODE && mode !== this.mode)
		{
			if (DEBUG && Debug)
			{
				Debug.error("Load assets require IDs to return mapped results", additionalAssets);
			}
			throw "Assets require IDs";
		}

		if (this.tasks.length)
		{
			// Run the next task
			this.nextTask();
		}
		else
		{
			// We're finished!
			if (this.complete)
			{
				this.complete(this.results);
			}
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
		switch(mode)
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
		this.trigger('destroyed');
		this.tasks.forEach(function(task)
		{
			task.status = Task.FINISHED;
			task.destroy();
		});
		this.results = null;
		this.complete = null;
		this.tasks = null;
		this.manager = null;
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
	namespace('springroll').AssetLoad = AssetLoad;

}());