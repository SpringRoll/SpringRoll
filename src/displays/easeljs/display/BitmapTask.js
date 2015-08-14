/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var LoadTask = include('springroll.LoadTask'),
		Bitmap = include('createjs.Bitmap'),
		Application = include('springroll.Application');

	/**
	 * Created a createjs Bitmap from a loaded image
	 * @class BitmapTask
	 * @extends springroll.LoadTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The path to the spritesheet
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 */
	var BitmapTask = function(asset)
	{
		LoadTask.call(this, asset);
	};

	// Reference to prototype
	var s = LoadTask.prototype;
	var p = extend(BitmapTask, LoadTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	BitmapTask.test = function(asset)
	{
		return asset.src && 
			asset.type == "easeljs" && 
			asset.format == "createjs.Bitmap";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		s.start.call(this, function(img)
		{
			var bitmap = new Bitmap(img);
			bitmap.destroy = function()
			{
				this.removeAllEventListeners();
				this.image.src = "";
			};
			callback(bitmap);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').BitmapTask = BitmapTask;

}());