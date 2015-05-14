/**
 * @module PIXI UI
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	var Debug,
		BitmapText = include('PIXI.BitmapText'),
		Texture = include('PIXI.Texture'),
		Loader = include('springroll.Loader'),
		AssetLoader = include('PIXI.AssetLoader'),
		Application = include('springroll.Application'),
		PixiTask,
		ListTask,
		TaskManager;

	/**
	*  AssetManager is responsible for managing different resolutions of assets and spritesheets
	*  based on the resolution of the stage. This is a helpful optimization for PIXI because some
	*  low-hardware devices have a problem keeping up with larger images, or just refuse large
	*  images entirely. The AssetManager does not load assets itself, or keep track of what is
	*  loaded. It merely assists in loading the appropriate assets, as well as easily unloading
	*  assets when you are done using them.
	*
	*  @class AssetManager
	*/
	var AssetManager = {};
	
	/**
	*  Dictionary of scales by asset id. Use this to return your asset to normal size.
	*  Assets are only added to this dictionary after a url has been retrieved with getUrl().
	*  @property {Object} scales
	*  @final
	*  @static
	*/
	AssetManager.scales = null;

	/**
	*  The available size definitions, e.g., {"maxSize":400, "order": ["tiny", "sd"]}
	*  @property {Array} sizes
	*  @private
	*  @static
	*/
	var sizes = null;

	/**
	*  Dictionary of assets by asset id
	*  @property {Object} assets
	*  @private
	*  @static
	*/
	var assets = null;

	/**
	*  The cache of asset url paths
	*  @property {Object} assetUrlCache
	*  @private
	*  @static
	*/
	var assetUrlCache = null;

	/**
	*  The scaling value for each asset size id, e.g., {"sd" : 1, "tiny" : 0.5}
	*  @property {Object} scales
	*  @private
	*  @static
	*/
	var scales = null;

	/**
	*  The paths to each resolution folder, e.g., {"sd":"images/sd/", "tiny":"images/tiny/"}
	*  @property {Object} paths
	*  @private
	*  @static
	*/
	var paths = null;

	/**
	*  The collection of perferred size to load
	*  @property {Array} sizeOrder
	*  @private
	*  @static
	*/
	var sizeOrder = null;

	/**
	*  If we should use low hardware, if we know we're on a slow device
	*  @property {Boolean} lowHW
	*  @static
	*/
	AssetManager.lowHW = false;
	
	/**
	*  Initialize the asset manager. The asset manager is capable of taking different paths for
	*  each size of image as well as an animation file path for Spine animations. Image assets
	*  do not have to exist in each size. Fonts are marked for unloading purposes.
	*  Example config file:
	*
			{
				"path": {
					"sd": "images/sd/",
					"tiny": "images/tiny/",
					"anim": "anims/"
				},
				"scale": {
					"sd": 1,
					"tiny": 2
				},
				"sizing": [
					{
						"maxSize": 400,
						"order": [
							"tiny",
							"sd"
						]
					},
					{
						"maxSize": 10000,
						"order": [
							"sd",
							"tiny"
						]
					}
				],
				"assets": {
					"transition": {
						"src": "transition.json",
						"anim": true
					},
					"TransitionSheet": {
						"src": "ui/TransitionSheet.json",
						"sd":true,
						"tiny":true
					},
					"FoodTruck_Title": {
						"src": "backgrounds/FoodTruck_Title.jpg",
						"sd":true,
						"tiny":true
					},
					"StartButton": {
						"src": "ui/StartButton.png",
						"split": {
							"srcReplace":".png",
							"alpha":"-alpha.png",
							"color":"-color.jpg"
						},
						"sd":true,
						"tiny":false
					},
					"LevelTitleFont": {
						"src": "ui/LevelTitleFont.xml",
						"sd": true,
						"tiny": false,
						"isFont": true
					},
					"AnAssetCollection": {
						"format": {
							"src": "backgrounds/%NAME%.jpg",
							"sd": true,
							"tiny": true
						},
						"assets": [
							"Select_Background",
							"Result_Background
						]
					}
				}
	*
	*  @method init
	*  @static
	*  @param {Object} config The configuration file which contains keys for "path", "scale",
	*                         "sizing", "assets"
	*  @param {Number} width The stage width
	*  @param {Number} height The stage height
	*/
	AssetManager.init = function(config, width, height)
	{
		Debug = include('springroll.Debug', false);
		PixiTask = include("springroll.PixiTask", false);
		TaskManager = include("springroll.TaskManager", false);
		ListTask = include("springroll.ListTask", false);
		AssetManager.scales = {};
		assets = config.assets;
		assetUrlCache = {};
		paths = config.path;
		sizes = config.sizing;
		scales = config.scale;
		pickScale(width, height);
		
		//go through the assets to look for collections
		for(var key in assets)
		{
			var asset = assets[key];
			if(asset && asset.format)
			{
				asset.isCollection = true;
				var assetArray = asset.assets;
				for(var i = 0, length = assetArray.length; i < length; ++i)
				{
					var newAsset = asset.format.clone();
					newAsset.src = newAsset.src.replace("%NAME%", assetArray[i]);
					assets[assetArray[i]] = newAsset;
				}
			}
		}
	};
	
	/**
	*  Get the alias of the preferred size to use
	*  @method getPreferredSize
	*  @static
	*  @return {String} The alias for the preferred size
	*/
	AssetManager.getPreferredSize = function()
	{
		return sizeOrder[0];
	};
	
	/**
	*  Get the preferred scale amount
	*  @method getPreferredScale
	*  @static
	*  @return {Number} The scale amount associated with the preferred size
	*/
	AssetManager.getPreferredScale = function()
	{
		return scales[sizeOrder[0]];
	};
	
	/**
	*  Pick the preferred scale based on the screen resolution
	*  @method pickScale
	*  @private
	*  @static
	*  @param {Number} width The stage width
	*  @param {Number} height The stage height
	*/
	var pickScale = function(width, height)
	{
		var minSize = width < height ? width : height;
		var s;
		for(var i = sizes.length - 1; i >= 0; --i)
		{
			if(sizes[i].maxSize > minSize)
				s = sizes[i];
			else
				break;
		}
		sizeOrder = s.order;
	};
	
	/**
	*  Get a asset url by asset id
	*  @method getUrl
	*  @static
	*  @param {String} assetId The unique asset id
	*  @return The url of the asset at the appropriate size.
	*/
	AssetManager.getUrl = function(assetId)
	{
		var a = assets[assetId];
		if(!a) return null;
		
		if(assetUrlCache[assetId])
			return assetUrlCache[assetId];
		
		var url;
		if(a.anim)
		{
			url = assetUrlCache[assetId] = paths.anim + a.src;
			return url;
		}

		if(AssetManager.lowHW && a.lowHW)
		{
			AssetManager.scales[assetId] = scales[a.lowHW];
			url = assetUrlCache[assetId] = paths[a.lowHW] + a.src;
			return url;
		}
		
		for(var i = 0; i < sizeOrder.length; ++i)
		{
			var typeId = sizeOrder[i];
			if(a[typeId])
			{
				AssetManager.scales[assetId] = scales[typeId];
				url = assetUrlCache[assetId] = paths[typeId] + a.src;
				return url;
			}
		}
		return null;
	};
	
	/**
	*  Loads an asset or list of assets, attempting to correctly apply texture resolution to all
	*  loaded textures, as well as recombining images that have been split into alpha and color
	*  portions. Currently the alpha/color split will only work when loading with a task list.
	*  @method load
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id
	*  @param {Function} callback A function to call when load is complete
	*  @param {Array|TaskManager} [taskList] An array or TaskManager to add a PixiTask to for
	*                                        loading. If omitted, loads immediately with
	*                                        PIXI.AssetLoader.
	*/
	AssetManager.load = function(assetOrAssets, callback, taskList)
	{
		var i, length, urls = [], asset, j, jLength, assetCollection, madeCopy = false, splits;
		if(!Array.isArray(assetOrAssets))
		{
			assetOrAssets = [assetOrAssets];
			madeCopy = true;
		}
		if(taskList)
		{
			//add to a list of tasks or a running TaskManager
			if(!PixiTask)
			{
				if (DEBUG && Debug) Debug.error("AssetManager.load() can't find springroll.PixiTask!");
				return;
			}
			for(i = 0, length = assetOrAssets.length; i < length; ++i)
			{
				asset = assets[assetOrAssets[i]];
				if(!asset)
				{
					if(DEBUG && Debug)
						Debug.warn("Asset not found: " + assetOrAssets[i]);
					continue;
				}
				//If a collection was requested, go through and load all the sub assets
				if(asset.isCollection)
				{
					if(!madeCopy)
					{
						assetOrAssets = assetOrAssets.slice();
						madeCopy = true;
					}
					assetCollection = asset.assets;
					for(j = 0, jLength = assetCollection.length; j < jLength; ++j)
					{
						assetOrAssets.push(assetCollection[j]);
						length++;
					}
				}
				else if(!asset._isLoaded)
				{
					var url = AssetManager.getUrl(assetOrAssets[i]);
					if(asset.split)
					{
						if(!splits)
						{
							splits = {};
						}
						var manifest = splits[url] = [];
						manifest.push(
							{
								"id":"color",
								"src":url.replace(asset.split.srcReplace, asset.split.color)
							});
						manifest.push(
							{
								"id":"alpha",
								"src":url.replace(asset.split.srcReplace, asset.split.alpha)
							});
					}
					urls.push(url);
				}
			}
			if(urls.length)
			{
				var task = new PixiTask("", urls,
										onLoaded.bind(AssetManager, assetOrAssets, callback));
				//if we have split textures to load, load them up first, then load the pixi tasks
				//this way spritesheets can be loaded properly
				if(splits)
				{
					var pixiTask = task;
					var splitTasks = [];
					for(var id in splits)
					{
						splitTasks.push(new ListTask(id, splits[id], onSplitLoaded));
					}
					task = new ListTask("", splitTasks,
										onAllSplitsLoaded.bind(AssetManager, pixiTask));
				}
				if(Array.isArray(taskList))
					taskList.push(task);
				else if(taskList instanceof TaskManager)
					taskList.addTask(task);
				else
				{
					if (DEBUG && Debug)
						Debug.error("AssetManager.load() was provided with a taskList that is neither an array or a springroll.TaskManager");
				}
			}
			else if(callback)
			{
				callback();
			}
		}
		else
		{
			//load immediately
			var cm = Loader.instance.cacheManager;
			for(i = 0, length = assetOrAssets.length; i < length; ++i)
			{
				asset = assets[assetOrAssets[i]];
				if(!asset)
				{
					if(DEBUG && Debug)
						Debug.warn("Asset not found: " + assetOrAssets[i]);
					continue;
				}
				//If a collection was requested, go through and load all the sub assets
				if(asset.isCollection)
				{
					if(!madeCopy)
					{
						assetOrAssets = assetOrAssets.slice();
						madeCopy = true;
					}
					assetCollection = asset.assets;
					for(j = 0, jLength = assetCollection.length; j < jLength; ++j)
					{
						asset = assets[assetCollection[j]];
						if(asset && !asset._isLoaded)
							urls.push(cm.prepare(AssetManager.getUrl(assetCollection[j]), true));
					}
				}
				else if(!asset._isLoaded)
					urls.push(cm.prepare(AssetManager.getUrl(assetOrAssets[i]), true));
			}
			if(urls.length)
			{
				var opts = Application.instance.options;
				var assetLoader = new AssetLoader(urls, opts.crossOrigin, opts.basePath);
				assetLoader.onComplete = onLoaded.bind(AssetManager, assetOrAssets, callback);
				assetLoader.load();
			}
			else if(callback)
				callback();
		}
	};
	
	/**
	*  Callback for when a pair of split images are loaded to be reassembled.
	*  @method onSplitLoaded
	*  @static
	*  @private
	*  @param {Object} results Dictionary of LoaderResults.
	*  @param {ListTask} task The ListTask that loaded the manifest.
	*/
	var onSplitLoaded = function(results, task)
	{
		var canvas = mergeAlpha(results.color.content, results.alpha.content);
		var baseTexture = new PIXI.BaseTexture(canvas);
		var id = PIXI.filenameFromUrl(task.id);
		baseTexture.imageUrl = id;
		PIXI.BaseTextureCache[id] = baseTexture;
	};
	
	/**
	*  Callback for when all split textures have been loaded and recombined. This starts the loading
	*  of assets within PixiJS.
	*  @method onAllSplitsLoaded
	*  @static
	*  @private
	*  @param {PixiTask} pixiTask The PixiTask to load up all assets for PixiJS.
	*  @param {Object} results Dictionary of LoaderResults.
	*  @param {ListTask} task The ListTask that loaded the manifest.
	*  @param {TaskManager} taskManager The TaskManager that should run pixiTask.
	*/
	var onAllSplitsLoaded = function(pixiTask, results, task, taskManager)
	{
		taskManager.addTask(pixiTask);
	};
	
	/**
	*  Callback for when assets are loaded, to automatically apply the resolution of textures.
	*  @method onLoaded
	*  @static
	*  @private
	*  @param {Array} assetList Array of asset ids that were just loaded.
	*  @param {Function} callback The user callback for the load.
	*/
	var onLoaded = function(assetList, callback)
	{
		for(var i = 0, length = assetList.length; i < length; ++i)
		{
			var assetName = assetList[i];
			if(!assetName) continue;
			assets[assetName]._isLoaded = true;//keep track of the loaded status
			var url = AssetManager.getUrl(assetName);
			var texture = Texture.fromFrame(url, true);
			if(texture)
			{
				texture.baseTexture.resolution = this.scales[assetName];
			}
		}
		if(callback)
			callback();
	};
	
	/**
	*  Unload an asset or list of assets.
	*  @method unload
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id
	*/
	AssetManager.unload = function(assetOrAssets)
	{
		if(assetOrAssets instanceof Array)
		{
			for(var i = assetOrAssets.length - 1; i >= 0; --i)
			{
				var id = assetOrAssets[i];
				unloadAsset(id);
			}
		}
		else//string
		{
			unloadAsset(assetOrAssets);
		}
	};

	/**
	*  Unload an asset
	*  @method unloadAsset
	*  @static
	*  @private
	*  @param {String} asset The asset id to unload
	*/
	var unloadAsset = function(asset)
	{
		//if this doesn't exist, then it wasn't loaded
		if(!assetUrlCache[asset]) return;
		var a = assets[asset];
		//asset never existed in the master list
		if(!a) return;
		//don't unload animations, they are pretty small
		if(a.anim) return;
		//If the asset is a collection, unload each subasset
		if(a.isCollection)
		{
			AssetManager.unload(a.assets);
			return;
		}
		//remember that the asset is unloaded
		a._isLoaded = false;
		//unload the bitmap font if relevant
		if(a.isFont)
		{
			if(BitmapText.fonts[asset])
				delete BitmapText.fonts[asset];
		}
		//anything else is a texture
		Texture.destroyTexture(assetUrlCache[asset]);
		delete AssetManager.scales[asset];
		delete assetUrlCache[asset];
	};

	/**
	*  Assemble a dictionary of Texture arrays representing animations from the PixiJS
	*  texture cache.
	*  Example of a getAnims() call:

			var animationDictionary = AssetManager.getAnims(
				{
					"bobIdleHappy":{"name":"bob_idle_happy#", "numberMin":1, "numberMax":139},
					"bobIdleNeutral":{"name":"bob_idle_neutral#", "numberMin":1, "numberMax":140},
					"bobIdleMad":{"name":"bob_idle_mad#", "numberMin":1, "numberMax":140},
					"bobPos":{"name":"bob_react_pos#", "numberMin":1, "numberMax":23},
					"bobNeg":{"name":"bob_react_neg#", "numberMin":1, "numberMax":31},
				},
				4);

	*  @method getAnims
	*  @static
	*  @param {Object} anims The dictionary of animation assets
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported
	*                             as anim_0001.png
	*  @param {Object} [outObj] If already using an return object
	*  @return {Object} An collection of PIXI.Textures for each animation id suitable for
	*                   use in PIXI.MovieClip
	*/
	AssetManager.getAnims = function(anims, maxDigits, outObj)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		var zeros = [];
		var compares = [];
		var i, c;
		for(i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for(var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length;
		
		var rtnDict = outObj || {};
		var fromFrame = Texture.fromFrame;
		var prevTex, len;
		for(var a in anims)
		{
			var data = anims[a];
			var list = [];

			for(i = data.numberMin, len = data.numberMax; i <= len; ++i)
			{
				var num = null;
				for(c = 0; c < compareLength; ++c)
				{
					if(i < compares[c])
					{
						num = zeros[c] + i;
						break;
					}
				}
				if(!num)
					num = i.toString();
				
				//If the texture doesn't exist, use the previous texture - this should
				//allow us to use fewer textures that are in fact the same
				var texName = data.name.replace("#", num);
				var tex = fromFrame(texName, true);
				if(tex)
					prevTex = tex;
				list.push(prevTex);
			}
			rtnDict[a] = list;
		}
		return rtnDict;
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
	
	// Assign to the namespace
	namespace('springroll').AssetManager = AssetManager;
	namespace('springroll.pixi').AssetManager = AssetManager;
}());