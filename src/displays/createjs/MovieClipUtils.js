/**
*  @module cloudkid.createjs
*/
(function()
{
	/**
	 * Utility methods for dealing with createjs movieclips
	 * @class createjs.MovieClipUtils
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
		movieClip.gotoAndStop(frame);
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
	namespace('cloudkid').MovieClipUtils = MovieClipUtils;
	namespace('cloudkid.createjs').MovieClipUtils = MovieClipUtils;

}());