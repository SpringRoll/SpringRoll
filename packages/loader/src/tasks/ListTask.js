import Task from './Task';

/**
 * Internal class for grouping a list of tasks into one task.
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 * @param {Object} asset The data properties
 * @param {Array|Object} asset.assets The collection of assets to load
 * @param {Boolean} [asset.cacheAll=false] If we should cache each item in assets.
 * @param {Boolean} [asset.cache=false] If we should cache the result
 * @param {String} [asset.id] Id of asset
 * @param {Function} [asset.complete=null] The event to call when done
 * @param {Function} [asset.progress=null] The event to call when progress is updated
 */
export default class ListTask extends Task {
    constructor(asset) {
        super(asset);

        /**
         * The collection of assets to load
         * @member {Array|Object}
         */
        this.assets = asset.assets;

        /**
         * If each asset in the collection should be cached.
         * @member {Boolean}
         */
        this.cacheAll = asset.cacheAll;

        /**
         * Callback when progress is updated
         * @member {Function}
         */
        this.progress = asset.progress;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.assets && (Array.isArray(asset.assets) || Object.isPlain(asset.assets));
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
     */
    start(callback) {
        this.load(this.assets,
            {
                complete: callback,
                progress: this.progress,
                cacheAll: this.cacheAll
            });
    }

    /**
     * Destroy this and discard
     */
    destroy() {
        super.destroy();
        this.assets = null;
    }
}
