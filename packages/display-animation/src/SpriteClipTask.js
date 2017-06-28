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
     * @param {Object} asset The data properties
     * @param {String} asset.type This must be "pixi" to signify that this asset should be
     *                            handled as an SpriteClip, instead of the otherwise
     *                            identical BitmapMovieClip.
     * @param {String} asset.anim Path to the JSON configuration for SpriteClip
     * @param {String} asset.atlas The TextureAtlas source data
     * @param {Boolean} [asset.cache=false] If we should cache the result
     * @param {String} [asset.image] The atlas image path
     * @param {String} [asset.color] The color image path, if not using image property
     * @param {String} [asset.alpha] The alpha image path, if not using image property
     * @param {String} [asset.id] Id of asset
     * @param {Function} [asset.complete] The event to call when done
     * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
     */
    constructor(asset) {
        super(asset, asset.anim);

        /**
         * The SpriteClip data source path
         * @member {String}
         */
        this.anim = this.filter(asset.anim);
    }

    /**
     * Test if we should run this task
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.anim && TextureAtlasTask.test(asset);
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
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
