import AssetLoad from './AssetLoad';
import AssetCache from './AssetCache';
import AssetSizes from './AssetSizes';
import Task from './tasks/Task';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Handle the asynchronous loading of multiple assets.
 * @class AssetManager
 * @constructor
 */
export default class AssetManager
{
    constructor()
    {
        /**
         * The collection of current multiloads
         * @property {Array} loads
         * @private
         */
        this.loads = [];

        /**
         * The expired loads to reuse.
         * @property {Array} loadPool
         * @private
         */
        this.loadPool = [];

        /**
         * The collection of task definitions
         * @property {Array} taskDefs
         * @readOnly
         */
        this.taskDefs = [];

        /**
         * The cache of assets
         * @property {springroll.AssetCache} cache
         * @readOnly
         */
        this.cache = new AssetCache();

        /**
         * Handle multiple asset sizes. Defaults are 'full' at a scale of 1, and
         * 'half' at a scale of 0.5 (under 400 points).
         * @property {springroll.AssetSizes} sizes
         * @readOnly
         */
        this.sizes = new AssetSizes();

        /**
         * The default asset type
         * @property {String} defaultType
         * @readOnly
         */
        this.defaultType = null;

        // Add the default built-in sizes for "half" and "full"
        this.sizes.define('half', 400, 0.5, ['full']);
        this.sizes.define('full', 10000, 1, ['half']);
    }

    /**
     * Register new tasks types, these tasks must extend Task
     * @method register
     * @private
     * @param {Function|String} TaskClass The class task reference
     * @param {int} [priority=0] The priority. Higher priority tasks
     *      are tested first. More general tasks should be lower
     *      and more specific tasks should be higher.
     */
    register(TaskClass, priority)
    {
        if (typeof TaskClass === "string")
        {
            TaskClass = include(TaskClass, false);
        }

        if (!TaskClass) return;

        TaskClass.priority = priority || 0;

        // @if DEBUG
        if (!(TaskClass.prototype instanceof Task))
        {
            Debug.error("Registering task much extend Task", TaskClass);
        }
        else if (!TaskClass.test)
        {
            Debug.error("Registering task much have test method");
        }
        // @endif

        this.taskDefs.push(TaskClass);

        // Sort definitions by priority
        // where the higher priorities are first
        this.taskDefs.sort(function(a, b)
        {
            return b.priority - a.priority;
        });
    }

    /**
     * Load a bunch of assets, can only call one load at a time
     * @method load
     * @param {Object|Array} asset The assets to load
     * @param {Object} [options] The loading options
     * @param {function} [options.complete] The callback when finished
     * @param {function} [options.progress] The callback when loading percentage is updated
     * @param {function} [options.taskDone] The callback when finished with each individual task
     * @param {Boolean} [options.autoStart=true] If we should start running right away
     * @param {Boolean} [options.startAll=true] If we should run all the tasks at once, in parallel
     * @param {Boolean} [options.cacheAll=false] If we should cache all files
     * @param {String} [options.type] The type of assets to load, defaults to AssetManager.prototype.defaultType
     * @return {springroll.AssetLoad} The reference to the current load
     */
    load(assets, options)
    {
        // Apply defaults to options
        options = Object.assign(
        {
            complete: null,
            progress: null,
            taskDone: null,
            cacheAll: false,
            startAll: true,
            autoStart: true,
            type: this.defaultType
        }, options);

        var load = this.getLoad();

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
        if (options.progress)
            load.on('progress', options.progress);

        // Called when a task is complete
        if (options.taskDone)
            load.on('taskDone', options.taskDone);

        // Start the load
        load.setup(assets, options);

        return load;
    }

    /**
     * Stash the load for use later
     * @method poolLoad
     * @private
     * @param {springroll.AssetLoad} load The load to recycle
     */
    poolLoad(load)
    {
        load.off('complete progress taskDone');
        load.reset();
        this.loadPool.push(load);
    }

    /**
     * Get either a new AssetLoad or a recycled one
     * @method getLoad
     * @private
     * @return {springroll.AssetLoad} The load to use
     */
    getLoad()
    {
        if (this.loadPool.length > 0)
        {
            return this.loadPool.pop();
        }
        return new AssetLoad(this);
    }

    /**
     * Handler when a load is finished
     * @method _onLoaded
     * @private
     * @param {function} complete The function to call when done
     * @param {springroll.AssetLoad} load The current load
     * @param {*} The returned results
     */
    _onLoaded(complete, load, results)
    {
        var index = this.loads.indexOf(load);
        if (index > -1)
        {
            this.loads.splice(index, 1);
        }
        if (complete) complete(results);
        this.poolLoad(load);
    }

    /**
     * Destroy the AssetManager
     * @method destroy
     */
    destroy()
    {
        this.sizes.destroy();
        this.sizes = null;

        this.cache.destroy();
        this.cache = null;

        this.loadPool = null;
        this.loads = null;
        this.taskDefs = null;
    }
}
