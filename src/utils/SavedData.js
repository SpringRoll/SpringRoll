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
     * A constant for cookie fallback for `SavedData.clear()`
     * @static
     * @property {int} ERASE_COOKIE
     * @private
     * @readOnly
     * @default -1
     */
    this.ERASE_COOKIE = false;

    this.WEB_STORAGE_SUPPORT = true;

    //in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
    if (this.WEB_STORAGE_SUPPORT) {
      try {
        localStorage.setItem('LS_TEST', 'test');
        localStorage.removeItem('LS_TEST');
      } catch (e) {
        this.WEB_STORAGE_SUPPORT = false;
      }
    }
  }

  /**
   * Remove a saved variable by name.
   * @method remove
   * @static
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
   * @static
   * @param {String} name The name of the value to save
   * @param {*} value The value to save. This will be run through JSON.stringify().
   * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
   */
  write(name, value, tempOnly) {
    if (this.WEB_STORAGE_SUPPORT) {
      if (tempOnly) {
        sessionStorage.setItem(name, JSON.stringify(value));
      } else {
        localStorage.setItem(name, JSON.stringify(value));
      }
    } else {
      let expires;
      if (tempOnly) {
        if (tempOnly !== this.ERASE_COOKIE) {
          expires = '';
        }
        //remove when browser is closed
        else {
          expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } //save cookie in the past for immediate removal
      } else {
        expires = '; expires=' + new Date(2147483646000).toUTCString();
      } //THE END OF (32bit UNIX) TIME!

      document.cookie =
        name + '=' + escape(JSON.stringify(value)) + expires + '; path=/';
    }
  }

  /**
   * Read the value of a saved variable
   * @method read
   * @static
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
      let nameEQ = name + '=',
        ca = document.cookie.split(';'),
        i = 0,
        c,
        len;

      for (i = 0, len = ca.length; i < len; i++) {
        c = ca[i];

        while (c.charAt(0) == ' ') {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
          return unescape(c.substring(nameEQ.length, c.length));
        }
      }

      return null;
    }
  }
}
