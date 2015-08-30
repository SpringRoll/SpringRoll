/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var MovieClip = include('createjs.MovieClip');
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var GenericMovieClipInstance = include('springroll.GenericMovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class MovieClipInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 */
	var MovieClipInstance = function()
	{
		GenericMovieClipInstance.call(this);
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
	
	MovieClipInstance.hasAnimation = GenericMovieClipInstance.hasAnimation;
	MovieClipInstance.getDuration = GenericMovieClipInstance.getDuration;

	// Inherit the AnimatorInstance
	var s = AnimatorInstance.prototype;
	var p = AnimatorInstance.extend(MovieClipInstance, GenericMovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').MovieClipInstance = MovieClipInstance;

}());