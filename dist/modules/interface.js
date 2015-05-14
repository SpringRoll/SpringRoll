/*! SpringRoll 0.2.2 */
/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function()
{

	// Class imports
	var UIScaler;

	/**
	*  A single UI item that needs to be resized,
	*  this is an internal class that you would not need to interact with.
	*
	*  @class UIElement
	*  @param {DisplayObject} item The item to affect
	*  @param {springroll.UIElementSettings} settings The scale settings
	*  @param {springroll.ScreenSettings} designedScreen The original screen the item was designed for
	*  @param {DisplayAdapter} adapter The display adapter
	*/
	var UIElement = function(item, settings, designedScreen, adapter)
	{
		if (!UIScaler)
		{
			UIScaler = include('springroll.UIScaler');
		}
		
		/**
		*  The reference to the interface item we're scaling
		*  @private
		*  @property {DisplayObject} _item
		*/
		this._item = item;

		/**
		*  The reference to the scale settings
		*  @private
		*  @property {UIElementSettings} _settings
		*/
		this._settings = settings;

		/**
		*  The original screen the item was designed for
		*  @private
		*  @property {ScreenSettings} _designedScreen
		*/
		this._designedScreen = designedScreen;

		/**
		*  The adapter for universal scale, rotation size access
		*  @property {Object} _adapter
		*  @private
		*/
		this._adapter = adapter;
		
		var scale = adapter.getScale(item),
			position = adapter.getPosition(item);

		/**
		*  Original X scale of the item
		*  @property {Number} origScaleX
		*  @default 0
		*/
		this.origScaleX = scale.x || 1;

		/**
		*  The original Y scale of the item
		*  @property {Number} origScaleY
		*  @default 0
		*/
		this.origScaleY = scale.y || 1;

		/**
		*  Original width in pixels
		*  @property {Number} origWidth
		*  @default 0
		*/
		this.origWidth = item.width || 0;

		/**
		*  The original bounds of the item with x, y, right, bottom, width, height properties.
		*  Used to determine the distance to each edge of the item from its origin
		*  @property {Object} origBounds
		*/
		this.origBounds = adapter.getLocalBounds(item);

		/**
		*  Original horizontal margin in pixels
		*  @property {Number} origMarginHori
		*  @default 0
		*/
		this.origMarginHori = 0;

		/**
		*  Original vertical margin in pixels
		*  @property {Number} origMarginVert
		*  @default 0
		*/
		this.origMarginVert = 0;

		switch(settings.vertAlign)
		{
			case UIScaler.ALIGN_TOP:
			{
				this.origMarginVert = position.y + this.origBounds.y * scale.y;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginVert = designedScreen.height * 0.5 - position.y;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				this.origMarginVert = designedScreen.height - (position.y + this.origBounds.bottom * scale.y);
				break;
			}
		}

		switch(settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				this.origMarginHori = position.x + this.origBounds.x * scale.x;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginHori = designedScreen.width * 0.5 - position.x;
				break;
			}
			case UIScaler.ALIGN_RIGHT:
			{
				this.origMarginHori = designedScreen.width - (position.x + this.origBounds.right * scale.x);
				break;
			}
		}
	};
	
	// Reference to the prototype
	var p = UIElement.prototype = {};

	if (true)
	{
		p.toString = function()
		{
			return "[UIElement (vertAlign='"+this._settings.vertAlign+"', horiAlign='"+this._settings.horiAlign+"')]";
		};
	}
	
	
	/**
	*  Adjust the item scale and position, to reflect new screen
	*  @method resize
	*  @param {Number} displayWidth The current screen width
	*  @param {Number} displayHeight The current screen height
	*/
	p.resize = function(displayWidth, displayHeight)
	{
		var adapter = this._adapter,
			_item = this._item,
			_settings = this._settings,
			_designedScreen = this._designedScreen,
			origBounds = this.origBounds,
			origScaleX = this.origScaleX,
			origScaleY = this.origScaleY;
		var defaultRatio = _designedScreen.width / _designedScreen.height,
			currentRatio = displayWidth / displayHeight;
		var overallScale = currentRatio >= defaultRatio ?
						displayHeight / _designedScreen.height :
						displayWidth / _designedScreen.width;
		var scaleToHeight = currentRatio >= defaultRatio,
			letterBoxWidth = 0,
			letterBoxHeight = 0;
		if(scaleToHeight)
			letterBoxWidth = (displayWidth - _designedScreen.width * overallScale) / 2;
		else
			letterBoxHeight = (displayHeight - _designedScreen.height * overallScale) / 2;

		// Optional clamps on the min and max scale of the item
		var itemScale = overallScale;
		if(_settings.minScale && itemScale < _settings.minScale)
			itemScale = _settings.minScale;
		else if(_settings.maxScale && itemScale > _settings.maxScale)
			itemScale = _settings.maxScale;

		adapter.setScale(_item, origScaleX * itemScale, "x");
		adapter.setScale(_item, origScaleY * itemScale, "y");

		// positioning
		var m, x = null, y = null;

		// vertical margin
		m = this.origMarginVert * overallScale;
		
		//determine if vertical alignment should be title safe
		var titleSafe = _settings.titleSafe === true || _settings.titleSafe === "vertical";
		
		switch(_settings.vertAlign)
		{
			case UIScaler.ALIGN_TOP:
			{
				if(titleSafe)
				{
					y = letterBoxHeight + m - origBounds.y * origScaleY * itemScale;
				}
				else
				{
					y = m - origBounds.y * origScaleY * itemScale;
				}
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				y = displayHeight * 0.5 - m;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				if(titleSafe)
				{
					y = displayHeight - letterBoxHeight - m -
							origBounds.bottom * origScaleY * itemScale;
				}
				else
				{
					y = displayHeight - m - origBounds.bottom * origScaleY * itemScale;
				}
				break;
			}
		}

		// Set the position
		if (y !== null) adapter.setPosition(_item, y, "y");

		// horizontal margin
		m = this.origMarginHori * overallScale;
		
		//determine if horizontal alignment should be title safe
		titleSafe = _settings.titleSafe === true || _settings.titleSafe === "horizontal";
		
		switch(_settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				if(titleSafe)
				{
					x = letterBoxWidth + m - origBounds.x * origScaleX * itemScale;
				}
				else
				{
					x = m - origBounds.x * origScaleX * itemScale;
				}
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				if(_settings.centeredHorizontally)
				{
					x = (displayWidth - _item.width) * 0.5;
				}
				else
				{
					x = displayWidth * 0.5 - m;
				}
				break;
			}
			case UIScaler.ALIGN_RIGHT:
			{
				if(titleSafe)
				{
					x = displayWidth - letterBoxWidth - m -
							origBounds.right * origScaleX * itemScale;
				}
				else
				{
					x = displayWidth - m - origBounds.right * origScaleX * itemScale;
				}
				break;
			}
		}

		// Set the position
		if (x !== null) adapter.setPosition(_item, x, "x");
	};
	
	/**
	*  Destroy this item, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._adapter = null;
		this.origBounds = null;
		this._item = null;
		this._settings = null;
		this._designedScreen = null;
	};
	
	// Assign to namespace
	namespace('springroll').UIElement = UIElement;

}());
/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	*  The UI Item Settings which is the positioning settings used to adjust each element,
	*  this is an internal class that you would not need to interact with.
	*  @class UIElementSettings
	*/
	var UIElementSettings = function()
	{
		/**
		*  What vertical screen location the item should be aligned to: "top", "center", "bottom"
		*  @property {String} vertAlign
		*/
		this.vertAlign = null;

		/**
		*  What horizontal screen location the item should be aligned to: "left", "center", "right"
		*  @property {String} horiAlign
		*/
		this.horiAlign = null;

		/**
		*  If this element should be aligned to the title safe area, not the actual screen.
		*  Values of "horizontal" and "vertical" make the title safe calculations take place only
		*  for one direction.
		*  @property {Boolean|String} titleSafe
		*  @default false
		*/
		this.titleSafe = false;

		/**
		*  Maximum scale allowed in physical size
		*  @property {Number} maxScale
		*  @default 1
		*/
		this.maxScale = 1;

		/**
		*  Minimum scale allowed in physical size
		*  @property {Number} minScale
		*  @default 1
		*/
		this.minScale = 1;
		
		/**
		*  If the UI element is centered horizontally
		*  @property {Boolean} centeredHorizontally
		*  @default false
		*/
		this.centeredHorizontally = false;
	};
	
	// Assign to name space
	namespace('springroll').UIElementSettings = UIElementSettings;

}());
/**
 * @module Interface
 * @namespace springroll
 * @requires Core
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
	*  @param {DisplayAdapter} [adapter] The adapter for the display being positioned in. If
	*                                    omitted, uses the Application's default display.
	*  @return {Object} A geometric shape object for hit testing, either a Polygon, Rectangle,
	*                     Ellipse, Circle, or Sector, depending on the hitArea object. The shape
	*                     will have a contains() function for hit testing.
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
/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function(undefined) {

	// Class imports
	var UIElementSettings = include('springroll.UIElementSettings'),
		UIElement = include('springroll.UIElement'),
		Positioner = include('springroll.Positioner'),
		Application = include('springroll.Application'),
		Debug;

	/**
	*  The UI scale is responsible for scaling UI components to help easy the burden of different
	*  device aspect ratios. The UI can expand either vertically or horizontally to fill excess
	*  space.
	*
	*  @class UIScaler
	*  @constructor
	*  @param {DisplayObject} parent The UI display container
	*  @param {Object} designedSize The designed settings of the interface {width:800, height:600}
	*  @param {int} designedSize.width The designed width of the interface
	*  @param {int} designedSize.height The designed height of the interface
	*  @param {int} [designedSize.maxWidth=designedSize.width] The designed maximum width of the
	*                                                          interface.
	*  @param {int} [designedSize.maxHeight=designedSize.height] The designed maximum height of the
	*                                                            interface.
	*  @param {Object} [items=null] The items object where the keys are the name of the property on
	*                               the parent and the value
	*                               is an object with keys of "titleSafe", "minScale", "maxScale",
	*                               "centerHorizontally", "align"
	*  @param {boolean} [enabled=true] If the UIScaler should be enabled by default
	*  @param {Display} [display=Application.instance.display] The display which to use for the
	*                                                          scaler
	*  @return {UIScaler} The scaler object that can be reused
	*/
	var UIScaler = function(parent, designedSize, items, enabled, display)
	{
		Debug = include('springroll.Debug', false);
		/**
		*  The UI display object to update
		*  @property {DisplayObject} _parent
		*  @private
		*/
		this._parent = parent;

		/**
		*  The configuration for each items
		*  @property {Array} _items
		*  @private
		*/
		this._items = [];

		if (!designedSize || !designedSize.width || !designedSize.height)
		{
			if (true && Debug)
			{
				Debug.error(designedSize);
				throw "Designed size parameter must be a plain object with 'width' & 'height' properties";
			}
			else
			{
				throw "Invalid design settings";
			}
		}

		/**
		*  The screen settings object, contains information about designed size
		*  @property {object} _designedSize
		*  @private
		*/
		this._designedSize = designedSize;
		
		// Allow for responsive designs if they're a max width
		var options = Application.instance.options;
		if (designedSize.maxWidth)
		{
			// Set the max width so that Application can limit the aspect ratio properly
			options.maxWidth = designedSize.maxWidth;
		}
		if(designedSize.maxHeight)
		{
			// Set the max height so that Application can limit the aspect ratio properly
			options.maxHeight = designedSize.maxHeight;
		}

		/**
		*  The current overall scale of the game
		*  @property {Number} _scale
		*  @private
		*  @default 1
		*/
		this._scale = 1;

		/**
		*  The adapter for universal scale, rotation size access
		*  @property {Object} _adapter
		*  @private
		*/
		this._adapter = UIScaler._getAdapter(display);

		/**
		*  The collection of bitmaps to full screen scale
		*  @property {Array} _backgrounds
		*  @private
		*/
		this._backgrounds = [];

		/**
		*   The internal enabled
		*   @property {boolean} _enabled
		*   @private
		*/

		// Add a collection of items to the UIScaler
		if (items)
		{
			this.addItems(items);
		}

		this._resize = this._resize.bind(this);
		this.enabled = enabled !== undefined ? !!enabled : true;
	};

	// Reference to the prototype
	var p = UIScaler.prototype = {};

	/**
	*  Vertically align to the top
	*  @property {String} ALIGN_TOP
	*  @static
	*  @final
	*  @readOnly
	*  @default "top"
	*/
	UIScaler.ALIGN_TOP = "top";

	/**
	*  Vertically align to the bottom
	*  @property {String} ALIGN_BOTTOM
	*  @static
	*  @final
	*  @readOnly
	*  @default "bottom"
	*/
	UIScaler.ALIGN_BOTTOM = "bottom";

	/**
	*  Horizontally align to the left
	*  @property {String} ALIGN_LEFT
	*  @static
	*  @final
	*  @readOnly
	*  @default "left"
	*/
	UIScaler.ALIGN_LEFT = "left";

	/**
	*  Horizontally align to the right
	*  @property {String} ALIGN_RIGHT
	*  @static
	*  @final
	*  @readOnly
	*  @default "right"
	*/
	UIScaler.ALIGN_RIGHT = "right";

	/**
	*  Vertically or horizontally align to the center
	*  @property {String} ALIGN_CENTER
	*  @static
	*  @final
	*  @readOnly
	*  @default "center"
	*/
	UIScaler.ALIGN_CENTER = "center";

	/**
	*  Get the adapter by display
	*  @method _getAdapter
	*  @private
	*  @param {object} display The canvas renderer display
	*/
	UIScaler._getAdapter = function(display)
	{
		if (display === undefined)
		{
			display = Application.instance.display;
		}

		// Check for a displayadpater, doesn't work with generic display
		if (!display.adapter)
		{
			if (true)
			{
				throw "The display specified is incompatible with UIScaler because it doesn't contain an adapter";
			}
			else
			{
				throw "UIScaler incompatible display";
			}
		}
		return display.adapter;
	};

	/**
	*  Get the current scale of the screen relative to the designed screen size
	*  @property {Number} scale
	*  @readOnly
	*/
	Object.defineProperty(p, 'scale', {
		get: function()
		{
			return this._scale;
		}
	});

	/**
	*  Whether the UIScaler should listen to the stage resize. Setting to true
	*  initialized a resize.
	*  @property {boolean} enabled
	*  @default true
	*/
	Object.defineProperty(p, 'enabled', {
		get : function()
		{
			return this._enabled;
		},
		set : function(enabled)
		{
			this._enabled = enabled;
			var app = Application.instance;

			app.off('resize', this._resize);
			if (enabled)
			{
				app.on('resize', this._resize);

				// Refresh the resize event
				app.triggerResize();
			}
		}
	});

	/**
	*  Register a dictionary of items to the UIScaler to control.
	*  @method addItems
	*  @param {object} items The items object where the keys are the name of the property on the
	*                        parent and the value is an object with keys of "titleSafe", "minScale",
	*                        "maxScale", "centerHorizontally", "align", see UIScaler.addItem for a
	*                        description of the different keys.
	*  @return {UIScaler} The instance of this UIScaler for chaining
	*/
	p.addItems = function(items)
	{
		// Temp variables
		var settings, name;

		// Loop through all the items and register
		// each dpending on the settings
		for (name in items)
		{
			settings = items[name];

			if (typeof settings !== "object")
			{
				if (true && Debug)
				{
					Debug.error(settings);
				}
				throw "Scaler settings must be a plain object " + settings;
			}

			if (!this._parent[name])
			{
				if (true && Debug)
				{
					Debug.info("UIScaler: could not find object '" +  name + "'");
				}
				continue;
			}
			this.addItem(this._parent[name], settings);
		}
		return this;
	};

	/**
	*  Manually add an item
	*  @method addItem
	*  @param {object} item The display object item to add
	*  @param {object} [settings] The collection of settings
	*  @param {String} [settings.align="center"] The vertical alignment ("top", "bottom", "center")
	*                                            then horizontal alignment ("left", "right" and
	*                                            "center"). Or you can use the short-handed
	*                                            versions: "center" = "center-center",
	*                                            "top" = "top-center", "bottom" = "bottom-center",
	*                                            "left" = "center-left", "right" = "center-right".
	*  @param {Boolean|String} [settings.titleSafe=false] If the item needs to be in the title safe
	*                                                     area. Acceptable values are false,
	*                                                     "horizontal", "vertical", "all", and true.
	*                                                     The default is false, and true is the same
	*                                                     as "all".
	*  @param {Number} [settings.minScale=NaN] The minimum scale amount (default, scales the same
	*                                          size as the stage)
	*  @param {Number} [settings.maxScale=NaN] The maximum scale amount (default, scales the same
	*                                          size as the stage)
	*  @param {Boolean} [settings.centeredHorizontally=false] Makes sure that the center of the
	*                                                         object is directly in the center of
	*                                                         the stage assuming origin point is in
	*                                                         the upper-left corner.
	*  @param {Number} [settings.x] The initial X position of the item
	*  @param {Number} [settings.y] The initial Y position of the item
	*  @param {Object} [settings.scale] The initial scale
	*  @param {Number} [settings.scale.x] The initial scale X value
	*  @param {Number} [settings.scale.y] The initial scale Y value
	*  @param {Object} [settings.pivot] The pivot point
	*  @param {Number} [settings.pivot.x] The pivot point X location
	*  @param {Number} [settings.pivot.y] The pivot point Y location
	*  @param {Number} [settings.rotation] The initial rotation in degrees
	*  @param {Object|Array} [settings.hitArea] An object which describes the hit area of the item
	*                                           or an array of points.
	*  @param {String} [settings.hitArea.type] If the hitArea is an object, the type of hit area,
	*                                          "rect", "ellipse", "circle", etc
	*  @return {UIScaler} The instance of this UIScaler for chaining
	*/
	p.addItem = function(item, settings)
	{
		var align = settings.align || UIScaler.ALIGN_CENTER;

		// Interpret short handed versions
		switch(align)
		{
			case UIScaler.ALIGN_CENTER :
			{
				align = align + "-" + align;
				break;
			}
			case UIScaler.ALIGN_LEFT :
			case UIScaler.ALIGN_RIGHT :
			{
				align = UIScaler.ALIGN_CENTER + "-" + align;
				break;
			}
			case UIScaler.ALIGN_TOP :
			case UIScaler.ALIGN_BOTTOM :
			{
				align = align + "-" + UIScaler.ALIGN_CENTER;
				break;
			}
		}

		// Error check the alignment value input
		if (!/^(center|top|bottom)\-(left|right|center)$/.test(align))
		{
			throw "Item align '" + align + "' is invalid for " + item;
		}

		// Do the intial positioning of the item
		Positioner.initItem(item, settings, this._adapter);

		// Break align into parts
		align = align.split('-');

		// Create the item settings
		var element = new UIElementSettings();

		element.vertAlign = align[0];
		element.horiAlign = align[1];
		element.titleSafe = settings.titleSafe == "all" ? true : settings.titleSafe;
		element.maxScale = settings.maxScale || NaN;
		element.minScale = settings.minScale || NaN;
		element.centeredHorizontally = !!settings.centeredHorizontally;

		this._items.push(new UIElement(item, element, this._designedSize, this._adapter));

		return this;
	};

	/**
	*   Add background bitmaps to scale full screen, this will attempt to
	*   scale the background to the height of the display and crop on
	*   the left and right.
	*   @method addBackground
	*   @param {Bitmap} The bitmap to scale or collection of bitmaps
	*   @return {UIScaler} The UIScaler for chaining
	*/
	p.addBackground = function(bitmap)
	{
		if (this._backgrounds.indexOf(bitmap) > -1)
		{
			throw "Background alread added to UIScaler";
		}
		this._backgrounds.push(bitmap);
		return this;
	};

	/**
	*   Remove background
	*   @method removeBackground
	*   @param {Bitmap} The bitmap or bitmaps to remove
	*   @return {UIScaler} The UIScaler for chaining
	*/
	p.removeBackground = function(bitmap)
	{
		for (var i = 0, len = this._backgrounds.length; i < len; i++)
		{
			if (bitmap === this._backgrounds[i])
			{
				this._backgrounds.splice(i, 1);
				return this;
			}
		}
		return this;
	};

	/**
	*  Scale the UI items that have been registered to the current screen
	*  @method _resize
	*  @private
	*  @param {Number} w The current width of the application
	*  @param {Number} h The current height of the application
	*/
	p._resize = function(w, h)
	{
		var _designedSize = this._designedSize;
		var defaultRatio = _designedSize.width / _designedSize.height,
			currentRatio = w / h;
		this._scale = currentRatio > defaultRatio ?
						h / _designedSize.height :
						w / _designedSize.width;
		var scaleToHeight = currentRatio >= defaultRatio;
		
		var _items = this._items;
		var i, len = _items.length;

		if (len > 0)
		{
			for (i = 0; i < len; ++i)
			{
				_items[i].resize(w, h);
			}
		}
		
		var _backgrounds = this._backgrounds, _adapter = this._adapter;
		len = _backgrounds.length;

		if (len > 0)
		{
			var expectedBGWidth = _designedSize.maxWidth || _designedSize.width;
			var bitmap, size, scale, positionHelper = {x: 0, y:0}, bgScale, activeBGSize;
			for (i = 0; i < len; i++)
			{
				bitmap = _backgrounds[i];
				
				size = _adapter.getBitmapSize(bitmap);
				//a double resolution image would have a bgScale of 2
				bgScale = size.w / expectedBGWidth;
				//determine the size of the active dimension, width or height
				activeBGSize = bgScale * (scaleToHeight ? _designedSize.height : _designedSize.width);
				//determine scale the bg should be used at to fill the display properly
				scale = (scaleToHeight ? h : w) / activeBGSize;

				//scale the background
				_adapter.setScale(bitmap, scale);
				
				//center the background
				positionHelper.x = (w - size.w * scale) * 0.5;
				positionHelper.y = (h - size.h * scale) * 0.5;
				_adapter.setPosition(
					bitmap,
					positionHelper
				);
			}
		}
	};

	/**
	*  Destroy the scaler object
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.enabled = false;

		if (this._items.length > 0)
		{
			for (var i = 0, len = this._items.length; i < len; ++i)
			{
				this._items[i].destroy();
			}
		}

		this._backgrounds = null;
		this._adapter = null;
		this._parent = null;
		this._designedSize = null;
		this._items = null;
	};

	// Assign to namespace
	namespace('springroll').UIScaler = UIScaler;

}());
