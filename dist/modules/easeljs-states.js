/*! SpringRoll 1.0.3 */
/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function()
{
	//Import classes
	var Container = include('createjs.Container'),
		DwellTimer,
		Application;

	/**
	 * Panel with convenience properties to the config, background and app.
	 * @class BasePanel
	 * @extends createjs.Container
	 * @constructor
	 */
	var BasePanel = function()
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			DwellTimer = include('springroll.easeljs.DwellTimer', false);
		}

		Container.call(this);

		/**
		 * Reference to the app
		 * @property {Application} app
		 */
		this.app = Application.instance;

		/**
		 * Reference to the app's config
		 * @property {object} config
		 */
		this.config = this.app.config;

		/**
		 * All panel should probably have a background image
		 * @property {createjs.Bitmap} background
		 */
		this.background = null;
	};

	//Extend the container
	var p = extend(BasePanel, Container);

	/**
	 * Should be called whenever a state enters this panel, Implementation-specific
	 * @method setup
	 */
	p.setup = function()
	{
		//Implementation specific
	};

	/**
	 * Should be called whenever a state exits this panel, the default
	 * behavior is to remove all children of the panel. It will stop
	 * any movieclip, destroy any objects, remove DwellTimers, etc.
	 * @method teardown
	 */
	p.teardown = function()
	{
		var children = this.children.slice();
		this.cleanupChildren.apply(this, children);
	};

	/**
	 * Removes a collection of objects from the stage and destroys them if we cant.
	 * @example this.removeChildren(this.skipButton, this.character);
	 * @method cleanupChildren
	 * @param {array|*} children Assets to clean can either be individual children or collections of children
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
			if (this.app.animator) this.app.animator.stop(child, true);

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
	 * Destroy and don't use after this
	 * @method destroy
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
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	var State = include('springroll.State'),
		Debug,
		BasePanel;

	/**
	 * Abstract app state class to do some preloading of assets
	 * also plays well with the app audio loading.
	 * @class BaseState
	 * @extends springroll.State
	 * @constructor
	 * @param {createjs.Container} panel The panel
	 * @param {Object} [options] The options
	 * @param {String|Function} [options.next=null] The next state alias or call to next state
	 * @param {String|Function} [options.previous=null] The previous state alias or call to
	 *       previous state
	 * @param {Object} [options.scaling=null] The scaling items to use with the ScaleManager.
	 *       See `ScaleManager.addItems` for more information about the
	 *       format of the scaling objects.
	 */
	var BaseState = function(panel, options)
	{
		if (!BasePanel)
		{
			BasePanel = include('springroll.easeljs.BasePanel');
			Debug = include('springroll.Debug', false);
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.State requires the panel be a springroll.easeljs.BasePanel";
		}

		options = options ||
		{};

		if (options.manifest)
		{
			options.preload = options.manifest;
			if (true)
			{
				console.warn("The BaseState option 'manifest' is deprecated, use 'preload' instead");
			}
		}

		// Parent class constructor
		State.call(this, panel, options);

		/**
		 * The global images loaded
		 * @property {Array} _images
		 * @protected
		 */
		this._images = [];

		var priority = 100;

		// @deprecated method for adding assets dynamically to task
		this.on('loading', function(assets)
			{
				if (this.addTasks)
				{
					if (true) console.warn('addTasks has been deprecated, use loading event instead: e.g., state.on(\'loading\', function(assets){})');
					this.addTasks(assets);
				}
			}, priority)

			// Handle when assets are preloaded
			.on('loaded', function(assets)
			{
				if (assets)
				{
					// save all images to the window images object
					// this is required for CreateJS to be available
					// on the images window object
					for (var id in assets)
					{
						if (assets[id].tagName == "IMG" ||
							assets[id].tagName == "CANVAS")
						{
							images[id] = assets[id];
							this._images.push(id);
						}
					}
				}
				this.panel.setup();

				// @deprecated Method to handle on assets loaded
				this.onAssetsLoaded();
			}, priority)
			// Handle the panel exit
			.on('exit', function()
			{
				this.panel.teardown();

				// Remove global images reference
				this._images.forEach(function(id)
				{
					delete images[id];
				});
				this._images.length = 0;
			}, priority);
	};

	// Reference to the parent prototype
	var s = State.prototype;

	// Reference to current prototype
	var p = State.extend(BaseState);

	/**
	 * Implementation specific for override. When you need to add additional preload
	 * tasks to your state, override this function.
	 * @method addTasks
	 * @see {@link springroll.State#preloading}
	 * @deprecated since 0.4.0
	 * @protected
	 * @param {Array} tasks The list of preload tasks
	 */
	p.addTasks = null;

	/**
	 * Implementation specific for override. When all the assets, scaling and panel
	 * setup have completed.
	 * @method onAssetsLoaded
	 * @see {@link springroll.State#loaded}
	 * @deprecated since 0.4.0
	 * @protected
	 */
	p.onAssetsLoaded = function()
	{
		// Implementation specific
	};

	p.destroy = function()
	{
		this._images = null;
		this.panel.destroy();
		s.destroy.call(this);
	};

	// Assign to the namespace
	namespace('springroll.easeljs').BaseState = BaseState;

}());
/**
 * @module EaselJS States
 * @namespace springroll
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	// Import classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug,
		BaseState;

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Initialize the plugin
	plugin.setup = function()
	{
		/**
		 * Event when the manifest is finished loading
		 * @event manifestLoaded
		 * @param {Array} assets The object of additional assets to load
		 */

		/**
		 * The path to the concatinated FLA exported manifests. It's useful
		 * to load all the manifests at once. This JSON object contains a
		 * dictionary of state alias and contains an array of manifest assets
		 * (e.g. `{"id": "PlayButton", "src": "assets/images/button.png"}`.
		 * Set to null and no manifest will be auto-loaded.
		 * @property {String} options.manifestsPath
		 * @readOnly
		 * @default null
		 */
		this.options.add('manifestsPath', null, true);

		// Change the defaults
		this.options.override('fps', 30);
		this.options.override('display', include('springroll.easeljs.EaselJSDisplay'));
		this.options.override('displayOptions',
		{
			clearView: true
		});
		this.options.override('canvasId', 'stage');

		Debug = include('springroll.Debug', false);
		BaseState = include('springroll.easeljs.BaseState');

		/**
		 * The collection of loading assets by state
		 * @property {object} _manifests
		 * @private
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
		this.once('loading', function(assets)
		{
			var manifestsPath = this.options.manifestsPath;

			if (manifestsPath)
			{
				assets.push(
				{
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
	 * Callback to when manifests have been loaded
	 * @method onManifestsLoaded
	 * @private
	 * @param {array} tasks The collection of preload tasks
	 */
	var onManifestsLoaded = function(manifests, asset, assets)
	{
		Object.merge(this._manifests, manifests);
		this.trigger('manifestLoaded', assets);
	};

	// clean up
	plugin.teardown = function()
	{
		this._manifests = null;
	};

}());
/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(Object)
{
	// Include classes
	var BasePanel = include('springroll.easeljs.BasePanel'),
		BaseState = include('springroll.easeljs.BaseState');

	/**
	 * @class BasePanel
	 */
	/**
	 * See {{#crossLink "springroll.BasePanel/app:property"}}{{/crossLink}}
	 * @property {springroll.Application} game
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BasePanel.prototype, 'game',
	{
		get: function()
		{
			if (true) console.warn('BasePanel\'s game property is now deprecated, please use the app property, e.g. : panel.app');
			return this.app;
		}
	});

	/**
	 * @class BaseState
	 */
	/**
	 * See {{#crossLink "springroll.BaseState/app:property"}}{{/crossLink}}
	 * @property {springroll.Application} game
	 * @deprecated since version 0.3.0
	 */
	Object.defineProperty(BaseState.prototype, 'game',
	{
		get: function()
		{
			if (true) console.warn('BaseState\'s game property is now deprecated, please use the app property, e.g. : state.app');
			return this.app;
		}
	});

	/**
	 * See {{#crossLink "springroll.State/preload:property"}}{{/crossLink}}
	 * @property {Array} manifest
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(BaseState.prototype, 'manifest',
	{
		get: function()
		{
			if (true) console.warn("BaseState's manifest property is now deprecated, please use preload property, e.g. : state.preload");
			return this.preload;
		}
	});

	/**
	 * See {{#crossLink "springroll.State/preloaded:property"}}{{/crossLink}}
	 * @property {Boolean} assetsLoaded
	 * @deprecated since version 0.4.0
	 * @readOnly
	 */
	Object.defineProperty(BaseState.prototype, 'assetsLoaded',
	{
		get: function()
		{
			if (true) console.warn("BaseState's assetsLoaded property is now deprecated, please use preloaded property, e.g. : state.preloaded");
			return this.preloaded;
		}
	});

}(Object));