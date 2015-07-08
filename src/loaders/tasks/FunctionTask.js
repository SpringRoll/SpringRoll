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
	 * @param {Object} data The data properties
	 * @param {Function} data.async The required function to call
	 * @param {Function} [data.complete] The function to call when we're done
	 * @param {String} [data.id] The task id for mapping the result, if any
	 */
	var FunctionTask = function(data)
	{
		Task.call(this, data);

		/**
		 * The asynchronous call
		 * @property {Function} async
		 */
		this.async = data.async;
	};

	// Reference to prototype
	var p = extend(FunctionTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FunctionTask.test = function(asset)
	{
		return !!asset.async;
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
		Task.prototype.destroy.call(this);
		this.async = null;
	};

	// Assign to namespace
	namespace('springroll').FunctionTask = FunctionTask;

}());