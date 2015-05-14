/**
* @module EaselJS UI
* @namespace springroll.easeljs
* @requires Core, EaselJS Display
*/
(function()
{
	var BitmapUtils,
		TextureAtlas,
		Loader,
		Debug,
		Application,
		TaskManager,
		ListTask;

	/**
	 * Class for managing the loading and unloading of assets.
	 * @class AssetManager
	 * @static
	 */
	var AssetManager = {};

	/**
	*  Array of asset ids that have been loaded by AssetManager.
	*  @property {Array} loadedAssets
	*  @private
	*  @static
	*/
	var loadedAssets = null;

	/**
	*  Dictionary of object definitions in the 'lib' dictionary. Each key is the name of a
	*  definition, with the value being the id of the asset that loaded it.
	*  @property {Object} loadedLibAssets
	*  @private
	*  @static
	*/
	var loadedLibAssets = null;

	/**
	*  Dictionary of TextureAtlas objects, stored by asset id.
	*  @property {Object} textureAtlases
	*  @private
	*  @static
	*/
	var textureAtlases = null;

	/**
	*  Dictionary of BitmapMovieClip configuration objects, stored by asset id.
	*  @property {Object} BMCConfigs
	*  @private
	*  @static
	*/
	var BMCConfigs = null;

	/**
	 * Intializes AssetManager.
	 * @method init
	 * @static
	 */
	AssetManager.init = function()
	{
		if (!Application)
		{
			BitmapUtils = include('springroll.easeljs.BitmapUtils');
			TextureAtlas = include('springroll.easeljs.TextureAtlas');
			Loader = include('springroll.Loader');
			Debug = include('springroll.Debug', false);
			Application = include('springroll.Application');
			TaskManager = include("springroll.TaskManager");
			ListTask = include("springroll.ListTask");
		}

		loadedAssets = [];
		loadedLibAssets = {};
		textureAtlases = {};
		BMCConfigs = {};
	};

	/**
	*  Loads all files need to make a BitmapMovieClip, given that the files are in the same
	*  location with a specific naming convention:
	*
	*  BitmapMovieClip config file: &lt;assetId&gt;.json <br />
	*  BitmapMovieClip textureAtlas json: &lt;assetId&gt;Sprite.json <br />
	*  BitmapMovieClip textureAtlas image: &lt;assetId&gt;Sprite.png
	*
	*  @method loadBitmapMovieClip
	*  @static
	*  @param {String} label The asset id for the BitmapMovieClip
	*  @param {String} [path='assets/sprites/'] The path for all 3 required files.
	*  @param {Function} [callback] A callback for when the BitmapMovieClip assets have finished
	*                               loading.
	*  @param {Array|TaskManager} [taskList] An array or TaskManager to add a ListTask to for
	*                                        loading. If omitted, loads immediately with an internal
	*                                        TaskManager.
	*/
	AssetManager.loadBitmapMovieClip = function(label, path, callback, taskList)
	{
		if (path === undefined || path === null)
		{
			path = "assets/sprites/";
		}
		var manifest = [
			{
				"id": "bmcConfig_" + label,
				"src": path + label + ".json"
			},
			{
				"id": "atlasData_" + label,
				"src": path + label + "Sprite.json"
			},
			{
				"id": "atlasImage_" + label,
				"src": path + label + "Sprite.png"
			}
		];
		AssetManager.load(manifest, callback, taskList);
	};

	/**
	*  Unload an asset or list of assets.
	*  @method extractAssetName
	*  @static
	*  @private
	*  @param {String} assetId The asset id from the manifest, which might include an identifier
	*                          marking it as belonging to a spritesheet.
	*  @return {String} The proper asset id
	*/
	function extractAssetName(assetId)
	{
		if(assetId.indexOf("colorSplit-alpha_") === 0)
			assetId = assetId.substr(17);
		else if(assetId.indexOf("colorSplit-color_") === 0)
			assetId = assetId.substr(17);

		if(assetId.indexOf("atlasData_") === 0)
			return assetId.substr(10);
		else if(assetId.indexOf("atlasImage_") === 0)
			return assetId.substr(11);
		if(assetId.indexOf("spriteData_") === 0)
			return assetId.substr(11);
		else if(assetId.indexOf("spriteImage_") === 0)
			return assetId.substr(12);
		else if(assetId.indexOf("bmcConfig_") === 0)
			return assetId.substr(10);
		return assetId;
	}

	/**
	*  Loads a list of assets. All javascript files will be parsed so that they can be unloaded
	*  later. Additionally, AssetManager will handle spritesheets automatically. AssetManager looks
	*  for special manifest items that would otherwise be invalid to handle spritesheets or images
	*  that have been split into alpha and color images.
	*  A manifest item for a TextureAtlas - this will create a TextureAtlas instance, accessible via
	*  AssetManager.getAtlas("myAssetId"):
	*
	*      {
	*          "id":"myAssetId",
	*          "atlasData":"path/asset.json",
	*          "atlasImage":"path/asset.png"
	*      }
	*
	*  A manifest item for a spritesheet that should be run through BitmapUtils.loadSpriteSheet()
	*  so that the individual sprites can be accessed via the global 'lib' dictionary:
	*
	*      {
	*          "id":"myAssetId",
	*          "atlasData":"path/asset.json",
	*          "atlasImage":"path/asset.png",
	*          "splitForEaselJS":true
	*      }
	*
	*  A manifest item for a single image that has been split into color and alpha images that
	*  should be recombined upon loading:
	*
	*      {
	*          "id":"myAssetId",
	*          "color":"path/asset-color.jpg",
	*          "alpha":"path/asset-alpha.png"
	*      }
	*
	*  A manifest item for a TextureAtlas or spritesheet that has been split into color and
	*  alpha images:
	*
	*      {
	*          "id":"myAssetId",
	*          "atlasData":"path/asset.json",
	*          "color":"path/asset-color.jpg",
	*          "alpha":"path/asset-alpha.png"
	*      }
	*
	*  A manifest item for a JSON that is configuration data for a BitmapMovieClip - it can be
	*  retrieved via AssetManager.getBitmapMovieClipConfig("myAssetId"):
	*
	*      {
	*          "id":"myAssetId",
	*          "src":"path/asset.json",
	*          "bmcConfig":true
	*      }
	*
	*  @method load
	*  @static
	*  @param {Array} manifest The collection of asset manifests
	*  @param {Function} [callback] A function to call when load is complete
	*  @param {Array|TaskManager} [taskList] An array or TaskManager to add a ListTask to for
	*                                        loading. If omitted, loads immediately with an internal
	*                                        TaskManager.
	*/
	AssetManager.load = function(manifest, callback, taskList)
	{
		if(!loadedAssets)
		{
			if (Debug && DEBUG)
				Debug.error("Attempting to load assets via AssetManager without calling AssetManager.init()");
			return;
		}
		var checkedManifest = [];
		for(var i = 0; i < manifest.length; ++i)
		{
			var manifestData = manifest[i];
			var id = manifestData.id;
			if(loadedAssets.indexOf(extractAssetName(id)) == -1)
			{
				//look for expected manifest shorthands for atlases
				if(manifestData.atlasData)
				{
					//add several items instead of just the one
					checkedManifest.push({
						id: (manifestData.splitForEaselJS ? "spriteData_" : "atlasData_") + id,
						src: manifestData.atlasData
					});
					//look for color/alpha split spritesheets
					if(manifestData.alpha)
					{
						checkedManifest.push({
							id: "colorSplit-alpha_" + (manifestData.splitForEaselJS ? "spriteImage_" : "atlasImage_") + id,
							src: manifestData.alpha,
							alpha: true
						});
						checkedManifest.push({
							id: "colorSplit-color_" + (manifestData.splitForEaselJS ? "spriteImage_" : "atlasImage_") + id,
							src: manifestData.color,
							color: true
						});
					}
					//otherwise, use the expectd atlasImage url
					else
					{
						checkedManifest.push({
							id: (manifestData.splitForEaselJS ? "spriteImage_" : "atlasImage_") + id,
							src: manifestData.atlasImage
						});
					}
				}
				//look for individual iamges with color/alpha split shorthands
				else if(typeof manifestData.color == "string" &&
					typeof manifestData.alpha == "string")
				{
					checkedManifest.push({
						id: "colorSplit-alpha_" + id,
						src: manifestData.alpha,
						alpha: true
					});
					checkedManifest.push({
						id: "colorSplit-color_" + id,
						src: manifestData.color,
						color: true
					});
				}
				//look for JSON marked as BitmapMovieClip configs
				else if(manifestData.bmcConfig === true)
				{
					checkedManifest.push({
						id: "bmcConfig_" + id,
						src: manifestData.src
					});
				}
				//add the manifest as normal, as we have checked it for any
				//changes needed
				else
				{
					//do the (deprecated) less easy to use behavior of the
					//developer making separate manifest items for alpha/color
					if(manifestData.alpha === true)
					{
						checkedManifest.push({
							id: "colorSplit-alpha_" + id,
							src: manifestData.src,
							alpha: true
						});
					}
					else if(manifestData.color === true)
					{
						checkedManifest.push({
							id: "colorSplit-color_" + id,
							src: manifestData.src,
							color: true
						});
					}
					//add manifest as normal, as it is a standard manifest item
					else
					{
						checkedManifest.push(manifestData);
					}
				}
			}
		}
		if(checkedManifest.length)
		{
			var task = new ListTask("assets", checkedManifest, onLoaded.bind(AssetManager, callback));
			if(taskList)
			{
				if(Array.isArray(taskList))
					taskList.push(task);
				else if(taskList instanceof TaskManager)
					taskList.addTask(task);
			}
			else
				TaskManager.process([task]);
		}
		else if(callback)
			setTimeout(callback, 0);
	};

	var onLoaded = function(callback, results)
	{
		var atlasImage = {},
			atlasData = {},
			spriteImage = {},
			spriteData = {},
			id;

		for(id in results)
		{
			var result = results[id];
			var content = result.content,
				manifestData = result.manifestData;
			//grab any spritesheet images or JSON and keep that separate
			if(id.indexOf("atlasData_") === 0)
			{
				id = extractAssetName(id);
				atlasData[id] = content;
			}
			else if(id.indexOf("atlasImage_") > -1)
			{
				id = extractAssetName(id);
				if(manifestData)
				{
					if(manifestData.alpha === true)
					{
						if(atlasImage[id])
							atlasImage[id].alpha = content;
						else
							atlasImage[id] = {alpha: content};
					}
					else if(manifestData.color === true)
					{
						if(atlasImage[id])
							atlasImage[id].color = content;
						else
							atlasImage[id] = {color: content};
					}
					else
						atlasImage[id] = content;
				}
				else
					atlasImage[id] = content;
			}
			else if(id.indexOf("spriteData_") === 0)
			{
				id = extractAssetName(id);
				spriteData[id] = content;
			}
			else if(id.indexOf("spriteImage_") > -1)
			{
				id = extractAssetName(id);
				if(manifestData)
				{
					if(manifestData.alpha === true)
					{
						if(spriteImage[id])
							spriteImage[id].alpha = content;
						else
							spriteImage[id] = {alpha: content};
					}
					else if(manifestData.color === true)
					{
						if(spriteImage[id])
							spriteImage[id].color = content;
						else
							spriteImage[id] = {color: content};
					}
					else
						spriteImage[id] = content;
				}
				else
					spriteImage[id] = content;
			}
			else if(id.indexOf("bmcConfig_") === 0)
			{
				id = extractAssetName(id);
				BMCConfigs[id] = content;
			}
			//parse javascript files to find out what they are adding to the global
			//libs dictionary
			else if(result.url.indexOf(".js") != -1)
			{
				//get javascript text
				var text = content.text;
				if(!text) continue;
				//split into the initialization functions, that take 'lib' as a parameter
				var textArray = text.split(/[\(!]function\s*\(/);
				//go through each initialization function
				for(var i = 0; i < textArray.length; ++i)
				{
					text = textArray[i];
					if(!text) continue;
					//determine what the 'lib' parameter has been minified into
					var libName = text.substring(0, text.indexOf(","));
					if(!libName) continue;
					//get all the things that are 'lib.X = <stuff>'
					var varFinder = new RegExp("\\(" + libName + ".(\\w+)\\s*=", "g");
					var foundName = varFinder.exec(text);
					while(foundName)
					{
						//keep track of the asset id responsible
						loadedLibAssets[foundName[1]] = id;
						foundName = varFinder.exec(text);
					}
				}
			}
			else
			{
				id = extractAssetName(id);
				//store images normally, after checking for a alpha/color merge
				if(manifestData)
				{
					if(manifestData.alpha === true)
					{
						if(images[id] && images[id].color)
						{
							images[id] = mergeAlpha(images[id].color, content);
						}
						else
							images[id] = {alpha: content};
					}
					else if(manifestData.color === true)
					{
						if(images[id] && images[id].alpha)
							images[id] = mergeAlpha(content, images[id].alpha);
						else
							images[id] = {color: content};
					}
					else
						images[id] = content;
				}
				else
					images[id] = content;
			}
			if(loadedAssets.indexOf(id) == -1)
				loadedAssets.push(id);
		}
		//go through the TextureAtlases we should create
		for(id in atlasData)
		{
			if(atlasImage[id])
			{
				//if the image needs to be merged from color and alpha data, take care of that
				if(atlasImage[id].alpha && atlasImage[id].color)
					atlasImage[id] = mergeAlpha(atlasImage[id].color, atlasImage[id].alpha);
				//create the TextureAtlas
				textureAtlases[id] = new TextureAtlas(atlasImage[id], atlasData[id]);
			}
		}
		//go through the spritesheets we need to use BitmapUtils.loadSpriteSheet() on
		for(id in spriteData)
		{
			if(spriteImage[id])
			{
				//if the image needs to be merged from color and alpha data, take care of that
				if(spriteImage[id].alpha && spriteImage[id].color)
					spriteImage[id] = mergeAlpha(spriteImage[id].color, spriteImage[id].alpha);
				var frames = spriteData[id].frames;
				//diseminate the spritesheet into individual 'Bitmap'
				BitmapUtils.loadSpriteSheet(spriteData[id], spriteImage[id]);
				//keep track of the things that it loaded so we can remove them properly
				for(var frame in frames)
				{
					loadedLibAssets[frame] = id;
				}
			}
		}
		//perform the callback
		if(callback)
			callback();
	};

	/**
	* Pulled from EaselJS's SpriteSheetUtils.
	* Merges the rgb channels of one image with the alpha channel of another. This can be used to
	* combine a compressed JPEG image containing color data with a PNG32 monochromatic image
	* containing alpha data. With certain types of images (those with detail that lend itself to
	* JPEG compression) this can provide significant file size savings versus a single RGBA PNG32.
	* This method is very fast (generally on the order of 1-2 ms to run).
	* @method mergeAlpha
	* @static
	* @private
	* @param {Image} rbgImage The image (or canvas) containing the RGB channels to use.
	* @param {Image} alphaImage The image (or canvas) containing the alpha channel to use.
	* @param {Canvas} [canvas] If specified, this canvas will be used and returned. If not, a new
	*                          canvas will be created.
	* @return {Canvas} A canvas with the combined image data. This can be used as a source for a
	*                  Texture.
	*/
	var mergeAlpha = function(rgbImage, alphaImage, canvas) {
		if (!canvas)
			canvas = document.createElement("canvas");
		canvas.width = Math.max(alphaImage.width, rgbImage.width);
		canvas.height = Math.max(alphaImage.height, rgbImage.height);
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.drawImage(rgbImage,0,0);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(alphaImage,0,0);
		ctx.restore();
		return canvas;
	};

	/**
	*  Returns a TextureAtlas that was loaded by the specified asset id.
	*  @method getAtlas
	*  @static
	*  @param {String} asset The id of the TextureAtlas to get.
	*  @return {TextureAtlas} The TextureAtlas that was loaded under the specified asset id.
	*/
	AssetManager.getAtlas = function(asset)
	{
		return textureAtlases[asset];
	};

	/**
	*  Returns a configuration object for a BitmapMovieClip.
	*  @method getBitmapMovieClipConfig
	*  @static
	*  @param {String} asset The id of the config object to get.
	*  @return {TextureAtlas} The TextureAtlas that was loaded under the specified asset id.
	*/
	AssetManager.getBitmapMovieClipConfig = function(asset)
	{
		return BMCConfigs[asset];
	};

	/**
	*  Unload an asset or list of assets.
	*  @method unload
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id. As an
	*                                      array, it can be a manifest with {id:"", src:""} objects.
	*/
	AssetManager.unload = function(assetOrAssets)
	{
		var assets = [], i, length, asset;
		//figure out the exact list of things we need to unload
		if(Array.isArray(assetOrAssets))
		{
			for(i = 0, length = assetOrAssets.length; i < length; ++i)
			{
				if(typeof assetOrAssets[i] == "string")
					assets.push(extractAssetName(assetOrAssets[i]));
				else
					assets.push(extractAssetName(assetOrAssets[i].id));
			}
		}
		else
			assets.push(extractAssetName(assetOrAssets));

		//unload each asset
		for(i = 0, length = assets.length; i < length; ++i)
		{
			asset = assets[i];
			//destroy it if it is a texture atlas
			if(textureAtlases[asset])
			{
				textureAtlases[asset].destroy();
				delete textureAtlases[asset];
			}
			//remove any BitmapMovieClip configuration data
			if(BMCConfigs[asset])
				delete BMCConfigs[asset];
			//if it is a regular image, unload it
			if(images[asset])
			{
				images[asset].src = "";
				delete images[asset];
			}

			var index = loadedAssets.indexOf(asset);
			if(index > 0)
				loadedAssets.splice(index, 1);
		}
		//go through everything we've put in the 'lib' dictionary, and unload it
		//if it belongs to something in the list of assets to unload
		for(asset in loadedLibAssets)
		{
			if(assets.indexOf(loadedLibAssets[asset]) > -1)
			{
				delete lib[asset];
				delete loadedLibAssets[asset];
			}
		}
	};

	/**
	*  Unloads all assets loaded by AssetManager.
	*  @method unloadAll
	*  @static
	*/
	AssetManager.unloadAll = function()
	{
		var i, length;
		for(i = 0, length = loadedAssets.length; i < length; ++i)
		{
			if(images[asset])
			{
				images[asset].src = "";
				delete images[asset];
			}
		}
		for(i in loadedLibAssets)
		{
			delete lib[i];
		}
		loadedLibAssets = {};
		for(i in textureAtlases)
		{
			textureAtlases[i].destroy();
			delete textureAtlases[i];
		}
		loadedAssets.length = 0;
	};

	//Assign to namespace
	namespace("springroll.easeljs").AssetManager = AssetManager;
}());