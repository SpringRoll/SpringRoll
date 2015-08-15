/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	
	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(100);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * If the current brower is iOS
		 * @property {Boolean} isIOS
		 */
		this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;

		/**
		 * If the current brower is Android
		 * @property {Boolean} isAndroid
		 */
		this.isAndroid = navigator.userAgent.search(/Android/) > -1;

		/**
		 * If the current brower has touch input available
		 * @property {Boolean} hasTouch
		 */
		this.hasTouch = !!(('ontouchstart' in window) || // iOS & Android
			(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || // IE10
			(window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 0)); // IE11+

		if (DEBUG)
		{
			/**
			 * Manually override the check for hasTouch (unminifed library version only)
			 * @property {Boolean} options.forceTouch
			 * @default false
			 */
			this.options.add('forceTouch', false)
				.on('forceTouch', function(value)
					{
						if(value === "true" || value === true)
							this.hasTouch = true;
					}
					.bind(this));

			var DebugOptions = include('springroll.DebugOptions', false);
			if (DebugOptions)
			{
				DebugOptions.boolean('forceTouch', 'Force hasTouch to true');
			}
		}
	};

	// Add common filteres interaction
	plugin.preload = function(done)
	{
		if (DEBUG)
		{
			var value = this.options.forceTouch;
			if(value === "true" || value === true)
				this.hasTouch = true;
		}

		// Add the interaction filters, must have interface module MobilePlugin
		if(this.filters)
		{
			var ui = !!this.hasTouch ? '_touch' : '_mouse';
			this.filters.add('%INTERACTION%', ui);
			this.filters.add('%UI%', ui);
		}
		done();
	};

}());