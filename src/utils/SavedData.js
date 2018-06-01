/**
 * @module Core
 * @namespace springroll
 */

/**
 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
 *
 * @class SavedData
 */
export default class SavedData {
  /**
   * Creates an instance of SavedData.
   * @memberof SavedData
   */
  constructor() {
    /**
     * A constant for cookie fallback for `SavedData.remove()`
     * @property {Boolean} [ERASE_COOKIE=false]
     */
    this.ERASE_COOKIE = false;

    /**
     * A constant for if if the user is in Private Browsing, writing to localStorage throws an error
     * @property {Boolean} [WEB_STORAGE_SUPPORT=true]
     */
    this.WEB_STORAGE_SUPPORT = true;

    //in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
    try {
      localStorage.setItem('LS_TEST', 'test');
      localStorage.removeItem('LS_TEST');
    } catch (e) {
      this.WEB_STORAGE_SUPPORT = false;
    }
  }

  /**
   * Remove a saved variable by name.
   * @method remove
   * @param {String} name The name of the value to remove
   */
  remove(name) {
    if (this.WEB_STORAGE_SUPPORT) {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    } else {
      this.write(name, '', this.ERASE_COOKIE);
    }
  }

  /**
   * Save a variable.
   * @method write
   * @param {String} name The name of the value to save
   * @param {*} value The value to save. This will be run through JSON.stringify().
   * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
   */
  write(name, value, tempOnly = false) {
    if (this.WEB_STORAGE_SUPPORT) {
      tempOnly
        ? sessionStorage.setItem(name, JSON.stringify(value))
        : localStorage.setItem(name, JSON.stringify(value));
    } else {
      document.cookie = `${name}=${escape(JSON.stringify(value))}; expires=${
        tempOnly
          ? 'Thu, 01 Jan 1970 00:00:00 GMT'
          : new Date(2147483646000).toUTCString()
      }; path=/`;
    }
  }

  /**
   * Read the value of a saved variable
   * @method read
   * @param {String} name The name of the variable
   * @return {*} The value (run through `JSON.parse()`) or null if it doesn't exist
   */
  read(name) {
    if (this.WEB_STORAGE_SUPPORT) {
      const item = localStorage.getItem(name) || sessionStorage.getItem(name);
      try {
        return JSON.parse(item);
      } catch (err) {
        return item;
      }
    } else {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');

      for (let i = 0, len = ca.length; i < len; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
          const data = unescape(c.substring(nameEQ.length, c.length));
          try {
            return JSON.parse(data);
          } catch (err) {
            return data;
          }
        }
      }

      return null;
    }
  }
}
