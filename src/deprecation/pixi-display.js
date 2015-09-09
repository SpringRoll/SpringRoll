/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(Object)
{
	// Include classes
	var PixiDisplay = include('springroll.pixi.PixiDisplay'),
		Application = include('springroll.Application');
	
	/**
	 * @class PixiDisplay
	 */
	/**
	 * See {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @property {springroll.Animator} animator
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(PixiDisplay.prototype, 'animator', 
	{
		get: function()
		{
			if (DEBUG) console.warn('PixiDisplay\'s animator property is now deprecated, please use the app property, e.g. : app.animator');
			return Application.instance.animator;
		}
	});

}(Object));