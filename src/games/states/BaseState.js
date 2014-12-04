/**
*  @module States
*  @namespace springroll
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
	*  @param {string|function} [nextState=null] The next state alias
	*  @param {string|function} [prevState=null] The previous state alias
	*/
	var BaseState = function(panel, nextState, prevState)
	{
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
		* Save the panel
		* 
		* @property {createjs.Container|PIXI.DisplayObjectContainer} panel
		*/
		this.panel = panel;
		
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

		/**
		*  Either the alias of the next state or a function
		*  to call when going to the next state.
		*
		*  @property {string|function} nextState
		*  @protected
		*/
		this.nextState = nextState || null;
		
		/**
		*  Either the alias of the previous state or a function
		*  to call when going to the previous state.
		*
		*  @property {string|function} prevState
		*  @protected
		*/
		this.prevState = prevState || null;
	};
	
	var p = BaseState.prototype;
	
	/**
	*  Status of whether the panel load was canceled
	*  
	*  @method  getCanceled
	*  @return {bool} If the load was canceled
	*/
	p.getCanceled = function()
	{
		return this._canceled;
	};
	
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
	*  When the state is exited
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
	*   When the state has requested to be exit, pre-transition
	*   @method exitStart
	*/
	p.exitStart = function(){};
	
	/**
	*   Exit the state start, called by the State Manager
	*   
	*   @method _internalEnter
	*   @param {functon} proceed The function to call after enter has been called
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
	*   @method loadingDone
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
	*   Cancel the load, implementation-specific
	*   this is where any async actions are removed
	*   
	*   @method cancel
	*/
	p.cancel = function(){};
	
	/**
	*   When the state is entered
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
		
		this.setEnabled(true);
		this.enterDone();
	};
	
	/**
	*   When the state is visually entered fully
	*   that is, after the transition is done
	*   
	*   @method enterDone
	*/
	p.enterDone = function(){};
	
	/**
	*   Get if this is the active state
	*   
	*   @method getActive
	*   @return {bool} If this is the active state
	*/
	p.getActive = function()
	{
		return this._active;
	};
	
	/**
	*   Transition the panel in
	*   
	*   @method transitionIn
	*   @param {function} callback
	*/
	p.transitionIn = function(callback)
	{
		this._isTransitioning = true;
		
		var s = this;
		
		this.manager._display.animator.play(
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
	*   @method transitionOut
	*   @param {function} callback
	*/
	p.transitionOut = function(callback)
	{
		this._enabled = false;
		this._isTransitioning = true;
		
		var s = this;
		
		this.manager._display.animator.play(
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
	*   @method  getDestroyed
	*   @return {bool} If this has been destroyed
	*/
	p.getDestroyed = function()
	{
		return this._destroyed;
	};
	
	/**
	*   Enable this panel, true is only non-loading and non-transitioning state
	*   
	*   @method setEnabled
	*   @param {bool} enabled The enabled state
	*/
	p.setEnabled = function(enabled)
	{
		this._enabled = enabled;
	};
	
	/**
	*   Get the enabled status
	*   
	*   @method getEnabled
	*   @return {bool} If this state is enabled
	*/
	p.getEnabled = function()
	{
		return this._enabled;
	};
	
	/**
	*   Don't use the state object after this
	*   
	*   @method destroy
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
	namespace('springroll').BaseState = BaseState;
	
}());