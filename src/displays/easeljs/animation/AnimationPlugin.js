/**
 * @module EaselJS Animation
 * @namespace springroll
 * @requires Core, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Animator = include('springroll.easeljs.Animator');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		// Register the tasks
		this.assetManager.register('springroll.easeljs.BitmapMovieClipTask', 40);

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