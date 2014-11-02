/**
*  @module Tasks
*  @namespace springroll
*/
(function(){
	
	// Imports
	var Task = include('springroll.Task');
	
	/**
	*   A task to do a generic asynchronous function task.
	*   
	*   @class FunctionTask
	*   @constructor
	*   @extends Task
	*   @param {String} id Alias for this task
	*   @param {Function} serviceCall The function to start the asynchronous task. It should take a 
	*                                 callback function as the first parameter, so the task knows 
	*                                 when the asynchronous call has been completed.
	*   @param {Function} callback Function to call when the task is completed
	*   @param {*} arguments The additional arguments passed to the service call, after the callback
	*/
	var FunctionTask = function(id, serviceCall, callback)
	{
		Task.call(this, id, callback);

		/**
		* The url of the file to load
		* 
		* @property {Function} serviceCall
		*/
		this.serviceCall = serviceCall;
		
		/**
		* The media loader priorty of the load
		* @property {Array} args
		*/
		this.args = null;

		// Get the additional arguments as an array
		if(arguments.length > 3)
		{
			this.args = Array.prototype.slice.call(arguments, 3);
		}
	};
	
	// Super prototype
	var s = Task.prototype;

	// Reference to the inherieted task
	var p = FunctionTask.prototype = Object.create(s);
	
	/**
	*   Start the load
	*   @function start
	*   @param {Function} callback Callback to call when the asynchronous function is done
	*/
	p.start = function(callback)
	{
		if(this.args)
			this.serviceCall.apply(null, [callback].concat(this.args));
		else
			this.serviceCall.call(null, callback);
	};
	
	/**
	* Get a string representation of this task
	* 
	* @function toString
	* @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[FunctionTask ID (" + this.id + ")]";
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
		
		this.serviceCall = null;
		this.args = null;
	};
	
	// Assign to the namespacing
	namespace('springroll').FunctionTask = FunctionTask;
	
}());