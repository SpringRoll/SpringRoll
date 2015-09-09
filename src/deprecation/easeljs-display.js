/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(Object)
{
	// Include classes
	var EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Application = include('springroll.Application');
	
	/**
	 * @class EaselJSDisplay
	 */
	/**
	 * See {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @property {springroll.Animator} animator
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