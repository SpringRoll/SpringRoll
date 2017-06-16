/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
    var Debug;

    /**
     * A class that remembers the assets loaded by the AssetManager
     * @class AssetCache
     * @private
     */
    var AssetCache = function()
    {
        if (Debug === undefined)
        {
            Debug = include('springroll.Debug', false);
        }

        /**
         * The cache containing assets
         * @property {Object} _cache
         * @private
         */
        this._cache = {};
    };

    // Reference to the prototype
    var p = extend(AssetCache);

    /**
     * Retrieves a single asset from the cache.
     * @method read
     * @param {String} id The asset to get.
     */
    p.read = function(id)
    {
        if (DEBUG && Debug && !this._cache[id])
        {
            Debug.warn("AssetCache: no asset matching id: '" + id + "'");
        }
        return this._cache[id] || null;
    };

    /**
     * Adds a single asset to the cache.
     * @method write
     * @param {String} id The id to save the asset as.
     * @param {*} content The asset content to save.
     */
    p.write = function(id, content)
    {
        if (this._cache[id])
        {
            if (DEBUG && Debug)
            {
                Debug.warn("AssetCache: overwriting existing asset: '" + id + "'");
            }
            // Remove it first
            this.delete(id);
        }
        this._cache[id] = content;
    };

    /**
     * Removes a single asset from the cache.
     * @method delete
     * @param {Object|String} asset The asset to remove.
     */
    p.delete = function(asset)
    {
        var id = typeof asset == "string" ? asset : asset.id;

        // If we don't have an ID, stop
        if (!id) return;

        var result = this._cache[id];
        if (result)
        {
            // Destroy mapped result
            if (Object.isPlain(result))
            {
                for (var key in result)
                {
                    destroyResult(result[key]);
                }
            }
            // Destroy list of results
            else if (Array.isArray(result))
            {
                result.forEach(destroyResult);
            }
            // Destory single
            else
            {
                destroyResult(result);
            }
            delete this._cache[id];
        }
    };

    /**
     * Destroy a result object.
     * @method destroyResult
     * @private
     * @param  {*} result The object to destroy.
     */
    function destroyResult(result)
    {
        // Ignore null results or empty objects
        if (!result) return;

        // Destroy any objects with a destroy function
        if (result.destroy)
        {
            result.destroy();
        }

        // Clear images if we have an HTML node
        if (result.tagName == "IMG")
        {
            result.src = "";
        }
    }

    /**
     * Removes all assets from the cache.
     * @method empty
     */
    p.empty = function()
    {
        for (var id in this._cache)
        {
            this.delete(id);
        }
    };

    /**
     * Destroy the cache. Don't use after this.
     * @method destroy
     */
    p.destroy = function()
    {
        this.empty();
        this._cache = null;
    };

    // Assign to namespace
    namespace('springroll').AssetCache = AssetCache;

}());