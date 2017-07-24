/**
 * Convenience utilitys for Objects.
 * ### module: @springroll/utils
 * @class
 * @memberof springroll
 */
export default class ObjectUtils {

    /**
     * Check to see if an object is a plain object definition
     * @param {any} target The target object
     * @return {boolean} If the object is plain
     */
    static isPlain(obj) {

        let key;
        let hasOwn = ObjectUtils.support.hasOwnProperty;

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || typeof obj !== 'object' || obj.nodeType || obj === window) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (obj.constructor &&
                !hasOwn.call(obj, 'constructor') &&
                !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        }
        catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        if (ObjectUtils.support.ownLast) {
            for (key in obj) {
                return hasOwn.call(obj, key);
            }
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        // eslint-disable-next-line
        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key);
    }
}

ObjectUtils.support = {};
