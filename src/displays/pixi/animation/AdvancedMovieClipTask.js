/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	var TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		AdvancedMovieClip = include('springroll.pixi.AdvancedMovieClip');

	/**
	 * Internal class for loading and instantiating an AdvancedMovieClip.
	 * @class AdvancedMovieClipTask
	 * @extends springroll.TextureAtlasTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type This must be "pixi" to signify that this asset should be
	 *                            handled as an AdvancedMovieClip, instead of the otherwise
	 *                            identical BitmapMovieClip.
	 * @param {String} asset.anim Path to the JSON configuration for AdvancedMovieClip
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var AdvancedMovieClipTask = function(asset)
	{
		TextureAtlasTask.call(this, asset, asset.anim);

		/**
		 * The AdvancedMovieClip data source path
		 * @property {String} anim
		 */
		this.anim = this.filter(asset.anim);
	};

	// Reference to prototype
	var p = TextureAtlasTask.extend(AdvancedMovieClipTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	AdvancedMovieClipTask.test = function(asset)
	{
		return !!asset.anim && TextureAtlasTask.test(asset);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas(
		{
			_anim: this.anim
		}, function(textureAtlas, results)
		{
			var clip = new AdvancedMovieClip(results._anim, textureAtlas);
			//override destroy on clip to destroy textureAtlas as well
			clip.__AMC_destroy = clip.destroy;
			clip.destroy = function()
			{
				clip.__AMC_destroy();
				textureAtlas.destroy();
			};
			callback(clip, results);
		}, true);
	};

	// Assign to namespace
	namespace('springroll.pixi').AdvancedMovieClipTask = AdvancedMovieClipTask;

}());