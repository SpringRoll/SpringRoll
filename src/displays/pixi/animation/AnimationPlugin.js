/**
 * @module PIXI Animation
 * @namespace springroll
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		this.assetManager.register('springroll.pixi.AdvancedMovieClipTask', 80);
		this.animator.register('springroll.pixi.AdvancedMovieClipInstance', 10);
	};

}());