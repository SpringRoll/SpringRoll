/**
 * @module Core
 * @namespace window
 */
/**
 * Use to do class inheritence
 * @class extend
 * @static
 */
(function(window)
{

	// The extend function already exists
	if ("extend" in window) return;

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
	window.extend = function(child, parent)
	{
		if (parent)
		{
			if (typeof parent == "string")
			{
				parent = window.include(parent);
			}
			var p = parent.prototype;
			child.prototype = Object.create(p);
			child.prototype.__parent = p;
		}
		// Add the constructor
		child.prototype.constructor = child;

		// Add extend to each class to easily extend
		// by calling MyClass.extend(SubClass)
		child.extend = function(subClass)
		{
			return window.extend(subClass, child);
		};
		return child.prototype;
	};

}(window));