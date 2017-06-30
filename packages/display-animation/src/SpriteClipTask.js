import SpriteClip from './SpriteClip';
import {TextureAtlasTask} from '@springroll/display';

/**
 * Internal class for loading and instantiating an SpriteClip.
 * ### module: @springroll/display-animation
 * @class
 * @extends springroll.TextureAtlasTask
 * @private
 */
export default class SpriteClipTask extends TextureAtlasTask {
    /**
     * @param {object} asset The data properties
     * @param {string} asset.type This must be "pixi" to signify that this asset should be
     *                            handled as an SpriteClip, instead of the otherwise
     *                            identical BitmapMovieClip.
     * @param {string} asset.anim Path to the JSON configuration for SpriteClip
     * @param {string} asset.atlas The TextureAtlas source data
     * @param {boolean} [asset.cache=false] If we should cache the result
     * @param {string} [asset.image] The atlas image path
     * @param {string} [asset.color] The color image path, if not using image property
     * @param {string} [asset.alpha] The alpha image path, if not using image property
     * @param {string} [asset.id] Id of asset
     * @param {function} [asset.complete] The event to call when done
     * @param {object} [asset.sizes=null] Define if certain sizes are not supported
     */
    constructor(asset) {
        super(asset, asset.anim);

        /**
         * The SpriteClip data source path
         * @member {string}
         */
        this.anim = this.filter(asset.anim);
    }

    /**
     * Test if we should run this task
     * @static
     * @param {object} asset The asset to check
     * @return {boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.anim && TextureAtlasTask.test(asset);
    }

    /**
     * Start the task
     * @param  {function} callback Callback when finished
     */
    start(callback) {
        this.loadAtlas({ _anim: this.anim }, (textureAtlas, results) => {

            const clip = new SpriteClip(results._anim, textureAtlas);
            //override destroy on clip to destroy textureAtlas as well
            clip.__AMC_destroy = clip.destroy;
            clip.destroy = function() {
                clip.__AMC_destroy();
                textureAtlas.destroy();
            };
            callback(clip, results);
        }, true);
    }
}
