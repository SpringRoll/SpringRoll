/**
 * @module EaselJS Cutscene
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Task = include('springroll.Task'),
		Application = include('springroll.Application');

	/**
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that pulls the image from a spritesheet.
	 * @class SoundTask
	 * @extends springroll.Task
	 * @private
	 * @constructor
	 * @param {Object} asset The data properties
	 * @param {Array} asset.sounds The list of Sound aliases
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 */
	var SoundTask = function(asset)
	{
		Task.call(this, asset, asset.sounds[0]);

		/**
		 * The path to the list of sound aliases
		 * @property {Array} sounds
		 */
		this.sounds = asset.sounds;
	};

	// Reference to prototype
	var s = Task.prototype;
	var p = extend(SoundTask, Task);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SoundTask.test = function(asset)
	{
		return !!asset.sounds && Array.isArray(asset.sounds);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var sound = Application.instance.sound;
		var aliases = this.sounds;
		sound.preload(aliases, function()
		{
			// Add a destroy function to do the clean-up of aliases
			// in case we are caching
			aliases.destroy = function()
			{
				sound.unload(this);
				this.length = 0;
				delete this.destroy;
			};
			callback(aliases);
		});
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.sounds = null;
		s.destroy.call(this);
	};

	// Assign to namespace
	namespace('springroll').SoundTask = SoundTask;

}());