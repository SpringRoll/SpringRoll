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
	 * Create an app plugin for EaselJSDisplay, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class PixiDisplayPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		var multiLoader = this.multiLoader;
		multiLoader.register('springroll.pixi.PixiLoadTask', 60);
	};

}());