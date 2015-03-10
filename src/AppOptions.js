/**
*  @module Core
*  @namespace springroll
*/
(function(undefined)
{
	var Debug = include('Debug', false),
		Tween = include('createjs.Tween', false),
		Ticker = include('createjs.Ticker', false),
		PropertyDispatcher = include('springroll.PropertyDispatcher');

	/**
	* Manage the Application options
	* @class Application
	* @extends springroll.PropertyDispatcher
	* @constructor {Object} [overrides] The supplied options
	*/
	var AppOptions = function(app, options)
	{
		PropertyDispatcher.call(this);

		options = options || {};

		// If parse querystring is turned on, we'll
		// override with any of the query string parameters
		var query = options.useQueryString ? getQueryString() : {};

		// Create the options overrides
		options = Object.merge({}, defaultOptions, options, query);

		// Create getter and setters for all properties
		// this is so we can dispatch events when the property changes
		for(var name in options)
		{
			this.addProp(name, options[name]);
		}

		// Cannot change these properties after setup
		this.readOnly(
			'framerate',
			'resizeElement',
			'cacheBust',
			'useQueryString',
			'canvasId',
			'display',
			'displayOptions',
			'versionsFile',
			'uniformResize'
		);

		// Convert these to DOM elements
		parseDOMElement(this._properties.resizeElement);
		parseDOMElement(this._properties.framerate);

		// Options only for debug mode
		if (DEBUG && Debug)
		{
			this.respond('debug', function()
			{
				return Debug ? Debug.enabled : false; 
			});

			this.on('debug', function(value)
			{
				if (Debug) Debug.enabled = value;
			});

			this.respond('debugRemote', function(value)
			{
				if (Debug)
				{
					Debug.disconnect();
					if (value)
					{
						Debug.connect(value);
					}
				}
			});

			this.respond('minLogLevel', function()
			{
				return Debug ? Debug.minLogLevel.asInt : 0;
			});
			
			this.on('minLogLevel', function(value)
			{
				if (Debug)
				{
					Debug.minLogLevel = Debug.Levels.valueFromInt(
						parseInt(value, 10)
					);

					if (!Debug.minLogLevel)
					{
						Debug.minLogLevel = Debug.Levels.GENERAL;
					}
				}
			});
		}

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
	};

	// Extend the base class
	var p = extend(AppOptions, PropertyDispatcher);

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
	 * @private parseDOMElement
	 * @param {Property} prop The value to convert
	 */
	var parseDOMElement = function(prop)
	{
		if (prop.value && typeof prop.value == "string")
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
		 */
		raf: true,

		/**
		 * The target frame rate
		 * @property {int} fps
		 */
		fps: 60,

		/**
		 * Resize the canvas to an element
		 * @property {DOMElement|String} resizeElement
		 */
		resizeElement: null,

		/**
		 * If the canvas should resize proportionally
		 * @property {Boolean} uniformResize
		 */
		uniformResize: true,

		/**
		 * Use the query string parameters for options overides
		 * @property {Boolean} useQueryString
		 */
		useQueryString: false,

		/**
		 * If Debug should be turned on
		 * @property {Boolean} debug
		 */
		debug: false,

		/**
		 * Minimum log level from 0 to 4
		 * @property {int} minLogLevel
		 */
		minLogLevel: 0,

		/**
		 * Debug remote connect
		 * @property {String} debugRemote
		 */
		debugRemote: null,

		/**
		 * The canvas DOM element ID
		 * @property {String} canvasId
		 */
		canvasId: null,

		/**
		 * Which display to use, the class, not instance
		 * @property {springroll.AbstractDisplay} display
		 */
		display: null,

		/**
		 * Display specific setup options
		 * @property {Object} displayOptions
		 */
		displayOptions: null,

		/**
		 * Update the Tween using internal app tick
		 * @property {Boolean} updateTween
		 */
		updateTween: false,

		/**
		 * Auto pause the application
		 * @property {Boolean} autoPause
		 */
		autoPause: true, 

		/**
		 * The version number to attend to all file requests
		 * @property {String} version
		 */
		version: null,

		/**
		 * The version manifest file path
		 * @property {String} versionsFile
		 */
		versionsFile: null,

		/**
		 * If all file requests should be cache busted
		 * @property {Boolean} cacheBust
		 */
		cacheBust: false,

		/**
		 * Path to append to all file requests
		 * @property {String} basePath
		 */
		basePath: null,

		/**
		 * PIXI cross origin requests
		 * @property {Boolean} crossOrigin
		 */
		crossOrigin: false,

		/**
		 * Framereate container
		 * @property {String|DOMElement} framerate
		 */
		framerate: null
	};

	// Assign to namespace
	namespace('springroll').AppOptions = AppOptions;

}());