/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for EaselJSDisplay, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class EaselJSDisplayPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		var assetManager = this.assetManager;
		
		assetManager.register('springroll.easeljs.TextureAtlasTask', 30);
		assetManager.register('springroll.easeljs.FlashArtTask', 50);
		assetManager.register('springroll.easeljs.FlashArtAtlasTask', 60);
		assetManager.register('springroll.easeljs.SpriteSheetTask', 70);
	};

}());