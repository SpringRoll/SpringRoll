/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function() {

	"use strict";

	/**
	*  Designed to provide utility related to Bitmaps.
	*  @class BitmapUtils
	*/
	var BitmapUtils = {};

	/**
	*	Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	*	that pulls the image from a spritesheet. This function should be
	*	called after you have loaded up javascript assets exported from Flash,
	*	but before you have instantiated those assets.
	*
	*	@method loadSpriteSheet
	*	@static
	*	@param {Object} frameDict A dictionary of frame information, with frame, trimmed,
	*		and spriteSourceSize properties (like the JSON hash output from TexturePacker).
	*	@param {Image|HTMLCanvasElement} spritesheetImage The spritesheet image that contains all of the frames.
	*	@param {Number} [scale=1] The scale to apply to all sprites from the spritesheet.
	*		For example, a half sized spritesheet should have a scale of 2.
	*/
	BitmapUtils.loadSpriteSheet = function(frameDict, spritesheetImage, scale)
	{
		if(scale > 0)
		{
			// Do nothing
		}
		else
		{
			scale = 1;//scale should default to 1
		}

		for(var key in frameDict)
		{
			var frame = frameDict[key];
			var index = key.indexOf(".");
			if(index > 0)
				key = key.substring(0, index);//remove any file extension from the frame id
			var bitmap = lib[key];
			/* jshint ignore:start */
			var newBitmap = lib[key] = function()
			{
				createjs.Container.call(this);
				var child = new createjs.Bitmap(this._image);
				this.addChild(child);
				child.sourceRect = this._frameRect;
				var s = this._scale;
				child.setTransform(this._frameOffsetX * s, this._frameOffsetY * s, s, s);
			};
			/* jshint ignore:end */
			var p = newBitmap.prototype = new createjs.Container();
			p._image = spritesheetImage;//give it a reference to the spritesheet
			p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
			var frameRect = frame.frame;
			//save the source rectangle of the sprite
			p._frameRect = new createjs.Rectangle(frameRect.x,
												frameRect.y,
												frameRect.w,
												frameRect.h);
			//if the sprite is trimmed, then save the amount that was trimmed
			//off the left and top sides
			if(frame.trimmed)
			{
				p._frameOffsetX = frame.spriteSourceSize.x;
				p._frameOffsetY = frame.spriteSourceSize.y;
			}
			else
				p._frameOffsetX = p._frameOffsetY = 0;
			if(bitmap && bitmap.prototype.nominalBounds)
			{
				//keep the nominal bounds from the original bitmap, if it existed
				p.nominalBounds = bitmap.prototype.nominalBounds;
			}
			else
			{
				p.nominalBounds = new createjs.Rectangle(0, 0,
														frame.sourceSize.w * scale,
														frame.sourceSize.h * scale);
			}
		}
	};
	
	/**
	 * Creates a faux Bitmap from a TextureAtlas entry.
	 * @method bitmapFromTexture
	 * @static
	 * @param {Texture} texture The texture from a TextureAtlas to create the Bitmap analogue from.
	 * @param {[type]} scale A scale for the spritesheet to undo, e.g. a half sized spritesheet
	 *                       gets a scale of 2 to restore it to normal size.
	 */
	BitmapUtils.bitmapFromTexture = function(texture, scale)
	{
		if(scale > 0)
		{
			// Do nothing
		}
		else
		{
			scale = 1;//scale should default to 1
		}
		var output = new createjs.Container();
		var bitmap = new createjs.Bitmap(texture.image);
		output.addChild(bitmap);
		bitmap.sourceRect = texture.frame;
		bitmap.setTransform(texture.offset.x * scale, texture.offset.y * scale, scale, scale);
		//set up a nominal bounds to be kind
		output.nominalBounds = new createjs.Rectangle(0, 0,
												texture.width * scale,
												texture.height * scale);
		return output;
	};

	/**
	*	Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	*	that uses a scaled bitmap, so you can load up smaller bitmaps behind
	*	the scenes that are scaled back up to normal size, or high res bitmaps
	*	that are scaled down.
	*
	*	@method replaceWithScaledBitmap
	*	@static
	*	@param {String|Object} idOrDict A dictionary of Bitmap ids to replace, or a single id.
	*	@param {Number} [scale=1] The scale to apply to the image(s).
	*/
	BitmapUtils.replaceWithScaledBitmap = function(idOrDict, scale)
	{
		//scale is required, but it doesn't hurt to check - also, don't bother for a scale of 1
		if(scale != 1 && scale > 0)
		{
			// Do nothing
		}
		else
		{
			return;
		}

		var key, bitmap, newBitmap, p;
		if(typeof idOrDict == "string")
		{
			key = idOrDict;
			bitmap = lib[key];
			if(bitmap)
			{
				/* jshint ignore:start */
				newBitmap = lib[key] = function()
				{
					createjs.Container.call(this);
					var child = new this._oldBM();
					this.addChild(child);
					child.setTransform(0, 0, this._scale, this._scale);
				};
				/* jshint ignore:end */
				p = newBitmap.prototype = new createjs.Container();
				p._oldBM = bitmap;//give it a reference to the Bitmap
				p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
				p.nominalBounds = bitmap.prototype.nominalBounds;//keep the nominal bounds
			}
		}
		else
		{
			for(key in idOrDict)
			{
				bitmap = lib[key];
				if(bitmap)
				{
					/* jshint ignore:start */
					newBitmap = lib[key] = function()
					{
						createjs.Container.call(this);
						var child = new this._oldBM();
						this.addChild(child);
						child.setTransform(0, 0, this._scale, this._scale);
					};
					/* jshint ignore:end */
					p = newBitmap.prototype = new createjs.Container();
					p._oldBM = bitmap;//give it a reference to the Bitmap
					p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
					p.nominalBounds = bitmap.prototype.nominalBounds;//keep the nominal bounds
				}
			}
		}
	};

	namespace("createjs").BitmapUtils = BitmapUtils;
	namespace("springroll.createjs").BitmapUtils = BitmapUtils;
}());