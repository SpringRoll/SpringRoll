/**
 * @module Core
 * @namespace window
 */
(function (Math)
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
	Math.randomInt = function (min, max)
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
	 * @param {Number} x The x position of the first point
	 * @param {Number} y The y position of the first point
	 * @param {Number} x0 The x position of the second point
	 * @param {Number} y0 The y position of the second point
	 * @return {Number} The distance
	 */
	
	/**
	 * Return dist between two points
	 * @method dist
	 * @static
	 * @param {Object} p1 The first point
	 * @param {Object} p1.x The x position of the first point
	 * @param {Object} p1.y The y position of the first point
	 * @param {Object} p2 The second point
	 * @param {Object} p2.x The x position of the second point
	 * @param {Number} p2.y The y position of the second point
	 * @return {Number} The distance
	 */
	Math.dist = function (x, y, x0, y0)
	{
		//see if the first parameter is a point
		if (typeof x.x == "number" && x.x == x.x) //faster !isNaN
		{
			//shift later parameters back
			y0 = x0;
			x0 = y;

			y = x.y;
			x = x.x;
		}
		//see if the 2nd parameter is a point
		if (typeof x0.x == "number" && x0.x == x0.x)
		{
			y0 = x0.y;
			x0 = x0.x;
		}
		return Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
	};

	/**
	 *	Constrain a number between 0 and a max value.
	 *	@method clamp
	 *	@static
	 *	@param {Number} value The number to be constrained.
	 *	@param {Number} max Highest number.
	 *	@return {Number} The constrained value
	 */

	/**
	 *	Constrain a number between a minimum and maximum values.
	 *	@method clamp
	 *	@static
	 *	@param {Number} value The number to be constrained.
	 *	@param {Number} min Lowest number to constrain value to.
	 *	@param {Number} max Highest number.
	 *	@return {Number} The constrained value
	 */
	Math.clamp = function (value, min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		if (value > max)
			return max;
		if (value < min)
			return min;
		return value;
	};

}(Math));