/**
 *	@module UI
 *	@namespace springroll
 *	@requires Core
 */
(function(undefined)
{
	// Class imports
	var UIElementSettings = include('springroll.UIElementSettings'),
		UIElement = include('springroll.UIElement'),
		Positioner = include('springroll.Positioner'),
		Application = include('springroll.Application'),
		Debug;

	/**
	 *	The UI scale is responsible for scaling UI components to help easy the burden of different
	 *	device aspect ratios. The UI can expand either vertically or horizontally to fill excess
	 *	space.
	 *
	 *	@class UIScaler
	 *	@constructor
	 *	@param {Object} [options] The options
	 *	@param {Object} [options.size] The dimensions of the Scaler
	 *	@param {Number} [options.size.width] The designed width
	 *	@param {Number} [options.size.height] The designed height
	 *	@param {Number} [options.size.maxwidth=size.width] The designed max width
	 *	@param {Number} [options.size.maxheight=size.height] The designed max height
	 *	@param {Object} [options.items] The items to load
	 *	@param {PIXI.DisplayObjectContainer|createjs.Container} [options.container] The container if adding items
	 *	@param {Object} [options.display] The current display
	 *	@param {Boolean} [options.enabled=false] If the scaler is enabled
	 */
	var UIScaler = function(options)
	{
		Debug = include('springroll.Debug', false);

		options = Object.merge(
		{
			enabled: false,
			size: null,
			items: null,
			display: null,
			container: null
		}, options);

		/**
		 *	The configuration for each items
		 *	@property {Array} _items
		 *	@private
		 */
		this._items = [];

		/**
		 *	The screen settings object, contains information about designed size
		 *	@property {object} _size
		 *	@private
		 */
		this._size = null;

		/**
		 *	The current overall scale of the game
		 *	@property {Number} _scale
		 *	@private
		 *	@default 1
		 */
		this._scale = 1;

		/**
		 *	The adapter for universal scale, rotation size access
		 *	@property {Object} _adapter
		 *	@private
		 */
		this._adapter = null;

		/**
		 *	The collection of bitmaps to full screen scale
		 *	@property {Array} _backgrounds
		 *	@private
		 */
		this._backgrounds = [];

		/**
		 *	 The internal enabled
		 *	 @property {boolean} _enabled
		 *	 @private
		 */
		this._enabled = options.enabled;

		// Set the designed size
		this.size = options.size;

		// Set the display so we can get an adapter
		this.display = options.display;

		if (options.items)
		{
			if (!options.container)
			{
				throw "UIScaler requires container to add items";
			}
			this.addItems(options.container, options.items);
		}

		// Setup the resize bind
		this._resize = this._resize.bind(this);

		// Set the enabled status
		this.enabled = this._enabled;
	};

	// Reference to the prototype
	var p = UIScaler.prototype = {};

	/**
	 *	Vertically align to the top
	 *	@property {String} ALIGN_TOP
	 *	@static
	 *	@final
	 *	@readOnly
	 *	@default "top"
	 */
	UIScaler.ALIGN_TOP = "top";

	/**
	 *	Vertically align to the bottom
	 *	@property {String} ALIGN_BOTTOM
	 *	@static
	 *	@final
	 *	@readOnly
	 *	@default "bottom"
	 */
	UIScaler.ALIGN_BOTTOM = "bottom";

	/**
	 *	Horizontally align to the left
	 *	@property {String} ALIGN_LEFT
	 *	@static
	 *	@final
	 *	@readOnly
	 *	@default "left"
	 */
	UIScaler.ALIGN_LEFT = "left";

	/**
	 *	Horizontally align to the right
	 *	@property {String} ALIGN_RIGHT
	 *	@static
	 *	@final
	 *	@readOnly
	 *	@default "right"
	 */
	UIScaler.ALIGN_RIGHT = "right";

	/**
	 *	Vertically or horizontally align to the center
	 *	@property {String} ALIGN_CENTER
	 *	@static
	 *	@final
	 *	@readOnly
	 *	@default "center"
	 */
	UIScaler.ALIGN_CENTER = "center";

	/**
	 *	Get the adapter by display
	 *	@method _getAdapter
	 *	@private
	 *	@param {object} display The canvas renderer display
	 */
	UIScaler._getAdapter = function(display)
	{
		if (display === undefined)
		{
			display = Application.instance.display;
		}

		if (!display) return null;

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
	 *	Set the display
	 *	@property {springroll.AbstractDisplay} display
	 */
	Object.defineProperty(p, 'display',
	{
		set: function(display)
		{
			this._adapter = UIScaler._getAdapter(display);
		}
	});

	/**
	 *	The design sized of the application
	 *	@property {Object} size 
	 *	@default null
	 */
	/**
	 *	The designed width of the application
	 *	@property {Number} size.width
	 */
	/**
	 *	The designed width of the application
	 *	@property {Number} size.height
	 */
	/**
	 *	The designed max width of the application
	 *	@property {Number} size.maxWidth
	 *	@default  size.width
	 */
	/**
	 *	The designed maxHeight of the application
	 *	@property {Number} size.maxHeight
	 *	@default  size.height
	 */
	Object.defineProperty(p, 'size',
	{
		set: function(size)
		{
			this._size = size;

			if (!size) return;

			if (!size.width || !size.height)
			{
				if (DEBUG && Debug)
				{
					Debug.error(size);
					throw "Designed size parameter must be a plain object with 'width' & 'height' properties";
				}
				else
				{
					throw "Invalid design settings";
				}
			}

			// Allow for responsive designs if they're a max width
			var options = Application.instance.options;
			if (size.maxWidth)
			{
				// Set the max width so that Application can limit the aspect ratio properly
				options.maxWidth = size.maxWidth;
			}
			if (size.maxHeight)
			{
				// Set the max height so that Application can limit the aspect ratio properly
				options.maxHeight = size.maxHeight;
			}
		},
		get: function()
		{
			return this._size;
		}
	});

	/**
	 *	Get the current scale of the screen relative to the designed screen size
	 *	@property {Number} scale
	 *	@readOnly
	 */
	Object.defineProperty(p, 'scale',
	{
		get: function()
		{
			return this._scale;
		}
	});

	/**
	 *	The total number of items
	 *	@property {Number} numItems
	 *	@readOnly
	 */
	Object.defineProperty(p, 'numItems',
	{
		get: function()
		{
			return this._items.length;
		}
	});

	/**
	 *	Whether the UIScaler should listen to the stage resize. Setting to true
	 *	initialized a resize.
	 *	@property {boolean} enabled
	 *	@default true
	 */
	Object.defineProperty(p, 'enabled',
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(enabled)
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
	 *	Remove all UIElement where the item display is a the container or it contains items
	 *	@method removeItems
	 *	@param  {createjs.Container|PIXI.DisplayObjectContainer} container 
	 */
	p.removeItems = function(container)
	{
		var adapter = this._adapter;
		this._items.forEach(function(item, i, items)
		{
			if (adapter.contains(container, item.display))
			{
				items.splice(i, 1);
			}
		});
	};

	/**
	 *	Register a dictionary of items to the UIScaler to control.
	 *	@method addItems
	 *	@param {PIXI.DisplayObjectContainer|createjs.Container} container 
	 *	The container where the items live
	 *	@param {object} items The items object where the keys are the name of the property 
	 *	on The parent and the value is an object with keys of "titleSafe", "minScale",
	 *	"maxScale", "centerHorizontally", "align", see UIScaler.addItem for a description 
	 *	of the different keys.
	 *	@return {springroll.UIScaler} The instance of this UIScaler for chaining
	 */
	p.addItems = function(container, items)
	{
		// Temp variables
		var settings;
		var name;

		// Loop through all the items and register
		// Each dpending on the settings
		for (name in items)
		{
			settings = items[name];

			if (typeof settings !== "object")
			{
				if (DEBUG && Debug)
				{
					Debug.error(settings);
				}
				throw "Scaler settings must be a plain object " + settings;
			}

			if (!container[name])
			{
				if (DEBUG && Debug)
				{
					Debug.info("UIScaler: could not find object '" + name + "'");
				}
				continue;
			}
			this.addItem(container[name], settings);
		}
		Application.instance.triggerResize();
		return this;
	};

	/**
	 *	Manually add an item
	 *	@method addItem
	 *	@param {object} item The display object item to add
	 *	@param {object|String} [settings="center"] The collection of settings or the alignment
	 *	@param {String} [settings.align="center"] The vertical alignment ("top", "bottom", "center")
	 *	                                          then horizontal alignment ("left", "right" and
	 *	                                          "center"). Or you can use the short-handed
	 *	                                          versions: "center" = "center-center",
	 *	                                          "top" = "top-center", "bottom" = "bottom-center",
	 *	                                          "left" = "center-left", "right" = "center-right".
	 *	@param {Boolean|String} [settings.titleSafe=false] If the item needs to be in the title safe
	 *	                                                   area. Acceptable values are false,
	 *	                                                   "horizontal", "vertical", "all", and true.
	 *	                                                   The default is false, and true is the same
	 *	                                                   as "all".
	 *	@param {Number} [settings.minScale=NaN] The minimum scale amount (default, scales the same
	 *	                                        size as the stage)
	 *	@param {Number} [settings.maxScale=NaN] The maximum scale amount (default, scales the same
	 *	                                        size as the stage)
	 *	@param {Boolean} [settings.centeredHorizontally=false] Makes sure that the center of the
	 *	                                                       object is directly in the center of
	 *	                                                       the stage assuming origin point is in
	 *	                                                       the upper-left corner.
	 *	@param {Number} [settings.x] The initial X position of the item
	 *	@param {Number} [settings.y] The initial Y position of the item
	 *	@param {Object} [settings.scale] The initial scale
	 *	@param {Number} [settings.scale.x] The initial scale X value
	 *	@param {Number} [settings.scale.y] The initial scale Y value
	 *	@param {Object} [settings.pivot] The pivot point
	 *	@param {Number} [settings.pivot.x] The pivot point X location
	 *	@param {Number} [settings.pivot.y] The pivot point Y location
	 *	@param {Number} [settings.rotation] The initial rotation in degrees
	 *	@param {Object|Array} [settings.hitArea] An object which describes the hit area of the item
	 *	                                         or an array of points.
	 *	@param {String} [settings.hitArea.type] If the hitArea is an object, the type of hit area,
	 *	                                        "rect", "ellipse", "circle", etc
	 *	@return {springroll.UIScaler} The instance of this UIScaler for chaining
	 */
	p.addItem = function(item, settings)
	{
		if (!settings)
		{
			settings = {
				align: UIScaler.ALIGN_CENTER
			};
		}
		if (typeof settings === "string")
		{
			settings = {
				align: settings
			};
		}
		var align = settings.align || UIScaler.ALIGN_CENTER;

		// Interpret short handed versions
		switch (align)
		{
			case UIScaler.ALIGN_CENTER:
				{
					align = align + "-" + align;
					break;
				}
			case UIScaler.ALIGN_LEFT:
			case UIScaler.ALIGN_RIGHT:
				{
					align = UIScaler.ALIGN_CENTER + "-" + align;
					break;
				}
			case UIScaler.ALIGN_TOP:
			case UIScaler.ALIGN_BOTTOM:
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

		this._items.push(new UIElement(item, element, this._size, this._adapter));

		return this;
	};

	/**
	 *	 Add background bitmaps to scale full screen, this will attempt to
	 *	 scale the background to the height of the display and crop on
	 *	 the left and right.
	 *	 @method addBackground
	 *	 @param {Bitmap} The bitmap to scale or collection of bitmaps
	 *	 @return {springroll.UIScaler} The UIScaler for chaining
	 */
	p.addBackground = function(bitmap)
	{
		if (this._backgrounds.indexOf(bitmap) > -1)
		{
			throw "Background alread added to UIScaler";
		}
		this._backgrounds.push(bitmap);
		Application.instance.triggerResize();
		return this;
	};

	/**
	 *	 Remove background
	 *	 @method removeBackground
	 *	 @param {Bitmap} bitmap The bitmap added
	 *	 @return {springroll.UIScaler} The UIScaler for chaining
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
	 *	Scale the UI items that have been registered to the current screen
	 *	@method _resize
	 *	@private
	 *	@param {Number} w The current width of the application
	 *	@param {Number} h The current height of the application
	 */
	p._resize = function(w, h)
	{
		var _size = this._size;
		var defaultRatio = _size.width / _size.height;
		var currentRatio = w / h;
		this._scale = currentRatio > defaultRatio ?
			h / _size.height :
			w / _size.width;
		var scaleToHeight = currentRatio >= defaultRatio;

		var _items = this._items;
		var i;
		var len = _items.length;

		if (len > 0)
		{
			for (i = 0; i < len; ++i)
			{
				_items[i].resize(w, h);
			}
		}

		var _backgrounds = this._backgrounds;
		var _adapter = this._adapter;
		len = _backgrounds.length;

		if (len > 0)
		{
			var expectedBGWidth = _size.maxWidth || _size.width;
			var bitmap;
			var size;
			var scale;
			var positionHelper = {
				x: 0,
				y: 0
			};
			var bgScale;
			var activeBGSize;
			for (i = 0; i < len; i++)
			{
				bitmap = _backgrounds[i];
				size = _adapter.getBitmapSize(bitmap);
				// A double resolution image would have a bgScale of 2
				bgScale = size.w / expectedBGWidth;
				// Determine the size of the active dimension, width or height
				activeBGSize = bgScale * (scaleToHeight ? _size.height : _size.width);
				// Determine scale the bg should be used at to fill the display properly
				scale = (scaleToHeight ? h : w) / activeBGSize;
				// Scale the background
				_adapter.setScale(bitmap, scale);
				// Center the background
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
	 *	Destroy the scaler object
	 *	@method destroy
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
		this._size = null;
		this._items = null;
	};

	// Assign to namespace
	namespace('springroll').UIScaler = UIScaler;

}());