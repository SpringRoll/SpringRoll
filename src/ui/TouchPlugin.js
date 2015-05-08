/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for touch detecting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class TouchPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var TouchPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(TouchPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		*  If the current brower is iOS
		*  @property {Boolean} isIOS
		*/
		this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;
		
		/**
		*  If the current brower is Android
		*  @property {Boolean} isAndroid
		*/
		this.isAndroid = navigator.userAgent.search(/Android/) > -1;

		/**
		*  If the current brower has touch input available
		*  @property {Boolean} hasTouch
		*/
		this.hasTouch = !!(('ontouchstart' in window) ||// iOS & Android
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
				this.hasTouch = value === "true" || !!value;
			}
			.bind(this));
			
			var DebugOptions = include('springroll.DebugOptions', false);
			if (DebugOptions)
			{
				DebugOptions.boolean('forceTouch', 'Force hasTouch to true');
			}
		}
	};

	// add common filteres interaction
	p.preload = function(done)
	{
		if (DEBUG)
		{
			this.hasTouch = !!this.options.forceTouch;
		}

		// Add the interaction filters, must have interface module MobilePlugin
		this.filters.add('%INTERACTION%', !!this.hasTouch ? '_touch' : '_mouse');
		done();
	};

	// register plugin
	ApplicationPlugin.register(TouchPlugin);

}());