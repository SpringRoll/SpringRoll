/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var Application = include('springroll.Application'),
		LoadTask,
		TaskManager;

	/**
	*  A game extends the main application and provides some game specific convenience function
	*  and additional events. Most importantly it provides preload functionalty though the state
	*  manager. Assume loading a single configuration JSON file.
	*  @example
		var game = new springroll.Game();
		game.on('loaded', function(){
			// Ready to use!
		});
	*  @class Game
	*  @extends springroll.Application
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile=false] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number:
	* 		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding "?v="
	*		to the end of each file path requested. Use for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file requests
	*		this is a great way to load all load requests with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add a maximum aspect ratio.
	*         This allows for "title-safe" responsiveness. Must be greater than the original aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging,
	*		the debug module must be included to use this feature. Can be an IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var Game = function(options)
	{
		LoadTask = include('springroll.LoadTask');
		TaskManager = include('springroll.TaskManager');

		Application.call(this, Object.merge({
			updateTween : true,
			name : 'Untitled',
			forceMobile : false,
			configPath : 'assets/config/config.json'
		}, options));

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {string} name
		*  @default "Untitled"
		*/
		this.name = this.options.name;

		/**
		*  The game configuration loaded from and external JSON file
		*  @property {object} config
		*/
		this.config = null;

		/**
		*  If the current brower is mobile
		*  @property {boolean} isMobile
		*/
		if (DEBUG && this.options.forceMobile)
		{
			this.isMobile = true;
		}
		else
		{
			// Auto detect the mobile browser
			// normally we'd use touch but the pointer events
			// in Internet Explorer mess that up, so we're
			// looking for specific browser.
			var agent = navigator.userAgent;
			this.isIOS = agent.search(/iPhone|iPad|iPod/) > -1;
			this.isMobile = this.isIOS || agent.search(/Android|Blackberry/) > -1;
		}

		// Callback right before init is called
		this.once('beforeInit', onBeforeInit.bind(this));
	};

	// Extend application
	var s = Application.prototype;
	var p = Game.prototype = Object.create(s);

	/**
	*  The game has finished loading
	*  @event loaded
	*/
	var LOADED = 'loaded';

	/**
	*  The config has finished loading, in case you want to
	*  add additional tasks to the manager after this.
	*  @event configLoaded
	*  @param {object} config The JSON object for config
	*  @param {TaskManager} manager The task manager
	*/
	var CONFIG_LOADED = 'configLoaded';

	/**
	*  The game has started loading
	*  @event loading
	*  @param {array} tasks The list of tasks to preload
	*/
	var LOADING = 'loading';

	/**
	*  Override the do init method
	*  @method onBeforeInit
	*  @protected
	*/
	var onBeforeInit = function()
	{
		this._readyToInit = false;

		var tasks = [
			new LoadTask(
				"config",
				this.options.configPath,
				onConfigLoaded.bind(this)
			)
		];

		// Allow extending game to add additional tasks
		this.trigger(LOADING, tasks);

		TaskManager.process(tasks, onTasksComplete.bind(this));
	};

	/**
	 *  Callback when the config is loaded
	 *  @param {LoaderResult} result The Loader result from the load task
	 */
	var onConfigLoaded = function(result, task, manager)
	{
		this.config = result.content;
		this.trigger(CONFIG_LOADED, this.config, manager);
	};

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onTasksComplete = function()
	{
		this._readyToInit = true;
		this.trigger(LOADED);
		Application.prototype._doInit.call(this);
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.config = null;

		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[Game name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('springroll').Game = Game;

}());