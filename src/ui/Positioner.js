/**
*  @module Interface
*  @namespace cloudkid
*/
(function() {
		
	var UIScaler = include('cloudkid.UIScaler');

	/**
	*  Initially layouts all interface elements
	*  @class Positioner
	*  @static
	*/
	var Positioner = {};
	
	/**
	*  Initial position of all layout items
	*  @method positionItems
	*  @static
	*  @param {DisplayObject} parent
	*  @param {Object} itemSettings JSON format with position information
	*  @param {Display} [display=Application.instance.display] The current display being positioned
	*/
	Positioner.positionItems = function(parent, itemSettings, display)
	{
		if(!display)
			display = cloudkid.Application.instance.display;

		var adapter = UIScaler.getAdapter(display);

		var pt, degToRad = Math.PI / 180, scale;
		for(var iName in itemSettings)
		{
			var item = parent[iName];
			if (!item)
			{
				Debug.error("Positioner: could not find object '" +  iName + "'");
				continue;
			}
			var setting = itemSettings[iName];
			if (setting.x !== undefined)
				adapter.setPosition(item, setting.x, 'x');
			if (setting.y !== undefined)
				adapter.setPosition(item, setting.y, 'y');
			pt = setting.scale;
			scale = adapter.getScale(item);
			if (pt)
			{
				adapter.setScale(item, pt.x * scale.x, "x");
				adapter.setScale(item, pt.y * scale.y, "y");
			}
			pt = setting.pivot;
			if (pt)
			{
				adapter.setPivot(item, pt);
			}
			if (setting.rotation !== undefined)
			{
				item.rotation = setting.rotation;
				if (adapter.useRadians)
				{
					item.rotation *= degToRad;
				}
			}

			if (setting.hitArea)
			{
				adapter.setHitArea(item, Positioner.generateHitArea(setting.hitArea, 1, display));
			}
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
	*  @param {Number} [scale=1] The size to scale hitArea by
	*  @param {Display} [display=Application.instance.display] The current display being positioned
	*  @return {Object} A geometric shape object for hit testing, either a Polygon, Rectangle, Ellipse, or Circle,
	*      depending on the hitArea object. The shape will have a contains() function for hit testing.
	*/
	Positioner.generateHitArea = function(hitArea, scale, display)
	{
		if(!display)
			display = cloudkid.Application.instance.display;
		
		var adapter = UIScaler.getAdapter(display);

		if (!scale) scale = 1;

		if (isArray(hitArea))
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

	var isArray = function(o)
	{
		return Object.prototype.toString.call(o) === '[object Array]';
	};
	
	// Assign to namespace
	namespace('cloudkid').Positioner = Positioner;

}());