import Task from './Task';

/**
 * Internal class for dealing with async function calls with AssetManager.
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 * @param {object} asset The data properties
 * @param {boolean} [asset.cache=false] If we should cache the result
 * @param {function} asset.async The required function to call
 * @param {function} [asset.complete] The function to call when we're done
 * @param {string} [asset.id] The task id for mapping the result, if any
 */
export default class FunctionTask extends Task {
    constructor(asset) {
        super(asset);

        /**
         * The asynchronous call
         * @member {function}
         */
        this.async = asset.async;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {object} asset The asset to check
     * @return {boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.async;
    }

    /**
     * Start the task
     * @param {function} callback Callback when done
     */
    start(callback) {
        this.async(callback);
    }

    /**
     * Destroy this and discard
     */
    destroy() {
        super.destroy();
        this.async = null;
    }
}
