/*! SpringRoll 0.0.6 */
!function(){"use strict";/**
*  @module Language
*  @namespace springroll
*/
(function(window, undefined){
	
	var CacheManager = springroll.CacheManager;
	
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
/**
*  @module Translate
*  @namespace springroll
*/
(function(window, undefined){

	var $ = include('jQuery');

	/**
	*  Internationalization/translation object with convenient jquery plugin
	*  @class Translate
	*  @static
	*/
	var Translate = {};

	/**
	*  The full language dictionary containing all languages as keys
	*  @property {object} _dict
	*  @private
	*  @static
	*/
	var _dict = null,

	/**
	*  The current set of translations to use
	*  @property {object} _current
	*  @private
	*  @static
	*/
	_current = null,

	/**
	*  The currently selected locale
	*  @property {String|Array} _locale
	*  @private
	*  @static
	*/
	_locale = null,

	/**
	*  The fallback locale if no translation is found
	*  @property {String} _fallbackLocale
	*  @private
	*  @static
	*/
	_fallbackLocale = null,

	/**
	*  Reference to the slice method
	*  @property {function} _slice
	*  @private
	*  @static
	*/
	_slice = Array.prototype.slice;

	/**
	*  Load the full dictionary containing all translations, this can also be used to load
	*  separate JSON files which contain the translation. Each JSON file can contain keys
	*  matching the locale which to use, or a single locale:
	*
	*	// Load external json for all locales
	*	Translate.load("lang.json", function(){ 
	*		// Finished loading
	*	});
	*	
	*	// Or load all locales directly
	*	var dict = {
	*		"en" : {
	*			"title" : "My Site"
	*		}
	*	};
	*	Translate.load(dict);
	*	
	*	// Or loading a single local externally
	*	Translate.load("locale/en/lang.json", "en", function(){
	*		// Finished loading
	*	});
	*	
	*	// Or load a single local directly
	*	var dict = {
	*		"title" : "My Site"
	*	};
	*	Translate.load(dict, "en");
	*
	*  @method load
	*  @static
	*  @param {object|String} dict The translation dictionary or file path to the translation dictionary
	*  @param {String|Function} [langOrCallback] Either the language code or the function callback for file loading
	*  @param {function} [callback] The methond to callback if we're loading a file
	*  @return {Translate} The Translate object for chaining
	*/
	Translate.load = function(dict, langOrCallback, callback)
	{
		var lang = null;

		if (typeof langOrCallback == "function")
		{
			callback = langOrCallback;
		}
		else if (typeof langOrCallback == "string")
		{
			lang = langOrCallback;
		}

		// Load the file
		if (typeof dict == "string")
		{
			var onLoaded = function(data)
			{
				Translate.load(data, lang);
				if (callback)
					callback();
			};
			// Load the JSON
			$.get(dict, onLoaded, "json");
		}
		else
		{
			_dict = _dict || {};

			// Set the specific language
			if (lang)
			{
				_dict[lang] = dict;
				_locale = lang;
			}
			// merge with the existing
			else
			{
				$.extend(_dict, dict);
			}
			refresh();
		}
		return Translate;
	};

	/**
	*  The separator between the file name and the locale
	*  if using the filename translation. For instance, "myfile.png" becomes "myfile_en-US.png"
	*  joining "myfile" with the separator, locale then file extension.
	*  @property {String} fileSeparator
	*  @static
	*  @default "_"
	*/
	Translate.fileSeparator = "_";

	/**
	*  Remove all of the current dictionaries stored and the saved locale
	*  @method reset
	*  @static
	*  @return {Translate} The Translate object for chaining
	*/
	Translate.reset = function()
	{
		_dict = 
		_locale = 
		_fallbackLocale = 
		_current = null;

		return Translate;
	};

	/**
	*  Auto detect the locale based on the window navigator object
	*  @method autoDetect
	*  @static
	*  @param {Boolean} [useCountryLocale=true] If we should use the country locale (e.g., "en-US")
	*         as well as the language. 
	*  @return {Array|String} The new locale selected, returns a string if `useCountryLocale` is false.
	*/
	Translate.autoDetect = function(useCountryLocale)
	{
		var lang = (window.navigator.userLanguage || window.navigator.language);
		useCountryLocale = (useCountryLocale === undefined) ? true : useCountryLocale;
		var langOnly = lang.substr(0,2);
		_locale = useCountryLocale ? [lang, langOnly] : langOnly;
		refresh();
		return _locale;
	};

	/**
	*  The optional fallback locale to use in all cases
	*  @property {String} fallbackLocale
	*  @static
	*/
	Object.defineProperty(Translate, "fallbackLocale", 
	{
		set: function(locale)
		{
			_fallbackLocale = locale;
			refresh();
		},
		get: function()
		{
			return _fallbackLocale;
		}
	});

	/**
	*  The current ISO-639-1 two-letter language locale
	*  @property {String|Array} locale
	*  @static
	*/
	Object.defineProperty(Translate, "locale", 
	{
		set: function(locale)
		{
			_locale = locale;
			refresh();
		},
		get: function()
		{
			return _locale;
		}
	});

	/**
	*  Rebuild the current dictionary of translations to use
	*  @method refresh
	*  @static
	*  @private
	*/
	var refresh = function()
	{
		// Ignore if no locale or dictionary is set
		if (!_locale || !_dict) return;

		_current = {};

		// Select the locale
		var locales = getLocales();

		// Add the locale starting at the end first
		for (var i = locales.length - 1; i >= 0; i--)
		{
			var lang = locales[i];
			$.extend(_current, _dict[lang] || {});
		}

		// Do the automatic localizations
		$("[data-localize]")._t();
		$("[data-localize-file]")._f();
	};

	/**
	*  Get the locales with the fallback
	*  @method getLocales
	*  @static
	*  @private
	*  @return {Array} The collection of locales where the first index is the highest priority
	*/
	var getLocales = function()
	{
		// Select the locale
		var locales = (typeof _locale == "string") ? [_locale] : _locale.slice(0);

		// Add the fallback
		if (_fallbackLocale && locales.indexOf(_fallbackLocale) == -1)
		{
			locales.push(_fallbackLocale);
		}
		return locales;
	};

	/**
	*  Looks the given string up in the dictionary and returns the translation if
	*  one exists. If a translation is not found, returns the original word.
	*  @method translateString
	*  @static
	*  @private
	*  @param {string} key The translation key look-up to translate.
	*  @param {object} params.. params for using printf() on the string.
	*  @return {string} Translated word.
	*/
	var translateString = function(key)
	{
		if (!_current)
		{
			throw 'Must call Translate.load() before getting the translation';
		}

		if (_current.hasOwnProperty(key))
		{
			key = _current[key];
		}
		else
		{
			throw "No translation string found matching '" + key + "'";
		}

		args = _slice.call(arguments);
		args[0] = key;

		// Substitute any params
		return printf.apply(null, args);
	};

	/**
	*  Converts a file to a localized version using the first locale. If no locale
	*  is set, returns the original file.
	*  @method translateFile
	*  @private
	*  @param {string} file The file path
	*  @return {string} The updated file path containing local
	*/
	var translateFile = function(file)
	{
		// Bail out
		if (!_locale) return file;
		
		var locales = getLocales(),
			index = file.lastIndexOf("."),
			http = new XMLHttpRequest(),
			url,
			lang;

		// Add the locale starting at the end first
		for (var i = 0, len = locales.length; i < len; i++)
		{
			lang = locales[i];
			url = file.substring(0, index) + Translate.fileSeparator + lang + file.substring(index, file.length);
			
			http.open('HEAD', url, false);
			http.send();

			// If the file exists, return
			if (http.status != 404)
			{
				return url;
			}
		}
		// No language or fallback, then return the original file
		return file; 
	};

	/**
	*  Substitutes %s with parameters given in list. %%s is used to escape %s.
	*  @method printf
	*  @private
	*  @param {string} str String to perform printf on.
	*  @param {string} args	Array of arguments for printf.
	*  @return {string} Substituted string
	*/
	var printf = function(str, args)
	{
		if (arguments.length < 2) return str;
		args = $.isArray(args) ? args : _slice.call(arguments, 1);

		return str.replace(
			/([^%]|^)%(?:(\d+)\$)?s/g, 
			function(p0, p, position)
			{
				if (position)
				{
					return p + args[parseInt(position)-1];
				}
				return p + args.shift();
			}
		).replace(/%%s/g, '%s');
	};

	/**
	*  Allows you to translate a jQuery selector. See window._t for more information.
	*
	*	$('h1')._t('some text')
	*
	*  @method $.fn._t
	*  @static
	*  @param {string} key The string to translate .
	*  @param {mixed} [params] Params for using printf() on the string.
	*  @return {element} Chained and translated element(s).
	*/
	$.fn._t = function()
	{
		// Capture the arguments
		var args = arguments;
		
		return this.each(function(){

			var self = $(this);
			var localArgs = _slice.call(args, 0);

			if (localArgs.length === 0)
			{
				var key = self.data('localize');
				var values = self.data('localize-values');

				if (!key)
				{
					throw "Must either pass in a key to localize or use the data-localize attribute";
				}
				Array.prototype.push.call(localArgs, key);

				if (values)
				{
					localArgs = localArgs.concat(values.split(","));
				}
			}
			return self.html(translateString.apply(null, localArgs));
		});		
	};

	/**
	*  Allows you to swap an localized file path with jQuery selector. See window._f for more information.
	*
	*	$('img#example')._f()
	*
	*  @method $.fn._f
	*  @static
	*  @param {string} [attr="src"] The attribute to change the file for
	*  @return {element} Chained and translated element(s).
	*/
	$.fn._f = function(attr)
	{
		var self = $(this);
		
		if (self.length === 0) return;

		var file = self.data('localize-file') || self.attr('src');
		self.data('localize-file', file);

		return self.attr(attr || "src", translateFile(file));
	};

	/**
	*  Looks the given string up in the dictionary and returns the translation if
	*  one exists. If a translation is not found, returns the original word.
	*  @method window._t
	*  @static
	*  @param {string} str The string to translate.
	*  @param {mixed} [params*] params for using printf() on the string.
	*  @return {string} Translated word.
	*/
	window._t = translateString;

	/**
	*  Converts a file to a localized version using the locale preferences. If no locale
	*  is set or no valid files are found, returns the original file.
	*  @method window._f
	*  @static
	*  @param {string} file The file path     
	*  @return {string} The updated file path containing local
	*/
	window._f = translateFile;

	// Assign to namespace
	namespace('springroll').Translate = Translate;

})(window);}();