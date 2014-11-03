/**
*  @module Interface
*  @namespace springroll
*/
(function(undefined){

	/**
	*  Initially layouts all interface elements
	*  @class Positioner
	*  @static
	*/
	var Positioner = {};
	
	// Conversion of degrees to radians
	var DEG_TO_RAD = Math.PI / 180;

	/**
	*  Initial position a single item
	*  @method initItem
	*  @static
	*  @param {DisplayObject} item The display object to scale
	*  @param {Object} settings The values for setting
	*  @param {Number} [settings.x] The initial X position of the item
	*  @param {Number} [settings.y] The initial Y position of the item
	*  @param {Object} [settings.scale] The initial scale
	*  @param {Number} [settings.scale.x] The initial scale X value
	*  @param {Number} [settings.scale.y] The initial scale Y value
	*  @param {Object} [settings.pivot] The pivot point
	*  @param {Number} [settings.pivot.x] The pivot point X location
	*  @param {Number} [settings.pivot.y] The pivot point Y location
	*  @param {Number} [settings.rotation] The initial rotation in degrees
	*  @param {Object|Array} [settings.hitArea] An object which describes the hit area
	*                                           of the item or an array of points.
	*  @param {String} [settings.hitArea.type] If the hitArea is an object, the type of hit area,
	*                                          "rect", "ellipse", "circle", etc
	*  @param {DisplayAdapter} [adapter] The adapter for the display being positioned in. If
	*                                    omitted, uses the Application's default display.
	*/
	Positioner.initItem = function(item, settings, adapter)
	{
		//get the default adapter if not specified
		if(!adapter)
			adapter = springroll.UIScaler._getAdapter();
		
		if (settings.x !== undefined)
		{
			adapter.setPosition(item, settings.x, 'x');
		}
			
		if (settings.y !== undefined)
		{
			adapter.setPosition(item, settings.y, 'y');
		}
			
		var pt = settings.scale;
		var scale = adapter.getScale(item);

		if (pt)
		{
			adapter.setScale(item, pt.x * scale.x, "x");
			adapter.setScale(item, pt.y * scale.y, "y");
		}
		pt = settings.pivot;

		if (pt)
		{
			adapter.setPivot(item, pt);
		}

		if (settings.rotation !== undefined)
		{
			item.rotation = settings.rotation;
			if (adapter.useRadians)
			{
				item.rotation *= DEG_TO_RAD;
			}
		}

		if (settings.hitArea)
		{
			adapter.setHitArea(
				item,
				Positioner.generateHitArea(
					settings.hitArea, 1, adapter
				)
			);
		}
	};
	
	/**
	*  Create the polygon hit area for interface elements
	*  @static
	*  @method generateHitArea
	*  @param {Object|Array} hitArea One of the following: <br/>
	*  * An array of points for a polygon, e.g.
	*
	*		[{x:0, y:0}, {x:0, y:20}, {x:20, y:0}]
	*
	*  * An object describing a rectangle, e.g.
	*
	*		{type:"rect", x:0, y:0, w:10, h:30}
	*
	*  * An object describing an ellipse, where x and y are the center, e.g.
	*
	*		{type:"ellipse", x:0, y:0, w:10, h:30}
	*
	*  * An object describing a circle, where x and y are the center, e.g.
	*
	*		{type:"circle", x:0, y:0, r:20}
	*  * An object describing a sector, where x and y are the center of a circle
	*		and start/end are the start and end angles of the sector in degrees, e.g.
	*
	*		{type:"sector", x:0, y:0, r:20, start:0, end:90}
	*  @param {Number} scale The size to scale hitArea by
	*  @param {Display} adapter The current display adapter for creating Polygon, Point,
	*                           Rectangle, Ellipse, Circle
	*  @return {Object} A geometric shape object for hit testing, either a Polygon, Rectangle,
	*                     Ellipse, Circle, or Sector, depending on the hitArea object. The shape
	*                     will have a contains() function for hit testing.
	*  @param {DisplayAdapter} [adapter] The adapter for the display being positioned in. If
	*                                    omitted, uses the Application's default display.
	*/
	Positioner.generateHitArea = function(hitArea, scale, adapter)
	{
		//get the default adapter if not specified
		if(!adapter)
			adapter = springroll.UIScaler._getAdapter();
		if (!scale) scale = 1;

		if (Array.isArray(hitArea))
		{
			if (scale == 1)
			{
				return new adapter.Polygon(hitArea);
			}
			else
			{
				var temp = [];
				for(var i = 0, len = hitArea.length; i < len; ++i)
				{
					temp.push(new adapter.Point(
						hitArea[i].x * scale,
						hitArea[i].y * scale
					));
				}
				return new adapter.Polygon(temp);
			}
		}
		else if (hitArea.type == "rect" || !hitArea.type)
		{
			return new adapter.Rectangle(
				hitArea.x * scale,
				hitArea.y * scale,
				hitArea.w * scale,
				hitArea.h * scale
			);
		}
		else if (hitArea.type == "ellipse")
		{
			//convert center to upper left corner
			return new adapter.Ellipse(
				(hitArea.x - hitArea.w * 0.5) * scale,
				(hitArea.y - hitArea.h * 0.5) * scale,
				hitArea.w * scale,
				hitArea.h * scale
			);
		}
		else if (hitArea.type == "circle")
		{
			return new adapter.Circle(
				hitArea.x * scale,
				hitArea.y * scale,
				hitArea.r * scale
			);
		}
		else if (hitArea.type == "sector")
		{
			return new adapter.Sector(
				hitArea.x * scale,
				hitArea.y * scale,
				hitArea.r * scale,
				hitArea.start,
				hitArea.end
			);
		}
		return null;
	};
	
	// Assign to namespace
	namespace('springroll').Positioner = Positioner;

}());