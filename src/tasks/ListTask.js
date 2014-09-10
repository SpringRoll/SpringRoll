/**
*  @module cloudkid
*/
(function(){
	
	// Imports
	var Task = cloudkid.Task,
		LoadTask = cloudkid.LoadTask,
		TaskEvent = cloudkid.TaskEvent,
		TaskManager = cloudkid.TaskManager;
	
	/**
	*   A task that performs a list of tasks
	*   
	*   @class ListTask
	*   @extends Task
	*   @constructor
	*   @param {String} id Alias for this ListTask
	*   @param {Array} list The list of tasks
	*   @param {function} callback Function to call when the task is completed
	*/
	var ListTask = function(id, list, callback)
	{
		this.initialize(id, list, callback);
	};
	
	// Reference to the Task prototype
	var p = ListTask.prototype = new Task();
	
	/** Super for the constructor */
	p.Task_initialize = p.initialize;
	
	/** Super for the destroy function */
	p.Task_destroy = p.destroy;

	/**
	* The list of other tasks, as an array
	* 
	* @property {Array} list
	*/
	p.list = null;
	
	/**
	* The internal task manager
	* 
	* @property {TaskManager} _manager
	* @private
	*/
	p._manager = null;
	
	/**
	* The load results dictionary
	* 
	* @property {Dictionary} _results
	* @private
	*/
	p._results = null;
	
	/**
	*   Make the list task but don't start.
	*   @function initialize
	*   @param {String} id ID of the task
	*   @param {Array} list List of tasks to start or a preloadJS manifest.
	*   @param {function} callback Callback to to call with the result of the tasks, this
	*          task, and the TaskManager that loaded it
	*/
	p.initialize = function(id, list, callback)
	{
		this.Task_initialize(id, callback);
		
		var tasks = [];
		for(var i = 0; i < list.length; i++)
		{
			// remove null items
			if (!list[i])
			{
				continue;
			}
			// If it's a task just add it to the list
			else if (list[i] instanceof Task)
			{
				tasks.push(list[i]);
			}
			// Check for manifest item
			else if (list[i].id && list[i].src)
			{
				tasks.push(new LoadTask(
					list[i].id, 
					list[i].src, 
					list[i].callback, 
					list[i].updateCallback,
					list[i].priority,
					list[i].data
				));
			}
		}
		this.list = tasks;
	};
	
	/**
	*   Start the load
	*   @function load
	*   @param {function} callback Callback to call when the task is done
	*/
	p.start = function(callback)
	{
		this._results = {};
		this._manager = new TaskManager(this.list.slice());
		this._manager.addEventListener(
			TaskEvent.TASK_DONE, 
			this._onTaskDone.bind(this)
		);
		this._manager.addEventListener(
			TaskManager.ALL_TASKS_DONE, 
			this._onAllTasksComplete.bind(this, callback)
		);
		this._manager.startAll();
	};
	
	/**
	*   Callback for when an task is done
	*   @function _onTaskDone
	*   @param {TaskEvent} ev Task Loaded event
	*   @private
	*/
	p._onTaskDone = function(ev)
	{
		if (this._isDestroyed) return;
		
		this._results[ev.task.id] = ev.data;
	};
	
	/**
	*   Callback for when the whole list is done
	*   
	*   @function _onAllTasksComplete
	*   @param {function} callback Callback passed to start()
	*   @private
	*/
	p._onAllTasksComplete = function(callback)
	{
		if (this._isDestroyed) return;
		callback(this._results);
	};
	
	/**
	*  Cancel the TaskManager used for the list of tasks. As the individual tasks are not 
	*  kept track of, this always returns true.
	*  @function cancel
	*  @return Returns true.
	*/
	p.cancel = function()
	{
		this._manager.removeAll();
		return true;
	};
	
	/**
	*   Get a string representation of this task
	*   @function toString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[ListTask ID (" + this.id + "), tasks (" + this.list + ")]";
	};
	
	/**
	*  Don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this.Task_destroy();
		
		this._results = null;
		
		for(var i = 0; i < this.list.length; i++)
		{
			this.list[i].destroy();
		}
		if (this._manager)
		{
			this._manager.destroy();
			this._manager = null;
		}
		this.list = null;
	};
	
	// Assign to the name space
	namespace('cloudkid').ListTask = ListTask;
	
}());