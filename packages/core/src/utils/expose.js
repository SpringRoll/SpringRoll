import namespace from './namespace';
import name from './name';

/**
 * Assign members to the springroll global window object.
 * ### module: @springroll/core
 *
 * @example
 * import {expose} from '@springroll/core';
 * var SpriteUtils = function(){};
 * expose({ SpriteUtils });
 *
 * @memberof springroll
 * @method expose
 * @param {object} assign Map of things to assign
 * @return {object} The springroll window object
 */
export default function expose(assign) {
    return Object.assign(namespace(name), assign);
}
