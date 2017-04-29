/*! SpringRoll 1.0.3 */
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function()
{
	/**
	 * The Circle object can be used to specify a hit area for displayobjects
	 *
	 * @class Circle
	 * @constructor
	 * @param x {Number} The X coord of the upper-left corner of the framing rectangle of this circle
	 * @param y {Number} The Y coord of the upper-left corner of the framing rectangle of this circle
	 * @param radius {Number} The radius of the circle
	 */
	var Circle = function(x, y, radius)
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
		 * @property radius
		 * @type Number
		 * @default 0
		 */
		this.radius = radius || 0;
	};

	var p = extend(Circle);

	/**
	 * Creates a clone of this Circle instance
	 *
	 * @method clone
	 * @return {Circle} a copy of the polygon
	 */
	p.clone = function()
	{
		return new Circle(this.x, this.y, this.radius);
	};

	/**
	 * Checks if the x, and y coords passed to this function are contained within this circle
	 *
	 * @method contains
	 * @param x {Number} The X coord of the point to test
	 * @param y {Number} The Y coord of the point to test
	 * @return {Boolean} if the x/y coords are within this polygon
	 */
	p.contains = function(x, y)
	{
		if (this.radius <= 0)
			return false;

		var dx = (this.x - x),
			dy = (this.y - y),
			r2 = this.radius * this.radius;

		dx *= dx;
		dy *= dy;

		return (dx + dy <= r2);
	};

	// constructor
	p.constructor = Circle;

	// Assign to namespace
	namespace('springroll.native').Circle = Circle;

}());
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function()
{
	/**
	 * The Ellipse object can be used to specify a hit area for displayobjects
	 *
	 * @class Ellipse
	 * @constructor
	 * @param x {Number} The X coord of the upper-left corner of the framing rectangle of this ellipse
	 * @param y {Number} The Y coord of the upper-left corner of the framing rectangle of this ellipse
	 * @param width {Number} The overall width of this ellipse
	 * @param height {Number} The overall height of this ellipse
	 */
	var Ellipse = function(x, y, width, height)
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

	var p = extend(Ellipse);

	/**
	 * Creates a clone of this Ellipse instance
	 *
	 * @method clone
	 * @return {Ellipse} a copy of the ellipse
	 */
	p.clone = function()
	{
		return new Ellipse(this.x, this.y, this.width, this.height);
	};

	/**
	 * Checks if the x, and y coords passed to this function are contained within this ellipse
	 *
	 * @method contains
	 * @param x {Number} The X coord of the point to test
	 * @param y {Number} The Y coord of the point to test
	 * @return {Boolean} if the x/y coords are within this ellipse
	 */
	p.contains = function(x, y)
	{
		if (this.width <= 0 || this.height <= 0)
			return false;

		//normalize the coords to an ellipse with center 0,0
		//and a radius of 0.5
		var normx = ((x - this.x) / this.width) - 0.5,
			normy = ((y - this.y) / this.height) - 0.5;

		normx *= normx;
		normy *= normy;

		return (normx + normy < 0.25);
	};

	Ellipse.getBounds = function()
	{
		return new Rectangle(this.x, this.y, this.width, this.height);
	};

	// constructor
	p.constructor = Ellipse;

	// Assign to namespace
	namespace('springroll.native').Ellipse = Ellipse;

}());
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function()
{
	/**
	 * The Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
	 *
	 * @class Point
	 * @constructor
	 * @param x {Number} position of the point
	 * @param y {Number} position of the point
	 */
	var Point = function(x, y)
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
	};

	var p = extend(Point);

	/**
	 * Creates a clone of this point
	 *
	 * @method clone
	 * @return {Point} a copy of the point
	 */
	p.clone = function()
	{
		return new Point(this.x, this.y);
	};

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
	 * creates a serializable form of this object so it may be saved or passed via Bellhop.
	 * Note that it adds a special property named `__classname` to tell the Reviver
	 * how to restore a pristine `Object`
	 * @method toJSON
	 * @return {Object} serializable object
	 */
	p.toJSON = function()
	{
		return {
			__classname: "springroll.native.Point",
			x: this.x,
			y: this.y
		};
	};

	/**
	 * Works with a reviver function to restore from a native Object 
	 * to an instance of this type.
	 * @param  {Object} inputObj serialized object
	 * @method fromJSON
	 */
	p.fromJSON = function(inputObj)
	{
		this.x = inputObj.x;
		this.y = inputObj.y;
	};

	p.toString = function()
	{
		return "(" + this.x + ", " + this.y + ")";
	};

	// constructor
	p.constructor = Point;

	// Assign to namespace
	namespace('springroll.native').Point = Point;

}());
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function()
{
	/**
	 * @class Polygon
	 * @constructor
	 * @param points* {Array<Point>|Array<Number>|Point...|Number...} This can be an array of Points that form the polygon,
	 *     a flat array of numbers that will be interpreted as [x,y, x,y, ...], or the arguments passed can be
	 *     all the points of the polygon e.g. `new Polygon(new Point(), new Point(), ...)`, or the
	 *     arguments passed can be flat x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are
	 *     Numbers.
	 */
	var Polygon = function(points)
	{
		//if points isn't an array, use arguments as the array
		if (!(points instanceof Array))
			points = Array.prototype.slice.call(arguments);

		//if this is a flat array of numbers, convert it to points
		if (typeof points[0] === 'number')
		{
			var p = [];
			for (var i = 0, len = points.length; i < len; i += 2)
			{
				p.push(
					new Point(points[i], points[i + 1])
				);
			}

			points = p;
		}

		this.points = points;
	};

	var p = extend(Polygon);

	/**
	 * Creates a clone of this polygon
	 *
	 * @method clone
	 * @return {Polygon} a copy of the polygon
	 */
	p.clone = function()
	{
		var points = [];
		for (var i = 0, len = this.points.length; i < len; i++)
		{
			points.push(this.points[i].clone());
		}

		return new Polygon(points);
	};

	/**
	 * Checks if the x, and y coords passed to this function are contained within this polygon
	 *
	 * @method contains
	 * @param x {Number} The X coord of the point to test
	 * @param y {Number} The Y coord of the point to test
	 * @return {Boolean} if the x/y coords are within this polygon
	 */
	p.contains = function(x, y)
	{
		var inside = false;

		// use some raycasting to test hits
		// https://github.com/substack/point-in-polygon/blob/master/index.js
		var p = this.points;

		var pi, pj, xi, yi, xj, yj, intersect;
		for (var i = 0, len = p.length, j = p.length - 1; i < len; j = i++)
		{
			pi = p[i];
			pj = p[j];
			xi = pi.x;
			yi = pi.y;
			xj = pj.x;
			yj = pj.y;
			intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

			if (intersect) inside = !inside;
		}

		return inside;
	};

	// constructor
	p.constructor = Polygon;

	// Assign to namespace
	namespace('springroll.native').Polygon = Polygon;

}());
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

	var p = extend(Rectangle);

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
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function(undefined)
{

	/**
	 * Provide a normalized way to get size, position, scale values
	 * as well as provide reference for different geometry classes.
	 * @class DisplayAdapter
	 */
	var DisplayAdapter = {};

	/**
	 * The geometry class for Circle
	 * @property {Function} Circle
	 * @readOnly
	 * @static
	 * @default PIXI.Circle
	 */
	DisplayAdapter.Circle = include('springroll.native.Circle');

	/**
	 * The geometry class for Ellipse
	 * @property {Function} Ellipse
	 * @readOnly
	 * @static
	 * @default PIXI.Ellipse
	 */
	DisplayAdapter.Ellipse = include('springroll.native.Ellipse');

	/**
	 * The geometry class for Rectangle
	 * @property {Function} Rectangle
	 * @readOnly
	 * @static
	 * @default PIXI.Rectangle
	 */
	DisplayAdapter.Rectangle = include('springroll.native.Rectangle');

	/**
	 * The geometry class for Sector
	 * @property {Function} Sector
	 * @readOnly
	 * @static
	 * @default PIXI.Sector
	 */
	DisplayAdapter.Sector = null;

	/**
	 * The geometry class for point
	 * @property {Function} Point
	 * @readOnly
	 * @static
	 * @default PIXI.Point
	 */
	DisplayAdapter.Point = include('springroll.native.Point');

	/**
	 * The geometry class for Polygon
	 * @property {Function} Polygon
	 * @readOnly
	 * @static
	 * @default PIXI.Polygon
	 */
	DisplayAdapter.Polygon = include('springroll.native.Polygon');

	/**
	 * If the rotation is expressed in radians
	 * @property {Boolean} useRadians
	 * @readOnly
	 * @static
	 * @default true
	 */
	DisplayAdapter.useRadians = true;

	/**
	 * Gets the object's boundaries in its local coordinate space, without any scaling or
	 * rotation applied.
	 * @method getLocalBounds
	 * @static
	 * @param {createjs.DisplayObject} object The createjs display object
	 * @return {createjs.Rectangle} A rectangle with additional right and bottom properties.
	 */
	DisplayAdapter.getLocalBounds = function(object)
	{
		// Not implemented
		return {};
	};

	/**
	 * Normalize the object scale
	 * @method getScale
	 * @static
	 * @param {DisplayObject} object The display object
	 * @param {String} [direction] Either "x" or "y" to return a specific value
	 * @return {object|Number} A scale object with x and y keys or a single number if direction is set
	 */
	DisplayAdapter.getScale = function(object, direction)
	{
		// Not implemented
		return {
			x: 1,
			y: 1
		};
	};

	/**
	 * Normalize the object position setting
	 * @method setPosition
	 * @static
	 * @param {DisplayObject} object The display object
	 * @param {object|Number} position The position object or the value
	 * 		if the direction is set.
	 * @param {Number} [position.x] The x value
	 * @param {Number} [position.y] The y value
	 * @param {String} [direction] Either "x" or "y" value
	 * @return {DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		// Not implemented
		return object;
	};

	/**
	 * Normalize the object position getting
	 * @method getPosition
	 * @static
	 * @param {DisplayObject} object The display object
	 * @param {String} [direction] Either "x" or "y", default is an object of both
	 * @return {Object|Number} The position as an object with x and y keys if no direction
	 *		value is set, or the value of the specific direction
	 */
	DisplayAdapter.getPosition = function(object, direction)
	{
		// Not implemented
	};

	/**
	 * Normalize the object scale setting
	 * @method setScale
	 * @static
	 * @param {DisplayObject} object The Display object
	 * @param {Number} scale The scaling object or scale value for x and y
	 * @param {String} [direction] Either "x" or "y" if setting a specific value, default
	 * 		sets both the scale x and scale y.
	 * @return {DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		// Not implemented
	};

	/**
	 * Set the pivot or registration point of an object
	 * @method setPivot
	 * @static
	 * @param {DisplayObject} object The Display object
	 * @param {object|Number} pivot The object pivot point or the value if the direction is set
	 * @param {Number} [pivot.x] The x position of the pivot point
	 * @param {Number} [pivot.y] The y position of the pivot point
	 * @param {String} [direction] Either "x" or "y" the value for specific direction, default
	 * 		will set using the object.
	 * @return {DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		// Not implemented
	};

	/**
	 * Set the hit area of the shape
	 * @method setHitArea
	 * @static
	 * @param {DisplayObject} object The  Display object
	 * @param {Object} shape The geometry object
	 * @return {DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setHitArea = function(object, shape)
	{
		// Not implemented
	};

	/**
	 * Get the original size of a bitmap
	 * @method getBitmapSize
	 * @static
	 * @param {DOMElement} bitmap The bitmap to measure
	 * @return {object} The width (w) and height (h) of the actual bitmap size
	 */
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			w: bitmap.width,
			h: bitmap.height
		};
	};

	/**
	 * Remove all children from a display object
	 * @method removeChildren
	 * @static
	 * @param {DisplayObjectContainer} container The display object container
	 */
	DisplayAdapter.removeChildren = function(container)
	{
		// Not implemented
	};

	// Assign to namespace
	namespace('springroll.native').DisplayAdapter = DisplayAdapter;

}());
/**
 * @module Native Display
 * @namespace springroll.native
 * @requires Core
 */
(function(undefined)
{

	var AbstractDisplay = include('springroll.AbstractDisplay');

	/**
	 * NativeDisplay is a display plugin for doing native rendering. This represents
	 * the bare minimum needed by the Application to render.
	 *
	 * @class NativeDisplay
	 * @extends springroll.AbstractDisplay
	 *	@constructor
	 *	@param {String} id The id of the canvas element on the page to draw to.
	 *	@param {Object} options The setup data for the display.
	 * @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	 */
	var NativeDisplay = function(id, options)
	{
		AbstractDisplay.call(this, id, options);

		options = options ||
		{};

		/**
		 * The main rendering context, typically either `CanvasRenderingContext2d` 
		 * or `WebGLRenderingContext`
		 * @property {RenderingContext}
		 * @readOnly
		 * @public
		 */
		this.stage = this.canvas.getContext(options.contextId || "2d");

		// Add the display adapter
		this.adapter = include('springroll.native.DisplayAdapter');
	};

	AbstractDisplay.extend(NativeDisplay);

	// Assign to the global namespace
	namespace('springroll').NativeDisplay = NativeDisplay;
	namespace('springroll.native').NativeDisplay = NativeDisplay;

}());