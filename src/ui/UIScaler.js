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