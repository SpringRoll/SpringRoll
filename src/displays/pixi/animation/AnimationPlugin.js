/**
 * @module PIXI Animation
 * @namespace springroll
 * @requires  Core, PIXI Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.pixi.Animator');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		this.assetManager.register('springroll.pixi.AdvancedMovieClipTask', 80);
		this.assetManager.register('springroll.pixi.SpineAtlasTask', 40);
		this.assetManager.register('springroll.pixi.SpineAnimTask', 40);
		
		Animator.init();
		Animator.captions = this.captions || null;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (Animator) Animator.destroy();
	};

}());