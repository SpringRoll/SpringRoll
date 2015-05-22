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
	 * Create an app plugin for Language, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LanguagesPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LanguagesPlugin = function()
	{
		ApplicationPlugin.call(this);
		this.priority = 95; 
	};

	// Reference to the prototype
	var p = extend(LanguagesPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
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
	p.preload = function(done)
	{
		var config = this.options.languagesPath;
		if (config)
		{
			this.loader.load(config, function(result)
			{
				this.languages.setConfig(result.content);
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
	p.teardown = function()
	{
		if (this.languages) this.languages.destroy();
		this.languages = null;
	};

	// register plugin
	ApplicationPlugin.register(LanguagesPlugin);

}());