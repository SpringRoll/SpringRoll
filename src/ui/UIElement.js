/**
*  @module Interface
*  @namespace cloudkid
*/
(function() {

	// Class imports
	var UIScaler;

	/**
	*   A single UI item that needs to be resized	
	*
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
				y = m - this.origBounds.y * this.origScaleY * itemScale;
				break;
			}
			case UIScaler.ALIGN_CENTER:
			{
				y = newScreen.height * 0.5 - m;
				break;
			}
			case UIScaler.ALIGN_BOTTOM:
			{
				y = newScreen.height - m - this.origBounds.bottom * this.origScaleY * itemScale;
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
					x = letterBoxWidth + m - this.origBounds.x * this.origScaleX * itemScale;
				}
				else
				{
					x = m - this.origBounds.x * this.origScaleX * itemScale;
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
					x = newScreen.width - letterBoxWidth - m - this.origBounds.right * this.origScaleX * itemScale;
				}
				else
				{
					x = newScreen.width - m - this.origBounds.right * this.origScaleX * itemScale;
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