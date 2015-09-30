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
				if (DEBUG)
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