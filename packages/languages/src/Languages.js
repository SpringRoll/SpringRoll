import {EventEmitter} from '@springroll/core';
import {StringUtils} from '@springroll/utils';

/**
 * Keeps track of the user locale, by auto-detecting the browser language, allowing a user
 * selection, and automatically modifying any url that runs through the CacheManager.
 * ### module: @springroll/languages
 * @class
 * @memberof springroll
 * @extends springroll.EventEmitter
 */
export default class Languages extends EventEmitter {
    /**
     * @param {springroll.Loader} loader - Instance of springroll's loader
     */
    constructor(loader) {
        super();

        /**
         * The value to replace with the current language in URLS.
         * @member {string}
         * @private
         * @default "%LANG%"
         */
        this._replace = '%LANG%';

        /**
         * The current language.
         * @member {string}
         * @private
         */
        this._current = null;

        /**
         * The default language.
         * @member {string}
         * @private
         */
        this._default = null;

        /**
         * Available languages.
         * @member {Array}
         */
        this.languages = null;

        /**
         * A dictionary of translated strings, set with setStringTable().
         * @member {Dictionary}
         * @private
         */
        this._stringTable = null;

        /**
         * Reference to the springroll Loader
         * @member {springroll.Loader}
         * @private
         */
        this._loader = loader;
    }

    /**
     * Fired when the chosen language has changed.
     * @event springroll.Languages#changed
     * @param {string} language The newly chosen language.
     */

    /**
     * Configure 
     * @param {object} config The language settings to be used.
     * @param {string} config.default The default language name to use if asked for one that is
     *                              not present.
     * @param {Array} config.languages An array of all supported languages, with entries being
     *                               locale ids (dialects allowed). Locale ids should be lower
     *                               case.
     * @param {string} [config.replace="%LANG%"] A string to replace in urls with the current
     *                                          language.
     */
    setConfig(config) {
        if (!config.languages || !config.default) {
            throw 'Languages requires a language dictionary and a default language!';
        }

        this._replace = config.replace || this._replace;
        this._default = config.default;
        this.languages = config.languages;

        //set the initial language
        this.setLanguage(this.getPreferredLanguages());

        //connect to the CacheManager
        this.modifyUrl = this.modifyUrl.bind(this);
        this._loader.cacheManager.registerURLFilter(this.modifyUrl);
    }

    /**
     * The current language.
     * @member {string}
     * @readOnly
     */
    get current() {
        return this._current;
    }

    /**
     * Gets the preferred languages from the browser.
     * @return {Array} The list of preferred languages in order of preference.
     */
    getPreferredLanguages() {
        let result;
        const navigator = window.navigator;
        if (navigator.languages) {
            //use the newer Firefox and Chrome language list if available.
            result = navigator.languages;
        }
        else if (navigator.language) {
            //fall back to the browser's UI language
            result = [navigator.language || navigator.userLanguage];
        }
        else {
            result = [];
        }
        return result;
    }

    /**
     * Sets the current language, based on specified preferences and what is available.
     * @param {Array|string} languageList The list of preferred languages in order of preference,
     *                                or a single language.
     */
    setLanguage(languageList) {
        if (!languageList) {
            return;
        }

        if (!Array.isArray(languageList)) {
            languageList = [languageList];
        }

        let chosen;
        for (let i = 0, len = languageList.length; i < len; ++i) {
            let language = languageList[i].toLowerCase();
            if (this.languages.indexOf(language) >= 0) {
                //check to see if we have the full language and dialect (if included)
                chosen = language;
                break;
            }
            else if (language.indexOf('-') >= 0) {
                //check to see if we have the language without the dialect
                language = language.split('-')[0].toLowerCase();
                if (this.languages.indexOf(language) >= 0) {
                    chosen = language;
                    break;
                }
            }
        }
        if (!chosen) {
            chosen = this._default;
        }
        if (chosen !== this._current) {
            this._current = chosen;
            this.emit('changed', chosen);
        }
    }

    /**
     * Sets the string table for later reference.
     * @param {Dictionary} dictionary The string table, with keys that you would use to reference
     *                            the translations.
     */
    setStringTable(dictionary) {
        this._stringTable = dictionary;
    }

    /**
     * Gets a string from the current string table.
     * @param {string} key The key of the string to get.
     * @return {string} The translated string.
     */
    getString(key) {
        return this._stringTable ? this._stringTable[key] : null;
    }

    /**
     * Gets a formatted string from the current string table. See String.format() in the Core
     * module.
     * @param {string} key The key of the string to get.
     * @param {Array|any} args An array or list of arguments for formatting.
     * @return {string} The translated string.
     */
    getFormattedString(key) {
        let string = this._stringTable ? this._stringTable[key] : null;
        if (string) {
            return StringUtils.format(string, Array.prototype.slice.call(arguments, 1));
        }
        else {
            return null;
        }
    }

    /**
     * Modifies a url, replacing a specified value with the current language.
     * @param {string} url The url to modify to a language specific version.
     */
    modifyUrl(url) {
        while (url.indexOf(this._replace) >= 0) {
            url = url.replace(this._replace, this._current);
        }
        return url;
    }

    /**
     * Destroys the Languages object.
     */
    destroy() {
        this._loader.cacheManager.unregisterURLFilter(this.modifyUrl);
        this.modifyUrl = null;
        this._loader = null;
        this.languages = null;

        super.destroy();
    }
}
