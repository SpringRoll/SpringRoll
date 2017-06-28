import {Application} from '@springroll/core';
import {Task, ColorAlphaTask} from '@springroll/loaders';

/**
 * TextureTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
 * ### module: @springroll/display
 * @class
 * @private
 * @memberof springroll
 * @extends springroll.Task
 */
export default class TextureTask extends Task {
    /**
     * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
     *                            specifically for Pixi.
     * @param {String} [asset.image] The texture image path.
     * @param {String} [asset.color] The color image path, if not using image property.
     * @param {String} [asset.alpha] The alpha image path, if not using image property.
     * @param {Boolean} [asset.cache=false] If we should cache the result - caching results in
     *                                      caching in the global Pixi texture cache as well as
     *                                      Application's asset cache.
     * @param {String} [asset.id] The id of the task.
     * @param {Function} [asset.complete] The callback to call when the load is completed.
     * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
     */
    constructor(asset, fallbackId) {
        super(asset, fallbackId || asset.image);

        /**
         * The atlas source path
         * @member {String}
         */
        this.image = this.filter(asset.image);

        /**
         * The atlas color source path
         * @member {String}
         */
        this.color = this.filter(asset.color);

        /**
         * The atlas alpha source path
         * @member {String}
         */
        this.alpha = this.filter(asset.alpha);

        /**
         * If the texture should be uploaded to the GPU immediately.
         * @member {Boolean}
         */
        this.uploadToGPU = !!asset.uploadToGPU;
    }

    /**
     * Test to see if we should load an asset
     * @static
     * @param {Object} asset The asset to test
     * @return {Boolean} If this qualifies for this task
     */
    static test(asset) {
        return asset.type === 'pixi' && (!!asset.image || (!!asset.alpha && !!asset.color));
    }

    /**
     * Start the load
     * @param callback Callback to call when the load is done
     */
    start(callback) {
        this.loadImage({}, callback);
    }

    /**
     * Load the texture from the properties
     * @param {Object} assets The assets object to load
     * @param {Function} done Callback when complete, returns new TextureAtlas
     * @param {Boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
     *                                       because this task is still returning stuff to another
     *                                       task.
     */
    loadImage(assets, done, ignoreCacheSetting) {
        if (this.image) {
            assets._image = this.image;
        }
        else {
            assets._color = this.color;
            assets._alpha = this.alpha;
        }

        // Do the load
        this.load(assets, results => {

            let image;
            if (results._image) {
                image = results._image;
            }
            else {
                image = ColorAlphaTask.mergeAlpha(
                    results._color,
                    results._alpha
                );
            }

            //determine scale using SpringRoll's scale management
            let scale = this.original.scale;
            //if the scale doesn't exist, or is 1, then see if the devs are trying to use Pixi's
            //built in scale recognition
            if (!scale || scale === 1) {
                scale = PIXI.utils.getResolutionOfUrl(this.image || this.color);
            }
            //create the Texture and BaseTexture
            let texture = new PIXI.Texture(new PIXI.BaseTexture(image, null, scale));
            texture.baseTexture.imageUrl = this.image;

            if (this.cache && !ignoreCacheSetting) {
                //for cache id, prefer task id, but if Pixi global texture cache is using urls, then
                //use that
                let id = this.id;

                //if pixi is expecting URLs, then use the URL
                if (!PIXI.utils.useFilenamesForTextures) {
                    //use color image if regular image is not available
                    id = this.image || this.color;
                }

                //also add the frame to Pixi's global cache for fromFrame and fromImage functions
                PIXI.utils.TextureCache[id] = texture;
                PIXI.utils.BaseTextureCache[id] = texture.baseTexture;

                //set up a special destroy wrapper for this texture so that Application.instance.unload
                //works properly to completely unload it
                texture.__origDestroy = texture.destroy;

                texture.destroy = function() {
                    if (this.__destroyed) {
                        return;
                    }

                    this.__destroyed = true;

                    //destroy the base texture as well
                    this.__origDestroy(true);

                    //remove it from the global texture cache, if relevant
                    if (PIXI.utils.TextureCache[id] === this) {
                        delete PIXI.utils.TextureCache[id];
                    }
                };
            }

            if (this.uploadToGPU) {
                Application.instance.display.renderer.updateTexture(texture);
            }
            done(texture, results);
        });
    }
}
