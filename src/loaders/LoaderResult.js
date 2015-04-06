/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	/**
	*  The return result of the Loader load
	*  @class LoaderResult
	*  @constructor
	*  @param {*} content The dynamic content loaded
	*  @param {String} url The url that was loaded
	*  @param {createjs.LoadQueue} loader The LoadQueue that performed the load
	*/
	var LoaderResult = function(content, url, loader, manifestData)
	{
		/**
		*  The contents of the load
		*  @public
		*  @property {*} content
		*/
		this.content = content;

		/**
		*  The url of the load
		*  @public
		*  @property {String} url
		*/
		this.url = url;

		/**
		*  Reference to the preloader object
		*  @public
		*  @property {createjs.LoaderQueue} loader
		*/
		this.loader = loader;
		
		/**
		*  The full manifest data for the load item.
		*  @public
		*  @property {String} manifestData
		*/
		this.manifestData = manifestData;
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
	* Destroy this result
	* @public
	* @method destroy
	*/
	p.destroy = function()
	{
		this.callback = null;
		this.url = null;
		this.content = null;
		this.manifestData = null;
	};
	
	// Assign to the name space
	// MediaLoadeResult is deprecated
	namespace('springroll').MediaLoaderResult = LoaderResult;
	namespace('springroll').LoaderResult = LoaderResult;
	
}());