/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	var Container = include('createjs.Container', false);

	if (!Container) return;

	/**
	 * Mixins for the CreateJS Container class
	 * @class Container
	 */
	var p = Container.prototype;

	/**
	 * Does a cache by the nominalBounds set from Flash
	 * @method cacheByBounds
	 * @param {int} [buffer=0] The space around the nominal bounds to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.cacheByBounds = function(buffer, scale)
	{
		this.cacheByRect(this.nominalBounds, buffer, scale);
	};

	/**
	 * Does a cache by a given rectangle
	 * @method cacheByRect
	 * @param {createjs.Rectangle} rect The rectangle to cache with.
	 * @param {int} [buffer=0] Additional space around the rectangle to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.cacheByRect = function(rect, buffer, scale)
	{
		buffer = (buffer === undefined || buffer === null) ? 0 : buffer;
		scale = scale > 0 ? scale : 1;
		this.cache(
			rect.x - buffer,
			rect.y - buffer,
			rect.width + (buffer * 2),
			rect.height + (buffer * 2),
			scale
		);
	};

}());