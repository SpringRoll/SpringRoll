/**
*  @module cloudkid
*/
(function(){
	
	// Imports
	var Task = include('cloudkid.Task');
	
	/**
	*   A task to do some generic async function task
	*   
	*   @class FunctionTask
	*   @constructor
	*   @extends Task
	*   @param {String} id Alias for this task
	*   @param {function} serviceCall Function the service call
	*   @param {function} callback Function to call when the task is completed
	*   @param {*} args The arguments passed to the service call
	*/
	var FunctionTask = function(id, serviceCall, callback, args)
	{
		Task.call(this, id, callback);

		/**
		* The url of the file to load
		* 
		* @property {function} serviceCall
		*/
		this.serviceCall = serviceCall;
		
		/**
		* The media loader priorty of the load
		* @property {*} args
		*/
		this.args = null;

		// Get the additional arguments as an array
		if (args)
		{
			var a = Array.prototype.slice.call(arguments);
			this.args = a.slice(3);
		}
	};
	
	// Super prototype
	var s = Task.prototype;

	// Reference to the inherieted task
	var p = FunctionTask.prototype = Object.create(s);
	
	/**
	*   Start the load
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		this.serviceCall.apply(null, [callback].concat(this.args));
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
	namespace('cloudkid').FunctionTask = FunctionTask;
	
}());