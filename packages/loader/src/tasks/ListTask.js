import Task from './Task';

/**
 * Internal class for grouping a list of tasks into one task.
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 * @param {object} asset The data properties
 * @param {Array|object} asset.assets The collection of assets to load
 * @param {boolean} [asset.cacheAll=false] If we should cache each item in assets.
 * @param {boolean} [asset.cache=false] If we should cache the result
 * @param {string} [asset.id] Id of asset
 * @param {function} [asset.complete=null] The event to call when done
 * @param {function} [asset.progress=null] The event to call when progress is updated
 */
export default class ListTask extends Task {
    constructor(asset) {
        super(asset);

        /**
         * The collection of assets to load
         * @member {Array|object}
         */
        this.assets = asset.assets;

        /**
         * If each asset in the collection should be cached.
         * @member {boolean}
         */
        this.cacheAll = asset.cacheAll;

        /**
         * Callback when progress is updated
         * @member {function}
         */
        this.progress = asset.progress;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {object} asset The asset to check
     * @return {boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.assets && (Array.isArray(asset.assets) || Object.isPlain(asset.assets));
    }

    /**
     * Start the task
     * @param  {function} callback Callback when finished
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
