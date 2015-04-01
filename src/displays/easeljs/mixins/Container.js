/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	// Try to include Container, movieclip with CreateJS is 
	// an optional library from easeljs. We should try to 
	// include it and silently fail if we don't have it
	var Container = include('createjs.Container', false);

	if (!Container) return;

	/**
	 * Mixins for the CreateJS Container class
	 * @class Container
	 */
	var p = Container.prototype;

	/**
	 * Does a cache by the nominalBounds set from flash
	 * @method cacheByBounds
	 * @param {int} [buffer=15] The space around the nominal bounds to include in cache image
	 */
	p.cacheByBounds = function(buffer)
	{
		buffer = (buffer === undefined) ? 15 : buffer;
		var bounds = this.nominalBounds;
		this.cache(
			bounds.x - buffer,
			bounds.y - buffer,
			bounds.width + (buffer * 2),
			bounds.height + (buffer * 2),
			1
		);
	};

}());