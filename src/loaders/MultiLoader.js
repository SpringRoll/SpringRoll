/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var MultiLoaderResult = include('springroll.MultiLoaderResult');
	
	/**
	 * Handle the asynchronous loading of multiple assets.
	 * @class MultiLoader
	 * @constructor
	 * @param {springroll.Application} app The application reference
	 * @param {Array|Object} assets The assets to load, either a list or map or single asset.
	 * @param {Function} [complete] Completed function
	 */
	var MultiLoader = function(loader)
	{
		/**
		 * Reference to the loader
		 * @property {springroll.Loader} loader
		 */
		this.loader = loader;

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
	 * @param {function} complete The function when finished
	 * @return {springroll.MultiLoaderResult} The reference to the current load
	 */
	p.load = function(assets, complete)
	{	
		var result = new MultiLoaderResult(
			this.loader, 
			assets, 
			complete
		);

		// Add to the stack of current loads
		this.loads.push(result);

		// Handle the destroyed event
		result.once(
			'completed',
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
		this.loader = null;
		this.loads = null;
	};

	// Assign to namespace
	namespace('springroll').MultiLoader = MultiLoader;

}());