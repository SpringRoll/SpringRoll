/**
 * @module Core
 * @namespace window
 */
(function() {
	/**
	*  Add methods to String
	*  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	*  @class String
	*/

	/**
	*  Returns a formatted string, similar to the printf() function in many languages.
	*  This simplified version substitutes "%s" with the arguments in order. To escape "%s",
	*  use "%%s".
	*  @method format
	*  @param {Array|*} args An array or list of arguments for formatting.
	*  @return {String} The substituted string.
	*/
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	Object.defineProperty(String.prototype, 'format', {
		enumerable: false,
		writable:false,
		value: function() {
			if (arguments.length < 1) return this;
			var args = Array.isArray(args) ? args : Array.prototype.slice.call(arguments);
			
			return this.replace(
				/([^%]|^)%(?:(\d+)\$)?s/g,
				function(p0, p, position)
				{
					if (position)
					{
						return p + args[parseInt(position)-1];
					}
					return p + args.shift();
				}
			).replace(/%%s/g, '%s');
		}
	});
}());
