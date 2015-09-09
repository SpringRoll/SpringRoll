/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var StateManager = include('springroll.StateManager');

	// Reference to the prototype
	var p = StateManager.prototype;

	/**
	 * @class StateManager
	 * @namespace springroll
	 */
	/**
	 * See see {{#crossLink "springroll.StateManager/transition:property"}}{{/crossLink}}
	 * @method changeTransition
	 * @deprecated since version 0.3.0
	 * @param {*} transition The transition clip
	 */
	p.changeTransition = function(transition)
	{
		if (DEBUG) console.warn("changeTransition is now deprecated, please use the property transition: e.g.: app.manager.transition = myTransition; ");
		this.transition = transition;
	};

	/**
	 * Get the current state, see see {{#crossLink "springroll.StateManager/currentState:property"}}{{/crossLink}}
	 * @method getCurrentState
	 * @deprecated since version 0.3.0
	 * @return {springroll.State} The current state
	 */
	p.getCurrentState = function()
	{
		if (DEBUG) console.warn("getCurrentState is now deprecated, please use the property currentState: e.g.: app.manager.currentState;");
		return this.currentState;
	};

	/**
	 * Set the current state, see {{#crossLink "springroll.StateManager/state:property"}}{{/crossLink}}
	 * @method setState
	 * @deprecated since version 0.3.0
	 * @param {String} id The state id
	 */
	p.setState = function(id)
	{
		if (DEBUG) console.warn("setState is now deprecated, please use the property state: e.g.: app.manager.state = 'title';");
		this.state = id;
	};

	/**
	 * Goto the next state, see {{#crossLink "springroll.State/nextState:method"}}{{/crossLink}}
	 * @method next
	 * @deprecated since version 0.3.0
	 */
	p.next = function()
	{
		if (DEBUG) console.warn("next is now deprecated, please use the nextState method on BaseState: e.g.: app.manager.currentState.nextState();");
		this._state.nextState();
	};

	/**
	 * Goto the previous state, see {{#crossLink "springroll.State/previousState:method"}}{{/crossLink}}
	 * @method previous
	 * @deprecated since version 0.3.0
	 */
	p.previous = function()
	{
		if (DEBUG) console.warn("previous is now deprecated, please use the previousState method on BaseState: e.g.: app.manager.currentState.previousState();");
		this._state.previousState();
	};

	/**
	 * A state for use with the StateManager, see see {{#crossLink "springroll.State"}}{{/crossLink}}
	 * @class springroll.BaseState
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(include('springroll'), 'BaseState', 
	{
		get: function()
		{
			if (DEBUG) console.warn("springroll.BaseState is now deprecated, please use springroll.State instead");
			return include('springroll.State');
		}
	});

}());