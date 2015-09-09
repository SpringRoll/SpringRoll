/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
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
		// Register the tasks
		this.assetManager.register('springroll.easeljs.BitmapMovieClipTask', 40);
		this.animator.register('springroll.easeljs.BitmapMovieClipInstance', 20);
		this.animator.register('springroll.easeljs.MovieClipInstance', 10);
	};

}());