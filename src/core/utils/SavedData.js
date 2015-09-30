/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
	 *
	 * @class SavedData
	 */
	var SavedData = {};

	/** 
	 * A constant to determine if we can use localStorage and 
	 * sessionStorage 
	 * @static
	 * @property {Boolean} WEB_STORAGE_SUPPORT
	 * @private
	 * @readOnly
	 */
	var WEB_STORAGE_SUPPORT = window.Storage !== undefined;

	/**
	 * A constant for cookie fallback for `SavedData.clear()` 
	 * @static
	 * @property {int} ERASE_COOKIE
	 * @private
	 * @readOnly
	 * @default -1
	 */
	var ERASE_COOKIE = -1;

	//in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
	if (WEB_STORAGE_SUPPORT)
	{
		try
		{
			localStorage.setItem("LS_TEST", "test");
			localStorage.removeItem("LS_TEST");
		}
		catch (e)
		{
			WEB_STORAGE_SUPPORT = false;
		}
	}

	/**
	 * Remove a saved variable by name.
	 * @method remove
	 * @static
	 * @param {String} name The name of the value to remove
	 */
	SavedData.remove = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			localStorage.removeItem(name);
			sessionStorage.removeItem(name);
		}
		else
			SavedData.write(name, "", ERASE_COOKIE);
	};

	/**
	 * Save a variable.
	 * @method write
	 * @static
	 * @param {String} name The name of the value to save
	 * @param {mixed} value The value to save. This will be run through JSON.stringify().
	 * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
	 */
	SavedData.write = function(name, value, tempOnly)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			if (tempOnly)
				sessionStorage.setItem(name, JSON.stringify(value));
			else
				localStorage.setItem(name, JSON.stringify(value));
		}
		else
		{
			var expires;
			if (tempOnly)
			{
				if (tempOnly !== ERASE_COOKIE)
					expires = ""; //remove when browser is closed
				else
					expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT"; //save cookie in the past for immediate removal
			}
			else
				expires = "; expires=" + new Date(2147483646000).toGMTString(); //THE END OF (32bit UNIX) TIME!

			document.cookie = name + "=" + escape(JSON.stringify(value)) + expires + "; path=/";
		}
	};

	/**
	 * Read the value of a saved variable
	 * @method read
	 * @static
	 * @param {String} name The name of the variable
	 * @return {mixed} The value (run through `JSON.parse()`) or null if it doesn't exist
	 */
	SavedData.read = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			var value = localStorage.getItem(name) || sessionStorage.getItem(name);
			if (value)
				return JSON.parse(value, SavedData.reviver);
			else
				return null;
		}
		else
		{
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i = 0,
				c, len;

			for (i = 0, len = ca.length; i < len; i++)
			{
				c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return JSON.parse(unescape(c.substring(nameEQ.length, c.length)), SavedData.reviver);
			}
			return null;
		}
	};

	/**
	 * When restoring from JSON via `JSON.parse`, we may pass a reviver function.
	 * In our case, this will check if the object has a specially-named property (`__classname`).
	 * If it does, we will attempt to construct a new instance of that class, rather than using a
	 * plain old Object. Note that this recurses through the object.
	 * @method reviver
	 * @static
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
	 * @param  {String} key   each key name
	 * @param  {Object} value Object that we wish to restore
	 * @return {Object}       The object that was parsed - either cast to a class, or not
	 */
	SavedData.reviver = function(key, value)
	{
		if (value && typeof value.__classname == "string")
		{
			var _class = include(value.__classname, false);
			if (_class)
			{
				var rtn = new _class();
				//if we may call fromJSON, do so
				if (rtn.fromJSON)
				{
					rtn.fromJSON(value);
					//return the cast Object
					return rtn;
				}
			}
		}
		//return the object we were passed in
		return value;
	};

	// Assign to the global space
	namespace('springroll').SavedData = SavedData;

}());