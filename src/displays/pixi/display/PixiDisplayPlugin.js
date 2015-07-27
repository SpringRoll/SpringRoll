/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for PixiDisplay, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class PixiDisplayPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		this.assetManager.register('springroll.pixi.TextureTask', 60);
		this.assetManager.register('springroll.pixi.TextureAtlasTask', 70);
		this.assetManager.register('springroll.pixi.BitmapFontTask', 80);
	};

}());