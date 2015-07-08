/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	/**
	 * Internal class for dealing with async load assets
	 * @class Task
	 * @abstract
	 * @constructor
	 * @param {Object} data The asset data
	 * @param {String} [data.id] The task ID
	 * @param {Function} [data.complete] Call when complete
	 */
	var Task = function(data)
	{
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
		this.complete = data.complete || null;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = data.id || null;

		/**
		 * Reference to the original asset data
		 * @property {Object} originalAsset
		 */
		this.originalAsset = data;
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