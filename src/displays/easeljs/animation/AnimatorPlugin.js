/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Animator = include('springroll.easeljs.Animator');

	/**
	 * Create an app plugin for Animator, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class AnimatorPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var AnimatorPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(AnimatorPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		Animator.init();
		Animator.captions = this.captions || null;
	};

	// Destroy the animator
	p.teardown = function()
	{
		Animator.destroy();
	};

	// register plugin
	ApplicationPlugin.register(AnimatorPlugin);

}());