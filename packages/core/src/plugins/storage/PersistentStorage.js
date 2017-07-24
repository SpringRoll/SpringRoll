import include from '../../utils/include';    

/**
 * The PersistentStorage functions use localStorage and sessionStorage, with a cookie fallback.
 * ### module: @springroll/core
 *
 * @class
 * @memberof springroll
 */
export default class PersistentStorage {
    constructor() {
        /**
         * `true` if localStorage is supported, `false` to use cookies
         * @member {boolean}
         * @readonly
         */
        this.supported = this.storageSupported();

        /**
         * A constant for cookie fallback for `PersistentStorage.clear()` 
         * @member {number}
         * @readonly
         * @default -1
         */
        this.empty = -1;
    }

    /**
     * Remove a saved variable by name.
     * @param {string} name The name of the value to remove
     */
    remove(name) {
        if (this.supported) {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
        }
        else {
            this.write(name, '', this.empty);
        }
    }

    /**
     * Save a variable.
     * @param {string} name The name of the value to save
     * @param {any} value The value to save. This will be run through JSON.stringify().
     * @param {boolean} [tempOnly=false] If the value should be saved only in the current browser session.
     */
    write(name, value, tempOnly) {
        if (this.supported) {
            if (tempOnly) {
                sessionStorage.setItem(name, JSON.stringify(value));
            }
            else {
                localStorage.setItem(name, JSON.stringify(value));
            }
        }
        else {
            let expires;

            if (tempOnly) {
                if (tempOnly !== this.empty) {
                    expires = ''; //remove when browser is closed
                }
                else {
                    expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT'; //save cookie in the past for immediate removal
                }
            }
            else {
                expires = `; expires=${new Date(2147483646000).toGMTString()}`; //THE END OF (32bit UNIX) TIME!
            }

            document.cookie = `${name}=${escape(JSON.stringify(value))}${expires}; path=/`;
        }
    }

    /**
     * Read the value of a saved variable
     * @param {string} name The name of the variable
     * @return {any} The value (run through `JSON.parse()`) or null if it doesn't exist
     */
    read(name) {
        if (this.supported) {
            let value = localStorage.getItem(name) || sessionStorage.getItem(name);

            if (value) {
                return JSON.parse(value, this.reviver);
            }
            else {
                return null;
            }
        }
        else {
            const nameEQ = `${name}=`;
            const ca = document.cookie.split(';');

            for (let i = 0, len = ca.length; i < len; i++) {
                let c = ca[i];

                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }

                if (c.indexOf(nameEQ) === 0) {
                    return JSON.parse(
                        unescape(c.substring(nameEQ.length, c.length)),
                        this.reviver
                    );
                }
            }
            return null;
        }
    }

    /**
     * When restoring from JSON via `JSON.parse`, we may pass a reviver function.
     * In our case, this will check if the object has a specially-named property (`__classname`).
     * If it does, we will attempt to construct a new instance of that class, rather than using a
     * plain old Object. Note that this recurses through the object.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
     * @param  {string} key   each key name
     * @param  {object} value Object that we wish to restore
     * @return {object}       The object that was parsed - either cast to a class, or not
     */
    reviver(key, value) {
        if (value && typeof value.__classname === 'string') {
            const ClassReference = include(value.__classname, false);

            if (ClassReference) {
                const result = new ClassReference();

                //if we may call fromJSON, do so
                if (result.fromJSON) {
                    result.fromJSON(value);
                    //return the cast Object
                    return result;
                }
            }
        }
        //return the object we were passed in
        return value;
    }

    /** 
     * A constant to determine if we can use localStorage and 
     * sessionStorage 
     * @readOnly
     */
    storageSupported() {
        const hasStorage = typeof Storage !== 'undefined';

        if (hasStorage) {
            // in iOS, if the user is in Private Browsing
            // writing to localStorage throws an error.
            try {
                localStorage.setItem('__hasStorage', '1');
                localStorage.removeItem('__hasStorage');
                return true;
            }
            catch (e) {
                return false;
            }
        }
        return false;
    }
}
