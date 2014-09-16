/*! CloudKidFramework 0.0.5 */
!function(){"use strict";/**
*  @module cloudkid
*/
(function() {

	/**
	*   Object that contains the screen settings to help scaling
	*   @module cloudkid
	*   @class ScreenSettings
	*   @constructor
	*   @param {Number} width The screen width in pixels
	*   @param {Number} height The screen height in pixels
	*   @param {Number} ppi The screen pixel density (PPI)
	*/
	var ScreenSettings = function(width, height, ppi)
	{
		/**
		*  The screen width in pixels
		*  @property {Number} width 
		*/
		this.width = width;

		/**
		*  The screen height in pixels
		*  @property {Number} height 
		*/
		this.height = height;

		/**
		*  The screen pixel density (PPI)
		*  @property {Number} ppi
		*/
		this.ppi = ppi;
	};
	
	// Set the prototype
	ScreenSettings.prototype = {};
	
	// Assign to namespace
	namespace('cloudkid').ScreenSettings = ScreenSettings;

}());
/**
*  @module cloudkid
*/
(function() {

	// Class imports
	var UIScaler;

	/**
	*   A single UI item that needs to be resized	
	*
	*   @module cloudkid
	*   @class UIElement
	*	@param {DisplayObject} item The item to affect  
	*   @param {UIElementSettings} settings The scale settings
	*	@param {ScreenSettings} designedScreen The original screen the item was designed for
	*   @param {DisplayAdapter} adapter The display adapter
	*/
	var UIElement = function(item, settings, designedScreen, adapter)
	{
		if(!UIScaler)
		{
			UIScaler = include('cloudkid.UIScaler');
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
		this.origScaleX = scale.x || 0;

		/**
		*  The original Y scale of the item
		*  @property {Number} origScaleY
		*  @default 0
		*/
		this.origScaleY = scale.y || 0;

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
		this.origBounds = {x:0, y:0, width:item.width, height:item.height};
		this.origBounds.right = this.origBounds.x + this.origBounds.width;
		this.origBounds.bottom = this.origBounds.y + this.origBounds.height;

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
				this.origMarginVert = position.y + this.origBounds.y;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginVert = designedScreen.height * 0.5 - position.y;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				this.origMarginVert = designedScreen.height - (position.y + this.origBounds.bottom);
				break;
			}
		}

		switch(settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				this.origMarginHori = position.x + this.origBounds.x;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				this.origMarginHori = designedScreen.width * 0.5 - position.x;
				break;
			}
			case UIScaler.ALIGN_RIGHT:
			{
				this.origMarginHori = designedScreen.width - (position.x + this.origBounds.right);
				break;
			}
		}
	};
	
	// Reference to the prototype
	var p = UIElement.prototype = {};
	
	/**
	*  Adjust the item scale and position, to reflect new screen
	*  @method resize
	*  @param {ScreenSettings} newScreen The current screen settings
	*/
	p.resize = function(newScreen)
	{
		var adapter = this._adapter;
		var overallScale = newScreen.height / this._designedScreen.height;
		var ppiScale = newScreen.ppi / this._designedScreen.ppi;
		var letterBoxWidth = (newScreen.width - this._designedScreen.width * overallScale) / 2;

		// Scale item to the overallScale to match rest of the app, 
		// then clamp its physical size as specified 
		// then set the item's scale to be correct - the screen is not scaled

		//Full math:
		/*var physicalScale:Number = overallScale / ppiScale;
		var itemScale:Number = MathUtils.clamp(physicalScale, minScale, maxScale) / physicalScale * overallScale;*/

		//Optimized math:
		var itemScale = overallScale / ppiScale;
		if(this._settings.minScale && itemScale < this._settings.minScale)
			itemScale = this._settings.minScale;
		else if(this._settings.maxScale && itemScale > this._settings.maxScale)
			itemScale = this._settings.maxScale;
		itemScale *= ppiScale;

		adapter.setScale(this._item, this.origScaleX * itemScale, "x");
		adapter.setScale(this._item, this.origScaleY * itemScale, "y");

		// positioning
		var m, x = null, y = null;

		// vertical move
		m = this.origMarginVert * overallScale;
		
		switch(this._settings.vertAlign)
		{
			case UIScaler.ALIGN_TOP:
			{
				y = m - this.origBounds.y * itemScale;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				y = newScreen.height * 0.5 - m;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				y = newScreen.height - m - this.origBounds.bottom * itemScale;
				break;
			}
		}

		// Set the position
		if (y !== null) adapter.setPosition(this._item, y, "y");

		// horizontal move
		m = this.origMarginHori * overallScale;
		
		switch(this._settings.horiAlign)
		{
			case UIScaler.ALIGN_LEFT:
			{
				if(this._settings.titleSafe)
				{
					x = letterBoxWidth + m - this.origBounds.x * itemScale;
				}
				else
				{
					x = m - this.origBounds.x * itemScale;
				}
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				if(this._settings.centeredHorizontally)
				{
					x = (newScreen.width - this._item.width) * 0.5;
				}
				else
				{
					x = newScreen.width * 0.5 - m;
				}
				break;
			}	
			case UIScaler.ALIGN_RIGHT:
			{
				if(this._settings.titleSafe)
				{
					x = newScreen.width - letterBoxWidth - m - this.origBounds.right * itemScale;
				}
				else
				{
					x = newScreen.width - m - this.origBounds.right * itemScale;
				}
				break;
			}		
		}

		// Set the position
		if (x !== null) adapter.setPosition(this._item, x, "x");
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
	namespace('cloudkid').UIElement = UIElement;

}());
/**
*  @module cloudkid
*/
(function() {
	
	/**
	*  The UI Item Settings which is the positioning settings used to adjust each element
	*  @module cloudkid
	*  @class UIElementSettings
	*/
	var UIElementSettings = function(){};
	
	// Reference to the prototype
	var p = UIElementSettings.prototype = {};
	
	/** 
	*  What vertical screen location the item should be aligned to: "top", "center", "bottom"
	*  @property {String} vertAlign
	*/
	p.vertAlign = null;

	/** 
	*  What horizontal screen location the item should be aligned to: "left", "center", "right"
	*  @property {String} horiAlign
	*/
	p.horiAlign = null;

	/** 
	*  If this element should be aligned to the title safe area, not the actual screen 
	*  @property {Boolean} titleSafe
	*  @default false
	*/
	p.titleSafe = false;

	/** 
	*  Maximum scale allowed in physical size 
	*  @property {Number} maxScale
	*  @default 1
	*/
	p.maxScale = 1;

	/** 
	*  Minimum scale allowed in physical size 
	*  @property {Number} minScale
	*  @default 1
	*/
	p.minScale = 1;
	
	/**
	*  If the UI element is centered horizontally
	*  @property {Boolean} centeredHorizontally
	*  @default false
	*/
	p.centeredHorizontally = false;
	
	// Assign to name space
	namespace('cloudkid').UIElementSettings = UIElementSettings;
}());
/**
*  @module cloudkid
*/
(function(undefined) {
	
	// Class imports
	var UIElementSettings = include('cloudkid.UIElementSettings'),
		UIElement = include('cloudkid.UIElement'),
		Application = include('cloudkid.Application'),
		ScreenSettings = include('cloudkid.ScreenSettings');
		
	/**
	*   The UI scale is responsible for scaling UI components
	*   to help easy the burden of different device aspect ratios
	*
	*  @class UIScaler
	*  @constructor
	*  @param {object} parent The UI display container
	*  @param {Number} designedWidth The designed width of the UI
	*  @param {Number} designedHeight The designed height of the UI
	*  @param {Number} designedPPI The designed PPI of the UI
	*  @param {Display} [display=Application.instance.display] The display to use the UIScaler on
	*/
	var UIScaler = function(parent, designedWidth, designedHeight, designedPPI, display)
	{
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

		/** 
		*  The screen settings object, contains information about designed size 
		*  @property {ScreenSettings} _designedScreen
		*  @private
		*/
		this._designedScreen = new ScreenSettings(designedWidth, designedHeight, designedPPI);

		/**
		*  The adapter for universal scale, rotation size access
		*  @property {Object} _adapter
		*  @private
		*/
		this._adapter = UIScaler.getAdapter(display);
	};

	/**
	*  Get the adapter by display
	*  @method getAdapter
	*  @private
	*  @static
	*  @param {object} display The canvas renderer display
	*/
	UIScaler.getAdapter = function(display)
	{
		if (display === undefined)
		{
			display = Application.instance.display;
		}

		// Check for a displayadpater, doesn't work with generic display
		if (!display.DisplayAdapter)
		{
			throw "The display specified is incompatible with UIScaler";
		}

		return display.DisplayAdapter;
	};
	
	// Reference to the prototype
	var p = UIScaler.prototype = {};
				
	/** 
	*  The current screen settings 
	*  @property {ScreenSettings} currentScreen
	*  @static
	*  @private
	*/
	var currentScreen = new ScreenSettings(0, 0, 0);
	
	/** 
	*  If the screensize has been set 
	*  @property {Boolean} initialized
	*  @static
	*  @private
	*/
	var initialized = false;
	
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
	*  Create the scaler from JSON data
	*  @method fromJSON
	*  @static
	*  @param {DisplayObject} parent The UI display container
	*  @param {Object} jsonSettings The json of the designed settings {designedWidth:800, designedHeight:600, designedPPI:72}
	*  @param {Object} jsonItems The json items object where the keys are the name of the property on the parent and the value
	*         is an object with keys of "titleSafe", "minScale", "maxScale", "centerHorizontally", "align"
	*  @param {Boolean} [immediateDestroy=true] If we should immediately cleanup the UIScaler after scaling items
	*  @param {Display} [display=Application.instance.display] The display which to use for the scaler
	*  @return {UIScaler} The scaler object that can be reused
	*/
	UIScaler.fromJSON = function(parent, jsonSettings, jsonItems, immediateDestroy, display)
	{
		if (typeof immediateDestroy != "boolean") immediateDestroy = true;
			
		var scaler = new UIScaler(
			parent, 
			jsonSettings.designedWidth,
			jsonSettings.designedHeight,
			jsonSettings.designedPPI,
			display
		);
		
		// Temp variables
		var item, i, align, vertAlign, horiAlign;
		
		// Loop through all the items and register
		// each dpending on the settings
		for(i in jsonItems)
		{
			item = jsonItems[i];

			if (!item)
			{
				Debug.error("UIScaler: could not find object '" +  iName + "'");
				continue;
			}
			
			if (item.align)
			{
				align = item.align.split("-");
				vertAlign = align[0];
				horiAlign = align[1];
			}
			else
			{
				vertAlign = ALIGN_CENTER;
				horiAlign = ALIGN_CENTER;
			}
			scaler.add(
				parent[i], 
				vertAlign,
				horiAlign,
				item.titleSafe || false,
				item.minScale || NaN,
				item.maxScale || NaN,
				item.centeredHorizontally || false
			);
		}
		
		// Scale the items
		scaler.resize();
		
		if (immediateDestroy)
		{
			scaler.destroy();
		}
		return scaler;
	};
	
	/**
	*   Set the current screen settings. If the stage size changes at all, re-call this function
	*   @method init
	*   @static
	*   @param {Number} screenWidth The fullscreen width
	*   @param {Number} screenHeight The fullscreen height
	*   @param {Number} screenPPI The screen resolution density
	*/
	UIScaler.init = function(screenWidth, screenHeight, screenPPI)
	{
		currentScreen.width = screenWidth;
		currentScreen.height = screenHeight;
		currentScreen.ppi = screenPPI;
		initialized = true;
	};

	/**
	*  Get the current scale of the screen
	*  @method getScale
	*  @return {Number} The current stage scale
	*/
	p.getScale = function()
	{
		return currentScreen.height / this._designedScreen.height;
	};
	
	/**
	*   Manually add an item 
	*   @method add
	*   @param {object} item The display object item to add
	*   @param {String} [vertAlign="center"] The vertical align of the item (cefault is center)
	*   @param {String} [horiAlign="center"] The horizontal align of the item (default is center)
	*   @param {Boolean} [titleSafe=false] If the item needs to be in the title safe area (default is false)
	*   @param {Number} [minScale=1] The minimum scale amount (default, scales the same size as the stage)
	*   @param {Number} [maxScale=1] The maximum scale amount (default, scales the same size as the stage)
	*   @param {Boolean} [centeredHorizontally=false] Makes sure that the center of the object was at the center of the screen, assuming an origin at the top left of the object
	*/
	p.add = function(item, vertAlign, horiAlign, titleSafe, minScale, maxScale, centeredHorizontally)
	{
		// Create the item settings
		var s = new UIElementSettings();
		
		s.vertAlign = vertAlign || UIScaler.ALIGN_CENTER;
		s.horiAlign = horiAlign || UIScaler.ALIGN_CENTER;
		s.titleSafe = (typeof titleSafe != "boolean") ? false : titleSafe;
		s.maxScale = (typeof maxScale != "number") ? NaN : maxScale;
		s.minScale = (typeof minScale != "number") ? NaN : minScale;
		s.centeredHorizontally = centeredHorizontally || false;
				
		this._items.push(new UIElement(item, s, this._designedScreen, this._adapter));
	};
	
	/**
	*   Scale a single background image according to the UIScaler.width and height
	*   @method resizeBackground
	*   @static
	*   @param {Bitmap} The bitmap to scale
	*   @param {Display} [display=Application.instance.display] The display which to use for the scaler
	*/
	UIScaler.resizeBackground = function(bitmap, display)
	{
		if (!initialized) return;

		var adapter = UIScaler.getAdapter(display),
			size = adapter.getBitmapSize(bitmap), 
			scale;

		//scale the background
		scale = currentScreen.height / size.h;
		adapter.setScale(bitmap, scale);
		
		//center the background
		adapter.setPosition(bitmap, (currentScreen.width - size.w * scale) * 0.5, "x");
	};
	
	/**
	*  Convenience function to scale a collection of backgrounds
	*  @method resizeBackgrounds
	*  @static
	*  @param {Array} bitmaps The collection of bitmap images
	*  @param {object} [display=Application.instance.display] The display which to use for the scaler
	*/
	UIScaler.resizeBackgrounds = function(bitmaps, display)
	{
		for(var i = 0, len = bitmaps.length; i < len; ++i)
		{
			UIScaler.resizeBackground(bitmaps[i], display);
		}
	};
	
	/**
	*  Scale the UI items that have been registered to the current screen
	*  @method resize
	*/
	p.resize = function()
	{
		if (this._items.length > 0)
		{
			for(var i = 0, len = this._items.length; i < len; ++i)
			{
				this._items[i].resize(currentScreen);
			}
		}
	};
	
	/**
	*  Destroy the scaler object
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this._items.length > 0)
		{
			for(var i = 0, len = this._items.length; i < len; ++i)
			{
				this._items[i].destroy();
			}
		}
		
		this._adapter = null;
		this._parent = null;
		this._designedScreen = null;
		this._items = null;
	};
	
	namespace('cloudkid').UIScaler = UIScaler;

}());
/**
*  @module cloudkid
*/
(function() {
		
	var UIScaler = include('cloudkid.UIScaler');

	/**
	*  Initially layouts all interface elements
	*  @module cloudkid
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

}());}();