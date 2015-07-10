/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var Debug,
		Application = include('springroll.Application');

	/**
	 * Internal class for dealing with async load assets
	 * @class Task
	 * @abstract
	 * @constructor
	 * @param {Object} asset The asset data
	 * @param {String} [asset.id=null] The task ID
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} [asset.complete=null] Call when complete
	 * @param {String} fallbackId The ID to set if no ID is explicitly set
	 *        this can be used for caching something that has no id
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported.
	 */
	var Task = function(asset, fallbackId)
	{
		if (Debug === undefined)
		{
			Debug = include("springroll.Debug", false);
		}
		
		/**
		 * The current status of the task (waiting, running, etc)
		 * @property {int} status
		 * @default 0
		 */
		this.status = Task.WAITING;

		/**
		 * The user call to fire when completed, returns the arguments
		 * result, original, and additionalAssets
		 * @property {Function} complete
		 * @default null
		 * @readOnly
		 */
		this.complete = asset.complete || null;

		/**
		 * If we should cache the load and use later
		 * @property {Boolean} cache
		 * @default false
		 * @readOnly
		 */
		this.cache = !!asset.cache;

		/**
		 * The task id
		 * @property {String} id
		 */
		this.id = asset.id || null;
	
		/**
		 * Reference to the original asset data
		 * @property {Object} original
		 * @readOnly
		 */
		this.original = asset;

		// We're trying to cache but we don't have an ID
		if (this.cache && !this.id)
		{
			if (fallbackId)
			{
				if (DEBUG && Debug)
				{
					Debug.info("Asset contains no id property, using the fallback '%s'", fallbackId);
				}
				
				// Remove the file extension
				fallbackId = fallbackId.substr(0, fallback.lastIndexOf('.'));

				// Check for the last folder slash then remove it
				var slashIndex = fallbackId.lastIndexOf('/');
				if (slashIndex > -1)
				{
					fallbackId = fallbackId.substr(slashIndex + 1);
				}
				// Update the id
				this.id = fallbackId;
			}

			// Check for ID if we're caching
			if (!this.id)
			{
				if (DEBUG && Debug)
				{
					Debug.error("Caching an asset requires and id, none set", asset);
				}
				this.cache = false;
			}
		}
	};

	// Reference to prototype
	var p = Task.prototype;

	/**
	 * Status for waiting to be run
	 * @property {int} WAITING
	 * @static
	 * @readOnly
	 * @final
	 * @default 0
	 */
	Task.WAITING = 0;

	/**
	 * Task is currently being run
	 * @property {int} RUNNING
	 * @static
	 * @readOnly
	 * @final
	 * @default 1
	 */
	Task.RUNNING = 1;

	/**
	 * Status for task is finished
	 * @property {int} FINISHED
	 * @static
	 * @readOnly
	 * @final
	 * @default 2
	 */
	Task.FINISHED = 2;

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		callback();
	};

	/**
	 * Add the sizing to each filter
	 * @method filter
	 * @protected
	 * @param {String} url The url to filter
	 */
	p.filter = function(url)
	{
		var sizes = Application.instance.assetManager.sizes;

		// See if we should add sizing
		if (url && sizes.test(url))
		{
			// Get the current size supported byt this asset
			var size = sizes.size(this.original.sizes);

			// Update the URL size token
			url = sizes.filter(url, size);

			// Pass along the scale to the original asset data
			this.original.scale = size.scale;
		}
		return url;
	};

	/**
	 * Destroy this and discard
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.status = Task.FINISHED;
		this.id = null;
		this.complete = null;
		this.original = null;
	};

	// Assign to namespace
	namespace('springroll').Task = Task;

}());