/*! SpringRoll 0.3.0 */
/**
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Interface, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
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
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Interface, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	var State = include('springroll.BaseState'),
		Debug = include('springroll.Debug', false),
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
		if (this.manifest.length)
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
/**
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Interface, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	//Import classes
	var BaseLearningGame = include('springroll.LearningGame'),
		EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Animator,
		Text,
		LoadTask,
		BaseState;

	/**
	 *  A createjs-based Game to load manifests
	 *  @class LearningGame
	 *  @extends springroll.LearningGame
	 *  @constructor
	 *  @param {object} [options] The Application options
	 *  @param {string} [options.manifestsPath='assets/config/manifests.json']
	 *		The path to the concatinated FLA exported manifests. It's useful
	 *		to load all the manifests at once. This JSON object contains a
	 *		dictionary of state alias and contains an array of manifest assets
	 *		(e.g. `{"id": "PlayButton", "src": "assets/images/button.png"}`.
	 *      Set to null and no manifest will be auto-loaded.
	 *  @param {int} [options.fps=30] The framerate to use for the main display
	 *  @param {function} [options.display=springroll.easeljsDisplay] The 
	 *      display class to use as the default display.
	 *  @param {boolean} [options.displayOptions.clearView=true] If the stage view
	 *      should be cleared everytime in CreateJS stage. 
	 */
	var LearningGame = function(options)
	{
		Text = include('createjs.Text');
		LoadTask = include('springroll.LoadTask');
		BaseState = include('springroll.easeljs.BaseState');
		Animator = include('springroll.easeljs.Animator');

		BaseLearningGame.call(this, Object.merge({
			manifestsPath: "assets/config/manifests.json",
			display: EaselJSDisplay,
			displayOptions:	{
				clearView: true,
			},
			fps: 30
		}, options));

		/**
		 *  The collection of loading assests by state
		 *  @property {object} _manifests
		 *  @private
		 */
		this._manifests = {};

		/**
		 *  Some games need to send additional parameters to the tracker's
		 *  offClick event. They may set them here as needed
		 *  @property {Array} offClickParams
		 */
		this.offClickParams = [];

		//Ignore the additional task if we turn off manifests
		if (this.options.manifestsPath !== null)
		{
			addTasks = addTasks.bind(this);
			this.on('loading', addTasks);
		}

		//Add a captions text field after the states are ready
		this.on('statesReady', fixDisplayList.bind(this));

		//Provide convenience handling of stage off click progress events
		onStageMouseDown = onStageMouseDown.bind(this);
		if (this.display && this.display.stage)
		{
			this.display.stage.addEventListener("stagemousedown", onStageMouseDown);
		}
	};

	//Extend base game class
	var s = BaseLearningGame.prototype;
	var p = extend(LearningGame, BaseLearningGame);

	/**
	 *  Event when the manifest is finished loading
	 *  @event manifestLoaded
	 */
	var MANIFEST_LOADED = 'manifestLoaded';

	/**
	 *  Callback to add more custom tasks
	 *  @method addTasks
	 *  @private
	 *  @param {array} tasks The collection of preload tasks
	 */
	var addTasks = function(tasks)
	{
		this.off('loading', addTasks);

		tasks.push(new LoadTask(
			"manifests",
			this.options.manifestsPath,
			onManifestsLoaded.bind(this)));
	};

	/**
	 * Add the text field to the top of the display list
	 * @method fixDisplayList
	 * @private
	 */
	var fixDisplayList = function()
	{
		var stage = this.display.stage;

		//Put the captions on top
		if (this.captions.textField instanceof Text)
		{
			stage.addChild(this.captions.textField);
		}

		//Put the transition back on top
		stage.addChild(this.transition);
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
		this.trigger(MANIFEST_LOADED, manager);
	};

	/**
	 *  Extend the addState method to at a manifest array to each state
	 *  this will combine manifests from the external file as well any
	 *  manifests that are loaded in the default config.json "manifest" object.
	 *  @method addState
	 *  @param {string} alias The state alias
	 *  @param {BaseState} state The state to add
	 */
	p.addState = function(alias, state)
	{
		if (!(state instanceof BaseState))
		{
			throw "springroll.easeljs.Game requires states to extend springroll.easeljs.BaseState";
		}

		s.addState.call(this, alias, state);

		var manifest = [];

		//Add any manifests from the config
		var configManifests = this.config.manifests;
		if (configManifests !== undefined && configManifests[alias] !== undefined)
		{
			manifest = configManifests[alias];
		}
		//Add any manifest items from the createjs manifest concat
		if (this._manifests[alias] !== undefined)
		{
			manifest = manifest.concat(this._manifests[alias]);
		}
		//Set the properties to the state
		state.manifest = manifest;
	};

	/**
	 *  Fires OffClick event if click on unhandled object
	 *  @method onStageMouseDown
	 *  @private
	 *  @param {MouseEvent} ev stagemousedown event
	 */
	var onStageMouseDown = function(ev)
	{
		//sanity checking to make sure learning exists
		if (!this.learning) return;

		var stage = ev.target;
		var target = stage._getObjectsUnderPoint(ev.stageX, ev.stageY, null, true);
		
		if (!target)//no interactive objects found
		{
			//duplicate the array of optional offClick parameters
			var arr = this.offClickParams.slice(0);

			//make sure we are sending the default parameter (position)
			//as the first parameter
			arr.unshift(this.normalizePosition(ev.stageX, ev.stageY));

			//send the entire array of parameters
			this.learning.offClick.apply(this, arr);
		}
	};

	/**
	 *  Destroy this game, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		//Remove stage listener
		if (this.display && this.display.stage)
		{
			this.display.stage.removeEventListener("stagemousedown", onStageMouseDown);
		}

		this.offClickParams = null;
		this._manifests = null;

		s.destroy.call(this);
	};

	/**
	 *  Read-only getter to return _manifests
	 *  @property {object} manifests
	 *  @readOnly
	 */
	Object.defineProperty(p, "manifests",
	{
		get: function()
		{
			return this._manifests;
		}
	});

	//Assign to namespace
	namespace('springroll.easeljs').LearningGame = LearningGame;

}());