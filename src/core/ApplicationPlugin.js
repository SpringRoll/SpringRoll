/**
  * @module Core
  * @namespace springroll
 */
(function()
{
	var Application;

	/**
	 * Responsible for creating properties, methods to 
	 * the SpringRoll Application when it's created.
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

		/**
		 * When the application is being initialized. This function 
		 * is bound to the application. This should be overridden.
		 * @property {function} setup
		 * @protected
		 */
		this.setup = function(){};

		/**
		 * The function to call right before the app is initailized. 
		 * This function is bound to the application. `preload` takes
		 * a single parameter which is a call back to call when
		 * the asyncronous event is completed.
		 * @property {function} preload 
		 * @protected
		 */
		this.preload = null;

		/**
		 * When the application is being destroyed. This function 
		 * is bound to the application. This should be overridden.
		 * @property {function} teardown
		 * @protected
		 */
		this.teardown = function(){};

		// Add the plugin to application
		Application._plugins.push(this);
		Application._plugins.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	// Assign to namespace
	namespace('springroll').ApplicationPlugin = ApplicationPlugin;

}());