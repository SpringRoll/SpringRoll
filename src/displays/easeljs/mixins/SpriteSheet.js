/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function()
{
	var SpriteSheet = include('createjs.SpriteSheet', false);

	if (!SpriteSheet) return;

	/**
	 * Mixins for the CreateJS SpriteSheet class
	 * @class SpriteSheet
	 */
	var p = SpriteSheet.prototype;

	/**
	 * Destroy this spritesheet and release references, 
	 * don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.dispatchEvent('destroy');
		this._images.forEach(function(img)
		{
			img.onload = null;
			img.src = "";
		});
		this._images = null;
		this._data = null;
		this._frames = null;
		this._animations = null;
		this.removeAllEventListeners();
	};

}());