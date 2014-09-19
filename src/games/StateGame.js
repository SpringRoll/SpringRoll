/**
*  @module cloudkid
*/
(function(undefined){
	
	var StateManager,
		Game = include('cloudkid.Game');

	/**
	*  A game with state management, provides some convenience and events for adding states.
	*  @class StateGame
	*  @extends SoundGame
	*  @constructor
	*  @param {object} [options] The Application options
	*  @param {string} [options=state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionEnd"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionStart"] The transition out sound alias or sound object
	*/
	var StateGame = function(options)
	{
		SoundGame.call(this, options);

		StateManager = include('cloudkid.StateManager');

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = options.transition ||  null;

		/**
		*  The state manager
		*  @property {cloudkid.StateManager} manager
		*/
		this.manager = null;

		// Listen for the soundReady event
		this.on('soundReady', onSoundReady.bind(this));
	};

	/**
	*  Reference to the prototype extends application
	*/
	var s = SoundGame.prototype;
	var p = StateGame.prototype = Object.create(s);

	/**
	*  Before creating the statemanager, a transition
	*  should probably be added at this callback
	*  @event initStateManager
	*/
	var INIT_STATES = 'initStates';

	/**
	*  The event when all the states are setup, presumably
	*  @event readyStates
	*/
	var READY_STATES = 'readyStates';

	/**
	*  Initialize the states event, this is where state could be added
	*  @event initStates
	*/
	var ADD_STATES = 'addStates';

	/**
	*  Callback when the game is loaded
	*  @method onLoaded
	*  @private
	*/
	var onSoundReady = function()
	{
		this.trigger(INIT_STATE_MANAGER);

		// Goto the transition state
		if (!this.transition)
		{
			if (DEBUG)
			{
				throw "StateManager requires a 'transition' property to be set or through constructor options";
			}
			else
			{
				throw "No transition on StateGame";
			}
		}

		this.transition.gotoAndStop("onTransitionOut_stop");

		// Create the state manager
		this.manager = new StateManager(
			this.display,
			transition, 
			options.transitionSounds || {
				"in" : "TransitionEnd",
				"out": "TransitionStart"
			}
		);

		// states should be added on this event!
		this.trigger(ADD_STATES);

		// Add the transition on top of everything else
		this.display.stage.addChild(this.transition);

		// Goto the first state
		if (options.state)
		{
			this.manager.setState(options.state);
		}

		// Rock and roll
		this.trigger(READY_STATES);
	};

	/**
	*  Add a single state
	*  @method addState
	*  @param {string} alias The shortcut alias for the state
	*  @param {BaseState} state The state manager state to add
	*/
	p.addState = function(alias, state)
	{
		// Add to the manager
		this.manager.addState(alias, state);

		// Add the state display object to the main display
		this.display.stage.addChild(state.panel);
	};

	/**
	*  Add a bunch of states at once by a dictionary of aliases to states
	*  @method addStates
	*  @param {object} states The collection of states where the key is the state alias
	*/
	p.addStates = function(states)
	{
		for(var alias in states)
		{
			this.addState(alias, states[alias]);
		}
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}

		if (this.transition)
		{
			this.display.DisplayAdapter.removeChildren(this.transition);
			this.transition = null;
		}
		
		s.destroy.call(this);
	};
	
	// Assign to the global namespace
	namespace('cloudkid').StateGame = StateGame;
	
}());