import Task from './Task';

/**
 * Internal class for dealing with async load assets through Loader.
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 * @param {Object} asset The data properties
 * @param {String} asset.src The source
 * @param {Boolean} [asset.cache=false] If we should cache the result
 * @param {String} [asset.id] Id of asset
 * @param {Boolean} [asset.advanced=false] If we should return the LoaderResult
 * @param {mixed} [asset.data=null] Optional data
 * @param {Function} [asset.complete=null] The event to call when done
 * @param {Function} [asset.progress=null] The event to call on load progress
 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
 */
export default class LoadTask extends Task {
    constructor(asset) {
        super(asset, asset.src);

        /**
         * The source URL to load
         * @member {String}
         */
        this.src = this.filter(asset.src);

        /**
         * Call on load progress
         * @member {Function}
         */
        this.progress = asset.progress || null;

        /**
         * Optional data to attach to load
         * @member {mixed}
         */
        this.data = asset.data || null;

        /**
         * If turned on return a springroll.LoaderResult object
         * instead of the content
         * @member {Boolean}
         * @default false
         */
        this.advanced = !!asset.advanced;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.src;
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
     */
    start(callback) {
        let advanced = this.advanced;
        this.simpleLoad(
            this.src,
            function(result) {
                let content = result;
                if (content && !advanced) {
                    content = result.content;
                    result.destroy();
                }
                callback(content);
            },
            this.progress,
            this.data
        );
    }

    /**
     * Destroy this and discard
     */
    destroy() {
        super.destroy();
        this.data = null;
        this.progress = null;
    }
}
