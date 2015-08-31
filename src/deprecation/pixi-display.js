(function(Object)
{
	// Include classes
	var PixiDisplay = include('springroll.pixi.PixiDisplay'),
		Application = include('springroll.Application');
	
	/**
	 * @property
	 * @name springroll.pixi.PixiDisplay#animator
	 * @see {@link springroll.Application#animator}
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(PixiDisplay.prototype, 'animator', 
	{
		get: function()
		{
			console.warn('PixiDisplay\'s animator property is now deprecated, please use the app property, e.g. : app.animator');
			return Application.instance.animator;
		}
	});

}(Object));