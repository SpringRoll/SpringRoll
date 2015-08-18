/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var PropertyDispatcher = include('springroll.PropertyDispatcher'),
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

		// Create the options overrides
		options = Object.merge({}, options);

		// If parse querystring is turned on, we'll
		// override with any of the query string parameters
		if (options.useQueryString)
		{
			Object.merge(options, getQueryString());
		}

		// Create getter and setters for all properties
		// this is so we can dispatch events when the property changes
		for(var name in options)
		{
			this.add(name, options[name]);
		}
		
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
	 * Override a default value
	 * @private override
	 * @param {String} name The property name to fetch
	 * @param {*} value The value
	 * @return {springroll.ApplicationOptions} Instance of this options for chaining
	 */
	p.override = function(name, value)
	{
		var prop = this._properties[name];
		if (prop === undefined)
		{
			if (DEBUG)
			{
				throw "Unable to override a property that doesn't exist '" + name + "'";
			}
			else
			{
				throw "Invalid override " + name;
			}
		}
		prop.setValue(value);
		return this;
	};

	// Assign to namespace
	namespace('springroll').ApplicationOptions = ApplicationOptions;

}());