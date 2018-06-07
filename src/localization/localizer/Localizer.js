/**
 * @typedef {{name: string, path: string}} Locale
 * @typedef {{default: string, locales: Locale[]}} Localizer.Config
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
   * @param {Object} iFileLoader
   * @param {Localizer.Config} config
   * @param {Localizer.Options} options
   * @memberof Localizer
   */
  constructor(iFileLoader, config, options) {
    this.iFileLoader = iFileLoader;
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
  load(path, key, options) {
    let language = this.getLocaleKey(options.language);
    let fallback = this.getLocaleKey(options.fallback);

    let primaryLocale = this.locales[language] || this.primaryLocale;
    let fallbackLocale = this.locales[fallback] || this.fallbackLocale;

    if (primaryLocale) {
      this.iFileLoader.load(primaryLocale.path + path, key, options);
    } else if (fallbackLocale) {
      this.iFileLoader.load(fallbackLocale.path + path, key, options);
    } else {
      //TODO: warn Locale not defined.
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
      this.primaryLocale = this.locales[key];
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
      this.fallbackLocale = this.locales[key];
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
    if (localeKey) 
    {
      let key = localeKey.toLowerCase();
      if (this.locales[key]) 
      {
        return key;
      } 
      else if (key.indexOf('-') > 0) 
      {
        key = key.split('-')[0];
        return this.getLocale(key);
      }
    }
    return undefined;
  }

  /**
   *
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
