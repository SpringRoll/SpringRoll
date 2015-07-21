(function()
{
	// Include classes
	var StateManager = include('springroll.StateManager');

	// Reference to the prototype
	var p = StateManager.prototype;

	/**
	 * @method
	 * @name springroll.StateManager#changeTransition
	 * @see {@link springroll.StateManager#transition}
	 * @deprecated since version 0.3.0
	 */
	p.changeTransition = function(transition)
	{
		console.warn("changeTransition is now deprecated, please use the property transition: e.g.: app.manager.transition = myTransition; ");
		this.transition = transition;
	};

	/**
	 * @method
	 * @name springroll.StateManager#getCurrentState
	 * @see {@link springroll.StateManager#currentState}
	 * @deprecated since version 0.3.0
	 */
	p.getCurrentState = function()
	{
		console.warn("getCurrentState is now deprecated, please use the property currentState: e.g.: app.manager.currentState;");
		return this.currentState;
	};

	/**
	 * @method
	 * @name springroll.StateManager#setState
	 * @see {@link springroll.StateManager#state}
	 * @deprecated since version 0.3.0
	 */
	p.setState = function(id)
	{
		console.warn("setState is now deprecated, please use the property state: e.g.: app.manager.state = 'title';");
		this.state = id;
	};

	/**
	 * @method
	 * @name springroll.StateManager#next
	 * @see {@link springroll.BaseState#nextState}
	 * @deprecated since version 0.3.0
	 */
	p.next = function()
	{
		console.warn("next is now deprecated, please use the nextState method on BaseState: e.g.: app.manager.currentState.nextState();");
		this._state.nextState();
	};

	/**
	 * @method
	 * @name springroll.StateManager#previous
	 * @see {@link springroll.BaseState#previousState}
	 * @deprecated since version 0.3.0
	 */
	p.previous = function()
	{
		console.warn("previous is now deprecated, please use the previousState method on BaseState: e.g.: app.manager.currentState.previousState();");
		this._state.previousState();
	};

}());