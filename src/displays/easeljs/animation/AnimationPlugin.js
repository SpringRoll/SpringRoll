/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.easeljs.Animator');

	/**
	 * Create an app plugin for Animator, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class AnimationPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		// Register the tasks
		this.multiLoader.register('springroll.easeljs.TextureAtlasTask');
		this.multiLoader.register('springroll.easeljs.BitmapMovieClipTask');
		this.multiLoader.register('springroll.easeljs.FlashArtTask');

		// Init the animation
		Animator.init();
		Animator.captions = this.captions || null;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (Animator) Animator.destroy();
	};

}());