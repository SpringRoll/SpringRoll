/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip');
	var GenericMovieClipInstance = include('springroll.GenericMovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class BitmapMovieClipInstance
	 * @extends springroll.GenericMovieClipInstance
	 * @private
	 */
	var BitmapMovieClipInstance = function()
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
	BitmapMovieClipInstance.test = function(clip)
	{
		return clip instanceof BitmapMovieClip;
	};
	
	BitmapMovieClipInstance.hasAnimation = GenericMovieClipInstance.hasAnimation;
	BitmapMovieClipInstance.getDuration = GenericMovieClipInstance.getDuration;

	// Extend class
	AnimatorInstance.extend(BitmapMovieClipInstance, GenericMovieClipInstance);

	// Assign to namespace
	namespace('springroll.easeljs').BitmapMovieClipInstance = BitmapMovieClipInstance;

}());