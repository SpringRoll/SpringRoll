/**
*  @module Game
*/
(function(Math){

	/**
	*  Add methods to Math
	*  @class Math
	*/

	/**
	 * Return a random int between minimum and maximum
	 * @method dist
	 * @static
	 * @param {Int} min lowest number
	 * @param {Int} max highest number
	 * @return {int} The random value
	 */
	Math.getRandomInt = function(min, max)
	{
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