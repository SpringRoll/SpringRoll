import LoaderItem from './LoaderItem';
import LoaderResult from './LoaderResult';
import CacheManager from './CacheManager';

/**
 * The Loader is the singular loader for loading all assets
 * including images, data, code and sounds. Loader supports cache-busting
 * in the browser using dynamic query string parameters.
 * @class Loader
 */
export default class Loader {
    constructor(app) {
        /**
         * The current application
         * @property {springroll.Application} app
         * @private
         */
        this.app = app;

        /**
         * The maximum number of simulaneous loads
         * @public
         * @property {int} maxCurrentLoads
         * @default 2
         */
        this.maxCurrentLoads = 2;

        /**
         * The reference to the cache manager
         * @public
         * @property {CacheManager} cacheManager
         */
        this.cacheManager = new CacheManager(app);

        /**
         * The collection of LoaderItems by url
         * @private
         * @property {Object} items
         */
        this.items = {};

        /**
         * The pool of LoaderItems
         * @private
         * @property {array} itemPool
         */
        this.itemPool = [];
    }

    // @if DEBUG
    /**
     * If the logging should be verbose (unminified library only)
     * @property {Boolean} verbose
     * @default  false
     */
    set verbose(verbose) {
        LoaderItem.verbose = verbose;
    }
    // @endif

    /**
     * Destroy the Loader singleton, don't use after this
     * @public
     * @method destroy
     */
    destroy() {
        if (this.itemPool) {
            this.itemPool.forEach(function(item) {
                item.clear();
            });
        }
        this.itemPool = null;

        if (this.cacheManager) {
            this.cacheManager.destroy();
        }
        this.cacheManager = null;
        this.items = null;
    }

    /**
     * Load a file
     * @method load
     * @public
     * @param {string} url The file path to load
     * @param {function} complete The callback function when completed
     * @param {function} [progress] The callback for load progress update, passes 0-1 as param
     * @param {*} [data] optional data
     * @return {createjs.LoadQueue} The load queue item
     */
    load(url, complete, progress, data) {
        let options = this.app.options;

        // Get a new loader object
        let item = this._getItem();

        let basePath = options.basePath;
        if (basePath !== undefined &&
            /^http(s)?:/.test(url) === false &&
            url.search(basePath) === -1) {
            item.basePath = basePath;
        }
        item.crossOrigin = options.crossOrigin;
        item.url = url;
        item.preparedUrl = this.cacheManager.prepare(url);
        item.onComplete = this._onComplete.bind(this, complete);
        item.onProgress = progress || null;
        item.data = data || null;
        item.setMaxConnections(this.maxCurrentLoads);

        this.items[url] = item;

        item.start();

        return item;
    }

    /**
     * Handler for the file complete
     * @method _onComplete
     * @private
     * @param  {function} complete Callback function when done
     * @param  {springroll.LoaderItem} item The LoadQueue
     * @param  {null|*} result   [description]
     */
    _onComplete(complete, item, result) {
        if (result) {
            result = new LoaderResult(
                result,
                item.url,
                item.data
            );
        }
        complete(result);
        this._putItem(item);
    }

    /**
     * Cancel a load that's currently in progress
     * @public
     * @method cancel
     * @param {string} url The url
     * @return {bool} If canceled returns true, false if not canceled
     */
    cancel(url) {
        let item = this.items[url];

        if (item) {
            item.clear();
            this._putItem(item);
            return true;
        }
        return false;
    }

    /**
     * Get a Queue item from the pool or new
     * @method  _getItem
     * @private
     * @return  {springroll.LoaderItem} The Queue item to use
     */
    _getItem() {
        let itemPool = this.itemPool;
        return itemPool.length ? itemPool.pop() : new LoaderItem();
    }

    /**
     * Pool the loader queue item
     * @method  _putItem
     * @private
     * @param  {springroll.LoaderItem} item Loader item that's done
     */
    _putItem(item) {
        delete this.items[item.url];
        item.clear();
        this.itemPool.push(item);
    }
}
