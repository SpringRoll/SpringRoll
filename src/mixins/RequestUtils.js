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
		if(extension)
		{
			switch(extension.toLowerCase())
			{
				case "fnt": return AbstractLoader.XML;
			}
		}
		return orig_getTypeByExtension(extension);
	};

}());