/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Debug;

	/**
	 * Internal class for dealing with async load assets
	 * @class Task
	 * @abstract
	 * @constructor
	 * @param {Object} asset The asset data
	 * @param {String} [asset.id=null] The task ID
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} [asset.complete=null] Call when complete
	 */
	var Task = function(asset)
	{
		if (Debug === undefined)
		{
			Debug = include("springroll.Debug", false);
		}
		
		/**
		 * The current status of the task (waiting, running, etc)
		 * @property {int} status
		 * @default 0
		 */
		this.status = Task.WAITING;

		/**
		 * The user call to fire when completed, returns the arguments
		 * result, originalAsset, and additionalAssets
		 * @property {Function} complete
		 * @default null
		 */
		this.complete = asset.complete || null;

		/**
		 * If we should cache the load and use later
		 * @property {Boolean} cache
		 * @default false
		 */
		this.cache = !!asset.cache;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = asset.id || null;

		/**
		 * Reference to the original asset data
		 * @property {Object} originalAsset
		 */
		this.originalAsset = asset;

		// Check for ID if we're caching
		if (this.cache && !this.id)
		{
			if (DEBUG && Debug)
			{
				Debug.error("Caching an asset requires and id, none set", asset);
			}
			this.cache = false;
		}
	};

	// Reference to prototype
	var p = Task.prototype;

	/**
	 * Status for waiting to be run
	 * @property {int} WAITING
	 * @static
	 * @readOnly
	 * @final
	 * @default 0
	 */
	Task.WAITING = 0;

	/**
	 * Task is currently being run
	 * @property {int} RUNNING
	 * @static
	 * @readOnly
	 * @final
	 * @default 1
	 */
	Task.RUNNING = 1;

	/**
	 * Status for task is finished
	 * @property {int} FINISHED
	 * @static
	 * @readOnly
	 * @final
	 * @default 2
	 */
	Task.FINISHED = 2;

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		callback();
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.status = Task.FINISHED;
		this.id = null;
		this.complete = null;
		this.originalAsset = null;
	};

	// Assign to namespace
	namespace('springroll').Task = Task;

}());