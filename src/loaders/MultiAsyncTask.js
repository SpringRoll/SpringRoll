/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var MultiTask = include('springroll.MultiTask');

	/**
	 * Internal class for dealing with async load assets
	 * @class MultiAsyncTask
	 * @extends springroll.MultiTask
	 * @constructor
	 * @param {Function} async The data properties
	 */
	var MultiAsyncTask = function(async)
	{
		MultiTask.call(this);

		/**
		 * The asynchronous call
		 * @property {Function} async
		 */
		this.async = async;
	};

	// Reference to prototype
	var s = MultiTask.prototype;
	var p = extend(MultiAsyncTask, MultiTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {*} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	MultiAsyncTask.test = function(asset)
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
		s.start.call(this);
		this.async(callback);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		s.destroy.call(this);
		this.async = null;
	};

	// Assign to namespace
	namespace('springroll').MultiAsyncTask = MultiAsyncTask;

}());