/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Imports
	var Debug,
		StateManager,
		DelayedCall;
	
	/**
	 * Defines the base functionality for a state used by the state manager
	 *
	 * @class State
	 * @constructor
	 * @param {createjs.Container|PIXI.DisplayObjectContainer} panel The panel to associate with
	 *  	this state.
	 * @param {Object} [options] The list of options
	 * @param {String|Function} [options.next=null] The next state alias or function to call when going to the next state.
	 * @param {String|Function} [options.previous=null] The previous state alias to call when going to the previous state.
	 * @param {int} [options.delayLoad=0] The number of frames to delay the loading for cases where
	 *    heavy object instaniation slow the game dramatically.
	 */
	var State = function(panel, options)
	{
		if(!StateManager)
		{
			StateManager = include('springroll.StateManager');
			DelayedCall = include('springroll.DelayedCall');
			Debug = include('springroll.Debug', false);
		}

		if (DEBUG && Debug && !panel)
		{
			Debug.error("State requires a panel display object as the first constructor argument");
		}

		// Construct the options
		options = Object.merge({
			next: null,
			previous: null,
			delayLoad: 0
		}, options || {});

		/**
		 * The id reference
		 * @property {String} stateId
		 */
		this.stateId = null;
		
		/**
		 * A reference to the state manager
		 * @property {StateManager} manager
		 */
		this.manager = null;
		
		/**
		 * The panel for the state.
		 * @property {createjs.Container|PIXI.DisplayObjectContainer} panel
		 */
		this.panel = panel;
		
		/**
		 * If the state has been destroyed.
		 * @property {Boolean} _destroyed
		 * @private
		 */
		this._destroyed = false;
		
		/**
		 * If the manager considers this the active panel
		 * @property {Boolean} _active
		 * @private
		 */
		this._active = false;
		
		/**
		 * If we are pre-loading the state
		 * @property {Boolean} _isLoading
		 * @private
		 */
		this._isLoading = false;
		
		/**
		 * If we canceled entering the state
		 * @property {Boolean} _canceled
		 * @private
		 */
		this._canceled = false;
		
		/**
		 * When we're finishing loading
		 * @property {Function} _onEnterProceed
		 * @private
		 */
		this._onEnterProceed = null;
		
		/**
		 * If we start doing a load in enter, assign the onEnterComplete here
		 * @property {Function} _onLoadingComplete
		 * @private
		 */
		this._onLoadingComplete = null;
		
		/**
		 * If the state is enabled, meaning that it is click ready
		 * @property {Boolean} _enabled
		 * @private
		 */
		this._enabled = false;

		/**
		 * Either the alias of the next state or a function
		 * to call when going to the next state.
		 * @property {String|Function} _nextState
		 * @private
		 */
		this._nextState = options.next;
		
		/**
		 * Either the alias of the previous state or a function
		 * to call when going to the previous state.
		 * @property {String|Function} _prevState
		 * @private
		 */
		this._prevState = options.previous;

		/**
		 * The number of frames to delay the transition in after loading, to allow the framerate
		 * to stablize after heavy art instantiation.
		 * @property {int} delayLoad
		 * @protected
		 */
		this.delayLoad = options.delayLoad;

		// Hide the panel by default
		this.panel.visible = false;
	};
	
	var p = State.prototype;
	
	/**
	 * When the state is exited. Override this to provide state cleanup.
	 * @method exit
	 */
	p.exit = function()
	{
		// Implementation specific
	};
	
	/**
	 * When the state has requested to be exit, pre-transition. Override this to ensure
	 * that animation/audio is stopped when leaving the state.
	 * @method exitStart
	 */
	p.exitStart = function()
	{
		// Implementation specific
	};

	/**
	 * Cancel the load, implementation-specific.
	 * This is where any async actions should be removed.
	 * @method cancel
	 */
	p.cancel = function()
	{
		// Implementation specific
	};
	
	/**
	 * When the state is entered. Override this to start loading assets - call loadingStart()
	 * to tell the StateManager that that is going on.
	 * @method enter
	 */
	p.enter = function()
	{
		// Implementation specific
	};
	
	/**
	 * When the state is visually entered fully - after the transition is done.
	 * Override this to begin your state's activities.
	 * @method enterDone
	 */
	p.enterDone = function()
	{
		// Implementation specific
	};

	/**
	 * Goto the next state
	 * @method nextState
	 * @final
	 */
	p.nextState = function()
	{
		var type = typeof this._nextState;

		if (!this._nextState)
		{
			if (DEBUG && Debug)
			{
				Debug.info("'next' is undefined in current state, ignoring");
			}
			return;
		}
		else if (type === "function")
		{
			this._nextState();
		}
		else if (type === "string")
		{
			this.manager.state = this._nextState;
		}
	};

	/**
	 * Goto the previous state
	 * @method previousState
	 * @final
	 */
	p.previousState = function()
	{
		var type = typeof this._prevState;

		if (!this._prevState)
		{
			if (DEBUG && Debug)
			{
				Debug.info("'prevState' is undefined in current state, ignoring");
			}
			return;
		}
		else if (type === "function")
		{
			this._prevState();
		}
		else if (type === "string")
		{
			this.manager.state = this._prevState;
		}
	};

	/**
	 * Manual call to signal the start of preloading
	 * @method loadingStart
	 * @final
	 */
	p.loadingStart = function()
	{
		if (this._isLoading)
		{
			if (DEBUG && Debug) Debug.warn("loadingStart() was called while we're already loading");
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
	 * Manual call to signal the end of preloading
	 * @method loadingDone
	 * @final
	 * @param {int} [delay] Frames to delay the load completion to allow the framerate to
	 *     stabilize. If not delay is set, defaults to the `delayLoad` property.
	 */
	p.loadingDone = function(delay)
	{
		if (delay === undefined)
		{
			delay = this.delayLoad;
		}

		if (!this._isLoading)
		{
			if (DEBUG && Debug) Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
			return;
		}
		
		if(delay && typeof delay == "number")
		{
			new DelayedCall(this.loadingDone.bind(this, 0), delay, {useFrames: true});
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
	 * Status of whether the panel load was canceled
	 * @property {Boolean} canceled
	 * @readOnly
	 */
	Object.defineProperty(p, 'canceled',
	{
		get: function()
		{
			return this._canceled;
		}
	});

	/**
	 * Get if this is the active state
	 * @property {Boolean} active
	 * @readOnly
	 */
	Object.defineProperty(p, 'active',
	{
		get: function()
		{
			return this._active;
		}
	});
	
	/**
	 * If the state is enabled, meaning that it is click ready
	 * @property {Boolean} enabled
	 */
	Object.defineProperty(p, 'enabled',
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			this._enabled = value;
		}
	});
	
	/**
	 * If the state has been destroyed.
	 * @property {Boolean} destroyed
	 * @readOnly
	 */
	Object.defineProperty(p, 'destroyed',
	{
		get: function()
		{
			return this._destroyed;
		}
	});

	/**
	 * This is called by the State Manager to exit the state
	 * @method _internalExit
	 * @protected
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
	 * When the state is entering
	 * @method _internalEntering
	 * @param {Function} proceed The function to call after enter has been called
	 * @protected
	 */
	p._internalEntering = function()
	{
		this.enter();
	};
	
	/**
	 * Exit the state start, called by the State Manager
	 * @method _internalExitStart
	 * @protected
	 */
	p._internalExitStart = function()
	{
		this.exitStart();
	};
	
	/**
	 * Exit the state start, called by the State Manager
	 * @method _internalEnter
	 * @param {Function} proceed The function to call after enter has been called
	 * @protected
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
		
		this._internalEntering();
		
		if (this._onEnterProceed)
		{
			this._onEnterProceed();
			this._onEnterProceed = null;
		}
	};
	
	/**
	 * Cancel the loading of this state
	 * @method _internalCancel
	 * @protected
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
	 * Exit the state start, called by the State Manager
	 * @method _internalEnterDone
	 * @private
	 */
	p._internalEnterDone = function()
	{
		if (this._canceled) return;
		
		this.enabled = true;
		this.enterDone();
	};
	
	/**
	 * Don't use the state object after this
	 * @method destroy
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
	namespace('springroll').State = State;
	namespace('springroll').BaseState = State;

}());