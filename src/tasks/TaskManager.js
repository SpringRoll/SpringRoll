/**
*  @module cloudkid
*/
(function(){

	// Imports
	var TaskEvent = cloudkid.TaskEvent;

	/**
	*  The task manager is responsible for doing a series
	*  of asyncronous tasks
	*  
	*  @class TaskManager
	*  @constructor
	*  @param {Array} tasks The series of tasks to do
	*/
	var TaskManager = function(tasks)
	{
		this.initialize(tasks);
	};
	
	var p = TaskManager.prototype;
	
	/**
	* Adds the specified event listener
	* @function addEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener An object with a handleEvent method, or a function that will be called when the event is dispatched
	* @return {function|object} Returns the listener for chaining or assignment
	*/
	p.addEventListener = null;

	/**
	* Removes the specified event listener
	* @function removeEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener The listener function or object
	*/
	p.removeEventListener = null;

	/**
	* Removes all listeners for the specified type, or all listeners of all types
	* @function removeAllEventListeners
	* @param {String} type The string type of the event. If omitted, all listeners for all types will be removed.
	*/
	p.removeAllEventListeners = null;

	/**
	* Dispatches the specified event
	* @function dispatchEvent
	* @param {Object|String} enventObj An object with a "type" property, or a string type
	* @param {object} target The object to use as the target property of the event object
	* @return {bool} Returns true if any listener returned true
	*/
	p.dispatchEvent = null;

	/**
	* Indicates whether there is at least one listener for the specified event type
	* @function hasEventListener
	* @param {String} type The string type of the event
	* @return {bool} Returns true if there is at least one listener for the specified event
	*/
	p.hasEventListener = null;

	/**
	* Createjs EventDispatcher method
	* @property {Array} _listeners description
	* @private
	*/
	p._listeners = null;
	
	// we only use EventDispatcher if it's available:
	if (createjs.EventDispatcher) 
		createjs.EventDispatcher.initialize(p); // inject EventDispatcher methods.
	
	/**
	* The current version of the state manager
	*  
	* @property {String} VERSION
	* @static
	* @final
	*/
	TaskManager.VERSION = '${version}';
	
	/**
	* Event dispatched when tasks are all done
	* 
	* @event onAllTasksDone
	*/
	TaskManager.ALL_TASKS_DONE = "onAllTasksDone";
	
	/**
	* Collection of all tasks
	* 
	* @property {Array} tasks
	*/
	p.tasks = null;
	
	/**
	* The current tasks
	* 
	* @property {Array} _currentTaskes
	* @private
	*/
	p._currentTasks = null;
	
	/**
	* If we're paused and should therefore not automatically proceed to the
	* next task after each task completes
	* 
	* @property {bool} paused
	*/
	p.paused = true;
	
	/**
	* The number of tasks that are currently in progress
	* 
	* @property {int} _tasksInProgress
	* @private
	*/
	p._tasksInProgress = 0;
	
	/**
	* If the manager is destroyed
	* 
	* @property {bool} _isDestroyed
	* @private
	*/
	p._isDestroyed = false;
	
	/**
	*  Convenience method to execute tasks without having to setup the event listener
	* 
	*  @method process
	*  @static
	*  @param {Array} tasks The collection of tasks
	*  @param {Function} callback The callback
	*  @param {Boolean} [startAll=true] If we should start all tasks
	*  @param {Boolean} [immediateDestroy=true] Destroy after load
	*  @return {TaskManager} The instance of the task manager created
	*/
	TaskManager.process = function(tasks, callback, startAll, immediateDestroy)
	{
		immediateDestroy = immediateDestroy || true;
		startAll = startAll || true;

		var allDone = TaskManager.ALL_TASKS_DONE;
		var manager = new TaskManager(tasks);
		manager.addEventListener(
			allDone,
			function()
			{
				// Remove the listener
				manager.removeEventListener(allDone);

				// Destroy the manager
				if (immediateDestroy) manager.destroy();

				// Callback
				if (callback !== null) callback();
			}
		);

		// Decide if we should start all tasks or just the next one
		if (startAll)
			manager.startAll();
		else 
			manager.startNext();

		return manager;
	};

	/**
	*  Initializes the task manager
	*  
	*  @function initialize
	*  @param {Array} tasks The optional array of tasks, we can also add this later
	*/
	p.initialize = function(tasks)
	{
		this._currentTasks = [];
		this.tasks = tasks || [];
	};
	
	/**
	*  Convenience function to add a task
	*  
	*  @function addTask
	*  @param {Task} task The task object to load
	*/
	p.addTask = function(task)
	{
		this.tasks.push(task);
	};
	
	/**
	*  Add bunch of tasks
	*  
	*  @function addTasks
	*  @param {Array} tasks Collection of tasks to add
	*
	*/
	p.addTasks = function(tasks)
	{
		this.removeAll();
		this.tasks = tasks;
	};
	
	/**
	*   Cancel and remove all tasks
	*   
	*   @function removeAll
	*/
	p.removeAll = function()
	{
		this._tasksInProgress = 0;
		this.paused = true;
		var task, i;
		if (this._currentTasks && this._currentTasks.length > 0)
		{
			for (i = 0; i < this._currentTasks.length; i++)
			{
				task = this._currentTasks[i];
				if (task.cancel()) task.destroy();
			}
		}
		if (this.tasks && this.tasks.length > 0)
		{
			for (i = 0; i < this.tasks.length; i++)
			{
				task = this.tasks[i];
				task.destroy();
			}
		}
		this._currentTasks.length = 0;
		this.tasks.length = 0;
	};
	
	/**
	*	Cancels all tasks with a given id
	*	@function cancelTask
	*	@param {String} taskId The task id to remove.
	*/
	p.cancelTask = function(taskId)
	{
		var i;
		for(i = 0; i < this._currentTasks.length; ++i)
		{
			if(this._currentTasks[i].id == taskId)
			{
				if(this._currentTasks[i].cancel())
				{
					this._currentTasks[i].destroy();
					this._currentTasks.splice(i, 1);
					--this._tasksInProgress;
					--i;
				}
			}
		}
		for(i = 0; i < this.tasks.length; ++i)
		{
			if(this.tasks[i].id == taskId)
			{
				this.tasks[i].destroy();
				this.tasks.splice(i, 1);
				--i;
			}
		}
	};
	
	/**
	*   Start the next task in the tasks list. When it is done, the
	*   task's callback will be called.  If the manager is not paused after
	*   the task's callback returns, the manager will start the next task.
	*   @function startNext
	*   @return {Task} The task that was started or null if the list contained no
	*           tasks to be processed
	*/
	p.startNext = function()
	{
		if (this._isDestroyed) return;
		
		Debug.assert(!!this.tasks, "startNext(): There are no task for this Task Manager");
		
		var task;
		while (this.tasks.length > 0 && !(task = this.tasks.shift()))
		{
		}
		if (!task)
		{
			return null;
		}
		
		this._currentTasks.push(task);
		
		this.paused = false;
		
		// Give warning that a task is about to be started and respect pauses
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_ABOUT_TO_START, task));
	
		if (this.paused)
		{
			return null;
		}
		
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_STARTING, task));
		this._tasksInProgress++;
		
		task.start(this.onTaskDone.bind(this, task));
		
		return task;
	};
	
	/**
	*   Callback for when an task is done
	*   
	*   @function onTaskDone
	*   @param {*} result Result of the task
	*   @param {Task} task Task that is done
	*/
	p.onTaskDone = function(task, result)
	{
		if (this._isDestroyed) return;
		
		this._tasksInProgress--;
		
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_DONE, task, result));
		task.done(result, this);
		
		// Remove from the current tasks
		// and destroy
		var index = this._currentTasks.indexOf(task);
		if (index > -1)
		{
			this._currentTasks.splice(index, 1);
		}
		task.destroy();		
		
		// No more valid tasks
		if (this._tasksInProgress === 0 && this.tasks.length === 0)
		{
			this.dispatchEvent(new TaskEvent(TaskManager.ALL_TASKS_DONE, null));
		}
		else
		{
			if (!this.paused)
			{
				this.startNext();
			}
		}
	};
	
	/**
	*   Start the next task until there are no more tasks to start
	*   @function startAll
	*   @return {Array} All tasks that were started
	*/
	p.startAll = function()
	{
		Debug.assert(!!this.tasks, "startAll(): There are no task for this Task Manager");
		
		var ret = [];
		
		while (true)
		{
			var task = this.startNext();
			if (!task)
			{
				break;
			}
			ret.push(task);
		}
		return ret;
	};
	
	/**
	*   We don't want to use the task manager after this
	*   @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this._isDestroyed = true;
		
		this.removeAll();
		this._currentTasks = null;
		this.tasks = null;
	};

	namespace('cloudkid').TaskManager = TaskManager;
}());