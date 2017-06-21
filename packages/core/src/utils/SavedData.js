import include from './include';    

/**
 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
 *
 * @class SavedData
 */
export default class SavedData
{
    /**
     * Remove a saved variable by name.
     * @method remove
     * @static
     * @param {String} name The name of the value to remove
     */
    static remove(name)
    {
        if (SavedData.WEB_STORAGE_SUPPORT)
        {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
        }
        else
        {
            SavedData.write(name, '', SavedData.ERASE_COOKIE);
        }
    }

    /**
     * Save a variable.
     * @method write
     * @static
     * @param {String} name The name of the value to save
     * @param {mixed} value The value to save. This will be run through JSON.stringify().
     * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
     */
    static write(name, value, tempOnly)
    {
        if (SavedData.WEB_STORAGE_SUPPORT)
        {
            if (tempOnly)
            {
                sessionStorage.setItem(name, JSON.stringify(value));
            }
            else
            {
                localStorage.setItem(name, JSON.stringify(value));
            }
        }
        else
        {
            var expires;
            if (tempOnly)
            {
                if (tempOnly !== SavedData.ERASE_COOKIE)
                {
                    expires = ''; //remove when browser is closed
                }
                else
                {
                    expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT'; //save cookie in the past for immediate removal
                }
            }
            else
            {
                expires = '; expires=' + new Date(2147483646000).toGMTString(); //THE END OF (32bit UNIX) TIME!
            }

            document.cookie = name + '=' + escape(JSON.stringify(value)) + expires + '; path=/';
        }
    }

    /**
     * Read the value of a saved variable
     * @method read
     * @static
     * @param {String} name The name of the variable
     * @return {mixed} The value (run through `JSON.parse()`) or null if it doesn't exist
     */
    static read(name)
    {
        if (SavedData.WEB_STORAGE_SUPPORT)
        {
            var value = localStorage.getItem(name) || sessionStorage.getItem(name);

            if (value)
            {
                return JSON.parse(value, SavedData.reviver);
            }
            else
            {
                return null;
            }
        }
        else
        {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');

            for (let i = 0, len = ca.length; i < len; i++)
            {
                let c = ca[i];

                while (c.charAt(0) === ' ') 
                {
                    c = c.substring(1, c.length);
                }

                if (c.indexOf(nameEQ) === 0) 
                {
                    return JSON.parse(
                        unescape(c.substring(nameEQ.length, c.length)),
                        SavedData.reviver
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
     * @method reviver
     * @static
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
     * @param  {String} key   each key name
     * @param  {Object} value Object that we wish to restore
     * @return {Object}       The object that was parsed - either cast to a class, or not
     */
    static reviver(key, value)
    {
        if (value && typeof value.__classname === 'string')
        {
            const ClassReference = include(value.__classname, false);

            if (ClassReference)
            {
                const result = new ClassReference();

                //if we may call fromJSON, do so
                if (result.fromJSON)
                {
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
     * @static
     * @property {Boolean} WEB_STORAGE_SUPPORT
     * @private
     * @readOnly
     */
    static get WEB_STORAGE_SUPPORT()
    {
        const hasStorage = typeof Storage !== 'undefined';

        if (hasStorage)
        {
            // in iOS, if the user is in Private Browsing
            // writing to localStorage throws an error.
            try
            {
                localStorage.setItem('LS_TEST', 'test');
                localStorage.removeItem('LS_TEST');
                return true;
            }
            catch (e)
            {
                return false;
            }
        }
        return false;
    }

    /**
     * A constant for cookie fallback for `SavedData.clear()` 
     * @static
     * @property {int} ERASE_COOKIE
     * @private
     * @readOnly
     * @default -1
     */
    static get ERASE_COOKIE()
    {
        return -1;
    }
}
