/*! SpringRoll 1.0.3 */
/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Imports
	var Debug,
		Application,
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Defines the base functionality for a state used by the state manager
	 *
	 * @class State
	 * @constructor
	 * @param {createjs.Container|PIXI.DisplayObjectContainer} panel The panel to associate with
	 * 	this state.
	 * @param {Object} [options] The list of options
	 * @param {String|Function} [options.next=null] The next state alias or function to call when going to the next state.
	 * @param {String|Function} [options.previous=null] The previous state alias to call when going to the previous state.
	 * @param {int} [options.delayLoad=0] The number of frames to delay the loading for cases where
	 *  heavy object instaniation slow the game dramatically.
	 * @param {Array} [options.preload=[]] The assets to preload before the state loads
	 * @param {Object|String} [options.scaling=null] The scaling items to use with the ScaleManager.
	 *       If options.scaling is `"panel"` then the entire panel will be scaled as a title-safe
	 *       item. See `ScaleManager.addItems` for more information about the
	 *       format of the scaling objects. (UI Module only)
	 */
	var State = function(panel, options)
	{
		EventDispatcher.call(this);

		if (!Application)
		{
			Application = include('springroll.Application');
			Debug = include('springroll.Debug', false);
		}

		if (true && Debug && !panel)
		{
			Debug.error("State requires a panel display object as the first constructor argument");
		}

		// Construct the options
		options = Object.merge(
		{
			next: null,
			previous: null,
			delayLoad: 0,
			preload: [],
			scaling: null
		}, options ||
		{});

		/**
		 * Reference to the main app
		 * @property {Application} app
		 * @readOnly
		 */
		var app = this.app = Application.instance;

		/**
		 * The instance of the VOPlayer, Sound module required
		 * @property {springroll.VOPlayer} voPlayer
		 * @readOnly
		 */
		this.voPlayer = app.voPlayer || null;

		/**
		 * The instance of the Sound, Sound module required
		 * @property {springroll.Sound} sound
		 * @readOnly
		 */
		this.sound = app.sound || null;

		/**
		 * Reference to the main config object
		 * @property {Object} config
		 * @readOnly
		 */
		this.config = app.config || null;

		/**
		 * Reference to the scaling object, UI module required
		 * @property {springroll.ScaleManager} scaling
		 * @readOnly
		 */
		this.scaling = app.scaling || null;

		/**
		 * The items to scale on the panel, see `ScaleManager.addItems` for
		 * more information. If no options are set in the State's constructor
		 * then it will try to find an object on the app config on `scaling` property
		 * matching the same state alias. For instance `config.scaling.title` if
		 * `title` is the state alias. If no scalingItems are set, will scale
		 * and position the panal itself.
		 * @property {Object} scalingItems
		 * @readOnly
		 * @default null
		 */
		this.scalingItems = options.scaling || null;

		/**
		 * The id reference
		 * @property {String} stateId
		 */
		this.stateId = null;

		/**
		 * A reference to the state manager
		 * @property {springroll.StateManager} manager
		 */
		this.manager = null;

		/**
		 * The panel for the state.
		 * @property {createjs.Container|PIXI.DisplayObjectContainer} panel
		 */
		this.panel = panel;

		/**
		 * The assets to load each time
		 * @property {Array} preload
		 */
		this.preload = options.preload;

		/**
		 * Check to see if the assets have finished loading
		 * @property {Boolean} preloaded
		 * @protected
		 * @readOnly
		 */
		this.preloaded = false;

		/**
		 * The collection of assets loaded
		 * @property {Array|Object} assets
		 * @protected
		 */
		this.assets = null;

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

	// Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(State);

	/**
	 * Event when the state finishes exiting. Nothing is showing at this point.
	 * @event exit
	 */

	/**
	 * Event when the state is being destroyed.
	 * @event destroy
	 */

	/**
	 * Event when the transition is finished the state is fully entered.
	 * @event enterDone
	 */

	/**
	 * Event when the loading of a state was canceled.
	 * @event cancel
	 */

	/**
	 * Event when the state starts exiting, everything is showing at this point.
	 * @event exitStart
	 */

	/**
	 * Event when the preload of assets is finished. If no assets are loaded, the `assets` parameter is null.
	 * @event loaded
	 * @param {Object|Array|null} asset The collection of assets loaded
	 */

	/**
	 * When there has been a change in how much has been preloaded
	 * @event progress
	 * @param {Number} percentage The amount preloaded from zero to 1
	 */

	/**
	 * Event when the assets are starting to load.
	 * @event loading
	 * @param {Array} asset An empty array that additional assets can be added to, if needed. Any dynamic
	 *                      assets that are added need to be manually unloaded when the state exits.
	 */

	/**
	 * Event when the state is enabled status changes. Enable is when the state is mouse enabled or not.
	 * @event enabled
	 * @param {Boolean} enable The enabled status of the state
	 */

	// create empty function to avoid a lot of if checks
	var empty = function() {};

	/**
	 * When the state is exited. Override this to provide state cleanup.
	 * @property {function} exit
	 * @default null
	 */
	p.exit = empty;

	/**
	 * When the state has requested to be exit, pre-transition. Override this to ensure
	 * that animation/audio is stopped when leaving the state.
	 * @property {function} exitStart
	 * @default null
	 */
	p.exitStart = empty;

	/**
	 * Cancel the load, implementation-specific.
	 * This is where any async actions should be removed.
	 * @property {function} cancel
	 * @default null
	 */
	p.cancel = empty;

	/**
	 * When the state is entered. Override this to start loading assets - call loadingStart()
	 * to tell the StateManager that that is going on.
	 * @property {function} enter
	 * @default null
	 */
	p.enter = empty;

	/**
	 * When the state is visually entered fully - after the transition is done.
	 * Override this to begin your state's activities.
	 * @property {function} enterDone
	 * @default null
	 */
	p.enterDone = empty;

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
			if (true && Debug)
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
			if (true && Debug)
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
	 * Manual call to signal the end of preloading
	 * @method loadingDone
	 * @final
	 * @param {int} [delay] Frames to delay the load completion to allow the framerate to
	 *   stabilize. If not delay is set, defaults to the `delayLoad` property.
	 */
	p.loadingDone = function(delay)
	{
		if (delay === undefined)
		{
			delay = this.delayLoad;
		}

		if (!this._isLoading)
		{
			if (true && Debug) Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
			return;
		}

		if (delay && typeof delay == "number")
		{
			//allow the renderer to figure out that any images on stage need decoding during the
			//delay, not during the transition in
			this.panel.visible = true;
			this.app.setTimeout(this.loadingDone.bind(this, 0), delay, true);
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
			var oldEnabled = this._enabled;
			this._enabled = value;
			if (oldEnabled != value)
			{
				this.trigger('enabled', value);
			}
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
		this.preloaded = false;

		// local variables
		var panel = this.panel;
		var items = this.scalingItems;
		var scaling = this.scaling;

		//remove scaling objects that we added
		if (scaling && items)
		{
			if (items == "panel")
			{
				scaling.removeItem(panel);
			}
			else
			{
				scaling.removeItems(panel, items);
			}
		}

		// Clean any assets loaded by the manifest
		if (this.preload.length)
		{
			this.app.unload(this.preload);
		}

		if (this._isTransitioning)
		{
			this._isTransitioning = false;
			if (this.manager.animator)
			{
				this.manager.animator.stop(panel);
			}
		}
		this._enabled = false;
		panel.visible = false;
		this._active = false;
		this.exit();

		this.trigger('exit');
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

		this.trigger('enter');

		// Start prealoading assets
		this.loadingStart();

		// Boolean to see if we've preloaded assests
		this.preloaded = false;

		var assets = [];

		this.trigger('loading', assets);

		if (this.preload.length)
		{
			assets = this.preload.concat(assets);
		}

		// Start loading assets if we have some
		if (assets.length)
		{
			this.app.load(assets,
			{
				complete: this._onLoaded.bind(this),
				progress: onProgress.bind(this),
				cacheAll: true
			});
		}
		// No files to load, just continue
		else
		{
			this._onLoaded(null);
		}
	};

	/**
	 * Handle the load progress and pass to the manager
	 * @method onProgress
	 * @private
	 * @param {Number} progress The amount preloaded from zero to 1
	 */
	var onProgress = function(progress)
	{
		this.trigger('progress', progress);
		this.manager.trigger('progress', progress);
	};

	/**
	 * The internal call for on assets loaded
	 * @method _onLoaded
	 * @private
	 * @param {Object|null} assets The assets result of the load
	 */
	p._onLoaded = function(assets)
	{
		this.assets = assets;
		this.preloaded = true;

		this.trigger('loaded', assets);

		if (this.scaling)
		{
			var items = this.scalingItems;

			if (items)
			{
				if (items == "panel")
				{
					// Reset the panel scale & position, to ensure
					// that the panel is scaled properly
					// upon state re-entry
					this.panel.x = this.panel.y = 0;
					this.panel.scaleX = this.panel.scaleY = 1;

					this.scaling.addItem(this.panel,
					{
						align: "top-left",
						titleSafe: true
					});
				}
				else
				{
					this.scaling.addItems(this.panel, items);
				}
			}
		}
		this.loadingDone();
	};

	/**
	 * Exit the state start, called by the State Manager
	 * @method _internalExitStart
	 * @protected
	 */
	p._internalExitStart = function()
	{
		this.exitStart();
		this.trigger('exitStart');
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
			if (this.manager.animator)
			{
				this.manager.animator.stop(this.panel);
			}
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
		this.trigger('cancel');
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
		this.trigger('enterDone');
	};

	/**
	 * Don't use the state object after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		// Only destroy once!
		if (this._destroyed) return;

		this.trigger('destroy');

		this.app = null;
		this.scaling = null;
		this.sound = null;
		this.voPlayer = null;
		this.config = null;
		this.scalingItems = null;
		this.assets = null;
		this.preload = null;
		this.panel = null;
		this.manager = null;
		this._destroyed = true;
		this._onEnterProceed = null;
		this._onLoadingComplete = null;

		s.destroy.call(this);
	};

	// Add to the namespace
	namespace('springroll').State = State;

}());
/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{

	/**
	 * A state-related event used by the State Manager
	 *
	 * @class StateEvent
	 * @constructor
	 * @param {String} type The type of event.
	 * @param {BaseState} currentState The currentState of the state manager
	 * @param {BaseState} visibleState The current state being transitioned or changing visibility,
	 *                               default to currentState
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

	var p = extend(StateEvent);

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
(function(undefined)
{

	// Imports
	var Debug = include('springroll.Debug', false),
		EventDispatcher = include('springroll.EventDispatcher'),
		State = include('springroll.State'),
		StateEvent = include('springroll.StateEvent');

	/**
	 * The State Manager used for managing the different states of a game or site
	 *
	 * @class StateManager
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {Object} [transitionSounds] Data object with aliases and start times (seconds) for
	 *     transition in, loop and out sounds. Example: `{in:{alias:"myAlias", start:0.2}}`.
	 *     These objects are in the format for Animator from EaselJSDisplay or PixiDisplay,
	 *     so they can be just the sound alias instead of an object.
	 * @param {Object|String} [transitionSounds.in] The sound to play for transition in
	 * @param {Object|String} [transitionSounds.out] The sound to play for transition out
	 * @param {Object|String} [transitionSounds.loading] The sound to play for loading
	 */
	var StateManager = function(transitionSounds)
	{
		EventDispatcher.call(this);

		/**
		 * The animator playback.
		 *
		 * @property {springroll.Animator} animator
		 * @private
		 */
		this.animator = null;

		/**
		 * The click to play in between transitioning states
		 *
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} transition
		 */
		this.transition = null;

		/**
		 * Wait to fire the onTransitionIn event until the onTransitionLoading
		 * loop reaches it’s final frame.
		 * @property {boolean} waitForLoadingComplete
		 */
		this.waitForLoadingComplete = false;

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
		 * @property {springroll.State} _state
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
		 * @property {springroll.State} _oldState
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

		// Hide the blocker
		this.enabled = true;

		// Binding
		this._onTransitionLoading = this._onTransitionLoading.bind(this);
		this._onTransitionOut = this._onTransitionOut.bind(this);
		this._onStateLoaded = this._onStateLoaded.bind(this);
		this._onTransitionIn = this._onTransitionIn.bind(this);
	};

	var p = EventDispatcher.extend(StateManager);

	/**
	 * The amount of progress while state is being preloaded from zero to 1
	 * @event progress
	 * @param {Number} percentage The amount loaded
	 */

	/**
	 * The name of the Animator label and event for transitioning into a state.
	 *
	 * @event onTransitionIn
	 */
	var TRANSITION_IN = StateManager.TRANSITION_IN = "onTransitionIn";

	/**
	 * The name of the Animator label and event for loading between state change.
	 * this event is only dispatched if there is a loading sequence to show in the
	 * transition. Recommended to use 'loadingStart' instead for checking.
	 *
	 * @event onTransitionLoading
	 */
	var TRANSITION_LOADING = StateManager.TRANSITION_LOADING = "onTransitionLoading";

	/**
	 * The name of the event for completing transitioning into a state.
	 *
	 * @event onTransitionInDone
	 */
	var TRANSITION_IN_DONE = StateManager.TRANSITION_IN_DONE = "onTransitionInDone";

	/**
	 * The name of the Animator label and event for transitioning out of a state.
	 *
	 * @event onTransitionOut
	 */
	var TRANSITION_OUT = StateManager.TRANSITION_OUT = "onTransitionOut";

	/**
	 * The name of the event for completing transitioning out of a state.
	 *
	 * @event onTransitionOutDone
	 */
	var TRANSITION_OUT_DONE = StateManager.TRANSITION_OUT_DONE = "onTransitionOutDone";

	/**
	 * The name of the event for initialization complete - the first state is then being entered.
	 *
	 * @event onInitDone
	 */
	var TRANSITION_INIT_DONE = StateManager.TRANSITION_INIT_DONE = "onInitDone";

	/**
	 * Event when the state begins loading assets when it is entered.
	 *
	 * @event onLoadingStart
	 */
	var LOADING_START = StateManager.LOADING_START = "onLoadingStart";

	/**
	 * Event when the state finishes loading assets when it is entered.
	 *
	 * @event onLoadingDone
	 */
	var LOADING_DONE = StateManager.LOADING_DONE = "onLoadingDone";

	/**
	 * Register a state with the state manager, done initially
	 *
	 * @method addState
	 * @param {String} id The string alias for a state
	 * @param {springroll.State} state State object reference
	 */
	p.addState = function(id, state)
	{
		if (true && Debug)
		{
			Debug.assert(state instanceof State, "State (" + id + ") needs to subclass springroll.State");
		}

		// Add to the collection of states
		this._states[id] = state;

		// Give the state a reference to the id
		state.stateId = id;

		// Give the state a reference to the manager
		state.manager = this;
	};

	/**
	 * Get the current selected state (state object)
	 * @property {springroll.State} currentState
	 * @readOnly
	 */
	Object.defineProperty(p, 'currentState',
	{
		get: function()
		{
			return this._state;
		}
	});

	/**
	 * Access a certain state by the ID
	 *
	 * @method getStateById
	 * @param {String} id State alias
	 * @return {springroll.State} The base State object
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
	 * If the state needs to do some asyncronous tasks,
	 * The state can tell the manager to stop the animation
	 *
	 * @method loadingStart
	 */
	p.loadingStart = function()
	{
		if (this._destroyed) return;

		this.trigger(LOADING_START);

		this._onTransitionLoading();
	};

	/**
	 * If the state has finished it's asyncronous task loading
	 * Lets enter the state
	 *
	 * @method loadingDone
	 */
	p.loadingDone = function()
	{
		if (this._destroyed) return;

		this.trigger(LOADING_DONE);
	};

	/**
	 * Internal setter for the enabled status
	 * @private
	 * @property {Boolean} enabled
	 */
	Object.defineProperty(p, 'enabled',
	{
		set: function(enabled)
		{
			/**
			 * If the state manager is enabled, used internally
			 * @event enabled
			 * @param {Boolean} enabled
			 */
			this.trigger('enabled', enabled);
		}
	});

	/**
	 * This transitions out of the current state and
	 * enters it again. Can be useful for clearing a state
	 *
	 * @method refresh
	 */
	p.refresh = function()
	{
		if (true && Debug) Debug.assert(!!this._state, "No current state to refresh!");
		this.state = this._stateId;
	};

	/**
	 * Get or change the current state, using the state id.
	 * @property {String} state
	 */
	Object.defineProperty(p, "state",
	{
		set: function(id)
		{
			if (true && Debug) Debug.assert(this._states[id] !== undefined, "No current state mattching id '" + id + "'");

			// If we try to transition while the transition or state
			// is transition, then we queue the state and proceed
			// after an animation has played out, to avoid abrupt changes
			if (this._isTransitioning)
			{
				return;
			}

			this._stateId = id;
			this.enabled = false;
			this._oldState = this._state;
			this._state = this._states[id];

			if (!this._oldState)
			{
				// There is not current state
				// this is only possible if this is the first
				// state we're loading
				this._isTransitioning = true;
				if (this.transition)
					this.transition.visible = true;
				this._onTransitionLoading();
				this.trigger(TRANSITION_INIT_DONE);
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
					this.enabled = false;

					this.trigger(TRANSITION_OUT);

					this._transitioning(TRANSITION_OUT, this._onTransitionOut);
				}
			}
		},
		get: function()
		{
			return this._stateId;
		}
	});

	/**
	 * When the transition out of a state has finished playing during a state change.
	 * @method _onTransitionOut
	 * @private
	 */
	p._onTransitionOut = function()
	{
		this.trigger(TRANSITION_OUT_DONE);

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

		this._onTransitionLoading(); //play the transition loop animation

		this._isLoading = true;
		this._state._internalEnter(this._onStateLoaded);
	};

	/**
	 * When the state has completed its loading sequence.
	 * This should be treated as an asynchronous process.
	 *
	 * @method _onStateLoaded
	 * @private
	 */
	p._onStateLoaded = function()
	{
		this._isLoading = false;
		this._isTransitioning = true;

		if (this.has(StateEvent.VISIBLE))
			this.trigger(StateEvent.VISIBLE, new StateEvent(StateEvent.VISIBLE, this._state));
		this._state.panel.visible = true;

		if (this.waitForLoadingComplete && this.animator.hasAnimation(this.transition, TRANSITION_LOADING))
		{
			var timeline = this.animator.getTimeline(this.transition);
			timeline.onComplete = function()
			{
				this.trigger(TRANSITION_IN);
				this._transitioning(TRANSITION_IN, this._onTransitionIn);
			}.bind(this);
			timeline.isLooping = false;
		}
		else
		{
			this.trigger(TRANSITION_IN);
			this._transitioning(TRANSITION_IN, this._onTransitionIn);
		}
	};

	/**
	 * When the transition into a state has finished playing during a state change.
	 * @method _onTransitionIn
	 * @private
	 */
	p._onTransitionIn = function()
	{
		if (this.transition)
		{
			this.transition.visible = false;
		}
		this.trigger(TRANSITION_IN_DONE);
		this._isTransitioning = false;
		this.enabled = true;

		this._state._internalEnterDone();
	};

	/**
	 * Plays the animation "onTransitionLoading" on the transition. Also serves as the animation callback.
	 * Manually looping the animation allows the animation to be synced to the audio while looping.
	 *
	 * @method _onTransitionLoading
	 * @private
	 */
	p._onTransitionLoading = function()
	{
		// Ignore if no transition
		if (!this.transition) return;

		var audio;
		var sounds = this._transitionSounds;
		if (sounds)
		{
			// @deprecate the use of 'loop' sound property in favor of 'loading'
			audio = sounds.loading || sounds.loop;
		}
		var animator = this.animator;
		if (animator.hasAnimation(this.transition, TRANSITION_LOADING))
		{
			this.trigger(TRANSITION_LOADING);
			animator.play(
				this.transition,
				{
					anim: TRANSITION_LOADING,
					audio: audio
				}
			);
		}
		// @deprecate the use of 'transitionLoop' in favor of 'onTransitionLoading'
		else if (animator.hasAnimation(this.transition, 'transitionLoop'))
		{
			this.trigger(TRANSITION_LOADING);
			animator.play(
				this.transition,
				{
					anim: 'transitionLoop',
					audio: audio
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
		this.enabled = false;
		this._transitioning(TRANSITION_OUT, function()
			{
				this._onTransitionLoading();
				if (callback) callback();
			}
			.bind(this));
	};

	/**
	 * Displays the transition in animation, without changing states.
	 *
	 * @method showTransitionIn
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionIn = function(callback)
	{
		this._transitioning(TRANSITION_IN, function()
			{
				this.enabled = true;
				this.transition.visible = false;
				if (callback) callback();
			}
			.bind(this));
	};

	/**
	 * Generalized function for transitioning with the manager
	 *
	 * @method _transitioning
	 * @param {String} The animator event to play
	 * @param {Function} The callback function after transition is done
	 * @private
	 */
	p._transitioning = function(event, callback)
	{
		var transition = this.transition;
		var sounds = this._transitionSounds;

		// Ignore with no transition
		if (!transition)
		{
			return callback();
		}

		transition.visible = true;

		var audio;
		if (sounds)
		{
			audio = (event == TRANSITION_IN) ? sounds.in : sounds.out;
		}
		this.animator.play(
			transition,
			{
				anim: event,
				audio: audio
			},
			callback
		);
	};

	/**
	 * Remove the state manager
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._destroyed = true;

		this.off();

		if (this.transition)
		{
			this.animator.stop(this.transition);
		}

		if (this._state)
		{
			this._state._internalExit();
		}

		if (this._states)
		{
			for (var id in this._states)
			{
				this._states[id].destroy();
				delete this._states[id];
			}
		}

		this.transition = null;
		this._state = null;
		this._oldState = null;
		this._states = null;
	};

	// Add to the name space
	namespace('springroll').StateManager = StateManager;
})();
/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		StateManager = include('springroll.StateManager'),
		Debug = include('springroll.Debug', false);

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	plugin.setup = function()
	{
		/**
		 * Fired when an event has been added
		 * @event stateAdded
		 * @param {String} alias The state alias
		 * @param {springroll.State} state The State object
		 */

		/**
		 * The collection of states
		 * @property {Object} _states
		 * @private
		 */
		this._states = null;

		/**
		 * The state manager
		 * @property {springroll.StateManager} manager
		 */
		this.manager = null;

		/**
		 * The transition animation to use between the StateManager state changes
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} _transition
		 * @private
		 */
		this._transition = null;

		/**
		 * The transition animation to use between the StateManager state changes
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} transition
		 */
		Object.defineProperty(this, "transition",
		{
			set: function(transition)
			{
				if (!this.display)
				{
					if (true)
					{
						throw "No default display is available to set the states. Use the display application option";
					}
					else
					{
						throw "No default display";
					}
				}

				if (transition && !this.animator)
				{
					if (true)
					{
						throw "Use of a transition requires the animation module, please include";
					}
					else
					{
						throw "No animation module";
					}
				}

				// Remove the old transition
				var stage = this.display.stage;
				if (this._transition)
				{
					stage.removeChild(this._transition);
				}

				// Save the transtion reference
				this._transition = transition;

				// Add to the manager
				if (this.manager)
				{
					this.manager.transition = transition;
				}

				// Add to the stage
				if (transition)
				{
					// Stop the transition from playing
					if (transition.stop)
					{
						transition.stop();
					}
					stage.addChild(transition);
				}
			},
			get: function()
			{
				return this._transition;
			}
		});

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
		 * @default null
		 * @readOnly
		 */
		/**
		 * The transition out sound alias or sound object
		 * @property {Object} options.transitionSounds.out
		 * @default null
		 * @readOnly
		 */
		this.options.add('transitionSounds',
		{
			'in': null,
			'out': null
		}, true);

		/**
		 * The collection of states where the key is the state alias and value is the state display object
		 * @property {Object} states
		 * @default null
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

				if (!this.display)
				{
					if (true)
					{
						throw "No default display is available to set the states. Use the display application option";
					}
					else
					{
						throw "No default display";
					}
				}

				// Create the state manager
				var manager = this.manager = new StateManager(
					this.options.transitionSounds
				);

				// Pass the animator reference
				manager.animator = this.animator;

				// Add a handler to enable to disable the display
				manager.on('enabled', function(enabled)
					{
						this.display.enabled = enabled;
					}
					.bind(this));

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

				// Get the transition from either the transition manual set or the options
				var transition = this._transition || this.options.transition;

				//if the transition is a EaselJS movieclip, start it out
				//at the end of the transition out animation. If it has a
				//'transitionLoop' animation, that will be played as soon as a state is set
				if (transition)
				{
					// Add the transition this will addChild on top of all the panels
					this.transition = transition;

					// Goto the fully covered state
					if (transition.gotoAndStop)
					{
						transition.gotoAndStop("onTransitionOut_stop");
					}
				}

				// Goto the first state
				if (this.options.state)
				{
					manager.state = this.options.state;
				}
			},
			get: function()
			{
				return this._states;
			}
		});
	};

	plugin.teardown = function()
	{
		if (true)
		{
			window.onkeyup = null;
		}
		this._state = null;
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

}());
/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var StateManager = include('springroll.StateManager');

	// Reference to the prototype
	var p = StateManager.prototype;

	/**
	 * @class StateManager
	 * @namespace springroll
	 */
	/**
	 * See see {{#crossLink "springroll.StateManager/transition:property"}}{{/crossLink}}
	 * @method changeTransition
	 * @deprecated since version 0.3.0
	 * @param {*} transition The transition clip
	 */
	p.changeTransition = function(transition)
	{
		if (true) console.warn("changeTransition is now deprecated, please use the property transition: e.g.: app.manager.transition = myTransition; ");
		this.transition = transition;
	};

	/**
	 * Get the current state, see see {{#crossLink "springroll.StateManager/currentState:property"}}{{/crossLink}}
	 * @method getCurrentState
	 * @deprecated since version 0.3.0
	 * @return {springroll.State} The current state
	 */
	p.getCurrentState = function()
	{
		if (true) console.warn("getCurrentState is now deprecated, please use the property currentState: e.g.: app.manager.currentState;");
		return this.currentState;
	};

	/**
	 * Set the current state, see {{#crossLink "springroll.StateManager/state:property"}}{{/crossLink}}
	 * @method setState
	 * @deprecated since version 0.3.0
	 * @param {String} id The state id
	 */
	p.setState = function(id)
	{
		if (true) console.warn("setState is now deprecated, please use the property state: e.g.: app.manager.state = 'title';");
		this.state = id;
	};

	/**
	 * Goto the next state, see {{#crossLink "springroll.State/nextState:method"}}{{/crossLink}}
	 * @method next
	 * @deprecated since version 0.3.0
	 */
	p.next = function()
	{
		if (true) console.warn("next is now deprecated, please use the nextState method on BaseState: e.g.: app.manager.currentState.nextState();");
		this._state.nextState();
	};

	/**
	 * Goto the previous state, see {{#crossLink "springroll.State/previousState:method"}}{{/crossLink}}
	 * @method previous
	 * @deprecated since version 0.3.0
	 */
	p.previous = function()
	{
		if (true) console.warn("previous is now deprecated, please use the previousState method on BaseState: e.g.: app.manager.currentState.previousState();");
		this._state.previousState();
	};

	/**
	 * A state for use with the StateManager, see see {{#crossLink "springroll.State"}}{{/crossLink}}
	 * @class springroll.BaseState
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(include('springroll'), 'BaseState',
	{
		get: function()
		{
			if (true) console.warn("springroll.BaseState is now deprecated, please use springroll.State instead");
			return include('springroll.State');
		}
	});

}());