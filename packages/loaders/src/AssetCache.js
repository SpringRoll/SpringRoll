// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * A class that remembers the assets loaded by the AssetManager
 * @class AssetCache
 * @private
 */
var AssetCache = function()
{
    /**
     * The cache containing assets
     * @property {Object} _cache
     * @private
     */
    this._cache = {};
};

/**
 * Retrieves a single asset from the cache.
 * @method read
 * @param {String} id The asset to get.
 */
AssetCache.prototype.read = function(id)
{
    // @if DEBUG
    if (!this._cache[id])
    {
        Debug.warn("AssetCache: no asset matching id: '" + id + "'");
    }
    // @endif
    return this._cache[id] || null;
};

/**
 * Adds a single asset to the cache.
 * @method write
 * @param {String} id The id to save the asset as.
 * @param {*} content The asset content to save.
 */
AssetCache.prototype.write = function(id, content)
{
    if (this._cache[id])
    {
        // @if DEBUG
        Debug.warn("AssetCache: overwriting existing asset: '" + id + "'");
        // @endif
        
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
AssetCache.prototype.delete = function(asset)
{
    var id = typeof asset === "string" ? asset : asset.id;

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
                this._destroyResult(result[key]);
            }
        }
        // Destroy list of results
        else if (Array.isArray(result))
        {
            result.forEach(this._destroyResult);
        }
        // Destory single
        else
        {
            this._destroyResult(result);
        }
        delete this._cache[id];
    }
};

/**
 * Destroy a result object.
 * @method _destroyResult
 * @private
 * @param  {*} result The object to destroy.
 */
AssetCache.prototype._destroyResult = function(result)
{
    // Ignore null results or empty objects
    if (!result) return;

    // Destroy any objects with a destroy function
    if (result.destroy)
    {
        result.destroy();
    }

    // Clear images if we have an HTML node
    if (result.tagName === "IMG")
    {
        result.src = "";
    }
};

/**
 * Removes all assets from the cache.
 * @method empty
 */
AssetCache.prototype.empty = function()
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
AssetCache.prototype.destroy = function()
{
    this.empty();
    this._cache = null;
};

export default AssetCache;
