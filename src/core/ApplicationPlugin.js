/**
 *  @module Core
 *  @namespace springroll
 */
(function()
{
	var Application;

	/**
	* Responsible for creating mixins, bindings, and setup for the SpringRoll Application
	* @class ApplicationPlugin
	*/
	var ApplicationPlugin = function(priority)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
		}
		
		/**
		 * The priority of the plugin. Higher numbers handled first. This should be set
		 * in the constructor of the extending ApplicationPlugin.
		 * @property {int} priority
		 * @default 0
		 */
		this.priority = priority || 0;
	};

	// reference to prototype
	var p = ApplicationPlugin.prototype;

	/**
	 * When the application is being initialized. This function is bound to the application.
	 * @method setup
	 */
	p.setup = function()
	{
		// implementation specific
	};

	/**
	 * The function to call right before the app is initailized. This function is bound to the application.
	 * @method preload 
	 * @param {function} done The done function, takes one argument for an error.
	 */
	p.preload = null;

	/**
	 * When the application is being destroyed. This function is bound to the application.
	 * @method teardown
	 */
	p.teardown = function()
	{
		// implementation specific
	};

	/**
	 * Register the plugin with the Application
	 * @method register
	 */
	p.register = function()
	{
		Application._plugins.push(this);
		Application._plugins.sort(prioritySort);
	};

	/**
	 * Comparator function for sorting the plugins by priority
	 * @method prioritySort
	 * @private
	 * @param {springroll.ApplicationPlugin} a First plugin
	 * @param {springroll.ApplicationPlugin} b Second plugin
	 */
	function prioritySort(a, b)
	{
		return b.priority - a.priority;
	}

	// Assign to namespace
	namespace('springroll').ApplicationPlugin = ApplicationPlugin;

}());