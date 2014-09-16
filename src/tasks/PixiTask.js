/**
*  @module cloudkid
*/
(function(){
	
	var Loader,
		Application,
		AssetLoader,
		Task = include('cloudkid.Task');

	/**
	*  PixiTask loads things through PIXI.AssetLoader for pixi.js. 
	*  This means textures, spritesheets, and bitmap fonts.
	*  @class PixiTask
	*  @constructor
	*  @param {String} id The id of the task
	*  @param {Array} urls The urls to load using PIXI.AssetLoader
	*  @param {Function} callback The callback to call when the load is completed
	*  @param {Function} updateCallback The optional callback to call each time an item finishes loading
	*  @param {Boolean} generateCanvasTexture=false If loaded images should be drawn to a canvas and used from there.
	*/
	var PixiTask = function(id, urls, callback, updateCallback, generateCanvasTexture)
	{
		if(!Loader)
		{
			AssetLoader = include('PIXI.AssetLoader');
			Loader = include('cloudkid.Loader');
			Application = include('cloudkid.Application');
		}

		Task.call(this, id, callback);
		
		/**
		*	The optional callback to get updates (to show load progress)
		*	@property {Function} updateCallback
		*	@private
		*/
		this.updateCallback = updateCallback;
		
		/**
		*	If loaded images should be drawn to a canvas and used from there.
		*	@property {Boolean} generateCanvas
		*	@private
		*/
		this.generateCanvas = generateCanvasTexture || false;
		
		/**
		*	The AssetLoader used to load all files.
		*	@property {PIXI.AssetLoader} _assetLoader
		*	@private
		*/
		this._assetLoader = null;

		var cm = Loader.instance.cacheManager;

		for(var i = 0; i < urls.length; ++i)
		{
			urls[i] = cm.prepare(urls[i]);
		}

		/**
		*	The urls of the files to load
		*	@property {Array} urls
		*	@private
		*/
		this.urls = urls;
	};
	
	var s = Task.prototype;

	var p = PixiTask.prototype = Object.create(s);
	
	/**
	*   Start the load
	*	@method start
	*   @param callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		var opts = Application.instance.options;
		this._assetLoader = new AssetLoader(this.urls, opts.crossOrigin, this.generateCanvas, opts.basePath);
		this._assetLoader.onComplete = callback;
		if(this.updateCallback)
			this._assetLoader.onProgress = this.onProgress.bind(this);
		this._assetLoader.load();
	};

	/**
	*	A callback for when an individual item has been loaded.
	*	@method onProgress
	*	@private
	*/
	p.onProgress = function()
	{
		this.updateCallback();
	};
	
	/**
	*	Cancel the task
	*	@method cancel
	*	@return If the loader removed it from the queue successfully - 
	*			false means that there is a 'load finished' event inbound 
	*			for the task manager
	*/
	p.cancel = function()
	{
		this._assetLoader.onComplete = null;
		this._assetLoader.onProgress = null;
		return true;
	};
	
	/**
	*   Get a string representation of this task
	*	@method toString
	*   @return A string representation of this task
	*/
	p.toString = function()
	{
		return "[PixiTask ID (" + this.id + "), URLs (" + this.urls.join(", ") + ")]";
	};
	
	/**
	*  Destroy this load task and don't use after this.
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		s.destroy.call(this);

		this.updateCallback = null;
		this.urls = null;
		if(this._assetLoader)
		{
			this._assetLoader.onComplete = null;
			this._assetLoader.onProgress = null;
		}
		this._assetLoader = null;
	};
	
	// Assign to the namespace
	namespace('cloudkid').PixiTask = PixiTask;
	
}());