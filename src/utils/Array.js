/**
*  @module global
*/
(function() {
	/**
	*  Add methods to Array
	*  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	*  @class Array.prototype
	*/

	/**
	*  Shuffles the array
	*  @method shuffle
	*/
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	Object.defineProperty(Array.prototype, 'shuffle', {
		enumerable: false,
		writable:false, 
		value: function() {
			for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
			return this;
		}
	});

	/**
	*  Get a random item from an array
	*  @method random
	*  @static
	*  @param {Array} array The array
	*  @return {*} The random item
	*/
	Object.defineProperty(Array.prototype, 'random', {
		enumerable: false,
		writable: false,
		value: function() {
			return this[Math.floor(Math.random() * this.length)];
		}
	});
}());
