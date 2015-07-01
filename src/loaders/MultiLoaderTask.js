/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	/**
	 * Internal class for dealing with async load assets
	 * @class MultiLoaderTask
	 * @constructor
	 * @param {String|Object} data The data properties
	 * @param {String|Number} fallbackId The fallback id if none is set in data
	 */
	var MultiLoaderTask = function(data, fallbackId)
	{
		if (typeof data == "string")
		{
			data = { src:data };
		}

		/**
		 * The source URL to load
		 * @property {String} src
		 */
		this.src = data.src;

		/**
		 * Call when done with this load
		 * @property {Function} complete
		 */
		this.complete = data.complete;

		/**
		 * Call on load progress
		 * @property {Function} progress
		 */
		this.progress = data.progress;

		/**
		 * Load progress
		 * @property {int} priority
		 */
		this.priority = data.priority;

		/**
		 * Optional data to attach to load
		 * @property {*} data
		 */
		this.data = data.data;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = data.id || String(fallbackId);
	};

	// Reference to prototype
	var p = MultiLoaderTask.prototype;

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		delete this.complete;
		delete this.progress;
	};

	// Assign to namespace
	namespace('springroll').MultiLoaderTask = MultiLoaderTask;

}());