/**
 * @module Translate
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Language = include('springroll.Language');

	/**
	 * Create an app plugin for Language, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LanguagePlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LanguagePlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(LanguagePlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.Language} translating
		 */
		this.translating = new Language();
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.translating.destroy();
		this.translating = null;
	};

	// register plugin
	ApplicationPlugin.register(LanguagePlugin);

}());