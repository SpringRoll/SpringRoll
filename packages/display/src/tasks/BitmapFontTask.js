import TextureTask from './TextureTask';

/**
 * Internal class for loading a bitmap font for Pixi.
 * ### module: @springroll/display
 * @class
 * @extends springroll.pixi.TextureTask
 * @private
 */
export default class BitmapFontTask extends TextureTask {
    /**
     * @param {Object} asset The data properties
     * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
     *                            specifically for Pixi.
     * @param {String} asset.font The BitmapFont source data
     * @param {Boolean} [asset.cache=false] If we should cache the result
     * @param {String} [asset.image] The atlas image path
     * @param {String} [asset.color] The color image path, if not using image property
     * @param {String} [asset.alpha] The alpha image path, if not using image property
     * @param {String} [asset.id] Id of asset
     * @param {Function} [asset.complete] The event to call when done
     * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
     */
    constructor(asset) {
        super(asset, asset.font);

        /**
         * The BitmapFont data source path
         * @member {String}
         */
        this.font = this.filter(asset.font);
    }

    /**
     * Test if we should run this task
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        // atlas data and an image or color/alpha split
        return !!asset.font && TextureTask.test(asset);
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
     */
    start(callback) {
        this.loadImage({ _font: this.font }, (texture, results) => {

            let data = results._font;

            let font = {};

            let info = data.getElementsByTagName('info')[0];
            let common = data.getElementsByTagName('common')[0];

            font.font = info.getAttribute('face');
            font.size = parseInt(info.getAttribute('size'), 10);
            font.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
            font.chars = {};

            //parse letters
            let letters = data.getElementsByTagName('char');

            let i;
            for (i = 0; i < letters.length; i++) {
                let l = letters[i];
                let charCode = parseInt(l.getAttribute('id'), 10);

                let textureRect = new PIXI.Rectangle(
                    parseInt(l.getAttribute('x'), 10) + texture.frame.x,
                    parseInt(l.getAttribute('y'), 10) + texture.frame.y,
                    parseInt(l.getAttribute('width'), 10),
                    parseInt(l.getAttribute('height'), 10)
                );

                font.chars[charCode] = {
                    xOffset: parseInt(l.getAttribute('xoffset'), 10),
                    yOffset: parseInt(l.getAttribute('yoffset'), 10),
                    xAdvance: parseInt(l.getAttribute('xadvance'), 10),
                    kerning:
                    {},
                    texture: new PIXI.Texture(texture.baseTexture, textureRect)
                };
            }

            //parse kernings
            let kernings = data.getElementsByTagName('kerning');
            for (i = 0; i < kernings.length; i++) {
                let k = kernings[i];
                let first = parseInt(k.getAttribute('first'), 10);
                let second = parseInt(k.getAttribute('second'), 10);
                let amount = parseInt(k.getAttribute('amount'), 10);

                font.chars[second].kerning[first] = amount;
            }

            // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
            // but it's very likely to change
            if (this.cache && PIXI.BitmapText.fonts) {
                PIXI.BitmapText.fonts[font.font] = font;
            }

            //add a cleanup function
            font.destroy = function() {
                font.chars = null;
                texture.destroy();
            };

            callback(font, results);
        }, true);
    }
}
