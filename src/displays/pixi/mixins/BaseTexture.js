/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI BaseTexture class
	 *  @class BaseTexture
	 */

	var BaseTexture = include("PIXI.BaseTexture", false);
	if (!BaseTexture) return;

	var p = BaseTexture.prototype;

	var orig_destroy = p.destroy;
	p.destroy = function()
	{
		if (this._destroyed) return;

		orig_destroy.call(this);

		setTimeout(function()
		{
			//go through and destroy any textures that use this as the base texture
			//that way a destroyed spritesheet cleans up all the sprite frames
			var TextureCache = PIXI.utils.TextureCache;
			for (var id in TextureCache)
			{
				var texture = TextureCache[id];
				if (!texture)
				{
					delete TextureCache[id];
					continue;
				}
				if (texture.baseTexture === this)
				{
					texture.destroy();
				}
			}
		}, 0);
	};

}());