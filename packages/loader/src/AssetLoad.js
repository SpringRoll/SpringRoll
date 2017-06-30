import Task from './tasks/Task';
import {EventEmitter} from '@springroll/core';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Class that represents a single multi load
 * @class
 * @memberof springroll
 * @private
 * @extends springroll.EventEmitter
 * @param {springroll.AssetManager} manager Reference to the manager
 */
export default class AssetLoad extends EventEmitter {
    constructor(manager) {
        super();

        /**
         * Reference to the Task Manager
         * @member {springroll.AssetManager}
         */
        this.manager = manager;

        // @if DEBUG
        this.id = AssetLoad.ID++;
        // @endif

        /**
         * How to display the results, either as single (0), map (1) or list (2)
         * @member {number}
         * @default 1
         */
        this.mode = AssetLoad.MAP_MODE;

        /**
         * If we should run the tasks in parallel (true) or serial (false)
         * @member {boolean}
         * @default true
         */
        this.startAll = true;

        /**
         * If we should try to cache all items in the load
         * @member {boolean}
         * @default false
         */
        this.cacheAll = false;

        /**
         * The list of tasks to load
         * @member {Array}
         */
        this.tasks = [];

        /**
         * The results to return when we're done
         * @member {Array|object}
         */
        this.results = null;

        /**
         * If the load is currently running
         * @member {boolean}
         * @default false
         */
        this.running = false;

        /**
         * The total number of assets loaded
         * @member {number}
         * @default 0
         */
        this.numLoaded = 0;

        /**
         * The total number of assets
         * @member {number}
         * @default 0
         */
        this.total = 0;

        /**
         * The default asset type if not defined
         * @member {string}
         * @default null
         */
        this.type = null;
    }

    /**
     * When an asset is finished
     * @event taskDone
     * @param {any} result The loader result
     * @param {object} originalAsset The original load asset
     * @param {Array} assets Collection to add additional assets to
     */

    /**
     * When all assets have been completed loaded
     * @event complete
     * @param {Array|object} results The results of load
     */

    /**
     * Check how many assets have finished loaded
     * @event progress
     * @param {number} percentage The amount loaded from 0 to 1
     */

    // @if DEBUG
    /**
     * Debugging purposes
     */
    toString() {
        return `[AssetLoad (index: "${this.id}")]`;
    }
    // @endif

    /**
     * Initialize the Load
     * @param {object|Array} assets The collection of assets to load
     * @param {object} [options] The loading options
     * @param {boolean} [options.startAll=true] If we should run the tasks in order
     * @param {boolean} [options.autoStart=true] Automatically start running
     * @param {boolean} [options.cacheAll=false] If we should run the tasks in order
     * @param {string} [options.type] The default asset type of load, gets attached to each asset
     */
    setup(assets, options) {
        // Save options to load
        this.startAll = options.startAll;
        this.cacheAll = options.cacheAll;
        this.type = options.type;

        // Update the results mode and tasks
        this.mode = this.addTasks(assets);

        // Set the default container for the results
        this.results = this._getAssetsContainer(this.mode);

        // Start running
        if (options.autoStart) {
            this.start();
        }
    }

    /**
     * Start the load process
     */
    start() {
        // Empty load percentage
        this.emit('progress', 0);

        // Keep track if we're currently running
        this.running = true;
        this.nextTask();
    }

    /**
     * Set back to the original state
     */
    reset() {
        // Cancel any tasks
        this.tasks.forEach(function(task) {
            task.status = Task.FINISHED;
            task.destroy();
        });
        this.total = 0;
        this.numLoaded = 0;
        this.mode = AssetLoad.MAP_MODE;
        this.tasks.length = 0;
        this.results = null;
        this.type = null;
        this.startAll = true;
        this.cacheAll = false;
        this.running = false;
    }

    /**
     * The result is a single result
     * @member {number}
     * @private
     * @final
     * @static
     * @default 0
     */
    static get SINGLE_MODE() {
        return 0;
    }

    /**
     * The result is a map of result objects
     * @member {number}
     * @private
     * @final
     * @static
     * @default 1
     */
    static get MAP_MODE() {
        return 1;
    }

    /**
     * The result is an array of result objects
     * @member {number}
     * @private
     * @final
     * @static
     * @default 2
     */
    static get LIST_MODE() {
        return 2;
    }

    /**
     * Create a list of tasks from assets
     * @private
     * @param  {object|Array} assets The assets to load
     */
    addTasks(assets) {
        let asset;
        let mode = AssetLoad.MAP_MODE;

        // Apply the defaults incase this is a single
        // thing that we're trying to load
        assets = this._applyDefaults(assets);

        // Check for a task definition on the asset
        // add default type for proper task recognition
        if (assets.type === undefined && this.type) {
            assets.type = this.type;
        }
        let isSingle = this.getTaskByAsset(assets);

        if (isSingle) {
            this.addTask(assets);
            return AssetLoad.SINGLE_MODE;
        }
        else {
            //if we added a default type for task recognition, remove it
            if (assets.type === this.type && this.type) {
                delete assets.type;
            }
            let task;
            if (Array.isArray(assets)) {
                for (let i = 0; i < assets.length; i++) {
                    asset = this._applyDefaults(assets[i]);
                    task = this.addTask(asset);
                    if (!task.id) {
                        // If we don't have the id to return
                        // a mapped result, we'll fallback to array results
                        mode = AssetLoad.LIST_MODE;
                    }
                }
            }
            else if (Object.isPlain(assets)) {
                for (let id in assets) {
                    asset = this._applyDefaults(assets[id]);
                    task = this.addTask(asset);
                    if (!task.id) {
                        task.id = id;
                    }
                }
            }
            else {
                // @if DEBUG
                Debug.error('Asset type unsupported', asset);
                // @endif
            }
        }
        return mode;
    }

    /**
     * Convert assets into object defaults
     * @private
     * @static
     * @param  {any} asset The function to convert
     * @return {object} The object asset to use
     */
    _applyDefaults(asset) {
        // convert to a LoadTask
        if (typeof asset === 'string') {
            return {
                src: asset
            };
        }
        // convert to a FunctionTask
        else if (typeof asset === 'function') {
            return {
                async: asset
            };
        }
        return asset;
    }

    /**
     * Load a single asset
     * @private
     * @param {object} asset The asset to load,
     *      can either be an object, URL/path, or async function.
     */
    addTask(asset) {
        if (asset.type === undefined && this.type) {
            asset.type = this.type;
        }
        let TaskClass = this.getTaskByAsset(asset);
        let task;
        if (TaskClass) {
            if (asset.cache === undefined && this.cacheAll) {
                asset.cache = true;
            }
            task = new TaskClass(asset);
            this.tasks.push(task);
            ++this.total;
        }
        else {
            // @if DEBUG
            Debug.error('Unable to find a task definition for asset', asset);
            // @endif
        }
        return task;
    }

    /**
     * Get the Task definition for an asset
     * @private
     * @static
     * @param  {object} asset The asset to check
     * @return {function} The Task class
     */
    getTaskByAsset(asset) {
        let TaskClass;
        let taskDefs = this.manager.taskDefs;

        // Loop backwards to get the registered tasks first
        // then will default to the basic Loader task
        for (let i = 0, len = taskDefs.length; i < len; i++) {
            TaskClass = taskDefs[i];
            if (TaskClass.test(asset)) {
                return TaskClass;
            }
        }
        return null;
    }

    /**
     * Run the next task that's waiting
     * @private
     */
    nextTask() {
        let tasks = this.tasks;
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];
            if (task.status === Task.WAITING) {
                task.status = Task.RUNNING;
                task.start(this.taskDone.bind(this, task));

                // If we aren't running in parallel, then stop
                if (!this.startAll) {
                    return;
                }
            }
        }
    }

    /**
     * Handler when a task has completed
     * @private
     * @param  {springroll.Task} task Reference to original task
     * @param  {any} [result] The result of load
     */
    taskDone(task, result) {
        // Ignore if we're destroyed
        if (!this.running) {
            return;
        }

        // Default to null
        result = result || null;

        let index = this.tasks.indexOf(task);

        // Task was already removed, because a clear
        if (index === -1) {
            return;
        }

        // Remove the completed task
        this.tasks.splice(index, 1);

        // Assets
        let assets = [];

        // Handle the file load tasks
        if (result) {
            // Handle the result
            switch (this.mode) {
                case AssetLoad.SINGLE_MODE:
                    this.results = result;
                    break;
                case AssetLoad.LIST_MODE:
                    this.results.push(result);
                    break;
                case AssetLoad.MAP_MODE:
                    this.results[task.id] = result;
                    break;
            }

            // Should we cache the task?
            if (task.cache) {
                this.manager.cache.write(task.id, result);
            }
        }

        // If the task has a complete method
        // we'll make sure that gets called
        // with a reference to the tasks
        // can potentially add more
        if (task.complete) {
            task.complete(result, task.original, assets);
        }

        // Asset is finished
        this.emit('taskDone', result, task.original, assets);

        task.destroy();

        // Add new assets to the things to load
        let mode = this.addTasks(assets);

        // Update the progress total
        this.emit('progress', ++this.numLoaded / this.total);

        // Check to make sure if we're in
        // map mode, we keep it that way
        if (this.mode === AssetLoad.MAP_MODE && mode !== this.mode) {
            // @if DEBUG
            Debug.error('Load assets require IDs to return mapped results', assets);
            return;
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'Assets require IDs';
            // @endif
        }

        if (this.tasks.length) {
            // Run the next task
            this.nextTask();
        }
        else {
            // We're finished!
            this.emit('complete', this.results);
        }
    }

    /**
     * Get an empty assets collection
     * @private
     * @param {number} mode The mode
     * @return {Array|object|null} Empty container for assets
     */
    _getAssetsContainer(mode) {
        switch (mode) {
            case AssetLoad.SINGLE_MODE:
                return null;
            case AssetLoad.LIST_MODE:
                return [];
            case AssetLoad.MAP_MODE:
                return {};
        }
    }

    /**
     * Destroy this and discard
     */
    destroy() {
        super.destroy();
        this.reset();
        this.tasks = null;
        this.manager = null;
    }
}

// @if DEBUG
/**
 * Debugging Keep track of how many we've created
 * @member {number}
 * @static
 * @private
 */
AssetLoad.ID = 1;
// @endif
