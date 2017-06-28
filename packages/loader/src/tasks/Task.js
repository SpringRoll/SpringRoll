import {Application} from '@springroll/core';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Internal class for dealing with async load assets
 * @class
 * @memberof springroll
 * @private
 * @param {Object} asset The asset data
 * @param {String} [asset.id=null] The task ID
 * @param {Boolean} [asset.cache=false] If we should cache the result
 * @param {Function} [asset.complete=null] Call when complete
 * @param {String} fallbackId The ID to set if no ID is explicitly set
 *      this can be used for caching something that has no id
 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported.
 */
export default class Task {
    constructor(asset, fallbackId) {
        /**
         * The current status of the task (waiting, running, etc)
         * @member {int}
         * @default 0
         */
        this.status = Task.WAITING;

        /**
         * The user call to fire when completed, returns the arguments
         * result, original, and additionalAssets
         * @member {Function}
         * @default null
         * @readOnly
         */
        this.complete = asset.complete || null;

        /**
         * If we should cache the load and use later
         * @member {Boolean}
         * @default false
         * @readOnly
         */
        this.cache = !!asset.cache;

        /**
         * The task id
         * @member {String}
         */
        this.id = asset.id || null;

        /**
         * The task type for display filter
         * @member {String}
         */
        this.type = asset.type || null;

        /**
         * Reference to the original asset data
         * @member {Object}
         * @readOnly
         */
        this.original = asset;

        // We're trying to cache but we don't have an ID
        if (this.cache && !this.id) {
            if (fallbackId && typeof fallbackId === 'string') {
                // Remove the file extension
                let extIndex = fallbackId.lastIndexOf('.');
                if (extIndex > -1) {
                    fallbackId = fallbackId.substr(0, extIndex);
                }

                // Check for the last folder slash then remove it
                let slashIndex = fallbackId.lastIndexOf('/');
                if (slashIndex > -1) {
                    fallbackId = fallbackId.substr(slashIndex + 1);
                }

                // Update the id
                asset.id = this.id = fallbackId;
            }

            // Check for ID if we're caching
            if (!this.id) {
                // @if DEBUG
                Debug.error('Caching an asset requires an id, none set', asset);
                // @endif
                this.cache = false;
            }
        }
    }

    /**
     * Status for waiting to be run
     * @member {int}
     * @static
     * @readOnly
     * @final
     * @default 0
     */
    static get WAITING() {
        return 0;
    }

    /**
     * Task is currently being run
     * @member {int}
     * @static
     * @readOnly
     * @final
     * @default 1
     */
    static get RUNNING() {
        return 1;
    }

    /**
     * Status for task is finished
     * @member {int}
     * @static
     * @readOnly
     * @final
     * @default 2
     */
    static get FINISHED() {
        return 2;
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
     */
    start(callback) {
        callback();
    }

    /**
     * Add the sizing to each filter
     * @protected
     * @param {String} url The url to filter
     */
    filter(url) {
        let sizes = Application.instance.assetManager.sizes;

        // See if we should add sizing
        if (url && sizes.test(url)) {
            // Get the current size supported by this asset
            let size = sizes.size(this.original.sizes);

            // Update the URL size token
            url = sizes.filter(url, size);

            // Pass along the scale to the original asset data
            this.original.scale = size.scale;
        }
        return url;
    }

    /**
     * Pass-through to the Application load method
     * @protected
     * @param {String|Array|Object} source The source to load
     * @param {Object|Function} [options] The load options or callback function
     */
    load(source, options) {
        return Application.instance.load(source, options);
    }

    /**
     * Pass-through to the Application Loader.load
     * @protected
     * @param {String} url Path to file to load
     * @param {Function} complete The callback
     * @param {Function} [progress] The load progress
     * @param {Object} [data] Additiona data
     */
    simpleLoad(url, complete, progress, data) {
        return Application.instance.loader.load(url, complete, progress, data);
    }

    /**
     * Destroy this and discard
     */
    destroy() {
        this.status = Task.FINISHED;
        this.id = null;
        this.type = null;
        this.complete = null;
        this.original = null;
    }
}
