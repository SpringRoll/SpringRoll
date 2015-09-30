/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function()
{
	/**
	 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
	 *
	 * @class Rectangle
	 * @constructor
	 * @param x {Number} The X coord of the upper-left corner of the rectangle
	 * @param y {Number} The Y coord of the upper-left corner of the rectangle
	 * @param width {Number} The overall width of this rectangle
	 * @param height {Number} The overall height of this rectangle
	 */
	var Rectangle = function(x, y, width, height)
	{
		/**
		 * @property x
		 * @type Number
		 * @default 0
		 */
		this.x = x || 0;

		/**
		 * @property y
		 * @type Number
		 * @default 0
		 */
		this.y = y || 0;

		/**
		 * @property width
		 * @type Number
		 * @default 0
		 */
		this.width = width || 0;

		/**
		 * @property height
		 * @type Number
		 * @default 0
		 */
		this.height = height || 0;
	};

	var p = Rectangle.prototype;

	/**
	 * Creates a clone of this Rectangle
	 *
	 * @method clone
	 * @return {Rectangle} a copy of the rectangle
	 */
	p.clone = function()
	{
		return new Rectangle(this.x, this.y, this.width, this.height);
	};

	/**
	 * Checks if the x, and y coords passed to this function are contained within this Rectangle
	 *
	 * @method contains
	 * @param x {Number} The X coord of the point to test
	 * @param y {Number} The Y coord of the point to test
	 * @return {Boolean} if the x/y coords are within this Rectangle
	 */
	p.contains = function(x, y)
	{
		if (this.width <= 0 || this.height <= 0)
			return false;

		var x1 = this.x;
		if (x >= x1 && x <= x1 + this.width)
		{
			var y1 = this.y;

			if (y >= y1 && y <= y1 + this.height)
			{
				return true;
			}
		}

		return false;
	};

	p.toString = function()
	{
		return "(" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + ")";
	};

	// constructor
	p.constructor = Rectangle;

	// Assign to namespace
	namespace('springroll.native').Rectangle = Rectangle;

}());