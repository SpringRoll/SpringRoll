/**
*  @modules Sound
*  @namespace springroll
*/
(function(){
	
	var Task = include('springroll.Task', false);

	// Task is optional if we're using the task module
	if (!Task) return;

	/**
	*  A task for loading a list of sounds. These can only
	*  be created through Sound.instance.createPreloadTask().
	*  This class is not created if the Task library is not loaded before the Sound library.
	*  @class SoundListTask
	*  @extends {springroll.Task}
	*  @constructor
	*  @param {String} id The unique id of this task
	*  @param {Array} list The collection of sounds
	*  @param {Function} callback Completed callback function
	*/
	var SoundListTask = function(id, list, callback)
	{
		Task.call(this, id, callback);
		
		/**
		*  The collection of sounds to load
		*  @property {Array} list
		*/
		this.list = list;
	};

	// Super
	var s = Task.prototype;

	// Reference to the prototype
	var p = extend(SoundListTask, Task);

	/**
	*  Begin the task
	*  @method start
	*  @param {function} callback The function to call when we're done
	*/
	p.start = function(callback)
	{
		springroll.Sound.instance.preload(this.list, callback);
	};

	/**
	*  Destroy the task
	*  @method destroy
	*/
	p.destroy = function()
	{
		s.destroy.call(this);
		this.list = null;
	};

	// Assign to name space
	namespace('springroll').SoundListTask = SoundListTask;
	
}());