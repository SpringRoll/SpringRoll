/**
*  @module cloudkid
*/
(function(undefined){
	
	// Imports
	var Loader,
		LoaderQueueItem,
		Task = include('cloudkid.Task');
	
	/**
	*  Load task is a common type of task used for loading assets
	*  through the Loader
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
		if(!Loader)
		{
			Loader = include('cloudkid.Loader');
			LoaderQueueItem = include('cloudkid.LoaderQueueItem');
		}

		// Construct the parent
		Task.call(this, id, callback);

		/**
		* The url of the file to load 
		* 
		* @property {String} url
		*/
		this.url = url;
		
		/**
		* Loading options
		* 
		* @property {*} data
		*/
		this.data = data;
		
		/**
		* The media loader priorty of the load
		* 
		* @property {int} priority
		*/
		this.priority = priority === undefined ? LoaderQueueItem.PRIORITY_NORMAL : priority;
		
		/**
		* The optional callback to get updates (to show load progress)
		* 
		* @property {function} updateCallback
		*/
		this.updateCallback = updateCallback;
	};
	
	// Super prototype
	var s = Task.prototype;

	// Reference to the inherieted task
	var p = LoadTask.prototype = Object.create(s);
	
	/**
	*   Start the load
	*   
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		Loader.instance.load(
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
		return Loader.instance.cancel(this.url);
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
		
		s.destroy.call(this);

		this.updateCallback = null;
		this.url = null;
		this.data = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').LoadTask = LoadTask;
	
}());