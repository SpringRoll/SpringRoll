/**
 * Static class for mixing in functionality into objects.
 * @class mixin
 * @static
 */

/**
 * Mixin functionality to an object
 *
 * @example
    mixin(instance, MyClass);
 *
 * @constructor
 * @method mixin
 * @param {*} target The instance object to add functionality to
 * @param {function|String} superClass The parent reference or full classname
 * @param {*} [args] Any additional arguments to pass to the constructor of the superClass
 * @return {*} Return reference to target
 */
export default function mixin(target, superClass)
{
    // @if DEBUG
    if (!superClass)
    {
        throw 'Did not supply a valid mixin class';
    }
    // @endif

    // Include using string
    if (typeof superClass === "string")
    {
        superClass = window.include(superClass);
    }

    // Check for existence of prototype
    if (!superClass.prototype)
    {
        // @if DEBUG
        throw 'The mixin class does not have a valid protoype';
        // @endif

        // @if RELEASE
        // eslint-disable-next-line no-unreachable
        throw 'no mixin prototype';
        // @endif
    }
    //loop over mixin prototype to add functions
    var p = superClass.prototype;

    for (var prop in p)
    {
        // For things that we set using Object.defineProperty
        // very important that enumerable:true for the 
        // defineProperty options
        var propDesc = Object.getOwnPropertyDescriptor(p, prop);
        if (propDesc)
        {
            Object.defineProperty(target, prop, propDesc);
        }
        else
        {
            // Should cover all other prototype methods/properties
            target[prop] = p[prop];
        }
    }
    // call mixin on target and apply any arguments
    superClass.apply(target, Array.prototype.slice.call(arguments, 2));
    return target;
}
