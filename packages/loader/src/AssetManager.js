import AssetLoad from './AssetLoad';
import AssetCache from './AssetCache';
import AssetSizes from './AssetSizes';
import Task from './tasks/Task';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Handle the asynchronous loading of multiple assets.
 * ### module: @springroll/loader
 * @class
 * @memberof springroll
 */
export default class AssetManager {
    constructor() {
        /**
         * The collection of current multiloads
         * @member {Array}
         * @private
         */
        this.loads = [];

        /**
         * The expired loads to reuse.
         * @member {Array}
         * @private
         */
        this.loadPool = [];

        /**
         * The collection of task definitions
         * @member {Array}
         * @readOnly
         */
        this.taskDefs = [];

        /**
         * The cache of assets
         * @member {springroll.AssetCache}
         * @readOnly
         */
        this.cache = new AssetCache();

        /**
         * Handle multiple asset sizes. Defaults are 'full' at a scale of 1, and
         * 'half' at a scale of 0.5 (under 400 points).
         * @member {springroll.AssetSizes}
         * @readOnly
         */
        this.sizes = new AssetSizes();

        // Add the default built-in sizes for "half" and "full"
        this.sizes.define('half', 400, 0.5, ['full']);
        this.sizes.define('full', 10000, 1, ['half']);
    }

    /**
     * Register new tasks types, these tasks must extend Task
     * @private
     * @param {Function} TaskClass The class task reference
     * @param {int} [priority=0] The priority. Higher priority tasks
     *      are tested first. More general tasks should be lower
     *      and more specific tasks should be higher.
     */
    register(TaskClass, priority) {
        if (!TaskClass) {
            return;
        }

        TaskClass.priority = priority || 0;

        // @if DEBUG
        if (!(TaskClass.prototype instanceof Task)) {
            Debug.error('Registering task much extend Task', TaskClass);
        }
        else if (!TaskClass.test) {
            Debug.error('Registering task much have test method');
        }
        // @endif

        this.taskDefs.push(TaskClass);

        // Sort definitions by priority
        // where the higher priorities are first
        this.taskDefs.sort(function(a, b) {
            return b.priority - a.priority;
        });
    }

    /**
     * Load a bunch of assets, can only call one load at a time
     * @param {Object|Array} asset The assets to load
     * @param {Object} [options] The loading options
     * @param {function} [options.complete] The callback when finished
     * @param {function} [options.progress] The callback when loading percentage is updated
     * @param {function} [options.taskDone] The callback when finished with each individual task
     * @param {Boolean} [options.autoStart=true] If we should start running right away
     * @param {Boolean} [options.startAll=true] If we should run all the tasks at once, in parallel
     * @param {Boolean} [options.cacheAll=false] If we should cache all files
     * @return {springroll.AssetLoad} The reference to the current load
     */
    load(assets, options) {
        // Apply defaults to options
        options = Object.assign(
            {
                complete: null,
                progress: null,
                taskDone: null,
                cacheAll: false,
                startAll: true,
                autoStart: true
            }, options);

        let load = this.getLoad();

        // Add to the stack of current loads
        this.loads.push(load);

        // Override the complete callback with a bind of the
        // original callback with the task
        options.complete = this._onLoaded.bind(
            this,
            options.complete,
            load
        );

        // Handle the finish
        load.once('complete', options.complete);

        // Optional loaded amount event
        if (options.progress) {
            load.on('progress', options.progress);
        }

        // Called when a task is complete
        if (options.taskDone) {
            load.on('taskDone', options.taskDone);
        }

        // Start the load
        load.setup(assets, options);

        return load;
    }

    /**
     * Stash the load for use later
     * @private
     * @param {springroll.AssetLoad} load The load to recycle
     */
    poolLoad(load) {
        load.off('complete progress taskDone');
        load.reset();
        this.loadPool.push(load);
    }

    /**
     * Get either a new AssetLoad or a recycled one
     * @private
     * @return {springroll.AssetLoad} The load to use
     */
    getLoad() {
        if (this.loadPool.length > 0) {
            return this.loadPool.pop();
        }
        return new AssetLoad(this);
    }

    /**
     * Handler when a load is finished
     * @private
     * @param {function} complete The function to call when done
     * @param {springroll.AssetLoad} load The current load
     * @param {mixed} The returned results
     */
    _onLoaded(complete, load, results) {
        let index = this.loads.indexOf(load);
        if (index > -1) {
            this.loads.splice(index, 1);
        }
        if (complete) {
            complete(results);
        }
        this.poolLoad(load);
    }

    /**
     * Destroy the AssetManager
     */
    destroy() {
        this.sizes.destroy();
        this.sizes = null;

        this.cache.destroy();
        this.cache = null;

        this.loadPool = null;
        this.loads = null;
        this.taskDefs = null;
    }
}
