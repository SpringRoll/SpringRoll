/**
 *	@module UI
 *	@namespace springroll
 *	@requires Core
 */
(function()
{
	//Include classes
	var ScaleManager = include('springroll.ScaleManager'),
		Debug;

	/**
	 *	Create an app plugin for touch detecting, all properties and methods documented
	 *	in this class are mixed-in to the main Application
	 *	@class ScalingPlugin
	 *	@extends springroll.ApplicationPlugin
	 */
	var plugin = mixin({}, 'springroll.ApplicationPlugin');

	//Init the scaling
	plugin.setup = function()
	{
		Debug = include('springroll.Debug', false);

		/**
		 *	The main ScaleManager for any display object references
		 *	in the main game.
		 *	@property {springroll.ScaleManager} scaling
		 */
		this.scaling = new ScaleManager();

		//Add the scaling size
		this.on('configLoaded', function(config)
		{
			var scalingSize = config.scalingSize;
			if (scalingSize)
			{
				this.scaling.size = scalingSize;
			}
			else if (DEBUG && Debug)
			{
				Debug.warn("Recommended that config contains 'scalingSize' object with keys 'width' and 'height' an optionally 'maxWidth' and 'maxHeight'.");
			}
		});

		//Add the display
		this.once('afterInit', function()
		{
			var config = this.config;

			if (!config) return;

			if (config.scaling)
			{
				this.scaling.addItems(this, config.scaling);
			}
		});
	};

	//Setup the display
	plugin.preload = function(done)
	{
		this.scaling.display = this.display;
		this.scaling.enabled = true;
		done();
	};

	//Clean up
	plugin.teardown = function()
	{
		if (this.scaling) this.scaling.destroy();
		this.scaling = null;
	};

	//Register plugin
	plugin.register();

}());