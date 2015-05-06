/**
 *  @module Core
 *  @namespace springroll
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	* Responsible for creating mixins, bindings, and setup for the SpringRoll Application
	* @class ApplicationPlugin
	*/
	var ApplicationPlugin = function()
	{
		/**
		 * Reference to the application
		 * @property {springroll.Application} app
		 */
		this.app = null;
	};

	// reference to prototype
	var p = ApplicationPlugin.prototype;

	/**
	 * When the application is being initialized
	 * @method init
	 */
	p.init = function()
	{
		// implementation specific
	};

	/**
	 * When the application is being destroyed
	 * @method destroy
	 */
	p.destroy = function()
	{
		// implementation specific
	};

	/**
	 * Register the plugin with the Application
	 * @method register
	 * @static
	 */
	ApplicationPlugin.register = function(func)
	{
		var plugin = new func();
		Application._plugins.push(plugin);
	};

	// Assign to namespace
	namespace('springroll').ApplicationPlugin = ApplicationPlugin;

}());