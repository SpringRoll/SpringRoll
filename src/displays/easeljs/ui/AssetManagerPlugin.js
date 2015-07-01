/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display, Tasks
 */
(function(undefined)
{
	// Import classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		AssetManager = include('springroll.easeljs.AssetManager');

	/**
	 *	Initialize the AssetManager
	 *	@class AssetManagerPlugin
	 *	@extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Initialize the plugin
	plugin.setup = function()
	{
		AssetManager.init();
	};

	// clean up
	plugin.teardown = function()
	{
		AssetManager.unloadAll();
	};

}());