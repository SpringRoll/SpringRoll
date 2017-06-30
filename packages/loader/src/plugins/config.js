import {ApplicationPlugin} from '@springroll/core';

(function() {

    const plugin = new ApplicationPlugin('config', 'asset-manager');

    /**
     * The game has finished loading
     * ### module: @springroll/loader
     * @event springroll.Application#loaded
     */

    /**
     * The amount of progress of the preload from 0 to 1
     * ### module: @springroll/loader
     * @event springroll.Application#progress
     * @param {number} percentage The amount preloaded
     */

    /**
     * The config has finished loading, in case you want to
     * add additional tasks to the manager after this.
     * ### module: @springroll/loader
     * @event springroll.Application#configLoaded
     * @param {object} config The JSON object for config
     * @param {Array} assets Container to add additional assets to
     */

    /**
     * The game has started loading.
     * ### module: @springroll/loader
     * @event springroll.Application#loading
     * @param {Array} assets The list of tasks to preload
     */

    // Init the animator
    plugin.setup = function() {
        const options = this.options;

        /**
         * The path to the config file to load
         * ### module: @springroll/loader
         * @member {string} configPath
         * @memberof springroll.ApplicationOptions#
         * @default null
         */
        options.add('configPath', null, true);

        /**
         * The collection of assets to preload, can be individual
         * URLs or objects with keys `src`, `complete`, `progress`, etc. 
         * ### module: @springroll/loader
         * @member {string|Array|object} preload
         * @memberof springroll.ApplicationOptions#
         * @default []
         */
        options.add('preload', [], true);

        /**
         * The game configuration loaded from and external JSON file
         * ### module: @springroll/loader
         * @member {object} config
         * @memberof springroll.Application#
         */
        this.config = null;

        /**
         * The asset load for preloading
         * ### module: @springroll/loader
         * @member {springroll.AssetLoad} _assetLoad
         * @memberof springroll.Application#
         * @private
         */
        this._assetLoad = null;

        /**
         * The total number of assets loaded
         * ### module: @springroll/loader
         * @member {number} _numLoaded
         * @memberof springroll.Application#
         * @private
         */
        this._numLoaded = 0;

        /**
         * The total assets to preload
         * ### module: @springroll/loader
         * @member {number} _total
         * @memberof springroll.Application#
         * @private
         */
        this._total = 0;

        /**
         * The current combined progress with plugin and asset load
         * ### module: @springroll/loader
         * @member {number} _progress
         * @memberof springroll.Application#
         * @private
         * @default -1
         */
        this._progress = -1;

        // Listen for changes to the plugin progress
        this.on('pluginProgress', onProgress.bind(this));
    };

    // async
    plugin.preload = function(done) {
        let assets = [];
        let configPath = this.options.configPath;

        // If there's a config path then add it
        if (configPath) {
            assets.push(
                {
                    id: 'config',
                    src: configPath,
                    cache: false,
                    complete: onConfigLoaded.bind(this)
                });
        }
        else {
            addPreloadAssets(this, assets);
        }

        let callback = onLoadComplete.bind(this, done);

        if (assets.length) {
            this._assetLoad = this.load(assets,
                {
                    complete: callback,
                    progress: onProgress.bind(this),
                    cacheAll: true
                });
        }
        else {
            callback();
        }
    };

    /**
     * Callback when progress is finished
     * @private
     * @param {number} progress The amount loaded from 0 to 1
     */
    function onProgress() {
        if (this._assetLoad) {
            this._numLoaded = this._assetLoad.numLoaded;
            this._total = this._assetLoad.total;
        }
        let numLoaded = (this._numLoaded + this.pluginLoad.numLoaded);
        let total = (this._total + this.pluginLoad.total);
        let progress = numLoaded / total;
        if (progress > this._progress) {
            this._progress = progress;
            this.emit('progress', progress);
        }
    }

    /**
     * Add the preload assets to the list of assets to load
     * @private
     * @param {springroll.Application} app Reference to the application
     * @param {Array} assets The array to add new load tasks to
     */
    function addPreloadAssets(app, assets) {
        assets.append(app.options.preload);

        // Allow extending game to add additional tasks
        app.emit('loading', assets);
    }

    /**
     * Callback when the config is loaded
     * @private
     * @param {object} config The Loader result from the load
     * @param {object} asset Original asset data
     * @param {Array} assets The array to add new load tasks to
     */
    function onConfigLoaded(config, asset, assets) {
        this.config = config;
        this.emit('configLoaded', config, assets);
        addPreloadAssets(this, assets);
    }

    /**
     * Callback when tasks are completed
     * @private
     * @param {function} done Call when we're done
     * @param {Array} results The collection of final LoaderResult objects
     */
    function onLoadComplete(done, results) {
        this._assetLoad = null;
        this.emit('loaded', results);
        done();
    }

    // Destroy the animator
    plugin.teardown = function() {
        this.config = null;
    };

}());