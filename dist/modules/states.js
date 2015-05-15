/*! SpringRoll 0.3.1 */
/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Imports
	var Debug,
		StateManager,
		DelayedCall;
	
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
		if(!StateManager)
		{
			StateManager = include('springroll.StateManager');
			DelayedCall = include('springroll.DelayedCall');
			Debug = include('springroll.Debug', false);
		}

		/**
		* The id reference
		*
		* @property {String} stateId
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
	*   @param {int} [delay=0] Frames to delay the load completion to allow the framerate to
	*                          stabilize.
	*/
	p.loadingDone = function(delay)
	{
		if (!this._isLoading)
		{
			if (true && Debug) Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
			return;
		}
		
		if(delay && typeof delay == "number")
		{
			new DelayedCall(this.loadingDone.bind(this), delay, false, true, true);
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
 * @module States
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
 * @module States
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
		var audio;
		if (this._transitionSounds)
		{
			audio = this._transitionSounds.loop;
		}
		var animator = this._display.animator;
		if (animator.instanceHasAnimation('transitionLoop'))
		{
			animator.play(
				this._transition, {
					anim:'transitionLoop',
					audio:audio
				}
			);
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
*  @module States
*  @namespace springroll
*  @requires Core
*/
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		StateManager = include('springroll.StateManager'),
		Debug = include('springroll.Debug', false);

	/**
	 * Create an app plugin for Loader, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class StatesPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var StatesPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(StatesPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * Fired when an event has been added
		 * @event stateAdded
		 * @param {String} alias The state alias
		 * @param {springroll.BaseState} state The State object
		 */
		
		/**
		*  The collection of states
		*  @property {Object} _states
		*  @private
		*/
		this._states = null;

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = null;

		/**
		*  The state manager
		*  @property {springroll.StateManager} manager
		*/
		this.manager = null;

		/**
		 * The initial state to go to when everything is finished
		 * @property {Boolean} options.state
		 * @default null
		 * @readOnly
		 */
		this.options.add('state', null, true);

		/**
		 * The animation to use for the StateManager
		 * @property {createjs.MovieClip|PIXI.Spine} options.transition
		 */
		this.options.add('transition');

		/**
		 * The transition sounds to use for the state transition
		 * @property {Object} options.transitionSounds
		 * @readOnly
		 */
		/**
		 * The transition in sound alias or sound object
		 * @property {Object} options.transitionSounds.in
		 * @default "TransitionIn"
		 * @readOnly
		 */
		/**
		 * The transition out sound alias or sound object
		 * @property {Object} options.transitionSounds.out
		 * @default "TransitionOut"
		 * @readOnly
		 */
		this.options.add('transitionSounds',
		{
			'in' : 'TransitionIn',
			'out' : 'TransitionOut'
		}, true);

		/**
		*  The collection of states where the key is the state alias and value is the state display object
		*  @property {Object} states
		*  @default null
		*/
		Object.defineProperty(this, "states",
		{
			set: function(states)
			{
				if (this.manager)
				{
					if (true)
					{
						throw "StateManager has already been initialized, cannot set states multiple times";
					}
					else
					{
						throw "States already set";
					}
				}

				// Goto the transition state
				if (!this.options.transition)
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

				// Assign for convenience to the app property
				this.transition = this.options.transition;

				//if the transition is a EaselJS movieclip, start it out
				//at the end of the transition out animation. If it has a
				//'transitionLoop' animation, that will be played as soon as a state is set
				if (this.transition.gotoAndStop)
				{
					this.transition.gotoAndStop("onTransitionOut_stop");
				}

				// Create the state manager
				var manager = this.manager = new StateManager(
					this.display,
					this.transition,
					this.options.transitionSounds
				);
				
				var stage = this.display.stage;
				
				//create states
				for (var alias in states)
				{
					// Add to the manager
					manager.addState(alias, states[alias]);

					// Add the state display object to the main display
					stage.addChild(states[alias].panel);

					this.trigger('stateAdded', alias, states[alias]);
				}

				this._states = states;

				// Add the transition on top of everything else
				stage.addChild(this.transition);

				// Goto the first state
				if (this.options.state)
				{
					manager.setState(this.options.state);
				}
			},
			get: function()
			{
				return this._states;
			}
		});

		if (true)
		{
			/**
			 * Debug key strokes
			 * → = trigger a skip to the next state for testing
			 * ← = trigger a skip to the previous state for testing
			 */
			window.onkeyup = function(e)
			{
				if (!this.manager) return;

				var key = e.keyCode ? e.keyCode : e.which;
				switch (key)
				{
					//right arrow
					case 39:
					{
						if (Debug) Debug.info("Going to next state via keyboard");
						this.manager.next();
						break;
					}
					//left arrow
					case 37:
					{
						if (Debug) Debug.info("Going to previous state via keyboard");
						this.manager.previous();
						break;
					}
				}
			}
			.bind(this);
		}
	};

	// Destroy the animator
	p.teardown = function()
	{
		if (true)
		{
			window.onkeyup = null;
		}
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}
		if (this.transition)
		{
			if (this.display)
			{
				this.display.adapter.removeChildren(this.transition);
			}
			this.transition = null;
		}
	};

	// register plugin
	ApplicationPlugin.register(StatesPlugin);

}());