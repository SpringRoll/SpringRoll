/*! SpringRoll 0.0.6 */
!function(){"use strict";/**
*  @module Tasks
*  @namespace springroll
*/
(function(){
	
	/**
	*  Task events are used by the task manager to communicate
	*  when tasks change
	*  
	*  @class TaskEvent
	*  @constructor
	*  @param {String} type The type of event
	*  @param {Task} task The task this event relates to
	*  @param {object} data description
	*/
	var TaskEvent = function(type, task, data)
	{
		/**
		* Task this event pertains to
		* 
		* @property {Task} task
		*/
		this.task = task;
		
		/**
		* The task result
		* 
		* @property {*} data
		*/
		this.data = data;
		
		/**
		* The type of event
		* 
		* @property {String} type
		*/
		this.type = type;
	};
		
	/**
	 * A task is about to start
	 * @event onItemAboutToLoad
	 */
	TaskEvent.TASK_ABOUT_TO_START = "onItemAboutToLoad";
	
	/**
	 * A task is now starting
	 * event onItemLoading
	 */
	TaskEvent.TASK_STARTING = "onItemLoading";
	
	/**
	 * An task is done. The data of this event is the task's result.
	 * @event onItemLoaded
	 */
	TaskEvent.TASK_DONE = "onItemLoaded";
	
	// Assign to the namespace
	namespace('springroll').TaskEvent = TaskEvent;

}());
/**
*  @module Tasks
*  @namespace springroll
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
		/**
		* The unique id of the task
		* 
		* @property {String} id
		*/
		this.id = id;
		
		/**
		* Callback to call when the task is completed
		* 
		* @property {function} callback
		*/
		this.callback = callback;
		
		/**
		* Bool to keep track if this has been destroyed
		* 
		* @property {bool} _isDestroyed
		* @protected
		*/
		this._isDestroyed = false;
	};
	
	/** Prototype reference */
	var p = Task.prototype;
	
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
	namespace('springroll').Task = Task;
	
}());
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
/**
*  @module Tasks
*  @namespace springroll
*/
(function(undefined){
	
	// Imports
	var Loader,
		LoaderQueueItem,
		Task = include('springroll.Task');
	
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
			Loader = include('springroll.Loader');
			LoaderQueueItem = include('springroll.LoaderQueueItem');
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
	namespace('springroll').LoadTask = LoadTask;
	
}());
/**
*  @module Tasks
*  @namespace springroll
*/
(function(){

	// Imports
	var TaskEvent,
		EventDispatcher = include('springroll.EventDispatcher');

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
		if(!TaskEvent)
		{
			TaskEvent = include('springroll.TaskEvent');
		}

		EventDispatcher.call(this);

		/**
		* Collection of all tasks
		*
		* @property {Array} tasks
		*/
		this.tasks = tasks || [];

		/**
		* The current tasks
		*
		* @property {Array} _currentTaskes
		* @private
		*/
		this._currentTasks = [];

		/**
		* If we're paused and should therefore not automatically proceed to the
		* next task after each task completes
		*
		* @property {bool} paused
		*/
		this.paused = true;

		/**
		* The number of tasks that are currently in progress
		*
		* @property {int} _tasksInProgress
		* @private
		*/
		this._tasksInProgress = 0;

		/**
		* If the manager is destroyed
		*
		* @property {bool} _isDestroyed
		* @private
		*/
		this._isDestroyed = false;
	};

	var p = TaskManager.prototype = Object.create(EventDispatcher.prototype);

	/**
	* Event dispatched when tasks are all done
	*
	* @event onAllTasksDone
	*/
	TaskManager.ALL_TASKS_DONE = "onAllTasksDone";

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
		manager.on(
			allDone,
			function()
			{
				// Remove the listener
				manager.off(allDone);

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
		var task, i, len;
		if (this._currentTasks && this._currentTasks.length > 0)
		{
			for (i = 0, this._currentTasks.length; i < len; i++)
			{
				task = this._currentTasks[i];
				if (task.cancel())
				{
					task.destroy();
				}
			}
		}
		if (this.tasks && this.tasks.length > 0)
		{
			for (i = 0, len = this.tasks.length; i < len; i++)
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
		for (i = this._currentTasks.length - 1; i >= 0; --i)
		{
			if(this._currentTasks[i].id == taskId)
			{
				if(this._currentTasks[i].cancel())
				{
					this._currentTasks[i].destroy();
					this._currentTasks.splice(i, 1);
					--this._tasksInProgress;
				}
			}
		}
		for (i = this.tasks.length - 1; i >= 0; --i)
		{
			if(this.tasks[i].id == taskId)
			{
				this.tasks[i].destroy();
				this.tasks.splice(i, 1);
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
		if(this.has(TaskEvent.TASK_ABOUT_TO_START))
			this.trigger(TaskEvent.TASK_ABOUT_TO_START, new TaskEvent(TaskEvent.TASK_ABOUT_TO_START, task));

		if (this.paused)
		{
			return null;
		}

		if(this.has(TaskEvent.TASK_STARTING))
			this.trigger(TaskEvent.TASK_STARTING, new TaskEvent(TaskEvent.TASK_STARTING, task));
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

		if(this.has(TaskEvent.TASK_DONE))
			this.trigger(TaskEvent.TASK_DONE, new TaskEvent(TaskEvent.TASK_DONE, task, result));
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
			this.trigger(TaskManager.ALL_TASKS_DONE);
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

		this.off();

		this.removeAll();
		this._currentTasks = null;
		this.tasks = null;
	};

	namespace('springroll').TaskManager = TaskManager;
}());

/**
*  @module Tasks
*  @namespace springroll
*/
(function(){
	
	// Imports
	var Task = include('springroll.Task'),
		LoadTask = include('springroll.LoadTask'),
		TaskEvent = include('springroll.TaskEvent'),
		TaskManager = include('springroll.TaskManager');
	
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
		Task.call(this, id, callback);

		/**
		* The internal task manager
		* 
		* @property {TaskManager} _manager
		* @private
		*/
		this._manager = null;
		
		/**
		* The load results dictionary
		* 
		* @property {Dictionary} _results
		* @private
		*/
		this._results = null;

		// Turn the list into tasks
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

		/**
		* The list of other tasks, as an array
		* 
		* @property {Array} list
		*/
		this.list = tasks;
	};
	
	// Super prototype
	var s = Task.prototype;

	// Reference to the inherieted task
	var p = ListTask.prototype = Object.create(s);
	
	/**
	*   Start the load
	*   @function load
	*   @param {function} callback Callback to call when the task is done
	*/
	p.start = function(callback)
	{
		this._results = {};
		this._manager = new TaskManager(this.list.slice());
		this._manager.on(
			TaskEvent.TASK_DONE, 
			this._onTaskDone.bind(this)
		);
		this._manager.on(
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
		
		s.destroy.call(this);
		
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
	namespace('springroll').ListTask = ListTask;
	
}());
/**
*  @module Tasks
*  @namespace springroll
*/
(function(){

	var Loader,
		Application,
		AssetLoader,
		Task = include('springroll.Task');

	/**
	*  PixiTask loads things through PIXI.AssetLoader for pixi.js.
	*  This means textures, spritesheets, and bitmap fonts.
	*  @class PixiTask
	*  @constructor
	*  @param {String} id The id of the task
	*  @param {Array} urls The urls to load using PIXI.AssetLoader
	*  @param {Function} callback The callback to call when the load is completed
	*  @param {Function} updateCallback The optional callback to call each time an item finishes loading
	*  @param {Boolean} generateCanvasTexture=false If loaded images should be drawn to a canvas and used from there.
	*/
	var PixiTask = function(id, urls, callback, updateCallback, generateCanvasTexture)
	{
		if(!Loader)
		{
			AssetLoader = include('PIXI.AssetLoader');
			Loader = include('springroll.Loader');
			Application = include('springroll.Application');
		}

		Task.call(this, id, callback);

		/**
		*	The optional callback to get updates (to show load progress)
		*	@property {Function} updateCallback
		*	@private
		*/
		this.updateCallback = updateCallback;

		/**
		*	If loaded images should be drawn to a canvas and used from there.
		*	@property {Boolean} generateCanvas
		*	@private
		*/
		this.generateCanvas = generateCanvasTexture || false;

		/**
		*	The AssetLoader used to load all files.
		*	@property {PIXI.AssetLoader} _assetLoader
		*	@private
		*/
		this._assetLoader = null;

		var cm = Loader.instance.cacheManager;

		for(var i = 0, len = urls.length; i < len; ++i)
		{
			urls[i] = cm.prepare(urls[i]);
		}

		/**
		*	The urls of the files to load
		*	@property {Array} urls
		*	@private
		*/
		this.urls = urls;
	};

	var s = Task.prototype;

	var p = PixiTask.prototype = Object.create(s);

	/**
	*   Start the load
	*	@method start
	*   @param callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		var opts = Application.instance.options;
		this._assetLoader = new AssetLoader(this.urls, opts.crossOrigin, this.generateCanvas, opts.basePath);
		this._assetLoader.onComplete = callback;
		if(this.updateCallback)
			this._assetLoader.onProgress = this.onProgress.bind(this);
		this._assetLoader.load();
	};

	/**
	*	A callback for when an individual item has been loaded.
	*	@method onProgress
	*	@private
	*/
	p.onProgress = function()
	{
		this.updateCallback();
	};

	/**
	*	Cancel the task
	*	@method cancel
	*	@return If the loader removed it from the queue successfully -
	*			false means that there is a 'load finished' event inbound
	*			for the task manager
	*/
	p.cancel = function()
	{
		this._assetLoader.onComplete = null;
		this._assetLoader.onProgress = null;
		return true;
	};

	/**
	*   Get a string representation of this task
	*	@method toString
	*   @return A string representation of this task
	*/
	p.toString = function()
	{
		return "[PixiTask ID (" + this.id + "), URLs (" + this.urls.join(", ") + ")]";
	};

	/**
	*  Destroy this load task and don't use after this.
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;

		s.destroy.call(this);

		this.updateCallback = null;
		this.urls = null;
		if(this._assetLoader)
		{
			this._assetLoader.onComplete = null;
			this._assetLoader.onProgress = null;
		}
		this._assetLoader = null;
	};

	// Assign to the namespace
	namespace('springroll').PixiTask = PixiTask;

}());
}();