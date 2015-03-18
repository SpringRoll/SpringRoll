/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){
	
	// Imports
	var Debug = include('springroll.Debug', false),
		EventDispatcher = include('springroll.EventDispatcher'),
		BaseState = include('springroll.BaseState'),
		StateEvent = include('springroll.StateEvent');
	
	/**
	*  The State Manager used for managing the different states of a game or site
	*
	*  @class StateManager
	*  @extends springroll.EventDispatcher
	*  @constructor
	*  @param {springroll.AbstractDisplay} display The display on which the transition animation is
	*                                              displayed.
	*  @param {createjs.MovieClip|PIXI.Spine} transition The transition MovieClip to play between
	*                                                    transitions.
	*  @param {Object} transitionSounds Data object with aliases and start times (seconds) for
	*                                   transition in, loop and out sounds. Example:
	*                                   {in:{alias:"myAlias", start:0.2}}.
	*                                   These objects are in the format for Animator from
	*                                   EaselJSDisplay or PixiDisplay, so they can be just the
	*                                   sound alias instead of an object.
	*/
	var StateManager = function(display, transition, transitionSounds)
	{
		EventDispatcher.call(this);

		/**
		* The display that holds the states this StateManager is managing.
		*
		* @property {springroll.AbstractDisplay} _display
		* @private
		*/
		this._display = display;
		
		/**
		* The click to play in between transitioning states
		*
		* @property {createjs.MovieClip|PIXI.Spine} _transition
		* @private
		*/
		this._transition = transition;
		
		/**
		* The sounds for the transition
		*
		* @property {Object} _transitionSounds
		* @private
		*/
		this._transitionSounds = transitionSounds || null;
		
		/**
		* The collection of states map
		*
		* @property {Object} _states
		* @private
		*/
		this._states = {};
		
		/**
		* The currently selected state
		*
		* @property {BaseState} _state
		* @private
		*/
		this._state = null;
		
		/**
		* The currently selected state id
		*
		* @property {String} _stateID
		* @private
		*/
		this._stateId = null;
		
		/**
		* The old state
		*
		* @property {BaseState} _oldState
		* @private
		*/
		this._oldState = null;
		
		/**
		* If the manager is loading a state
		*
		* @property {Boolean} name description
		* @private
		*/
		this._isLoading = false;
		
		/**
		* If the state or manager is current transitioning
		*
		* @property {Boolean} _isTransitioning
		* @private
		*/
		this._isTransitioning = false;
		
		/**
		* If the current object is destroyed
		*
		* @property {Boolean} _destroyed
		* @private
		*/
		this._destroyed = false;
		
		/**
		* If we're transitioning the state, the queue the id of the next one
		*
		* @property {String} _queueStateId
		* @private
		*/
		this._queueStateId = null;

		// Construct
		if (this._transition.stop)
		{
			this._transition.stop();
		}
		// Hide the blocker
		this.hideBlocker();

		// Binding
		this._loopTransition = this._loopTransition.bind(this);
		this._onTransitionOut = this._onTransitionOut.bind(this);
		this._onStateLoaded = this._onStateLoaded.bind(this);
		this._onTransitionIn = this._onTransitionIn.bind(this);
	};
	
	var p = extend(StateManager, EventDispatcher);

	/**
	* The name of the Animator label and event for transitioning into a state.
	*
	* @event onTransitionIn
	*/
	StateManager.TRANSITION_IN = "onTransitionIn";
	
	/**
	* The name of the event for completing transitioning into a state.
	*
	* @event onTransitionInDone
	*/
	StateManager.TRANSITION_IN_DONE = "onTransitionInDone";
	
	/**
	* The name of the Animator label and event for transitioning out of a state.
	*
	* @event onTransitionOut
	*/
	StateManager.TRANSITION_OUT = "onTransitionOut";
	
	/**
	* The name of the event for completing transitioning out of a state.
	*
	* @event onTransitionOutDone
	*/
	StateManager.TRANSITION_OUT_DONE = "onTransitionOutDone";
	
	/**
	* The name of the event for initialization complete - the first state is then being entered.
	*
	* @event onInitDone
	*/
	StateManager.TRANSITION_INIT_DONE = "onInitDone";
	
	/**
	* Event when the state begins loading assets when it is entered.
	*
	* @event onLoadingStart
	*/
	StateManager.LOADING_START = "onLoadingStart";
	
	/**
	* Event when the state finishes loading assets when it is entered.
	*
	* @event onLoadingDone
	*/
	StateManager.LOADING_DONE = "onLoadingDone";
	
	/**
	*  Register a state with the state manager, done initially
	*
	*  @method addState
	*  @param {String} id The string alias for a state
	*  @param {BaseState} state State object reference
	*/
	p.addState = function(id, state)
	{
		if (DEBUG && Debug)
		{
			Debug.assert(state instanceof BaseState, "State ("+id+") needs to subclass springroll.BaseState");
		}
		
		// Add to the collection of states
		this._states[id] = state;
		
		// Give the state a reference to the id
		state.stateId = id;
		
		// Give the state a reference to the manager
		state.manager = this;
	};
	
	/**
	*  Dynamically change the transition
	*
	*  @method changeTransition
	*  @param {createjs.MovieClip|PIXI.Spine} Clip to swap for transition
	*/
	p.changeTransition = function(clip)
	{
		this._transition = clip;
	};
	
	/**
	*   Get the current selected state (state object)
	*
	*   @method getCurrentState
	*   @return {BaseState} The Base State object
	*/
	p.getCurrentState = function()
	{
		return this._state;
	};
	
	/**
	*   Access a certain state by the ID
	*
	*   @method getStateById
	*   @param {String} id State alias
	*   @return {BaseState} The base State object
	*/
	p.getStateById = function(id)
	{
		if (DEBUG && Debug) Debug.assert(this._states[id] !== undefined, "No alias matching " + id);
		return this._states[id];
	};
	
	/**
	* If the StateManager is busy because it is currently loading or transitioning.
	*
	* @method isBusy
	* @return {Boolean} If StateManager is busy
	*/
	p.isBusy = function()
	{
		return this._isLoading || this._isTransitioning;
	};
	
	/**
	*   If the state needs to do some asyncronous tasks,
	*   The state can tell the manager to stop the animation
	*
	*   @method loadingStart
	*/
	p.loadingStart = function()
	{
		if (this._destroyed) return;
		
		this.trigger(StateManager.LOADING_START);
		
		this._loopTransition();
	};
	
	/**
	*   If the state has finished it's asyncronous task loading
	*   Lets enter the state
	*
	*   @method loadingDone
	*/
	p.loadingDone = function()
	{
		if (this._destroyed) return;
		
		this.trigger(StateManager.LOADING_DONE);
	};
	
	/**
	*   Show, enable the blocker clip to disable mouse clicks
	*
	*   @method showBlocker
	*/
	p.showBlocker = function()
	{
		this._display.enabled = false;
	};
	
	/**
	*   Re-enable interaction with the stage
	*
	*   @method hideBlocker
	*/
	p.hideBlocker = function()
	{
		this._display.enabled = true;
	};
	
	/**
	*   This transitions out of the current state and
	*   enters it again. Can be useful for clearing a state
	*
	*   @method refresh
	*/
	p.refresh = function()
	{
		if (DEBUG && Debug) Debug.assert(!!this._state, "No current state to refresh!");
		this.setState(this._stateId);
	};
	
	/**
	*  Get or change the current state, using the state id.
	*  @property {String} state
	*/
	Object.defineProperty(p, "state", {
		set : function(id)
		{
			this.setState(id);
		},
		get : function()
		{
			return this._stateId;
		}
	});

	/**
	*  Set the current State
	*
	*  @method setState
	*  @param {String} id The state id
	*/
	p.setState = function(id)
	{
		if (DEBUG && Debug) Debug.assert(this._states[id] !== undefined, "No current state mattching id '"+id+"'");
		
		// If we try to transition while the transition or state
		// is transition, then we queue the state and proceed
		// after an animation has played out, to avoid abrupt changes
		if (this._isTransitioning)
		{
			this._queueStateId = id;
			return;
		}
		
		this._stateId = id;
		this.showBlocker();
		this._oldState = this._state;
		this._state = this._states[id];
		
		if (!this._oldState)
		{
			// There is not current state
			// this is only possible if this is the first
			// state we're loading
			this._isTransitioning = true;
			this._transition.visible = true;
			this._loopTransition();
			this.trigger(StateManager.TRANSITION_INIT_DONE);
			this._isLoading = true;
			this._state._internalEnter(this._onStateLoaded);
		}
		else
		{
			// Check to see if the state is currently in a load
			// if so cancel the state
			if (this._isLoading)
			{
				this._oldState._internalCancel();
				this._isLoading = false;
				this._state._internalEnter(this._onStateLoaded);
			}
			else
			{
				this._isTransitioning = true;
				this._oldState._internalExitStart();
				this.showBlocker();
				
				this.trigger(StateManager.TRANSITION_OUT);
				
				this._transitioning(StateManager.TRANSITION_OUT, this._onTransitionOut);
			}
		}
	};
	
	/**
	 * When the transition out of a state has finished playing during a state change.
	 * @method _onTransitionOut
	 * @private
	 */
	p._onTransitionOut = function()
	{
		this.trigger(StateManager.TRANSITION_OUT_DONE);
		
		this._isTransitioning = false;
		
		if (this.has(StateEvent.HIDDEN))
		{
			this.trigger(
				StateEvent.HIDDEN,
				new StateEvent(StateEvent.HIDDEN, this._state, this._oldState));
		}
		this._oldState.panel.visible = false;
		this._oldState._internalExit();
		this._oldState = null;

		this._loopTransition();//play the transition loop animation
		
		if (!this._processQueue())
		{
			this._isLoading = true;
			this._state._internalEnter(this._onStateLoaded);
		}
	};
	
	/**
	*   When the state has completed its loading sequence.
	*   This should be treated as an asynchronous process.
	*
	*   @method _onStateLoaded
	*   @private
	*/
	p._onStateLoaded = function()
	{
		this._isLoading = false;
		this._isTransitioning = true;
		
		if (this.has(StateEvent.VISIBLE))
			this.trigger(StateEvent.VISIBLE, new StateEvent(StateEvent.VISIBLE, this._state));
		this._state.panel.visible = true;
		
		this.trigger(StateManager.TRANSITION_IN);
		this._transitioning(StateManager.TRANSITION_IN, this._onTransitionIn);
	};
	
	/**
	 * When the transition into a state has finished playing during a state change.
	 * @method _onTransitionIn
	 * @private
	 */
	p._onTransitionIn = function()
	{
		this._transition.visible = false;
		this.trigger(StateManager.TRANSITION_IN_DONE);
		this._isTransitioning = false;
		this.hideBlocker();
		
		if (!this._processQueue())
		{
			this._state._internalEnterDone();
		}
	};
	
	/**
	*  Process the state queue
	*
	*  @method _processQueue
	*  @return If there is a queue to process
	*  @private
	*/
	p._processQueue = function()
	{
		// If we have a state queued up
		// then don't start loading the new state
		// enter a new one
		if (this._queueStateId)
		{
			var queueStateId = this._queueStateId;
			this._queueStateId = null;
			this.setState(queueStateId);
			return true;
		}
		return false;
	};

	/**
	*  Plays the animation "transitionLoop" on the transition. Also serves as the animation callback.
	*  Manually looping the animation allows the animation to be synced to the audio while looping.
	*
	*  @method _loopTransition
	*  @private
	*/
	p._loopTransition = function()
	{
		var audio,
			animator = this._display.animator;

		if (this._transitionSounds)
		{
			audio = this._transitionSounds.loop;
		}

		if (animator.instanceHasAnimation(this._transition, "transitionLoop"))
		{
			animator.play(this._transition,
							{anim:"transitionLoop", audio:audio},
							this._loopTransition);
		}
	};
	
	/**
	 * Displays the transition out animation, without changing states. Upon completion, the
	 * transition looping animation automatically starts playing.
	 *
	 * @method showTransitionOut
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionOut = function(callback)
	{
		this.showBlocker();
		var sm = this;
		var func = function()
		{
			sm._loopTransition();

			if (callback)
				callback();
		};
		this._transitioning(StateManager.TRANSITION_OUT, func);
	};

	/**
	 * Displays the transition in animation, without changing states.
	 *
	 * @method showTransitionIn
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionIn = function(callback)
	{
		var sm = this;
		var func = function()
		{
			sm.hideBlocker();
			sm._transition.visible = false;
			if (callback)
				callback();
		};
		this._transitioning(StateManager.TRANSITION_IN, func);
	};
	
	/**
	*   Generalized function for transitioning with the manager
	*
	*   @method _transitioning
	*   @param {String} The animator event to play
	*   @param {Function} The callback function after transition is done
	*   @private
	*/
	p._transitioning = function(event, callback)
	{
		var clip = this._transition;
		clip.visible = true;

		var audio;

		if (this._transitionSounds)
		{
			audio = event == StateManager.TRANSITION_IN ?
				this._transitionSounds.in :
				this._transitionSounds.out;
		}
		this._display.animator.play(clip, {anim:event, audio:audio}, callback);
	};


	/**
	*  Goto the next state
	*  @method next
	*/
	p.next = function()
	{
		var type = typeof this._state.nextState;

		if (!this._state.nextState)
		{
			if (DEBUG && Debug)
			{
				Debug.info("'nextState' is undefined in current state, ignoring");
			}
			return;
		}
		else if (type === "function")
		{
			this._state.nextState();
		}
		else if (type === "string")
		{
			this.setState(this._state.nextState);
		}
	};

	/**
	*  Goto the previous state
	*  @method previous
	*/
	p.previous = function()
	{
		var type = typeof this._state.prevState;

		if (!this._state.prevState)
		{
			if (DEBUG && Debug)
			{
				Debug.info("'prevState' is undefined in current state, ignoring");
			}
			return;
		}
		else if (type === "function")
		{
			this._state.prevState();
		}
		else if (type === "string")
		{
			this.setState(this._state.prevState);
		}
	};
	
	/**
	*   Remove the state manager
	*   @method destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;

		this.off();
		
		this._display.animator.stop(this._transition);
		
		if (this._state)
		{
			this._state._internalExit();
		}

		if (this._states)
		{
			for(var id in this._states)
			{
				this._states[id].destroy();
				delete this._states[id];
			}
		}

		this._transition = null;
		this._state = null;
		this._oldState = null;
		this._states = null;
	};
	
	// Add to the name space
	namespace('springroll').StateManager = StateManager;
})();