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
	* @class Application
	* @extends springroll.PropertyDispatcher
	* @constructor {Object} [overrides] The supplied options
	*/
	var ApplicationOptions = function(app, options)
	{
		if(Debug === undefined)
			Debug = include('springroll.Debug', false);
		
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

			this.on('debugRemote', function(value)
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
		
		//trigger all of the initial values, because otherwise they don't take effect.
		var _properties = this._properties;
		for(var id in _properties)
		{
			this.trigger(id, _properties[id]);
		}
	};

	// Extend the base class
	var p = extend(ApplicationOptions, PropertyDispatcher);

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
		 * Enable the Debug class. After initialization, this
		 * is a pass-through to Debug.enabled.
		 * @property {Boolean} debug
		 * @default false
		 */
		debug: false,

		/**
		 * Minimum log level from 0 to 4
		 * @property {int} minLogLevel
		 * @default 0
		 */
		minLogLevel: 0,

		/**
		 * The host computer for remote debugging, the debug
		 * module must be included to use this feature. Can be an
		 * IP address or host name. After initialization, setting
		 * this will still connect or disconect Debug for remote
		 * debugging. This is a write-only property.
		 * @property {String} debugRemote
		 */
		debugRemote: null,

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
		 * @default false
		 */
		updateTween: false,

		/**
		 * The application pauses automatically when the window loses focus.
		 * @property {Boolean} autoPause
		 * @default true
		 */
		autoPause: true,

		/**
		 * The current version number for your application. This
		 * number will automatically be appended to all file
		 * requests. For instance, if the version is "0.0.1" all
		 * file requests will be appended with "?v=0.0.1"
		 * @property {String} version
		 */
		version: null,

		/**
		 * Path to a text file which contains explicit version
		 * numbers for each asset. This is useful for controlling
		 * the live browser cache. For instance, this text file
		 * would have an asset on each line followed by a number:
		 * `assets/config/config.json 2` would load
		 * `assets/config/config.json?v=2`
		 * @property {String} versionsFile
		 */
		versionsFile: null,

		/**
		 * Override the end-user browser cache by adding
		 * "?v=" to the end of each file path requested. Use
		 * for developmently, debugging only!
		 * @property {Boolean} cacheBust
		 * @default false
		 */
		cacheBust: false,

		/**
		 * The optional file path to prefix to any relative file
		 * requests this is a great way to load all load requests
		 * with a CDN path.
		 * @property {String} basePath
		 */
		basePath: null,

		/**
		 * Used by `springroll.PixiTask`, default behavior
		 * is to load assets from the same domain.
		 * @property {Boolean} crossOrigin
		 * @default false
		 */
		crossOrigin: false,

		/**
		 * Framereate container
		 * @property {String|DOMElement} framerate
		 */
		framerate: null,

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
		maxWidth: 0
	};

	// Assign to namespace
	namespace('springroll').ApplicationOptions = ApplicationOptions;

}());