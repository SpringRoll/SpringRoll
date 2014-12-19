/**
 *  @module Core
 */
(function(Math)
{
	/**
	 *  Add methods to Math
	 *  @class Math
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * @method getRandomInt
	 * @static
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */
	Math.getRandomInt = function(min, max)
	{
		/*  OVERRIDE
		 *  allow single-parameter use, where min is
		 *  assumed to be 0, and max is the supplied single-parameter
		 *  i.e. function(max) {
		 *      return <value between 0 and parameter>
		 *  }
		 */
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
	Math.dist = function(x, y, x0, y0)
	{
		return Math.sqrt((x -= x0) * x + (y -= y0) * y);
	};

}(Math));
