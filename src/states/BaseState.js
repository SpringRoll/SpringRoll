/**
*  @module cloudkid
*/
(function(){
	
	"use strict";

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
		StateManager = cloudkid.StateManager;
		this.initialize(panel);
	};
	
	var p = BaseState.prototype;
	
	/**
	* Adds the specified event listener
	* @function addEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener An object with a handleEvent method, or a function that will be called when the event is dispatched
	* @return {function|object} Returns the listener for chaining or assignment
	*/
	p.addEventListener = null;

	/**
	* Removes the specified event listener
	* @function removeEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener The listener function or object
	*/
	p.removeEventListener = null;

	/**
	* Removes all listeners for the specified type, or all listeners of all types
	* @function removeAllEventListeners
	* @param {String} type The string type of the event. If omitted, all listeners for all types will be removed.
	*/
	p.removeAllEventListeners = null;

	/**
	* Dispatches the specified event
	* @function dispatchEvent
	* @param {Object|String} enventObj An object with a "type" property, or a string type
	* @param {object} target The object to use as the target property of the event object
	* @return {bool} Returns true if any listener returned true
	*/
	p.dispatchEvent = null;

	/**
	* Indicates whether there is at least one listener for the specified event type
	* @function hasEventListener
	* @param {String} type The string type of the event
	* @return {bool} Returns true if there is at least one listener for the specified event
	*/
	p.hasEventListener = null;

	/**
	* Createjs EventDispatcher method
	* @property {Array} _listeners description
	* @private
	*/
	p._listeners = null;
	
	// we only use EventDispatcher if it's available:
	if (createjs.EventDispatcher) createjs.EventDispatcher.initialize(p); // inject EventDispatcher methods.
	
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
	* @property {createjs.MovieClip|PIXI.DisplayObjectContainer} panel
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
	* @property {function} _onEnterStateProceed
	* @private
	*/
	p._onEnterStateProceed = null;
	
	/** If we start doing a load in enterState, assign the onEnterStateComplete here
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
	*   @function _internalExitState
	*   @private
	*/
	p._internalExitState = function()
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.Animator.stop(this.panel);
		}
		this._enabled = false;
		this.panel.visible = false;
		this._active = false;
		this.exitState();
	};
	
	/**
	*  When the state is exited
	*  
	*  @function exitState
	*/
	p.exitState = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalExitStateStart
	*   @private
	*/
	p._internalExitStateStart = function()
	{
		this.exitStateStart();
	};
	
	/**
	*   When the state has requested to be exit, pre-transition
	*   
	*   @function exitStateStart
	*/
	p.exitStateStart = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalEnterState
	*   @param {functon} proceed The function to call after enterState has been called
	*   @private
	*/
	p._internalEnterState = function(proceed)
	{
		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			
			this.manager._display.Animator.stop(this.panel);
		}
		this._enabled = false;
		this._active = true;
		this._canceled = false;
		
		this._onEnterStateProceed = proceed;
		
		this.enterState();
		
		if (this._onEnterStateProceed)
		{
			this._onEnterStateProceed();
			this._onEnterStateProceed = null;
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
		// need to be called from the enterState function
		// We'll override the existing behavior
		// of internalEnterState, by passing
		// the complete function to onLoadingComplete
		this._onLoadingComplete = this._onEnterStateProceed;
		this._onEnterStateProceed = null;
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
		
		this._internalExitState();
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
	*   @function enterState
	*/
	p.enterState = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @function _internalEnterStateDone
	*   @private
	*/
	p._internalEnterStateDone = function()
	{
		if (this._canceled) return;
		
		this.setEnabled(true);
		this.enterStateDone();
	};
	
	/**
	*   When the state is visually entered fully
	*   that is, after the transition is done
	*   
	*   @function enterStateDone
	*/
	p.enterStateDone = function(){};
	
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
		this.exitState();
		
		this.panel = null;
		this.manager = null;
		this._destroyed = true;
		this._onEnterStateProceed = null;
		this._onLoadingComplete = null;
	};
	
	// Add to the name space
	namespace('cloudkid').BaseState = BaseState;
}());