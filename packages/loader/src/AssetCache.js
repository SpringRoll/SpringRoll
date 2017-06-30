// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * A class that remembers the assets loaded by the AssetManager
 * @class
 * @memberof springroll
 * @private
 */
export default class AssetCache {
    constructor() {
        /**
         * The cache containing assets
         * @member {object}
         * @private
         */
        this._cache = {};
    }

    /**
     * Retrieves a single asset from the cache.
     * @param {string} id The asset to get.
     */
    read(id) {
        // @if DEBUG
        if (!this._cache[id]) {
            Debug.warn(`AssetCache: no asset matching id: "${id}"`);
        }
        // @endif
        return this._cache[id] || null;
    }

    /**
     * Adds a single asset to the cache.
     * @param {string} id The id to save the asset as.
     * @param {any} content The asset content to save.
     */
    write(id, content) {
        if (this._cache[id]) {
            // @if DEBUG
            Debug.warn(`AssetCache: overwriting existing asset: "${id}"`);
            // @endif
            
            // Remove it first
            this.delete(id);
        }
        this._cache[id] = content;
    }

    /**
     * Removes a single asset from the cache.
     * @param {object|string} asset The asset to remove.
     */
    delete(asset) {
        let id = typeof asset === 'string' ? asset : asset.id;

        // If we don't have an ID, stop
        if (!id) {
            return;
        }

        let result = this._cache[id];
        if (result) {
            // Destroy mapped result
            if (Object.isPlain(result)) {
                for (let key in result) {
                    this._destroyResult(result[key]);
                }
            }
            // Destroy list of results
            else if (Array.isArray(result)) {
                result.forEach(this._destroyResult);
            }
            // Destory single
            else {
                this._destroyResult(result);
            }
            delete this._cache[id];
        }
    }

    /**
     * Destroy a result object.
     * @private
     * @param  {any} result The object to destroy.
     */
    _destroyResult(result) {
        // Ignore null results or empty objects
        if (!result) {
            return;
        }

        // Destroy any objects with a destroy function
        if (result.destroy) {
            result.destroy();
        }

        // Clear images if we have an HTML node
        if (result.tagName === 'IMG') {
            result.src = '';
        }
    }

    /**
     * Removes all assets from the cache.
     */
    empty() {
        for (let id in this._cache) {
            this.delete(id);
        }
    }

    /**
     * Destroy the cache. Don't use after this.
     */
    destroy() {
        this.empty();
        this._cache = null;
    }
}
