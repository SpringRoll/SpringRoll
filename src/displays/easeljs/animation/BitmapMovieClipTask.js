/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function()
{
	var TextureAtlasTask = include('springroll.easeljs.TextureAtlasTask'),
		BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip'),
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class BitmapMovieClipTask
	 * @extends springroll.TextureAtlasTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.anim Path to the JSON configuration for BitmapMovieClip
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var BitmapMovieClipTask = function(asset)
	{
		TextureAtlasTask.call(this, asset);

		/**
		 * The BitmapMovieclip data source path
		 * @property {String} anim
		 */
		this.anim = this.filter(asset.anim);
	};

	// Reference to prototype
	var p = extend(BitmapMovieClipTask, TextureAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	BitmapMovieClipTask.test = function(asset)
	{
		return asset.anim && TextureAtlasTask.test(asset);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas({ _anim: this.anim }, function(textureAtlas, results)
		{
			callback(new BitmapMovieClip(
				textureAtlas, 
				results._anim
			), results);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipTask = BitmapMovieClipTask;

}());