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