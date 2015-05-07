/**
*  @module Core
*  @namespace springroll
*/
(function(undefined)
{
	var Tween = include('createjs.Tween', false),
		Ticker = include('createjs.Ticker', false),
		PropertyDispatcher = include('springroll.PropertyDispatcher'),
		Debug;

	/**
	* Manage the Application options
	* @class ApplicationOptions
	* @extends springroll.PropertyDispatcher
	* @constructor {Object} [overrides] The supplied options
	*/
	var ApplicationOptions = function(app, options)
	{
		if(Debug === undefined)
			Debug = include('springroll.Debug', false);
		
		PropertyDispatcher.call(this);

		/**
		 * The user input options
		 * @property {Object} _options
		 * @private
		 */
		this._options = options || {};

		/**
		 * Reference to the application
		 * @property {springroll.Application} _app
		 * @private
		 */
		this._app = app;
	};

	// Extend the base class
	var p = extend(ApplicationOptions, PropertyDispatcher);

	/**
	 * Initialize the values in the options
	 * @method init
	 */
	p.init = function()
	{
		var options = this._options;
		var app = this._app;

		// If parse querystring is turned on, we'll
		// override with any of the query string parameters
		var query = options.useQueryString ? getQueryString() : {};

		// Create the options overrides
		options = Object.merge({}, defaultOptions, options, query);

		// Create getter and setters for all properties
		// this is so we can dispatch events when the property changes
		for(var name in options)
		{
			this.add(name, options[name]);
		}

		// Cannot change these properties after setup
		this.readOnly(
			'name',
			'resizeElement',
			'useQueryString',
			'canvasId',
			'display',
			'displayOptions',
			'uniformResize'
		);

		// Convert these to DOM elements
		this.asDOMElement('resizeElement');

		this.respond('updateTween', function()
		{
			return Tween ? app.has('update', Tween.tick) : false;
		});

		this.on('updateTween', function(value)
		{
			if (Tween)
			{
				if (Ticker)
				{
					Ticker.setPaused(!!value);
				}
				app.off('update', Tween.tick);
				if (value)
				{
					app.on('update', Tween.tick);
				}
			}
		});
		
		//trigger all of the initial values, because otherwise they don't take effect.
		var _properties = this._properties;
		for(var id in _properties)
		{
			this.trigger(id, _properties[id].value);
		}
	};

	/**
	 * Get the query string as an object
	 * @property {Object} getQueryString
	 * @private
	 */
	var getQueryString = function()
	{
		var output = {};
		var href = window.location.search;
		if (!href) //empty string is false
		{
			return output;
		}
		var vars = href.substr(href.indexOf("?")+1);
		var pound = vars.indexOf('#');
		vars = pound < 0 ? vars : vars.substring(0, pound);
		var splitFlashVars = vars.split("&");
		var myVar;
		for (var i = 0, len = splitFlashVars.length; i < len; i++)
		{
			myVar = splitFlashVars[i].split("=");
			var value = myVar[1];
			if(value === "true" || value === undefined)
				value = true;
			else if(value === "false")
				value = false;
			if (DEBUG && Debug)
			{
				Debug.log(myVar[0] + " -> " + value);
			}
			output[myVar[0]] = value;
		}
		return output;
	};

	/**
	 * Convert a string into a DOM Element
	 * @private asDOMElement
	 * @param {String} name The property name to fetch
	 */
	p.asDOMElement = function(name)
	{
		var prop = this._properties[name];
		if (prop && prop.value && typeof prop.value === "string")
		{
			prop.value = document.getElementById(prop.value);
		}
	};

	/**
	 * The default Application options
	 * @property {Object} defaultOptions
	 * @private
	 */
	var defaultOptions = {

		/**
		 * Use Request Animation Frame API
		 * @property {Boolean} raf
		 * @default true
		 */
		raf: true,

		/**
		 * The framerate to use for rendering the stage
		 * @property {int} fps
		 * @default 60
		 */
		fps: 60,

		/**
		 * The element to resize the canvas to fit
		 * @property {DOMElement|String} resizeElement
		 */
		resizeElement: null,

		/**
		 * Whether to resize the displays to the original aspect ratio
		 * @property {Boolean} uniformResize
		 * @default true
		 */
		uniformResize: true,

		/**
		 * Use the query string parameters for options overrides
		 * @property {Boolean} useQueryString
		 * @default false
		 */
		useQueryString: false,

		/**
		 * The default display DOM ID name
		 * @property {String} canvasId
		 */
		canvasId: null,

		/**
		 * The name of the class to automatically instantiate as the
		 * display (e.g. `springroll.PixiDisplay`)
		 * @property {Function} display
		 */
		display: null,

		/**
		 * Display specific setup options
		 * @property {Object} displayOptions
		 */
		displayOptions: null,

		/**
		 * If using TweenJS, the Application will update the Tween itself.
		 * @property {Boolean} updateTween
		 * @default true
		 */
		updateTween: true,

		/**
		 * Used by `springroll.PixiTask`, default behavior
		 * is to load assets from the same domain.
		 * @property {Boolean} crossOrigin
		 * @default false
		 */
		crossOrigin: false,

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum height relative to the original width. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original height of the canvas.
		 * @property {int} maxHeight
		 */
		maxHeight: 0,

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum width relative to the original height. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original width of the canvas.
		 * @property {int} maxWidth
		 */
		maxWidth: 0,

		/**
		 * The name of the application
		 * @property {String} name
		 * @default ''
		 */
		name: ''
	};

	// Assign to namespace
	namespace('springroll').ApplicationOptions = ApplicationOptions;

}());