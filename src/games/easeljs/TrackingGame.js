/**
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Interface, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	//Import classes
	var BaseTrackingGame = include('springroll.TrackingGame'),
		EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Animator,
		Text,
		LoadTask,
		BaseState;

	/**
	 *  A createjs-based Game to load manifests
	 *  @class TrackingGame
	 *  @extends springroll.TrackingGame
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
	var TrackingGame = function(options)
	{
		Text = include('createjs.Text');
		LoadTask = include('springroll.LoadTask');
		BaseState = include('springroll.easeljs.BaseState');
		Animator = include('springroll.easeljs.Animator');

		BaseTrackingGame.call(this, Object.merge({
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
			this.on('configLoaded', addTasks);
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
	var s = BaseTrackingGame.prototype;
	var p = extend(TrackingGame, BaseTrackingGame);

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
	var addTasks = function(config, taskManager)
	{
		this.off('configLoaded', addTasks);

		taskManager.addTask(new LoadTask(
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
		//sanity checking to make sure tracker exists
		if (!this.tracker) return;

		var stage = ev.target;
		var target = stage._getObjectsUnderPoint(ev.stageX, ev.stageY, null, true);

		var foundListener = false;
		
		if(target)
		{
			while (target && target != stage)
			{
				if (target.hasEventListener("mousedown") || target.hasEventListener("click"))
				{
					foundListener = true;
					break;
				}
				target = target.parent;
			}
		}

		if (!foundListener)//no interactive objects found
		{
			//duplicate the array of optional offClick parameters
			var arr = this.offClickParams.slice(0);

			//make sure we are sending the default parameter (position)
			//as the first parameter
			arr.unshift(this.normalizePosition(ev.stageX, ev.stageY));

			//send the entire array of parameters
			this.tracker.offClick.apply(this, arr);
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
	namespace('springroll.easeljs').TrackingGame = TrackingGame;

}());