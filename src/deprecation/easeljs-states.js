(function(Object)
{
	// Include classes
	var BasePanel = include('springroll.easeljs.BasePanel'),
		BaseState = include('springroll.easeljs.BaseState');
	
	/**
	 * @property
	 * @name springroll.BasePanel#game
	 * @see {@link springroll.BasePanel#app}
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
	 * @property
	 * @name springroll.easeljs.BaseState#game
	 * @see {@link springroll.BaseState#app}
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
	 * @property
	 * @name springroll.easeljs.BaseState#manifest
	 * @see {@link springroll.State#preload}
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
	 * @property
	 * @name springroll.easeljs.BaseState#assetsLoaded
	 * @see {@link springroll.State#preloaded}
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