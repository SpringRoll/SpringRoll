/**
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
		* Save the panel
		* 
		* @property {createjs.Container|PIXI.DisplayObjectContainer} panel
		*/
		this.panel = null;
		
		/**
		* Check to see if we've been destroyed 
		* 
		* @property {bool} _destroyed
		* @private
		*/
		this._destroyed = false;
		
		/**
		* If the manager considers this the active panel
		* 
		* @property {bool} _active
		* @private
		*/
		this._active = false;
		
		/**
		* If we are pre-loading the state
		* 
		* @property {bool} _isLoading
		* @private
		*/
		this._isLoading = false;
		
		/**
		* If we canceled entering the state
		* 
		* @property {bool} _canceled
		* @private
		*/
		this._canceled = false;
		
		/**
		* When we're finishing loading
		* 
		* @property {function} _onEnterProceed
		* @private
		*/
		this._onEnterProceed = null;
		
		/** If we start doing a load in enter, assign the onEnterComplete here
		* 
		* @property {function} _onLoadingComplete
		* @private
		*/
		this._onLoadingComplete = null;
		
		/** If the state is enabled that means it click ready
		* 
		* @property {bool} _enabled
		* @private
		*/
		this._enabled = false;

		/**
		* If we are currently transitioning
		* 
		* @property {bool} isTransitioning
		* @private
		*/
		this._isTransitioning = false;
		
		this.initialize(panel);
	};
	
	var p = BaseState.prototype;
	
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