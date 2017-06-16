/**
 * @module Core
 * @namespace springroll
 */
(function()
{
    var Task = include('springroll.Task');

    /**
     * Internal class for grouping a list of tasks into one task.
     * @class ListTask
     * @extends springroll.Task
     * @constructor
     * @private
     * @param {Object} asset The data properties
     * @param {Array|Object} asset.assets The collection of assets to load
     * @param {Boolean} [asset.cacheAll=false] If we should cache each item in assets.
     * @param {Boolean} [asset.cache=false] If we should cache the result
     * @param {String} [asset.id] Id of asset
     * @param {Function} [asset.complete=null] The event to call when done
     * @param {Function} [asset.progress=null] The event to call when progress is updated
     */
    var ListTask = function(asset)
    {
        Task.call(this, asset);

        /**
         * The collection of assets to load
         * @property {Array|Object} assets
         */
        this.assets = asset.assets;

        /**
         * If each asset in the collection should be cached.
         * @property {Boolean} cacheAll
         */
        this.cacheAll = asset.cacheAll;

        /**
         * Callback when progress is updated
         * @property {Function} progress
         */
        this.progress = asset.progress;
    };

    // Reference to prototype
    var p = Task.extend(ListTask);

    /**
     * Test if we should run this task
     * @method test
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    ListTask.test = function(asset)
    {
        return !!asset.assets && (Array.isArray(asset.assets) || Object.isPlain(asset.assets));
    };

    /**
     * Start the task
     * @method  start
     * @param  {Function} callback Callback when finished
     */
    p.start = function(callback)
    {
        this.load(this.assets,
        {
            complete: callback,
            progress: this.progress,
            cacheAll: this.cacheAll
        });
    };

    /**
     * Destroy this and discard
     * @method destroy
     */
    p.destroy = function()
    {
        Task.prototype.destroy.call(this);
        this.assets = null;
    };

    // Assign to namespace
    namespace('springroll').ListTask = ListTask;

}());