/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip');
	var MovieClipInstance = include('springroll.easeljs.MovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class BitmapMovieClipInstance
	 * @extends springroll.easeljs.MovieClipInstance
	 * @private
	 */
	var BitmapMovieClipInstance = function()
	{
		MovieClipInstance.call(this);
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	BitmapMovieClipInstance.test = function(clip)
	{
		return clip instanceof BitmapMovieClip;
	};

	// Extend class
	AnimatorInstance.extend(BitmapMovieClipInstance, MovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipInstance = BitmapMovieClipInstance;

}());