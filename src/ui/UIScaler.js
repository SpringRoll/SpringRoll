/**
*  @module Interface
*  @namespace springroll
*/
(function(undefined) {

	// Class imports
	var UIElementSettings = include('springroll.UIElementSettings'),
		UIElement = include('springroll.UIElement'),
		Positioner = include('springroll.Positioner'),
		Application = include('springroll.Application');

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
			if (DEBUG)
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
			// Calculate the max aspect ratio based on the maxWidth and override
			// the application default option
			options.maxAspectRatio = designedSize.maxWidth / designedSize.height;
		}
		if(designedSize.maxHeight)
		{
			// Calculate the minimum aspect ratio based on the maxHeight and override
			// the application default option
			options.minAspectRatio = designedSize.width / designedSize.maxHeight;
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
			if (DEBUG)
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
				if (DEBUG)
				{
					Debug.error(settings);
				}
				throw "Scaler settings must be a plain object " + settings;
			}

			if (!this._parent[name])
			{
				if (DEBUG)
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
	*  @param {Boolean} [settings.titleSafe=false] If the item needs to be in the title safe area
	*                                              (default is false)
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
		element.titleSafe = !!settings.titleSafe;
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
				activeBGSize = bgScale * scaleToHeight ? _designedSize.height : _designedSize.width;
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
