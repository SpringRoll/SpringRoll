/**
 * Create the namespace and assing to the window.
 * ### module: @springroll/core
 *
 * @example
 * import {namespace} from '@springroll/core';
 * const SpriteUtils = function(){};
 * namespace('springroll').SpriteUtils = SpriteUtils;
 *
 * @memberof springroll
 * @method namespace
 * @param {string} namespaceString Name space, for instance 'springroll.utils'
 * @param {object} [assign] Map of classes/properties to assign to namespace
 * @return {object} The namespace object attached to the current window
 */
export default function namespace(namespaceString, assign) {
    let parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    for (let i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] ||
        {};
        parent = parent[currentPart];
    }
    if (assign) {
        parent = Object.assign(parent, assign);
    }
    return parent;
}
