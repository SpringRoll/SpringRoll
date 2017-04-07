/*! SpringRoll 1.0.3 */
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
	};

}(window));
/**
 * @module Core
 * @namespace window
 */
/**
 * Used to include required classes by name
 * @class include
 * @static
 */
(function(window, undefined)
{

	// The include function already exists
	if ("include" in window) return;

	/**
	 * Import a class
	 *
	 * @example
		var Application = include('springroll.Application');
	 *
	 * @constructor
	 * @method include
	 * @param {string} namespaceString Name space, for instance 'springroll.Application'
	 * @param {Boolean} [required=true] If the class we're trying to include is required.
	 * 		For classes that aren't found and are required, an error is thrown.
	 * @return {object|function} The object attached at the given namespace
	 */
	var include = function(namespaceString, required)
	{
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';

		required = required !== undefined ? !!required : true;

		for (var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			if (!parent[currentPart])
			{
				if (!required)
				{
					return null;
				}
				if (true)
				{
					throw "Unable to include '" + namespaceString + "' because the code is not included or the class needs to loaded sooner.";
				}
				else
				{
					throw "Unable to include '" + namespaceString + "'";
				}
			}
			parent = parent[currentPart];
		}
		return parent;
	};

	// Assign to the window namespace
	window.include = include;

}(window));
/**
 * @module Core
 * @namespace window
 */
/**
 * Static class for mixing in functionality into objects.
 * @class mixin
 * @static
 */
(function(window, Object)
{
	// The mixin function already exists
	if ("mixin" in window) return;

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
	var mixin = function(target, superClass)
	{
		if (true && !superClass)
		{
			throw 'Did not supply a valid mixin class';
		}

		// Include using string
		if (typeof superClass === "string")
		{
			superClass = window.include(superClass);
		}

		// Check for existence of prototype
		if (!superClass.prototype)
		{
			if (true)
			{
				throw 'The mixin class does not have a valid protoype';
			}
			else
			{
				throw 'no mixin prototype';
			}
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
	};

	// Assign to the window namespace
	window.mixin = mixin;

}(window, Object));
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
(function(window)
{

	// The namespace function already exists
	if ("namespace" in window) return;

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
	var namespace = function(namespaceString)
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
	};

	// Assign to the window namespace
	window.namespace = namespace;

}(window));
/**
 * @module Core
 * @namespace window
 */
(function(Array, Math, Object)
{
	/**
	 * Add methods to Array
	 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	 * @class Array
	 */

	/**
	 * Shuffles the array
	 * @method shuffle
	 */
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	if (!Array.prototype.shuffle)
	{
		Object.defineProperty(Array.prototype, 'shuffle',
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				for (var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
				return this;
			}
		});
	}

	/**
	 * Get a random item from an array
	 * @method random
	 * @param {Array} array The array
	 * @return {*} The random item
	 */
	if (!Array.prototype.random)
	{
		Object.defineProperty(Array.prototype, 'random',
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				return this[Math.floor(Math.random() * this.length)];
			}
		});
	}

	/**
	 * Get the last item in the array
	 * @method last
	 * @param {Array} array The array
	 * @return {*} The last item
	 */
	if (!Array.prototype.last)
	{
		Object.defineProperty(Array.prototype, 'last',
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				return this[this.length - 1];
			}
		});
	}

	/**
	 * Appends a list of items or list of arrays to the end of this array. This functions
	 * like concat(), but works on the original array instead of making a copy.
	 * @method append
	 * @param {*} arguments A list of arrays or individual items.
	 * @return {Array} This array.
	 */
	if (!Array.prototype.append)
	{
		Object.defineProperty(Array.prototype, "append",
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				var args = arguments;
				for (var i = 0, length = args.length; i < length; ++i)
				{
					var other = args[i];
					if (Array.isArray(other))
					{
						for (var j = 0, jLength = other.length; j < jLength; ++j)
						{
							this.push(other[j]);
						}
					}
					else
					{
						this.push(other);
					}
				}
				return this;
			}
		});
	}

}(Array, Math, Object));
/**
 * @module Core
 * @namespace window
 */
(function(Math)
{
	/**
	 * Add methods to Math
	 * @class Math
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method randomInt
	 * @static
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */
	Math.randomInt = function(min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/**
	 * Return a random float between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method randomFloat
	 * @static
	 * @param {Number} min Lowest number. If max is omitted, then this becomes max.
	 * @param {Number} max Highest number.
	 * @return {Number} The random value
	 */
	Math.randomFloat = function(min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		return Math.random() * (max - min) + min;
	};

	/**
	 * Return distance between two points
	 * @method dist
	 * @static
	 * @param {Number} x The x position of the first point
	 * @param {Number} y The y position of the first point
	 * @param {Number} x0 The x position of the second point
	 * @param {Number} y0 The y position of the second point
	 * @return {Number} The distance
	 */

	/**
	 * Return distance between two points
	 * @method dist
	 * @static
	 * @param {Object} p1 The first point
	 * @param {Object} p1.x The x position of the first point
	 * @param {Object} p1.y The y position of the first point
	 * @param {Object} p2 The second point
	 * @param {Object} p2.x The x position of the second point
	 * @param {Number} p2.y The y position of the second point
	 * @return {Number} The distance
	 */
	Math.dist = function(x, y, x0, y0)
	{
		return Math.sqrt(Math.distSq(x, y, x0, y0));
	};

	/**
	 * Return squared distance between two points
	 * @method distSq
	 * @static
	 * @param {Number} x The x position of the first point
	 * @param {Number} y The y position of the first point
	 * @param {Number} x0 The x position of the second point
	 * @param {Number} y0 The y position of the second point
	 * @return {Number} The distance
	 */

	/**
	 * Return squared distance between two points
	 * @method distSq
	 * @static
	 * @param {Object} p1 The first point
	 * @param {Object} p1.x The x position of the first point
	 * @param {Object} p1.y The y position of the first point
	 * @param {Object} p2 The second point
	 * @param {Object} p2.x The x position of the second point
	 * @param {Number} p2.y The y position of the second point
	 * @return {Number} The distance
	 */
	Math.distSq = function(x, y, x0, y0)
	{
		//see if the first parameter is a point
		if (typeof x.x == "number" && x.x == x.x) //faster !isNaN
		{
			//shift later parameters back
			y0 = x0;
			x0 = y;

			y = x.y;
			x = x.x;
		}
		//see if the 2nd parameter is a point
		if (typeof x0.x == "number" && x0.x == x0.x)
		{
			y0 = x0.y;
			x0 = x0.x;
		}
		return (x - x0) * (x - x0) + (y - y0) * (y - y0);
	};

	/**
	 * Constrain a number between 0 and a max value.
	 * @method clamp
	 * @static
	 * @param {Number} value The number to be constrained.
	 * @param {Number} max Highest number.
	 * @return {Number} The constrained value
	 */

	/**
	 * Constrain a number between a minimum and maximum values.
	 * @method clamp
	 * @static
	 * @param {Number} value The number to be constrained.
	 * @param {Number} min Lowest number to constrain value to.
	 * @param {Number} max Highest number.
	 * @return {Number} The constrained value
	 */
	Math.clamp = function(value, min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		if (value > max)
			return max;
		if (value < min)
			return min;
		return value;
	};

	/**
	 * Round a number to the nearest increment.
	 * For example, 1.4 rounded to the nearest 0.5 is 1.5.
	 * @param  {Number} val       Value to round
	 * @param  {Number} increment Increment to round by
	 * @return {Number}           Rounded value
	 */
	Math.roundDecimal = function(val, increment)
	{
		return Math.round(val / increment) * increment;
	};

}(Math));
/**
 * @module Core
 * @namespace window
 */
(function(Number, Object)
{
	/**
	 * Add methods to Number
	 * @class Number
	 */

	/**
	 * Returns a string of the number as an integer with leading zeros to fill the string out
	 * to a certain number of digits.
	 * @method toPaddedString
	 * @param {Number} [totalDigits=2] The total number of digits to be displayed.
	 * @return {String} The number string.
	 */
	if (!Number.prototype.toPaddedString)
	{
		Object.defineProperty(Number.prototype, 'toPaddedString',
		{
			enumerable: false,
			writable: false,
			value: function(totalDigits)
			{
				if (!totalDigits)
					totalDigits = 2;
				var num = this;
				var leader;
				if (num < 0)
				{
					num *= -1;
					leader = "-";
				}
				var s = String(Math.floor(num));
				while (s.length < totalDigits)
					s = "0" + s;
				if (leader)
					s = leader + s;
				return s;
			}
		});
	}

}(Number, Object));
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
/**
 * @module Core
 * @namespace window
 */
(function()
{
	var RequestUtils = include('createjs.RequestUtils', false);
	var AbstractLoader = include('createjs.AbstractLoader', false);

	if (!RequestUtils) return;

	/**
	 * Mixins for the CreateJS RequestUtils static class
	 * @class RequestUtils
	 */
	var orig_getTypeByExtension = RequestUtils.getTypeByExtension;

	/**
	 * Overrides getTypeByExtension to add additional types that we want, like .fnt as XML.
	 * @static
	 * @method getTypeByExtension
	 * @param {String} extension The file extension.
	 * @return {String} The load type.
	 */
	RequestUtils.getTypeByExtension = function(extension)
	{
		if (extension)
		{
			switch (extension.toLowerCase())
			{
				case "fnt":
					return AbstractLoader.XML;
			}
		}
		return orig_getTypeByExtension(extension);
	};

}());
/**
 * @module Core
 * @namespace window
 */
(function(String, Object)
{
	/**
	 * Add methods to String
	 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	 * @class String
	 */

	/**
	 * Returns a formatted string, similar to the printf() function in many languages.
	 * This simplified version substitutes "%s" with the arguments in order. To escape "%s",
	 * use "%%s".
	 * @method format
	 * @param {Array|*} args An array or list of arguments for formatting.
	 * @return {String} The substituted string.
	 */
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	Object.defineProperty(String.prototype, 'format',
	{
		enumerable: false,
		writable: false,
		value: function()
		{
			if (arguments.length < 1) return this;
			var args = Array.isArray(args) ? args : Array.prototype.slice.call(arguments);

			return this.replace(
				/([^%]|^)%(?:(\d+)\$)?s/g,
				function(p0, p, position)
				{
					if (position)
					{
						return p + args[parseInt(position) - 1];
					}
					return p + args.shift();
				}
			).replace(/%%s/g, '%s');
		}
	});

	/**
	 * Returns a reversed copy of the string.
	 * @method reverse
	 * @return {String} The reversed string.
	 */
	if (!String.prototype.reverse)
	{
		Object.defineProperty(String.prototype, 'reverse',
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				var o = '';
				for (var i = this.length - 1; i >= 0; i--)
					o += this[i];
				return o;
			}
		});
	}

}(String, Object));
/**
 * @module Core
 * @namespace springroll
 */
(function()
{

	/**
	 * CombinedCallback is a utility class that creates a function to be passed to multiple
	 * asynchronous functions as a callback, and will call your callback on the last time it
	 * is called.
	 *
	 * @class CombinedCallback
	 */
	var CombinedCallback = {};

	/**
	 * Creates a callback function for use.
	 *
	 * @method create
	 * @static
	 * @param {Function} call The callback to call when everything is complete.
	 * @param {int} [callCount=2] The number of times this function should expect to be called.
	 * @return {Function} The callback to pass to your asynchronous actions. For reuse,
	 *                    this function has a reset() function.
	 */
	CombinedCallback.create = function(call, callCount)
	{
		if (!call) return null;

		if (typeof callCount != "number" || callCount < 1)
			callCount = 2;
		//create a function that can be called multiple times
		var rtn = function()
		{
			if (++rtn.currentCallCount >= callCount)
				call();
		};
		//set some properties on said function to make it reusable
		rtn.currentCallCount = 0;
		rtn.reset = reset;

		return rtn;
	};

	function reset()
	{
		this.currentCallCount = 0;
	}

	namespace('springroll').CombinedCallback = CombinedCallback;
}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	var Application;

	/**
	 * A class for delaying a call through the Application, instead of relying on setInterval() or
	 * setTimeout().
	 *
	 * @class DelayedCall
	 * @constructor
	 * @param {function} callback The function to call when the delay has completed.
	 * @param {int} delay The time to delay the call, in milliseconds (or optionally frames).
	 * @param {Object|Boolean} [options=false] The options to use or repeat value
	 * @param {Boolean} [options.repeat=false] If the DelayedCall should automatically repeat itself when
	 *                              completed.
	 * @param {Boolean} [options.autoDestroy=true] If the DelayedCall should clean itself up when completed.
	 * @param {Boolean} [options.useFrames=false] If the DelayedCall should use frames instead of
	 *                                 milliseconds for the delay.
	 * @param {Boolean} [autoDestroy=true] If the DelayedCall should clean itself up when completed.
	 * @param {Boolean} [useFrames=false] If the DelayedCall should use frames instead of
	 *                                 milliseconds for the delay.
	 */
	var DelayedCall = function(callback, delay, options, autoDestroy, useFrames)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
		}

		// @deprecate the options as repeat param
		if (typeof options === "boolean")
		{
			options = {
				repeat: !!options,
				autoDestroy: autoDestroy === undefined ? true : !!autoDestroy,
				useFrames: !!useFrames
			};
		}

		// Set the default options
		options = Object.merge(
		{
			repeat: false,
			autoDestroy: true,
			useFrames: false
		}, options ||
		{});


		/**
		 * The function to call when the delay is completed.
		 * @private
		 * @property {function} _callback
		 */
		this._callback = callback;

		/**
		 * The delay time, in milliseconds.
		 * @private
		 * @property {int} _delay
		 */
		this._delay = delay;

		/**
		 * The timer counting down from _delay, in milliseconds.
		 * @private
		 * @property {int} _timer
		 */
		this._timer = delay;

		/**
		 * If the DelayedCall should repeat itself automatically.
		 * @private
		 * @property {Boolean} _repeat
		 * @default false
		 */
		this._repeat = options.repeat;

		/**
		 * If the DelayedCall should destroy itself after completing
		 * @private
		 * @property {Boolean} _autoDestroy
		 * @default true
		 */
		this._autoDestroy = options.autoDestroy;

		/**
		 * If the DelayedCall should use frames instead of milliseconds for the delay.
		 * @private
		 * @property {Boolean} _useFrames
		 * @default false
		 */
		this._useFrames = options.useFrames;

		/**
		 * If the DelayedCall is currently paused (not stopped).
		 * @private
		 * @property {Boolean} _paused
		 */
		this._paused = false;

		//save a bound version of the update function
		this._update = this._update.bind(this);

		//start the delay
		Application.instance.on("update", this._update);
	};

	var p = extend(DelayedCall);

	/**
	 * The callback supplied to the Application for an update each frame.
	 * @private
	 * @method _update
	 * @param {int} elapsed The time elapsed since the previous frame.
	 */
	p._update = function(elapsed)
	{
		if (!this._callback)
		{
			this.destroy();
			return;
		}

		this._timer -= this._useFrames ? 1 : elapsed;
		if (this._timer <= 0)
		{
			this._callback(this);
			if (this._repeat)
				this._timer += this._delay;
			else if (this._autoDestroy)
				this.destroy();
			else
				Application.instance.off("update", this._update);
		}
	};

	/**
	 * Restarts the DelayedCall, whether it is running or not.
	 * @public
	 * @method restart
	 */
	p.restart = function()
	{
		if (!this._callback) return;
		var app = Application.instance;
		if (!app.has("update", this._update))
			app.on("update", this._update);
		this._timer = this._delay;
		this._paused = false;
	};

	/**
	 * Stops the DelayedCall, without destroying it.
	 * @public
	 * @method stop
	 */
	p.stop = function()
	{
		Application.instance.off("update", this._update);
		this._paused = false;
	};

	/**
	 * If the DelayedCall is paused or not.
	 * @public
	 * @property {Boolean} paused
	 */
	Object.defineProperty(p, "paused",
	{
		get: function()
		{
			return this._paused;
		},
		set: function(value)
		{
			if (!this._callback) return;
			var app = Application.instance;
			if (this._paused && !value)
			{
				this._paused = false;
				if (!app.has("update", this._update))
					app.on("update", this._update);
			}
			else if (value)
			{
				if (app.has("update", this._update))
				{
					this._paused = true;
					app.off("update", this._update);
				}
			}
		}
	});

	/**
	 * Stops and cleans up the DelayedCall. Do not use it after calling
	 * destroy().
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		Application.instance.off("update", this._update);
		this._callback = null;
	};

	namespace('springroll').DelayedCall = DelayedCall;
}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Debug;

	/**
	 * An enumeration value. This class is private, and is only used by Enum.
	 * @class EnumValue
	 * @private
	 * @constructor
	 * @param {String} name The name of the enum value.
	 * @param {int} value The integer value of the enum.
	 * @param {String} toString A string for toString() to return, instead of the name.
	 */
	var EnumValue = function(name, value, toString)
	{

		if (Debug === undefined)
			Debug = include('springroll.Debug', false);

		/**
		 * The name of the value, for reflection or logging purposes.
		 * @property {String} name
		 */
		this.name = name;

		/**
		 * The integer value of this enum entry.
		 * @property {int} _value
		 * @private
		 */
		this._value = value;

		/**
		 * A string for toString() to return, instead of the name.
		 * @property {String} _toString
		 * @private
		 */
		this._toString = toString || this.name;
	};

	/**
	 * The integer value of this enum entry.
	 * @property {int} asInt
	 */
	Object.defineProperty(EnumValue.prototype, "asInt",
	{
		get: function()
		{
			return this._value;
		}
	});

	EnumValue.prototype.toString = function()
	{
		return this._toString;
	};

	/**
	 * An enumeration, similar to Enums in C#. Each value is created as an EnumValue on the Enum,
	 * referenced as a property with the same name as the EnumValue. Examples:
	 *
		var myEnum = new springroll.Enum(
			"valueOf0",
			"valueOf1",
			"valueOf2");
		var myOtherEnum = new springroll.Enum(
			{name: "one", value:"1", toString:"I am the One!"},
			"two",
			{name:"screwSequentialNumbers", value:42});
			
		myEnum.valueOf0 != 0;//enum values are not integers
		myEnum.valueOf1 != myOtherEnum.one;//enum values are not the same as other enums
		myEnum.valueOf2.asInt == 2;//enum values can be explicitly compared to integers
		myOtherEnum.screwSequentialNumbers == myOtherEnum.valueFromInt(42);//can use ints to get values
		console.log(myOtherEnum.one.toString());//outputs "I am the One!"

		for (var i in myEnum) console.log(i); //outputs "valueOf0","valueOf1","valueOf2"
	 *
	 * @class Enum
	 * @constructor
	 * @param {Array|String|Object} arguments
	 * The list of enumeration values. You can pass either an
	 * array or a list of parameters. Each string will be
	 * the previous value plus one, while objects with
	 * 'name' and 'value' properties will have the specified
	 * numeric value.
	 */
	var Enum = function()
	{
		var args = Array.isArray(arguments[0]) ?
			arguments[0] :
			Array.prototype.slice.call(arguments);

		/**
		 * A potentially sparse array of each enum value, stored by integer values.
		 * @property {Array} _byValue
		 * @private
		 */
		Object.defineProperty(this, '_byValue',
		{
			enumerable: false,
			writable: false,
			value: []
		});

		/**
		 * The values that this Enum was initialized with. We save this so
		 * that we can potentially pass this via Bellhop and re-initialize.
		 * @public
		 * @property {Array} rawEnumValues
		 */
		Object.defineProperty(this, 'rawEnumValues',
		{
			enumerable: false,
			writable: false,
			value: args
		});

		var counter = 0;
		var item;
		var value;
		var name;

		// Create an EnumValue for each argument provided
		for (var i = 0, len = args.length; i < len; ++i)
		{
			if (typeof args[i] == "string")
			{
				name = args[i];
			}
			else
			{
				name = args[i].name;
				value = args[i].value || counter;
				counter = value;
			}

			// if name already exists in Enum
			if (this[name])
			{
				if (true && Debug)
				{
					Debug.error("Error creating enum value " + name + ": " + value +
						" - an enum value already exists with that name.");
				}
				continue;
			}

			item = (typeof args[i] == "string") ?
				new EnumValue(name, counter, name) :
				new EnumValue(name, value, args[i].toString || name);

			this[item.name] = item;
			if (this._byValue[counter])
			{
				if (Array.isArray(this._byValue[counter]))
				{
					this._byValue[counter].push(item);
				}
				else
				{
					this._byValue[counter] = [this._byValue[counter], item];
				}
			}
			else
			{
				this._byValue[counter] = item;
			}
			counter++;
		}

		/**
		 * The count of values the enum was initialized with.
		 * @public
		 * @property {int} length
		 */
		Object.defineProperty(this, 'length',
		{
			enumerable: false,
			writable: false,
			value: args.length
		});

		/**
		 * Retrieves the next EnumValue in the Enum (loops to first value at end).
		 * @method {EnumValue} next
		 * @param {EnumValue} input An EnumValue to retrieve the value that follows.
		 * @return {EnumValue}
		 */
		Object.defineProperty(this, 'next',
		{
			enumerable: false,
			writable: false,
			// {EnumValue} input
			value: function(input)
			{
				var nextInt = input.asInt + 1;
				if (nextInt >= counter)
				{
					return this.first;
				}
				return this.valueFromInt(nextInt);
			}
		});

		/**
		 * Retrieves the first EnumValue in the Enum
		 * @method {EnumValue} first
		 * @return {EnumValue}
		 */
		Object.defineProperty(this, 'first',
		{
			enumerable: false,
			writable: false,
			value: this.valueFromInt(args[0].value || 0)
		});

		/**
		 * Retrieves the last EnumValue in the Enum
		 * @method {EnumValue} last
		 * @return {EnumValue}
		 */
		Object.defineProperty(this, 'last',
		{
			enumerable: false,
			writable: false,
			value: this.valueFromInt(counter - 1)
		});
	};

	var p = extend(Enum);

	/**
	 * Gets an enum value by integer value. If you have multiple enum values with the same integer
	 * value, this will always retrieve the first enum value.
	 * @method {Array} valueFromInt
	 * @param {int} input The integer value to get an enum value for.
	 * @return {EnumValue} The EnumValue that represents the input integer.
	 */
	Object.defineProperty(p, 'valueFromInt',
	{
		enumerable: false,
		writable: false,
		value: function(input)
		{
			var rtn = this._byValue[input];
			if (rtn)
			{
				return Array.isArray(rtn) ? rtn[0] : rtn;
			}
			return null;
		}
	});

	namespace('springroll').Enum = Enum;
}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
	 *
	 * @class SavedData
	 */
	var SavedData = {};

	/** 
	 * A constant to determine if we can use localStorage and 
	 * sessionStorage 
	 * @static
	 * @property {Boolean} WEB_STORAGE_SUPPORT
	 * @private
	 * @readOnly
	 */
	var WEB_STORAGE_SUPPORT = window.Storage !== undefined;

	/**
	 * A constant for cookie fallback for `SavedData.clear()` 
	 * @static
	 * @property {int} ERASE_COOKIE
	 * @private
	 * @readOnly
	 * @default -1
	 */
	var ERASE_COOKIE = -1;

	//in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
	if (WEB_STORAGE_SUPPORT)
	{
		try
		{
			localStorage.setItem("LS_TEST", "test");
			localStorage.removeItem("LS_TEST");
		}
		catch (e)
		{
			WEB_STORAGE_SUPPORT = false;
		}
	}

	/**
	 * Remove a saved variable by name.
	 * @method remove
	 * @static
	 * @param {String} name The name of the value to remove
	 */
	SavedData.remove = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			localStorage.removeItem(name);
			sessionStorage.removeItem(name);
		}
		else
			SavedData.write(name, "", ERASE_COOKIE);
	};

	/**
	 * Save a variable.
	 * @method write
	 * @static
	 * @param {String} name The name of the value to save
	 * @param {mixed} value The value to save. This will be run through JSON.stringify().
	 * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
	 */
	SavedData.write = function(name, value, tempOnly)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			if (tempOnly)
				sessionStorage.setItem(name, JSON.stringify(value));
			else
				localStorage.setItem(name, JSON.stringify(value));
		}
		else
		{
			var expires;
			if (tempOnly)
			{
				if (tempOnly !== ERASE_COOKIE)
					expires = ""; //remove when browser is closed
				else
					expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT"; //save cookie in the past for immediate removal
			}
			else
				expires = "; expires=" + new Date(2147483646000).toGMTString(); //THE END OF (32bit UNIX) TIME!

			document.cookie = name + "=" + escape(JSON.stringify(value)) + expires + "; path=/";
		}
	};

	/**
	 * Read the value of a saved variable
	 * @method read
	 * @static
	 * @param {String} name The name of the variable
	 * @return {mixed} The value (run through `JSON.parse()`) or null if it doesn't exist
	 */
	SavedData.read = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			var value = localStorage.getItem(name) || sessionStorage.getItem(name);
			if (value)
				return JSON.parse(value, SavedData.reviver);
			else
				return null;
		}
		else
		{
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i = 0,
				c, len;

			for (i = 0, len = ca.length; i < len; i++)
			{
				c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return JSON.parse(unescape(c.substring(nameEQ.length, c.length)), SavedData.reviver);
			}
			return null;
		}
	};

	/**
	 * When restoring from JSON via `JSON.parse`, we may pass a reviver function.
	 * In our case, this will check if the object has a specially-named property (`__classname`).
	 * If it does, we will attempt to construct a new instance of that class, rather than using a
	 * plain old Object. Note that this recurses through the object.
	 * @method reviver
	 * @static
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
	 * @param  {String} key   each key name
	 * @param  {Object} value Object that we wish to restore
	 * @return {Object}       The object that was parsed - either cast to a class, or not
	 */
	SavedData.reviver = function(key, value)
	{
		if (value && typeof value.__classname == "string")
		{
			var _class = include(value.__classname, false);
			if (_class)
			{
				var rtn = new _class();
				//if we may call fromJSON, do so
				if (rtn.fromJSON)
				{
					rtn.fromJSON(value);
					//return the cast Object
					return rtn;
				}
			}
		}
		//return the object we were passed in
		return value;
	};

	// Assign to the global space
	namespace('springroll').SavedData = SavedData;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(window)
{

	// Include the window.performance object
	var performance = include('performance', false);

	// See if we have performance.now or any of
	// the brower-specific versions
	var now = performance && (
		performance.now ||
		performance.mozNow ||
		performance.msNow ||
		performance.oNow ||
		performance.webkitNow
	);

	// Browser prefix polyfill
	if (now) performance.now = now;

	/**
	 * A collection of Time related utility functions
	 * @class TimeUtils
	 */
	var TimeUtils = {};

	/**
	 * This method gets timestamp in micromilliseconds for doing performance
	 * intense operations. Fallback support is to `Date.now()`. We aren't overridding
	 * `performance.now()` incase dependencies on this actually demand 
	 * the optimization and accuracy that performance actually provides.
	 * @static
	 * @method now
	 * @return {int} The number of micromilliseconds of the current timestamp
	 */
	TimeUtils.now = !now ? Date.now : function()
	{
		return performance.now();
	};

	// Assign to namespace
	namespace('springroll').TimeUtils = TimeUtils;

}(window));
(function()
{

	/**
	 * A class for generating weighted random values. Input objects are dictionary objects
	 * where the keys are the strings to be picked from, and the values are the corresponding
	 * odds as integers. For example:
	 *
	 *  {
	 *      itemWith25PercentChance: 2,
	 *      itemWith50PercentChance: 4,
	 *      otherItemWith25PercentChance: 2
	 *  }
	 *
	 * @class WeightedRandom
	 * @constructor
	 * @param {Object} object The configuration object for this weighted value generator.
	 */
	var WeightedRandom = function(object)
	{
		this.max = -1;
		this.options = [];
		var total = 0;
		for (var key in object)
		{
			total += object[key];
			this.options.push(
			{
				key: key,
				value: total
			});
			this.max += object[key];
		}
	};

	var p = extend(WeightedRandom);

	/**
	 * Picks an item at random.
	 * @method random
	 * @return {String} The randomly chosen value.
	 */
	p.random = function()
	{
		var rand = Math.randomInt(0, this.max);
		for (var i = 0, options = this.options, length = options.length; i < length; ++i)
		{
			if (rand < options[i].value)
				return options[i].key;
		}
		//if we are somehow here, then return null
		return null;
	};

	// Assign to namespace
	namespace('springroll').WeightedRandom = WeightedRandom;
}());
(function()
{
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	var len = vendors.length;
	for (var x = 0; x < len && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	// create a setTimeout based fallback if there wasn't an official or prefixed version
	if (!window.requestAnimationFrame)
	{
		var TimeUtils = include('springroll.TimeUtils');
		var lastTime = 0;
		// Create the polyfill
		window.requestAnimationFrame = function(callback)
		{
			var currTime = TimeUtils.now(); //use the now function from down below
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function()
			{
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		// Only set this up if the corresponding requestAnimationFrame was set up
		window.cancelAnimationFrame = function(id)
		{
			clearTimeout(id);
		};
	}

	// Short alias
	window.requestAnimFrame = window.requestAnimationFrame;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The EventDispatcher mirrors the functionality of AS3 and EaselJS's EventDispatcher,
	 * but is more robust in terms of inputs for the `on()` and `off()` methods.
	 *
	 * @class EventDispatcher
	 * @constructor
	 */
	var EventDispatcher = function()
	{
		/**
		 * The collection of listeners
		 * @property {Object} _listeners
		 * @private
		 */
		this._listeners = {};

		/**
		 * If the dispatcher is destroyed
		 * @property {Boolean} _destroyed
		 * @protected
		 */
		this._destroyed = false;
	};

	// Reference to the prototype
	var p = extend(EventDispatcher);

	/**
	 * If the dispatcher is destroyed
	 * @property {Boolean} destroyed
	 */
	Object.defineProperty(p, 'destroyed',
	{
		enumerable: true,
		get: function()
		{
			return this._destroyed;
		}
	});

	/**
	 * Dispatch an event
	 * @method trigger
	 * @param {String} type The type of event to trigger
	 * @param {*} arguments Additional parameters for the listener functions.
	 */
	p.trigger = function(type)
	{
		if (this._destroyed) return;

		if (this._listeners.hasOwnProperty(type) && (this._listeners[type] !== undefined))
		{
			// copy the listeners array
			var listeners = this._listeners[type].slice();

			var args;

			if (arguments.length > 1)
			{
				args = Array.prototype.slice.call(arguments, 1);
			}

			for (var i = listeners.length - 1; i >= 0; --i)
			{
				var listener = listeners[i];
				if (listener._eventDispatcherOnce)
				{
					delete listener._eventDispatcherOnce;
					this.off(type, listener);
				}
				listener.apply(this, args);
			}
		}
	};

	/**
	 * Add an event listener but only handle it one time.
	 *
	 * @method once
	 * @param {String|object} name The type of event (can be multiple events separated by spaces),
	 *      or a map of events to handlers
	 * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	 * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.once = function(name, callback, priority)
	{
		return this.on(name, callback, priority, true);
	};

	/**
	 * Add an event listener. The parameters for the listener functions depend on the event.
	 *
	 * @method on
	 * @param {String|object} name The type of event (can be multiple events separated by spaces),
	 *      or a map of events to handlers
	 * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	 * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.on = function(name, callback, priority, once)
	{
		if (this._destroyed) return;

		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key], priority, once);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '),
				n = null;

			var listener;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				if (this._listeners.hasOwnProperty(n))
				{
					listener = this._listeners[n];
				}
				else
				{
					listener = this._listeners[n] = [];
				}

				if (once)
				{
					callback._eventDispatcherOnce = true;
				}
				callback._priority = parseInt(priority) || 0;

				if (listener.indexOf(callback) === -1)
				{
					listener.push(callback);
					if (listener.length > 1)
						listener.sort(listenerSorter);
				}
			}
		}
		// Callbacks array
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f], priority, once);
			}
		}
		return this;
	};

	function listenerSorter(a, b)
	{
		return a._priority - b._priority;
	}

	/**
	 * Remove the event listener
	 *
	 * @method off
	 * @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
	 * @param {Function|Array*} callback The listener function or collection of callback functions
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.off = function(name, callback)
	{
		if (this._destroyed) return;

		// remove all
		if (name === undefined)
		{
			this._listeners = {};
		}
		// remove multiple callbacks
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' ');
			var n = null;
			var listener;
			var index;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				if (this._listeners.hasOwnProperty(n))
				{
					listener = this._listeners[n];

					// remove all listeners for that event
					if (callback === undefined)
					{
						listener.length = 0;
					}
					else
					{
						//remove single listener
						index = listener.indexOf(callback);
						if (index !== -1)
						{
							listener.splice(index, 1);
						}
					}
				}
			}
		}
		return this;
	};

	/**
	 * Checks if the EventDispatcher has a specific listener or any listener for a given event.
	 *
	 * @method has
	 * @param {String} name The name of the single event type to check for
	 * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
	 * @return {Boolean} If the EventDispatcher has the specified listener.
	 */
	p.has = function(name, callback)
	{
		if (!name || !this._listeners.hasOwnProperty(name)) return false;

		var listeners = this._listeners[name];
		if (!listeners) return false;
		if (!callback)
			return listeners.length > 0;
		return listeners.indexOf(callback) >= 0;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._destroyed = true;
		this._listeners = null;
	};

	/**
	 * Return type of the value.
	 *
	 * @private
	 * @method type
	 * @param  {*} value
	 * @return {String} The type
	 */
	function type(value)
	{
		if (value === null)
		{
			return 'null';
		}
		var typeOfValue = typeof value;
		if (typeOfValue === 'object' || typeOfValue === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeOfValue;
	}

	// Assign to name space
	namespace('springroll').EventDispatcher = EventDispatcher;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Event dispatcher with ability to detect whenever a property
	 * is changed.
	 * @class PropertyDispatcher
	 * @extends springroll.EventDispatcher
	 * @constructor {Object} [overrides] The supplied options
	 */
	var PropertyDispatcher = function()
	{
		EventDispatcher.call(this);

		/**
		 * The map of property values to store
		 * @private
		 * @property {Object} _properties
		 */
		this._properties = {};
	};

	// Extend the base class
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(PropertyDispatcher);

	/**
	 * Generic setter for an option
	 * @private
	 * @method set
	 * @param {string} prop The property name
	 * @param {mixed} value The value to set
	 */
	var set = function(name, value)
	{
		var prop = this._properties[name];
		if (prop.readOnly)
		{
			throw "Property '" + name + "' is read-only";
		}
		var oldValue = prop.value;
		prop.value = value;
		if (oldValue != value)
		{
			this.trigger(name, value);
		}
	};

	/**
	 * Generic setter for an option
	 * @private
	 * @method get
	 * @param {string} prop The option name
	 * @return {mixed} The value of the option
	 */
	var get = function(name)
	{
		var prop = this._properties[name];
		if (prop.responder)
		{
			var value = prop.responder();
			prop.value = value;
			return value;
		}
		return prop.value;
	};

	/**
	 * Add a new property to allow deteching
	 * @method add
	 * @param {string} prop The property name
	 * @param {mixed} [value=null] The default value
	 * @param {Boolean} [readOnly=false] If the property is readonly
	 * @return {PropertyDispatcher} The instance for chaining
	 */
	p.add = function(name, value, readOnly)
	{
		var props = this._properties;
		var prop = props[name];

		if (prop !== undefined)
		{
			prop.setValue(value);
			prop.setReadOnly(readOnly === undefined ? prop.readOnly : readOnly);
			return this;
		}

		if (this.hasOwnProperty(name))
		{
			throw "Object already has property " + name;
		}

		props[name] = new Property(name, value, readOnly);

		Object.defineProperty(this, name,
		{
			get: get.bind(this, name),
			set: set.bind(this, name)
		});
		return this;
	};

	/**
	 * Whenever a property is get a responder is called
	 * @method respond
	 * @param {String} name The property name
	 * @param {Function} responder Function to call when getting property
	 * @return {PropertyDispatcher} The instance for chaining
	 */
	p.respond = function(name, responder)
	{
		var prop = this._properties[name];
		if (prop === undefined)
		{
			if (false)
				throw "Property " + name + " does not exist";
			else
				throw "Property " + name + " does not exist, you must add(name, value) first before adding responder";
		}
		prop.responder = responder;

		// Update the property value
		prop.value = responder();

		return this;
	};

	/**
	 * Clean-up all references, don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		var prop;
		for (var name in this._properties)
		{
			prop = this._properties[name];
			prop.value = null;
			prop.responder = null;
		}
		this._properties = null;
		s.destroy.call(this);
	};

	/**
	 * Internal class for managing the property
	 * @class Property
	 * @private
	 * @constructor
	 * @param {String} name The name of the property
	 * @param {*} [value=null] The initial value
	 * @param {Boolean} [readOnly=false] If property is read-only
	 */
	var Property = function(name, value, readOnly)
	{
		this.name = name;
		this.setValue(value);
		this.setReadOnly(readOnly);
		this.responder = null;
	};

	/**
	 * Set the value of the property
	 * @method setValue
	 * @param {*} [value=null] The value to set
	 */
	Property.prototype.setValue = function(value)
	{
		this.value = value === undefined ? null : value;
	};

	/**
	 * Set the value of the property
	 * @method setReadOnly
	 * @param {Boolean} [readOnly=false] The readOnly status
	 */
	Property.prototype.setReadOnly = function(readOnly)
	{
		this.readOnly = readOnly === undefined ? false : !!readOnly;
	};

	// Assign to namespace
	namespace('springroll').PropertyDispatcher = PropertyDispatcher;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var PropertyDispatcher = include('springroll.PropertyDispatcher'),
		Debug;

	/**
	 * Manage the Application options
	 * @class ApplicationOptions
	 * @extends springroll.PropertyDispatcher
	 * @constructor {Object} [overrides] The supplied options
	 */
	var ApplicationOptions = function(app, options)
	{
		if (Debug === undefined)
			Debug = include('springroll.Debug', false);

		PropertyDispatcher.call(this);

		/**
		 * The user input options
		 * @property {Object} _options
		 * @private
		 */
		this._options = options ||
		{};

		/**
		 * Reference to the application
		 * @property {springroll.Application} _app
		 * @private
		 */
		this._app = app;
	};

	// Extend the base class
	var p = PropertyDispatcher.extend(ApplicationOptions);

	/**
	 * Initialize the values in the options
	 * @method init
	 */
	p.init = function()
	{
		var options = this._options;
		var app = this._app;

		// Create the options overrides
		options = Object.merge(
		{}, options);

		// If parse querystring is turned on, we'll
		// override with any of the query string parameters
		if (options.useQueryString)
		{
			Object.merge(options, getQueryString());
		}

		// Create getter and setters for all properties
		// this is so we can dispatch events when the property changes
		for (var name in options)
		{
			this.add(name, options[name]);
		}

		//trigger all of the initial values, because otherwise they don't take effect.
		var _properties = this._properties;
		for (var id in _properties)
		{
			this.trigger(id, _properties[id].value);
		}
	};

	/**
	 * Get the query string as an object
	 * @property {Object} getQueryString
	 * @private
	 */
	var getQueryString = function()
	{
		var output = {};
		var href = window.location.search;
		if (!href) //empty string is false
		{
			return output;
		}
		var vars = href.substr(href.indexOf("?") + 1);
		var pound = vars.indexOf('#');
		vars = pound < 0 ? vars : vars.substring(0, pound);
		var splitFlashVars = vars.split("&");
		var myVar;
		for (var i = 0, len = splitFlashVars.length; i < len; i++)
		{
			myVar = splitFlashVars[i].split("=");
			var value = myVar[1];
			if (value === "true" || value === undefined)
				value = true;
			else if (value === "false")
				value = false;
			if (true && Debug)
			{
				Debug.log(myVar[0] + " -> " + value);
			}
			output[myVar[0]] = value;
		}
		return output;
	};

	/**
	 * Convert a string into a DOM Element
	 * @method asDOMElement
	 * @param {String} name The property name to fetch
	 */
	p.asDOMElement = function(name)
	{
		var prop = this._properties[name];
		if (prop && prop.value && typeof prop.value === "string")
		{
			prop.value = document.getElementById(prop.value);
		}
	};

	/**
	 * Override a default value
	 * @method override
	 * @param {String} name The property name to fetch
	 * @param {*} value The value
	 * @return {springroll.ApplicationOptions} Instance of this options for chaining
	 */
	p.override = function(name, value)
	{
		var prop = this._properties[name];
		if (prop === undefined)
		{
			if (true)
			{
				throw "Unable to override a property that doesn't exist '" + name + "'";
			}
			else
			{
				throw "Invalid override " + name;
			}
		}
		prop.setValue(value);
		return this;
	};

	// Assign to namespace
	namespace('springroll').ApplicationOptions = ApplicationOptions;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Application;

	/**
	 * Responsible for creating properties, methods to 
	 * the SpringRoll Application when it's created.
	 *
	 *	var plugin = new ApplicationPlugin();
	 *	plugin.setup = function()
	 *	{
	 *		this.options.add('customOption', null);
	 *	};
	 *
	 * @class ApplicationPlugin
	 * @constructor
	 * @param {int} [priority=0] The priority, higher priority
	 *        plugins are setup, preloaded and destroyed first.
	 */
	var ApplicationPlugin = function(priority)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
		}

		/**
		 * The priority of the plugin. Higher numbers handled first. This should be set
		 * in the constructor of the extending ApplicationPlugin.
		 * @property {int} priority
		 * @default 0
		 * @private
		 */
		this.priority = priority || 0;

		/**
		 * When the application is being initialized. This function 
		 * is bound to the Application. This should be overridden.
		 * @method setup
		 */
		this.setup = function() {};

		/**
		 * The function to call right before the application is initailized. 
		 * This function is bound to the Application. `preload` takes
		 * a single parameter which is a call back to call when
		 * the asyncronous event is completed.
		 * @method preload 
		 * @param {function} done The event to call when complete
		 */
		this.preload = null;

		/**
		 * When the application is being destroyed. This function 
		 * is bound to the Application. This should be overridden.
		 * @method teardown
		 */
		this.teardown = function() {};

		// Add the plugin to application
		Application._plugins.push(this);
		Application._plugins.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	// Assign to namespace
	namespace('springroll').ApplicationPlugin = ApplicationPlugin;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	// classes to import
	var TimeUtils = include('springroll.TimeUtils'),
		EventDispatcher = include('springroll.EventDispatcher'),
		ApplicationOptions = include('springroll.ApplicationOptions'),
		DelayedCall = include('springroll.DelayedCall');

	/**
	 * Application is the main entry point for using SpringRoll, creating
	 * an application allows the creation of displays and adding of module
	 * functionality (e.g. sound, captions, etc). All timing and asynchronous
	 * events should be handled by the Application to control the play
	 * and pause. Any update, Ticker-type functions, should use the Applications
	 * update event.
	 *
	 *	var app = new Application();
	 *
	 * @class Application
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {Object} [options] The options for creating the application,
	 * 		see `springroll.ApplicationOptions` for the specific options
	 *		that can be overridden and set.
	 * @param {Function} [init=null] The callback when initialized
	 */
	var Application = function(options, init)
	{
		if (_instance)
		{
			throw "Only one Application can be opened at a time";
		}
		_instance = this;

		EventDispatcher.call(this);

		/**
		 * Initialization options/query string parameters, these properties are read-only
		 * Application properties like raf, fps, don't have any affect on the options object.
		 * @property {springroll.ApplicationOptions} options
		 * @readOnly
		 */
		this.options = new ApplicationOptions(this, options);

		/**
		 * Primary renderer for the application, for simply accessing
		 * Application.instance.display.stage;
		 * The first display added becomes the primary display automatically.
		 * @property {Display} display
		 * @public
		 */
		this.display = null;

		/**
		 * Override this to do post constructor initialization
		 * @property {Function} init
		 */
		this.init = init || null;

		/**
		 * The preload progress
		 * @property {springroll.AssetLoad} pluginLoad
		 * @protected
		 */
		this.pluginLoad = null;

		// Reset the displays
		_displaysMap = {};
		_displays = [];

		// Add the _tick bind
		_tickCallback = this._tick.bind(this);

		// Call any global libraries to initialize
		Application._plugins.forEach(function(plugin)
		{
			plugin.setup.call(_instance);
		});

		// Options are initialized after plugins
		// so plugins can define their own options
		this.options.init();

		/**
		 * The name of the game, useful for debugging purposes
		 * @property {String} name
		 * @default ""
		 */
		this.name = this.options.name;

		//other initialization stuff too
		//if there are some specific properties on the options, use them to make a display
		//call init after handling loading up a versions file or any other needed asynchronous
		//stuff?
		setTimeout(this._preInit.bind(this), 0);
	};

	/**
	 * The current version of the library
	 * @property {String} version
	 * @static
	 * @readOnly
	 */
	Application.version = "1.0.3";

	// Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(Application);

	/**
	 * The collection of function references to call when initializing the application
	 * these are registered by external modules.
	 * @property {Array} _plugins
	 * @private
	 * @static
	 */
	Application._plugins = [];

	/**
	 * The number of ms since the last frame update
	 * @private
	 * @property {int} _lastFrameTime
	 */
	var _lastFrameTime = 0,

		/**
		 * The bound callback for listening to tick events
		 * @private
		 * @property {Function} _tickCallback
		 */
		_tickCallback = null,

		/**
		 * If the current application is paused
		 * @private
		 * @property {Boolean} _paused
		 */
		_paused = false,

		/**
		 * If the current application is enabled
		 * @private
		 * @property {Boolean} _enabled
		 */
		_enabled = true,

		/**
		 * The id of the active requestAnimationFrame or setTimeout call.
		 * @property {Number} _tickId
		 * @private
		 */
		_tickId = -1,

		/**
		 * If requestionAnimationFrame should be used
		 * @private
		 * @property {Bool} _useRAF
		 * @default false
		 */
		_useRAF = false,

		/**
		 * The number of milliseconds per frame
		 * @property {int} _msPerFrame
		 * @private
		 */
		_msPerFrame = 0,

		/**
		 * The collection of displays
		 * @property {Array} _displays
		 * @private
		 */
		_displays = null,

		/**
		 * The displays by canvas id
		 * @property {Object} _displaysMap
		 * @private
		 */
		_displaysMap = null;


	/**
	 * Fired when initialization of the application is ready
	 * @event init
	 */

	/**
	 * The handler for the plugin progress
	 * @event pluginProgress
	 */

	/**
	 * Fired when initialization of the application is done
	 * @event afterInit
	 */

	/**
	 * Fired when before initialization of the application
	 * @event beforeInit
	 */

	/**
	 * Fired when an update is called, every frame update
	 * @event update
	 * @param {int} elasped The number of milliseconds since the last frame update
	 */

	/**
	 * Fired when the pause state is toggled
	 * @event pause
	 * @param {boolean} paused If the application is now paused
	 */

	/**
	 * When a display is added.
	 * @event displayAdded
	 * @param {springroll.AbstractDisplay} [display] The current display being added
	 */

	/**
	 * When a display is removed.
	 * @event displayRemoved
	 * @param {string} [displayId] The display alias
	 */

	/**
	 * Fired when the application becomes paused
	 * @event paused
	 */

	/**
	 * Fired when the application resumes from a paused state
	 * @event resumed
	 */

	/**
	 * Fired when the application is destroyed
	 * @event destroy
	 */

	/**
	 * Get the singleton instance of the application
	 * @property {Application} instance
	 * @static
	 * @public
	 */
	var _instance = null;
	Object.defineProperty(Application, "instance",
	{
		get: function()
		{
			return _instance;
		}
	});

	/**
	 * The internal initialization
	 * @method _preInit
	 * @private
	 */
	p._preInit = function()
	{
		if (this.destroyed) return;

		var options = this.options;

		_useRAF = options.raf;
		options.on('raf', function(value)
		{
			_useRAF = value;
		});

		options.on('fps', function(value)
		{
			if (typeof value != "number") return;
			_msPerFrame = (1000 / value) | 0;
		});

		//add the initial display if specified
		if (options.canvasId && options.display)
		{
			this.addDisplay(
				options.canvasId,
				options.display,
				options.displayOptions
			);
		}

		var tasks = [];

		// Add the plugin ready functions to the list
		// of async tasks to start-up
		Application._plugins.forEach(function(plugin)
		{
			if (plugin.preload)
			{
				tasks.push(plugin.preload.bind(_instance));
			}
		});

		// Run the asyncronous tasks in series
		this.pluginLoad = this.load(tasks,
		{
			complete: this._doInit.bind(this),
			progress: onPluginProgress.bind(this),
			autoStart: false,
			startAll: false
		});

		// Manually start load
		this.pluginLoad.start();
	};

	/**
	 * Progress handler for the plugin load
	 * @method onPluginProgress
	 * @private
	 * @param {Number} progress Plugins preloaded amount from 0 - 1
	 */
	var onPluginProgress = function(progress)
	{
		this.trigger('pluginProgress', progress);
	};

	/**
	 * Initialize the application
	 * @method _doInit
	 * @protected
	 */
	p._doInit = function()
	{
		if (this.destroyed) return;

		this.pluginLoad = null;

		this.trigger('beforeInit');

		//start update loop
		this.paused = false;

		// Dispatch the init event
		this.trigger('init');

		// Call the init function, bind to app
		if (this.init) this.init.call(this);

		this.trigger('afterInit');
	};

	/**
	 * Enables at the application level which enables
	 * and disables all the displays.
	 * @property {Boolean} enabled
	 * @default true
	 */
	Object.defineProperty(p, "enabled",
	{
		set: function(enabled)
		{
			_enabled = enabled;
			_displays.forEach(function(display)
			{
				display.enabled = enabled;
			});
		},
		get: function()
		{
			return _enabled;
		}
	});

	/**
	 * Manual pause for the entire application, this suspends
	 * anything driving the the application update events. Include
	 * Animator, Captions, Sound and other media playback.
	 * @property {Boolean} paused
	 */
	Object.defineProperty(p, "paused",
	{
		get: function()
		{
			return _paused;
		},
		set: function(value)
		{
			_paused = !!value;
			this.internalPaused(_paused);
		}
	});

	/**
	 * Handle the internal pause of the application
	 * @protected
	 * @method internalPaused
	 * @param  {Boolean} paused If the application should be paused or not
	 */
	p.internalPaused = function(paused)
	{
		this.trigger('pause', paused);
		this.trigger(paused ? 'paused' : 'resumed', paused);

		if (paused)
		{
			if (_tickId != -1)
			{
				if (_useRAF)
				{
					cancelAnimationFrame(_tickId);
				}
				else
					clearTimeout(_tickId);
				_tickId = -1;
			}
		}
		else
		{
			if (_tickId == -1 && _tickCallback)
			{
				_lastFrameTime = TimeUtils.now();
				_tickId = _useRAF ?
					requestAnimFrame(_tickCallback) :
					setTargetedTimeout(_tickCallback);
			}
		}
	};

	/**
	 * Makes a setTimeout with a time based on _msPerFrame and the amount of time spent in the
	 * current tick.
	 * @method setTargetedTimeout
	 * @param {Function} callback The tick function to call.
	 * @param {int} timeInFrame=0 The amount of time spent in the current tick in milliseconds.
	 * @private
	 */
	var setTargetedTimeout = function(callback, timeInFrame)
	{
		var timeToCall = _msPerFrame;
		//subtract the time spent in the frame to actually hit the target fps
		if (timeInFrame)
			timeToCall = Math.max(0, _msPerFrame - timeInFrame);
		return setTimeout(callback, timeToCall);
	};

	/**
	 * Add a display. If this is the first display added, then it will be stored as this.display.
	 * @method addDisplay
	 * @param {String} id The id of the canvas element, this will be used to grab the Display later
	 *                   also the Display should be the one to called document.getElementById(id)
	 *                   and not the application sinc we don't care about the DOMElement as this
	 *                   point
	 * @param {function} displayConstructor The function to call to create the display instance
	 * @param {Object} [options] Optional Display specific options
	 * @return {Display} The created display.
	 */
	p.addDisplay = function(id, displayConstructor, options)
	{
		if (_displaysMap[id])
		{
			throw "Display exists with id '" + id + "'";
		}
		// Creat the display
		var display = new displayConstructor(id, options);

		// Add it to the collections
		_displaysMap[id] = display;
		_displays.push(display);

		// Inherit the enabled state from the application
		display.enabled = _enabled;

		if (!this.display)
		{
			this.display = display;
		}
		this.trigger('displayAdded', display);
		return display;
	};

	/**
	 * Get all the displays
	 * @property {Array} displays
	 * @readOnly
	 */
	Object.defineProperty(p, 'displays',
	{
		get: function()
		{
			return _displays;
		}
	});

	/**
	 * Gets a specific renderer by the canvas id.
	 * @method getDisplay
	 * @param {String} id The id of the canvas
	 * @return {Display} The requested display.
	 */
	p.getDisplay = function(id)
	{
		return _displaysMap[id];
	};

	/**
	 * Removes and destroys a display
	 * @method removeDisplay
	 * @param {String} id The Display's id (also the canvas ID)
	 */
	p.removeDisplay = function(id)
	{
		var display = _displaysMap[id];
		if (display)
		{
			_displays.splice(_displays.indexOf(display), 1);
			display.destroy();
			delete _displaysMap[id];
			this.trigger('displayRemoved', id);
		}
	};

	/**
	 * _tick would be bound in _tickCallback
	 * @method _tick
	 * @private
	 */
	p._tick = function()
	{
		if (_paused)
		{
			_tickId = -1;
			return;
		}

		var now = TimeUtils.now();
		var elapsed = now - _lastFrameTime;
		_lastFrameTime = now;

		//trigger the update event
		this.trigger('update', elapsed);

		//then update all displays
		//displays may be null if a tick happens while we are in the process of destroying
		if (_displays)
		{
			for (var i = 0; i < _displays.length; i++)
			{
				_displays[i].render(elapsed);
			}
		}

		//request the next tick
		//request the next animation frame
		if (_tickCallback)
		{
			_tickId = _useRAF ?
				requestAnimFrame(_tickCallback) :
				setTargetedTimeout(_tickCallback, TimeUtils.now() - _lastFrameTime);
		}
	};

	/**
	 * Works just like `window.setTimeout` but respects the pause
	 * state of the Application.
	 * @method  setTimeout
	 * @param {Function} callback    The callback function, passes one argument which is the DelayedCall instance
	 * @param {int}   delay       The time in milliseconds or the number of frames (useFrames must be true)
	 * @param {Boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
	 * @param {[type]}   [autoDestroy=true] If the DelayedCall object should be destroyed after completing
	 * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
	 */
	p.setTimeout = function(callback, delay, useFrames, autoDestroy)
	{
		return new DelayedCall(callback, delay, false, autoDestroy, useFrames);
	};

	/**
	 * Works just like `window.setInterval` but respects the pause
	 * state of the Application.
	 * @method  setInterval
	 * @param {Function} callback    The callback function, passes one argument which is the DelayedCall instance
	 * @param {int}   delay       The time in milliseconds or the number of frames (useFrames must be true)
	 * @param {Boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
	 * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
	 */
	p.setInterval = function(callback, delay, useFrames)
	{
		return new DelayedCall(callback, delay, true, false, useFrames);
	};

	/**
	 * Destroys the application and all active displays and plugins
	 * @method destroy
	 */
	p.destroy = function()
	{
		// Only destroy the application once
		if (this.destroyed) return;

		this.paused = true;
		this.trigger('destroy');

		// Destroy in the reverse priority order
		var plugins = Application._plugins.slice().reverse();

		plugins.forEach(function(plugin)
		{
			plugin.teardown.call(_instance);
		});

		_displays.forEach(function(display)
		{
			display.destroy();
		});
		_displays = null;
		_displaysMap = null;

		_instance =
			_tickCallback = null;

		this.display = null;
		this.options.destroy();
		this.options = null;

		s.destroy.call(this);
	};

	/**
	 * The toString debugging method
	 * @method toString
	 * @return {String} The reprsentation of this class
	 */
	p.toString = function()
	{
		return "[Application name='" + this.name + "']";
	};

	// Add to the name space
	namespace('springroll').Application = Application;

}());
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Tween = include('createjs.Tween', false);
	var Ticker = include('createjs.Ticker', false);

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(120);

	plugin.setup = function()
	{
		var options = this.options;
		/**
		 * Use Request Animation Frame API
		 * @property {Boolean} options.raf
		 * @default true
		 */
		options.add('raf', true, true);

		/**
		 * The framerate to use for rendering the stage
		 * @property {int} options.fps
		 * @default 60
		 */
		options.add('fps', 60, true);

		/**
		 * Use the query string parameters for options overrides
		 * @property {Boolean} options.useQueryString
		 * @default false
		 */
		options.add('useQueryString', true, true);

		/**
		 * The default display DOM ID name
		 * @property {String} options.canvasId
		 */
		options.add('canvasId', null, true);

		/**
		 * The name of the class to automatically instantiate as the
		 * display (e.g. `springroll.PixiDisplay`)
		 * @property {Function} options.display
		 */
		options.add('display', null, true);

		/**
		 * Display specific setup options
		 * @property {Object} options.displayOptions
		 */
		options.add('displayOptions', null, true);

		/**
		 * If using TweenJS, the Application will update the Tween itself.
		 * @property {Boolean} options.updateTween
		 * @default true
		 */
		var app = this;
		options.add('updateTween', true, true)
			.on('updateTween', function(value)
			{
				if (Tween)
				{
					if (Ticker)
					{
						Ticker.setPaused(!!value);
					}
					app.off('update', Tween.tick);
					if (value)
					{
						app.on('update', Tween.tick);
					}
				}
			});

		/**
		 * The name of the application
		 * @property {String} options.name
		 * @default ''
		 */
		options.add('name', '', true);
	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(global, doc, undefined)
{

	/**
	 * Handle the page visiblity change, if supported. Application uses one of these to
	 * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
	 * or `resumed` events on the Application instead of using one of these yourself.
	 *
	 * @class PageVisibility
	 * @constructor
	 * @param {Function} onFocus Callback when the page becomes visible
	 * @param {Function} onBlur Callback when the page loses visibility
	 */
	var PageVisibility = function(onFocus, onBlur)
	{
		/**
		 * Callback when the page becomes visible
		 * @property {Function} _onFocus
		 * @private
		 */
		this._onFocus = onFocus;

		/**
		 * Callback when the page loses visibility
		 * @property {Function} _onBlur
		 * @private
		 */
		this._onBlur = onBlur;

		/**
		 * If this object is enabled.
		 * @property {Function} _enabled
		 * @private
		 */
		this._enabled = false;

		// If this browser doesn't support visibility
		if (!_visibilityChange && doc.onfocusin === undefined) return;

		/**
		 * The visibility toggle listener function
		 * @property {Function} _onToggle
		 * @private
		 */
		this._onToggle = function()
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				this._onBlur();
			else
				this._onFocus();
		}.bind(this);

		this.enabled = true;
	};

	// Reference to the prototype
	var p = extend(PageVisibility);

	/**
	 * The name of the visibility change event for the browser
	 *
	 * @property {String} _visibilityChange
	 * @private
	 */
	var _visibilityChange = null;

	// Select the visiblity change event name
	if (doc.hidden !== undefined)
	{
		_visibilityChange = "visibilitychange";
	}
	else if (doc.mozHidden !== undefined)
	{
		_visibilityChange = "mozvisibilitychange";
	}
	else if (doc.msHidden !== undefined)
	{
		_visibilityChange = "msvisibilitychange";
	}
	else if (doc.webkitHidden !== undefined)
	{
		_visibilityChange = "webkitvisibilitychange";
	}

	var isIE9 = !_visibilityChange && doc.onfocusin !== undefined;

	/**
	 * If this object is enabled.
	 * @property {Function} enabled
	 * @private
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			value = !!value;
			if (this._enabled == value) return;
			this._enabled = value;

			global.removeEventListener("pagehide", this._onBlur);
			global.removeEventListener("pageshow", this._onFocus);
			global.removeEventListener("blur", this._onBlur);
			global.removeEventListener("focus", this._onFocus);
			global.removeEventListener("visibilitychange", this._onToggle);
			doc.removeEventListener(_visibilityChange, this._onToggle, false);
			if (isIE9)
			{
				doc.removeEventListener("focusin", this._onFocus);
				doc.removeEventListener("focusout", this._onBlur);
			}

			if (value)
			{
				// Listen to visibility change
				// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
				doc.addEventListener(_visibilityChange, this._onToggle, false);
				// Listen for page events (when clicking the home button on iOS)
				global.addEventListener("pagehide", this._onBlur);
				global.addEventListener("pageshow", this._onFocus);
				global.addEventListener("blur", this._onBlur);
				global.addEventListener("focus", this._onFocus);
				global.addEventListener("visibilitychange", this._onToggle, false);
				//IE9 is old and uses its own events
				if (isIE9)
				{
					doc.addEventListener("focusin", this._onFocus);
					doc.addEventListener("focusout", this._onBlur);
				}
			}
		}
	});

	/**
	 * Disable the detection
	 * @method destroy
	 */
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange || !this._onToggle) return;

		this.enabled = false;
		this._onToggle = null;
		this._onFocus = null;
		this._onBlur = null;
	};

	// Assign to the global space
	namespace('springroll').PageVisibility = PageVisibility;

}(window, document));
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Handles the page visiblity changes automatically
		 * to pause and resume the application
		 * @property {springroll.PageVisibility} _visibility
		 * @private
		 */
		var PageVisibility = include('springroll.PageVisibility');
		var visibility = this._visibility = new PageVisibility(
			onVisible.bind(this),
			onHidden.bind(this)
		);

		/**
		 * The application pauses automatically when the window loses focus.
		 * @property {Boolean} options.autoPause
		 * @default true
		 */
		this.options.add('autoPause', true)
			.on('autoPause', function(value)
			{
				visibility.enabled = value;
			})
			.respond('autoPause', function()
			{
				return visibility.enabled;
			});

		/**
		 * Setter for if the application is being automatically paused, 
		 * usually by the PageVisibility plugin or the ContainerClient plugin.
		 * @property {Boolean} autoPaused 
		 * @protected
		 */
		Object.defineProperty(this, 'autoPaused',
		{
			set: function(paused)
			{
				// check if app is manually paused
				if (!this.paused)
				{
					this.internalPaused(paused);
				}
			}
		});
	};

	/**
	 * Private listener for when the page is hidden.
	 * @method onHidden
	 * @private
	 */
	var onHidden = function()
	{
		this.autoPaused = true;
	};

	/**
	 * Private listener for when the page is shown.
	 * @method onVisible
	 * @private
	 */
	var onVisible = function()
	{
		this.autoPaused = false;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this._visibility) this._visibility.destroy();
		this._visibility = null;
	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	/**
	 * Class for filtering strings
	 * @constructor
	 * @class StringFilters
	 */
	var StringFilters = function()
	{
		/**
		 * Dictionary of filters
		 * @property {Array} _filters
		 * @private
		 */
		this._filters = [];
	};

	// Reference to prototype
	var p = extend(StringFilters);

	/**
	 * Register a filter
	 * @method add
	 * @param {String|RegExp} replace The string or regex to replace
	 * @param {String} replacement String to repalce with
	 * @static
	 */
	p.add = function(replace, replacement)
	{
		if (!replace || (typeof replace != 'string' && replace instanceof RegExp === false))
		{
			if (true)
				throw 'replace value must be a valid String or RegExp';
			else
				throw 'invalide replace value';
		}
		if (typeof replacement != 'string')
		{
			if (true)
				throw 'replacement value must be astring';
			else
				throw 'invalid replacement value';
		}

		if (this._filters)
		{
			for (var i = this._filters.length - 1; i >= 0; i--)
			{
				if (replace.toString() == this._filters[i].replace.toString())
				{
					if (true)
						throw "Filter " + replace +
							" already exists in this._filters array.";
					else
						throw "Filter already exists.";
				}
			}
			this._filters.push(
			{
				replace: replace,
				replacement: replacement
			});
		}
	};

	/**
	 * Test a string against all registered filters
	 * @method filter
	 * @param {String} str The string to check
	 * @static
	 */
	p.filter = function(str)
	{
		if (!this._filters)
		{
			return str;
		}
		for (var i = this._filters.length - 1; i >= 0; i--)
		{
			var replace = this._filters[i].replace;
			var replacement = this._filters[i].replacement;
			str = str.replace(replace, replacement);
		}
		return str;
	};

	/**
	 * @method destroy
	 * @static
	 */
	p.destroy = function()
	{
		this._filters = null;
	};

	//Assign to namespace
	namespace('springroll').StringFilters = StringFilters;
}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(110);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * The StringFilters instance
		 * @property {springroll.StringFilters} filters
		 */
		var StringFilters = include('springroll.StringFilters');
		this.filters = new StringFilters();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.filters) this.filters.destroy();
		this.filters = null;
	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var devicePixelRatio = include('devicePixelRatio', false);

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(100);

	/**
	 * Dom element (or the window) to attach resize listeners and read the size from
	 * @property {DOMElement|Window|null} _resizeElement
	 * @private
	 * @default null
	 */
	var _resizeElement = null;

	/**
	 * The maximum width of the primary display, compared to the original height.
	 * @property {Number} _maxWidth
	 * @private
	 */
	var _maxWidth = 0;

	/**
	 * The maximum height of the primary display, compared to the original width.
	 * @property {Number} _maxHeight
	 * @private
	 */
	var _maxHeight = 0;

	/**
	 * The original width of the primary display, used to calculate the aspect ratio.
	 * @property {int} _originalWidth
	 * @private
	 */
	var _originalWidth = 0;

	/**
	 * The original height of the primary display, used to calculate the aspect ratio.
	 * @property {int} _originalHeight
	 * @private
	 */
	var _originalHeight = 0;

	/**
	 * A helper object to avoid object creation each resize event.
	 * @property {Object} _resizeHelper
	 * @private
	 */
	var _resizeHelper = {
		width: 0,
		height: 0,
		normalWidth: 0,
		normalHeight: 0
	};

	/**
	 * The timeout when the window is being resized
	 * @property {springroll.DelayedCall} _windowResizer
	 * @private
	 */
	var _windowResizer = null;

	// Init the animator
	plugin.setup = function()
	{
		var options = this.options;

		/**
		 * Fired when a resize is called
		 * @event resize
		 * @param {int} width The width of the resize element
		 * @param {int} height The height of the resize element
		 */

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum width relative to the original height. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original width of the canvas.
		 * @property {int} options.maxWidth
		 */
		options.add('maxWidth', 0);

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum height relative to the original width. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original height of the canvas.
		 * @property {int} options.maxHeight
		 */
		options.add('maxHeight', 0);

		/**
		 * Whether to resize the displays to the original aspect ratio
		 * @property {Boolean} options.uniformResize
		 * @default true
		 */
		options.add('uniformResize', true);

		/**
		 * If responsive is true, the width and height properties
		 * are adjusted on the `<canvas>` element. It's assumed that
		 * responsive applications will adjust their own elements.
		 * If responsive is false then the style properties are changed.
		 * @property {Boolean} options.responsive
		 * @default false
		 */
		options.add('responsive', false, true);

		/**
		 * The element that the canvas is resized to fit.
		 * @property {DOMElement|String} options.resizeElement
		 * @default 'frame'
		 */
		options.add('resizeElement', 'frame', true);

		/**
		 * Whether to account for devicePixelRatio when rendering game
		 * @property {Boolean} options.enableHiDPI
		 * @default false
		 */
		options.add('enableHiDPI', false);

		options.on('maxWidth', function(value)
		{
			_maxWidth = value;
		});

		options.on('maxHeight', function(value)
		{
			_maxHeight = value;
		});

		// Handle when a display is added, only do it once
		// in order to get the main display
		this.once('displayAdded', function(display)
		{
			_originalWidth = display.width;
			_originalHeight = display.height;
			if (!_maxWidth)
				_maxWidth = _originalWidth;
			if (!_maxHeight)
				_maxHeight = _originalHeight;
		});

		/**
		 * The current width of the application, in real point values
		 * @property {int} realWidth
		 */
		this.realWidth = 0;

		/**
		 * The current height of the application, in real point values
		 * @property {int} realHeight
		 */
		this.realHeight = 0;

		/**
		 * Fire a resize event with the current width and height of the display
		 * @method triggerResize
		 */
		this.triggerResize = function()
		{
			if (!_resizeElement) return;

			// window uses innerWidth, DOM elements clientWidth
			_resizeHelper.width = (_resizeElement.innerWidth || _resizeElement.clientWidth) | 0;
			_resizeHelper.height = (_resizeElement.innerHeight || _resizeElement.clientHeight) | 0;

			this.calculateDisplaySize(_resizeHelper);

			// round up, as canvases require integer sizes
			// and canvas should be slightly larger to avoid
			// a hairline around outside of the canvas
			var width = this.realWidth = _resizeHelper.width;
			var height = this.realHeight = _resizeHelper.height;
			var normalWidth = _resizeHelper.normalWidth;
			var normalHeight = _resizeHelper.normalHeight;

			var responsive = this.options.responsive;
			var enableHiDPI = this.options.enableHiDPI;

			//resize the displays
			this.displays.forEach(function(display)
			{
				if (responsive)
				{
					if (enableHiDPI && devicePixelRatio)
					{
						display.canvas.style.width = width + "px";
						display.canvas.style.height = height + "px";
						width *= devicePixelRatio;
						height *= devicePixelRatio;
					}
					// update the dimensions of the canvas
					display.resize(width, height);
				}
				else
				{
					// scale the canvas element
					display.canvas.style.width = width + "px";
					display.canvas.style.height = height + "px";

					if (enableHiDPI && devicePixelRatio)
					{
						normalWidth *= devicePixelRatio;
						normalHeight *= devicePixelRatio;
					}
					// Update the canvas size for maxWidth and maxHeight
					display.resize(normalWidth, normalHeight);
				}
			});

			//send out the resize event
			this.trigger('resize', (responsive ? width : normalWidth), (responsive ? height : normalHeight));

			//redraw all displays
			this.displays.forEach(function(display)
			{
				display.render(0, true); // force renderer
			});
		};

		/**
		 * Handle the window resize events
		 * @method onWindowResize
		 * @protected
		 */
		this.onWindowResize = function()
		{
			// Call the resize once
			this.triggerResize();

			// After a short timeout, call the resize again
			// this will solve issues where the window doesn't
			// properly get the "full" resize, like on some mobile
			// devices when pulling-down/releasing the HUD
			_windowResizer = this.setTimeout(
				function()
				{
					this.triggerResize();
					_windowResizer = null;
				}
				.bind(this),
				500
			);
		};

		/**
		 * Calculates the resizing of displays. By default, this limits the new size
		 * to the initial aspect ratio of the primary display. Override this function
		 * if you need variable aspect ratios.
		 * @method calculateDisplaySize
		 * @protected
		 * @param {Object} size A size object containing the width and height of the resized container.
		 *                     The size parameter is also the output of the function, so the size
		 *                     properties are edited in place.
		 * @param {int} size.width The width of the resized container.
		 * @param {int} size.height The height of the resized container.
		 */
		this.calculateDisplaySize = function(size)
		{
			if (!_originalHeight || !this.options.uniformResize) return;

			var maxAspectRatio = _maxWidth / _originalHeight,
				minAspectRatio = _originalWidth / _maxHeight,
				originalAspect = _originalWidth / _originalHeight,
				currentAspect = size.width / size.height;

			if (currentAspect < minAspectRatio)
			{
				//limit to the narrower width
				size.height = size.width / minAspectRatio;
			}
			else if (currentAspect > maxAspectRatio)
			{
				//limit to the shorter height
				size.width = size.height * maxAspectRatio;
			}


			// Calculate the unscale, real-sizes
			currentAspect = size.width / size.height;
			size.normalWidth = _originalWidth;
			size.normalHeight = _originalHeight;

			if (currentAspect > originalAspect)
			{
				size.normalWidth = _originalHeight * currentAspect;
			}
			else if (currentAspect < originalAspect)
			{
				size.normalHeight = _originalWidth / currentAspect;
			}

			// round up, as canvases require integer sizes
			// and canvas should be slightly larger to avoid
			// a hairline around outside of the canvas
			size.width = Math.ceil(size.width);
			size.height = Math.ceil(size.height);
			size.normalWidth = Math.ceil(size.normalWidth);
			size.normalHeight = Math.ceil(size.normalHeight);
		};

		// Do an initial resize to make sure everything is positioned correctly
		this.once('beforeInit', this.triggerResize);
	};

	// Add common filters interaction
	plugin.preload = function(done)
	{
		var options = this.options;

		// Convert to DOM element
		options.asDOMElement('resizeElement');

		if (options.resizeElement)
		{
			_resizeElement = options.resizeElement;
			this.onWindowResize = this.onWindowResize.bind(this);
			window.addEventListener("resize", this.onWindowResize);
		}
		done();
	};

	plugin.teardown = function()
	{
		if (_windowResizer)
		{
			_windowResizer.destroy();
			_windowResizer = null;
		}

		if (_resizeElement)
		{
			window.removeEventListener("resize", this.onWindowResize);
		}
		_resizeElement = null;

		_resizeHelper.width =
			_resizeHelper.height =
			_resizeHelper.normalWidth =
			_resizeHelper.normalHeight =
			_originalWidth =
			_originalHeight =
			_maxHeight =
			_maxWidth = 0;

	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	// Classes to import
	var Debug;

	/**
	 * Used for managing the browser cache of loading external elements
	 * can easily load version manifest and apply it to the media loader
	 * supports cache busting all media load requests
	 * uses the query string to bust browser versions.
	 *
	 * @class CacheManager
	 * @constructor
	 * @param {springroll.Application} app Reference to application
	 */
	var CacheManager = function(app)
	{
		if (true && !Debug)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The current application
		 * @protected
		 * @property {springroll.Application} _app
		 */
		this._app = app;

		/**
		 * The collection of version numbers
		 * @protected
		 * @property {Dictionary} _versions
		 */
		this._versions = {};

		/**
		 * The list of URL filtering functions.
		 * @protected
		 * @property {Array} _filters
		 */
		this._filters = [];

		/**
		 * A global version or cache busting string to apply to every url.
		 * @property {String} _globalVersion
		 */
		this._globalVersion = null;

		// Function bindings
		this._applySpecificVersion = this._applySpecificVersion.bind(this);
		this._applyGlobalVersion = this._applyGlobalVersion.bind(this);

		// Initial set
		this.cacheBust = false;
	};

	/* Easy access to the prototype */
	var p = extend(CacheManager);

	/**
	 * If we are suppose to cache bust every file
	 * @property {Boolean} cacheBust
	 * @public
	 * @default false
	 */
	Object.defineProperty(p, "cacheBust",
	{
		get: function()
		{
			return !!(this._globalVersion && this._globalVersion.indexOf("cb=") === 0);
		},
		set: function(value)
		{
			if (value)
			{
				this._globalVersion = "cb=" + Date.now();
				this.unregisterURLFilter(this._applySpecificVersion);
				this.registerURLFilter(this._applyGlobalVersion);
			}
			else
			{
				var version = this._app.options.version;
				this._globalVersion = version ? "v=" + version : null;
				if (this._globalVersion)
				{
					this.unregisterURLFilter(this._applySpecificVersion);
					this.registerURLFilter(this._applyGlobalVersion);
				}
				else
				{
					this.unregisterURLFilter(this._applyGlobalVersion);
					this.registerURLFilter(this._applySpecificVersion);
				}
			}
		}
	});

	/**
	 * Destroy the cache manager, don't use after this.
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._app = null;
		this._versions = null;
		this._filters = null;
		this._applySpecificVersion = null;
		this._applyGlobalVersion = null;
	};

	/**
	 * Adds a versions text file containing versions for different assets.
	 * @public
	 * @method addVersionsFile
	 * @param {String} url The url of the versions file.
	 * @param {Function} callback Callback when the versions file has been loaded.
	 * @param {String} baseUrl A base url to prepend all lines of the file.
	 */
	p.addVersionsFile = function(url, callback, baseUrl)
	{
		if (true && Debug) Debug.assert(/^.*\.txt$/.test(url), "The versions file must be a *.txt file");

		// If we already cache busting, we can ignore this
		if (this.cacheBust)
		{
			if (callback) callback();
			return;
		}

		// Add a random version number to never cache the text file
		this.addVersion(url, Date.now().toString());

		//ensure that that cache busting version is applied
		url = this._applySpecificVersion(url);

		var cm = this;

		// Load the version
		this._app.load(url, function(versions)
		{
			// check for a valid result content
			if (versions)
			{
				// Remove carrage returns and split on newlines
				var lines = versions.replace(/\r/g, '').split("\n");
				var i, parts;

				// Go line by line
				for (i = 0, len = lines.length; i < len; i++)
				{
					// Check for a valid line
					if (!lines[i]) continue;

					// Split lines
					parts = lines[i].split(' ');

					// Add the parts
					if (parts.length != 2) continue;

					// Add the versioning
					cm.addVersion((baseUrl || "") + parts[0], parts[1]);
				}
			}
			if (callback) callback();
		});
	};

	/**
	 * Add a version number for a file
	 * @method addVersion
	 * @public
	 * @param {String} url The url of the object
	 * @param {String} version Version number or has of file
	 */
	p.addVersion = function(url, version)
	{
		if (!this._versions[url])
			this._versions[url] = version;
	};

	/**
	 * Adds a function for running all urls through, to modify them if needed.
	 * Functions used should accept one string parameter (the url), and return the
	 * modified url.
	 * @method registerURLFilter
	 * @public
	 * @param {Function} filter The function that will handle urls.
	 */
	p.registerURLFilter = function(filter)
	{
		if (this._filters.indexOf(filter) == -1)
			this._filters.push(filter);
	};

	/**
	 * Removes a function from the list of filtering functions.
	 * @method unregisterURLFilter
	 * @public
	 * @param {Function} filter The function to remove.
	 */
	p.unregisterURLFilter = function(filter)
	{
		var index = this._filters.indexOf(filter);
		if (index > -1)
			this._filters.splice(index, 1);
	};

	/**
	 * Applies a url specific version to a url from the versions file.
	 * @method _applySpecificVersion
	 * @private
	 * @param {String} url The url to apply versioning to.
	 * @return {String} The modified url.
	 */
	p._applySpecificVersion = function(url)
	{
		//don't apply versioning if the asset is retrieved from a php service
		var basePath = this._app.options.basePath;
		if (basePath && basePath.indexOf("?") > 0) return url;

		var ver = this._versions[url];
		//if a version exists for this url, and the url doesn't already have 'v=' in it
		//then apply the url specific version.
		if (ver && /(\?|\&)v\=[0-9]*/.test(url) === false)
		{
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + "v=" + ver.version;
		}
		return url;
	};

	/**
	 * Applies cache busting or a global version to a url.
	 * @method _applyGlobalVersion
	 * @private
	 * @param {String} url The url to apply versioning to.
	 * @return {String} The modified url.
	 */
	p._applyGlobalVersion = function(url)
	{
		if (!this._globalVersion) return url;
		//don't apply versioning if the asset is retrieved from a php service
		var basePath = this._app.options.basePath;
		if (basePath && basePath.indexOf("?") > 0) return url;

		//apply the versioning if it isn't already on the url
		var test = this._globalVersion.indexOf("cb=") === 0 ?
			(/(\?|\&)cb\=[0-9]*/) : (/(\?|\&)v\=/);
		if (test.test(url) === false)
		{
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + this._globalVersion;
		}
		return url;
	};

	/**
	 * Applies a base path to a relative url. This is not used in the filtering
	 * system because PreloadJS has its own method of prepending the base path
	 * that we use. Instead, it is used with an extra parameter to prepare().
	 * @method _applyBasePath
	 * @private
	 * @param {String} url The url to prepend the base path to.
	 * @return {String} The modified url.
	 */
	p._applyBasePath = function(url)
	{
		var basePath = this._app.options.basePath;
		if (basePath && /^http(s)?\:/.test(url) === false && url.search(basePath) == -1)
		{
			url = basePath + url;
		}
		return url;
	};

	/**
	 * Prepare a URL with the necessary cache busting and/or versioning
	 * as well as the base directory.
	 * @public
	 * @method prepare
	 * @param {String} url The url to prepare
	 * @param {Boolean} [applyBasePath=false] If the global base path should be applied to the url.
	 *		This defaults to false because it can potentially interfere with later regular
	 *		expression checks, particularly with PreloadJS
	 * @return {String} The final url with version/cache and basePath added
	 */
	p.prepare = function(url, applyBasePath)
	{
		//apply first in case the base path is strange and makes the rest of the path a query string
		if (applyBasePath)
		{
			url = this._applyBasePath(url);
		}

		for (var i = 0, len = this._filters.length; i < len; ++i)
		{
			url = this._filters[i](url);
		}
		return url;
	};

	// Assign to namespace
	namespace('springroll').CacheManager = CacheManager;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Debug,
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets
	 * @class Task
	 * @constructor
	 * @private
	 * @param {Object} asset The asset data
	 * @param {String} [asset.id=null] The task ID
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} [asset.complete=null] Call when complete
	 * @param {String} fallbackId The ID to set if no ID is explicitly set
	 *      this can be used for caching something that has no id
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported.
	 */
	var Task = function(asset, fallbackId)
	{
		if (Debug === undefined)
		{
			Debug = include("springroll.Debug", false);
		}

		/**
		 * The current status of the task (waiting, running, etc)
		 * @property {int} status
		 * @default 0
		 */
		this.status = Task.WAITING;

		/**
		 * The user call to fire when completed, returns the arguments
		 * result, original, and additionalAssets
		 * @property {Function} complete
		 * @default null
		 * @readOnly
		 */
		this.complete = asset.complete || null;

		/**
		 * If we should cache the load and use later
		 * @property {Boolean} cache
		 * @default false
		 * @readOnly
		 */
		this.cache = !!asset.cache;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = asset.id || null;

		/**
		 * The task type for display filter
		 * @property {String} type
		 */
		this.type = asset.type || null;

		/**
		 * Reference to the original asset data
		 * @property {Object} original
		 * @readOnly
		 */
		this.original = asset;

		// We're trying to cache but we don't have an ID
		if (this.cache && !this.id)
		{
			if (fallbackId && typeof fallbackId == "string")
			{
				// Remove the file extension
				var extIndex = fallbackId.lastIndexOf('.');
				if (extIndex > -1)
				{
					fallbackId = fallbackId.substr(0, extIndex);
				}

				// Check for the last folder slash then remove it
				var slashIndex = fallbackId.lastIndexOf('/');
				if (slashIndex > -1)
				{
					fallbackId = fallbackId.substr(slashIndex + 1);
				}

				// Update the id
				asset.id = this.id = fallbackId;
			}

			// Check for ID if we're caching
			if (!this.id)
			{
				if (true && Debug)
				{
					Debug.error("Caching an asset requires an id, none set", asset);
				}
				this.cache = false;
			}
		}
	};

	// Reference to prototype
	var p = extend(Task);

	/**
	 * Status for waiting to be run
	 * @property {int} WAITING
	 * @static
	 * @readOnly
	 * @final
	 * @default 0
	 */
	Task.WAITING = 0;

	/**
	 * Task is currently being run
	 * @property {int} RUNNING
	 * @static
	 * @readOnly
	 * @final
	 * @default 1
	 */
	Task.RUNNING = 1;

	/**
	 * Status for task is finished
	 * @property {int} FINISHED
	 * @static
	 * @readOnly
	 * @final
	 * @default 2
	 */
	Task.FINISHED = 2;

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		callback();
	};

	/**
	 * Add the sizing to each filter
	 * @method filter
	 * @protected
	 * @param {String} url The url to filter
	 */
	p.filter = function(url)
	{
		var sizes = Application.instance.assetManager.sizes;

		// See if we should add sizing
		if (url && sizes.test(url))
		{
			// Get the current size supported by this asset
			var size = sizes.size(this.original.sizes);

			// Update the URL size token
			url = sizes.filter(url, size);

			// Pass along the scale to the original asset data
			this.original.scale = size.scale;
		}
		return url;
	};

	/**
	 * Pass-through to the Application load method
	 * @method load
	 * @protected
	 * @param {String|Array|Object} source The source to load
	 * @param {Object|Function} [options] The load options or callback function
	 */
	p.load = function(source, options)
	{
		return Application.instance.load(source, options);
	};

	/**
	 * Pass-through to the Application Loader.load
	 * @method simpleLoad
	 * @protected
	 * @param {String} url Path to file to load
	 * @param {Function} complete The callback
	 * @param {Function} [progress] The load progress
	 * @param {Object} [data] Additiona data
	 */
	p.simpleLoad = function(url, complete, progress, data)
	{
		return Application.instance.loader.load(url, complete, progress, data);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.status = Task.FINISHED;
		this.id = null;
		this.type = null;
		this.complete = null;
		this.original = null;
	};

	// Assign to namespace
	namespace('springroll').Task = Task;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for dealing with async function calls with AssetManager.
	 * @class FunctionTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} asset.async The required function to call
	 * @param {Function} [asset.complete] The function to call when we're done
	 * @param {String} [asset.id] The task id for mapping the result, if any
	 */
	var FunctionTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The asynchronous call
		 * @property {Function} async
		 */
		this.async = asset.async;
	};

	// Reference to prototype
	var p = Task.extend(FunctionTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FunctionTask.test = function(asset)
	{
		return !!asset.async;
	};

	/**
	 * Start the task
	 * @method start
	 * @param {Function} callback Callback when done
	 */
	p.start = function(callback)
	{
		this.async(callback);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
		this.async = null;
	};

	// Assign to namespace
	namespace('springroll').FunctionTask = FunctionTask;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for loading an image that has been split into an alpha channel image and a
	 * RGB only color image.
	 * @class ColorAlphaTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.color The source path to the color image
	 * @param {String} asset.alpha The source path to the alpha image
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var ColorAlphaTask = function(asset)
	{
		Task.call(this, asset, asset.color);

		/**
		 * The atlas color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The atlas alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);
	};

	// Reference to prototype
	var p = Task.extend(ColorAlphaTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	ColorAlphaTask.test = function(asset)
	{
		return !!asset.color && !!asset.alpha;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.load(
			{
				_alpha: this.alpha,
				_color: this.color
			},
			function(results)
			{
				callback(ColorAlphaTask.mergeAlpha(
					results._color,
					results._alpha
				));
				results._color.src = results._alpha.src = "";
			}
		);
	};

	/**
	 * Pulled from EaselJS's SpriteSheetUtils.
	 * Merges the rgb channels of one image with the alpha channel of another. This can be used to
	 * combine a compressed JPEG image containing color data with a PNG32 monochromatic image
	 * containing alpha data. With certain types of images (those with detail that lend itself to
	 * JPEG compression) this can provide significant file size savings versus a single RGBA PNG32.
	 * This method is very fast (generally on the order of 1-2 ms to run).
	 * @method mergeAlpha
	 * @static
	 * @param {Image} rbgImage The image (or canvas) containing the RGB channels to use.
	 * @param {Image} alphaImage The image (or canvas) containing the alpha channel to use.
	 * @param {Canvas} [canvas] If specified, this canvas will be used and returned. If not, a new
	 *                      canvas will be created.
	 * @return {Canvas} A canvas with the combined image data. This can be used as a source for a
	 *              Texture.
	 */
	ColorAlphaTask.mergeAlpha = function(rgbImage, alphaImage, canvas)
	{
		if (!canvas)
		{
			canvas = document.createElement("canvas");
		}
		canvas.width = Math.max(alphaImage.width, rgbImage.width);
		canvas.height = Math.max(alphaImage.height, rgbImage.height);
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.drawImage(rgbImage, 0, 0);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(alphaImage, 0, 0);
		ctx.restore();
		return canvas;
	};

	// Assign to namespace
	namespace('springroll').ColorAlphaTask = ColorAlphaTask;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for grouping a list of tasks into one task.
	 * @class ListTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {Array|Object} asset.assets The collection of assets to load
	 * @param {Boolean} [asset.cacheAll=false] If we should cache each item in assets.
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete=null] The event to call when done
	 * @param {Function} [asset.progress=null] The event to call when progress is updated
	 */
	var ListTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The collection of assets to load
		 * @property {Array|Object} assets
		 */
		this.assets = asset.assets;

		/**
		 * If each asset in the collection should be cached.
		 * @property {Boolean} cacheAll
		 */
		this.cacheAll = asset.cacheAll;

		/**
		 * Callback when progress is updated
		 * @property {Function} progress
		 */
		this.progress = asset.progress;
	};

	// Reference to prototype
	var p = Task.extend(ListTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	ListTask.test = function(asset)
	{
		return !!asset.assets && (Array.isArray(asset.assets) || Object.isPlain(asset.assets));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.load(this.assets,
		{
			complete: callback,
			progress: this.progress,
			cacheAll: this.cacheAll
		});
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
		this.assets = null;
	};

	// Assign to namespace
	namespace('springroll').ListTask = ListTask;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for dealing with async load assets through Loader.
	 * @class LoadTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The source
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Boolean} [asset.advanced=false] If we should return the LoaderResult
	 * @param {*} [asset.data=null] Optional data
	 * @param {Function} [asset.complete=null] The event to call when done
	 * @param {Function} [asset.progress=null] The event to call on load progress
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var LoadTask = function(asset)
	{
		Task.call(this, asset, asset.src);

		/**
		 * The source URL to load
		 * @property {String} src
		 */
		this.src = this.filter(asset.src);

		/**
		 * Call on load progress
		 * @property {Function} progress
		 */
		this.progress = asset.progress || null;

		/**
		 * Optional data to attach to load
		 * @property {*} data
		 */
		this.data = asset.data || null;

		/**
		 * If turned on return a springroll.LoaderResult object
		 * instead of the content
		 * @property {Boolean} advanced
		 * @default false
		 */
		this.advanced = !!asset.advanced;
	};

	// Reference to prototype
	var p = Task.extend(LoadTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	LoadTask.test = function(asset)
	{
		return !!asset.src;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var advanced = this.advanced;
		this.simpleLoad(
			this.src,
			function(result)
			{
				var content = result;
				if (content && !advanced)
				{
					content = result.content;
					result.destroy();
				}
				callback(content);
			},
			this.progress,
			this.data
		);
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
		this.data = null;
		this.progress = null;
	};

	// Assign to namespace
	namespace('springroll').LoadTask = LoadTask;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var LoadQueue = include('createjs.LoadQueue'),
		Debug,
		Sound = include('createjs.Sound', false);

	/**
	 * Represents a single item in the loader queue 
	 * @class LoaderItem
	 * @extends createjs.LoadQueue
	 */
	var LoaderItem = function()
	{
		LoadQueue.call(this, true); // preferXHR is always true!

		if (Debug === undefined)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The number of times this load has been retried
		 * @property {int} retries
		 * @default
		 */
		this.retries = 0;

		/**
		 * The original input url of the load
		 * @public
		 * @property {string} url
		 */
		this.url = null;

		/**
		 * The actual url of the load
		 * @public
		 * @property {string} preparedUrl
		 */
		this.preparedUrl = null;

		/**
		 * Data associate with the load
		 * @public
		 * @property {*} data
		 */
		this.data = null;

		/**
		 * The callback function of the load, to call when 
		 * the load as finished, takes one argument as result
		 * @public
		 * @property {function} onComplete
		 */
		this.onComplete = null;

		/**
		 * The progress callback
		 * @public
		 * @property {function} onProgress
		 */
		this.onProgress = null;

		/**
		 * The callback when a load queue item fails
		 * @private
		 * @property {function} _onFailed
		 */
		this._onFailed = this._onFailed.bind(this);

		/**
		 * The callback when a load queue item progresses
		 * @private
		 * @property {function} _onProgress
		 */
		this._onProgress = this._onProgress.bind(this);

		/**
		 * The callback when a load queue item completes
		 * @private
		 * @property {function} _onCompleted
		 */
		this._onCompleted = this._onCompleted.bind(this);

		// Install the sound plugin if we have sound module
		if (Sound)
		{
			this.installPlugin(Sound);
		}
	};

	// Reference to the prototype
	var p = extend(LoaderItem, LoadQueue);

	/**
	 * Represent this object as a string
	 * @property {int} MAX_RETRIES
	 * @static
	 * @default 3
	 */
	LoaderItem.MAX_RETRIES = 3;

	if (true)
	{
		/**
		 * If the loads should be verbose
		 * @property {Boolean} verbose
		 * @static
		 * @default false
		 */
		LoaderItem.verbose = false;
	}

	/**
	 * Represent this object as a string
	 * @public
	 * @method toString
	 * @return {string} The string representation of this object
	 */
	p.toString = function()
	{
		return "[LoaderItem(url:'" + this.url + "')]";
	};

	/**
	 * The base path of the load
	 * @property {String} basePath
	 * @default null
	 */
	Object.defineProperty(p, 'basePath',
	{
		set: function(basePath)
		{
			this._basePath = basePath;
		}
	});

	/**
	 * If this load should be cross origin
	 * @property {Boolean} crossOrigin
	 * @default false
	 */
	Object.defineProperty(p, 'crossOrigin',
	{
		set: function(crossOrigin)
		{
			this._crossOrigin = crossOrigin;
		}
	});

	/**
	 * Clear all the data
	 * @method clear
	 */
	p.clear = function()
	{
		this.basePath = "";
		this.crossOrigin = false;
		this.retries = 0;
		this.onComplete = null;
		this.onProgress = null;
		this.data = null;
		this.preparedUrl = null;
		this.url = null;

		this.removeAllEventListeners();
		this.removeAll();
		this.close();
	};

	/**
	 * Start the loading
	 * @method  start
	 * @param {int} maxCurrentLoads The max number of simultaneous load
	 */
	p.start = function(maxCurrentLoads)
	{
		if (true && Debug && LoaderItem.verbose)
		{
			Debug.log("Attempting to load file '" + this.url + "'");
		}
		this.addEventListener('fileload', this._onCompleted);
		this.addEventListener('error', this._onFailed);
		this.addEventListener('fileprogress', this._onProgress);
		this._internalStart();
	};

	/**
	 * Start the loading internally
	 * @method  _internalStart
	 * @private
	 */
	p._internalStart = function()
	{
		var url = this.preparedUrl;

		// Special loading for the Sound, requires the ID
		if (this.data && this.data.id)
		{
			url = {
				id: this.data.id,
				src: url,
				data: this.data
			};
		}

		// Load the file
		this.loadFile(url);
	};

	/**
	 * The file load progress event
	 * @method _onProgress
	 * @private
	 * @param {object} event The progress event
	 */
	p._onProgress = function(event)
	{
		if (this.onProgress)
		{
			this.onProgress(this.progress);
		}
	};

	/**
	 * There was an error loading the file
	 * @private
	 * @method _onFailed
	 */
	p._onFailed = function(event)
	{
		if (true && Debug)
		{
			Debug.error("Unable to load file: " + this.url + " - reason: " + event.error);
		}
		// TODO: This requires a bit more looking into, this solves a memory leak with event listeners piling up.
		this.removeAll();
		this.retry();
	};

	/**
	 * Retry the current load
	 * @method  retry
	 */
	p.retry = function()
	{
		this.retries++;
		if (this.retries > LoaderItem.MAX_RETRIES)
		{
			this.onComplete(this, null);
		}
		else
		{
			this._internalStart();
		}
	};

	/**
	 * The file was loaded successfully
	 * @private
	 * @method _onCompleted
	 * @param {object} ev The load event
	 */
	p._onCompleted = function(ev)
	{
		if (true && Debug && LoaderItem.verbose)
		{
			Debug.log("File loaded successfully from " + this.url);
		}
		this.onComplete(this, ev.result);
	};

	// Assign to the name space
	namespace('springroll').LoaderItem = LoaderItem;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	/**
	 * The return result of the Loader load
	 * @class LoaderResult
	 * @constructor
	 * @param {*} content The dynamic content loaded
	 * @param {String} url The url that was loaded
	 * @param {*} [data] Optional data associated with object
	 */
	var LoaderResult = function(content, url, data)
	{
		/**
		 * The contents of the load
		 * @property {*} content
		 */
		this.content = content;

		/**
		 * The url of the load
		 * @property {String} url
		 */
		this.url = url;

		/**
		 * The data for the load item.
		 * @property {*} data
		 */
		this.data = data;

		/**
		 * The original asset id, if any
		 * @property {String} id
		 */
		this.id = null;
	};

	// Reference to the prototype
	var p = extend(LoaderResult);

	/**
	 * A to string method
	 * @public
	 * @method toString
	 * @return {String} A string rep of the object
	 */
	p.toString = function()
	{
		return "[LoaderResult(url: '" + this.url + "')]";
	};

	/**
	 * Reset to the original state
	 * @method reset
	 */
	p.reset = function()
	{
		this.content =
			this.url =
			this.data =
			this.id = null;
	};

	/**
	 * Destroy this result
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.reset();
	};

	// Assign to the name space
	namespace('springroll').LoaderResult = LoaderResult;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	// Classes to import
	var LoaderItem = include('springroll.LoaderItem'),
		CacheManager = include('springroll.CacheManager'),
		LoaderResult = include('springroll.LoaderResult');

	/**
	 * The Loader is the singular loader for loading all assets
	 * including images, data, code and sounds. Loader supports cache-busting
	 * in the browser using dynamic query string parameters.
	 * @class Loader
	 */
	var Loader = function(app)
	{
		/**
		 * The current application
		 * @property {springroll.Application} app
		 * @private
		 */
		this.app = app;

		/**
		 * The maximum number of simulaneous loads
		 * @public
		 * @property {int} maxCurrentLoads
		 * @default 2
		 */
		this.maxCurrentLoads = 2;

		/**
		 * The reference to the cache manager
		 * @public
		 * @property {CacheManager} cacheManager
		 */
		this.cacheManager = new CacheManager(app);

		/**
		 * The collection of LoaderItems by url
		 * @private
		 * @property {Object} items
		 */
		this.items = {};

		/**
		 * The pool of LoaderItems
		 * @private
		 * @property {array} itemPool
		 */
		this.itemPool = [];
	};

	// The prototype
	var p = extend(Loader);

	if (true)
	{
		/**
		 * If the logging should be verbose (unminified library only)
		 * @property {Boolean} verbose
		 * @default  false
		 */
		Object.defineProperty(p, 'verbose',
		{
			set: function(verbose)
			{
				LoaderItem.verbose = verbose;
			}
		});
	}

	/**
	 * Destroy the Loader singleton, don't use after this
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		if (this.itemPool)
		{
			this.itemPool.forEach(function(item)
			{
				item.clear();
			});
		}
		this.itemPool = null;

		if (this.cacheManager)
		{
			this.cacheManager.destroy();
		}
		this.cacheManager = null;
		this.items = null;
	};

	/**
	 * Load a file
	 * @method load
	 * @public
	 * @param {string} url The file path to load
	 * @param {function} complete The callback function when completed
	 * @param {function} [progress] The callback for load progress update, passes 0-1 as param
	 * @param {*} [data] optional data
	 * @return {createjs.LoadQueue} The load queue item
	 */
	p.load = function(url, complete, progress, data)
	{
		var options = this.app.options;

		// Get a new loader object
		var item = this._getItem();

		var basePath = options.basePath;
		if (basePath !== undefined &&
			/^http(s)?\:/.test(url) === false &&
			url.search(basePath) == -1)
		{
			item.basePath = basePath;
		}
		item.crossOrigin = options.crossOrigin;
		item.url = url;
		item.preparedUrl = this.cacheManager.prepare(url);
		item.onComplete = this._onComplete.bind(this, complete);
		item.onProgress = progress || null;
		item.data = data || null;
		item.setMaxConnections(this.maxCurrentLoads);

		this.items[url] = item;

		item.start();

		return item;
	};

	/**
	 * Handler for the file complete
	 * @method _onComplete
	 * @private
	 * @param  {function} complete Callback function when done
	 * @param  {springroll.LoaderItem} item The LoadQueue
	 * @param  {null|*} result   [description]
	 */
	p._onComplete = function(complete, item, result)
	{
		if (result)
		{
			result = new LoaderResult(
				result,
				item.url,
				item.data
			);
		}
		complete(result);
		this._putItem(item);
	};

	/**
	 * Cancel a load that's currently in progress
	 * @public
	 * @method cancel
	 * @param {string} url The url
	 * @return {bool} If canceled returns true, false if not canceled
	 */
	p.cancel = function(url)
	{
		var item = this.items[url];

		if (item)
		{
			item.clear();
			this._putItem(item);
			return true;
		}
		return false;
	};

	/**
	 * Get a Queue item from the pool or new
	 * @method  _getItem
	 * @private
	 * @return  {springroll.LoaderItem} The Queue item to use
	 */
	p._getItem = function()
	{
		var itemPool = this.itemPool;
		return itemPool.length ? itemPool.pop() : new LoaderItem();
	};

	/**
	 * Pool the loader queue item
	 * @method  _putItem
	 * @private
	 * @param  {springroll.LoaderItem} item Loader item that's done
	 */
	p._putItem = function(item)
	{
		delete this.items[item.url];
		item.clear();
		this.itemPool.push(item);
	};

	namespace('springroll').Loader = Loader;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var Debug;

	/**
	 * A class that remembers the assets loaded by the AssetManager
	 * @class AssetCache
	 * @private
	 */
	var AssetCache = function()
	{
		if (Debug === undefined)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The cache containing assets
		 * @property {Object} _cache
		 * @private
		 */
		this._cache = {};
	};

	// Reference to the prototype
	var p = extend(AssetCache);

	/**
	 * Retrieves a single asset from the cache.
	 * @method read
	 * @param {String} id The asset to get.
	 */
	p.read = function(id)
	{
		if (true && Debug && !this._cache[id])
		{
			Debug.warn("AssetCache: no asset matching id: '" + id + "'");
		}
		return this._cache[id] || null;
	};

	/**
	 * Adds a single asset to the cache.
	 * @method write
	 * @param {String} id The id to save the asset as.
	 * @param {*} content The asset content to save.
	 */
	p.write = function(id, content)
	{
		if (this._cache[id])
		{
			if (true && Debug)
			{
				Debug.warn("AssetCache: overwriting existing asset: '" + id + "'");
			}
			// Remove it first
			this.delete(id);
		}
		this._cache[id] = content;
	};

	/**
	 * Removes a single asset from the cache.
	 * @method delete
	 * @param {Object|String} asset The asset to remove.
	 */
	p.delete = function(asset)
	{
		var id = typeof asset == "string" ? asset : asset.id;

		// If we don't have an ID, stop
		if (!id) return;

		var result = this._cache[id];
		if (result)
		{
			// Destroy mapped result
			if (Object.isPlain(result))
			{
				for (var key in result)
				{
					destroyResult(result[key]);
				}
			}
			// Destroy list of results
			else if (Array.isArray(result))
			{
				result.forEach(destroyResult);
			}
			// Destory single
			else
			{
				destroyResult(result);
			}
			delete this._cache[id];
		}
	};

	/**
	 * Destroy a result object.
	 * @method destroyResult
	 * @private
	 * @param  {*} result The object to destroy.
	 */
	function destroyResult(result)
	{
		// Ignore null results or empty objects
		if (!result) return;

		// Destroy any objects with a destroy function
		if (result.destroy)
		{
			result.destroy();
		}

		// Clear images if we have an HTML node
		if (result.tagName == "IMG")
		{
			result.src = "";
		}
	}

	/**
	 * Removes all assets from the cache.
	 * @method empty
	 */
	p.empty = function()
	{
		for (var id in this._cache)
		{
			this.delete(id);
		}
	};

	/**
	 * Destroy the cache. Don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.empty();
		this._cache = null;
	};

	// Assign to namespace
	namespace('springroll').AssetCache = AssetCache;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Debug;
	var devicePixelRatio = include('devicePixelRatio', false) || 1;

	/**
	 * Manages filtering of loads to load assets sized for the current device.
	 * @class AssetSizes
	 * @private
	 */
	var AssetSizes = function()
	{
		if (Debug === undefined)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The collection of size objects
		 * @property {Array} _sizes
		 * @private
		 */
		this._sizes = [];

		/**
		 * The map of size objects
		 * @property {_sizesMap} _sizesMap
		 * @private
		 */
		this._sizesMap = {};

		/**
		 * The preferred size
		 * @property {Object} _preferredSize
		 * @readOnly
		 */
		this._preferredSize = null;
	};

	// Reference to the prototype
	var p = extend(AssetSizes);

	/**
	 * The URL substitution string.
	 * @property {String} SIZE_TOKEN
	 * @static
	 * @default  "%SIZE%"
	 */
	AssetSizes.SIZE_TOKEN = "%SIZE%";

	/**
	 * Removes all currently defined sizes.
	 * @method  reset
	 */
	p.reset = function()
	{
		this._sizes.length = 0;
		this._sizesMap = {};
	};

	/**
	 * Adds a new size definition.
	 * @method define
	 * @param {String} id The name of the folder which contains assets of this size.
	 * @param {int} maxSize The maximum size in points capable of using this size.
	 * @param {Number} scale The scale of assets
	 * @param {Array} fallback The size fallbacks if this size isn't available
	 *      for the current asset request.
	 */
	p.define = function(id, maxSize, scale, fallback)
	{
		var size = {
			id: id,
			maxSize: maxSize,
			scale: scale,
			fallback: fallback
		};

		this._sizesMap[id] = size;
		this._sizes.push(size);

		// Sor from smallest to largest maxSize
		this._sizes.sort(function(a, b)
		{
			return a.maxSize - b.maxSize;
		});
	};

	/**
	 * Update a URL by size
	 * @method  filter
	 * @param  {String} url The asset to load
	 * @param {Object} [size] The currrent size object
	 * @param {Object} [size.id] The name of the current size
	 * @return {String} The formatted url
	 */
	p.filter = function(url, size)
	{
		size = size || this._preferredSize;
		return url.replace(AssetSizes.SIZE_TOKEN, size.id);
	};

	/**
	 * Make sure we have a token
	 * @method  test
	 * @param  {String}  url The URL to test
	 * @return {Boolean} If we have the token
	 */
	p.test = function(url)
	{
		return url.indexOf(AssetSizes.SIZE_TOKEN) > -1;
	};

	/**
	 * Get a size based on the current asset sizes supported
	 * @method size
	 * @param  {Object} [supported] Return the preferred size if nothing is set
	 * @return {Object} Return the size object with id, scale, maxSize and fallback keys
	 */
	p.size = function(supported)
	{
		var size = this._preferredSize;
		var fallback = size.fallback;

		// There's custom support and it says we don't support
		// the default size.
		if (supported && !supported[size.id])
		{
			for (var i = 0, len = fallback.length; i < len; i++)
			{
				var alt = fallback[i];

				// Undefined means we support it, or true
				if (supported[alt] !== false)
				{
					size = this._sizesMap[alt];
					break;
				}
			}
		}
		// Umm something's wrong, the asset doesn't support
		// either the current size or any of the fallbacks
		if (!size)
		{
			throw "Asset does not support any valid size";
		}
		return size;
	};

	/**
	 * Recalculate the current preferred size based on width and height
	 * @method refresh
	 * @param  {Number} width  The width of the stage
	 * @param  {Number} height The height of the stage
	 * @return {Object} The size
	 */
	p.refresh = function(width, height)
	{
		var minSize = Math.min(width, height);
		var size = null;
		var sizes = this._sizes;

		// Check the largest first
		for (var i = sizes.length - 1; i >= 0; --i)
		{
			if (sizes[i].maxSize / devicePixelRatio > minSize)
			{
				size = sizes[i];
			}
			else
			{
				break;
			}
		}
		this._preferredSize = size;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._preferredSize = null;
		this._sizes = null;
		this._sizesMap = null;
	};

	// Assign to namespace
	namespace('springroll').AssetSizes = AssetSizes;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var Debug,
		Task = include('springroll.Task'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * Class that represents a single multi load
	 * @class AssetLoad
	 * @private
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {springroll.AssetManager} manager Reference to the manager
	 */
	var AssetLoad = function(manager)
	{
		EventDispatcher.call(this);

		if (true)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * Reference to the Task Manager
		 * @property {springroll.AssetManager} manager
		 */
		this.manager = manager;

		if (true)
		{
			this.id = AssetLoad.ID++;
		}

		/**
		 * How to display the results, either as single (0), map (1) or list (2)
		 * @property {int} mode
		 * @default 1
		 */
		this.mode = MAP_MODE;

		/**
		 * If we should run the tasks in parallel (true) or serial (false)
		 * @property {Boolean} startAll
		 * @default true
		 */
		this.startAll = true;

		/**
		 * If we should try to cache all items in the load
		 * @property {Boolean} cacheAll
		 * @default false
		 */
		this.cacheAll = false;

		/**
		 * The list of tasks to load
		 * @property {Array} tasks
		 */
		this.tasks = [];

		/**
		 * The results to return when we're done
		 * @property {Array|Object} results
		 */
		this.results = null;

		/**
		 * If the load is currently running
		 * @property {Boolean} running
		 * @default false
		 */
		this.running = false;

		/**
		 * The total number of assets loaded
		 * @property {int} numLoaded
		 * @default 0
		 */
		this.numLoaded = 0;

		/**
		 * The total number of assets
		 * @property {int} total
		 * @default 0
		 */
		this.total = 0;

		/**
		 * The default asset type if not defined
		 * @property {String} type
		 * @default null
		 */
		this.type = null;
	};

	// Reference to prototype
	var p = EventDispatcher.extend(AssetLoad);

	/**
	 * When an asset is finished
	 * @event taskDone
	 * @param {*} result The loader result
	 * @param {Object} originalAsset The original load asset
	 * @param {Array} assets Collection to add additional assets to
	 */

	/**
	 * When all assets have been completed loaded
	 * @event complete
	 * @param {Array|Object} results The results of load
	 */

	/**
	 * Check how many assets have finished loaded
	 * @event progress
	 * @param {Number} percentage The amount loaded from 0 to 1
	 */

	if (true)
	{
		/**
		 * Debugging Keep track of how many we've created
		 * @property {int} ID
		 * @static
		 * @private
		 */
		AssetLoad.ID = 1;

		/**
		 * Debugging purposes
		 * @method toString
		 */
		p.toString = function()
		{
			return "[AssetLoad (index: " + this.id + ")]";
		};
	}

	/**
	 * Initialize the Load
	 * @method setup
	 * @param {Object|Array} assets The collection of assets to load
	 * @param {Object} [options] The loading options
	 * @param {Boolean} [options.startAll=true] If we should run the tasks in order
	 * @param {Boolean} [options.autoStart=true] Automatically start running
	 * @param {Boolean} [options.cacheAll=false] If we should run the tasks in order
	 * @param {String} [options.type] The default asset type of load, gets attached to each asset
	 */
	p.setup = function(assets, options)
	{
		// Save options to load
		this.startAll = options.startAll;
		this.cacheAll = options.cacheAll;
		this.type = options.type;

		// Update the results mode and tasks
		this.mode = this.addTasks(assets);

		// Set the default container for the results
		this.results = getAssetsContainer(this.mode);

		// Start running
		if (options.autoStart)
		{
			this.start();
		}
	};

	/**
	 * Start the load process
	 * @method start
	 */
	p.start = function()
	{
		// Empty load percentage
		this.trigger('progress', 0);

		// Keep track if we're currently running
		this.running = true;
		this.nextTask();
	};

	/**
	 * Set back to the original state
	 * @method reset
	 */
	p.reset = function()
	{
		// Cancel any tasks
		this.tasks.forEach(function(task)
		{
			task.status = Task.FINISHED;
			task.destroy();
		});
		this.total = 0;
		this.numLoaded = 0;
		this.mode = MAP_MODE;
		this.tasks.length = 0;
		this.results = null;
		this.type = null;
		this.startAll = true;
		this.cacheAll = false;
		this.running = false;
	};

	/**
	 * The result is a single result
	 * @property {int} SINGLE_MODE
	 * @private
	 * @final
	 * @static
	 * @default 0
	 */
	var SINGLE_MODE = 0;

	/**
	 * The result is a map of result objects
	 * @property {int} MAP_MODE
	 * @private
	 * @final
	 * @static
	 * @default 1
	 */
	var MAP_MODE = 1;

	/**
	 * The result is an array of result objects
	 * @property {int} LIST_MODE
	 * @private
	 * @final
	 * @static
	 * @default 2
	 */
	var LIST_MODE = 2;

	/**
	 * Create a list of tasks from assets
	 * @method  addTasks
	 * @private
	 * @param  {Object|Array} assets The assets to load
	 */
	p.addTasks = function(assets)
	{
		var asset;
		var mode = MAP_MODE;

		// Apply the defaults incase this is a single
		// thing that we're trying to load
		assets = applyDefaults(assets);

		// Check for a task definition on the asset
		// add default type for proper task recognition
		if (assets.type === undefined && this.type)
		{
			assets.type = this.type;
		}
		var isSingle = this.getTaskByAsset(assets);

		if (isSingle)
		{
			this.addTask(assets);
			return SINGLE_MODE;
		}
		else
		{
			//if we added a default type for task recognition, remove it
			if (assets.type === this.type && this.type)
			{
				delete assets.type;
			}
			var task;
			if (Array.isArray(assets))
			{
				for (var i = 0; i < assets.length; i++)
				{
					asset = applyDefaults(assets[i]);
					task = this.addTask(asset);
					if (!task.id)
					{
						// If we don't have the id to return
						// a mapped result, we'll fallback to array results
						mode = LIST_MODE;
					}
				}
			}
			else if (Object.isPlain(assets))
			{
				for (var id in assets)
				{
					asset = applyDefaults(assets[id]);
					task = this.addTask(asset);
					if (!task.id)
					{
						task.id = id;
					}
				}
			}
			else if (true && Debug)
			{
				Debug.error("Asset type unsupported", asset);
			}
		}
		return mode;
	};

	/**
	 * Convert assets into object defaults
	 * @method applyDefaults
	 * @private
	 * @static
	 * @param  {*} asset The function to convert
	 * @return {Object} The object asset to use
	 */
	function applyDefaults(asset)
	{
		// convert to a LoadTask
		if (isString(asset))
		{
			return {
				src: asset
			};
		}
		// convert to a FunctionTask
		else if (isFunction(asset))
		{
			return {
				async: asset
			};
		}
		return asset;
	}

	/**
	 * Load a single asset
	 * @method addTask
	 * @private
	 * @param {Object} asset The asset to load,
	 *      can either be an object, URL/path, or async function.
	 */
	p.addTask = function(asset)
	{
		if (asset.type === undefined && this.type)
		{
			asset.type = this.type;
		}
		var TaskClass = this.getTaskByAsset(asset);
		var task;
		if (TaskClass)
		{
			if (asset.cache === undefined && this.cacheAll)
			{
				asset.cache = true;
			}
			task = new TaskClass(asset);
			this.tasks.push(task);
			++this.total;
		}
		else if (true && Debug)
		{
			Debug.error("Unable to find a task definition for asset", asset);
		}
		return task;
	};

	/**
	 * Get the Task definition for an asset
	 * @method  getTaskByAsset
	 * @private
	 * @static
	 * @param  {Object} asset The asset to check
	 * @return {Function} The Task class
	 */
	p.getTaskByAsset = function(asset)
	{
		var TaskClass;
		var taskDefs = this.manager.taskDefs;

		// Loop backwards to get the registered tasks first
		// then will default to the basic Loader task
		for (var i = 0, len = taskDefs.length; i < len; i++)
		{
			TaskClass = taskDefs[i];
			if (TaskClass.test(asset))
			{
				return TaskClass;
			}
		}
		return null;
	};

	/**
	 * Run the next task that's waiting
	 * @method  nextTask
	 * @private
	 */
	p.nextTask = function()
	{
		var tasks = this.tasks;
		for (var i = 0; i < tasks.length; i++)
		{
			var task = tasks[i];
			if (task.status === Task.WAITING)
			{
				task.status = Task.RUNNING;
				task.start(this.taskDone.bind(this, task));

				// If we aren't running in parallel, then stop
				if (!this.startAll) return;
			}
		}
	};

	/**
	 * Handler when a task has completed
	 * @method  taskDone
	 * @private
	 * @param  {springroll.Task} task Reference to original task
	 * @param  {*} [result] The result of load
	 */
	p.taskDone = function(task, result)
	{
		// Ignore if we're destroyed
		if (!this.running) return;

		// Default to null
		result = result || null;

		var index = this.tasks.indexOf(task);

		// Task was already removed, because a clear
		if (index === -1)
		{
			return;
		}

		// Remove the completed task
		this.tasks.splice(index, 1);

		// Assets
		var assets = [];

		// Handle the file load tasks
		if (result)
		{
			// Handle the result
			switch (this.mode)
			{
				case SINGLE_MODE:
					this.results = result;
					break;
				case LIST_MODE:
					this.results.push(result);
					break;
				case MAP_MODE:
					this.results[task.id] = result;
					break;
			}

			// Should we cache the task?
			if (task.cache)
			{
				this.manager.cache.write(task.id, result);
			}
		}

		// If the task has a complete method
		// we'll make sure that gets called
		// with a reference to the tasks
		// can potentially add more
		if (task.complete)
		{
			task.complete(result, task.original, assets);
		}

		// Asset is finished
		this.trigger('taskDone', result, task.original, assets);

		task.destroy();

		// Add new assets to the things to load
		var mode = this.addTasks(assets);

		// Update the progress total
		this.trigger('progress', ++this.numLoaded / this.total);

		// Check to make sure if we're in
		// map mode, we keep it that way
		if (this.mode === MAP_MODE && mode !== this.mode)
		{
			if (true && Debug)
			{
				Debug.error("Load assets require IDs to return mapped results", assets);
				return;
			}
			else
			{
				throw "Assets require IDs";
			}
		}

		if (this.tasks.length)
		{
			// Run the next task
			this.nextTask();
		}
		else
		{
			// We're finished!
			this.trigger('complete', this.results);
		}
	};

	/**
	 * Get an empty assets collection
	 * @method getAssetsContainer
	 * @private
	 * @param {int} mode The mode
	 * @return {Array|Object|null} Empty container for assets
	 */
	var getAssetsContainer = function(mode)
	{
		switch (mode)
		{
			case SINGLE_MODE:
				return null;
			case LIST_MODE:
				return [];
			case MAP_MODE:
				return {};
		}
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		EventDispatcher.prototype.destroy.call(this);
		this.reset();
		this.tasks = null;
		this.manager = null;
	};

	/**
	 * Check if an object is an String type
	 * @method isString
	 * @private
	 * @param  {*}  obj The object
	 * @return {Boolean} If it's an String
	 */
	function isString(obj)
	{
		return typeof obj == "string";
	}

	/**
	 * Check if an object is an function type
	 * @method isFunction
	 * @private
	 * @param  {*}  obj The object
	 * @return {Boolean} If it's an function
	 */
	function isFunction(obj)
	{
		return typeof obj == "function";
	}

	// Assign to namespace
	namespace('springroll').AssetLoad = AssetLoad;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var AssetLoad = include('springroll.AssetLoad'),
		AssetCache = include('springroll.AssetCache'),
		AssetSizes = include('springroll.AssetSizes'),
		Task = include('springroll.Task'),
		Debug;

	/**
	 * Handle the asynchronous loading of multiple assets.
	 * @class AssetManager
	 * @constructor
	 */
	var AssetManager = function()
	{
		if (true)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * The collection of current multiloads
		 * @property {Array} loads
		 * @private
		 */
		this.loads = [];

		/**
		 * The expired loads to reuse.
		 * @property {Array} loadPool
		 * @private
		 */
		this.loadPool = [];

		/**
		 * The collection of task definitions
		 * @property {Array} taskDefs
		 * @readOnly
		 */
		this.taskDefs = [];

		/**
		 * The cache of assets
		 * @property {springroll.AssetCache} cache
		 * @readOnly
		 */
		this.cache = new AssetCache();

		/**
		 * Handle multiple asset sizes. Defaults are 'full' at a scale of 1, and
		 * 'half' at a scale of 0.5 (under 400 points).
		 * @property {springroll.AssetSizes} sizes
		 * @readOnly
		 */
		this.sizes = new AssetSizes();

		/**
		 * The default asset type
		 * @property {String} defaultType
		 * @readOnly
		 */
		this.defaultType = null;

		// Add the default built-in sizes for "half" and "full"
		this.sizes.define('half', 400, 0.5, ['full']);
		this.sizes.define('full', 10000, 1, ['half']);
	};

	// reference to prototype
	var p = extend(AssetManager);

	/**
	 * Register new tasks types, these tasks must extend Task
	 * @method register
	 * @private
	 * @param {Function|String} TaskClass The class task reference
	 * @param {int} [priority=0] The priority. Higher priority tasks
	 *      are tested first. More general tasks should be lower
	 *      and more specific tasks should be higher.
	 */
	p.register = function(TaskClass, priority)
	{
		if (typeof TaskClass == "string")
		{
			TaskClass = include(TaskClass, false);
		}

		if (!TaskClass) return;

		TaskClass.priority = priority || 0;

		if (true && Debug)
		{
			if (!(TaskClass.prototype instanceof Task))
			{
				Debug.error("Registering task much extend Task", TaskClass);
			}
			else if (!TaskClass.test)
			{
				Debug.error("Registering task much have test method");
			}
		}
		this.taskDefs.push(TaskClass);

		// Sort definitions by priority
		// where the higher priorities are first
		this.taskDefs.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	/**
	 * Load a bunch of assets, can only call one load at a time
	 * @method load
	 * @param {Object|Array} asset The assets to load
	 * @param {Object} [options] The loading options
	 * @param {function} [options.complete] The callback when finished
	 * @param {function} [options.progress] The callback when loading percentage is updated
	 * @param {function} [options.taskDone] The callback when finished with each individual task
	 * @param {Boolean} [options.autoStart=true] If we should start running right away
	 * @param {Boolean} [options.startAll=true] If we should run all the tasks at once, in parallel
	 * @param {Boolean} [options.cacheAll=false] If we should cache all files
	 * @param {String} [options.type] The type of assets to load, defaults to AssetManager.prototype.defaultType
	 * @return {springroll.AssetLoad} The reference to the current load
	 */
	p.load = function(assets, options)
	{
		// Apply defaults to options
		options = Object.merge(
		{
			complete: null,
			progress: null,
			taskDone: null,
			cacheAll: false,
			startAll: true,
			autoStart: true,
			type: this.defaultType
		}, options);

		var load = this.getLoad();

		// Add to the stack of current loads
		this.loads.push(load);

		// Override the complete callback with a bind of the
		// original callback with the task
		options.complete = this._onLoaded.bind(
			this,
			options.complete,
			load
		);

		// Handle the finish
		load.once('complete', options.complete);

		// Optional loaded amount event
		if (options.progress)
			load.on('progress', options.progress);

		// Called when a task is complete
		if (options.taskDone)
			load.on('taskDone', options.taskDone);

		// Start the load
		load.setup(assets, options);

		return load;
	};

	/**
	 * Stash the load for use later
	 * @method poolLoad
	 * @private
	 * @param {springroll.AssetLoad} load The load to recycle
	 */
	p.poolLoad = function(load)
	{
		load.off('complete progress taskDone');
		load.reset();
		this.loadPool.push(load);
	};

	/**
	 * Get either a new AssetLoad or a recycled one
	 * @method getLoad
	 * @private
	 * @return {springroll.AssetLoad} The load to use
	 */
	p.getLoad = function()
	{
		if (this.loadPool.length > 0)
		{
			return this.loadPool.pop();
		}
		return new AssetLoad(this);
	};

	/**
	 * Handler when a load is finished
	 * @method _onLoaded
	 * @private
	 * @param {function} complete The function to call when done
	 * @param {springroll.AssetLoad} load The current load
	 * @param {*} The returned results
	 */
	p._onLoaded = function(complete, load, results)
	{
		var index = this.loads.indexOf(load);
		if (index > -1)
		{
			this.loads.splice(index, 1);
		}
		if (complete) complete(results);
		this.poolLoad(load);
	};

	/**
	 * Destroy the AssetManager
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.sizes.destroy();
		this.sizes = null;

		this.cache.destroy();
		this.cache = null;

		this.loadPool = null;
		this.loads = null;
		this.taskDefs = null;
	};

	// Assign to namespace
	namespace('springroll').AssetManager = AssetManager;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Loader = include('springroll.Loader'),
		AssetManager = include('springroll.AssetManager');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(100);

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Reference to the loader.
		 * @property {springroll.Loader} loader
		 */
		var loader = this.loader = new Loader(this);

		/**
		 * Reference to the asset manager.
		 * @property {springroll.AssetManager} assetManager
		 * @private
		 */
		var assetManager = this.assetManager = new AssetManager();

		// Register the default tasks
		assetManager.register('springroll.LoadTask');
		assetManager.register('springroll.ListTask');
		assetManager.register('springroll.FunctionTask', 10);
		assetManager.register('springroll.ColorAlphaTask', 20);

		/**
		 * Override the end-user browser cache by adding
		 * "?cb=" to the end of each file path requested. Use
		 * for development, debugging only!
		 * @property {Boolean} options.cacheBust
		 * @default true
		 */
		var options = this.options;
		options.add('cacheBust', true)
			.respond('cacheBust', function()
			{
				return loader.cacheManager.cacheBust;
			})
			.on('cacheBust', function(value)
			{
				loader.cacheManager.cacheBust = (value == "true" || !!value);
			});

		/**
		 * The optional file path to prefix to any relative file
		 * requests. This is a great way to load all load requests
		 * with a CDN path.
		 * @property {String} options.basePath
		 */
		options.add('basePath');

		/**
		 * The current version number for your application. This
		 * number will automatically be appended to all file
		 * requests. For instance, if the version is "0.0.1" all
		 * file requests will be appended with "?v=0.0.1"
		 * @property {String} options.version
		 */
		options.add('version', null, true);

		/**
		 * Path to a text file which contains explicit version
		 * numbers for each asset. This is useful for controlling
		 * the live browser cache. For instance, this text file
		 * would have an asset on each line followed by a number:
		 * `assets/config/config.json 2` would load
		 * `assets/config/config.json?v=2`
		 * @property {String} options.versionsFile
		 */
		options.add('versionsFile', null, true);

		/**
		 * Different displays offer flavors of the same asset definition.
		 * Instead of repeatedly defining the asset type property,
		 * it's possible to define a global default. If PIXI
		 * is your default display "pixi" is recommended as a value.
		 * If EaselJS is your default display "easeljs" is recommended.
		 * @property {String} options.defaultAssetType
		 */
		options.add('defaultAssetType')
			.on('defaultAssetType', function(value)
			{
				assetManager.defaultType = value;
			});

		/**
		 * Simple load of a single file.
		 * @method load
		 * @param {String} source The file to load
		 * @param {Function} complete The completed callback with a single
		 *      parameters result object.
		 * @param {Function} [progress] Update callback, return 0-1
		 * @param {Boolean} [cache=false] Save to the asset cache after load
		 * @param {*} [data] The data to attach to load item
		 */
		/**
		 * Load a single file with options.
		 * @method load
		 * @param {Object} asset The file resource to load
		 * @param {String} asset.src The file to load
		 * @param {Boolean} [asset.cache=false] If the result should be cached for later
		 * @param {Function} [asset.complete=null] Callback when finished
		 * @param {Function} [asset.progress=null] Callback on load progress,
		 *      has a parameter which is the percentage loaded from 0 to 1.
		 * @param {*} [asset.data] Additional data to attach to load is
		 *      accessible in the loader's result.
		 * @param {Function} [complete] The completed callback with a single
		 *      parameter which is a result object. will
		 *      only use if `asset.complete` is undefined.
		 */
		/**
		 * Load a single custom asset with options.
		 * @method load
		 * @param {Object} asset The single asset resource to load, properties
		 *      will depend on the type of asset loading.
		 * @param {Function} [asset.complete=null] Callback when finished
		 * @param {String} [asset.id=null] The ID to attach to this asset
		 * @param {Boolean} [asset.cache=false] If the result should be cached for later
		 * @param {Function} [complete] The completed callback with a single
		 *      parameters which is a result object. will
		 *      only use if `asset.complete` is undefined.
		 */
		/**
		 * Load a map of multiple assets and return mapped result objects.
		 * @method load
		 * @param {Object} assets Load a map of assets.
		 * @param {Function|Object} [options] Callback where the only parameter is the
		 *      map of the results by ID, or the collection of load options.
		 * @param {Function} [options.complete=null] The complete callback if using load options.
		 * @param {Function} [options.taskDone=null] The callback when a single item is finished.
		 * @param {Function} [options.progress=null] Callback percentage updates
		 * @param {Boolean} [options.cacheAll=false] If tasks should be cached
		 * @param {Boolean} [options.startAll=true] If tasks should be run in parallel
		 * @param {String} [options.type] The default asset type of load, gets attached to each asset
		 */
		/**
		 * Load a list of multiple assets and return array of result objects.
		 * @method load
		 * @param {Array} assets The list of assets.
		 *      If each object has a `id` the result will be a mapped object.
		 * @param {Function|Object} [options] Callback where the only parameter is the
		 *      collection or map of the results, or the collection of load options.
		 * @param {Function} [options.complete=null] The complete callback if using load options.
		 * @param {Function} [options.taskDone=null] The callback when a single item is finished.
		 * @param {Function} [options.progress=null] Callback percentage updates
		 * @param {Boolean} [options.cacheAll=false] If tasks should be cached
		 * @param {Boolean} [options.startAll=true] If tasks should be run in parallel
		 * @param {String} [options.type] The default asset type of load, gets attached to each asset
		 */
		this.load = function(source, complete, progress, cache, data)
		{
			var options;

			// If the load arguments are setup like the Loader.load call
			// then we'll convert to an object that we can use
			if (typeof source == "string")
			{
				source = {
					src: source,
					progress: progress || null,
					complete: complete || null,
					cache: !!cache,
					data: data || null
				};
			}
			else
			{
				// Presume complete is an options object
				options = complete;

				// Second argument is callback
				if (typeof complete === "function")
				{
					options = {
						complete: complete
					};
				}
			}
			return assetManager.load(source, options);
		};

		/**
		 * Unload an asset or list of assets.
		 * @method unload
		 * @param {Array|String} assets The collection of asset ids or
		 *      single asset id. As an array, it can be a manifest
		 *      with objects that contain an ID, or an array of multiple strings.
		 */
		this.unload = function(assets)
		{
			if (typeof assets == "string")
			{
				assets = Array.prototype.slice.call(arguments);
			}

			for (var i = 0; i < assets.length; i++)
			{
				assetManager.cache.delete(assets[i]);
			}
		};

		/**
		 * Unload all assets from the assets cache
		 * @method unloadAll
		 */
		this.unloadAll = function()
		{
			assetManager.cache.empty();
		};

		/**
		 * Get an asset from the cache by ID
		 * @method getCache
		 * @param {String} id The asset to fetch
		 * @return {*|null} The cached object or null if empty
		 */
		this.getCache = function(id)
		{
			return assetManager.cache.read(id);
		};

		// Refresh the default size whenever the app resizes
		this.on('resize', function()
		{
			// Use the actual canvas size regard
			assetManager.sizes.refresh(
				this.realWidth,
				this.realHeight
			);
		});

		// Make sure we refresh the sizes for non resizing application
		this.once('beforeInit', function()
		{
			if (this.display)
			{
				assetManager.sizes.refresh(
					this.realWidth,
					this.realHeight
				);
			}
		});
	};

	// Preload task
	plugin.preload = function(done)
	{
		// This is to make sure that sizes are set before anything
		// gets preloaded by the ConfigPlugin
		this.triggerResize();

		var versionsFile = this.options.versionsFile;
		if (versionsFile)
		{
			// Try to load the default versions file
			this.loader.cacheManager.addVersionsFile(versionsFile, done);
		}
		else
		{
			done();
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.loader)
		{
			this.loader.destroy();
			this.loader = null;
		}

		if (this.assetManager)
		{
			this.assetManager.destroy();
			this.assetManager = null;
		}
	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug;

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(80);

	/**
	 * The game has finished loading
	 * @event loaded
	 */

	/**
	 * The amount of progress of the preload from 0 to 1
	 * @event progress
	 * @param {Number} percentage The amount preloaded
	 */

	/**
	 * The config has finished loading, in case you want to
	 * add additional tasks to the manager after this.
	 * @event configLoaded
	 * @param {Object} config The JSON object for config
	 * @param {Array} assets Container to add additional assets to
	 */

	/**
	 * The game has started loading
	 * @event loading
	 * @param {Array} assets The list of tasks to preload
	 */

	// Init the animator
	plugin.setup = function()
	{
		Debug = include('springroll.Debug', false);

		var options = this.options;

		/**
		 * The path to the config file to load
		 * @property {String} options.configPath
		 * @default null
		 */
		options.add('configPath', null, true);

		/**
		 * The collection of assets to preload, can be individual
		 * URLs or objects with keys `src`, `complete`, `progress`, etc. 
		 * @property {String|Array|Object} options.preload
		 * @default []
		 */
		options.add('preload', [], true);

		/**
		 * The game configuration loaded from and external JSON file
		 * @property {Object} config
		 */
		this.config = null;

		/**
		 * The asset load for preloading
		 * @property {springroll.AssetLoad} _assetLoad
		 * @private
		 */
		this._assetLoad = null;

		/**
		 * The total number of assets loaded
		 * @property {int} _numLoaded
		 * @private
		 */
		this._numLoaded = 0;

		/**
		 * The total assets to preload
		 * @property {int} _total
		 * @private
		 */
		this._total = 0;

		/**
		 * The current combined progress with plugin and asset load
		 * @property {Number} _progress
		 * @private
		 * @default -1
		 */
		this._progress = -1;

		// Listen for changes to the plugin progress
		this.on('pluginProgress', onProgress.bind(this));
	};

	// async
	plugin.preload = function(done)
	{
		var assets = [];
		var configPath = this.options.configPath;

		// If there's a config path then add it
		if (configPath)
		{
			assets.push(
			{
				id: 'config',
				src: configPath,
				cache: false,
				complete: onConfigLoaded.bind(this)
			});
		}
		else
		{
			addPreloadAssets(this, assets);
		}

		var callback = onLoadComplete.bind(this, done);

		if (assets.length)
		{
			this._assetLoad = this.load(assets,
			{
				complete: callback,
				progress: onProgress.bind(this),
				cacheAll: true
			});
		}
		else
		{
			callback();
		}
	};

	/**
	 * Callback when progress is finished
	 * @method onProgress
	 * @private
	 * @param {Number} progress The amount loaded from 0 to 1
	 */
	var onProgress = function()
	{
		if (this._assetLoad)
		{
			this._numLoaded = this._assetLoad.numLoaded;
			this._total = this._assetLoad.total;
		}
		var numLoaded = (this._numLoaded + this.pluginLoad.numLoaded);
		var total = (this._total + this.pluginLoad.total);
		var progress = numLoaded / total;
		if (progress > this._progress)
		{
			this._progress = progress;
			this.trigger('progress', progress);
		}
	};

	/**
	 * Add the preload assets to the list of assets to load
	 * @method addPreloadAssets
	 * @private
	 * @param {springroll.Application} app Reference to the application
	 * @param {Array} assets The array to add new load tasks to
	 */
	var addPreloadAssets = function(app, assets)
	{
		assets.append(app.options.preload);

		// Allow extending game to add additional tasks
		app.trigger('loading', assets);
	};

	/**
	 * Callback when the config is loaded
	 * @method onConfigLoaded
	 * @private
	 * @param {Object} config The Loader result from the load
	 * @param {Object} asset Original asset data
	 * @param {Array} assets The array to add new load tasks to
	 */
	var onConfigLoaded = function(config, asset, assets)
	{
		this.config = config;
		this.trigger('configLoaded', config, assets);
		addPreloadAssets(this, assets);
	};

	/**
	 * Callback when tasks are completed
	 * @method onLoadComplete
	 * @private
	 * @param {function} done Call when we're done
	 * @param {Array} results The collection of final LoaderResult objects
	 */
	var onLoadComplete = function(done, results)
	{
		this._assetLoad = null;
		this.trigger('loaded', results);
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		this.config = null;
	};

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * The display provides the base properties for all custom display. A display
	 * is a specialized view for the application. As the name suggests, this class
	 * should not be instanciated directly.
	 *
	 * @class AbstractDisplay
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @private
	 * @param {String} id The id of the canvas element on the page to draw to.
	 * @param {Object} options The setup data for the display.
	 * @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	 */
	var AbstractDisplay = function(id, options)
	{
		EventDispatcher.call(this);

		options = options ||
		{};

		/**
		 * the canvas managed by this display
		 * @property {DOMElement} canvas
		 * @readOnly
		 * @public
		 */
		this.canvas = document.getElementById(id);

		/**
		 * The DOM id for the canvas
		 * @property {String} id
		 * @readOnly
		 * @public
		 */
		this.id = id;

		/**
		 * Convenience method for getting the width of the canvas element
		 * would be the same thing as canvas.width
		 * @property {int} width
		 * @readOnly
		 * @public
		 */
		this.width = this.canvas.width;

		/**
		 * Convenience method for getting the height of the canvas element
		 * would be the same thing as canvas.height
		 * @property {int} height
		 * @readOnly
		 * @public
		 */
		this.height = this.canvas.height;

		/**
		 * The main rendering context or the root display object or stage.
		 * @property {mixed} stage
		 * @readOnly
		 * @public
		 */
		this.stage = null;

		/**
		 * If rendering is paused on this display only. Pausing all displays can be done
		 * using Application.paused setter.
		 * @property {Boolean} paused
		 * @public
		 */
		this.paused = false;

		/**
		 * If input is enabled on the stage.
		 * @property {Boolean} _enabled
		 * @private
		 */
		this._enabled = false;

		/**
		 * If the display is visible.
		 * @property {Boolean} _visible
		 * @private
		 */
		this._visible = this.canvas.style.display != "none";

		/**
		 * Some of the modules require a special display adapter to provide
		 * common methods for managing display objects.
		 * @property {DisplayAdapter} adapter
		 * @readOnly
		 * @public
		 * @default null
		 */
		this.adapter = null;
	};

	var p = EventDispatcher.extend(AbstractDisplay);

	/**
	 * If input is enabled on the stage for this display. The default is true.
	 * Without a rendering library, this does not actually have an effect.
	 * @property {Boolean} enabled
	 * @public
	 */
	Object.defineProperty(p, "enabled",
	{
		// enabled getter
		get: function()
		{
			return this._enabled;
		},
		// enabled setter
		set: function(value)
		{
			var oldEnabled = this._enabled;
			this._enabled = value;

			if (oldEnabled != value)
			{
				/**
				 * If the display becomes enabled
				 * @event enabled
				 */

				/**
				 * If the display becomes disabled
				 * @event disabled
				 */
				this.trigger(value ? 'enabled' : 'disabled');

				/**
				 * Enabled state changed on the display
				 * @event enable
				 * @param {Boolean} enabled Current state of enabled
				 */
				this.trigger('enable', value);
			}
		}
	});

	/**
	 * If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	 * @property {Boolean} visible
	 * @public
	 */
	Object.defineProperty(p, "visible",
	{
		// visible getter
		get: function()
		{
			return this._visible;
		},
		// visible setter
		set: function(value)
		{
			var oldVisible = this._visible;
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";

			if (oldVisible != value)
			{
				/**
				 * If the display becomes visible
				 * @event visible
				 */

				/**
				 * If the display becomes hidden
				 * @event hidden
				 */
				this.trigger(value ? 'visible' : 'hidden');

				/**
				 * Visibility changed on the display
				 * @event visibility
				 * @param {Boolean} visible Current state of the visibility
				 */
				this.trigger('visibility', value);
			}
		}
	});

	/**
	 * Resizes the canvas. This is only called by the Application.
	 * @method resize
	 * @param {int} width The width that the display should be
	 * @param {int} height The height that the display should be
	 */
	p.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	};

	/**
	 * Updates the stage and draws it. This is only called by the Application.
	 * This method does nothing if paused is true or visible is false.
	 * @method render
	 * @param {int} elapsed The time elapsed since the previous frame.
	 * @param {Boolean} [force=false] For the re-render
	 */
	p.render = function(elapsed, force)
	{
		// implement specific
	};

	/**
	 * Destroys the display. This method is called by the Application and should
	 * not be called directly, use Application.removeDisplay(id).
	 * The stage recursively removes all display objects here.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.enabled = false;
		this.adapter = null;
		this.stage = null;
		if (this.canvas.parentNode)
		{
			this.canvas.parentNode.removeChild(this.canvas);
		}
		this.canvas.onmousedown = null;
		this.canvas = null;
	};

	// Assign to the global namespace
	namespace('springroll').AbstractDisplay = AbstractDisplay;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{

	var Application = include('springroll.Application'),
		Loader = include('springroll.Loader'),
		PropertyDispatcher = include('springroll.PropertyDispatcher'),
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * @class Application
	 */
	/**
	 * See {{#crossLink "springroll.Application/displays:property"}}{{/crossLink}}
	 * @method getDisplays
	 * @deprecated since version 0.3.5
	 * @param {function} [each] Iterator function, param is each method
	 * @return {Array} The collection of displays
	 */
	Application.prototype.getDisplays = function(each)
	{
		if (true) console.warn('getDisplays is now deprecated, please use displays property, e.g.: app.displays.forEach(function(display){});');

		if (typeof each == "function")
		{
			_displays.forEach(each);
		}
		return _displays;
	};

	/**
	 * @class EventDispatcher
	 */
	/**
	 * See {{#crossLink "window.mixin"}}{{/crossLink}}
	 * @method
	 * @static
	 * @method mixIn
	 * @deprecated since version 0.4.0
	 */
	EventDispatcher.mixIn = function(object, callConstructor)
	{
		if (true) console.warn('mixIn is now deprecated, please use window.mixin, e.g.: mixin(object, EventDispatcher);');
		return mixin(object, EventDispatcher);
	};

	/**
	 * @class Loader
	 */
	/**
	 * See {{#crossLink "springroll.Application/loader:property"}}{{/crossLink}}
	 * @static
	 * @property {springroll.Loader#instance} instance
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(Loader, "instance",
	{
		get: function()
		{
			if (true) console.warn('Loader.instance is now deprecated, please use Application\'s loader property, e.g.: app.loader.load(url, callback);');
			return Application.instance.loader;
		}
	});

	/**
	 * @class PropertyDispatcher
	 */
	/**
	 * Turn on read-only for properties
	 * @method readOnly
	 * @deprecated since version 0.4.0
	 * @param {String} prop* The property or properties to make readonly
	 * @return {springroll.PropertyDispatcher} The instance for chaining
	 */
	PropertyDispatcher.prototype.readOnly = function(properties)
	{
		if (true) console.warn('readOnly method is now deprecated, please use add(name, prop, readOnly), e.g.: app.options.add("myVar", null, true);');

		var prop, name;
		for (var i = 0; i < arguments.length; i++)
		{
			name = arguments[i];
			prop = this._properties[name];
			if (prop === undefined)
			{
				throw "Property " + name + " does not exist";
			}
			prop.readOnly = true;
		}
		return this;
	};

}());