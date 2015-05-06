/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Animator = include('springroll.pixi.Animator');

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
	p.init = function()
	{
		Animator.init();
	};

	// Destroy the animator
	p.destroy = function()
	{
		Animator.destroy();
	};

	// register plugin
	ApplicationPlugin.register(AnimatorPlugin);

}());