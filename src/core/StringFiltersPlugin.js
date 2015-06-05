/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for String Filters, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class StringFiltersPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var StringFiltersPlugin = function()
	{
		ApplicationPlugin.call(this);

		this.priority = 110;
	};

	// Reference to the prototype
	var p = extend(StringFiltersPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.StringFilters} filters
		 */
		var StringFilters = include('springroll.StringFilters');
		this.filters = new StringFilters();
	};

	// Destroy the animator
	p.teardown = function()
	{
		if (this.filters) this.filters.destroy();
		this.filters = null;
	};

	// register plugin
	ApplicationPlugin.register(StringFiltersPlugin);

}());