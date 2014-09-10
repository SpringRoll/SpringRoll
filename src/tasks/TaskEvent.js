/**
*  @module cloudkid
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
		this.initialize(type, task, data);
	};
	
	// Reference to the prototype
	var p = TaskEvent.prototype;
	
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
	
	/**
	* Task this event pertains to
	* 
	* @property {Task} task
	*/
	p.task = null;
	
	/**
	* The task result
	* 
	* @property {*} data
	*/
	p.data = null;
	
	/**
	* The type of event
	* 
	* @property {String} type
	*/
	p.type = null;

	/**
	*  Init the event
	*  
	*  @function initialize
	*  @param {String} type The type of event
	*  @param {Task} task The task attached to this event
	*  @param {*} data The data result associated with this task
	*/
	p.initialize = function(type, task, data)
	{
		this.type = type;
		this.task = task;
		this.data = data;
	};
	
	// Assign to the namespace
	namespace('cloudkid').TaskEvent = TaskEvent;
}());