/**
 * @module Interface
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

	// Init the scaler
	p.setup = function()
	{
		/**
		 * The main UIScaler for any display object references
		 * in the main game.
		 * @property {springroll.UIScaler} scaler
		 */
		this.scaler = new UIScaler();

		// Add the display
		this.once('afterInit', function()
		{
			// Check for the config then auto enable the scaler
			if (!this.config)
			{
				throw "UIScaler requires config";
			}
			
			var Debug = include('springroll.Debug', false);
			var config = this.config;
			var scalerSize = config.scalerSize;

			if (!scalerSize)
			{
				if (DEBUG)
				{
					throw "The config requires 'scalerSize' object which contains keys 'width' and 'height' an optionally 'maxWidth' and 'maxHeight'.";
				}
				else
				{
					throw "No 'scalerSize' config";
				}
			}

			if (!config.scaler)
			{
				if (DEBUG)
				{
					throw "The config requires 'scaler' object which contains all the state scaling items.";
				}
				else
				{
					throw "No 'scaler' config";
				}
			}
			
			this.scaler.size = scalerSize;
			this.scaler.addItems(this, config.scaler);
			this.scaler.enabled = true;
		});
	};

	// Setup the display
	p.preload = function(done)
	{
		this.scaler.display = this.display;
		done();
	};

	// clean up
	p.teardown = function()
	{
		this.scaler.destroy();
		this.scaler = null;
	};

	// register plugin
	ApplicationPlugin.register(UIScalerPlugin);

}());