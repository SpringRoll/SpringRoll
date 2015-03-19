/**
 * @module Tasks
 * @namespace springroll
 * @requires Core
 */
(function()
{
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