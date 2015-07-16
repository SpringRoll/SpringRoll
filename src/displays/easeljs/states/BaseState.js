/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	var State = include('springroll.State'),
		Debug,
		Application,
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
	 * @param {Boolean} [options.useManifest=true] Automatically load and unload assets 
	 *       which are found in the manifest option or property.
	 * @param {Array} [options.manifest=[]] The list of object to load and unload.
	 * @param {Object} [options.scaling=null] The scaling items to use with the ScaleManager. 
	 *       See `ScaleManager.addItems` for more information about the
	 *       format of the scaling objects.
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
		 * Reference to the main app
		 * @property {Application} app
		 * @protected
		 * @readOnly
		 */
		this.app = Application.instance;

		/**
		 * The instance of the VOPlayer
		 * @property {springroll.VOPlayer} voPlayer
		 * @protected
		 * @readOnly
		 */
		this.voPlayer = this.app.voPlayer;

		/**
		 * The instance of the Sound
		 * @property {springroll.Sound} sound
		 * @protected
		 * @readOnly
		 */
		this.sound = this.app.sound;

		/**
		 * Reference to the main config object
		 * @property {Object} config
		 * @protected
		 * @readOnly
		 */
		this.config = this.app.config;

		/**
		 * Reference to the scaling object
		 * @property {springroll.UIScaler} scaling
		 * @protected
		 * @readOnly
		 */
		this.scaling = this.app.scaling;

		/**
		 * The items to scale on the panel, see `UIScaler.addItems` for
		 * more information. If no options are set in the State's constructor
		 * then it will try to find an object on the app config on `scaling` property
		 * matching the same state alias. For instance `config.scaling.title` if
		 * `title` is the state alias. If no scalingItems are set, will scale
		 * and position the panal itself.
		 * @property {Object} scalingItems
		 * @protected
		 * @readOnly
		 * @default null
		 */
		this.scalingItems = options.scaling || null;

		/**
		 * The assets to load each time
		 * @property {Object} manifest
		 * @protected
		 */
		this.manifest = options.manifest;

		/**
		 * Check to see if the assets have finished loading
		 * @property {Boolean} assetsLoaded
		 * @protected
		 * @readOnly
		 */
		this.assetsLoaded = false;

		/**
		 * If a manifest specific to this state should be automatically loaded by default.
		 * @property {Boolean} useManifest
		 * @protected
		 */
		this.useManifest = options.useManifest;
	};

	// Reference to the parent prototype
	var s = State.prototype;

	// Reference to current prototype
	var p = extend(BaseState, State);

	/**
	 * Enter the state, when the panel is fully hidden
	 * by the transition
	 * @method enter
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
		if (assets.length)
		{
			this.app.load(assets, {
				complete: this._onLoaded.bind(this),
				cacheAll: true
			});
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
	 * Implementation specific for override. When you need to add additional preload
	 * tasks to your state, override this function.
	 * @method addTasks
	 * @protected
	 * @param {Array} tasks The list of preload tasks
	 */
	p.addTasks = function(tasks)
	{
		// Implementation specific
	};

	/**
	 * Implementation specific for override. When all the assets have been loaded
	 * can possible add options for loading assets.
	 * @method onAssetsLoaded
	 * @protected
	 */
	p.onAssetsLoaded = function()
	{
		// Implementation specific
	};

	/**
	 * The internal call for on assets loaded
	 * @method _onLoaded
	 * @protected
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
	 * Don't use after calling this
	 * @method destroy
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