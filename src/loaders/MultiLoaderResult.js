/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var MultiTask = include('springroll.MultiTask'),
		MultiLoaderTask = include('springroll.MultiLoaderTask'),
		MultiAsyncTask = include('springroll.MultiAsyncTask'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Class that represents a single multi load
	 * @class MultiLoaderResult
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {Object|Array} assets The collection of assets to load
	 * @param {Function} [complete=null] Function call when done, returns results
	 * @param {Boolean} [parallel=false] If we should run the tasks in ordeer
	 */
	var MultiLoaderResult = function(assets, complete, parallel)
	{
		EventDispatcher.call(this);

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
	 * When all events are completed
	 * @event complete
	 */
		
	/**
	 * When the loader result has been destroyed
	 * @event destroyed
	 */
	
	/**
	 * When a task is finished
	 * @event taskDone
	 * @param {springroll.LoaderResult} result The load result
	 * @param {Object|Array} assets The object collection
	 *        to add new assets to.
	 */

	/**
	 * Create a list of tasks from assets
	 * @method  addTasks
	 * @protected
	 * @param  {Object|Array} assets The assets to load
	 */
	p.addTasks = function(assets)
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
					this.addTask(asset, id);
				}
				.bind(this));
			}
			else if (isObject(assets))
			{
				for(var id in assets)
				{
					this.addTask(assets[id], id);
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
	 * Run the next task that's waiting
	 * @method  nextTask
	 */
	p.nextTask = function()
	{
		var tasks = this.tasks;
		for (var i = 0; i < tasks.length; i++)
		{
			var task = tasks[i];
			if (task.status === MultiTask.WAITING)
			{
				task.start(this.taskDone.bind(this, task));
				
				// If we aren't running in parallel, then stop
				if (!this.parallel) return;
			}
		}
	};

	/**
	 * Load a single asset
	 * @method addTask
	 * @param {Object|String|Function} asset The asset to load, 
	 *        can either be an object, URL/path, or async function.
	 */
	p.addTask = function(asset, id)
	{
		var task;
		if (isFunction(asset))
		{
			task = new MultiAsyncTask(asset);
		}
		else
		{
			task = new MultiLoaderTask(asset, id);
		}
		this.tasks.push(task);
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
		var assets = getAssetsContainer(this.mode);

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
		}
		task.destroy();

		// Add new assets
		this.addTasks(assets);

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