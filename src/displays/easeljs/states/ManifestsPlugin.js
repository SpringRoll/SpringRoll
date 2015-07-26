/**
 * @module EaselJS States
 * @namespace springroll.easeljs
 * @requires Core, States, UI, Sound, EaselJS Display, EaselJS UI
 */
(function(undefined)
{
	// Import classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug,
		BaseState;

	/**
	 * A createjs-based Game to load manifests
	 * @class ManifestsPlugin
	 * @extends springroll.ApplicationPlugin
	 * @param {int} [options.fps=30] The framerate to use for the main display
	 * @param {Function} [options.display=springroll.easeljsDisplay] The
	 * display class to use as the default display.
	 * @param {Boolean} [options.displayOptions.clearView=true] If the stage view
	 * should be cleared everytime in CreateJS stage.
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
		this.options.override('displayOptions', { clearView: true });
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
				assets.push({
					id: "manifests",
					src: manifestsPath,
					complete: onManifestsLoaded.bind(this)
				});
			}
			else if (DEBUG && Debug)
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