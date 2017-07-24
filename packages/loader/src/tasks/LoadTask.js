import Task from './Task';

/**
 * Internal class for dealing with async load assets through Loader.
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 * @param {object} asset The data properties
 * @param {string} asset.src The source
 * @param {boolean} [asset.cache=false] If we should cache the result
 * @param {string} [asset.id] Id of asset
 * @param {boolean} [asset.advanced=false] If we should return the LoaderResult
 * @param {any} [asset.data=null] Optional data
 * @param {function} [asset.complete=null] The event to call when done
 * @param {function} [asset.progress=null] The event to call on load progress
 * @param {object} [asset.sizes=null] Define if certain sizes are not supported
 */
export default class LoadTask extends Task {
    constructor(asset) {
        super(asset, asset.src);

        /**
         * The source URL to load
         * @member {string}
         */
        this.src = this.filter(asset.src);

        /**
         * Call on load progress
         * @member {function}
         */
        this.progress = asset.progress || null;

        /**
         * Optional data to attach to load
         * @member {any}
         */
        this.data = asset.data || null;

        /**
         * If turned on return a springroll.LoaderResult object
         * instead of the content
         * @member {boolean}
         * @default false
         */
        this.advanced = !!asset.advanced;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {object} asset The asset to check
     * @return {boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.src;
    }

    /**
     * Start the task
     * @param  {function} callback Callback when finished
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
