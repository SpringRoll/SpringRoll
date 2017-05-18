/*! SpringRoll 1.0.3 */
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Bitmap = include('createjs.Bitmap', false);
	var Sprite = include('PIXI.Sprite', false);

	/**
	 * A bitmap to scale with the ScaleManager
	 *
	 * @class ScaleImage
	 * @private
	 * @param {PIXI.Sprite|createjs.Bitmap} image The image to resize
	 * @param {Object} size The original screen the item was designed for
	 * @param {DisplayAdapter} adapter The display adapter
	 */
	var ScaleImage = function(image, size, adapter)
	{
		var valid = false;

		if (!image)
		{
			valid = false;
		}
		else if (Bitmap && image instanceof Bitmap)
		{
			valid = true;
		}
		else if (Sprite && image instanceof Sprite)
		{
			valid = true;
		}

		if (!valid)
		{
			if (true)
			{
				throw 'The image is an invalid cover image, must be a PIXI.Sprite or createjs.Bitmap';
			}
			else
			{
				throw 'Invalid image';
			}
		}

		/**
		 * The image to resize
		 * @property {PIXI.Sprite|createjs.Bitmap} image
		 * @private
		 */
		this._image = image;

		/**
		 * The original screen the item was designed for
		 * @private
		 * @property {Object} _size
		 */
		this._size = size;

		/**
		 * The adapter for universal scale, rotation size access
		 * @property {Object} _adapter
		 * @private
		 */
		this._adapter = adapter;
	};

	var p = extend(ScaleImage);

	/**
	 * Resize the current image
	 * @method resize
	 * @param  {Number} w  The stage height
	 * @param  {Number} h The stage width
	 */
	p.resize = function(w, h)
	{
		var _size = this._size;
		var _adapter = this._adapter;
		var _image = this._image;

		var defaultRatio = _size.width / _size.height;
		var currentRatio = w / h;
		var scaleToHeight = currentRatio >= defaultRatio;

		var size = _adapter.getBitmapSize(_image);
		var expectedBGWidth = _size.maxWidth || _size.width;

		// A double resolution image would have a bgScale of 2
		var bgScale = size.w / expectedBGWidth;
		//if the app only expands horizontally, then we shouldn't use the expected width
		//in case the image's aspect ratio isn't the one we expect for any reason
		if (!_size.maxHeight)
			bgScale = size.h / _size.height;

		// Determine the size of the active dimension, width or height
		var activeBGSize = bgScale * (scaleToHeight ? _size.height : _size.width);

		// Determine scale the bg should be used at to fill the display properly
		var scale = (scaleToHeight ? h : w) / activeBGSize;

		// Scale the background
		_adapter.setScale(this._image, scale);

		// Center the background
		_adapter.setPosition(this._image,
		{
			x: (w - size.w * scale) * 0.5,
			y: (h - size.h * scale) * 0.5
		});
	};

	/**
	 * Get the current display item
	 * @property {PIXI.Sprite|createjs.Bitmap} display
	 * @readOnly
	 */
	Object.defineProperty(p, 'display',
	{
		get: function()
		{
			return this._image;
		}
	});

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._adapter = null;
		this._size = null;
		this._image = null;
	};

	// Assign to namespace
	namespace('springroll').ScaleImage = ScaleImage;

}());
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Class imports
	var ScaleManager;

	/**
	 * A single UI item that needs to be resized,
	 * this is an internal class that you would not need to interact with.
	 *
	 * @class ScaleItem
	 * @private
	 * @param {PIXI.DisplayObject|createjs.DisplayObject} display The item to affect
	 * @param {String} align The vertical-horizontal alignment shorthand
	 * @param {Object} size The original screen the item was designed for
	 * @param {DisplayAdapter} adapter The display adapter
	 */
	var ScaleItem = function(display, align, size, adapter)
	{
		if (!ScaleManager)
		{
			ScaleManager = include('springroll.ScaleManager');
		}

		// Break align into parts
		align = align.split('-');

		/**
		 * What vertical screen location the item should be aligned to: "top", "center", "bottom"
		 * @property {String} vertAlign
		 */
		this.vertAlign = align[0];

		/**
		 * What horizontal screen location the item should be aligned to: "left", "center", "right"
		 * @property {String} horiAlign
		 */
		this.horiAlign = align[1];

		/**
		 * If this element should be aligned to the title safe area, not the actual screen.
		 * Values of "horizontal" and "vertical" make the title safe calculations take place only
		 * for one direction.
		 * @property {Boolean|String} titleSafe
		 * @default false
		 */
		this.titleSafe = false;

		/**
		 * Maximum scale allowed in physical size
		 * @property {Number} maxScale
		 * @default 1
		 */
		this.maxScale = 1;

		/**
		 * Minimum scale allowed in physical size
		 * @property {Number} minScale
		 * @default 1
		 */
		this.minScale = 1;

		/**
		 * If the UI element is centered horizontally
		 * @property {Boolean} centeredHorizontally
		 * @default false
		 */
		this.centeredHorizontally = false;

		/**
		 * The reference to the interface item we're scaling
		 * @private
		 * @property {PIXI.DisplayObject|createjs.DisplayObject} _display
		 */
		this._display = display;

		/**
		 * The original screen the item was designed for
		 * @private
		 * @property {Object} _size
		 */
		this._size = size;

		/**
		 * The adapter for universal scale, rotation size access
		 * @property {Object} _adapter
		 * @private
		 */
		this._adapter = adapter;

		var scale = adapter.getScale(display);
		var position = adapter.getPosition(display);

		/**
		 * Original X scale of the item
		 * @property {Number} origScaleX
		 * @default 0
		 */
		var origScaleX = this.origScaleX = scale.x || 1;

		/**
		 * The original Y scale of the item
		 * @property {Number} origScaleY
		 * @default 0
		 */
		var origScaleY = this.origScaleY = scale.y || 1;

		/**
		 * The original bounds of the item with x, y, right, bottom, width,
		 * height properties. This is converted from local bounds to scaled bounds.
		 * @property {Object} origBounds
		 */
		this.origBounds = adapter.getLocalBounds(display);
		//convert bounds to something more usable
		var temp, bounds = this.origBounds;
		if (this.origScaleX < 0)
		{
			temp = bounds.x;
			bounds.x = bounds.right * origScaleX;
			bounds.right = temp * origScaleX;
			bounds.width *= Math.abs(origScaleX);
		}
		else
		{
			bounds.x *= origScaleX;
			bounds.right *= origScaleX;
			bounds.width *= origScaleX;
		}
		if (this.origScaleY < 0)
		{
			temp = bounds.y;
			bounds.y = bounds.bottom * origScaleY;
			bounds.bottom = temp * origScaleY;
			bounds.height *= Math.abs(origScaleY);
		}
		else
		{
			bounds.y *= origScaleY;
			bounds.bottom *= origScaleY;
			bounds.height *= origScaleY;
		}

		/**
		 * Original horizontal margin in pixels
		 * @property {Number} origMarginHori
		 * @default 0
		 */
		this.origMarginHori = 0;

		/**
		 * Original vertical margin in pixels
		 * @property {Number} origMarginVert
		 * @default 0
		 */
		this.origMarginVert = 0;

		switch (this.vertAlign)
		{
			case ScaleManager.ALIGN_TOP:
				{
					this.origMarginVert = position.y + this.origBounds.y;
					break;
				}
			case ScaleManager.ALIGN_CENTER:
				{
					this.origMarginVert = size.height * 0.5 - position.y;
					break;
				}
			case ScaleManager.ALIGN_BOTTOM:
				{
					this.origMarginVert = size.height - (position.y + this.origBounds.bottom);
					break;
				}
		}

		switch (this.horiAlign)
		{
			case ScaleManager.ALIGN_LEFT:
				{
					this.origMarginHori = position.x + this.origBounds.x;
					break;
				}
			case ScaleManager.ALIGN_CENTER:
				{
					this.origMarginHori = size.width * 0.5 - position.x;
					break;
				}
			case ScaleManager.ALIGN_RIGHT:
				{
					this.origMarginHori = size.width - (position.x + this.origBounds.right);
					break;
				}
		}
	};

	// Reference to the prototype
	var p = extend(ScaleItem);

	if (true)
	{
		p.toString = function()
		{
			return "[ScaleItem (vertAlign='" + this.vertAlign + "', horiAlign='" + this.horiAlign + "')]";
		};
	}

	/**
	 * Get the current display item
	 * @property {PIXI.DisplayObject|createjs.DisplayObject} display
	 * @readOnly
	 */
	Object.defineProperty(p, 'display',
	{
		get: function()
		{
			return this._display;
		}
	});

	/**
	 * Adjust the item scale and position, to reflect new screen
	 * @method resize
	 * @param {Number} displayWidth The current screen width
	 * @param {Number} displayHeight The current screen height
	 */
	p.resize = function(displayWidth, displayHeight)
	{
		var adapter = this._adapter;
		var _display = this._display;
		var _size = this._size;
		var origBounds = this.origBounds;
		var origScaleX = this.origScaleX;
		var origScaleY = this.origScaleY;
		var defaultRatio = _size.width / _size.height;
		var currentRatio = displayWidth / displayHeight;
		var overallScale = currentRatio >= defaultRatio ?
			displayHeight / _size.height :
			displayWidth / _size.width;
		var scaleToHeight = currentRatio >= defaultRatio;
		var letterBoxWidth = 0;
		var letterBoxHeight = 0;

		if (scaleToHeight)
		{
			letterBoxWidth = (displayWidth - _size.width * overallScale) / 2;
		}
		else
		{
			letterBoxHeight = (displayHeight - _size.height * overallScale) / 2;
		}

		// Optional clamps on the min and max scale of the item
		var itemScale = overallScale;
		if (this.minScale && itemScale < this.minScale)
		{
			itemScale = this.minScale;
		}
		else if (this.maxScale && itemScale > this.maxScale)
		{
			itemScale = this.maxScale;
		}

		adapter.setScale(_display, origScaleX * itemScale, "x");
		adapter.setScale(_display, origScaleY * itemScale, "y");

		// Positioning
		var m;
		var x;
		var y;

		// Vertical margin
		m = this.origMarginVert * overallScale;

		// Determine if vertical alignment should be title safe
		var titleSafe = this.titleSafe === true || this.titleSafe === "vertical";

		switch (this.vertAlign)
		{
			case ScaleManager.ALIGN_TOP:
				{
					if (titleSafe)
					{
						y = letterBoxHeight + m - origBounds.y * itemScale;
					}
					else
					{
						y = m - origBounds.y * itemScale;
					}
					break;
				}
			case ScaleManager.ALIGN_CENTER:
				{
					y = displayHeight * 0.5 - m;
					break;
				}
			case ScaleManager.ALIGN_BOTTOM:
				{
					if (titleSafe)
					{
						y = displayHeight - letterBoxHeight - m - origBounds.bottom * itemScale;
					}
					else
					{
						y = displayHeight - m - origBounds.bottom * itemScale;
					}
					break;
				}
		}

		// Set the position
		if (y !== null)
		{
			adapter.setPosition(_display, y, "y");
		}

		// Horizontal margin
		m = this.origMarginHori * overallScale;

		// Determine if horizontal alignment should be title safe
		titleSafe = this.titleSafe === true || this.titleSafe === "horizontal";

		switch (this.horiAlign)
		{
			case ScaleManager.ALIGN_LEFT:
				{
					if (titleSafe)
					{
						x = letterBoxWidth + m - origBounds.x * itemScale;
					}
					else
					{
						x = m - origBounds.x * itemScale;
					}
					break;
				}
			case ScaleManager.ALIGN_CENTER:
				{
					if (this.centeredHorizontally)
					{
						x = (displayWidth - _display.width) * 0.5;
					}
					else
					{
						x = displayWidth * 0.5 - m;
					}
					break;
				}
			case ScaleManager.ALIGN_RIGHT:
				{
					if (titleSafe)
					{
						x = displayWidth - letterBoxWidth - m - origBounds.right * itemScale;
					}
					else
					{
						x = displayWidth - m - origBounds.right * itemScale;
					}
					break;
				}
		}

		// Set the position
		if (x !== null)
		{
			adapter.setPosition(_display, x, "x");
		}
	};

	/**
	 * Destroy this item, don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._adapter = null;
		this.origBounds = null;
		this._display = null;
		this._size = null;
	};

	// Assign to namespace
	namespace('springroll').ScaleItem = ScaleItem;

}());
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	/**
	 * Initially layouts all interface elements
	 * @class Positioner
	 * @static
	 * @private
	 */
	var Positioner = {};

	// Conversion of degrees to radians
	var DEG_TO_RAD = Math.PI / 180;

	/**
	 * Initial position a single display object
	 * @method init
	 * @static
	 * @param {createjs.DisplayObject|PIXI.DisplayObject} display The display object to scale
	 * @param {Object} settings The values for setting
	 * @param {Number} [settings.x] The initial X position of the item
	 * @param {Number} [settings.y] The initial Y position of the item
	 * @param {Object} [settings.scale] The initial scale
	 * @param {Number} [settings.scale.x] The initial scale X value
	 * @param {Number} [settings.scale.y] The initial scale Y value
	 * @param {Object} [settings.pivot] The pivot or registration point.
	 * @param {Number} [settings.pivot.x] The pivot point X location
	 * @param {Number} [settings.pivot.y] The pivot point Y location
	 * @param {Number} [settings.rotation] The initial rotation in degrees
	 * @param {Object|Array} [settings.hitArea] An object which describes the hit area
	 *                                        of the item or an array of points. See
	 *                                        generateHitArea().
	 * @param {String} [settings.hitArea.type] If the hitArea is an object, the type
	 *                                       of hit area, "rect", "ellipse", "circle", etc
	 * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
	 *                                 in. If omitted, uses the Application's default display.
	 */
	Positioner.init = function(displayObject, settings, adapter)
	{
		//get the default adapter if not specified
		if (!adapter)
			adapter = springroll.ScaleManager._getAdapter();

		if (settings.x !== undefined)
		{
			adapter.setPosition(displayObject, settings.x, 'x');
		}

		if (settings.y !== undefined)
		{
			adapter.setPosition(displayObject, settings.y, 'y');
		}

		var pt = settings.scale;
		var scale = adapter.getScale(displayObject);

		if (pt)
		{
			adapter.setScale(displayObject, pt.x * scale.x, "x");
			adapter.setScale(displayObject, pt.y * scale.y, "y");
		}
		pt = settings.pivot;

		if (pt)
		{
			adapter.setPivot(displayObject, pt);
		}

		if (settings.rotation !== undefined)
		{
			displayObject.rotation = settings.rotation;
			if (adapter.useRadians)
			{
				displayObject.rotation *= DEG_TO_RAD;
			}
		}

		if (settings.hitArea)
		{
			adapter.setHitArea(
				displayObject,
				Positioner.generateHitArea(
					settings.hitArea, 1, adapter
				)
			);
		}
	};

	/**
	 * Create the polygon hit area for interface elements
	 * @static
	 * @method generateHitArea
	 * @param {Object|Array} hitArea One of the following:
	 *
	 *   // An array of points for a polygon.
	 *   [{x:0, y:0}, {x:0, y:20}, {x:20, y:0}]
	 *
	 *   // An object describing a rectangle.
	 *   {type:"rect", x:0, y:0, w:10, h:30}
	 *
	 *   // An object describing an ellipse, where x and y are the center.
	 *   {type:"ellipse", x:0, y:0, w:10, h:30}
	 *
	 *   // An object describing a circle, where x and y are the center.
	 *   {type:"circle", x:0, y:0, r:20}
	 *
	 *   // An object describing a sector, where x and y are the center of a circle
	 *   // and start/end are the start and end angles of the sector in degrees.
	 *   {type:"sector", x:0, y:0, r:20, start:0, end:90}
	 *
	 * @param {Number} scale The size to scale hitArea by
	 * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
	 *                                 in. If omitted, uses the Application's default display.
	 * @return {Object} A geometric shape object for hit testing, either a Polygon,
	 *                Rectangle, Ellipse, Circle, or Sector, depending on the hitArea object.
	 *                The shape will have a contains() function for hit testing.
	 */
	Positioner.generateHitArea = function(hitArea, scale, adapter)
	{
		//get the default adapter if not specified
		if (!adapter)
			adapter = springroll.ScaleManager._getAdapter();
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
				for (var i = 0, len = hitArea.length; i < len; ++i)
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
			// Convert center to upper left corner
			return new adapter.Ellipse(
				(hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale,
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
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Class imports
	var ScaleItem = include('springroll.ScaleItem'),
		ScaleImage = include('springroll.ScaleImage'),
		Positioner = include('springroll.Positioner'),
		Application = include('springroll.Application'),
		Debug;

	/**
	 * The UI scale is responsible for scaling UI components to help easy the burden of different
	 * device aspect ratios. The UI can expand either vertically or horizontally to fill excess
	 * space.
	 *
	 * @class ScaleManager
	 * @constructor
	 * @param {Object} [options] The options
	 * @param {Object} [options.size] The dimensions of the Scaler
	 * @param {Number} [options.size.width] The designed width
	 * @param {Number} [options.size.height] The designed height
	 * @param {Number} [options.size.maxwidth=size.width] The designed max width
	 * @param {Number} [options.size.maxheight=size.height] The designed max height
	 * @param {Object} [options.items] The items to load
	 * @param {PIXI.DisplayObjectContainer|createjs.Container} [options.container] The container if
	 *                                                                           adding items
	 * @param {Object} [options.display] The current display
	 * @param {Boolean} [options.enabled=false] If the scaler is enabled
	 */
	var ScaleManager = function(options)
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
		 * The configuration for each items
		 * @property {Array} _items
		 * @private
		 */
		this._items = [];

		/**
		 * The screen settings object, contains information about designed size
		 * @property {object} _size
		 * @private
		 */
		this._size = null;

		/**
		 * The current overall scale of the game
		 * @property {Number} _scale
		 * @private
		 * @default 1
		 */
		this._scale = 1;

		/**
		 * The adapter for universal scale, rotation size access
		 * @property {Object} _adapter
		 * @private
		 */
		this._adapter = null;

		/**
		 * The internal enabled
		 * @property {boolean} _enabled
		 * @private
		 */
		this._enabled = options.enabled;

		if (true)
		{
			/**
			 * If we should log verbose messages (unminified module only!)
			 * @property {Boolean} verbose
			 * @default false
			 */
			this.verbose = false;
		}

		// Set the designed size
		this.size = options.size;

		// Set the display so we can get an adapter
		this.display = options.display;

		if (options.items)
		{
			if (!options.container)
			{
				throw "ScaleManager requires container to add items";
			}
			this.addItems(options.container, options.items);
		}

		// Setup the resize bind
		this._resize = this._resize.bind(this);

		// Set the enabled status
		this.enabled = this._enabled;
	};

	// Reference to the prototype
	var p = extend(ScaleManager);

	/**
	 * Vertically align to the top
	 * @property {String} ALIGN_TOP
	 * @static
	 * @final
	 * @readOnly
	 * @default "top"
	 */
	var ALIGN_TOP = ScaleManager.ALIGN_TOP = "top";

	/**
	 * Vertically align to the bottom
	 * @property {String} ALIGN_BOTTOM
	 * @static
	 * @final
	 * @readOnly
	 * @default "bottom"
	 */
	var ALIGN_BOTTOM = ScaleManager.ALIGN_BOTTOM = "bottom";

	/**
	 * Horizontally align to the left
	 * @property {String} ALIGN_LEFT
	 * @static
	 * @final
	 * @readOnly
	 * @default "left"
	 */
	var ALIGN_LEFT = ScaleManager.ALIGN_LEFT = "left";

	/**
	 * Horizontally align to the right
	 * @property {String} ALIGN_RIGHT
	 * @static
	 * @final
	 * @readOnly
	 * @default "right"
	 */
	var ALIGN_RIGHT = ScaleManager.ALIGN_RIGHT = "right";

	/**
	 * Vertically or horizontally align to the center
	 * @property {String} ALIGN_CENTER
	 * @static
	 * @final
	 * @readOnly
	 * @default "center"
	 */
	var ALIGN_CENTER = ScaleManager.ALIGN_CENTER = "center";

	/**
	 * Get the adapter by display
	 * @method _getAdapter
	 * @private
	 * @param {object} display The canvas renderer display
	 */
	ScaleManager._getAdapter = function(display)
	{
		if (!display)
		{
			display = Application.instance.display;
		}

		if (!display) return null;

		// Check for a displayadpater, doesn't work with generic display
		if (!display.adapter)
		{
			if (true)
			{
				throw "The display specified is incompatible with ScaleManager because it doesn't contain an adapter";
			}
			else
			{
				throw "ScaleManager incompatible display";
			}
		}
		return display.adapter;
	};

	/**
	 * Set the display
	 * @property {springroll.AbstractDisplay} display
	 */
	Object.defineProperty(p, 'display',
	{
		set: function(display)
		{
			this._adapter = ScaleManager._getAdapter(display);
		}
	});

	/**
	 * The design sized of the application
	 * @property {Object} size
	 * @default null
	 */
	/**
	 * The designed width of the application
	 * @property {Number} size.width
	 */
	/**
	 * The designed width of the application
	 * @property {Number} size.height
	 */
	/**
	 * The designed max width of the application
	 * @property {Number} size.maxWidth
	 * @default  size.width
	 */
	/**
	 * The designed maxHeight of the application
	 * @property {Number} size.maxHeight
	 * @default  size.height
	 */
	Object.defineProperty(p, 'size',
	{
		set: function(size)
		{
			this._size = size;

			if (!size) return;

			if (!size.width || !size.height)
			{
				if (true && Debug)
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
	 * Get the current scale of the screen relative to the designed screen size
	 * @property {Number} scale
	 * @readOnly
	 */
	Object.defineProperty(p, 'scale',
	{
		get: function()
		{
			return this._scale;
		}
	});

	/**
	 * The total number of items
	 * @property {Number} numItems
	 * @readOnly
	 */
	Object.defineProperty(p, 'numItems',
	{
		get: function()
		{
			return this._items.length;
		}
	});

	/**
	 * Whether the ScaleManager should listen to the stage resize. Setting to true
	 * initialized a resize.
	 * @property {boolean} enabled
	 * @default true
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
	 * Remove all items where the item display is a the container or it contains items
	 * @method removeItems
	 * @param  {*} parent The object which contains the items as live variables.
	 * @param {Object} items The items that was passed to `addItems`
	 * @return {springroll.ScaleManager} The ScaleManager for chaining
	 */
	p.removeItems = function(parent, items)
	{
		var children = [];
		if (items)
		{
			// Get the list of children to remove
			for (var name in items)
			{
				if (parent[name])
				{
					children.push(parent[name]);
				}
			}
		}
		else
		{
			// @deprecated implementation
			if (true)
			{
				console.warn("ScaleManager.removeItems should have a second parameter which is the items dictionary e.g., removeItems(panel, items)");
			}
			return this.removeItemsByContainer(parent);
		}

		// Remove the items by children's list
		if (children.length)
		{
			var _itemsCopy = this._items.slice();
			var _items = this._items;
			_itemsCopy.forEach(function(item)
			{
				if (children.indexOf(item.display) > -1)
				{
					_items.splice(_items.indexOf(item), 1);
				}
			});
		}
		return this;
	};

	/**
	 * Remove all items where the item display is a child of the container display
	 * @method removeItemsByParent
	 * @param  {createjs.Container|PIXI.DisplayObjectContainer} container The container to remove items from
	 * @return {springroll.ScaleManager} The ScaleManager for chaining
	 */
	p.removeItemsByContainer = function(container)
	{
		var adapter = this._adapter;
		this._items.forEach(function(item, i, items)
		{
			if (adapter.contains(container, item.display))
			{
				items.splice(i, 1);
			}
		});
		return this;
	};

	/**
	 * Remove a single item from the scaler
	 * @method removeItem
	 * @param  {createjs.Bitmap|PIXI.Sprite|createjs.Container|PIXI.DisplayObjectContainer} display The object to remove
	 * @return {springroll.ScaleManager} The ScaleManager for chaining
	 */
	p.removeItem = function(display)
	{
		var items = this._items;
		for (var i = 0, len = items.length; i < len; i++)
		{
			if (items[i].display === display)
			{
				items.splice(i, 1);
				break;
			}
		}
		return this;
	};

	/**
	 * Register a dictionary of items to the ScaleManager to control.
	 * @method addItems
	 * @param {*} parent The parent object that contains the items as variables.
	 * @param {object} items The items object where the keys are the name of the property on the
	 *                     parent and the value is an object with keys of "titleSafe", "minScale",
	 *                     "maxScale", "centerHorizontally", "align", see ScaleManager.addItem for a
	 *                     description of the different keys.
	 * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
	 */
	p.addItems = function(parent, items)
	{
		// Temp variables
		var settings;
		var name;

		// Loop through all the items and register
		// Each dpending on the settings
		for (name in items)
		{
			settings = items[name];

			if (!parent[name])
			{
				if (true && Debug && this.verbose)
				{
					Debug.info("ScaleManager: could not find object '" + name + "'");
				}
				continue;
			}
			this.addItem(parent[name], settings, false);
		}
		Application.instance.triggerResize();
		return this;
	};

	/**
	 * Manually add an item
	 * @method addItem
	 * @param {createjs.DisplayObject|PIXI.DisplayObject} displayObject The display object item
	 * @param {object|String} [settings="center"] The collection of settings or the align property
	 * @param {String} [settings.align="center"] The vertical alignment ("top", "bottom", "center")
	 *      then horizontal alignment ("left", "right" and "center"). Or you can use the short-
	 *      handed versions: "center" = "center-center", "top" = "top-center", 
	 *      "bottom" = "bottom-center", "left" = "center-left", "right" = "center-right".
	 * @param {Boolean|String} [settings.titleSafe=false] If the item needs to be in the title safe
	 *      area. Acceptable values are false, "horizontal", "vertical", "all", and true.
	 *      The default is false, and true is the same as "all".
	 * @param {Number} [settings.minScale=NaN] The minimum scale amount (default, scales the same
	 *      size as the stage)
	 * @param {Number} [settings.maxScale=NaN] The maximum scale amount (default, scales the same
	 *      size as the stage)
	 * @param {Boolean} [settings.centeredHorizontally=false] Makes sure that the center of the
	 *      object is directly in the center of the stage assuming origin point is in
	 *      the upper-left corner.
	 * @param {Number} [settings.x] The initial X position of the item
	 * @param {Number} [settings.y] The initial Y position of the item
	 * @param {Object} [settings.scale] The initial scale
	 * @param {Number} [settings.scale.x] The initial scale X value
	 * @param {Number} [settings.scale.y] The initial scale Y value
	 * @param {Object} [settings.pivot] The pivot point
	 * @param {Number} [settings.pivot.x] The pivot point X location
	 * @param {Number} [settings.pivot.y] The pivot point Y location
	 * @param {Number} [settings.rotation] The initial rotation in degrees
	 * @param {Object|Array} [settings.hitArea] An object which describes the hit area of the item
	 *      or an array of points.
	 * @param {String} [settings.hitArea.type] If the hitArea is an object, the type of hit area,
	 *      "rect", "ellipse", "circle", etc
	 * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
	 */
	/**
	 * Add a bitmap to make be fullscreen
	 * @method  addItem
	 * @param {PIXI.Sprite|createjs.Bitmap} bitmap The bitmap to scale
	 * @param {String} settings      Must be 'cover-image'
	 * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
	 */
	p.addItem = function(displayObject, settings, doResize)
	{
		if (doResize === undefined)
		{
			doResize = true;
		}
		if (!settings)
		{
			settings = {
				align: ALIGN_CENTER
			};
		}

		if (settings === "cover-image")
		{
			this._items.push(new ScaleImage(displayObject, this._size, this._adapter));
		}
		else
		{
			if (typeof settings === "string")
			{
				settings = {
					align: settings
				};
			}
			var align = settings.align || ALIGN_CENTER;

			// Interpret short handed versions
			switch (align)
			{
				case ALIGN_CENTER:
					{
						align = align + "-" + align;
						break;
					}
				case ALIGN_LEFT:
				case ALIGN_RIGHT:
					{
						align = ALIGN_CENTER + "-" + align;
						break;
					}
				case ALIGN_TOP:
				case ALIGN_BOTTOM:
					{
						align = align + "-" + ALIGN_CENTER;
						break;
					}
			}

			// Error check the alignment value input
			if (!/^(center|top|bottom)\-(left|right|center)$/.test(align))
			{
				throw "Item align '" + align + "' is invalid for " + displayObject;
			}

			// Do the intial positioning of the display object
			Positioner.init(displayObject, settings, this._adapter);

			// Create the item settings
			var item = new ScaleItem(displayObject, align, this._size, this._adapter);

			item.titleSafe = settings.titleSafe == "all" ? true : settings.titleSafe;
			item.maxScale = settings.maxScale || NaN;
			item.minScale = settings.minScale || NaN;
			item.centeredHorizontally = !!settings.centeredHorizontally;

			this._items.push(item);
		}
		if (doResize)
		{
			Application.instance.triggerResize();
		}
		return this;
	};

	/**
	 * Scale the UI items that have been registered to the current screen
	 * @method _resize
	 * @private
	 * @param {Number} w The current width of the application
	 * @param {Number} h The current height of the application
	 */
	p._resize = function(w, h)
	{
		var _size = this._size;

		// Size hasn't been setup yet
		if (!_size)
		{
			if (true && Debug)
			{
				Debug.warn("Unable to resize scaling because the scaling size hasn't been set.");
			}
			return;
		}

		var defaultRatio = _size.width / _size.height;
		var currentRatio = w / h;
		this._scale = currentRatio > defaultRatio ?
			h / _size.height :
			w / _size.width;

		// Resize all the items
		this._items.forEach(function(item)
		{
			item.resize(w, h);
		});
	};

	/**
	 * Destroy the scaler object
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.enabled = false;

		this._items.forEach(function(item)
		{
			item.destroy();
		});

		this._adapter = null;
		this._size = null;
		this._items = null;
	};

	// Assign to namespace
	namespace('springroll').ScaleManager = ScaleManager;

}());
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		ScaleManager = include('springroll.ScaleManager'),
		Debug;

	/**
	 * @class Application
	 */
	//ScalingPlugin needs to be destroyed after StatesPlugin from the States module,
	//so it gets a slightly higher priority
	var plugin = new ApplicationPlugin(1);

	//Init the scaling
	plugin.setup = function()
	{
		Debug = include('springroll.Debug', false);

		/**
		 * The main ScaleManager for any display object references
		 * in the main game.
		 * @property {springroll.ScaleManager} scaling
		 */
		this.scaling = new ScaleManager();

		// Application should be responsive if using the scale manager
		this.options.override('responsive', true);

		//Add the scaling size
		this.once('configLoaded', function(config)
		{
			var scalingSize = config.scalingSize;
			if (scalingSize)
			{
				this.scaling.size = scalingSize;
			}
			else if (true && Debug)
			{
				Debug.warn("Recommended that config contains 'scalingSize' object with keys 'width' and 'height' an optionally 'maxWidth' and 'maxHeight'.");
			}
		});

		//Add the display
		this.once('afterInit', function()
		{
			var config = this.config;

			if (!config) return;

			if (config.scaling)
			{
				this.scaling.addItems(this, config.scaling);
			}
		});
	};

	//Setup the display
	plugin.preload = function(done)
	{
		this.scaling.display = this.display;
		this.scaling.enabled = true;
		done();
	};

	//Clean up
	plugin.teardown = function()
	{
		if (this.scaling) this.scaling.destroy();
		this.scaling = null;
	};

}());
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function(window)
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(100);

	// Init the animator
	plugin.setup = function()
	{
		var navigator = window.navigator;

		/**
		 * If the current brower is iOS
		 * @property {Boolean} isIOS
		 */
		this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;

		/**
		 * If the current brower is Android
		 * @property {Boolean} isAndroid
		 */
		this.isAndroid = navigator.userAgent.search(/Android/) > -1;

		/**
		 * If the current brower has touch input available
		 * @property {Boolean} hasTouch
		 */
		this.hasTouch = !!(('ontouchstart' in window) || // iOS & Android
			(navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
			(navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+

		if (true)
		{
			/**
			 * Manually override the check for hasTouch (unminifed library version only)
			 * @property {Boolean} options.forceTouch
			 * @default false
			 */
			this.options.add('forceTouch', false)
				.on('forceTouch', function(value)
					{
						if (value === "true" || value === true)
							this.hasTouch = true;
					}
					.bind(this));

			var DebugOptions = include('springroll.DebugOptions', false);
			if (DebugOptions)
			{
				DebugOptions.boolean('forceTouch', 'Force hasTouch to true');
			}
		}
	};

	// Add common filteres interaction
	plugin.preload = function(done)
	{
		if (true)
		{
			var value = this.options.forceTouch;
			if (value === "true" || value === true)
				this.hasTouch = true;
		}

		// Add the interaction filters, must have interface module MobilePlugin
		if (this.filters)
		{
			var ui = !!this.hasTouch ? '_touch' : '_mouse';
			this.filters.add('%INTERACTION%', ui);
			this.filters.add('%UI%', ui);
		}
		done();
	};

}(window));
/**
 * @module UI
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var ScaleManager = include('springroll.ScaleManager');
	var p = ScaleManager.prototype;

	/**
	 * @class ScaleManager
	 */
	/**
	 * See {{#crossLink "springroll.ScaleManager/addItem:method"}}{{/crossLink}}
	 * @method addBackground
	 * @deprecated since version 0.4.0
	 */
	p.addBackground = function(bitmap)
	{
		if (true) console.warn("addBackground is now deprecated, please use addItem: e.g.: app.scaling.addItem(bitmap, 'cover-image'); ");
		this.addItem(bitmap, 'cover-image', true);
		return this;
	};

	/**
	 * See {{#crossLink "springroll.ScaleManager/removeItem:method"}}{{/crossLink}}
	 * @method removeBackground
	 * @deprecated since version 0.4.0
	 */
	p.removeBackground = function(bitmap)
	{
		if (true) console.warn("removeBackground is now deprecated, please use removeItem: e.g.: app.scaling.removeItem(bitmap); ");
		this.removeItem(bitmap);
		return this;
	};

	/**
	 * See {{#crossLink "springroll.UIScaler"}}{{/crossLink}}
	 * @class UIScaler
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(springroll, 'UIScaler',
	{
		get: function()
		{
			if (true) console.warn("springroll.UIScaler now deprecated, please use ScaleManager: e.g.: springroll.ScaleManager");
			return ScaleManager;
		}
	});

}());