/**
 * Use to do class inheritence
 * @class extend
 * @static
 */

/**
 * Extend prototype
 *
 * @example
    var p = extend(MyClass, ParentClass);
 *
 * @constructor
 * @method extend
 * @param {function} child The reference to the child class
 * @param {function|String} [parent] The parent class reference or full classname
 * @return {object} Reference to the child class's prototype
 */
export default function extend(child, parent)
{
    if (parent)
    {
        if (typeof parent == "string")
        {
            parent = window.include(parent);
        }
        var p = parent.prototype;
        child.prototype = Object.create(p);
        Object.defineProperty(child.prototype, '__parent',
        {
            configurable: true,
            writable: true,
            value: p
        });
    }
    // Add the constructor
    Object.defineProperty(child.prototype, 'constructor',
    {
        configurable: true,
        writable: true,
        value: child
    });

    // Add extend to each class to easily extend
    // by calling MyClass.extend(SubClass)
    child.extend = function(subClass)
    {
        return window.extend(subClass, child);
    };
    return child.prototype;
}