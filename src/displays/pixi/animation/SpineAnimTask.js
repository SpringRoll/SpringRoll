/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var Application = include('springroll.Application'),
		Task = include('springroll.Task'),
		TextureAtlasTask = include('springroll.pixi.TextureAtlasTask'),
		atlasParser = include('PIXI.spine.loaders.atlasParser', false),
		SkeletonJsonParser = include('PIXI.spine.SpineRuntime.SkeletonJsonParser', false),
		AtlasAttachmentParser = include('PIXI.spine.SpineRuntime.AtlasAttachmentParser', false),
		SpineAtlasTask = include('springroll.pixi.SpineAtlasTask', false);
	
	if(!atlasParser) return;
	
	//TODO:
	// atlasParser - primary entry point : https://github.com/pixijs/pixi-spine/blob/master/src/loaders/atlasParser.js
	// Atlas - needs TextureTasks to load : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/Atlas.js
	// AtlasAttachmentParser - provides regions to skeleton parser : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/AtlasAttachmentParser.js
	// SkeletonJsonParser - final step : https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/SkeletonJsonParser.js

	/**
	 * SpineAnimTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
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
		 * @property {String} spineAtlas
		 */
		this.atlas = asset.spineAtlas;
	};

	// Extend the base Task
	var p = extend(SpineAnimTask, Task);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	SpineAnimTask.test = function(asset)
	{
		//TODO: Use TextureAtlasTask and SpineAtlasTask to ensure asset.atlas is formatted correctly
		return !!asset.spineAnim &&
				!!asset.atlas &&
				(TextureAtlasTask.test(asset.atlas) || SpineAtlasTask.test(asset.atlas));
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		Application.instance.load({_anim: this.spineAnim, _atlas: this.atlas}, function(results)
		{
			var spineAtlas = results._atlas;

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