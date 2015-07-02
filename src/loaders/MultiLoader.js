/**
*  @module Core
*  @namespace springroll
*/
(function(undefined)
{
	var MultiLoaderResult = include('springroll.MultiLoaderResult');
	
	/**
	 * Handle the asynchronous loading of multiple assets.
	 * @class MultiLoader
	 * @constructor
	 */
	var MultiLoader = function()
	{
		/**
		 * The collection of current multiloads
		 * @property {Array} loads
		 */
		this.loads = [];
	};

	// reference to prototype
	var p = MultiLoader.prototype;

	/**
	 * Load a bunch of assets, can only call one load at a time
	 * @method load
	 * @param {Object|Array} asset The assets to load
	 * @param {function} [complete] The function when finished
	 * @param {Boolean} [startAll=true] If we should run all the tasks at once, in parallel
	 * @return {springroll.MultiLoaderResult} The reference to the current load
	 */
	p.load = function(assets, complete, startAll)
	{	
		var result = new MultiLoaderResult(
			assets, 
			complete,
			(startAll === undefined ? true : !!startAll)
		);

		// Add to the stack of current loads
		this.loads.push(result);

		// Handle the destroyed event
		result.once(
			'complete',
			this._onLoaded.bind(this, result)
		);

		return result;
	};

	/**
	 * Handler when a load is finished
	 * @method _onLoaded
	 * @private
	 * @param {springroll.MultiLoaderResult} result The current load
	 */
	p._onLoaded = function(result)
	{
		var index = this.loads.indexOf(result);
		if (index > -1)
		{
			this.loads.splice(index, 1);
		}
		result.destroy();
	};

	/**
	 * Destroy the Multiloader
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.loads = null;
	};

	// Assign to namespace
	namespace('springroll').MultiLoader = MultiLoader;

}());