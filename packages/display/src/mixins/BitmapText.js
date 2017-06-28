/**
 * ### module: @springroll/display
 * @see http://pixijs.download/release/docs/PIXI.extras.BitmapText.html
 * @class PIXI.extras.BitmapText
 */

/**
 * Determines if the text object's pivot property will reflect the text's alignment, e.g.
 * a BitmapText with align of 'right' will have pivot.x set to the text's width, so that the
 * right edge of the text is at the text's position. Setting to false uses PIXI's default
 * alignment.
 * @memberof PIXI.extras.BitmapText#
 * @member {Boolean} pivotAlign
 * @default false
 */
PIXI.extras.BitmapText.prototype.pivotAlign = false;

//save a copy of the super function so that we can override it safely
PIXI.extras.BitmapText.prototype._origUpdateText = PIXI.extras.BitmapText.prototype.updateText;

PIXI.extras.BitmapText.prototype.updateText = function() {
    this._origUpdateText();

    if (this.pivotAlign) {
        //have the entire text area be positioned based on the alignment, to make it easy to
        //center or right-align text with other elements
        switch (this.align) {
            case 'center':
                this.pivot.x = this.textWidth / 2;
                break;
            case 'right':
                this.pivot.x = this.textWidth;
                break;
            default:
                //left or unspecified
                this.pivot.x = 0;
                break;
        }
    }
};