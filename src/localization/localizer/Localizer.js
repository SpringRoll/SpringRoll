/**
 * @typedef {{path: string}} Locale
 * @typedef {{default: string, locales: { name: Locale }}} Localizer.Config
 * @typedef {{language: string, fallback: string}} Localizer.Options
 */

/**
 * @export
 * @class Localizer
 */
export class Localizer {
  /**
   * Creates an instance of Localizer.
   * @param {Localizer.Config} config
   * @param {Localizer.Options} [options={}]
   * @memberof Localizer
   */
  constructor(config, options = {}) {
    this.locales = config.locales;

    this.setPrimaryLocale(
      options.language || this.getBrowsersLocaleKey() || config.default
    );
    this.setFallbackLocale(options.fallback || config.default);
  }

  /**
   *
   * @param  {string} path
   * @param  {any} [options={}]
   * @return {{path: string, language: string}}
   * @memberof Localizer
   */
  resolve(path, options = {}) {
    const language = options.language
      ? this.getLocaleKey(options.language)
      : this.primaryLanguage;
    const fallback =
      this.getLocaleKey(options.fallback) || this.fallbackLanguage;

    const primaryLocale = this.locales[language];
    const fallbackLocale = this.locales[fallback];

    if (primaryLocale) {
      return { path: primaryLocale.path + path, language: language };
    }

    if (fallbackLocale) {
      return { path: fallbackLocale.path + path, language: fallback };
    }
  }

  /**
   * @param  {string} localeKey
   * @return {boolean} True if language is set.
   * @memberof Localizer
   */
  setPrimaryLocale(localeKey) {
    const key = this.getLocaleKey(localeKey);
    if (key) {
      this.primaryLanguage = key;
      return true;
    }
    return false;
  }

  /**
   * @param  {string} localeKey
   * @return {boolean} True if fallback is set.
   * @memberof Localizer
   */
  setFallbackLocale(localeKey) {
    const key = this.getLocaleKey(localeKey);
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
      }

      if (key.indexOf('-') > 0) {
        key = key.split('-')[0];
        return this.getLocaleKey(key);
      }
    }
    return undefined;
  }

  /**
   * @private
   * @return {void | string}
   * @memberof Localizer
   */
  getBrowsersLocaleKey() {
    const browserLanguages = this.getBrowserLanguages();
    for (let i = 0, length = browserLanguages.length; i < length; i++) {
      const key = this.getLocaleKey(browserLanguages[i]);
      if (key) {
        return key;
      }
    }
    return undefined;
  }

  /**
   *
   * @return {ReadonlyArray[*] | []} An array of browser languages.
   * @memberof Localizer
   */
  getBrowserLanguages() {
    if (navigator.languages) {
      return navigator.languages;
    }

    if (navigator.language) {
      return [navigator.language || navigator.userLanguage];
    }

    return [];
  }
}
