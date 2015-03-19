/*! SpringRoll 0.2.0 */
/**
 * @module Game
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Imports
	var Debug,
		StateManager;
	
	/**
	*  Defines the base functionality for a state used by the state manager
	*
	*  @class BaseState
	*  @constructor
	*  @param {createjs.Container|PIXI.DisplayObjectContainer} panel The panel to associate with
	*                                                                this state.
	*  @param {String|Function} [nextState=null] The next state alias
	*  @param {String|Function} [prevState=null] The previous state alias
	*/
	var BaseState = function(panel, nextState, prevState)
	{
		Debug = include('springroll.Debug', false);
		if(!StateManager)
		{
			StateManager = include('springroll.StateManager');
		}

		/**
		* The id reference
		*
		* @property {String} stateID
		*/
		this.stateId = null;
		
		/**
		* A reference to the state manager
		*
		* @property {StateManager} manager
		*/
		this.manager = null;
		
		/**
		* The panel for the state.
		*
		* @property {createjs.Container|PIXI.DisplayObjectContainer} panel
		*/
		this.panel = panel;
		
		/**
		* If the state has been destroyed.
		*
		* @property {Boolean} _destroyed
		* @private
		*/
		this._destroyed = false;
		
		/**
		* If the manager considers this the active panel
		*
		* @property {Boolean} _active
		* @private
		*/
		this._active = false;
		
		/**
		* If we are pre-loading the state
		*
		* @property {Boolean} _isLoading
		* @private
		*/
		this._isLoading = false;
		
		/**
		* If we canceled entering the state
		*
		* @property {Boolean} _canceled
		* @private
		*/
		this._canceled = false;
		
		/**
		* When we're finishing loading
		*
		* @property {Function} _onEnterProceed
		* @private
		*/
		this._onEnterProceed = null;
		
		/**
		* If we start doing a load in enter, assign the onEnterComplete here
		*
		* @property {Function} _onLoadingComplete
		* @private
		*/
		this._onLoadingComplete = null;
		
		/**
		* If the state is enabled, meaning that it is click ready
		*
		* @property {Boolean} _enabled
		* @private
		*/
		this._enabled = false;

		/**
		*  Either the alias of the next state or a function
		*  to call when going to the next state.
		*
		*  @property {String|Function} nextState
		*  @protected
		*/
		this.nextState = nextState || null;
		
		/**
		*  Either the alias of the previous state or a function
		*  to call when going to the previous state.
		*
		*  @property {String|Function} prevState
		*  @protected
		*/
		this.prevState = prevState || null;

		// Hide the panel by default
		this.panel.visible = false;
	};
	
	var p = BaseState.prototype;
	
	/**
	*  Status of whether the panel load was canceled
	*
	*  @property {Boolean} canceled
	*  @readOnly
	*/
	Object.defineProperty(p, 'canceled', {
		get: function() { return this._canceled; }
	});
	
	/**
	*   This is called by the State Manager to exit the state
	*
	*   @method _internalExit
	*   @private
	*/
	p._internalExit = function()
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.animator.stop(this.panel);
		}
		this._enabled = false;
		this.panel.visible = false;
		this._active = false;
		this.exit();
	};
	
	/**
	*  When the state is exited. Override this to provide state cleanup.
	*
	*  @method exit
	*/
	p.exit = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*
	*   @method _internalExitStart
	*   @private
	*/
	p._internalExitStart = function()
	{
		this.exitStart();
	};
	
	/**
	*   When the state has requested to be exit, pre-transition. Override this to ensure
	*   that animation/audio is stopped when leaving the state.
	*
	*   @method exitStart
	*/
	p.exitStart = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*
	*   @method _internalEnter
	*   @param {Function} proceed The function to call after enter has been called
	*   @private
	*/
	p._internalEnter = function(proceed)
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.animator.stop(this.panel);
		}
		this._enabled = false;
		this._active = true;
		this._canceled = false;
		
		this._onEnterProceed = proceed;
		
		this.enter();
		
		if (this._onEnterProceed)
		{
			this._onEnterProceed();
			this._onEnterProceed = null;
		}
	};
	
	/**
	*   Internal function to start the preloading
	*
	*   @method loadingStart
	*/
	p.loadingStart = function()
	{
		if (this._isLoading)
		{
			if (true && Debug) Debug.warn("loadingStart() was called while we're already loading");
			return;
		}
		
		this._isLoading = true;
		this.manager.loadingStart();
		
		// Starting a load is optional and
		// need to be called from the enter function
		// We'll override the existing behavior
		// of internalEnter, by passing
		// the complete function to onLoadingComplete
		this._onLoadingComplete = this._onEnterProceed;
		this._onEnterProceed = null;
	};
	
	/**
	*   Internal function to finish the preloading
	*
	*   @method loadingDone
	*/
	p.loadingDone = function()
	{
		if (!this._isLoading)
		{
			if (true && Debug) Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
			return;
		}
		
		this._isLoading = false;
		this.manager.loadingDone();
		
		if (this._onLoadingComplete)
		{
			this._onLoadingComplete();
			this._onLoadingComplete = null;
		}
	};
	
	/**
	*   Cancel the loading of this state
	*
	*   @method _internalCancel
	*   @private
	*/
	p._internalCancel = function()
	{
		this._active = false;
		this._canceled = true;
		this._isLoading = false;
		
		this._internalExit();
		this.cancel();
	};
	
	/**
	*   Cancel the load, implementation-specific.
	*   This is where any async actions should be removed.
	*
	*   @method cancel
	*/
	p.cancel = function(){};
	
	/**
	*   When the state is entered. Override this to start loading assets - call loadingStart()
	*   to tell the StateManager that that is going on.
	*
	*   @method enter
	*/
	p.enter = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*
	*   @method _internalEnterDone
	*   @private
	*/
	p._internalEnterDone = function()
	{
		if (this._canceled) return;
		
		this.enabled = true;
		this.enterDone();
	};
	
	/**
	*   When the state is visually entered fully - after the transition is done.
	*   Override this to begin your state's activities.
	*
	*   @method enterDone
	*/
	p.enterDone = function(){};

	/**
	*   Get if this is the active state
	*
	*   @property {Boolean} active
	*   @readOnly
	*/
	Object.defineProperty(p, 'active', {
		get: function() { return this._active; }
	});
	
	/**
	* If the state is enabled, meaning that it is click ready
	*
	* @property {Boolean} enabled
	*/
	Object.defineProperty(p, 'enabled', {
		get: function() { return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
		}
	});
	
	/**
	* If the state has been destroyed.
	*
	* @property {Boolean} destroyed
	* @readOnly
	*/
	Object.defineProperty(p, 'destroyed', {
		get: function() { return this._destroyed; }
	});
	
	/**
	*   Don't use the state object after this
	*
	*   @method destroy
	*/
	p.destroy = function()
	{
		this.panel = null;
		this.manager = null;
		this._destroyed = true;
		this._onEnterProceed = null;
		this._onLoadingComplete = null;
	};
	
	// Add to the name space
	namespace('springroll').BaseState = BaseState;
	
}());
/**
 * @module Game
 * @namespace springroll
 * @requires Core
 */
(function(undefined){
	
	/**
	*   A state-related event used by the State Manager
	*
	*   @class StateEvent
	*   @constructor
	*   @param {String} type The type of event.
	*   @param {BaseState} currentState The currentState of the state manager
	*   @param {BaseState} visibleState The current state being transitioned or changing visibility,
	*                                   default to currentState
	*/
	var StateEvent = function(type, currentState, visibleState)
	{
		/**
		* A reference to the current state of the state manager
		*
		* @property {BaseState} currentState
		*/
		this.currentState = currentState;
		
		/**
		* A reference to the state who's actually being transitioned or being changed
		*
		* @property {BaseState} visibleState
		*/
		this.visibleState = visibleState === undefined ? currentState : visibleState;
		
		/** The type of event
		 *
		 * @property {String} type
		*/
		this.type = type;
	};
	
	var p = StateEvent.prototype;
	
	/**
	* When the state besome visible
	*
	* @event {String} onVisible
	*/
	StateEvent.VISIBLE = "onVisible";
	
	/**
	* When the state becomes hidden
	*
	* @event {String} onHidden
	*/
	StateEvent.HIDDEN = "onHidden";
	
	// Add to the name space
	namespace('springroll').StateEvent = StateEvent;
	
}());
/**
 * @module Game
 * @namespace springroll
 * @requires Core
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
	 * @class StateManager
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {springroll.AbstractDisplay} display The display on which the transition animation is
	 *                                             displayed.
	 * @param {createjs.MovieClip|PIXI.Spine} transition The transition MovieClip to play between
	 *                                                   transitions.
	 * @param {Object} transitionSounds Data object with aliases and start times (seconds) for
	 *                                  transition in, loop and out sounds. Example:
	 *                                  {in:{alias:"myAlias", start:0.2}}.
	 *                                  These objects are in the format for Animator from
	 *                                  EaselJSDisplay or PixiDisplay, so they can be just the
	 *                                  sound alias instead of an object.
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
		if (true && Debug)
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
		if (true && Debug) Debug.assert(this._states[id] !== undefined, "No alias matching " + id);
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
		if (true && Debug) Debug.assert(!!this._state, "No current state to refresh!");
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
		if (true && Debug) Debug.assert(this._states[id] !== undefined, "No current state mattching id '"+id+"'");
		
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
			if (true && Debug)
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
			if (true && Debug)
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
/**
 * @module Game
 * @namespace springroll
 * @requires Core
 */
(function(undefined){

	//Library depencencies
	var Debug,
		Application = include('springroll.Application'),
		StateManager = include('springroll.StateManager'),
		VOPlayer,
		Captions,
		Sound;

	/**
	*  A sub-class of Application which provides automatic Sound initialization. Also
	*  provides StateManager architecture to manage game screens and transitions between
	*  them. Last, the Game class will allow for easily setting captions for use
	*  by the VOPlayer and Animator classes.
	*  @example
		var game = new springroll.Game();
		game.on('init', function(){
			// Ready to use!
		});
	*  @class Game
	*  @extends springroll.Application
	*  @constructor
	*  @param {Object} [options] The collection of options, see Application for more options.
	*  @param {String} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition
	*                                                              animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound
	*                                                                      alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out
	*                                                                        sound alias or sound
	*                                                                        object
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The
	*                          captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin
	*                                                   swf for SoundJS
	*  @param {Array} [options.audioTypes=['ogg','mp3'] The order in which file types are
	*                                                   preferred, where "ogg" becomes a ".ogg"
	*                                                   extension on all sound file urls.
	*  @param {Boolean} [options.mute=false] Set the initial mute state of the all the audio
	*                                        (unminifed library version only)
	*  @param {String} [options.name=''] The name of the game
	*  @param {Boolean} [options.forceTouch=false] Manually override the check for hasTouch
	*                                               (unminifed library version only)
	*  @param {Boolean} [options.updateTween=true] Have the application take care of the Tween
	*                                              updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*                                         numbers for each asset. This is useful for
	*                                         controlling the live browser cache. For instance,
	*                                         this text file would have an asset on each line
	*                                         followed by a number: `assets/config/config.json 2`
	*                                         this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding
	*                                             "?v=" to the end of each file path requested. Use
	*                                             for development, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file
	*                                     requests. This is a great way to load all load requests
	*                                     with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original
	*                                                aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to
	*                                           add a maximum aspect ratio. This allows for
	*                                           "title-safe" responsiveness. Must be greater than
	*                                           the original aspect ratio of the canvas.
	*  @param {Number} [options.minAspectRatio] If doing uniform resizing, optional parameter to add
	*                                           a minimum aspect ratio. This allows for "title-safe"
	*                                           responsiveness. Must be less than the original
	*                                           aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as
	*                                                         options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0
	*                                       (general) to 4 (error). the `Debug` class must be used
	*                                       for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging, the debug
	*                                        module must be included to use this feature. Can be an
	*                                        IP address or host name.
	*  @param {Boolean} [options.updateTween=true] If using TweenJS, the Application will update
	*                                              the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to automatically instantiate as the
	*                                      display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior
	*                                               is to load assets from the same domain.
	*/
	var Game = function(options)
	{
		Debug = include('springroll.Debug', false);
		Sound = include('springroll.Sound');
		VOPlayer = include('springroll.VOPlayer');

		// Set the default options
		Application.call(this, Object.merge({
			swfPath : 'assets/swfs/',
			audioTypes : ["ogg", "mp3"],
			mute : false,
			captions : null,
			updateTween : true,
			name : '',
			forceMobile : false,
			state : null,
			transition : null,
			transitionSounds : {
				'in' : 'TransitionIn',
				'out' : 'TransitionOut'
			}
		}, options));

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {String} name
		*  @default ""
		*/
		this.name = this.options.name;

		/**
		*  The current music alias playing
		*  @property {String} _music
		*  @private
		*/
		this._music = null;

		/**
		*  The global player for playing voice over
		*  @property {springroll.VOPlayer} player
		*/
		this.player = new VOPlayer();

		/**
		*  The global captions object
		*  @property {springroll.Captions} captions
		*/
		this.captions = null;

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = this.options.transition ||  null;

		/**
		*  The state manager
		*  @property {springroll.StateManager} manager
		*/
		this.manager = null;

		/**
		*  If the current brower is iOS
		*  @property {Boolean} isIOS
		*/
		this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;
		
		/**
		*  If the current brower is Android
		*  @property {Boolean} isAndroid
		*/
		this.isAndroid = navigator.userAgent.search(/Android/) > -1;

		/**
		*  If the current brower has touch input available
		*  @property {Boolean} hasTouch
		*/
		if (true && this.options.forceMobile)
		{
			this.hasTouch = true;
		}
		else
		{
			//Detect availability of touch events
			this.hasTouch = !!(('ontouchstart' in window) ||// iOS & Android
				(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || // IE10
				(window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 0)); // IE11+
		}

		// Callback right before init is called, we'll
		// override the init and load the sound first
		this.once('beforeInit', onBeforeInit.bind(this));
	};

	// Extend application
	var s = Application.prototype;
	var p = extend(Game, Application);

	/**
	*  The sound is ready to use
	*  @event soundReady
	*/
	var SOUND_READY = 'soundReady';

	/**
	*  Before creating the statemanager, a transition
	*  should probably be added at this callback
	*  @event initStates
	*/
	var INIT_STATES = 'initStates';

	/**
	*  The states are setup, this is the event to listen to
	*  when the game ready to use.
	*  @event statesReady
	*/
	var STATES_READY = 'statesReady';

	/**
	*  Initialize the states event, this is where state could be added
	*  @event addStates
	*/
	var ADD_STATES = 'addStates';

	/**
	*  Override the do init method
	*  @method onBeforeInit
	*  @protected
	*/
	var onBeforeInit = function()
	{
		this._readyToInit = false;

		// Initialize the sound
		Sound.init({
			swfPath : this.options.swfPath,
			ready : onSoundReady.bind(this),
			types : this.options.audioTypes
		});
	};

	/**
	*  Callback when the sound has been initialized
	*  @method onSoundReady
	*  @private
	*/
	var onSoundReady = function()
	{
		if (true)
		{
			// For testing, mute the game if requested
			Sound.instance.muteAll = !!this.options.mute;
		}
		this._readyToInit = true;
		this.trigger(SOUND_READY);
		this._doInit();
	};

	/**
	*  Manual initialization of the states
	*  @method initStates
	*  @protected
	*/
	p.initStates = function()
	{
		this.trigger(INIT_STATES);

		// Goto the transition state
		if (!this.transition)
		{
			if (true)
			{
				throw "StateManager requires a 'transition' property to be set or through constructor options";
			}
			else
			{
				throw "No options.transition";
			}
		}

		//if the transition is a EaselJS movieclip, start it out
		//at the end of the transition out animation. If it has a
		//'transitionLoop' animation, that will be played as soon as a state is set
		if (this.transition.gotoAndStop)
		{
			this.transition.gotoAndStop("onTransitionOut_stop");
		}

		// Create the state manager
		this.manager = new StateManager(
			this.display,
			this.transition,
			this.options.transitionSounds
		);

		// states should be added on this event!
		this.trigger(ADD_STATES);

		// Add the transition on top of everything else
		this.display.stage.addChild(this.transition);

		// Goto the first state
		if (this.options.state)
		{
			this.manager.setState(this.options.state);
		}

		this.trigger(STATES_READY);
	};

	/**
	*  Add a single state
	*  @method addState
	*  @param {String} alias The shortcut alias for the state
	*  @param {BaseState} state The state manager state to add
	*/
	p.addState = function(alias, state)
	{
		if (!this.manager)
		{
			if (true)
			{
				throw "StateManager has not been created, call initStates() on Game";
			}
			else
			{
				throw "StateManager no initialized";
			}
		}
		
		// Add to the manager
		this.manager.addState(alias, state);

		// Add the state display object to the main display
		this.display.stage.addChild(state.panel);
	};

	/**
	*  Add a bunch of states at once by a dictionary of aliases to states
	*  @method addStates
	*  @param {Object} states The collection of states where the key is the state alias
	*/
	p.addStates = function(states)
	{
		for(var alias in states)
		{
			this.addState(alias, states[alias]);
		}
	};

	/**
	*  Set the current music alias to play
	*  @property {String} music
	*  @default null
	*/
	Object.defineProperty(p, "music",
	{
		set: function(value)
		{
			if (value == this._music)
			{
				return;
			}
			var sound = Sound.instance;

			if (this._music)
			{
				sound.fadeOut(this._music);
			}
			this._music = value;

			if (this._music)
			{
				sound.play(
					this._music,
					{
						start: sound.fadeIn.bind(sound, this._music),
						loop: -1
					}
				);
			}
		},
		get: function()
		{
			return this._music;
		}
	});

	/**
	*  Convenience method to loads a Sound config object.
	*  @method addSounds
	*  @public
	*  @param {Object} config The config to load.
	*  @param {String} [config.context] The optional sound context to load sounds into unless
	*                                   otherwise specified by the individual sound. Sounds do not
	*                                   require a context.
	*  @param {String} [config.path=""] The path to prepend to all sound source urls in this config.
	*  @param {Array} config.soundManifest The list of sounds, either as String ids or Objects with
	*                                      settings.
	*  @param {Object|String} config.soundManifest.* An entry in the array. If this is a
	*                                                string, then it is the same as
	*                                                {'id':'<yourString>'}.
	*  @param {String} config.soundManifest.*.id The id to reference the sound by.
	*  @param {String} [config.soundManifest.*.src] The src path to the file, without an
	*                                               extension. If omitted, defaults to id.
	*  @param {Number} [config.soundManifest.*.volume=1] The default volume for the sound,
	*                                                    from 0 to 1.
	*  @param {Boolean} [config.soundManifest.*.loop=false] If the sound should loop by
	*                                                       default whenever the loop
	*                                                       parameter in play() is not
	*                                                       specified.
	*  @param {String} [config.soundManifest.*.context] A context name to override
	*                                                   config.context with.
	*  @return {Sound} The sound object for chaining
	*/
	p.addSounds = function(config)
	{
		return Sound.instance.loadConfig(config);
	};

	/**
	*  Sets the dicitonary for the captions used by player. If a Captions object
	*  did not exist previously, then it creates one, and sets it up on all Animators.
	*  @method addCaptions
	*  @param {Object} captionData The captions data to give to the Captions object
	*/
	p.addCaptions = function(captionData)
	{
		if (!this.captions)
		{
			Captions = include('springroll.Captions');

			// Create the new captions
			var captions = new Captions(captionData, this.options.captions);
			
			this.player.captions = captions;
			this.captions = captions;
			
			// Give the display to the animators
			this.getDisplays(function(display){
				// ensure that displays without Animators don't break anything
				if(display.animator)
				{
					display.animator.captions = captions;
				}
			});
		}
		else
		{
			// Update the player captions
			this.captions.setDictionary(captionData);
		}
	};

	/**
	*  Sets the dicitonary for the captions used by player. If a Captions object
	*  did not exist previously, then it creates one, and sets it up on all Animators.
	*  @method setCaptionsDictionary
	*  @deprecated Use Game.addCaptions
	*  @param {Object} captionData The captions data to give to the Captions object
	*/
	p.setCaptionsDictionary = function(captionData)
	{
		if (true && Debug)
		{
			Debug.warn("Game.setCaptionsDictionary is deprecated, use Game.addCaptions instead");
		}
		this.addCaptions(captionData);
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}
		if (this.player)
		{
			this.player.destroy();
			this.player = null;
		}
		if (this.transition)
		{
			this.display.adapter.removeChildren(this.transition);
			this.transition = null;
		}
		this.captions = null;
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {String} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[Game name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('springroll').Game = Game;

}());