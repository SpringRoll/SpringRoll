/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	/**
	 * Create an app plugin for String Filters, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class StringFiltersPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = mixin({}, 'springroll.ApplicationPlugin', 110);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.StringFilters} filters
		 */
		var StringFilters = include('springroll.StringFilters');
		this.filters = new StringFilters();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.filters) this.filters.destroy();
		this.filters = null;
	};

	// register plugin
	plugin.register();

}());