/**
 *	@module Tasks
 *	@namespace springroll
 *	@requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		TaskManager = include('springroll.TaskManager'),
		LoadTask = include('springroll.LoadTask');

	/**
	 *	Create an app plugin for Hinting, all properties and methods documented
	 *	in this class are mixed-in to the main Application
	 *	@class ConfigPlugin
	 *	@extends springroll.ApplicationPlugin
	 */
	var ConfigPlugin = function()
	{
		ApplicationPlugin.call(this);

		// After loader, befor sound
		this.priority = 8;
	};

	// Reference to the prototype
	var p = extend(ConfigPlugin, ApplicationPlugin);

	/**
	 *	The game has finished loading
	 *	@event loaded
	 */

	/**
	 *	The config has finished loading, in case you want to
	 *	add additional tasks to the manager after this.
	 *	@event configLoaded
	 *	@param {Object} config The JSON object for config
	 *	@param {TaskManager} manager The task manager
	 */

	/**
	 *	The game has started loading
	 *	@event loading
	 *	@param {Array} tasks The list of tasks to preload
	 */

	// Init the animator
	p.setup = function()
	{
		/**
		 *	The path to the config file to load
		 *	@property {String} options.configPath
		 *	@default 'assets/config/config.json'
		 */
		this.options.add('configPath', 'assets/config/config.json', true);

		/**
		 *	The game configuration loaded from and external JSON file
		 *	@property {Object} config
		 */
		this.config = null;
	};

	// async
	p.preload = function(done)
	{
		var tasks = [];

		// If there's a config path then add it
		if (this.options.configPath)
		{
			tasks.push(new LoadTask(
				'config',
				this.options.configPath,
				onConfigLoaded.bind(this)
			));
		}

		//Allow extending game to add additional tasks
		this.trigger('loading', tasks);

		// Load the tasks
		TaskManager.process(tasks, onTasksComplete.bind(this, done));
	};

	/**
	 *	Callback when the config is loaded
	 *	@method onConfigLoaded
	 *	@private
	 *	@param {springroll.LoaderResult} result The Loader result from the load task
	 */
	var onConfigLoaded = function(result, task, manager)
	{
		var config = this.config = result.content;
		this.trigger('configLoaded', config, manager);
	};

	/**
	 *	Callback when tasks are completed
	 *	@method onTasksComplete
	 *	@private
	 */
	var onTasksComplete = function(done)
	{
		//Ready to initialize
		this.trigger('loaded');

		done();
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.config = null;
	};

	// register plugin
	ApplicationPlugin.register(ConfigPlugin);

}());