import include from './include';

/**
 * Mixin functionality to an object.
 * ### module: @springroll/core
 *
 * @example
 * import {mixin} from '@springroll/core';
 * mixin(instance, MyClass);
 *
 * @memberof springroll
 * @method mixin
 * @param {any} target The instance object to add functionality to
 * @param {function|string} superClass The parent reference or full classname
 * @param {any} [args] Any additional arguments to pass to the constructor of the superClass
 * @return {any} Return reference to target
 */
export default function mixin(target, superClass) {
    // @if DEBUG
    if (!superClass) {
        throw 'Did not supply a valid mixin class';
    }
    // @endif

    // Include using string
    if (typeof superClass === 'string') {
        superClass = include(superClass);
    }

    // Check for existence of prototype
    if (!superClass.prototype) {
        // @if DEBUG
        throw 'The mixin class does not have a valid protoype';
        // @endif

        // @if RELEASE
        // eslint-disable-next-line no-unreachable
        throw 'no mixin prototype';
        // @endif
    }
    //loop over mixin prototype to add functions
    let p = superClass.prototype;

    for (let prop in p) {
        // For things that we set using Object.defineProperty
        // very important that enumerable:true for the 
        // defineProperty options
        let propDesc = Object.getOwnPropertyDescriptor(p, prop);
        if (propDesc) {
            Object.defineProperty(target, prop, propDesc);
        }
        else {
            // Should cover all other prototype methods/properties
            target[prop] = p[prop];
        }
    }
    // call mixin on target and apply any arguments
    superClass.apply(target, Array.prototype.slice.call(arguments, 2));
    return target;
}
