/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	// Try to include MovieClip, movieclip with CreateJS is
	// an optional library from easeljs. We should try to
	// include it and silently fail if we don't have it
	var MovieClip = include('createjs.MovieClip', false);

	if (!MovieClip) return;

	/**
	 * Mixins for the CreateJS MovieClip class
	 * @class MovieClip
	 */
	var p = MovieClip.prototype;

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away. This caches by the bounds
	 * exported from Flash, preferring frameBounds and falling back to nominalBounds.
	 * @method gotoAndCacheByBounds
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=0] The space around the bounds to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.gotoAndCacheByBounds = function(frame, buffer, scale)
	{
		frame = (frame === undefined) ? 0 : frame;
		this.gotoAndStop(frame);
		var rect = this.frameBounds ? this.frameBounds[this.currentFrame] : this.nominalBounds;
		if (rect) //only cache if there is content on this frame
			this.cacheByRect(rect, buffer, scale);
		else
			this.uncache(); //prevent leftover cached data from showing up on empty frames
	};

}());