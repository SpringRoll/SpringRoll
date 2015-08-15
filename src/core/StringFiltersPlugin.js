/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(110);

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

}());