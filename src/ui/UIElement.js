/**
 * @module UI
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

	if (DEBUG)
	{
		p.toString = function()
		{
			return "[UIElement (vertAlign='"+this._settings.vertAlign+"', horiAlign='"+this._settings.horiAlign+"')]";
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
			return this._item;
		}
	});
	
	
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