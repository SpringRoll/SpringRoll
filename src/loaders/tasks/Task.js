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
	 */
	var Task = function()
	{
		/**
		 * The current status of the task (waiting, running, etc)
		 * @property {int} status
		 * @default 0
		 */
		this.status = Task.WAITING;
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
		// implementation specific
	};

	// Assign to namespace
	namespace('springroll').Task = Task;

}());