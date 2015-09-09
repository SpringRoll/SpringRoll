/**
 * @module PIXI Spine
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
		this.assetManager.register('springroll.pixi.SpineAtlasTask', 40);
		this.assetManager.register('springroll.pixi.SpineAnimTask', 40);
		this.animator.register('springroll.pixi.SpineInstance', 10);
	};

}());