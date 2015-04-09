/**
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Interface, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	var State = include('springroll.BaseState'),
		Debug,
		Application,
		ListTask,
		BasePanel,
		TaskManager,
		UIScaler;

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
			UIScaler = include('springroll.UIScaler');
			Debug = include('springroll.Debug', false);
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.BaseState requires the panel be a springroll.easeljs.BasePanel";
		}

		State.call(this, panel, nextState, prevState);

		/**
		 *  Reference to the main game
		 *  @property {_namespace_.State} game
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
		 *  @property {object} config
		 *  @protected
		 */
		this.config = this.game.config;

		/**
		 *  The assets to load each time
		 *  @property {object} manifset
		 *  @protected
		 */
		this.manifest = null;

		/**
		 *  If the assets have finished loading
		 *  @property {boolean} assetsLoaded
		 *  @protected
		 */
		this.assetsLoaded = false;

		/**
		 *  The UI Scaler object
		 *  @property {springroll.UIScaler} scaler
		 */
		this.scaler = null;

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
		 *  @property {boolean} useDefaultManifest
		 *  @protected
		 */
		this.useDefaultManifest = true;
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

		var scalingConfig = this.config.scaling[this.stateId];

		if (scalingConfig !== undefined)
		{
			if (!this.scaler || this.resizeOnReload)
			{
				this.scaler = new UIScaler(
					this.panel,
					this.config.designedSettings,
					scalingConfig,
					false
				);
			}
			//Background is optional, so we'll check
			//before adding to the scaler
			var background = this.panel.background;
			if (background && background.image)
			{
				this.scaler.addBackground(background);
			}
		}
		//if there is no scaling config for the state, then scale the entire panel
		else
		{
			if (!this.scaler || this.resizeOnReload)
			{
				//reset the panel scale & position, to ensure that the panel is scaled properly
				//upon state re-entry
				this.panel.x = this.panel.y = 0;
				this.panel.scaleX = this.panel.scaleY = 1;
				//create a small config just for the panel
				scalingConfig =
				{
					panel:
					{
						align: "top-left",
						titleSafe: true
					}
				};
				this.scaler = new UIScaler(
					this,
					this.config.designedSettings,
					scalingConfig,
					false
				);
			}
		}
		
		//Activate the scaler
		this.scaler.enabled = true;

		this.onAssetsLoaded();
		this.loadingDone();
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

		this.panel.teardown();

		if (this.scaler)
		{
			this.scaler.enabled = false;
			this.scaler.removeBackground(this.panel.background);

			if (this.resizeOnReload)
			{
				this.scaler.destroy();
				this.scaler = null;
			}
		}

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
		this.panel.destroy();

		if (this.scaler)
		{
			this.scaler.destroy();
			this.scaler = null;
		}

		s.destroy.apply(this);
	};

	// Assign to the namespace
	namespace('springroll.easeljs').BaseState = BaseState;

	// Deprecated old namespace
	namespace('springroll.easeljs').ManifestState = BaseState;
}());