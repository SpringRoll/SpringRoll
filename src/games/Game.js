/**
*  @module cloudkid
*/
(function(undefined){

	//Library depencencies
	var Application = include('cloudkid.Application'),
		LoadTask,
		TaskManager;

	/**
	*  A game extends the main application and provides some game specific convenience function 
	*  and additional events. Most importantly it provides preload functionalty though the state
	*  manager. Assume loading a single configuration JSON file.
	*  @class Game
	*  @extends Application
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*/
	var Game = function(options)
	{
		LoadTask = include('cloudkid.LoadTask');
		TaskManager = include('cloudkid.TaskManager');

		// Override the updateTween Application default
		if (options.updateTween === undefined)
		{
			options.updateTween = true;
		}

		Application.call(this, options);

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {string} name
		*  @default "Untitled"
		*/
		this.name = options.name || "Untitled";

		/**
		*  The game configuration loaded from and external JSON file
		*  @property {object} config
		*/
		this.config = null;

		/**
		*  If the current brower is mobile
		*  @property {boolean} isMobile
		*/
		if (DEBUG && options.forceMobile !== undefined)
		{
			this.isMobile = !!options.forceMobile;
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

		// Listen for when the application is initalized
		onInit = onInit.bind(this);
		this.on('init', onInit);
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
	*  The game has started loading
	*  @event loading
	*  @param {array} tasks The list of tasks to preload
	*/
	var LOADING = 'loading';

	/**
	*  Callback when the sound has been initialized
	*  @method onSoundReady
	*  @private
	*/
	var onInit = function()
	{
		this.off('init', onInit);
		
		var tasks = [
			new LoadTask(
				"config", 
				this.options.configPath || "assets/config/config.json", 
				onConfigLoaded.bind(this)
			)
		];

		// Allow extending game to add additional tasks
		this.trigger(LOADING, tasks);

		TaskManager.process(tasks, onTasksComplete.bind(this));
	};

	/**
	 *
	 *  @param {Object} Results from the load task
	 */
	var onConfigLoaded = function(result)
	{
		this.config = result.content;
	};

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onTasksComplete = function()
	{
		this.trigger(LOADED);
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
		return "[Game '" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('cloudkid').Game = Game;

}());