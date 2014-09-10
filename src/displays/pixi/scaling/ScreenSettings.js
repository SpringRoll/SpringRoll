(function() {
	
	"use strict";

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
	namespace('cloudkid.pixi').ScreenSettings = ScreenSettings;

}());