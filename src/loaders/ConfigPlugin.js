/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug;

	/**
	 *	Create an app plugin for Hinting, all properties and methods documented
	 *	in this class are mixed-in to the main Application
	 *	@class ConfigPlugin
	 *	@extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin(80);

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
	plugin.setup = function()
	{
		Debug = include('springroll.Debug', false);

		/**
		 *	The path to the config file to load
		 *	@property {String} options.configPath
		 *	@default null
		 */
		this.options.add('configPath', null, true);

		/**
		 *	The game configuration loaded from and external JSON file
		 *	@property {Object} config
		 */
		this.config = null;
	};

	// async
	plugin.preload = function(done)
	{
		var assets = [];
		var configPath = this.options.configPath;

		// If there's a config path then add it
		if (configPath)
		{
			assets.push({
				src: configPath,
				complete: onConfigLoaded.bind(this)
			});
		}
		else if (DEBUG && Debug)
		{
			Debug.info("Application option 'configPath' is empty, set to automatically load config JSON (optional).");
		}

		//Allow extending game to add additional tasks
		this.trigger('loading', assets);

		var callback = onTasksComplete.bind(this, done);

		if (assets.length)
		{
			this.load(assets, callback);
		}
		else
		{
			callback();
		}
	};

	/**
	 *	Callback when the config is loaded
	 *	@method onConfigLoaded
	 *	@private
	 *	@param {springroll.LoaderResult} result The Loader result from the load
	 *	@param {Array} assets The array to add new load tasks to
	 */
	var onConfigLoaded = function(result, assets)
	{
		var config = this.config = result.content;
		this.trigger('configLoaded', config, assets);
	};

	/**
	 *	Callback when tasks are completed
	 *	@method onTasksComplete
	 *	@private
	 */
	var onTasksComplete = function(done)
	{
		this.trigger('loaded');
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		this.config = null;
	};

}());