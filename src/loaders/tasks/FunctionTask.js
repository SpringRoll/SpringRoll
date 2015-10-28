/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for dealing with async function calls with AssetManager.
	 * @class FunctionTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} asset.async The required function to call
	 * @param {Function} [asset.complete] The function to call when we're done
	 * @param {String} [asset.id] The task id for mapping the result, if any
	 */
	var FunctionTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The asynchronous call
		 * @property {Function} async
		 */
		this.async = asset.async;
	};

	// Reference to prototype
	var p = Task.extend(FunctionTask);

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