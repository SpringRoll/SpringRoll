import Debugger from './../../debug/Debugger';
/**
 * @typedef {{path: string}} Locale
 * @typedef {{default: string, locales: { name: Locale}} Localizer.Config
 * @typedef {{language: string, fallback: string}} Localizer.Options
 */

/**
 *
 * @export
 * @class Localizer
 */
export default class Localizer {
  /**
   * Creates an instance of Localizer.
   * @param {Object} loadCallback
   * @param {Localizer.Config} config
   * @param {Localizer.Options} options
   * @memberof Localizer
   */
  constructor(loadCallback, config, options = {}) {
    this.loadCallback = loadCallback;
    this.locales = config.locales;

    this.setPrimaryLocale(
      options.language || this.getBrowsersLocaleKey() || config.default
    );
    this.setFallbackLocale(options.fallback || config.default);
  }

  /**
   *
   * @param  {string} path
   * @param  {string} key
   * @param  {Localizer.Options} options
   * @return {void}@memberof Localizer
   */
  load(path, key, options = {}) {
    let language = this.primaryLanguage;
    if (options.language) {
      language = this.getLocaleKey(options.language);
    }
    let fallback = this.getLocaleKey(options.fallback) || this.fallbackLanguage;

    let primaryLocale = this.locales[language];
    let fallbackLocale = this.locales[fallback];

    // forward language options to load interface
    // in case load fails, loader can decide to try loading from fallback.
    options.language = language;
    options.fallback = fallback;

    if (primaryLocale) {
      this.loadCallback(primaryLocale.path + path, key, options);
    } else if (fallbackLocale) {
      this.loadCallback(fallbackLocale.path + path, key, options);
    } else {
      Debugger.log('warn', '[Localizer.load] Locale ' + language + ' not found');
    }
  }

  /**
   * @param  {string} localeKey
   * @return {boolean} true if language set.
   * @memberof Localizer
   */
  setPrimaryLocale(localeKey) {
    let key = this.getLocaleKey(localeKey);
    if (key) {
      this.primaryLanguage = key;
      return true;
    }
    return false;
  }

  /**
   * @param  {string} localeKey
   * @return {boolean} true if fallback set.
   * @memberof Localizer
   */
  setFallbackLocale(localeKey) {
    let key = this.getLocaleKey(localeKey);
    if (key) {
      this.fallbackLanguage = key;
      return true;
    }
    return false;
  }

  /**
   *
   * @param  {string} localeKey
   * @return {string}
   * @memberof Localizer
   */
  getLocaleKey(localeKey) {
    if (localeKey) {
      let key = localeKey.toLowerCase();
      if (this.locales[key]) {
        return key;
      } else if (key.indexOf('-') > 0) {
        key = key.split('-')[0];
        return this.getLocaleKey(key);
      }
    }
    return undefined;
  }

  /**
   * @private
   * @return {void}@memberof Localizer
   */
  getBrowsersLocaleKey() {
    let browserLanguages = this.getBrowserLanguages();
    for (let i = 0; i < browserLanguages.length; i++) {
      let key = this.getLocaleKey(browserLanguages[i]);
      if (key) {
        return key;
      }
    }
    return undefined;
  }

  /**
   *
   * @return {string[]} an array of browser languages
   * @memberof Localizer
   */
  getBrowserLanguages() {
    let langs;
    let navigator = window.navigator;

    if (navigator.languages) {
      langs = navigator.languages;
    } else if (navigator.language) {
      langs = [navigator.language || navigator.userLanguage];
    } else {
      langs = [];
    }
    return langs;
  }
}
