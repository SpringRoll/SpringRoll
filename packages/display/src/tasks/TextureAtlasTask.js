import TextureAtlas from './TextureAtlas';
import TextureTask from './TextureTask';

/**
 * Internal class for loading a texture atlas for Pixi.
 * ### module: @springroll/display
 * @class
 * @extends springroll.TextureTask
 * @memberof springroll
 * @private
 */
export default class TextureAtlasTask extends TextureTask {
    /**
     * @param {object} asset The data properties
     * @param {string} asset.type Must be "pixi" to signify that this asset should be parsed
     *                            specifically for Pixi.
     * @param {string} asset.atlas The TextureAtlas source data
     * @param {boolean} [asset.cache=false] If we should cache the result
     * @param {string} [asset.image] The atlas image path
     * @param {string} [asset.color] The color image path, if not using image property
     * @param {string} [asset.alpha] The alpha image path, if not using image property
     * @param {string} [asset.id] Id of asset
     * @param {function} [asset.complete] The event to call when done
     * @param {object} [asset.sizes=null] Define if certain sizes are not supported
     */
    constructor(asset, fallbackId) {
        super(asset, fallbackId || asset.atlas);

        /**
         * The TextureAtlas data source path
         * @member {string}
         */
        this.atlas = this.filter(asset.atlas);
    }

    /**
     * Test if we should run this task
     * @static
     * @param {object} asset The asset to check
     * @return {boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        // atlas data and an image or color/alpha split
        return !!asset.atlas && TextureTask.test(asset);
    }

    /**
     * Start the task
     * @param  {function} callback Callback when finished
     */
    start(callback) {
        this.loadAtlas({}, callback);
    }

    /**
     * Load a texture atlas from the properties
     * @param {object} assets The assets object to load
     * @param {function} done Callback when complete, returns new TextureAtlas
     * @param {boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
     *                                       because this task is still returning stuff to another
     *                                       task.
     */
    loadAtlas(assets, done, ignoreCacheSetting) {
        assets._atlas = this.atlas;

        this.loadImage(assets, (texture, results) => {
            let data = results._atlas;
            let atlas = new TextureAtlas(
                texture,
                data,
                this.cache && !ignoreCacheSetting
            );
            //if the spritesheet JSON had a scale in it, use that to override
            //whatever settings came from loading, as the texture atlas size is more important
            if (data.meta && data.meta.scale && parseFloat(data.meta.scale) !== 1) {
                texture.baseTexture.resolution = parseFloat(results._atlas.meta.scale);
                texture.baseTexture.update();
            }
            done(atlas, results);
        }, true);
    }
}
