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

		options = options || {};

		if (options.manifest)
		{
			options.preload = options.manifest;
			if (DEBUG && Debug)
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

		// @deprecated Method to handle on assets loaded
		this.on('loaded', this.onAssetsLoaded)

		// @deprecated method for adding assets dynamically to task
		.on('preloading', function(assets)
		{
			console.warn('addTasks has been deprecated, use assetsLoading event instead: e.g., state.on(\'assetsLoading\', function(assets){})');
			this.addTasks(assets);
		})

		// Handle when assets are preloaded
		.on('preloaded', function(assets)
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
		})
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
		});
	};

	// Reference to the parent prototype
	var s = State.prototype;

	// Reference to current prototype
	var p = extend(BaseState, State);

	/**
	 * Implementation specific for override. When you need to add additional preload
	 * tasks to your state, override this function.
	 * @method addTasks
	 * @see {@link springroll.State#preloading}
	 * @deprecated since 0.4.0
	 * @protected
	 * @param {Array} tasks The list of preload tasks
	 */
	p.addTasks = function()
	{
		// Implementation specific
	};

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