/**
*  @module cloudkid
*/
(function(){
	
	/**
	*  A task is used by the Task Manager to do an 
	*  asyncronous task (like loading or playback)
	*  
	*  @class Task
	*  @constructor
	*  @param {String} id Alias for the task
	*  @param {function} callback Function to call when the task is completed
	*/
	var Task = function(id, callback)
	{
		this.initialize(id, callback);
	};
	
	/** Prototype reference */
	var p = Task.prototype;
	
	/**
	* The unique id of the task
	* 
	* @property {String} id
	*/
	p.id = null;
	
	/**
	* Callback to call when the task is completed
	* 
	* @property {function} callback
	*/
	p.callback = null;
	
	/**
	* Bool to keep track if this has been destroyed
	* 
	* @property {bool} _isDestroyed
	* @protected
	*/
	p._isDestroyed = false;
	
	/**
	*   Make a task but don't load
	*   @function initialize
	*   @param {String} id ID of the task
	*   @param {function} callback Callback to to call with the result, this task, and the
	*          TaskManager that started it
	*/
	p.initialize = function(id, callback)
	{
		this.id = id;
		this.callback = callback;
	};
	
	/**
	*   Called from the task manager when a Task is finished
	*   @function done
	*   @param {type} result The resulting data from the return
	*   @param {TaskManager} manager The reference to the manager
	*/
	p.done = function(result, manager)
	{
		if (this.callback)
		{
			this.callback(result, this, manager);
		}
	};
	
	/**
	*   Start the load. This implementation is a NOP.
	*   
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function()
	{
		Debug.assert(false, "Base implementation of Task cannot be called");
	};
	
	/**
	* Cancel the task - for use in inherited classes
	* @function cancel
	* @return {bool} If the cancel was successful
	*/
	p.cancel = function()
	{
		return true;
	};
	
	/**
	*   Get a string representation of this task
	*   
	*   @function toString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[Task ID (" + this.id + ")]";
	};
	
	/**
	*   If this task has been __isDestroyed
	*   Don't use after this
	*   
	*   @function destroy
	*/
	p.destroy = function()
	{
		if(this._isDestroyed) return;
		
		this._isDestroyed = true;
		this.callback = null;
		this.id = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').Task = Task;
	
}());