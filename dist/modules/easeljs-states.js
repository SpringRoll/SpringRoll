/*! SpringRoll 0.3.0 */
/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, Interface, Tasks, Learning, EaselJS Learning, EaselJS Display
 */
(function()
{
	//Import classes
	var Container = include('createjs.Container'),
		DwellTimer,
		Animator,
		Application;

	/**
	 *  Panel with convenience properties to the config, background and game.
	 *  @class BasePanel
	 *  @extend createjs.Container
	 *  @constructor
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
		 *  Reference to the game
		 *  @property {Application} game
		 */
		this.game = Application.instance;

		/**
		 *  Reference to the app's config
		 *  @property {object} config
		 */
		this.config = this.game.config;

		/**
		 *  All panel should probably have a background image
		 *  @property {createjs.Bitmap} background
		 */
		this.background = null;
	};

	//Extend the container
	var p = extend(BasePanel, Container);

	/**
	 *  Should be called whenever a state enters this panel, Implementation-specific
	 *  @method setup
	 */
	p.setup = function()
	{
		//Implementation specific
	};

	/**
	 *  Should be called whenever a state exits this panel, the default
	 *  behavior is to remove all children of the panel. It will stop
	 *  any movieclip, destroy any objects, remove DwellTimers, etc.
	 *  @method teardown
	 */
	p.teardown = function()
	{
		var children = this.children.slice();
		this.cleanupChildren.apply(this, children);
	};

	/**
	 *  Removes a collection of objects from the stage and destroys them if we cant.
	 *  @example this.removeChildren(this.skipButton, this.character);
	 *  @method cleanupChildren
	 *  @param {array|*} children Assets to clean can either be individual children or collections of children
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
	 *  Destroy and don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.game = null;
		this.config = null;
		this.background = null;

		this.removeAllChildren();
	};

	//Assign to namespace
	namespace('springroll.easeljs').BasePanel = BasePanel;
}());
/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, Interface, Tasks, Learning, EaselJS Learning, EaselJS Display
 */
(function(undefined)
{
	var State = include('springroll.BaseState'),
		Debug,
		Application,
		ListTask,
		BasePanel,
		TaskManager;

	/**
	 *  Abstract game state class to do some preloading of assets
	 *  also plays well with the game audio loading.
	 *  @class BaseState
	 *  @extends springroll.BaseState
	 *  @constructor
	 *  @param {createjs.Container} panel The panel
	 *  @param {string|function} [nextState=null] The next state alias or call to next state
	 *  @param {string|function} [prevState=null] The previous state alias or call to previous state
	 */
	var BaseState = function(panel, nextState, prevState)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			BasePanel = include('springroll.easeljs.BasePanel');
			ListTask = include('springroll.ListTask');
			TaskManager = include('springroll.TaskManager');
			Debug = include('springroll.Debug', false);
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.BaseState requires the panel be a springroll.easeljs.BasePanel";
		}

		State.call(this, panel, nextState, prevState);

		/**
		 *  Reference to the main game
		 *  @property {Application} game
		 *  @protected
		 */
		this.game = Application.instance;

		/**
		 *  The instance of the VOPlayer
		 *  @property {springroll.VOPlayer} player
		 *  @protected
		 */
		this.player = this.game.player;

		/**
		 *  Reference to the main config object
		 *  @property {Object} config
		 *  @protected
		 */
		this.config = this.game.config;

		/**
		 *  Reference to the scaling object
		 *  @property {springroll.UIScaler} scaling
		 *  @protected
		 */
		this.scaling = this.game.scaling;

		/**
		 *  The assets to load each time
		 *  @property {Object} manifest
		 *  @protected
		 */
		this.manifest = null;

		/**
		 *  If the assets have finished loading
		 *  @property {Boolean} assetsLoaded
		 *  @protected
		 */
		this.assetsLoaded = false;

		/**
		 *  Should we attempt to run resize every time this state is entered
		 *  Setting this to false in your subclass before onLoaded is called
		 *  stops assets already on stage from re-scaling
		 *  @property {Boolean}
		 *  @default true
		 *  @protected
		 */
		this.resizeOnReload = true;
		
		/**
		 *  If a manifest specific to this state should be automatically loaded by default.
		 *  @property {Boolean} useDefaultManifest
		 *  @protected
		 */
		this.useDefaultManifest = true;
		
		/**
		 *  The number of frames to delay the transition in after loading, to allow the framerate
		 *  to stablize after heavy art instantiation.
		 *  @property {int} delayLoadFrames
		 *  @protected
		 */
		this.delayLoadFrames = 0;
	};

	//Reference to the parent prototype
	var s = State.prototype;

	//Reference to current prototype
	var p = extend(BaseState, State);

	/**
	 * Enter the state, when the panel is fully hidden
	 * by the transition
	 * @method enter
	 */
	p.enter = function()
	{
		//Start prealoading assets
		this.loadingStart();

		//Boolean to see if we've preloaded assests
		this.assetsLoaded = false;

		var tasks = [];

		//Preload the manifest files
		if (this.useDefaultManifest && this.manifest && this.manifest.length)
		{
			tasks.push(new ListTask('manifests', this.manifest, onManifestLoaded));
		}

		this.addTasks(tasks);

		//Start loading assets if we have some
		if (tasks.length)
		{
			TaskManager.process(tasks, onLoaded.bind(this));
		}
		//No files to load, just continue
		else
		{
			onLoaded.call(this);
		}
	};

	/**
	 *  Implementation specific for override. When you need to add additional preload
	 *  tasks to your state, override this function.
	 *  @method addTasks
	 *  @protected
	 *  @param {array} tasks The list of preload tasks
	 */
	p.addTasks = function(tasks)
	{
		//Implementation specific
	};

	/**
	 *  Implementation specific for override. When all the assets have been loaded
	 *  can possible add options for loading assets.
	 *  from the TaskManager.
	 *  @method onAssetsLoaded
	 *  @protected
	 */
	p.onAssetsLoaded = function()
	{
		//Implementation specific
	};

	/**
	 *  The internal call for on assets loaded
	 *  @method onLoaded
	 *  @private
	 */
	var onLoaded = function()
	{
		this.assetsLoaded = true;

		this.panel.setup();

		if (this.scaling)
		{
			var items = this.config.scaling[this.stateId];

			if (items !== undefined)
			{
				if (this.resizeOnReload)
				{
					this.scaling.addItems(this.panel, items);
				}
				// Background is optional, so we'll check
				// before adding to the scaling
				var background = this.panel.background;
				if (background && background.image)
				{
					this.scaling.addBackground(background);
				}
			}
			// if there is no scaling config for the state, 
			// then scale the entire panel
			else
			{
				if (this.resizeOnReload)
				{
					// reset the panel scale & position, to ensure 
					// that the panel is scaled properly
					// upon state re-entry
					this.panel.x = this.panel.y = 0;
					this.panel.scaleX = this.panel.scaleY = 1;

					this.scaling.addItem(this.panel, {
						align: "top-left",
						titleSafe: true
					});
				}
			}
		}

		this.onAssetsLoaded();
		
		if (this.delayLoadFrames > 0)
		{
			var countdown = this.delayLoadFrames,
				game = this.game,
				callback = this.loadingDone.bind(this);

			var timerFunction = function()
			{
				if(--countdown <= 0)
				{
					game.off("update", timerFunction);
					callback();
				}
			};
			game.on("update", timerFunction);
		}
		else
		{
			this.loadingDone();
		}
	};

	/**
	 *  Handler for manifest load task
	 *  @method onManifestLoaded
	 *  @private
	 *  @param {springroll.LoaderResult} results The media loader results (dictionary by task id)
	 *  @param {springroll.Task} task The task reference
	 *  @param {springroll.TaskManager} taskManager The task manager reference
	 */
	var onManifestLoaded = function(results)
	{
		for (var id in results)
		{
			//if it is a javascript file, just leave it alone
			if (results[id].url.indexOf(".js") === -1)
			{
				images[id] = results[id].content;
			}
		}
	};

	/**
	 *  When we exit the state
	 *  @method exit
	 */
	p.exit = function()
	{
		if (!this.assetsLoaded) return;

		if (this.scaling)
		{
			this.scaling.removeBackground(this.panel.background);
			this.scaling.removeItems(this.panel);
		}

		this.panel.teardown();

		//Clean any assets loaded by the manifest
		if (this.manifest)
		{
			var id;
			var manifest = this.manifest;
			var len = manifest.length;

			for (var i = 0; i < len; i++)
			{
				id = manifest[i].id;
				delete images[id];
			}
		}
		this.assetsLoaded = false;
	};

	/**
	 *  Don't use after calling this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.manifest = null;
		this.game = null;
		this.config = null;
		this.player = null;
		this.scaling = null;

		this.panel.destroy();

		s.destroy.apply(this);
	};

	// Assign to the namespace
	namespace('springroll.easeljs').BaseState = BaseState;

	// Deprecated old namespace
	namespace('springroll.easeljs').ManifestState = BaseState;
}());
/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, Interface, Tasks, Learning, EaselJS Learning, EaselJS Display
 */
(function(undefined)
{
	//Import classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		LoadTask,
		BaseState;

	/**
	 * A createjs-based Game to load manifests
	 * @class ManifestsPlugin
	 * @extends springroll.ApplicationPlugin
	 * 
	 * @param {int} [options.fps=30] The framerate to use for the main display
	 * @param {function} [options.display=springroll.easeljsDisplay] The 
	 *        display class to use as the default display.
	 * @param {boolean} [options.displayOptions.clearView=true] If the stage view
	 *        should be cleared everytime in CreateJS stage. 
	 */
	var ManifestsPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Extend base plugin
	var p = extend(ManifestsPlugin, ApplicationPlugin);

	// Initialize the plugin
	p.setup = function()
	{
		/**
		 *  Event when the manifest is finished loading
		 *  @event manifestLoaded
		 *  @param {springroll.TaskManager} manager The task manager
		 */

		/**
		 * The path to the concatinated FLA exported manifests. It's useful
		 * to load all the manifests at once. This JSON object contains a
		 * dictionary of state alias and contains an array of manifest assets
		 * (e.g. `{"id": "PlayButton", "src": "assets/images/button.png"}`.
	 	 * Set to null and no manifest will be auto-loaded.
		 * @property {String} options.manifestsPath
		 * @readOnly
		 * @default "assets/config/manifests.json"
		 */
		this.options.add('manifestsPath', "assets/config/manifests.json", true);

		// Change the defaults
		this.options.override('fps', 30);
		this.options.override('display', include('springroll.easeljs.EaselJSDisplay'));
		this.options.override('displayOptions', { clearView: true });
		this.options.override('canvasId', 'stage');

		LoadTask = include('springroll.LoadTask');
		BaseState = include('springroll.easeljs.BaseState');

		/**
		 *  The collection of loading assests by state
		 *  @property {object} _manifests
		 *  @private
		 */
		this._manifests = {};

		/**
		 * Read-only getter to return _manifests
		 * @property {object} manifests
		 * @readOnly
		 */
		Object.defineProperty(this, "manifests",
		{
			get: function()
			{
				return this._manifests;
			}
		});

		// When config loads, load the manifests
		this.once('configLoaded', function(config, taskManager)
		{
			if (!this.options.manifestsPath) return;

			taskManager.addTask(new LoadTask(
				"manifests",
				this.options.manifestsPath,
				onManifestsLoaded.bind(this)
			));
		});

		// Handle when states are added and add
		// the manifests from either the config
		this.on('stateAdded', function(alias, state)
		{
			if (!(state instanceof BaseState))
			{
				throw "States need to extend springroll.easeljs.BaseState";
			}

			var manifest = [];

			//Add any manifests from the config
			var configManifests = this.config.manifests;
			if (configManifests && configManifests[alias])
			{
				manifest = configManifests[alias];
			}
			//Add any manifest items from the createjs manifest concat
			if (this._manifests[alias])
			{
				manifest = manifest.concat(this._manifests[alias]);
			}
			//Set the properties to the state
			state.manifest = manifest;
		});
	};

	/**
	 *  Callback to when manifests have been loaded
	 *  @method onManifestsLoaded
	 *  @private
	 *  @param {array} tasks The collection of preload tasks
	 */
	var onManifestsLoaded = function(result, task, manager)
	{
		var lowerKey,
			manifest = this._manifests,
			content = result.content;

		for (var key in content)
		{
			lowerKey = key.toString().toLowerCase();
			if (!manifest[lowerKey])
			{
				manifest[lowerKey] = content[key];
			}
		}
		this.trigger('manifestLoaded', manager);
	};

	p.teardown = function()
	{
		this._manifests = null;
	};

	ApplicationPlugin.register(ManifestsPlugin);

}());