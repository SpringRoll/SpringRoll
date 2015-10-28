/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		SpineAtlas = include('springroll.pixi.SpineAtlas', false),
		PixiUtils = include('PIXI.utils');

	if (!SpineAtlas) return;

	/**
	 * Internal class for loading a texture atlas in the format exported by Spine.
	 * @class SpineAtlasTask
	 * @extends springroll.pixi.TextureTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} asset.spineAtlas The Spine Atlas source data url - a .txt or .atlas file.
	 * @param {Object} asset.images A number of Texture assets, as referenced by the Atlas data.
	 *                              The property used to index each asset in asset.images should be
	 *                              the file name used in the Atlas data.
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var SpineAtlasTask = function(asset, fallbackId)
	{
		TextureTask.call(this, asset, fallbackId || asset.spineAtlas);

		/**
		 * The Spine Atlas data source path
		 * @property {String} spineAtlas
		 */
		this.spineAtlas = this.filter(asset.spineAtlas);

		this.images = asset.images;
	};

	// Reference to prototype
	var p = TextureTask.extend(SpineAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SpineAtlasTask.test = function(asset)
	{
		// atlas data and one or more images or color/alpha splits
		return !!asset.spineAtlas &&
			Array.isArray(asset.images) &&
			TextureTask.test(asset.images[0]);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.load(
		{
			_atlas: this.spineAtlas,
			_images: this.images
		}, function(results)
		{
			callback(new SpineAtlas(results._atlas, results._images), results);
		});
	};

	// Assign to namespace
	namespace('springroll.pixi').SpineAtlasTask = SpineAtlasTask;

}());