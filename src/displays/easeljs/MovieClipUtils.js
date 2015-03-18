/**
 * @module EaselJS Utilities
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function()
{
	/**
	 * Utility methods for dealing with createjs movieclips
	 * @class MovieClipUtils
	 */
	var MovieClipUtils = {};

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away
	 * @method gotoAndCache
	 * @static
	 * @param {createjs.MovieClip} movieClip The movieclip
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=15] The space around the nominal bounds to include in cache image
	 */
	MovieClipUtils.gotoAndCache = function(movieClip, frame, buffer)
	{
		frame = (frame === undefined) ? 0 : frame;
		buffer = (buffer === undefined) ? 15 : buffer;
		if (movieClip.timeline)
		{
			movieClip.gotoAndStop(frame);
		}
		var bounds = movieClip.nominalBounds;
		movieClip.cache(
			bounds.x - buffer,
			bounds.y - buffer,
			bounds.width + (buffer * 2),
			bounds.height + (buffer * 2),
			1
		);
	};

	//assign to namespace
	namespace('springroll').MovieClipUtils = MovieClipUtils;
	namespace('springroll.easeljs').MovieClipUtils = MovieClipUtils;

}());