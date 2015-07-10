/*! SpringRoll 0.4.0 */
/**
 *	@module EaselJS States
 *	@namespace springroll.easeljs
 *	@requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function()
{
	//Import classes
	var Container = include('createjs.Container'),
		DwellTimer,
		Animator,
		Application;

	/**
	 *	Panel with convenience properties to the config, background and app.
	 *	@class BasePanel
	 *	@extend createjs.Container
	 *	@constructor
	 */
	var BasePanel = function()
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			DwellTimer = include('springroll.easeljs.DwellTimer', false);
			Animator = include('springroll.Animator', false);
		}

		Container.call(this);

		/**
		 *	Reference to the app
		 *	@property {Application} app
		 */
		this.app = Application.instance;

		/**
		 *	Reference to the app's config
		 *	@property {object} config
		 */
		this.config = this.app.config;

		/**
		 *	All panel should probably have a background image
		 *	@property {createjs.Bitmap} background
		 */
		this.background = null;
	};

	//Extend the container
	var p = extend(BasePanel, Container);

	/**
	 *	Should be called whenever a state enters this panel, Implementation-specific
	 *	@method setup
	 */
	p.setup = function()
	{
		//Implementation specific
	};

	/**
	 *	Should be called whenever a state exits this panel, the default
	 *	behavior is to remove all children of the panel. It will stop
	 *	any movieclip, destroy any objects, remove DwellTimers, etc.
	 *	@method teardown
	 */
	p.teardown = function()
	{
		var children = this.children.slice();
		this.cleanupChildren.apply(this, children);
	};

	/**
	 *	Removes a collection of objects from the stage and destroys them if we cant.
	 *	@example this.removeChildren(this.skipButton, this.character);
	 *	@method cleanupChildren
	 *	@param {array|*} children Assets to clean can either be individual children or collections of children
	 */
	p.cleanupChildren = function(children)
	{
		var child, i, j, len = arguments.length;

		for (i = 0; i < len; i++)
		{
			child = arguments[i];

			// Check for null/undefined arguments
			if (!child) continue;

			// test the current argument to see if itself is
			// an array, if it is, run .cleanupChildren() recursively
			if (Array.isArray(child) && child.length > 0)
			{
				this.cleanupChildren.apply(this, child);
				continue;
			}

			// If there's a dwell timer remove it
			if (DwellTimer) DwellTimer.destroy(child);

			// If there's an animation playing stop it
			if (Animator) Animator.stop(child, true);

			// Stop movie clips
			if (child.stop) child.stop();

			// Destroy anything with a destroy method
			if (child.destroy) child.destroy();

			// Recurisvely remove all children
			if (child.removeAllChildren) child.removeAllChildren(true);

			// Remove from this container
			if (this.contains(child)) this.removeChild(child);
		}
	};

	/**
	 *	Destroy and don't use after this
	 *	@method destroy
	 */
	p.destroy = function()
	{
		this.app = null;
		this.config = null;
		this.background = null;

		this.removeAllChildren();
	};

	//Assign to namespace
	namespace('springroll.easeljs').BasePanel = BasePanel;
}());
/**
 *	@module EaselJS States
 *	@namespace springroll.easeljs
 *	@requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	var State = include('springroll.State'),
		Debug,
		Application,
		BasePanel;

	/**
	 *	Abstract app state class to do some preloading of assets
	 *	also plays well with the app audio loading.
	 *	@class BaseState
	 *	@extends springroll.State
	 *	@constructor
	 *	@param {createjs.Container} panel The panel
	 *	@param {Object} [options] The options
	 *	@param {String|Function} [options.next=null] The next state alias or call to next state
	 *	@param {String|Function} [options.previous=null] The previous state alias or call to
	 *         previous state
	 *  @param {Boolean} [options.useManifest=true] Automatically load and unload assets 
	 *         which are found in the manifest option or property.
	 *  @param {Array} [options.manifest=[]] The list of object to load and unload.
	 *  @param {Object} [options.scaling=null] The scaling items to use with the ScaleManager. 
	 *         See `ScaleManager.addItems` for more information about the
	 *         format of the scaling objects.
	 */
	var BaseState = function(panel, options)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			BasePanel = include('springroll.easeljs.BasePanel');
			Debug = include('springroll.Debug', false);
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.State requires the panel be a springroll.easeljs.BasePanel";
		}

		// The options
		options = Object.merge({
			manifest: [],
			useManifest: true
		}, options || {});

		// Parent class constructor
		State.call(this, panel, options);

		/**
		 *	Reference to the main app
		 *	@property {Application} app
		 *	@protected
		 *	@readOnly
		 */
		this.app = Application.instance;

		/**
		 *	The instance of the VOPlayer
		 *	@property {springroll.VOPlayer} voPlayer
		 *	@protected
		 *	@readOnly
		 */
		this.voPlayer = this.app.voPlayer;

		/**
		 *	The instance of the Sound
		 *	@property {springroll.Sound} sound
		 *	@protected
		 *	@readOnly
		 */
		this.sound = this.app.sound;

		/**
		 *	Reference to the main config object
		 *	@property {Object} config
		 *	@protected
		 *	@readOnly
		 */
		this.config = this.app.config;

		/**
		 *	Reference to the scaling object
		 *	@property {springroll.UIScaler} scaling
		 *	@protected
		 *	@readOnly
		 */
		this.scaling = this.app.scaling;

		/**
		 *	The items to scale on the panel, see `UIScaler.addItems` for
		 *	more information. If no options are set in the State's constructor
		 *	then it will try to find an object on the app config on `scaling` property
		 *	matching the same state alias. For instance `config.scaling.title` if
		 *	`title` is the state alias. If no scalingItems are set, will scale
		 *	and position the panal itself.
		 *	@property {Object} scalingItems
		 *	@protected
		 *	@readOnly
		 *	@default null
		 */
		this.scalingItems = options.scaling || null;

		/**
		 *	The assets to load each time
		 *	@property {Object} manifest
		 *	@protected
		 */
		this.manifest = options.manifest;

		/**
		 *	Check to see if the assets have finished loading
		 *	@property {Boolean} assetsLoaded
		 *	@protected
		 *	@readOnly
		 */
		this.assetsLoaded = false;

		/**
		 *	If a manifest specific to this state should be automatically loaded by default.
		 *	@property {Boolean} useManifest
		 *	@protected
		 */
		this.useManifest = options.useManifest;
	};

	// Reference to the parent prototype
	var s = State.prototype;

	// Reference to current prototype
	var p = extend(BaseState, State);

	/**
	 *	Enter the state, when the panel is fully hidden
	 *	by the transition
	 *	@method enter
	 */
	p._internalEntering = function()
	{
		// Default entering
		s._internalEntering.call(this);
		
		// Start prealoading assets
		this.loadingStart();

		// Boolean to see if we've preloaded assests
		this.assetsLoaded = false;

		var assets = [];

		this.addTasks(assets);

		if (this.useManifest && this.manifest.length)
		{
			assets = this.manifest.concat(assets);
		}
		
		// Start loading assets if we have some
		if (tasks.length)
		{
			this.app.load(assets, this._onLoaded.bind(this));
		}
		// No files to load, just continue
		else
		{
			this._onLoaded();
		}
	};

	/**
	 * Extend the internal exit
	 * @method _internalExit
	 * @protected
	 */
	p._internalExit = function()
	{
		s._internalExit.call(this);

		if (!this.assetsLoaded) return;

		if (this.scaling)
		{
			this.scaling.removeBackground(this.panel.background);
			this.scaling.removeItems(this.panel);
		}

		this.panel.teardown();

		// Clean any assets loaded by the manifest
		if (this.useManifest && this.manifest.length)
		{
			this.app.unload(this.manifest);
		}
		this.assetsLoaded = false;
	};

	/**
	 *	Implementation specific for override. When you need to add additional preload
	 *	tasks to your state, override this function.
	 *	@method addTasks
	 *	@protected
	 *	@param {Array} tasks The list of preload tasks
	 */
	p.addTasks = function(tasks)
	{
		// Implementation specific
	};

	/**
	 *	Implementation specific for override. When all the assets have been loaded
	 *	can possible add options for loading assets.
	 *	@method onAssetsLoaded
	 *	@protected
	 */
	p.onAssetsLoaded = function()
	{
		// Implementation specific
	};

	/**
	 *	The internal call for on assets loaded
	 *	@method _onLoaded
	 *	@protected
	 */
	p._onLoaded = function()
	{
		this.assetsLoaded = true;
		this.panel.setup();

		if (this.scaling)
		{
			var items = this.scalingItems ||
				(this.config && this.config.scaling ? this.config.scaling[this.stateId] : null);

			if (items)
			{
				this.scaling.addItems(this.panel, items);
				
				// Background is optional, so we'll check
				// before adding to the scaling
				var background = this.panel.background;
				if (background && background.image)
				{
					this.scaling.addBackground(background);
				}
			}
			// If there is no scaling config for the state,
			// then scale the entire panel
			else
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
		}
		this.onAssetsLoaded();
		this.loadingDone();
	};

	/**
	 *	Don't use after calling this
	 *	@method destroy
	 */
	p.destroy = function()
	{
		this.manifest = null;
		this.config = null;
		this.voPlayer = null;
		this.scaling = null;
		this.sound = null;
		this.app = null;

		this.panel.destroy();

		s.destroy.apply(this);
	};

	// Assign to the namespace
	namespace('springroll.easeljs').BaseState = BaseState;
	
}());
/**
 *	@module EaselJS States
 *	@namespace springroll.easeljs
 *	@requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	// Import classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug,
		BaseState;

	/**
	 *	A createjs-based Game to load manifests
	 *	@class ManifestsPlugin
	 *	@extends springroll.ApplicationPlugin
	 *	@param {int} [options.fps=30] The framerate to use for the main display
	 *	@param {Function} [options.display=springroll.easeljsDisplay] The
	 *	display class to use as the default display.
	 *	@param {Boolean} [options.displayOptions.clearView=true] If the stage view
	 *	should be cleared everytime in CreateJS stage.
	 */
	var plugin = new ApplicationPlugin();

	// Initialize the plugin
	plugin.setup = function()
	{
		/**
		 *	Event when the manifest is finished loading
		 *	@event manifestLoaded
		 *	@param {springroll.TaskManager} manager The task manager
		 */

		/**
		 *	The path to the concatinated FLA exported manifests. It's useful
		 *	to load all the manifests at once. This JSON object contains a
		 *	dictionary of state alias and contains an array of manifest assets
		 *	(e.g. `{"id": "PlayButton", "src": "assets/images/button.png"}`.
		 *	Set to null and no manifest will be auto-loaded.
		 *	@property {String} options.manifestsPath
		 *	@readOnly
		 *	@default null
		 */
		this.options.add('manifestsPath', null, true);

		// Change the defaults
		this.options.override('fps', 30);
		this.options.override('display', include('springroll.easeljs.EaselJSDisplay'));
		this.options.override('displayOptions', { clearView: true });
		this.options.override('canvasId', 'stage');

		Debug = include('springroll.Debug', false);
		BaseState = include('springroll.easeljs.BaseState');

		/**
		 *	The collection of loading assets by state
		 *	@property {object} _manifests
		 *	@private
		 */
		this._manifests = {};

		/**
		 *	Read-only getter to return _manifests
		 *	@property {object} manifests
		 *	@readOnly
		 */
		Object.defineProperty(this, "manifests",
		{
			get: function()
			{
				return this._manifests;
			}
		});

		// When config loads, load the manifests
		this.once('loading', function(assets)
		{
			var manifestsPath = this.options.manifestsPath;

			if (manifestsPath)
			{
				assets.push({
					id: "manifests",
					src: manifestsPath,
					complete: onManifestsLoaded.bind(this)
				});
			}
			else if (true && Debug)
			{
				Debug.info("Application option 'manifestsPath' is empty, set to automatically load manifests JSON");
			}
		});
	};

	/**
	 *	Callback to when manifests have been loaded
	 *	@method onManifestsLoaded
	 *	@private
	 *	@param {array} tasks The collection of preload tasks
	 */
	var onManifestsLoaded = function(manifests, task, manager)
	{
		Object.merge(this._manifests, manifests);
		this.trigger('manifestLoaded', manager);
	};

	// clean up
	plugin.teardown = function()
	{
		this._manifests = null;
	};

}());
(function(Object)
{
	// Include classes
	var BasePanel = include('springroll.easeljs.BasePanel'),
		BaseState = include('springroll.easeljs.BaseState');
	
	/**
	 * @property
	 * @name springroll.BasePanel#game
	 * @see {@link springroll.BasePanel#app}
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BasePanel.prototype, 'game', 
	{
		get: function()
		{
			console.warn('game is now deprecated, please use the app property, e.g. : panel.app');
			return this.app;
		}
	});

	/**
	 * @property
	 * @name springroll.BaseState#game
	 * @see {@link springroll.BaseState#app}
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BaseState.prototype, 'game', 
	{
		get: function()
		{
			console.warn('game is now deprecated, please use the app property, e.g. : state.app');
			return this.app;
		}
	});

}(Object));