/**
*  @module cloudkid
*/
(function(){
	
	/**
	*  The return result of the Loader load
	*  @class LoaderResult
	*  @constructor
	*  @param {*} content The dynamic content loaded
	*  @param {string} url The url that was loaded
	*  @param {createjs.LoadQueue} loader The LoadQueue that performed the load
	*/
	var LoaderResult = function(content, url, loader)
	{
		this.content = content;
		this.url = url;
		this.loader = loader;
	};
	
	/** Reference to the prototype */
	var p = LoaderResult.prototype;
	
	/**
	*  The contents of the load
	*  @public
	*  @property {*} content 
	*/
	p.content = null;
	
	/**
	*  The url of the load
	*  @public
	*  @property {string} url
	*/
	p.url = null;
	
	/**
	*  Reference to the preloader object
	*  @public
	*  @property {createjs.LoaderQueue} loader
	*/
	p.loader = null;
	
	/**
	* A to string method
	* @public
	* @method toString
	* @return {string} A string rep of the object
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
	};
	
	// Assign to the name space
	// MediaLoadeResult is deprecated
	namespace('cloudkid').MediaLoaderResult = LoaderResult;
	namespace('cloudkid').LoaderResult = LoaderResult;
	
}());