/**
 * @module Core
 * @namespace springroll
 */
(function(){
	
	var Application = include('springroll.Application'),
		Loader = include('springroll.Loader'),
		PropertyDispatcher = include('springroll.PropertyDispatcher'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * @class Application
	 */
	/**
	 * See {{#crossLink "springroll.Application/displays:property"}}{{/crossLink}}
	 * @method getDisplays
	 * @deprecated since version 0.3.5
	 * @param {function} [each] Iterator function, param is each method
	 * @return {Array} The collection of displays
	 */
	Application.prototype.getDisplays = function(each)
	{
		if (DEBUG) console.warn('getDisplays is now deprecated, please use displays property, e.g.: app.displays.forEach(function(display){});');

		if (typeof each == "function")
		{
			_displays.forEach(each);
		}
		return _displays;
	};

	/**
	 * @class EventDispatcher
	 */
	/**
	 * See {{#crossLink "window.mixin"}}{{/crossLink}}
	 * @method
	 * @static
	 * @method mixIn
	 * @deprecated since version 0.4.0
	 */
	EventDispatcher.mixIn = function(object, callConstructor)
	{
		if (DEBUG) console.warn('mixIn is now deprecated, please use window.mixin, e.g.: mixin(object, EventDispatcher);');
		return mixin(object, EventDispatcher);
	};

	/**
	 * @class Loader
	 */
	/**
	 * See {{#crossLink "springroll.Application/loader:property"}}{{/crossLink}}
	 * @static
	 * @property {springroll.Loader#instance} instance
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(Loader, "instance",
	{
		get: function()
		{
			if (DEBUG) console.warn('Loader.instance is now deprecated, please use Application\'s loader property, e.g.: app.loader.load(url, callback);');
			return Application.instance.loader;
		}
	});

	/**
	 * @class PropertyDispatcher
	 */
	/**
	 * Turn on read-only for properties
	 * @method readOnly
	 * @deprecated since version 0.4.0
	 * @param {String} prop* The property or properties to make readonly
	 * @return {springroll.PropertyDispatcher} The instance for chaining
	 */
	PropertyDispatcher.prototype.readOnly = function(properties)
	{
		if (DEBUG) console.warn('readOnly method is now deprecated, please use add(name, prop, readOnly), e.g.: app.options.add("myVar", null, true);');

		var prop, name;
		for(var i = 0; i < arguments.length; i++)
		{
			name = arguments[i];
			prop = this._properties[name];
			if (prop === undefined)
			{
				throw "Property " + name + " does not exist";
			}
			prop.readOnly = true;
		}
		return this;
	};

}());