/**
*  @module Interface
*  @namespace cloudkid
*/
(function(){
	
	/**
	*  The UI Item Settings which is the positioning settings used to adjust each element
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
		*  If this element should be aligned to the title safe area, not the actual screen 
		*  @property {Boolean} titleSafe
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
	namespace('cloudkid').UIElementSettings = UIElementSettings;

}());