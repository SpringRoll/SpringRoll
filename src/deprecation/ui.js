/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var ScaleManager = include('springroll.ScaleManager');
	var p = ScaleManager.prototype;

	/**
	 * @class ScaleManager
	 */
	/**
	 * See {{#crossLink "springroll.ScaleManager/addItem:method"}}{{/crossLink}}
	 * @method addBackground
	 * @deprecated since version 0.4.0
	 */
	p.addBackground = function(bitmap)
	{
		if (DEBUG) console.warn("addBackground is now deprecated, please use addItem: e.g.: app.scaling.addItem(bitmap, 'cover-image'); ");
		this.addItem(bitmap, 'cover-image', true);
		return this;
	};

	/**
	 * See {{#crossLink "springroll.ScaleManager/removeItem:method"}}{{/crossLink}}
	 * @method removeBackground
	 * @deprecated since version 0.4.0
	 */
	p.removeBackground = function(bitmap)
	{
		if (DEBUG) console.warn("removeBackground is now deprecated, please use removeItem: e.g.: app.scaling.removeItem(bitmap); ");
		this.removeItem(bitmap);
		return this;
	};

	/**
	 * See {{#crossLink "springroll.UIScaler"}}{{/crossLink}}
	 * @class UIScaler
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(springroll, 'UIScaler',
	{
		get: function()
		{
			if (DEBUG) console.warn("springroll.UIScaler now deprecated, please use ScaleManager: e.g.: springroll.ScaleManager");
			return ScaleManager;
		}
	});

}());