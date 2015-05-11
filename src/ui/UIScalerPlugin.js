/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		UIScaler = include('springroll.UIScaler');

	/**
	 * Create an app plugin for touch detecting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class UIScalerPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var UIScalerPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(UIScalerPlugin, ApplicationPlugin);

	// Init the scaling
	p.setup = function()
	{
		/**
		 * The main UIScaler for any display object references
		 * in the main game.
		 * @property {springroll.UIScaler} scaling
		 */
		this.scaling = new UIScaler();

		// Add the display
		this.once('afterInit', function()
		{
			// Check for the config then auto enable the scaling
			if (!this.config)
			{
				throw "UIScaler requires config";
			}
			
			var Debug = include('springroll.Debug', false);
			var config = this.config;
			var scalingSize = config.scalingSize;

			if (!scalingSize)
			{
				if (DEBUG)
				{
					throw "The config requires 'scalingSize' object which contains keys 'width' and 'height' an optionally 'maxWidth' and 'maxHeight'.";
				}
				else
				{
					throw "No 'scalingSize' config";
				}
			}

			if (!config.scaling)
			{
				if (DEBUG)
				{
					throw "The config requires 'scaling' object which contains all the state scaling items.";
				}
				else
				{
					throw "No 'scaling' config";
				}
			}
			
			this.scaling.size = scalingSize;
			this.scaling.addItems(this, config.scaling);
			this.scaling.enabled = true;
		});
	};

	// Setup the display
	p.preload = function(done)
	{
		this.scaling.display = this.display;
		done();
	};

	// clean up
	p.teardown = function()
	{
		this.scaling.destroy();
		this.scaling = null;
	};

	// register plugin
	ApplicationPlugin.register(UIScalerPlugin);

}());