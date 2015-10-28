/**
 * @module PIXI Display
 * @namespace springroll.pixi
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
	DisplayAdapter.Circle = include('PIXI.Circle');

	/**
	 * The geometry class for Ellipse
	 * @property {Function} Ellipse
	 * @readOnly
	 * @static
	 * @default PIXI.Ellipse
	 */
	DisplayAdapter.Ellipse = include('PIXI.Ellipse');

	/**
	 * The geometry class for Rectangle
	 * @property {Function} Rectangle
	 * @readOnly
	 * @static
	 * @default PIXI.Rectangle
	 */
	DisplayAdapter.Rectangle = include('PIXI.Rectangle');

	/**
	 * The geometry class for Sector
	 * @property {Function} Sector
	 * @readOnly
	 * @static
	 * @default PIXI.Sector
	 */
	DisplayAdapter.Sector = include('PIXI.Sector');

	/**
	 * The geometry class for point
	 * @property {Function} Point
	 * @readOnly
	 * @static
	 * @default PIXI.Point
	 */
	DisplayAdapter.Point = include('PIXI.Point');

	/**
	 * The geometry class for Polygon
	 * @property {Function} Polygon
	 * @readOnly
	 * @static
	 * @default PIXI.Polygon
	 */
	DisplayAdapter.Polygon = include('PIXI.Polygon');

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
	 * @param {PIXI.DisplayObject} object The createjs display object
	 * @return {PIXI.Rectangle} A rectangle with additional right and bottom properties.
	 */
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds;
		var width = object.width;
		var height = object.height;
		if (width && height)
		{
			bounds = new PIXI.Rectangle(-object.pivot.x, -object.pivot.y, width / object.scale.x, height / object.scale.y);
		}
		else
		{
			bounds = new PIXI.Rectangle();
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	 * Normalize the object scale
	 * @method getScale
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {String} [direction] Either "x" or "y" to return a specific value
	 * @return {object|Number} A scale object with x and y keys or a single number if direction is set
	 */
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.scale[direction];
		}
		return object.scale;
	};

	/**
	 * Normalize the object position setting
	 * @method setPosition
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {object|Number} position The position object or the value
	 * 		if the direction is set.
	 * @param {Number} [position.x] The x value
	 * @param {Number} [position.y] The y value
	 * @param {String} [direction] Either "x" or "y" value
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object.position[direction] = position;
		}
		else
		{
			if (position.x !== undefined) object.position.x = position.x;
			if (position.y !== undefined) object.position.y = position.y;
		}
		return object;
	};

	/**
	 * Normalize the object position getting
	 * @method getPosition
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {String} [direction] Either "x" or "y", default is an object of both
	 * @return {Object|Number} The position as an object with x and y keys if no direction
	 *		value is set, or the value of the specific direction
	 */
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.position[direction];
		}
		return object.position;
	};

	/**
	 * Normalize the object scale setting
	 * @method setScale
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {Number} scale The scaling object or scale value for x and y
	 * @param {String} [direction] Either "x" or "y" if setting a specific value, default
	 * 		sets both the scale x and scale y.
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object.scale[direction] = scale;
		}
		else
		{
			object.scale.x = object.scale.y = scale;
		}
		return object;
	};

	/**
	 * Set the pivot or registration point of an object
	 * @method setPivot
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {object|Number} pivot The object pivot point or the value if the direction is set
	 * @param {Number} [pivot.x] The x position of the pivot point
	 * @param {Number} [pivot.y] The y position of the pivot point
	 * @param {String} [direction] Either "x" or "y" the value for specific direction, default
	 * 		will set using the object.
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object.pivot[direction] = pivot;
		}
		object.pivot = pivot;
		return object;
	};

	/**
	 * Set the hit area of the shape
	 * @method setHitArea
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {Object} shape The geometry object
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitArea = shape;
		return object;
	};

	/**
	 * Get the original size of a bitmap
	 * @method getBitmapSize
	 * @static
	 * @param {PIXI.Bitmap} bitmap The bitmap to measure
	 * @return {object} The width (w) and height (h) of the actual bitmap size
	 */
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			h: bitmap.height / bitmap.scale.y,
			w: bitmap.width / bitmap.scale.x
		};
	};

	/**
	 * Remove all children from a display object
	 * @method removeChildren
	 * @static
	 * @param {PIXI.DisplayObjectContainer} container The display object container
	 */
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeChildren();
	};

	/**
	 * If a container contains a child
	 * @method contains
	 * @static
	 * @param  {PIXI.DisplayObjectContainer} container The container
	 * @param  {PIXI.DisplayObject} child  The object to test
	 * @return {Boolean} If the child contained within the container
	 */
	DisplayAdapter.contains = function(container, child)
	{
		while (child)
		{
			if (child == container)
			{
				return true;
			}
			child = child.parent;
		}
		return false;
	};

	// Assign to namespace
	namespace('springroll.pixi').DisplayAdapter = DisplayAdapter;

}());