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
	 * Create an app plugin for Animator
	 * @class AnimatorPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var AnimatorPlugin = function(){};

	// Reference to the prototype
	var p = extend(AnimatorPlugin, ApplicationPlugin);

	// Init the animator
	p.init = Animator.init;

	// Destroy the animator
	p.destroy = Animator.destroy;

	// register plugin
	ApplicationPlugin.register(AnimatorPlugin);

}());