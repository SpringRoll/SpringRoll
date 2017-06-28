/**
 * ### module: @springroll/display
 * @see http://pixijs.download/release/docs/PIXI.Text.html
 * @class PIXI.Text
 */
/**
 * Determines if the text object's pivot property will reflect the text's alignment, e.g.
 * a Text with align of 'right' will have pivot.x set to the text's width, so that the
 * right edge of the text is at the text's position. Setting to false uses PIXI's default
 * alignment.
 * @member {Boolean} pivotAlign
 * @memberof PIXI.Text#
 * @default false
 */
PIXI.Text.prototype.pivotAlign = false;

//save a copy of the super function so that we can override it safely
PIXI.Text.prototype._origUpdateText = PIXI.Text.prototype.updateText;

PIXI.Text.prototype.updateText = function() {
    this._origUpdateText();

    if (this.pivotAlign) {
        //have the entire text area be positioned based on the alignment, to make it easy to
        //center or right-align text with other elements
        switch (this.style.align) {
            case 'center':
                this.pivot.x = this._width / 2;
                break;
            case 'right':
                this.pivot.x = this._width;
                break;
            default:
                //left or unspecified
                this.pivot.x = 0;
                break;
        }
    }
};
