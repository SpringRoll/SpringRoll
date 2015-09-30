/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var LoadTask = include('springroll.LoadTask');

	/**
	 * Created a createjs Spritesheet from the Flash export
	 * @class FlashSpriteSheetTask
	 * @extends springroll.LoadTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The path to the spritesheet
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {String} asset.format Asset format must be "createjs.SpriteSheet"
	 * @param {String} [asset.globalProperty='ss'] The name of the global property
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.globalProperty='ss'] The global window object for spritesheets
	 */
	var FlashSpriteSheetTask = function(asset)
	{
		LoadTask.call(this, asset);

		/**
		 * The name of the window object library items hang on
		 * @property {String} globalProperty
		 * @default 'ss'
		 */
		this.globalProperty = asset.globalProperty || 'ss';
	};

	// Reference to prototype
	var s = LoadTask.prototype;
	var p = extend(FlashSpriteSheetTask, LoadTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashSpriteSheetTask.test = function(asset)
	{
		return asset.src &&
			asset.type == "easeljs" &&
			asset.format == "createjs.SpriteSheet";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var prop = this.globalProperty;
		var id = this.id;
		s.start.call(this, function(data)
			{
				data.id = id;
				data.globalProperty = prop;
				data.type = "easeljs";
				this.load(data, callback);
			}
			.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashSpriteSheetTask = FlashSpriteSheetTask;

}());