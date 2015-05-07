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
	p.init = function()
	{
		/**
		 * The main UIScaler for any display object references
		 * in the main game.
		 * @property {springroll.UIScaler} scaler
		 */
		this.scaler = new UIScaler(this);

		// Add the display
		this.once('init', function(done)
		{
			// Check for the config then auto enable the scaler
			if (this.config)
			{
				var Debug = include('springroll.Debug', false);

				var config = this.config;
				var scalerSize = config.scalerSize;

				if (!scalerSize)
				{
					Debug.warn("The config requires 'scalerSize' object which contains keys 'width' and 'height' an optionally 'maxWidth' and 'maxHeight'.");
					return;
				}

				if (!config.scaler)
				{
					Debug.warn("The config requires 'scaler' object which contains all the state scaling items.");
					return;
				}
				this.scaler.size = scalerSize;
				this.scaler.addItems(config.scaler);
				this.scaler.enabled = !!this.scaler.numItems;
			}
		}, -1); // lower init priority to happen after the art has been created
	};

	// display is ready here
	p.ready = function(done)
	{
		this.scaler.display = this.display;
		done();
	};

	// clean up
	p.destroy = function()
	{
		this.scaler.destroy();
		this.scaler = null;
	};

	// register plugin
	ApplicationPlugin.register(UIScalerPlugin);

}());