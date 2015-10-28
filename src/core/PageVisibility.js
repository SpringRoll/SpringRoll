/**
 * @module Core
 * @namespace springroll
 */
(function(global, doc, undefined)
{

	/**
	 * Handle the page visiblity change, if supported. Application uses one of these to
	 * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
	 * or `resumed` events on the Application instead of using one of these yourself.
	 *
	 * @class PageVisibility
	 * @constructor
	 * @param {Function} onFocus Callback when the page becomes visible
	 * @param {Function} onBlur Callback when the page loses visibility
	 */
	var PageVisibility = function(onFocus, onBlur)
	{
		/**
		 * Callback when the page becomes visible
		 * @property {Function} _onFocus
		 * @private
		 */
		this._onFocus = onFocus;

		/**
		 * Callback when the page loses visibility
		 * @property {Function} _onBlur
		 * @private
		 */
		this._onBlur = onBlur;

		/**
		 * If this object is enabled.
		 * @property {Function} _enabled
		 * @private
		 */
		this._enabled = false;

		// If this browser doesn't support visibility
		if (!_visibilityChange && doc.onfocusin === undefined) return;

		/**
		 * The visibility toggle listener function
		 * @property {Function} _onToggle
		 * @private
		 */
		this._onToggle = function()
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				this._onBlur();
			else
				this._onFocus();
		}.bind(this);

		this.enabled = true;
	};

	// Reference to the prototype
	var p = extend(PageVisibility);

	/**
	 * The name of the visibility change event for the browser
	 *
	 * @property {String} _visibilityChange
	 * @private
	 */
	var _visibilityChange = null;

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

	var isIE9 = !_visibilityChange && doc.onfocusin !== undefined;

	/**
	 * If this object is enabled.
	 * @property {Function} enabled
	 * @private
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			value = !!value;
			if (this._enabled == value) return;
			this._enabled = value;

			global.removeEventListener("pagehide", this._onBlur);
			global.removeEventListener("pageshow", this._onFocus);
			global.removeEventListener("blur", this._onBlur);
			global.removeEventListener("focus", this._onFocus);
			global.removeEventListener("visibilitychange", this._onToggle);
			doc.removeEventListener(_visibilityChange, this._onToggle, false);
			if (isIE9)
			{
				doc.removeEventListener("focusin", this._onFocus);
				doc.removeEventListener("focusout", this._onBlur);
			}

			if (value)
			{
				// Listen to visibility change
				// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
				doc.addEventListener(_visibilityChange, this._onToggle, false);
				// Listen for page events (when clicking the home button on iOS)
				global.addEventListener("pagehide", this._onBlur);
				global.addEventListener("pageshow", this._onFocus);
				global.addEventListener("blur", this._onBlur);
				global.addEventListener("focus", this._onFocus);
				global.addEventListener("visibilitychange", this._onToggle, false);
				//IE9 is old and uses its own events
				if (isIE9)
				{
					doc.addEventListener("focusin", this._onFocus);
					doc.addEventListener("focusout", this._onBlur);
				}
			}
		}
	});

	/**
	 * Disable the detection
	 * @method destroy
	 */
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange || !this._onToggle) return;

		this.enabled = false;
		this._onToggle = null;
		this._onFocus = null;
		this._onBlur = null;
	};

	// Assign to the global space
	namespace('springroll').PageVisibility = PageVisibility;

}(window, document));