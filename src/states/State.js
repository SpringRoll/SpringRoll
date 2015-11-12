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

		if (DEBUG && Debug && !panel)
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
			if (DEBUG && Debug) Debug.warn("loadingDone() was called without a load started, call loadingStart() first");
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