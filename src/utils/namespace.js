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