/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip');
	var MovieClipInstance = include('springroll.easeljs.MovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class BitmapMovieClipInstance
	 * @extends springroll.easeljs.MovieClipInstance
	 * @private
	 * @constructor
	 * @param {springroll.easeljs.BitmapMovieClip} clip
	 */
	var BitmapMovieClipInstance = function(clip)
	{
		MovieClipInstance.call(this, clip);
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
	extend(BitmapMovieClipInstance, MovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipInstance = BitmapMovieClipInstance;

}());