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
	 * @class LoadTask
	 * @extends springroll.Task
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The source
	 * @param {String} [asset.id] Id of asset
	 * @param {*} [asset.data] Optional data
	 * @param {int} [asset.priority=0] The priority
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Function} [asset.progress] The event to call on load progress
	 */
	var LoadTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The source URL to load
		 * @property {String} src
		 */
		this.src = asset.src;

		/**
		 * Call on load progress
		 * @property {Function} progress
		 */
		this.progress = asset.progress;

		/**
		 * Load progress
		 * @property {int} priority
		 */
		this.priority = asset.priority;

		/**
		 * Optional data to attach to load
		 * @property {*} data
		 */
		this.data = asset.data;
	};

	// Reference to prototype
	var p = extend(LoadTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	LoadTask.test = function(asset)
	{
		return !!asset.src;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		Application.instance.loader.load(
			this.src,
			callback,
			this.progress,
			this.priority,
			this.data,
			this.originalAsset
		);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
		this.data = null;
		this.progress = null;
	};

	// Assign to namespace
	namespace('springroll').LoadTask = LoadTask;

}());