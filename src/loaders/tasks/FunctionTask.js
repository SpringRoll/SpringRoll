/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for dealing with async function calls with MultiLoader.
	 * @class FunctionTask
	 * @extends springroll.Task
	 * @constructor
	 * @param {Function} async The data properties
	 */
	var FunctionTask = function(async)
	{
		Task.call(this);

		/**
		 * The asynchronous call
		 * @property {Function} async
		 */
		this.async = async;
	};

	// Reference to prototype
	var p = extend(FunctionTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {*} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FunctionTask.test = function(asset)
	{
		return typeof asset == "function";
	};

	/**
	 * Start the task
	 * @method start
	 * @param {Function} callback Callback when done
	 */
	p.start = function(callback)
	{
		this.async(callback);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.async = null;
	};

	// Assign to namespace
	namespace('springroll').FunctionTask = FunctionTask;

}());