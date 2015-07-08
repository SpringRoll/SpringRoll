/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	/**
	 * Internal class for dealing with async load assets
	 * @class MultiTask
	 * @abstract
	 */
	var MultiTask = function()
	{
		/**
		 * The current status of the task (waiting, running, etc)
		 * @property {int} status
		 * @default 0
		 */
		this.status = MultiTask.WAITING;
	};

	// Reference to prototype
	var p = MultiTask.prototype;

	/**
	 * Status for waiting to be run
	 * @property {int} WAITING
	 * @static
	 * @readOnly
	 * @final
	 * @default 0
	 */
	MultiTask.WAITING = 0;

	/**
	 * Task is currently being run
	 * @property {int} RUNNING
	 * @static
	 * @readOnly
	 * @final
	 * @default 1
	 */
	MultiTask.RUNNING = 1;

	/**
	 * Status for task is finished
	 * @property {int} FINISHED
	 * @static
	 * @readOnly
	 * @final
	 * @default 2
	 */
	MultiTask.FINISHED = 2;

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.status = MultiTask.RUNNING;
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.status = MultiTask.FINISHED;
	};

	// Assign to namespace
	namespace('springroll').MultiTask = MultiTask;

}());