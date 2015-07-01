/**
 * @module Learning Media
 * @namespace springroll
 * @requires Core, Learning, Sound, Captions
 */
(function(undefined)
{
	// Include classes
	var LearningMedia = include('springroll.LearningMedia');

	/**
	 * Create an app plugin for Learning Media, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LearningMediaPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = mixin({}, 'springroll.ApplicationPlugin');

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * For media conveninece methods tracking media events, such as 
		 * playFeedback, playMovie, etc
		 * @property {springroll.LearningMedia} media
		 */
		this.media = new LearningMedia();
	};

	// Setup the game media
	plugin.preload = function(done)
	{
		this.media.init(this);
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.media)
		{
			this.media.destroy();
			this.media = null;
		}
	};

}());