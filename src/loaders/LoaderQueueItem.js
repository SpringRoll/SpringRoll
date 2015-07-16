/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	/**
	 * Represents a single item in the loader queue 
	 * @class LoaderQueueItem
	 * @private
	 */
	var LoaderQueueItem = function()
	{
		/**
		 * The url of the load
		 * @public
		 * @property {string} url
		 */
		this.url = null;
		
		/**
		 * Data associate with the load
		 * @public
		 * @property {*} data
		 */
		this.data = null;
		
		/**
		 * The callback function of the load, to call when 
		 * the load as finished, takes one argument as result
		 * @public
		 * @property {function} complete
		 */
		this.complete = null;
		
		/**
		 * The amount we've loaded so far, from 0 to 1
		 * @public
		 * @property {Number} loaded
		 */
		this.loaded = 0;
		
		/**
		 * The progress callback
		 * @public
		 * @proprty {function} progress
		 */
		this.progress = null;
		
		/**
		 * The callback when a load queue item fails
		 * @private
		 * @proprty {function} _fail
		 */
		this._fail = null;

		/**
		 * The callback when a load queue item progresses
		 * @private
		 * @proprty {function} _progress
		 */
		this._progress = null;

		/**
		 * The callback when a load queue item completes
		 * @private
		 * @proprty {function} _complete
		 */
		this._complete = null;
	};
	
	/** Reference to the prototype */
	var p = LoaderQueueItem.prototype;
	
	/**
	 * Represent this object as a string
	 * @public
	 * @method toString
	 * @return {string} The string representation of this object
	 */
	p.toString = function()
	{
		return "[LoaderQueueItem(url:'"+this.url+"')]";
	};

	/**
	 * Clear all the data
	 * @method clear
	 */
	p.reset = function()
	{
		this.complete = 
		this.progress = 
		this.data = 
		this.url = null;
		
		this.loaded = 0;
	};
	
	/**
	 * Destroy this result
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.reset();
		this._boundFail = null;
		this._boundProgress = null;
		this._boundComplete = null;
	};
	
	// Assign to the name space
	namespace('springroll').LoaderQueueItem = LoaderQueueItem;
	
}());