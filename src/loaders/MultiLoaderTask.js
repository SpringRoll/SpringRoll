/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var MultiTask = include('springroll.MultiTask'),
		Loader;

	/**
	 * Internal class for dealing with async load assets
	 * @class MultiLoaderTask
	 * @extends springroll.MultiTask
	 * @constructor
	 * @param {String|Object} data The data properties
	 * @param {String|Number} fallbackId The fallback id if none is set in data
	 */
	var MultiLoaderTask = function(data, fallbackId)
	{
		if (!Loader)
		{
			Loader = include('springroll.Loader');
		}
		
		MultiTask.call(this);

		if (typeof data == "string")
		{
			data = { src:data };
		}

		/**
		 * The source URL to load
		 * @property {String} src
		 */
		this.src = data.src;

		/**
		 * Call when done with this load
		 * @property {Function} complete
		 */
		this.complete = data.complete;

		/**
		 * Call on load progress
		 * @property {Function} progress
		 */
		this.progress = data.progress;

		/**
		 * Load progress
		 * @property {int} priority
		 */
		this.priority = data.priority;

		/**
		 * Optional data to attach to load
		 * @property {*} data
		 */
		this.data = data.data;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = data.id || String(fallbackId);
	};

	// Reference to prototype
	var s = MultiTask.prototype;
	var p = extend(MultiLoaderTask, MultiTask);

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		s.start.call(this);
		
		Loader.instance.load(
			this.src,
			callback,
			this.progress,
			this.priority,
			this.data
		);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		s.destroy.call(this);
		
		this.complete = null;
		this.progress = null;
	};

	// Assign to namespace
	namespace('springroll').MultiLoaderTask = MultiLoaderTask;

}());