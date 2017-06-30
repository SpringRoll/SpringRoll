/**
 * A bitmap to scale with the ScaleManager
 *
 * @class
 * @memberof springroll
 * @private
 */
export default class ScaleImage {
    /**
     * @param {PIXI.Sprite} image The image to resize
     * @param {object} size The original screen the item was designed for
     */
    constructor(image, size) {

        if (!(image instanceof PIXI.Sprite)) {
            // @if DEBUG
            throw 'The image is an invalid cover image, must be a PIXI.Sprite';
            // @endif
            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'Invalid image';
            // @endif
        }

        /**
         * The image to resize
         * @member {PIXI.Sprite}
         * @private
         */
        this._image = image;

        /**
         * The original screen the item was designed for
         * @private
         * @member {object}
         */
        this._size = size;
    }

    /**
     * Resize the current image
     * @param {number} w  The stage height
     * @param {number} h The stage width
     */
    resize(w, h) {
        const {_image, _size} = this._image;
        const defaultRatio = _size.width / _size.height;
        const currentRatio = w / h;
        const scaleToHeight = currentRatio >= defaultRatio;

        const size = {
            h: _image.height / _image.scale.y,
            w: _image.width / _image.scale.x
        };
        const expectedBGWidth = _size.maxWidth || _size.width;

        // A double resolution image would have a bgScale of 2
        let bgScale = size.w / expectedBGWidth;
        //if the app only expands horizontally, then we shouldn't use the expected width
        //in case the image's aspect ratio isn't the one we expect for any reason
        if (!_size.maxHeight) {
            bgScale = size.h / _size.height;
        }

        // Determine the size of the active dimension, width or height
        const activeBGSize = bgScale * (scaleToHeight ? _size.height : _size.width);

        // Determine scale the bg should be used at to fill the display properly
        const scale = (scaleToHeight ? h : w) / activeBGSize;

        // Scale the background
        this._image.scale.set(scale);

        // Center the background
        this._image.position.set(
            (w - size.w * scale) * 0.5,
            (h - size.h * scale) * 0.5
        );
    }

    /**
     * Get the current display item
     * @member {PIXI.Sprite}
     * @readOnly
     */
    get display() {
        return this._image;
    }

    /**
     * Destroy and don't use after this
     */
    destroy() {
        this._size = null;
        this._image = null;
    }
}
