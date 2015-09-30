/**
 * @module Core
 * @namespace springroll
 */
(function(window)
{

	// Include the window.performance object
	var performance = include('performance', false);

	// See if we have performance.now or any of
	// the brower-specific versions
	var now = performance && (
		performance.now ||
		performance.mozNow ||
		performance.msNow ||
		performance.oNow ||
		performance.webkitNow
	);

	// Browser prefix polyfill
	if (now) performance.now = now;

	/**
	 * A collection of Time related utility functions
	 * @class TimeUtils
	 */
	var TimeUtils = {};

	/**
	 * This method gets timestamp in micromilliseconds for doing performance
	 * intense operations. Fallback support is to `Date.now()`. We aren't overridding
	 * `performance.now()` incase dependencies on this actually demand 
	 * the optimization and accuracy that performance actually provides.
	 * @static
	 * @method now
	 * @return {int} The number of micromilliseconds of the current timestamp
	 */
	TimeUtils.now = !now ? Date.now : function()
	{
		return performance.now();
	};

	// Assign to namespace
	namespace('springroll').TimeUtils = TimeUtils;

}(window));