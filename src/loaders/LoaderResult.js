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
	
	/** Reference to the prototype */
	var p = LoaderResult.prototype;
	
	/**
	 * A to string method
	 * @public
	 * @method toString
	 * @return {String} A string rep of the object
	 */
	p.toString = function()
	{
		return "[LoaderResult(url: '"+this.url+"')]";
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