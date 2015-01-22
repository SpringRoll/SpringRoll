/**
 * @module Core
 */
(function(Math)
{
	/**
	 * Add methods to Math
	 * @class Math
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method randomInt
	 * @static
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method getRandomInt
	 * @static
	 * @deprecated
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */
	Math.randomInt = Math.getRandomInt = function(min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/**
	 * Return dist between two points
	 * @method dist
	 * @static
	 * @param {Number|Point|Object} x
	 * 		The x position of the first point,
	 *		or a Point|Object with x and y values
	 * @param {Number|Point|Object} y
	 *		The y position of the first point,
	 * 		or a Point|Object with x and y values
	 * @param {Number} x0 The x position of the second point
	 * @param {Number} y0 The y position of the second point
	 * @return {Number} The distance
	 */
	Math.dist = function(x, y, x0, y0)
	{
		if (x.x !== undefined && !isNaN(x.x))
		{
			// If parameter 'x' has a value of .x, and that value is 
			// a valid number, assume we are using sending through 
			// two points or two objects that each have an .x and .y value
			var p1 = x;
			var p2 = y;

			var twoParamDist = Math.sqrt((p1.x -= p2.x) * p1.x + (p1.y -= p2.y) * p1.y);
			return twoParamDist;
		}

		var fourParamDist = Math.sqrt((x -= x0) * x + (y -= y0) * y);
		return fourParamDist;
	};
}(Math));