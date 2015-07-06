/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	/**
	 * The return result of the Loader load
	 * @class LoaderResult
	 * @constructor
	 * @param {*} content The dynamic content loaded
	 * @param {String} url The url that was loaded
	 * @param {createjs.LoadQueue} loader The LoadQueue that performed the load
	 * @param {*} [data] Optional data associated with object
	 * @param {Object} [originalAsset] The original load asset (multi-load)
	 */
	var LoaderResult = function(content, url, loader, data, originalAsset)
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
		 * Reference to the preloader object
		 * @property {createjs.LoaderQueue} loader
		 */
		this.loader = loader;
		
		/**
		 * The data for the load item.
		 * @property {*} data
		 */
		this.data = data;

		/**
		 * The data of the original asset for multi-load
		 * @property {Object} originalAsset
		 */
		this.originalAsset = originalAsset;

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
		return "[LoaderResult('"+this.url+"')]";
	};

	/**
	 * Reset to the original state
	 * @method reset
	 */
	p.reset = function()
	{
		this.content = 
		this.url = 
		this.loader = 
		this.data =
		this.originalAsset =
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