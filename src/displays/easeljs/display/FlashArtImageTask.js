/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task'),
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class FlashArtImageTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.format The asset format must be "FlashImage".
	 * @param {String} [asset.src] The source path to the image
	 * @param {String} [asset.color] The source path to the color image, if not using src
	 * @param {String} [asset.alpha] The source path to the alpha image, if not using src
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtImageTask = function(asset)
	{
		Task.call(this, asset, asset.color);
		
		this.src = this.filter(asset.src);

		/**
		 * The atlas color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The atlas alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);
		
		this.imagesName = asset.imagesName;
	};

	// Reference to prototype
	var p = extend(FlashArtImageTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtImageTask.test = function(asset)
	{
		return asset.type == "easeljs" &&
			asset.format == "FlashImage" &&
			!!(asset.src || (asset.alpha && asset.color));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var load = this.src;
		if(!load)
		{
			//load a standard ColorAlphaTask
			load = {
				alpha: this.alpha,
				color: this.color
			};
		}
		Application.instance.load(load,
			function(result)
			{
				var img = result;
				
				var images = window[this.imagesName];
				images[this.id] = img;
				
				var asset = {image: img, scale: this.scale, id: this.id};
				asset.destroy = function()
				{
					img.src = "";
					delete images[this.id];
				};
				
				callback(asset);
				
			}.bind(this)
		);
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtImageTask = FlashArtImageTask;

}());