/**
*  @module Core
*  @namespace springroll
*/
(function(undefined)
{
	var MultiLoaderResult = include('springroll.MultiLoaderResult'),
		Task = include('springroll.Task'),
		Debug;
	
	/**
	 * Handle the asynchronous loading of multiple assets.
	 * @class MultiLoader
	 * @constructor
	 */
	var MultiLoader = function()
	{
		if (DEBUG)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The collection of current multiloads
		 * @property {Array} loads
		 */
		this.loads = [];
	};

	// reference to prototype
	var p = MultiLoader.prototype;

	/**
	 * Register new tasks types, these tasks must extend Task
	 * @method register
	 * @private
	 * @param {Function|String} TaskClass The class task reference
	 * @param {int} [priority=0] The priority, higher prioity tasks
	 *        are tested first. More general Tasks should be lower
	 *        and more specific tasks should be higher.
	 */
	p.register = function(TaskClass, priority)
	{
		if (typeof TaskClass == "string")
		{
			TaskClass = include(TaskClass);
		}

		TaskClass.priority = priority || 0;

		if (DEBUG && Debug)
		{
			if (!(TaskClass.prototype instanceof Task))
			{
				Debug.error("Registering task much extend Task", TaskClass);
			}
			else if (!TaskClass.test)
			{
				Debug.error("Registering task much have test method");
			}
		}
		_taskDefs.push(TaskClass);

		// Sort definitions by priority
		// where the higher priorities are first
		_taskDefs.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	/**
	 * The collection of task definitions
	 * @property {Array} _taskDefs
	 * @static
	 * @private
	 */
	var _taskDefs = [];

	/**
	 * The collection of task definitions
	 * @property {Array} taskDefs
	 * @static
	 * @readOnly
	 */
	Object.defineProperty(MultiLoader, "taskDefs",
	{
		get: function()
		{
			return _taskDefs;
		}
	});

	/**
	 * Load a bunch of assets, can only call one load at a time
	 * @method load
	 * @param {Object|Array} asset The assets to load
	 * @param {function} [complete] The function when finished
	 * @param {Boolean} [startAll=true] If we should run all the tasks at once, in parallel
	 * @return {springroll.MultiLoaderResult} The reference to the current load
	 */
	p.load = function(assets, complete, startAll)
	{	
		var result = new MultiLoaderResult(
			assets, 
			complete,
			(startAll === undefined ? true : !!startAll)
		);

		// Add to the stack of current loads
		this.loads.push(result);

		// Handle the destroyed event
		result.once(
			'complete',
			this._onLoaded.bind(this, result)
		);

		return result;
	};

	/**
	 * Handler when a load is finished
	 * @method _onLoaded
	 * @private
	 * @param {springroll.MultiLoaderResult} result The current load
	 */
	p._onLoaded = function(result)
	{
		var index = this.loads.indexOf(result);
		if (index > -1)
		{
			this.loads.splice(index, 1);
		}
		result.destroy();
	};

	/**
	 * Destroy the Multiloader
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.loads = null;

		// Unregister all task definitions
		_taskDefs.length = 0;
	};

	// Assign to namespace
	namespace('springroll').MultiLoader = MultiLoader;

}());