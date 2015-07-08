/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Application = include('springroll.Application'),
		LoaderResult = include('springroll.LoaderResult'),
		Debug;

	/**
	 * Class for managing the loading and unloading of assets.
	 * @class AssetManager
	 * @static
	 */
	var AssetManager = {};
	
	/**
	*  Array of asset objects that have been loaded by AssetManager.
	*  @property {Object} _loadedAssets
	*  @private
	*  @static
	*/
	var _loadedAssets = null;

	/**
	 * Intializes AssetManager.
	 * @method init
	 * @static
	 * @param {springroll.Application} app
	 */
	AssetManager.init = function(app)
	{
		if (DEBUG)
		{
			Debug = include('springroll.Debug', false);
		}
		_loadedAssets = {};
	};

	/**
	*  Load a collection of assets for the MultiLoader and remembers the results
	*  so that it's possible to unload those assets later. 
	*  @method load
	*  @static
	*  @param {Array} manifest The collection of asset manifests
	*  @param {Array} assetList An array to add assets for loading. 
	*        If omitted, loads immediately with an internal load.
	*/
	/**
	*  Load a collection of assets for the MultiLoader and remembers the results
	*  so that it's possible to unload those assets later. 
	*  @method load
	*  @static
	*  @param {Array} manifest The collection of asset manifests
	*  @param {Function} callback A function to call when load is complete
	*  @param {Array} [assetList] An array to add assets for loading. 
	*        If omitted, loads immediately with an internal load.
	*/
	AssetManager.load = function(assets, callback, assetList)
	{
		// 2nd argument support the array
		if (Array.isArray(callback))
		{
			assetList = callback;
			callback = null;
		}

		if (assets && assets.length)
		{
			var asset;

			// Check the assets for valid IDs
			for (var i = 0; i < assets.length; i++)
			{
				asset = assets[i];
				if (!asset.id)
				{
					if (DEBUG && Debug)
					{
						Debug.error("Each asset passed to the AssetManager.load must have an id", asset);
						return;
					}
					else
					{
						throw "asset missing id";
					}
				}
			}

			if (assetList)
			{
				// Add to the list of tasks already in progress
				assetList.push({
					async: onLoaded.bind(null, assets),
					complete: callback
				});
			}
			else
			{
				// Do the load directly
				onLoaded(assets, callback);
			}
		}
		else if (callback)
		{
			setTimeout(callback, 0);
		}	
	};

	/**
	 * Handle the asset load
	 * @method  onLoaded
	 * @static
	 * @private
	 * @param  {Array}   assets   Collection of assets to load
	 * @param  {Function} done Callback when completed
	 */
	var onLoaded = function(assets, done)
	{
		// Load the assets thru the multiloader
		Application.instance.load(assets, function(results)
		{
			var result;
			for (var id in results)
			{
				result = results[id];
				_loadedAssets[id] = result instanceof LoaderResult ? result.content : result;
			}
			if (done) done(results);
		});
	};

	/**
	*  Get an asset by ID
	*  @method getAsset
	*  @static
	*  @param {String} id The id of the asset to get
	*  @return {*} The asset returned from load
	*/
	AssetManager.getAsset = function(id)
	{
		return _loadedAssets[id];
	};

	/**
	*  Unload an asset or list of assets.
	*  @method unload
	*  @static
	*  @param {Array|String} assetOrAssets The collection of asset ids or single asset id. As an
	*         array, it can be a manifest with {id:"", src:""} objects.
	*/
	AssetManager.unload = function(assets)
	{
		if (typeof assets === "string")
		{
			assets = [assets];
		}
		assets.forEach(function(asset)
		{
			var id = asset.id || asset;
			var result = _loadedAssets[id];
			if (result.destroy)
			{
				result.destroy();
			}
			delete _loadedAssets[id];
		});
	};

	/**
	*  Unloads all assets loaded by AssetManager.
	*  @method unloadAll
	*  @static
	*/
	AssetManager.unloadAll = function()
	{
		for(var id in _loadedAssets)
		{
			var result = _loadedAssets[id];
			if (result.destroy)
			{
				result.destroy();
			}
			delete _loadedAssets[id];
		}
	};

	// Assign to namespace
	namespace("springroll").AssetManager = AssetManager;
}());