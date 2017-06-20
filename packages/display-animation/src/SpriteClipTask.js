import SpriteClip from './SpriteClip';
import {TextureAtlasTask} from '@springroll/display';

/**
 * Internal class for loading and instantiating an SpriteClip.
 * @class SpriteClipTask
 * @extends springroll.TextureAtlasTask
 * @constructor
 * @private
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
var SpriteClipTask = function(asset)
{
    TextureAtlasTask.call(this, asset, asset.anim);

    /**
     * The SpriteClip data source path
     * @property {String} anim
     */
    this.anim = this.filter(asset.anim);
};

SpriteClipTask.prototype = Object.create(TextureAtlasTask.prototype);

/**
 * Test if we should run this task
 * @method test
 * @static
 * @param {Object} asset The asset to check
 * @return {Boolean} If the asset is compatible with this asset
 */
SpriteClipTask.test = function(asset)
{
    return !!asset.anim && TextureAtlasTask.test(asset);
};

/**
 * Start the task
 * @method  start
 * @param  {Function} callback Callback when finished
 */
SpriteClipTask.prototype.start = function(callback)
{
    this.loadAtlas(
    {
        _anim: this.anim
    }, function(textureAtlas, results)
    {
        var clip = new SpriteClip(results._anim, textureAtlas);
        //override destroy on clip to destroy textureAtlas as well
        clip.__AMC_destroy = clip.destroy;
        clip.destroy = function()
        {
            clip.__AMC_destroy();
            textureAtlas.destroy();
        };
        callback(clip, results);
    }, true);
};

export default SpriteClipTask;
