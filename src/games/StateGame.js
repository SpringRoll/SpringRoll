/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){
	
	var StateManager,
		SoundGame = include('cloudkid.SoundGame');

	/**
	*  A game with state management, provides some convenience and events for adding states.
	*  @example
		var game = new cloudkid.StateGame();
		game.on('statesReady', function(){
			// Ready to use!
		});
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
	*  The States are setup, this is the event to listen to 
	*  when the game ready to use. Do NOT use Application's init,
	*  or Game's loaded, or SoundGame's 'soundReady' events 
	*  as the entry point for your application.
	*  @event statesReady
	*/
	var STATES_READY = 'statesReady';

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
		this.off('soundReady');

		this.trigger(INIT_STATES);

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

		//if the transition is a CreateJS movieclip, start it out 
		//at the end of the transition out animation. If it has a 
		//'transitionLoop' animation, that will be played as soon as a state is set
		if(this.transition.gotoAndStop)
			this.transition.gotoAndStop("onTransitionOut_stop");

		// Create the state manager
		this.manager = new StateManager(
			this.display,
			this.transition, 
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
		this.trigger(STATES_READY);
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
			this.display.adapter.removeChildren(this.transition);
			this.transition = null;
		}
		
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[StateGame name='" + this.name + "'']";
	};
	
	// Assign to the global namespace
	namespace('cloudkid').StateGame = StateGame;
	
}());