/**
*  @module Native Display
*  @namespace springroll.native
*/
(function(undefined){
	
	/**
	*  Provide a normalized way to get size, position, scale values
	*  as well as provide reference for different geometry classes.
	*  @class DisplayAdapter
	*/
	var DisplayAdapter = {};

	/**
	*  The geometry class for Circle
	*  @property {Function} Circle
	*  @readOnly
	*  @static
	*  @default PIXI.Circle
	*/
	DisplayAdapter.Circle = include('springroll.native.Circle');

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default PIXI.Ellipse
	*/
	DisplayAdapter.Ellipse = include('springroll.native.Ellipse');

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default PIXI.Rectangle
	*/
	DisplayAdapter.Rectangle = include('springroll.native.Rectangle');

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default PIXI.Sector
	*/
	DisplayAdapter.Sector = null;

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default PIXI.Point
	*/
	DisplayAdapter.Point = include('springroll.native.Point');

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default PIXI.Polygon
	*/
	DisplayAdapter.Polygon = include('springroll.native.Polygon');

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default true
	*/
	DisplayAdapter.useRadians = true;

	/**
	*  Gets the object's boundaries in its local coordinate space, without any scaling or
	*  rotation applied.
	*  @method getLocalBounds
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @return {createjs.Rectangle} A rectangle with additional right and bottom properties.
	*/
	DisplayAdapter.getLocalBounds = function(object)
	{
		// Not implemented
		return {};
	};

	/**
	*  Normalize the object scale
	*  @method getScale
	*  @static
	*  @param {DisplayObject} object The display object
	*  @param {String} [direction] Either "x" or "y" to return a specific value
	*  @return {object|Number} A scale object with x and y keys or a single number if direction is set
	*/
	DisplayAdapter.getScale = function(object, direction)
	{
		// Not implemented
		return {x:1,y:1};
	};

	/**
	*  Normalize the object position setting
	*  @method setPosition
	*  @static
	*  @param {DisplayObject} object The display object
	*  @param {object|Number} position The position object or the value
	* 		if the direction is set.
	*  @param {Number} [position.x] The x value
	*  @param {Number} [position.y] The y value
	*  @param {String} [direction] Either "x" or "y" value
	*  @return {DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		// Not implemented
		return object;
	};

	/**
	*  Normalize the object position getting
	*  @method getPosition
	*  @static
	*  @param {DisplayObject} object The display object
	*  @param {String} [direction] Either "x" or "y", default is an object of both
	*  @return {Object|Number} The position as an object with x and y keys if no direction
	*		value is set, or the value of the specific direction
	*/
	DisplayAdapter.getPosition = function(object, direction)
	{
		// Not implemented
	};

	/**
	*  Normalize the object scale setting
	*  @method setScale
	*  @static
	*  @param {DisplayObject} object The Display object
	*  @param {Number} scale The scaling object or scale value for x and y
	*  @param {String} [direction] Either "x" or "y" if setting a specific value, default
	* 		sets both the scale x and scale y.
	*  @return {DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		// Not implemented
	};

	/**
	*  Set the pivot or registration point of an object
	*  @method setPivot
	*  @static
	*  @param {DisplayObject} object The Display object
	*  @param {object|Number} pivot The object pivot point or the value if the direction is set
	*  @param {Number} [pivot.x] The x position of the pivot point
	*  @param {Number} [pivot.y] The y position of the pivot point
	*  @param {String} [direction] Either "x" or "y" the value for specific direction, default
	* 		will set using the object.
	*  @return {DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		// Not implemented
	};

	/**
	*  Set the hit area of the shape
	*  @method setHitArea
	*  @static
	*  @param {DisplayObject} object The  Display object
	*  @param {Object} shape The geometry object
	*  @return {DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setHitArea = function(object, shape)
	{
		// Not implemented
	};

	/**
	*  Get the original size of a bitmap
	*  @method getBitmapSize
	*  @static
	*  @param {DOMElement} bitmap The bitmap to measure
	*  @return {object} The width (w) and height (h) of the actual bitmap size
	*/
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			w : bitmap.width,
			h : bitmap.height
		};
	};

	/**
	*  Remove all children from a display object
	*  @method removeChildren
	*  @static
	*  @param {DisplayObjectContainer} container The display object container
	*/
	DisplayAdapter.removeChildren = function(container)
	{
		// Not implemented
	};

	// Assign to namespace
	namespace('springroll.native').DisplayAdapter = DisplayAdapter;

}());