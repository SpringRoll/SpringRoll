/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI Point class, which include methods
	 *  for calculating the dot product, length, distance, normalize, etc.
	 *  @class Point
	 */

	var Point = include("PIXI.Point", false);
	if (!Point) return;

	var p = Point.prototype;

	/**
	 * Returns the dot product between this point and another one.
	 * @method dotProd
	 * @param other {Point} The point to form a dot product with
	 * @return The dot product between the two points.
	 */
	p.dotProd = function(other)
	{
		return this.x * other.x + this.y * other.y;
	};

	/**
	 * Returns the length (or magnitude) of this point.
	 * @method length
	 * @return The length of this point.
	 */
	p.length = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	/**
	 * Returns the squared length (or magnitude) of this point. This is faster than length().
	 * @method lengthSq
	 * @return The length squared of this point.
	 */
	p.lengthSq = function()
	{
		return this.x * this.x + this.y * this.y;
	};

	/**
	 * Reduces the point to a length of 1.
	 * @method normalize
	 */
	p.normalize = function()
	{
		var oneOverLen = 1 / this.length();
		this.x *= oneOverLen;
		this.y *= oneOverLen;
	};

	/**
	 * Subtracts the x and y values of a point from this point.
	 * @method subtract
	 * @param other {Point} The point to subtract from this one
	 */
	p.subtract = function(other)
	{
		this.x -= other.x;
		this.y -= other.y;
	};

	/**
	 * Adds the x and y values of a point to this point.
	 * @method add
	 * @param other {Point} The point to add to this one
	 */
	p.add = function(other)
	{
		this.x += other.x;
		this.y += other.y;
	};

	/**
	 * Truncate the length of the point to a maximum.
	 * @method truncate
	 * @param maxLength {Number} The maximum length to allow in this point.
	 */
	p.truncate = function(maxLength)
	{
		var l = this.length();
		if (l > maxLength)
		{
			var maxOverLen = maxLength / l;
			this.x *= maxOverLen;
			this.y *= maxOverLen;
		}
	};

	/**
	 * Multiplies the x and y values of this point by a value.
	 * @method scaleBy
	 * @param value {Number} The value to scale by.
	 */
	p.scaleBy = function(value)
	{
		this.x *= value;
		this.y *= value;
	};

	/**
	 * Calculates the distance between this and another point.
	 * @method distance
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance.
	 */
	p.distance = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	};

	/**
	 * Calculates the squared distance between this and another point.
	 * @method distanceSq
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance squared.
	 */
	p.distanceSq = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return xDiff * xDiff + yDiff * yDiff;
	};

	Point.localToGlobal = function(displayObject, localX, localY, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = localX;
		outPoint.y = localY;
		return displayObject.toGlobal(outPoint, outPoint);
	};

	Point.globalToLocal = function(displayObject, globalX, globalY, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = globalX;
		outPoint.y = globalY;
		return displayObject.toLocal(outPoint, null, outPoint);
	};

	Point.localToLocal = function(sourceDisplayObject, targetDisplayObject, x, y, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = x;
		outPoint.y = y;
		return targetDisplayObject.toLocal(outPoint, sourceDisplayObject, outPoint);
	};

	p.toString = function()
	{
		return "(" + this.x + ", " + this.y + ")";
	};

}());