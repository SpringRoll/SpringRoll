(function(){
	
	var Application = include('springroll.Application'),
		Loader = include('springroll.Loader'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * @method
	 * @name springroll.Application#getDisplays
	 * @see {@link springroll.Application#displays}
	 * @deprecated since version 0.3.5
	 */
	Application.prototype.getDisplays = function(each)
	{
		console.warn('getDisplays is now deprecated, please use displays property, e.g.: app.displays.forEach(function(display){});');

		if (typeof each == "function")
		{
			_displays.forEach(each);
		}
		return _displays;
	};

	/**
	 * @method
	 * @static
	 * @name springroll.EventDispatcher#mixIn
	 * @see {@link window.mixin}
	 * @deprecated since version 0.4.0
	 */
	EventDispatcher.mixIn = function(object, callConstructor)
	{
		console.warn('mixIn is now deprecated, please use window.mixin, e.g.: mixin(object, EventDispatcher);');
		return mixin(object, EventDispatcher);
	};

	/**
	 * @property
	 * @static
	 * @name springroll.Loader#instance
	 * @see {@link springroll.Application#loader}
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(Loader, "instance",
	{
		get: function()
		{
			console.warn('Loader.instance is now deprecated, please use Application\'s loader property, e.g.: app.loader.load(url, callback);');
			return Application.instance.loader;
		}
	});

}());