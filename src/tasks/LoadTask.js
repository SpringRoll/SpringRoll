/**
*  @module cloudkid
*/
(function(undefined){
	
	// Imports
	var MediaLoader = cloudkid.MediaLoader,
		Task = cloudkid.Task,
		LoaderQueueItem = cloudkid.LoaderQueueItem;
	
	/**
	*  Load task is a common type of task used for loading assets
	*  through the MediaLoader
	*  
	*  @class LoadTask
	*  @extends Task
	*  @constructor
	*  @param {String} id Alias for the task
	*  @param {String} url The url from which to load the asset
	*  @param {function} callback The function to call once loading is complete
	*  @param {function} updateCallback Optional call back to get load progress
	*  @param {int} priority Media loader priority of the load
	*  @param {*} data Opitonal loading options
	*/
	var LoadTask = function(id, url, callback, updateCallback, priority, data)
	{
		this.initialize(id, url, callback, updateCallback, priority, data);
	};
	
	/** Reference to the inherieted task */
	var p = LoadTask.prototype = new Task();
	
	/** Super for the constructor */
	p.Task_initialize = p.initialize;
	
	/** Super for the destroy function */
	p.Task_destroy = p.destroy;
	
	/**
	* The url of the file to load 
	* 
	* @property {String} url
	*/
	p.url = null;
	
	/**
	* Loading options
	* 
	* @property {*} data
	*/
	p.data = null;
	
	/**
	* The media loader priorty of the load
	* 
	* @property {int} priority
	*/
	p.priority = null;
	
	/**
	* The optional callback to get updates (to show load progress)
	* 
	* @property {function} updateCallback
	*/
	p.updateCallback = null;
	
	/**
	*  Init the laod task
	*  
	*  @function initialize
	*  @param {String} id The id of the task
	*  @param {String} url The url to load
	*  @param {function} callback The callback to call when the load is completed
	*  @param {function} updateCallback The optional callback to get updates (to show load progress)
	*  @param {int} priority The optional priority, defaults to normal
	*  @param {*} data The optional data object, for any loading options that may have been added to the preloader
	*/
	p.initialize = function(id, url, callback, updateCallback, priority, data)
	{
		this.url = url;
		this.updateCallback = updateCallback;
		this.priority = priority === undefined ? 
			LoaderQueueItem.PRIORITY_NORMAL : priority;
		
		this.data = data;

		this.Task_initialize(id, callback);
	};
	
	/**
	*   Start the load
	*   
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		MediaLoader.instance.load(
			this.url, 
			callback,
			this.updateCallback,
			this.priority,
			this.data
		);
	};
	
	/**
	* Cancel the task - for use in inherited classes
	* 
	* @function cancel
	* @return  {bool} If the loader removed it from the queue successfully - 
	*     false means that there is a 'load finished' event inbound 
	*     for the task manager
	*/
	p.cancel = function()
	{
		return MediaLoader.instance.cancel(this.url);
	};
	
	/**
	*   Get a string representation of this task
	*   
	*   @function ToString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[LoadTask ID (" + this.id + "), URL (" + this.url + ")]";
	};
	
	/**
	*  Destroy this load task and don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this.Task_destroy();
		this.updateCallback = null;
		this.url = null;
		this.data = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').LoadTask = LoadTask;
	
}());