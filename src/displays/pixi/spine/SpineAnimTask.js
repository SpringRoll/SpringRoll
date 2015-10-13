/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		atlasParser = include('PIXI.spine.loaders.atlasParser', false),
		SkeletonJsonParser = include('PIXI.spine.SpineRuntime.SkeletonJsonParser', false),
		AtlasAttachmentParser = include('PIXI.spine.SpineRuntime.AtlasAttachmentParser', false),
		SpineAtlasTask = include('springroll.pixi.SpineAtlasTask', false),
		SpineAtlas = include('springroll.pixi.SpineAtlas', false);

	if (!atlasParser) return;

	/**
	 * SpineAnimTask loads a spine animation and the texture atlas(es) that it needs.
	 * @class SpineAnimTask
	 * @constructor
	 * @private
	 * @param {String} asset.spineAnim The Spine skeleton data image path.
	 * @param {Object} asset.atlas The atlas for the skeleton. This can be a Pixi TextureAtlas
	 *                                  asset or a Spine specific atlas.
	 * @param {String} asset.atlas.type Must be "pixi" to ensure that the atlas is loaded for Pixi.
	 * @param {String} [asset.atlas.atlas] (TextureAtlas) The source data path for a TextureAtlas.
	 * @param {String} [asset.atlas.image] (TextureAtlas) A image path for a TextureAtlas
	 * @param {String} [asset.atlas.color] (TextureAtlas) The color image path, if not using image
	 *                                     property
	 * @param {String} [asset.atlas.alpha] (TextureAtlas) The alpha image path, if not using image
	 *                                     property
	 * @param {String} [asset.atlas.spineAtlas] (Spine Atlas) The source data path for an atlas
	 *                                          exported from Spine, with a .txt or .atlas
	 *                                          extension.
	 * @param {Array} [asset.atlas.images] (Spine Atlas) A set of image paths for the spineAtlas
	 *                                     data file to pull from.
	 * @param {Object} [asset.extraImages] A dictionary of extra Texture assets to add to the atlas.
	 *                                     This should be useful if you have individual images not
	 *                                     added to a TextureAtlas.
	 * @param {Boolean} [asset.cache=false] If we should cache the result - caching results in
	 *                                      caching in the global Pixi texture cache as well as
	 *                                      Application's asset cache.
	 * @param {String} [asset.id] The id of the task.
	 * @param {Function} [asset.complete] The callback to call when the load is completed.
	 */
	var SpineAnimTask = function(asset)
	{
		Task.call(this, asset, asset.spineAnim);

		/**
		 * The skeleton data source path
		 * @property {String} spineAnim
		 */
		this.spineAnim = this.filter(asset.spineAnim);

		/**
		 * The spine atlas data source path
		 * @property {String} atlas
		 */
		this.atlas = asset.atlas;

		/**
		 * Extra images to be added to the atlas
		 * @property {String} extraImages
		 */
		this.extraImages = asset.extraImages;
	};

	// Extend the base Task
	var p = Task.extend(SpineAnimTask);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	SpineAnimTask.test = function(asset)
	{
		//anim data is required
		if (!asset.spineAnim)
			return false;
		//if atlas exists, make sure it is a valid atlas
		if (asset.atlas &&
			!(TextureAtlasTask.test(asset.atlas) || SpineAtlasTask.test(asset.atlas)))
			return false;
		//if atlas does not exist, extraImages is required
		if (!asset.atlas)
			return !!asset.extraImages;
		//if it made it this far, it checks out
		return true;
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		var asset = {
			_anim: this.spineAnim
		};
		if (this.atlas)
			asset._atlas = this.atlas;
		if (this.extraImages)
			asset._images = {
				assets: this.extraImages
			};

		this.load(asset, function(results)
		{
			var spineAtlas = results._atlas;
			//if we didn't load an atlas, then should make an atlas because we were probably
			//loading individual images
			if (!spineAtlas)
				spineAtlas = new SpineAtlas();
			//if a TextureAtlas was loaded, make a SpineAtlas out of it
			if (!(spineAtlas instanceof SpineAtlas))
			{
				var textureAtlas = spineAtlas;
				spineAtlas = new SpineAtlas();
				spineAtlas.fromTextureAtlas(textureAtlas);
			}
			//see if we need to add in any individual images
			if (results._images)
			{
				for (var name in results._images)
				{
					spineAtlas.addImage(name, results._images[name]);
				}
			}

			// spine animation
			var spineJsonParser = new SkeletonJsonParser(new AtlasAttachmentParser(spineAtlas));
			var skeletonData = spineJsonParser.readSkeletonData(results._anim);

			//store both the atlas and the skeleton data for later cleanup
			var asset = {
				id: this.id,
				spineData: skeletonData,
				spineAtlas: spineAtlas
			};
			//store the skeletonData in the external cache, for standardization
			if (atlasParser.enableCaching && this.cache)
				atlasParser.AnimCache[this.id] = skeletonData;

			//set up a destroy function for cleanly unloading the asset (in particular the atlas)
			asset.destroy = function()
			{
				//remove from external cache
				delete atlasParser.AnimCache[this.id];
				//destroy atlas
				this.spineAtlas.destroy();
				//destroy skeleton data - skeleton data is just a bunch of organized arrays
				//of spine runtime objects, no display objects or anything
				this.spineData = this.spineAtlas = null;
			};

			//return the asset object
			callback(asset, results);
		}.bind(this));
	};

	/**
	 * Destroy this load task and don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
	};

	// Assign to the namespace
	namespace('springroll.pixi').SpineAnimTask = SpineAnimTask;

}());