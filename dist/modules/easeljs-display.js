/*! SpringRoll 0.3.0 */
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
/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	// Try to include MovieClip, movieclip with CreateJS is 
	// an optional library from easeljs. We should try to 
	// include it and silently fail if we don't have it
	var MovieClip = include('createjs.MovieClip', false);

	if (!MovieClip) return;

	/**
	 * Mixins for the CreateJS MovieClip class
	 * @class MovieClip
	 */
	var p = MovieClip.prototype;

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away
	 * @method gotoAndCacheByBounds
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=15] The space around the nominal bounds to include in cache image
	 */
	p.gotoAndCacheByBounds = function(frame, buffer)
	{
		frame = (frame === undefined) ? 0 : frame;
		this.gotoAndStop(frame);
		this.cacheByBounds(buffer);
	};

}());
/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	/**
	*  Mixins for the CreateJS Point class, which include methods
	*  for calculating the dot product, length, distance, normalize, etc.
	*  @class Point
	*/
	
	var p = include("createjs.Point").prototype;
	
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
		if(l > maxLength)
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
	
}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires  Core
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
	*  @default createjs.Circle
	*/
	DisplayAdapter.Circle = include('createjs.Circle', false);

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default createjs.Ellipse
	*/
	DisplayAdapter.Ellipse = include('createjs.Ellipse', false);

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default createjs.Rectangle
	*/
	DisplayAdapter.Rectangle = include('createjs.Rectangle');

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default createjs.Sector
	*/
	DisplayAdapter.Sector = include('createjs.Sector', false);

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default createjs.Point
	*/
	DisplayAdapter.Point = include('createjs.Point');

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default createjs.Polygon
	*/
	DisplayAdapter.Polygon = include('createjs.Polygon', false);

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default false
	*/
	DisplayAdapter.useRadians = false;

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
		var bounds;
		if(object.nominalBounds)
		{
			//start by using nominal bounds, if it was exported from Flash, since it
			//should be fast and pretty accurate
			bounds = object.nominalBounds.clone();
		}
		else if(object.width !== undefined && object.height !== undefined)
		{
			//next check for a width and height that someone might have set up,
			//like our Button class has.
			//this also needs to take into account the registration point, as that affects the
			//positioning of the art
			var actW = object.width / object.scaleX;
			var actH = object.height / object.scaleY;
			bounds = new createjs.Rectangle(-object.regX, -object.regY, actW, actH);
		}
		else
		{
			//finally fall back to using EaselJS's getBounds().
			if(object.getLocalBounds)
			{
				bounds = object.getLocalBounds();
				if(bounds)
					bounds = bounds.clone();//clone the rectangle in case it gets changed
			}
			if(!bounds)//make sure we actually got a rectangle, if getLocalBounds failed for some reason
				bounds = new createjs.Rectangle();
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	*  Normalize the object scale
	*  @method getScale
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {String} [direction] Either "x" or "y" to return a specific value
	*  @return {object|Number} A scale object with x and y keys or a single number if direction is set
	*/
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object["scale" + direction.toUpperCase()];
		}
		return {
			x : object.scaleX,
			y : object.scaleY
		};
	};

	/**
	*  Normalize the object position setting
	*  @method setPosition
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {object|Number} position The position object or the value
	* 		if the direction is set.
	*  @param {Number} [position.x] The x value
	*  @param {Number} [position.y] The y value
	*  @param {String} [direction] Either "x" or "y" value
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object[direction] = position;
		}
		else
		{
			if (position.x !== undefined) object.x = position.x;
			if (position.y !== undefined) object.y = position.y;
		}
		return object;
	};

	/**
	*  Normalize the object position getting
	*  @method getPosition
	*  @static
	*  @param {createjs.DisplayObject} object The createjs display object
	*  @param {String} [direction] Either "x" or "y", default is an object of both
	*  @return {Object|Number} The position as an object with x and y keys if no direction
	*		value is set, or the value of the specific direction
	*/
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object[direction];
		}
		return {
			x : object.x,
			y : object.y
		};
	};

	/**
	*  Normalize the object scale setting
	*  @method setScale
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {Number} scale The scaling object or scale value for x and y
	*  @param {String} [direction] Either "x" or "y" if setting a specific value, default
	* 		sets both the scale x and scale y.
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object["scale" + direction.toUpperCase()] = scale;
		}
		else
		{
			object.scaleX = object.scaleY = scale;
		}
		return object;
	};

	/**
	*  Set the pivot or registration point of an object
	*  @method setPivot
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {object|Number} pivot The object pivot point or the value if the direction is set
	*  @param {Number} [pivot.x] The x position of the pivot point
	*  @param {Number} [pivot.y] The y position of the pivot point
	*  @param {String} [direction] Either "x" or "y" the value for specific direction, default
	* 		will set using the object.
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object["reg" + direction.toUpperCase()] = pivot;
		}
		object.regX = pivot.x;
		object.regY = pivot.y;
		return object;
	};

	/**
	*  Set the hit area of the shape
	*  @method setHitArea
	*  @static
	*  @param {createjs.DisplayObject} object The createjs Display object
	*  @param {Object} shape The geometry object
	*  @return {createjs.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitShape = shape;
		return object;
	};

	/**
	*  Get the original size of a bitmap
	*  @method getBitmapSize
	*  @static
	*  @param {createjs.Bitmap} bitmap The bitmap to measure
	*  @return {object} The width (w) and height (h) of the actual bitmap size
	*/
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		var rtn = {w:0, h:0};
		if(bitmap.nominalBounds)
		{
			//start by using nominal bounds, if it was exported from Flash, since it
			//should be fast and pretty accurate
			rtn.w = bitmap.nominalBounds.width;
			rtn.h = bitmap.nominalBounds.height;
		}
		else if(bitmap.width !== undefined && bitmap.height !== undefined)
		{
			//next check for a width and height that someone might have set up,
			//like our Button class has.
			rtn.w = bitmap.width;
			rtn.h = bitmap.height;
		}
		else if(bitmap.sourceRect)
		{
			rtn.w = bitmap.sourceRect.width;
			rtn.h = bitmap.sourceRect.height;
		}
		else if(bitmap.image)
		{
			rtn.w = bitmap.image.width;
			rtn.h = bitmap.image.height;
		}
		return rtn;
	};

	/**
	*  Remove all children from a display object
	*  @method removeChildren
	*  @static
	*  @param {createjs.Container} container The display object container
	*/
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeAllChildren();
	};

	// Assign to namespace
	namespace('springroll.easeljs').DisplayAdapter = DisplayAdapter;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(undefined){

	// Import createjs classes
	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage,
		Touch;

	/**
	*   EaselJSDisplay is a display plugin for the springroll Framework
	*	that uses the EaselJS library for rendering.
	*
	*   @class EaselJSDisplay
	*   @extends springroll.AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the EaselJS stage.
	*	@param {String} [options.stageType="stage"] If the stage should be a normal stage or a SpriteStage (use "spriteStage").
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To disable them, use 0 or -1.
	*/
	var EaselJSDisplay = function(id, options)
	{
		if (!Stage)
		{
			Stage = include('createjs.Stage');
			Touch = include('createjs.Touch');
		}

		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		*  The rate at which EaselJS calculates mouseover events, in times/second.
		*  @property {int} mouseOverRate
		*  @public
		*  @default 30
		*/
		this.mouseOverRate = options.mouseOverRate || 30;
		
		/**
		*  If the display should keep mouse move events running when the display is disabled.
		*  @property {Boolean} keepMouseover
		*  @public
		*/
		this.keepMouseover = options.keepMouseover || false;

		if (options.stageType == "spriteStage")
		{
			//TODO: make a sprite stage (not officially released yet)
			// this.stage = new SpriteStage(id);
		}
		else
		{
			/**
			*  The rendering library's stage element, the root display object
			*  @property {createjs.Stage|createjs.SpriteStage} stage
			*  @readOnly
			*  @public
			*/
			this.stage = new Stage(id);
		}
		this.stage.autoClear = !!options.clearView;

		this.animator = include('springroll.easeljs.Animator', false);
		this.adapter = include('springroll.easeljs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = extend(EaselJSDisplay, AbstractDisplay);
	
	/**
	 * An internal helper to avoid creating an object each render
	 * while telling EaselJS the amount of time elapsed.
	 * @property DELTA_HELPER
	 * @static
	 * @private
	 */
	var DELTA_HELPER = {delta:0};

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);
			
			if(value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				Touch.enable(this.stage);
			}
			else
			{
				if(this.keepMouseover)
				{
					this.stage.enableDOMEvents("keepMove");
				}
				else
				{
					this.stage.enableMouseOver(false);
					this.stage.enableDOMEvents(false);
				}
				Touch.disable(this.stage);
				//reset the cursor if it isn't disabled
				if(this.canvas.style.cursor != "none")
					this.canvas.style.cursor = "";
			}
		}
	});

	/**
	* Updates the stage and draws it. This is only called by the Application.
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	* @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	*/
	p.render = function(elapsed, force)
	{
		if (force || (!this.paused && this._visible))
		{
			DELTA_HELPER.delta = elapsed;
			this.stage.update(DELTA_HELPER);
		}
	};

	/**
	*  Destroys the display. This method is called by the Application and should
	*  not be called directly, use Application.removeDisplay(id).
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.stage.removeAllChildren(true);
		
		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').EaselJSDisplay = EaselJSDisplay;
	namespace('springroll.easeljs').EaselJSDisplay = EaselJSDisplay;

}());