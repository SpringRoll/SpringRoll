/**
 * @module Learning Media
 * @namespace springroll
 * @requires Core, Learning, Sound, Captions
 */
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
	 	LearningMedia = include('springroll.LearningMedia');

	/**
	 * Create an app plugin for Learning Media, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LearningMediaPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LearningMediaPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(LearningMediaPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * For media conveninece methods tracking media events, such as 
		 * playFeedback, playMovie, etc
		 * @property {springroll.LearningMedia} media
		 */
		this.media = new LearningMedia();
	};

	// Setup the game media
	p.preload = function(done)
	{
		this.media.init(this);
		done();
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.media.destroy();
		this.media = null;
	};

	// register plugin
	ApplicationPlugin.register(LearningMediaPlugin);

}());