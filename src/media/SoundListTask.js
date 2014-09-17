/**
*  @modules cloudkid
*/
(function(){
	
	var Task = include('cloudkid.Task', false);

	// Task is optional if we're using the task module
	if (!Task) return;

	/**
	*  A task for loading a list of sounds. These can only
	*  be created through Sound.instance.createPreloadTask().
	*  This class is not created if the Task library is not loaded before the Sound library.
	*  @class SoundListTask
	*  @extends {cloudkid.Task}
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
	var p = SoundListTask.prototype = Object.create(s);

	/**
	*  Begin the task
	*  @method start
	*  @param {function} callback The function to call when we're done
	*/
	p.start = function(callback)
	{
		cloudkid.Sound.instance.preload(this.list, callback);
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
	namespace('cloudkid').SoundListTask = SoundListTask;
	
}());