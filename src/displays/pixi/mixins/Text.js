/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI Text class
	 *  @class Text
	 */

	var Text = include("PIXI.Text", false);
	if (!Text) return;

	var p = Text.prototype;

	/**
	 * Determines if the text object's pivot property will reflect the text's alignment, e.g.
	 * a Text with align of 'right' will have pivot.x set to the text's width, so that the
	 * right edge of the text is at the text's position. Setting to false uses PIXI's default
	 * alignment.
	 * @property setPivotToAlign
	 * @type {Boolean}
	 * @default false
	 */
	p.setPivotToAlign = false;

	//save a copy of the super function so that we can override it safely
	p._orig_updateText = p.updateText;

	p.updateText = function()
	{
		this._orig_updateText();
		if (this.setPivotToAlign)
		{
			//have the entire text area be positioned based on the alignment, to make it easy to
			//center or right-align text with other elements
			switch (this.style.align)
			{
				case 'center':
					this.pivot.x = this._width / 2;
					break;
				case 'right':
					this.pivot.x = this._width;
					break;
				default: //left or unspecified
					this.pivot.x = 0;
					break;
			}
		}
	};

}());