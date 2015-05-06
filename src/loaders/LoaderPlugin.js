/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Loader = include('springroll.Loader');

	/**
	 * Create an app plugin for Loader
	 * @class LoaderPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LoaderPlugin = function(){};

	// Reference to the prototype
	var p = extend(LoaderPlugin, ApplicationPlugin);

	// Init the animator
	p.init = Loader.init;

	// Destroy the animator
	p.destroy = function()
	{
		Loader.instance.destroy();
	};

	// register plugin
	ApplicationPlugin.register(LoaderPlugin);

}());