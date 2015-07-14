/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Task = include('springroll.Task'),
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class ListTask
	 * @extends springroll.Task
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {Array|Object} asset.assets The collection of assets to load
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete=null] The event to call when done
	 */
	var ListTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The collection of assets to load
		 * @property {Array|Object} assets
		 */
		this.assets = asset.assets;
	};

	// Reference to prototype
	var p = extend(ListTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	ListTask.test = function(asset)
	{
		return !!asset.assets && (Array.isArray(asset.assets) || Object.isPlain(asset.assets));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		Application.instance.load(this.assets, callback);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
		this.assets = null;
	};

	// Assign to namespace
	namespace('springroll').ListTask = ListTask;

}());