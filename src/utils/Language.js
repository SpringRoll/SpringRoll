/**
*  @module Language
*  @namespace springroll
*/
(function(window, undefined){
	
	var CacheManager = springroll.CacheManager,
		EventDispatcher = springroll.EventDispatcher;
	
	/**
	*  Keeps track of the user locale, by auto-detecting the browser language, allowing a user
	*  selection, and automatically modifying any url that runs through the CacheManager.
	*
	*  @class Language
	*  @extend EventDispatcher
	*  @constructor
	*  @param {Object} config The language settings to be used.
	*  @param {String} config.default The default language name to use if asked for one that is
	*                                 not present.
	*  @param {Object} config.languages A dictionary of all supported languages, indexed by locale
	*                                   name (dialects allowed). You may want other data in each
	*                                   entry, like the language name in that language, or number
	*                                   separator.
	*  @param {String} [config.replace="%LANG%"] A string to replace in urls with the current
	*                                            language.
	*/
	var Language = function(config)
	{
		if (_instance)
		{
			throw "Only one Language can exist at a time!";
		}
		_instance = this;
		
		EventDispatcher.call(this);
		
		if(!config.languages || !config.default)
			throw "Language requires a language dictionary and a default language!";
		
		/**
		*  The value to replace with the current language in URLS.
		*  @property {String} _replace
		*  @private
		*  @default "%LANG%"
		*/
		this._replace = config.replace || "%LANG%";
		
		/**
		*  The current language.
		*  @property {String} _current
		*  @private
		*/
		this._current = null;
		
		/**
		*  The default language.
		*  @property {String} _default
		*  @private
		*/
		this._default = config.default;
		
		/**
		*  Available languages, with any data specific to that language.
		*  @property {Dictionary} languages
		*  @public
		*/
		this.languages = config.languages;
		
		/**
		*  A dictionary of translated strings, set with setStringTable().
		*  @property {Dictionary} _stringTable
		*  @private
		*/
		this._stringTable = null;
		
		//set the initial language
		this.setLanguage(this.getPreferredLanguages());
		
		//connect to the CacheManager
		this.modifyUrl = this.modifyUrl.bind(this);
		CacheManager.instance.registerURLFilter(this.modifyUrl);
	};
	
	// Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = Language.prototype = Object.create(s);
	
	/**
	*  Fired when the chosen language has changed.
	*  @event changed
	*  @param {String} language The newly chosen language.
	*/
	var CHANGED = 'changed';
	
	/**
	*  Get the singleton instance of the Language object.
	*  @property {Language} instance
	*  @static
	*  @public
	*/
	var _instance = null;
	Object.defineProperty(Language, "instance", {
		get: function() {
			return _instance;
		}
	});
	
	/**
	*  The current language.
	*  @property {String} current
	*  @readOnly
	*  @public
	*/
	Object.defineProperty(p, "current", {
		get: function() {
			return this._current;
		}
	});
	
	/**
	* Gets the languages currently supported.
	* @method getSupportedLanguages
	* @return {Array} The list of languages that this Language object recognizes.
	*/
	p.getSupportedLanguages = function()
	{
		var rtn = [];
		for(var locale in this.languages)
			rtn.push(locale);
		return rtn;
	};
	
	/**
	 * Gets the preferred languages from the browser.
	 * @method getPreferredLanguages
	 * @return {Array} The list of preferred languages in order of preference.
	 */
	p.getPreferredLanguages = function()
	{
		var rtn;
		var navigator = window.navigator;
		if(navigator.languages)
		{
			//use the newer Firefox and Chrome language list if available.
			rtn = navigator.languages;
		}
		else if(navigator.language)
		{
			//fall back to the browser's UI language
			rtn = [navigator.language || navigator.userLanguage];
		}
		else
			rtn = [];
		return rtn;
	};
	
	/**
	* Sets the current language, based on specified preferences and what is available.
	* @method setLanguage
	* @param {Array|String} languageList The list of preferred languages in order of preference,
	*                                    or a single language.
	*/
	p.setLanguage = function(languageList)
	{
		if(!languageList) return;
		
		if(!Array.isArray(languageList))
			languageList = [languageList];
		
		var chosen;
		for(var i = 0, len = languageList.length; i < len; ++i)
		{
			var language = languageList[i];
			if(this.languages[language])
			{
				//check to see if we have the full language and dialect (if included)
				chosen = language;
				break;
			}
			else if(language.indexOf("-") >= 0)
			{
				//check to see if we have the language without the dialect
				language = language.split("-")[0];
				if(this.languages[language])
				{
					chosen = language;
					break;
				}
			}
		}
		if(!chosen)
			chosen = this._default;
		if(chosen != this._current)
		{
			this._current = chosen;
			this.trigger(CHANGED, chosen);
		}
	};
	
	/**
	* Sets the string table for later reference.
	* @method setStringTable
	* @param {Dictionary} dictionary The string table, with keys that you would use to reference
	*                                the translations.
	*/
	p.setStringTable = function(dictionary)
	{
		this._stringTable = dictionary;
	};
	
	/**
	* Gets a string from the current string table.
	* @method getString
	* @param {String} key The key of the string to get.
	* @return {String} The translated string.
	*/
	p.getString = function(key)
	{
		return this._stringTable ? this._stringTable[key] : null;
	};
	
	/**
	* Modifies a url, replacing a specified value with the current language.
	* @method modifyUrl
	* @param {String} url The url to modify to a language specific version.
	*/
	p.modifyUrl = function(url)
	{
		while(url.indexOf(this._replace) >= 0)
			url = url.replace(this._replace, this._current);
		return url;
	};
	
	/**
	* Destroys the Language object.
	* @method destroy
	*/
	p.destroy = function()
	{
		s.destroy.call(this);
		if(CacheManager.instance)
			CacheManager.instance.unregisterURLFilter(this.modifyUrl);
		this.modifyUrl = this.languages = null;
	};
	
	// Assign to namespace
	namespace('springroll').Language = Language;

})(window);