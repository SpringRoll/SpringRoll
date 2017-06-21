import namespace from './namespace';
import name from './name';

/**
 * Assign members to the springroll global window object.
 * classes to it.
 * @class expose
 * @static
 */

/**
 * Assign members to the springroll global window object.
 *
 * @example
    var SpriteUtils = function(){};
    springroll.expose({ SpriteUtils });
 *
 * @constructor
 * @method namespace
 * @param {object} assign Map of things to assign
 * @return {object} The springroll window object
 */
export default function expose(assign)
{
    return Object.assign(namespace(name), assign);
}
