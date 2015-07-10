/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var LoadTask = include('springroll.LoadTask'),
		FlashArt = include('springroll.easeljs.FlashArt'),
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class FlashArtTask
	 * @extends springroll.LoadTask
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The source
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {*} [asset.data] Optional data
	 * @param {int} [asset.priority=0] The priority
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Function} [asset.progress] The event to call on load progress
	 * @param {String} [asset.libItem='lib'] The global window object for symbols
	 */
	var FlashArtTask = function(asset)
	{
		LoadTask.call(this, asset);

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';
	};

	// Reference to prototype
	var p = extend(FlashArtTask, LoadTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtTask.test = function(asset)
	{
		// loading a JS file from Flash
		return !!asset.src && asset.src.search(/\.js$/i) > -1;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		LoadTask.prototype.start.call(this, function(result)
		{
			callback(new FlashArt(
				this.id,
				result.content, 
				this.libName 
			));
		}
		.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtTask = FlashArtTask;

}());