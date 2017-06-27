import Task from './Task';

/**
 * Internal class for loading an image that has been split into an alpha channel image and a
 * RGB only color image.
 * @class ColorAlphaTask
 * @extends springroll.Task
 * @constructor
 * @private
 * @param {Object} asset The data properties
 * @param {String} asset.color The source path to the color image
 * @param {String} asset.alpha The source path to the alpha image
 * @param {Boolean} [asset.cache=false] If we should cache the result
 * @param {String} [asset.id] Id of asset
 * @param {Function} [asset.complete] The event to call when done
 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
 */
export default class ColorAlphaTask extends Task
{
    constructor(asset)
    {
        super(asset, asset.color);

        /**
         * The atlas color source path
         * @property {String} color
         */
        this.color = this.filter(asset.color);

        /**
         * The atlas alpha source path
         * @property {String} alpha
         */
        this.alpha = this.filter(asset.alpha);
    }

    /**
     * Test if we should run this task
     * @method test
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset)
    {
        return !!asset.color && !!asset.alpha;
    }

    /**
     * Start the task
     * @method  start
     * @param  {Function} callback Callback when finished
     */
    start(callback)
    {
        this.load(
            {
                _alpha: this.alpha,
                _color: this.color
            },
            function(results)
            {
                callback(ColorAlphaTask.mergeAlpha(
                    results._color,
                    results._alpha
                ));
                results._color.src = results._alpha.src = '';
            }
        );
    }

    /**
     * Pulled from EaselJS's SpriteSheetUtils.
     * Merges the rgb channels of one image with the alpha channel of another. This can be used to
     * combine a compressed JPEG image containing color data with a PNG32 monochromatic image
     * containing alpha data. With certain types of images (those with detail that lend itself to
     * JPEG compression) this can provide significant file size savings versus a single RGBA PNG32.
     * This method is very fast (generally on the order of 1-2 ms to run).
     * @method mergeAlpha
     * @static
     * @param {Image} rbgImage The image (or canvas) containing the RGB channels to use.
     * @param {Image} alphaImage The image (or canvas) containing the alpha channel to use.
     * @param {Canvas} [canvas] If specified, this canvas will be used and returned. If not, a new
     *                      canvas will be created.
     * @return {Canvas} A canvas with the combined image data. This can be used as a source for a
     *              Texture.
     */
    static mergeAlpha(rgbImage, alphaImage, canvas)
    {
        if (!canvas)
        {
            canvas = document.createElement('canvas');
        }
        canvas.width = Math.max(alphaImage.width, rgbImage.width);
        canvas.height = Math.max(alphaImage.height, rgbImage.height);
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.drawImage(rgbImage, 0, 0);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(alphaImage, 0, 0);
        ctx.restore();
        return canvas;
    }
}
