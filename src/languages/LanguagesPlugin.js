/**
 * @module Languages
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Languages = include('springroll.Languages'), 
		Debug;

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(95);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.Languages} languages
		 */
		this.languages = new Languages();

		/**
		 * Force a specific language
		 * @property {String} options.language
		 * @default null
		 */
		this.options.add('language', null, true);

		/**
		 * The path to the languages configuration file
		 * @property {String} options.languagesPath
		 * @default null
		 */
		this.options.add('languagesPath', null, true);
	};

	// preload the language configuration
	plugin.preload = function(done)
	{
		var languagesConfig = this.options.languagesPath;
		if (languagesConfig)
		{
			this.load(languagesConfig, function(config)
			{
				this.languages.setConfig(config);
				var lang = this.options.language;
				if (lang)
				{
					this.languages.setLanguage(lang);
				}
				done();
			}
			.bind(this));
		}
		else
		{
			Debug = include('springroll.Debug', false);
			if (DEBUG && Debug)
			{
				Debug.info("Application option 'languagesPath' is empty, set to automatically load languages configuration.");
			}
			done();
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.languages) this.languages.destroy();
		this.languages = null;
	};

}());