/**
 * @module Core
 * @namespace window
 */
(function(Object, support, undefined)
{

	/**
	 * Add methods to Object
	 * @class Object
	 */

	/**
	 * Merges two (or more) objects, giving the last one precedence
	 * @method merge
	 * @example
		var obj1 = { id : 'foo', name : 'Hello!', value : 100 };
		var obj2 = { id : 'bar', value : 200 };
		Object.merge({}, obj1, obj2); // Returns: { id : 'bar', name : 'Hello!', value : 200 }
	 * @static
	 * @param {Object} target The target object
	 * @param {Object} source* Additional objects to add
	 */
	Object.merge = function(target, source)
	{
		if (!target || typeof target !== 'object')
		{
			target = {};
		}

		for (var property in source)
		{
			if (source.hasOwnProperty(property))
			{
				var sourceProperty = source[property];

				if (typeof sourceProperty === 'object' && Object.isPlain(sourceProperty))
				{
					target[property] = Object.merge(target[property], sourceProperty);
					continue;
				}
				target[property] = sourceProperty;
			}
		}

		for (var i = 2, l = arguments.length; i < l; i++)
		{
			Object.merge(target, arguments[i]);
		}
		return target;
	};

	/**
	 * Check to see if an object is a plain object definition
	 * @method isPlain
	 * @static
	 * @param {Object} target The target object
	 * @return {Boolean} If the object is plain
	 */
	Object.isPlain = function(obj)
	{
		var key;
		var hasOwn = support.hasOwnProperty;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if (!obj || typeof obj !== "object" || obj.nodeType || obj === window)
		{
			return false;
		}

		try
		{
			// Not own constructor property must be Object
			if (obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
			{
				return false;
			}
		}
		catch (e)
		{
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if (support.ownLast)
		{
			for (key in obj)
			{
				return hasOwn.call(obj, key);
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for (key in obj)
		{}

		return key === undefined || hasOwn.call(obj, key);
	};

	/**
	 * Creates a shallow copy of the object.
	 * @method clone
	 * @return {Object} The shallow copy.
	 */
	if (!Object.prototype.clone)
	{
		Object.defineProperty(Object.prototype, 'clone',
		{
			enumerable: false,
			writable: true,
			value: function()
			{
				var rtn = {};
				var thisObj = this;
				for (var key in thisObj)
				{
					rtn[key] = thisObj[key];
				}
				return rtn;
			}
		});
	}

}(Object,
{}));