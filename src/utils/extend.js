/**
 * @module Core
 * @namespace window
 */
/**
*  Use to do class inheritence
*  @class extend
*  @static
*/
(function(window){
	
	// The extend function already exists
	if ("extend" in window) return;

	/**
	*  Extend prototype
	*
	*  @example
		var p = extend(MyClass, ParentClass);
	*
	*  @constructor
	*  @method extend
	*  @param {function} subClass The reference to the class
	*  @param {function|String} superClass The parent reference or full classname
	*  @return {object} Reference to the subClass's prototype
	*/
	window.extend = function(subClass, superClass)
	{
		if (typeof superClass == "string")
		{
			superClass = window.include(superClass);
		}
		subClass.prototype = Object.create(
			superClass.prototype
		);
		return subClass.prototype;
	};

}(window));