/**
 * @module EaselJS Cutscene
 * @namespace springroll
 * @requires Core, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		this.assetManager.register('springroll.easeljs.CutsceneTask', 80);
	};

}());