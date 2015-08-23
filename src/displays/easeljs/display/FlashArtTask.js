/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		FlashArt = include('springroll.easeljs.FlashArt'),
		Application = include('springroll.Application'),
		ColorAlphaTask = include('springroll.ColorAlphaTask'),
		BitmapUtils = include('springroll.easeljs.BitmapUtils');

	/**
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that pulls the image from a spritesheet.
	 * @class FlashArtTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {String} asset.format Asset format must be "springroll.easeljs.FlashArt"
	 * @param {String} asset.src The source
	 * @param {Array} [asset.images] An array of Image, TextureAtlas, or SpriteSheet assets to load
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libName='lib'] The global window object for symbols
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtTask = function(asset)
	{
		Task.call(this, asset, asset.src);

		if (!BitmapUtils)
		{
			BitmapUtils = include('springroll.easeljs.BitmapUtils');
		}

		/**
		 * The path to the flash asset
		 * @property {String} src
		 */
		this.src = this.filter(asset.src);
		
		/**
		 * The path to the flash asset
		 * @property {String} src
		 */
		this.images = asset.images;

		/**
		 * The spritesheet data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);

		/**
		 * The spritesheet source path
		 * @property {String} image
		 */
		this.image = this.filter(asset.image);

		/**
		 * The spritesheet color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The spritesheet alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';
		
		/**
		 * The name of the window object images hang on
		 * @property {String} imagesName
		 * @default 'images'
		 */
		this.imagesName = asset.imagesName || 'images';
	};

	// Reference to prototype
	var p = extend(FlashArtTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtTask.test = function(asset)
	{
		return asset.src &&
			asset.src.search(/\.js$/i) > -1 &&
			asset.type == "easeljs" &&
			asset.format == "springroll.easeljs.FlashArt";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var images = [];
		var atlas, assetCount = 0;
		//handle the deprecated format
		if(this.atlas)
		{
			atlas = {
				atlas:this.atlas,
				id: "asset_" + (assetCount++),
				type: "easeljs",
				format: "FlashAtlas",
				libName: this.libName
			};
			if(this.image)
				atlas.image = this.image;
			else
			{
				atlas.alpha = this.alpha;
				atlas.color = this.color;
			}
			images.push(atlas);
		}
		else if(this.images)
		{
			var asset;
			for(var i = 0; i < this.images.length; ++i)
			{
				//check for texture atlases from TexturePacker or similar things
				if(this.images[i].atlas)
				{
					asset = this.images[i];
					atlas = {
						atlas:this.filter(asset.atlas),
						id: "asset_" + (assetCount++),
						type:"easeljs",
						format: "FlashAtlas",
						libName: this.libName
					};
					if(asset.image)
						atlas.image = this.filter(asset.image);
					else
					{
						atlas.alpha = this.filter(asset.alpha);
						atlas.color = this.filter(asset.color);
					}
					images.push(atlas);
				}
				//Check for EaselJS SpriteSheets
				else if(this.images[i].format == "createjs.SpriteSheet")
				{
					asset = this.images[i].clone();
					images.push(asset);
					if(!asset.type)
						asset.type = "easeljs";
					if(!asset.id)
						asset.id = "asset_" + (assetCount++);
				}
				//standard images
				else
				{
					//check for urls
					if(typeof this.images[i] == "string")
						asset = {src:this.filter(this.images[i])};
					//and full tasks
					else
						asset = this.images[i].clone();
					//ensure an ID for these
					if(!asset.id)
					{
						var fallbackId = asset.src || asset.color;
						// Remove the file extension
						var extIndex = fallbackId.lastIndexOf('.');
						if (extIndex > -1)
						{
							fallbackId = fallbackId.substr(0, extIndex);
						}
						// Check for the last folder slash then remove it
						var slashIndex = fallbackId.lastIndexOf('/');
						if (slashIndex > -1)
						{
							fallbackId = fallbackId.substr(slashIndex + 1);
						}
						asset.id = fallbackId;
					}
					//also ensure that they are EaselJS Image assets
					asset.type = "easeljs";
					asset.format = "FlashImage";
					asset.imagesName = this.imagesName;
					images.push(asset);
				}
			}
		}
		
		var assets = {
			_flash : this.src
		};
		if(images.length)
			assets._images = {assets:images};

		// Load all the assets
		Application.instance.load(assets, function(results)
		{
			var art = new FlashArt(
				this.id,
				results._flash,
				this.libName
			);
			
			console.log(results._images);
			
			var images = results._images;
			if(images)
			{
				var image;
				var objectsToDestroy = [];
				var globalImages = window[this.imagesName];
				
				for(var id in images)
				{
					var result = images[id];
					//save the item for cleanup
					objectsToDestroy.push(result);
					//look for individual images
					if(result.image && result.scale)
					{
						//scale asset if needed
						if(result.scale != 1)
							Bitmap.replaceWithScaledBitmap(id, 1 / result.scale, this.libName);
						objectsToDestroy.push(result);
					}
					//otherwise the result is a SpriteSheet or the result of a FlashArtAtlasTask
					else if(result.create)
					{
						//FlashArtAtlasTasks have delayed asset generation to ensure that it doesn't
						//interfere with the loading of the javascript that it overrides
						result.create();
					}
				}
				
				art._orig_destroy = art.destroy;
				art.destroy = function()
				{
					var i;
					for(i = objectsToDestroy.length - 1; i >= 0; --i)
					{
						if(objectsToDestroy[i].destroy)
							objectsToDestroy[i].destroy();
						else
							objectsToDestroy[i].dispatchEvent("destroy");
					}
					art._orig_destroy();
				};
			}
			
			callback(art);
			
		}.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtTask = FlashArtTask;

}());