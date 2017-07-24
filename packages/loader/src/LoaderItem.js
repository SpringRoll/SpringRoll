import {include} from '@springroll/core';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

let LoadQueue = include('createjs.LoadQueue');

/**
 * Represents a single item in the loader queue.
 * ### module: @springroll/loader
 * @class
 * @memberof springroll
 * @extends createjs.LoadQueue
 */
export default class LoaderItem extends LoadQueue {
    constructor() {
        super(true); // preferXHR is always true!

        /**
         * The number of times this load has been retried
         * @member {number}
         * @default
         */
        this.retries = 0;

        /**
         * The original input url of the load
         * @member {string}
         */
        this.url = null;

        /**
         * The actual url of the load
         * @member {string}
         */
        this.preparedUrl = null;

        /**
         * Data associate with the load
         * @member {any}
         */
        this.data = null;

        /**
         * The callback function of the load, to call when 
         * the load as finished, takes one argument as result
         * @member {function}
         */
        this.onComplete = null;

        /**
         * The progress callback
         * @member {function}
         */
        this.onProgress = null;

        /**
         * The callback when a load queue item fails
         * @private
         * @member {function}
         */
        this._onFailed = this._onFailed.bind(this);

        /**
         * The callback when a load queue item progresses
         * @private
         * @member {function}
         */
        this._onProgress = this._onProgress.bind(this);

        /**
         * The callback when a load queue item completes
         * @private
         * @member {function}
         */
        this._onCompleted = this._onCompleted.bind(this);

        // Install the sound plugin if we have sound module
        const Sound = include('createjs.Sound', false);

        if (Sound) {
            this.installPlugin(Sound);
        }
    }

    /**
     * Represent this object as a string
     * @return {string} The string representation of this object
     */
    toString() {
        return `[LoaderItem(url:'${this.url}')]`;
    }

    /**
     * The base path of the load
     * @member {string}
     * @default null
     */
    set basePath(basePath) {
        this._basePath = basePath;
    }

    /**
     * If this load should be cross origin
     * @member {boolean}
     * @default false
     */
    set crossOrigin(crossOrigin) {
        this._crossOrigin = crossOrigin;
    }

    /**
     * Clear all the data
     */
    clear() {
        this.basePath = '';
        this.crossOrigin = false;
        this.retries = 0;
        this.onComplete = null;
        this.onProgress = null;
        this.data = null;
        this.preparedUrl = null;
        this.url = null;

        this.removeAllEventListeners();
        this.removeAll();
        this.close();
    }

    /**
     * Start the loading
     */
    start() {
        // @if DEBUG
        if (LoaderItem.verbose) {
            Debug.log(`Attempting to load file '${this.url}'`);
        }
        // @endif
        this.addEventListener('fileload', this._onCompleted);
        this.addEventListener('error', this._onFailed);
        this.addEventListener('fileprogress', this._onProgress);
        this._internalStart();
    }

    /**
     * Start the loading internally
     * @private
     */
    _internalStart() {
        let url = this.preparedUrl;

        // Special loading for the Sound, requires the ID
        if (this.data && this.data.id) {
            url = {
                id: this.data.id,
                src: url,
                data: this.data
            };
        }

        // Load the file
        this.loadFile(url);
    }

    /**
     * The file load progress event
     * @private
     * @param {object} event The progress event
     */
    _onProgress() {
        if (this.onProgress) {
            this.onProgress(this.progress);
        }
    }

    /**
     * There was an error loading the file
     * @private
     */
    _onFailed(event) {
        // @if DEBUG
        Debug.error(`Unable to load file: ${this.url} - reason: ${event.error}`);
        // @endif
        // TODO: This requires a bit more looking into, this solves a memory leak with event listeners piling up.
        this.removeAll();
        this.retry();
    }

    /**
     * Retry the current load
     */
    retry() {
        this.retries++;
        
        if (this.retries > LoaderItem.MAX_RETRIES) {
            this.onComplete(this, null);
        }
        else {
            this._internalStart();
        }
    }

    /**
     * The file was loaded successfully
     * @private
     * @param {object} ev The load event
     */
    _onCompleted(ev) {
        // @if DEBUG
        if (LoaderItem.verbose) {
            Debug.log(`File loaded successfully from ${this.url}`);
        }
        // @endif
        this.onComplete(this, ev.result);
    }
}

/**
 * Represent this object as a string
 * @member {number}
 * @static
 * @default 3
 */
LoaderItem.MAX_RETRIES = 3;

// @if DEBUG
/**
 * If the loads should be verbose
 * @member {boolean}
 * @static
 * @default false
 */
LoaderItem.verbose = false;
// @endif
