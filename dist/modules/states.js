/*! CloudKidFramework 0.0.5 */
!function(){"use strict";/**
*  @module cloudkid
*/
(function(){
	
	// Imports
	var StateManager;
	
	/**
	*  Defines the base functionality for a state used by the state manager
	*
	*  @class BaseState
	*  @constructor
	*  @param {createjs.MovieClip|PIXI.DisplayObjectContainer} panel The panel to associate with this panel
	*/
	var BaseState = function(panel)
	{
		if(!StateManager)
		{
			StateManager = include('cloudkid.StateManager');
		}
		this.initialize(panel);
	};
	
	var p = BaseState.prototype;
	
	/** 
	* The id reference
	* 
	* @property {String} stateID
	*/
	p.stateId = null;
	
	/**
	* A reference to the state manager
	* 
	* @property {StateManager} manager
	*/
	p.manager = null;
	
	/** 
	* Save the panel
	* 
	* @property {createjs.Container|PIXI.DisplayObjectContainer} panel
	*/
	p.panel = null;
	
	/**
	* Check to see if we've been destroyed 
	* 
	* @property {bool} _destroyed
	* @private
	*/
	p._destroyed = false;
	
	/**
	* If the manager considers this the active panel
	* 
	* @property {bool} _active
	* @private
	*/
	p._active = false;
	
	/**
	* If we are pre-loading the state
	* 
	* @property {bool} _isLoading
	* @private
	*/
	p._isLoading = false;
	
	/**
	* If we canceled entering the state
	* 
	* @property {bool} _canceled
	* @private
	*/
	p._canceled = false;
	
	/**
	* When we're finishing loading
	* 
	* @property {function} _onEnterProceed
	* @private
	*/
	p._onEnterProceed = null;
	
	/** If we start doing a load in enter, assign the onEnterComplete here
	* 
	* @property {function} _onLoadingComplete
	* @private
	*/
	p._onLoadingComplete = null;
	
	/** If the state is enabled that means it click ready
	* 
	* @property {bool} _enabled
	* @private
	*/
	p._enabled = false;

	/**
	* If we are currently transitioning
	* 
	* @property {bool} isTransitioning
	* @private
	*/
	p._isTransitioning = false;
	
	/**
	*  Initialize the Base State
	*  @function initialize
	*  @param {createjs.MovieClip|PIXI.DisplayObjectContaner} panel The panel
	*/
	p.initialize = function(panel)
	{
		this.panel = panel;
	};
	
	/**
	*  Status of whether the panel load was canceled
	*  
	*  @function  getCanceled
	*  @return {bool} If the load was canceled
	*/
	p.getCanceled = function()
	{
		return this._canceled;
	};
	
	/**
	*   This is called by the State Manager to exit the state 
	*   
	*   @function _internalExit
	*   @private
	*/
	p._internalExit = function()
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.Animator.stop(this.panel);
		}
		this._enabled = false;
		this.panel.visible = false;
		this._active = false;
		this.exit();
	};
	
	/**
	*  When the state is exited
	*  
	*  @function exit
	*/
	p.exit = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalExitStart
	*   @private
	*/
	p._internalExitStart = function()
	{
		this.exitStart();
	};
	
	/**
	*   When the state has requested to be exit, pre-transition
	*   
	*   @function exitStart
	*/
	p.exitStart = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalEnter
	*   @param {functon} proceed The function to call after enter has been called
	*   @private
	*/
	p._internalEnter = function(proceed)
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.Animator.stop(this.panel);
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
	*   @function loadingStart
	*/
	p.loadingStart = function()
	{
		if (this._isLoading)
		{
			Debug.warn("loadingStart() was called while we're already loading");
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
	*   @function loadingDone
	*/
	p.loadingDone = function()
	{
		if (!this._isLoading)
		{
			Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
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
	*   @function _internalCancel
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
	*   Cancel the load, implementation-specific
	*   this is where any async actions are removed
	*   
	*   @function cancel
	*/
	p.cancel = function(){};
	
	/**
	*   When the state is entered
	*   
	*   @function enter
	*/
	p.enter = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalEnterDone
	*   @private
	*/
	p._internalEnterDone = function()
	{
		if (this._canceled) return;
		
		this.setEnabled(true);
		this.enterDone();
	};
	
	/**
	*   When the state is visually entered fully
	*   that is, after the transition is done
	*   
	*   @function enterDone
	*/
	p.enterDone = function(){};
	
	/**
	*   Get if this is the active state
	*   
	*   @function getActive
	*   @return {bool} If this is the active state
	*/
	p.getActive = function()
	{
		return this._active;
	};
	
	/**
	*   Transition the panel in
	*   
	*   @function transitionIn
	*   @param {function} callback
	*/
	p.transitionIn = function(callback)
	{
		this._isTransitioning = true;
		
		var s = this;
		
		this.manager._display.Animator.play(
			this.panel, 
			StateManager.TRANSITION_IN,
			function()
			{
				s._isTransitioning = false;
				callback();
			}
		);
	};
	
	/**
	*   Transition the panel out
	*   
	*   @function transitionOut
	*   @param {function} callback
	*/
	p.transitionOut = function(callback)
	{
		this._enabled = false;
		this._isTransitioning = true;
		
		var s = this;
		
		this.manager._display.Animator.play(
			this.panel, 
			StateManager.TRANSITION_OUT,
			function()
			{
				s._isTransitioning = false;
				callback();
			}
		);
	};
	
	/**
	*   Get if this State has been destroyed
	*   
	*   @function  getDestroyed
	*   @return {bool} If this has been destroyed
	*/
	p.getDestroyed = function()
	{
		return this._destroyed;
	};
	
	/**
	*   Enable this panel, true is only non-loading and non-transitioning state
	*   
	*   @function setEnabled
	*   @param {bool} enabled The enabled state
	*/
	p.setEnabled = function(enabled)
	{
		this._enabled = enabled;
	};
	
	/**
	*   Get the enabled status
	*   
	*   @function getEnabled
	*   @return {bool} If this state is enabled
	*/
	p.getEnabled = function()
	{
		return this._enabled;
	};
	
	/**
	*   Don't use the state object after this
	*   
	*   @function destroy
	*/
	p.destroy = function()
	{		
		this.exit();
		
		this.panel = null;
		this.manager = null;
		this._destroyed = true;
		this._onEnterProceed = null;
		this._onLoadingComplete = null;
	};
	
	// Add to the name space
	namespace('cloudkid').BaseState = BaseState;
}());
/**
*  @module cloudkid
*/
(function(undefined){
	
	/**
	*   A state-related event used by the State Manager
	*   
	*   @class StateEvent
	*   @constructor
	*   @param {String} type See createjs.Event
	*   @param {BaseState} currentState The currentState of the state manager
	*   @param {BaseState} visibleState The current state being transitioned or changing visibility, default to currentState
	*/
	var StateEvent = function(type, currentState, visibleState)
	{
		this.initialize(type, currentState, visibleState);
	};
	
	var p = StateEvent.prototype;
	
	/** 
	* The name of the event for when the state starts transitioning in
	* 
	* @event onTransitionStateIn
	*/
	StateEvent.TRANSITION_IN = "onTransitionStateIn";
	
	/**
	* The name of the event for when the state finishes transition in
	* 
	* @event {String} onTransitionStateInDone
	*/
	StateEvent.TRANSITION_IN_DONE = "onTransitionStateInDone";
	
	/**
	* The name of the event for when the state starts transitioning out
	* 
	* @event {String} onTransitionStateOut
	*/
	StateEvent.TRANSITION_OUT = "onTransitionStateOut";
	
	/**
	* The name of the event for when the state is done transitioning out
	* 
	* @event {String} onTransitionStateOutDone
	*/
	StateEvent.TRANSITION_OUT_DONE = "onTransitionStateOutDone";
	
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
	
	/**
	* A reference to the current state of the state manager
	* 
	* @property {BaseState} currentState
	*/
	p.currentState = null;
	
	/**
	* A reference to the state who's actually being transitioned or being changed
	* 
	* @property {BaseState} visibleState
	*/
	p.visibleState = null;
	
	/** The type of event
	 * 
	 * @property {String} type
	*/
	p.type = null;
	
	/**
	*  Initialize the event
	*  
	*  @function initialize
	*  @param {String} type The type of event
	*  @param {BaseState} currentState The currentState of the state manager
	*  @param {BaseState} visibleState The current state being transitioned or changing visibility
	*/
	p.initialize = function(type, currentState, visibleState)
	{
		this.type = type;
		
		this.visibleState = visibleState === undefined ? currentState : visibleState;
		this.currentState = currentState;
	};
	
	// Add to the name space
	namespace('cloudkid').StateEvent = StateEvent;
	
}());
/**
*  @module cloudkid
*/
(function(undefined){
	
	// Imports
	var Sound,
		EventDispatcher = include('cloudkid.EventDispatcher'),
		BaseState = include('cloudkid.BaseState'),
		StateEvent = include('cloudkid.StateEvent');		
	
	/**
	*  The State Manager used for managing the different states of a game or site
	*  
	*  @class StateManager
	*  @constructor
	*  @param {cloudkid.CreateJSDisplay|cloudkid.PixiDisplay} display The display on which the transition animation is displayed.
	*  @param {createjs.MovieClip|PIXI.Spine} transition The transition MovieClip to play between transitions
	*  @param {object} audio Data object with aliases and start times (seconds) for transition in, loop and out sounds: {in:{alias:"myAlias", start:0.2}}.
	*		These objects are in the format for Animator from CreateJSDisplay or PixiDisplay, so they can be the alias instead of an object.
	*/
	var StateManager = function(display, transition, audio)
	{
		// cloudkid.Sound and cloudkid.Audio are optional sound APIs to use
		if(!Sound)
		{
			Sound = include('cloudkid.Sound', false) || include('cloudkid.Audio', false);
		}

		EventDispatcher.call(this);

		this.initialize(display, transition, audio);
	};
	
	var p = StateManager.prototype = Object.create(EventDispatcher.prototype);
	
	/**
	* The current version of the state manager
	*  
	* @property {String} VERSION
	* @static
	* @final
	*/
	StateManager.VERSION = '0.0.5';

	/**
	* The display that holds the states this StateManager is managing.
	* 
	* @property {cloudkid.CreateJSDisplay|cloudkid.PixiDisplay} _display
	* @private
	*/
	p._display = null;
	
	/**
	* The click to play in between transitioning states
	* 
	* @property {createjs.MovieClip|PIXI.Spine} _transition
	* @private
	*/
	p._transition = null;
	
	/**
	* The sounds for the transition
	* 
	* @property {object} _transitionSounds
	* @private
	*/
	p._transitionSounds = null;
	
	/**
	* The collection of states map
	* 
	* @property {Array} _states
	* @private
	*/
	p._states = null;
	
	/**
	* The currently selected state
	* 
	* @property {BaseState} _state
	* @private
	*/
	p._state = null;
	
	/** 
	* The currently selected state id
	* 
	* @property {String} _stateID
	* @private
	*/
	p._stateId = null;
	
	/**
	* The old state
	* 
	* @property {BaseState} _oldState
	* @private
	*/
	p._oldState = null;
	
	/**
	* If the manager is loading a state
	* 
	* @property {bool} name description
	* @private
	*/
	p._isLoading = false;
	
	/** 
	* If the state or manager is current transitioning
	* 
	* @property {bool} _isTransitioning
	* @private
	*/
	p._isTransitioning = false;
	
	/**
	* If the current object is destroyed
	* 
	* @property {bool} _destroyed
	* @private
	*/
	p._destroyed = false;
	
	/**
	* If we're transitioning the state, the queue the id of the next one
	* 
	* @property {String} _queueStateId
	* @private
	*/
	p._queueStateId = null;
	
	/**
	* The name of the Animator label and event for transitioning state in
	* 
	* @event onTransitionIn
	*/
	StateManager.TRANSITION_IN = "onTransitionIn";
	
	/**
	* The name of the event for done with transitioning state in
	* 
	* @event onTransitionInDone
	*/
	StateManager.TRANSITION_IN_DONE = "onTransitionInDone";
	
	/**
	* The name of the Animator label and event for transitioning state out
	* 
	* @event onTransitionOut
	*/
	StateManager.TRANSITION_OUT = "onTransitionOut";
	
	/**
	* The name of the event for done with transitioning state out
	* 
	* @event onTransitionOutDone
	*/
	StateManager.TRANSITION_OUT_DONE = "onTransitionOutDone";
	
	/**
	* The name of the event for done with initializing
	* 
	* @event onInitDone
	*/
	StateManager.TRANSITION_INIT_DONE = "onInitDone";
	
	/**
	* Event when the state transitions the first time
	* 
	* @event onLoadingStart
	*/
	StateManager.LOADING_START = "onLoadingStart";
	
	/**
	* Event when the state transitions the first time
	* 
	* @event onLoadingDone
	*/
	StateManager.LOADING_DONE = "onLoadingDone";
	
	/**
	*  Initialize the State Manager
	*  
	*  @function intialize
	*  @param {cloudkid.CreateJSDisplay|cloudkid.PixiDisplay} display The display on which the transition animation is displayed.
	*  @param {createjs.MovieClip|PIXI.Spine} transition The transition MovieClip to play between transitions
	*  @param {object} transitionSounds Data object with aliases and start times (seconds) for transition in, loop and out sounds: {in:{alias:"myAlias", start:0.2}}
	*/
	p.initialize = function(display, transition, transitionSounds)
	{
		this._display = display;
		this._transition = transition;
		
		if(this._transition.stop)
			this._transition.stop();

		this.hideBlocker();
		this._states = {};
		
		this._transitionSounds = transitionSounds || null;

		this._loopTransition = this._loopTransition.bind(this);
	};
	
	/**
	*  Register a state with the state manager, done initially
	*  
	*  @function addState
	*  @param {String} id The string alias for a state
	*  @param {BaseState} state State object reference
	*/
	p.addState = function(id, state)
	{
		if (true) 
		{
			Debug.assert(state instanceof BaseState, "State ("+id+") needs to subclass cloudkid.BaseState");
		}
		
		// Add to the collection of states
		this._states[id] = state;
		
		// Give the state a reference to the id
		state.stateId = id;
		
		// Give the state a reference to the manager
		state.manager = this;
		
		// Make sure the state ie exited initially
		state._internalExit();
	};
	
	/**
	*  Dynamically change the transition
	*  
	*  @function changeTransition
	*  @param {createjs.MovieClip|PIXI.Spine} Clip to swap for transition
	*/
	p.changeTransition = function(clip)
	{
		this._transition = clip;
	};
	
	/**
	*  Get the currently selected state
	*  
	*  @function getState
	*  @return {String} The id of the current state
	*/
	p.getState = function()
	{
		return this._stateId;
	};
	
	/**
	*   Get the current selected state (state object)
	*   
	*   @function getCurrentState
	*   @return {BaseState} The Base State object
	*/
	p.getCurrentState = function()
	{
		return this._state;
	};
	
	/**
	*   Access a certain state by the ID
	*   
	*   @function getStateById
	*   @param {String} id State alias
	*   @return {BaseState} The base State object
	*/
	p.getStateById = function(id)
	{
		Debug.assert(this._states[id] !== undefined, "No alias matching " + id);
		return this._states[id];
	};
	
	/** 
	* If the StateManager is busy because it is currently loading or transitioning.
	* 
	* @function isBusy
	* @return {bool} If StateManager is busy
	*/
	p.isBusy = function()
	{
		return this._isLoading || this._isTransitioning;
	};
	
	/**
	*   If the state needs to do some asyncronous tasks,
	*   The state can tell the manager to stop the animation
	*   
	*   @function loadingStart
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
	*   @function loadingDone
	*/
	p.loadingDone = function()
	{
		if (this._destroyed) return;
		
		this.trigger(StateManager.LOADING_DONE);
	};
	
	/**
	*   Show, enable the blocker clip to disable mouse clicks
	*   
	*   @function showBlocker
	*/
	p.showBlocker = function()
	{
		this._display.enabled = false;
	};
	
	
	/**
	*   Re-enable interaction with the stage
	*   
	*   @function hideBlocker
	*/
	p.hideBlocker = function()
	{
		this._display.enabled = true;
	};
	
	/**
	*   This transitions out of the current state and 
	*   enters it again. Can be useful for clearing a state
	*   
	*   @function refresh
	*/
	p.refresh = function()
	{
		Debug.assert(!!this._state, "No current state to refresh!");
		this.setState(this._stateId);
	};
	
	/**
	*  Set the current State
	*  
	*  @function setState
	*  @param {String} id The state id
	*/
	p.setState = function(id)
	{
		Debug.assert(this._states[id] !== undefined, "No current state mattching id '"+id+"'");
		
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
		
		var sm;
		if (!this._oldState)
		{
			// There is not current state
			// this is only possible if this is the first
			// state we're loading
			this._isTransitioning = true;
			this._transition.visible = true;
			sm = this;
			this._loopTransition();
			sm.trigger(StateManager.TRANSITION_INIT_DONE);
			sm._isLoading = true;
			sm._state._internalEnter(sm._onStateLoaded.bind(sm));
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
				sm = this;
				
				if(this.has(StateEvent.TRANSITION_OUT))
					this.trigger(StateEvent.TRANSITION_OUT, new StateEvent(StateEvent.TRANSITION_OUT, this._state, this._oldState));
				this._oldState.transitionOut(
					function()
					{
						if(sm.has(StateEvent.TRANSITION_OUT_DONE))
							sm.trigger(StateEvent.TRANSITION_OUT_DONE, new StateEvent(StateEvent.TRANSITION_OUT_DONE, sm._state, sm._oldState));
						sm.trigger(StateManager.TRANSITION_OUT);
						
						sm._transitioning(
							StateManager.TRANSITION_OUT,
							function()
							{
								sm.trigger(StateManager.TRANSITION_OUT_DONE);
								
								sm._isTransitioning = false;
								
								if(sm.has(StateEvent.HIDDEN))
									sm.trigger(StateEvent.HIDDEN, new StateEvent(StateEvent.HIDDEN, sm._state, sm._oldState));
								sm._oldState.panel.visible = false;
								sm._oldState._internalExit();
								sm._oldState = null;

								sm._loopTransition();//play the transition loop animation
								
								if (!sm._processQueue())
								{
									sm._isLoading = true;
									sm._state._internalEnter(sm._onStateLoaded.bind(sm));
								}	
							}
						);
					}
				);
			}
		}
	};
	
	/**
	*   When the state has completed it's loading sequence
	*   this should be treated as an asyncronous process
	*   
	*   @function _onStateLoaded
	*   @private
	*/
	p._onStateLoaded = function()
	{
		this._isLoading = false;
		this._isTransitioning = true;
		
		if(this.has(StateEvent.VISIBLE))
			this.trigger(StateEvent.VISIBLE, new StateEvent(StateEvent.VISIBLE, this._state));
		this._state.panel.visible = true;
		
		this.trigger(StateManager.TRANSITION_IN);
		var sm = this;
		this._transitioning(
			StateManager.TRANSITION_IN,
			function()
			{
				sm._transition.visible = false;
				sm.trigger(StateManager.TRANSITION_IN_DONE);
				if(sm.has(StateEvent.TRANSITION_IN))
					sm.trigger(StateEvent.TRANSITION_IN, new StateEvent(StateEvent.TRANSITION_IN, sm._state));
				sm._state.transitionIn(
					function()
					{
						if(sm.has(StateEvent.TRANSITION_IN_DONE))
							sm.trigger(StateEvent.TRANSITION_IN_DONE, new StateEvent(StateEvent.TRANSITION_IN_DONE, sm._state));
						sm._isTransitioning = false;
						sm.hideBlocker();
						
						if (!sm._processQueue())
						{
							sm._state._internalEnterDone();
						}
					}
				);
			}
		);
	};
	
	/**
	*  Process the state queue
	*  
	*  @function _processQueue
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
	*  @function _loopTransition
	*  @private
	*/
	p._loopTransition = function()
	{
		var audio;
		if(this._transitionSounds)
		{
			audio = this._transitionSounds.loop;
			if(Sound.instance.soundLoaded === false)//if soundLoaded is defined and false, then the AudioSprite is not yet loaded
				audio = null;
		}
		if(this._display.Animator.instanceHasAnimation(this._transition, "transitionLoop"))
			this._display.Animator.play(this._transition, "transitionLoop", {onComplete: this._loopTransition, soundData:audio});
	};
	
	/**
	 * Displays the transition out animation, without changing states.
	 * 
	 * @function showTransitionOut
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionOut = function(callback)
	{
		this.showBlocker();
		var sm = this;
		var func = function()
		{
			sm._loopTransition();

			if(callback)
				callback();
		};
		this._transitioning(StateManager.TRANSITION_OUT, func);
	};

	/**
	 * Displays the transition in animation, without changing states.
	 * 
	 * @function showTransitionIn
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionIn = function(callback)
	{
		var sm = this;
		this._transitioning(StateManager.TRANSITION_IN, function() { sm.hideBlocker(); if(callback) callback(); });
	};
	
	/**
	*   Generalized function for transitioning with the manager
	*   
	*   @function _transitioning
	*   @param {String} The animator event to play
	*   @param {Function} The callback function after transition is done
	*   @private
	*/
	p._transitioning = function(event, callback)
	{
		var clip = this._transition;
		clip.visible = true;
		var audio;
		if(this._transitionSounds)
		{
			audio = event == StateManager.TRANSITION_IN ? this._transitionSounds.in : this._transitionSounds.out;
			if(Sound.instance.soundLoaded === false)//if soundLoaded is defined and false, then the AudioSprite is not yet loaded
				audio = null;
		}
		this._display.Animator.play(this._transition, event, {onComplete: callback, soundData: audio});
	};
	
	/**
	*   Remove the state manager
	*   
	*   @function destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;

		this.off();
		
		this._display.Animator.stop(this._transition);
		
		this._transition = null;
		
		this._state = null;
		this._oldState = null;
		
		if (this._states)
		{
			for(var id in this._states)
			{
				this._states[id].destroy();
				delete this._states[id];
			}
		}
		this._states = null;
	};
	
	// Add to the name space
	namespace('cloudkid').StateManager = StateManager;
})();}();