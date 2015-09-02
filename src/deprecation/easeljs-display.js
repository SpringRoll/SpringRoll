(function(Object)
{
	// Include classes
	var EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Application = include('springroll.Application');
	
	/**
	 * @property
	 * @name springroll.easeljs.EaselJSDisplay#animator
	 * @see {@link springroll.Application#animator}
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(EaselJSDisplay.prototype, 'animator', 
	{
		get: function()
		{
			if (DEBUG) console.warn('EaselJSDisplay\'s animator property is now deprecated, please use the app property, e.g. : app.animator');
			return Application.instance.animator;
		}
	});

}(Object));