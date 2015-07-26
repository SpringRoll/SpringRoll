/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	// Import classes
	var Texture = include('PIXI.Texture');

	/**
	 * Container for the Pixi assets
	 * @class PixiAssets
	 * @constructor
	 * @param {Array} urls The collection of URLs that have been loaded
	 */
	var PixiAssets = function(urls)
	{
		/**
		 * The Asset URLs that have been loaded
		 * @property {Array} urls
		 */
		this.urls = urls;
	};

	// Reference to the prototype
	var p = PixiAssets.prototype;

	/**
	 * Destroy and clean-up
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.urls.forEach(function(url)
		{
			Texture.destroyTexture(url);
		});
		this.urls = null;
	};

	// Assign to namespace
	namespace('springroll.pixi').PixiAssets = PixiAssets;

}());