/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		StringFilters = include('springroll.StringFilters');

	/**
	 * Create an app plugin for String Filters, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class StringFiltersPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var StringFiltersPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(StringFiltersPlugin, ApplicationPlugin);

	// Init the animator
	p.init = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.StringFilters} filters
		 */
		this.filters = new StringFilters();
	};

	// Destroy the animator
	p.destroy = function()
	{
		this.filters.destroy();
		this.filters = null;
	};

	// register plugin
	ApplicationPlugin.register(StringFiltersPlugin);

}());