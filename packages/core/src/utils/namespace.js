/**
 * @module Core
 * @namespace window
 */
/**
 * Static class for namespacing objects and adding
 * classes to it.
 * @class namespace
 * @static
 */

/**
 * Create the namespace and assing to the window
 *
 * @example
    var SpriteUtils = function(){};
    namespace('springroll').SpriteUtils = SpriteUtils;
 *
 * @constructor
 * @method namespace
 * @param {string} namespaceString Name space, for instance 'springroll.utils'
 * @return {object} The namespace object attached to the current window
 */
export default function namespace(namespaceString)
{
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    for (var i = 0, length = parts.length; i < length; i++)
    {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] ||
        {};
        parent = parent[currentPart];
    }
    return parent;
}
