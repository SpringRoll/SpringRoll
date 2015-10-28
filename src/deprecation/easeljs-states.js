/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(Object)
{
	// Include classes
	var BasePanel = include('springroll.easeljs.BasePanel'),
		BaseState = include('springroll.easeljs.BaseState');

	/**
	 * @class BasePanel
	 */
	/**
	 * See {{#crossLink "springroll.BasePanel/app:property"}}{{/crossLink}}
	 * @property {springroll.Application} game
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BasePanel.prototype, 'game',
	{
		get: function()
		{
			if (DEBUG) console.warn('BasePanel\'s game property is now deprecated, please use the app property, e.g. : panel.app');
			return this.app;
		}
	});

	/**
	 * @class BaseState
	 */
	/**
	 * See {{#crossLink "springroll.BaseState/app:property"}}{{/crossLink}}
	 * @property {springroll.Application} game
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BaseState.prototype, 'game',
	{
		get: function()
		{
			if (DEBUG) console.warn('BaseState\'s game property is now deprecated, please use the app property, e.g. : state.app');
			return this.app;
		}
	});

	/**
	 * See {{#crossLink "springroll.State/preload:property"}}{{/crossLink}}
	 * @property {Array} manifest
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(BaseState.prototype, 'manifest',
	{
		get: function()
		{
			if (DEBUG) console.warn("BaseState's manifest property is now deprecated, please use preload property, e.g. : state.preload");
			return this.preload;
		}
	});

	/**
	 * See {{#crossLink "springroll.State/preloaded:property"}}{{/crossLink}}
	 * @property {Boolean} assetsLoaded
	 * @deprecated since version 0.4.0
	 * @readOnly
	 */
	Object.defineProperty(BaseState.prototype, 'assetsLoaded',
	{
		get: function()
		{
			if (DEBUG) console.warn("BaseState's assetsLoaded property is now deprecated, please use preloaded property, e.g. : state.preloaded");
			return this.preloaded;
		}
	});

}(Object));