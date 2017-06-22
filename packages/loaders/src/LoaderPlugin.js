import {ApplicationPlugin} from '@springroll/core';
import Loader from './Loader';
import AssetManager from './AssetManager';

/**
 * @module Core
 * @namespace springroll
 */
(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin(100);

    // Init the animator
    plugin.setup = function()
    {
        /**
         * Reference to the loader.
         * @property {springroll.Loader} loader
         */
        const loader = this.loader = new Loader(this);

        /**
         * Reference to the asset manager.
         * @property {springroll.AssetManager} assetManager
         * @private
         */
        const assetManager = this.assetManager = new AssetManager();

        // Register the default tasks
        assetManager.register('springroll.LoadTask');
        assetManager.register('springroll.ListTask');
        assetManager.register('springroll.FunctionTask', 10);
        assetManager.register('springroll.ColorAlphaTask', 20);

        /**
         * Override the end-user browser cache by adding
         * "?cb=" to the end of each file path requested. Use
         * for development, debugging only!
         * @property {Boolean} options.cacheBust
         * @default DEBUG
         */
        const options = this.options;
        let cacheBust = false;
        // @if DEBUG
        cacheBust = true;
        // @endif
        options.add('cacheBust', cacheBust)
            .respond('cacheBust', function()
            {
                return loader.cacheManager.cacheBust;
            })
            .on('cacheBust', function(value)
            {
                loader.cacheManager.cacheBust = (value === "true" || !!value);
            });

        /**
         * The optional file path to prefix to any relative file
         * requests. This is a great way to load all load requests
         * with a CDN path.
         * @property {String} options.basePath
         */
        options.add('basePath');

        /**
         * The current version number for your application. This
         * number will automatically be appended to all file
         * requests. For instance, if the version is "0.0.1" all
         * file requests will be appended with "?v=0.0.1"
         * @property {String} options.version
         */
        options.add('version', null, true);

        /**
         * Path to a text file which contains explicit version
         * numbers for each asset. This is useful for controlling
         * the live browser cache. For instance, this text file
         * would have an asset on each line followed by a number:
         * `assets/config/config.json 2` would load
         * `assets/config/config.json?v=2`
         * @property {String} options.versionsFile
         */
        options.add('versionsFile', null, true);

        /**
         * Different displays offer flavors of the same asset definition.
         * Instead of repeatedly defining the asset type property,
         * it's possible to define a global default. If PIXI
         * is your default display "pixi" is recommended as a value.
         * If EaselJS is your default display "easeljs" is recommended.
         * @property {String} options.defaultAssetType
         */
        options.add('defaultAssetType')
            .on('defaultAssetType', function(value)
            {
                assetManager.defaultType = value;
            });

        /**
         * Simple load of a single file.
         * @method load
         * @param {String} source The file to load
         * @param {Function} complete The completed callback with a single
         *      parameters result object.
         * @param {Function} [progress] Update callback, return 0-1
         * @param {Boolean} [cache=false] Save to the asset cache after load
         * @param {*} [data] The data to attach to load item
         */
        /**
         * Load a single file with options.
         * @method load
         * @param {Object} asset The file resource to load
         * @param {String} asset.src The file to load
         * @param {Boolean} [asset.cache=false] If the result should be cached for later
         * @param {Function} [asset.complete=null] Callback when finished
         * @param {Function} [asset.progress=null] Callback on load progress,
         *      has a parameter which is the percentage loaded from 0 to 1.
         * @param {*} [asset.data] Additional data to attach to load is
         *      accessible in the loader's result.
         * @param {Function} [complete] The completed callback with a single
         *      parameter which is a result object. will
         *      only use if `asset.complete` is undefined.
         */
        /**
         * Load a single custom asset with options.
         * @method load
         * @param {Object} asset The single asset resource to load, properties
         *      will depend on the type of asset loading.
         * @param {Function} [asset.complete=null] Callback when finished
         * @param {String} [asset.id=null] The ID to attach to this asset
         * @param {Boolean} [asset.cache=false] If the result should be cached for later
         * @param {Function} [complete] The completed callback with a single
         *      parameters which is a result object. will
         *      only use if `asset.complete` is undefined.
         */
        /**
         * Load a map of multiple assets and return mapped result objects.
         * @method load
         * @param {Object} assets Load a map of assets.
         * @param {Function|Object} [options] Callback where the only parameter is the
         *      map of the results by ID, or the collection of load options.
         * @param {Function} [options.complete=null] The complete callback if using load options.
         * @param {Function} [options.taskDone=null] The callback when a single item is finished.
         * @param {Function} [options.progress=null] Callback percentage updates
         * @param {Boolean} [options.cacheAll=false] If tasks should be cached
         * @param {Boolean} [options.startAll=true] If tasks should be run in parallel
         * @param {String} [options.type] The default asset type of load, gets attached to each asset
         */
        /**
         * Load a list of multiple assets and return array of result objects.
         * @method load
         * @param {Array} assets The list of assets.
         *      If each object has a `id` the result will be a mapped object.
         * @param {Function|Object} [options] Callback where the only parameter is the
         *      collection or map of the results, or the collection of load options.
         * @param {Function} [options.complete=null] The complete callback if using load options.
         * @param {Function} [options.taskDone=null] The callback when a single item is finished.
         * @param {Function} [options.progress=null] Callback percentage updates
         * @param {Boolean} [options.cacheAll=false] If tasks should be cached
         * @param {Boolean} [options.startAll=true] If tasks should be run in parallel
         * @param {String} [options.type] The default asset type of load, gets attached to each asset
         */
        this.load = function(source, complete, progress, cache, data)
        {
            let options;

            // If the load arguments are setup like the Loader.load call
            // then we'll convert to an object that we can use
            if (typeof source === "string")
            {
                source = {
                    src: source,
                    progress: progress || null,
                    complete: complete || null,
                    cache: !!cache,
                    data: data || null
                };
            }
            else
            {
                // Presume complete is an options object
                options = complete;

                // Second argument is callback
                if (typeof complete === "function")
                {
                    options = {
                        complete: complete
                    };
                }
            }
            return assetManager.load(source, options);
        };

        /**
         * Unload an asset or list of assets.
         * @method unload
         * @param {Array|String} assets The collection of asset ids or
         *      single asset id. As an array, it can be a manifest
         *      with objects that contain an ID, or an array of multiple strings.
         */
        this.unload = function(assets)
        {
            if (typeof assets === "string")
            {
                assets = Array.prototype.slice.call(arguments);
            }

            for (let i = 0; i < assets.length; i++)
            {
                assetManager.cache.delete(assets[i]);
            }
        };

        /**
         * Unload all assets from the assets cache
         * @method unloadAll
         */
        this.unloadAll = function()
        {
            assetManager.cache.empty();
        };

        /**
         * Get an asset from the cache by ID
         * @method getCache
         * @param {String} id The asset to fetch
         * @return {*|null} The cached object or null if empty
         */
        this.getCache = function(id)
        {
            return assetManager.cache.read(id);
        };

        // Refresh the default size whenever the app resizes
        this.on('resize', function()
        {
            // Use the actual canvas size regard
            assetManager.sizes.refresh(
                this.realWidth,
                this.realHeight
            );
        });

        // Make sure we refresh the sizes for non resizing application
        this.once('beforeInit', function()
        {
            if (this.display)
            {
                assetManager.sizes.refresh(
                    this.realWidth,
                    this.realHeight
                );
            }
        });
    };

    // Preload task
    plugin.preload = function(done)
    {
        // This is to make sure that sizes are set before anything
        // gets preloaded by the ConfigPlugin
        this.triggerResize();

        var versionsFile = this.options.versionsFile;
        if (versionsFile)
        {
            // Try to load the default versions file
            this.loader.cacheManager.addVersionsFile(versionsFile, done);
        }
        else
        {
            done();
        }
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        if (this.loader)
        {
            this.loader.destroy();
            this.loader = null;
        }

        if (this.assetManager)
        {
            this.assetManager.destroy();
            this.assetManager = null;
        }
    };

}());