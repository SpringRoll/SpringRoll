/**
*  @module cloudkid
*/
(function(global, doc, undefined){
	
	"use strict";
	
	/**
	*  Handle the page visiblity change, if supported. Application uses one of these to
	*  monitor page visibility. It is suggested that you listen to "pause", "paused", 
	*  or "unpaused" events on the application instead of using one of these yourself.
	*  
	*  @class PageVisibility
	*  @constructor
	*  @param {function} onFocus Callback when the page becomes visible
	*  @param {function} onBlur Callback when the page loses visibility
	*/
	var PageVisibility = function(onFocus, onBlur)
	{
		this.initialize(onFocus, onBlur);
	},
	
	// Reference to the prototype 
	p = PageVisibility.prototype,
	
	/** 
	* The name of the visibility change event for the browser
	* 
	* @property {String} _visibilityChange
	* @private
	*/
	_visibilityChange = null;
	
	/**
	* Callback when the page becomes visible
	* @property {function} _onFocus
	* @private
	*/
	p._onFocus = null;
	
	/**
	* Callback when the page loses visibility
	* @property {function} _onBlur
	* @private
	*/
	p._onBlur = null;
	
	/**
	* The visibility toggle function
	* @property {function} _onToggle
	* @private
	*/
	p._onToggle = null;
	
	// Select the visiblity change event name
	if (doc.hidden !== undefined)
	{
		_visibilityChange = "visibilitychange";
	} 
	else if (doc.mozHidden !== undefined)
	{
		_visibilityChange = "mozvisibilitychange";
	} 
	else if (doc.msHidden !== undefined)
	{
		_visibilityChange = "msvisibilitychange";
	} 
	else if (doc.webkitHidden !== undefined)
	{
		_visibilityChange = "webkitvisibilitychange";
	}
	
	/**
	*  Create new Page visibility
	*  
	*  @method initialize
	*  @param {function} onFocus The callback when the page comes into focus
	*  @param {function} onBlur The callback when the page loses focus
	*/
	p.initialize = function(onFocus, onBlur)
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		this._onBlur = onBlur;
		this._onFocus = onFocus;
		
		// The visibility toggle function
		var onVisibilityChange = function() 
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				onBlur();
			else 
				onFocus();
		};
		
		// Listen to visibility change
		// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
		doc.addEventListener(_visibilityChange, onVisibilityChange, false);
		
		// Listen for page events (when clicking the home button on iOS)
		global.addEventListener("pagehide", onBlur);
		global.addEventListener("pageshow", onFocus);
		global.addEventListener("blur", onBlur);
		global.addEventListener("focus", onFocus);
		global.addEventListener("visibilitychange", onVisibilityChange, false);
		
		this._onToggle = onVisibilityChange;
	};
	
	/**
	*  Disable the detection
	*  @method destroy
	*/
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		global.removeEventListener("pagehide", this._onBlur);
		global.removeEventListener("pageshow", this._onFocus);
		global.removeEventListener("blur", this._onBlur);
		global.removeEventListener("focus", this._onFocus);
		global.removeEventListener("visibilitychange", this._onToggle);
		
		doc.removeEventListener(_visibilityChange, this._onToggle, false);
		
		this._onFocus = null;
		this._onBlur = null;
	};
	
	// Assign to the global space
	namespace('cloudkid').PageVisibility = PageVisibility;
	
}(window, document));