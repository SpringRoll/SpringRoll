(function(Object)
{
	// Include classes
	var BasePanel = include('springroll.easeljs.BasePanel'),
		BaseState = include('springroll.easeljs.BaseState');
	
	/**
	 * @property {springroll.Application} game
	 * @name springroll.BasePanel#game
	 * @see {@link springroll.BasePanel#app}
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BasePanel.prototype, 'game', 
	{
		get: function()
		{
			console.warn('game is now deprecated, please use the app property, e.g. : panel.app');
			return this.app;
		}
	});

	/**
	 * @property {springroll.Application} game
	 * @name springroll.BaseState#game
	 * @see {@link springroll.BaseState#app}
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BaseState.prototype, 'game', 
	{
		get: function()
		{
			console.warn('game is now deprecated, please use the app property, e.g. : state.app');
			return this.app;
		}
	});

}(Object));