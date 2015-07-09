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
		var multiLoader = this.multiLoader;
		
		multiLoader.register('springroll.easeljs.TextureAtlasTask', 30);
		multiLoader.register('springroll.easeljs.FlashArtTask', 50);
		multiLoader.register('springroll.easeljs.SpritesheetTask', 60);
	};

}());