/**
 * @module Languages
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Languages = include('springroll.Languages');

	/**
	 * Create an app plugin for Language, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LanguagesPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LanguagesPlugin = function()
	{
		ApplicationPlugin.call(this);
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
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.languages.destroy();
		this.languages = null;
	};

	// register plugin
	ApplicationPlugin.register(LanguagesPlugin);

}());