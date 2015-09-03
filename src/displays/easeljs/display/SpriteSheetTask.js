/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		SpriteSheet = include('createjs.SpriteSheet');

	/**
	 * Create a createjs.SpriteSheet object, see SpriteSheet for more information
	 * @class SpriteSheetTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {Array} asset.images The source images
	 * @param {Array} asset.frames The SpriteSheet source frame data
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.globalProperty='ss'] The global window object for spritesheets
	 */
	var SpriteSheetTask = function(asset)
	{
		Task.call(this, asset, asset.images[0]);

		/**
		 * The collection of images paths
		 * @property {String} images
		 */
		this.images = asset.images;

		/**
		 * The frame definitions as used by the createjs.SpriteSheet object
		 * @property {Array|Object} frames
		 */
		this.frames = asset.frames;

		/**
		 * The name of the window object library items hang on
		 * @property {String} globalProperty
		 * @default 'ss'
		 */
		this.globalProperty = asset.globalProperty || 'ss';
	};

	// Reference to prototype
	var p = extend(SpriteSheetTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SpriteSheetTask.test = function(asset)
	{
		return asset.images &&
			asset.type == "easeljs" &&
			Array.isArray(asset.images) &&
			asset.frames;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var globalProperty = this.globalProperty;
		var id = this.id;
		var frames = this.frames;

		this.load(this.images, function(results)
		{
			var spriteSheet = new SpriteSheet({
				images: results,
				frames: frames
			});

			// Add to the window
			namespace(globalProperty)[id] = spriteSheet;

			// When spritesheet is destroyed, remove properties
			spriteSheet.addEventListener('destroy', function()
			{
				delete window[globalProperty][id];
				for(var i = results.length - 1; i >= 0; --i)
					results[i].src = "";
			});

			// Return spritesheet
			callback(spriteSheet);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').SpriteSheetTask = SpriteSheetTask;

}());