/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var MovieClip = include('createjs.MovieClip');
	var AnimatorInstance = include('springroll.AnimatorInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class MovieClipInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 * @constructor
	 * @param {createjs.MovieClip} clip
	 */
	var MovieClipInstance = function(clip)
	{
		AnimatorInstance.call(this, clip);

		// Make sure the clip is disabled
		clip.tickEnabled = false;
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	MovieClipInstance.test = function(clip)
	{
		return clip instanceof MovieClip;
	};

	extend(MovieClipInstance, AnimatorInstance);

	// Assign to namespace
	namespace('springroll.easeljs').MovieClipInstance = MovieClipInstance;

}());