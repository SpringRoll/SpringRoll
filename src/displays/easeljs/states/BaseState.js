/**
 *	@module EaselJS States
 *	@namespace springroll.easeljs
 *	@requires Core, States, Tasks, UI, Sound, EaselJS Display
 */
(function(undefined)
{
	var State = include('springroll.BaseState'),
		Debug,
		Application,
		ListTask,
		BasePanel,
		TaskManager,
		AssetManager;

	/**
	 *	Abstract game state class to do some preloading of assets
	 *	also plays well with the game audio loading.
	 *	@class BaseState
	 *	@extends springroll.BaseState
	 *	@constructor
	 *	@param {createjs.Container} panel The panel
	 *	@param {String|function} [nextState=null] The next state alias or call to next state
	 *	@param {String|function} [prevState=null] The previous state alias or call to previous state
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
			AssetManager = include('springroll.easeljs.AssetManager');
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.BaseState requires the panel be a springroll.easeljs.BasePanel";
		}

		State.call(this, panel, nextState, prevState);

		/**
		 *	Reference to the main game
		 *	@property {Application} game
		 *	@protected
		 */
		this.game = Application.instance;

		/**
		 *	The instance of the VOPlayer
		 *	@property {springroll.VOPlayer} voPlayer
		 *	@protected
		 */
		this.voPlayer = this.game.voPlayer;

		/**
		 *	Reference to the main config object
		 *	@property {Object} config
		 *	@protected
		 */
		this.config = this.game.config;

		/**
		 *	Reference to the scaling object
		 *	@property {springroll.UIScaler} scaling
		 *	@protected
		 */
		this.scaling = this.game.scaling;

		/**
		 *	The assets to load each time
		 *	@property {Object} manifest
		 *	@protected
		 */
		this.manifest = null;

		/**
		 *	If the assets have finished loading
		 *	@property {Boolean} assetsLoaded
		 *	@protected
		 */
		this.assetsLoaded = false;

		/**
		 *	Should we attempt to run resize every time this state is entered
		 *	Setting this to false in your subclass before onLoaded is called
		 *	stops assets already on stage from re-scaling
		 *	@property {Boolean}
		 *	@default true
		 *	@protected
		 */
		this.resizeOnReload = true;

		/**
		 *	If a manifest specific to this state should be automatically loaded by default.
		 *	@property {Boolean} useDefaultManifest
		 *	@protected
		 */
		this.useDefaultManifest = true;

		/**
		 *	The number of frames to delay the transition in after loading, to allow the framerate
		 *	to stablize after heavy art instantiation.
		 *	@property {int} delayLoadFrames
		 *	@protected
		 */
		this.delayLoadFrames = 0;
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
	p.enter = function()
	{
		// Start prealoading assets
		this.loadingStart();

		// Boolean to see if we've preloaded assests
		this.assetsLoaded = false;

		var tasks = [];

		// Preload the manifest files
		if (this.useDefaultManifest && this.manifest && this.manifest.length)
		{
			AssetManager.load(this.manifest, null, tasks);
		}

		this.addTasks(tasks);

		// Start loading assets if we have some
		if (tasks.length)
		{
			TaskManager.process(tasks, onLoaded.bind(this));
		}
		// No files to load, just continue
		else
		{
			onLoaded.call(this);
		}
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
	 *	from the TaskManager.
	 *	@method onAssetsLoaded
	 *	@protected
	 */
	p.onAssetsLoaded = function()
	{
		// Implementation specific
	};

	/**
	 *	The internal call for on assets loaded
	 *	@method onLoaded
	 *	@private
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
			// If there is no scaling config for the state,
			// then scale the entire panel
			else
			{
				if (this.resizeOnReload)
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
		}

		this.onAssetsLoaded();

		if (this.delayLoadFrames > 0)
		{
			var countdown = this.delayLoadFrames,
				game = this.game,
				callback = this.loadingDone.bind(this);

			var timerFunction = function()
			{
				if (--countdown <= 0)
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
	 *	When we exit the state
	 *	@method exit
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

		// Clean any assets loaded by the manifest
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
	 *	Don't use after calling this
	 *	@method destroy
	 */
	p.destroy = function()
	{
		this.manifest = null;
		this.game = null;
		this.config = null;
		this.voPlayer = null;
		this.scaling = null;

		this.panel.destroy();

		s.destroy.apply(this);
	};

	// Assign to the namespace
	namespace('springroll.easeljs').BaseState = BaseState;

	// Deprecated old namespace
	namespace('springroll.easeljs').ManifestState = BaseState;
}());