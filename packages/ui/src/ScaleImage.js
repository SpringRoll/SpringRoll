import {include} from '@springroll/core';

/**
 * A bitmap to scale with the ScaleManager
 *
 * @class ScaleImage
 * @private
 * @param {PIXI.Sprite|createjs.Bitmap} image The image to resize
 * @param {Object} size The original screen the item was designed for
 * @param {DisplayAdapter} adapter The display adapter
 */
export default class ScaleImage {
    constructor(image, size, adapter) {
        let valid = false;
        
        let Bitmap = include('createjs.Bitmap', false);
        let Sprite = include('PIXI.Sprite', false);

        if (!image) {
            valid = false;
        }
        else if (Bitmap && image instanceof Bitmap) {
            valid = true;
        }
        else if (Sprite && image instanceof Sprite) {
            valid = true;
        }

        if (!valid) {
            // @if DEBUG
            throw 'The image is an invalid cover image, must be a PIXI.Sprite or createjs.Bitmap';
            // @endif
            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'Invalid image';
            // @endif
        }

        /**
         * The image to resize
         * @property {PIXI.Sprite|createjs.Bitmap} image
         * @private
         */
        this._image = image;

        /**
         * The original screen the item was designed for
         * @private
         * @property {Object} _size
         */
        this._size = size;

        /**
         * The adapter for universal scale, rotation size access
         * @property {Object} _adapter
         * @private
         */
        this._adapter = adapter;
    }

    /**
     * Resize the current image
     * @method resize
     * @param  {Number} w  The stage height
     * @param  {Number} h The stage width
     */
    resize(w, h) {
        let _size = this._size;
        let _adapter = this._adapter;
        let _image = this._image;

        let defaultRatio = _size.width / _size.height;
        let currentRatio = w / h;
        let scaleToHeight = currentRatio >= defaultRatio;

        let size = _adapter.getBitmapSize(_image);
        let expectedBGWidth = _size.maxWidth || _size.width;

        // A double resolution image would have a bgScale of 2
        let bgScale = size.w / expectedBGWidth;
        //if the app only expands horizontally, then we shouldn't use the expected width
        //in case the image's aspect ratio isn't the one we expect for any reason
        if (!_size.maxHeight) {
            bgScale = size.h / _size.height;
        }

        // Determine the size of the active dimension, width or height
        let activeBGSize = bgScale * (scaleToHeight ? _size.height : _size.width);

        // Determine scale the bg should be used at to fill the display properly
        let scale = (scaleToHeight ? h : w) / activeBGSize;

        // Scale the background
        _adapter.setScale(this._image, scale);

        // Center the background
        _adapter.setPosition(this._image,
            {
                x: (w - size.w * scale) * 0.5,
                y: (h - size.h * scale) * 0.5
            });
    }

    /**
     * Get the current display item
     * @property {PIXI.Sprite|createjs.Bitmap} display
     * @readOnly
     */
    get display() {
        return this._image;
    }

    /**
     * Destroy and don't use after this
     * @method destroy
     */
    destroy() {
        this._adapter = null;
        this._size = null;
        this._image = null;
    }
}
