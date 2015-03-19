/*! SpringRoll 0.2.0 */
/**
 * @module EaselJS Utilities
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	/**
	 * Utility methods for dealing with createjs movieclips
	 * @class MovieClipUtils
	 */
	var MovieClipUtils = {};

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away
	 * @method gotoAndCache
	 * @static
	 * @param {createjs.MovieClip} movieClip The movieclip
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=15] The space around the nominal bounds to include in cache image
	 */
	MovieClipUtils.gotoAndCache = function(movieClip, frame, buffer)
	{
		frame = (frame === undefined) ? 0 : frame;
		buffer = (buffer === undefined) ? 15 : buffer;
		if (movieClip.timeline)
		{
			movieClip.gotoAndStop(frame);
		}
		var bounds = movieClip.nominalBounds;
		movieClip.cache(
			bounds.x - buffer,
			bounds.y - buffer,
			bounds.width + (buffer * 2),
			bounds.height + (buffer * 2),
			1
		);
	};

	//assign to namespace
	namespace('springroll').MovieClipUtils = MovieClipUtils;
	namespace('springroll.easeljs').MovieClipUtils = MovieClipUtils;

}());
/**
 * @module EaselJS Utilities
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
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
	namespace("springroll.easeljs").BitmapUtils = BitmapUtils;
}());
/**
 * @module EaselJS Utilities
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function(undefined)
{
	// Optional libraries
	var Animator = include('springroll.easeljs.Animator', false),
		Debug = include('springroll.Debug', false),
		DwellTimer = include('springroll.easeljs.DwellTimer', false);

	/**
	 *  EaselJS-based asset utilities for managing library (FLA-exported) assets.
	 *  @class AssetUtils
	 *  @static
	 */
	var AssetUtils = {};

	/**
	 *  Rip the asset from the library display container and add it
	 *  to the stage, also will try to stop the clip if it can.
	 *  @method add
	 *  @static
	 *  @param {createjs.Container} target The target display object
	 *  @param {createjs.Container} source The source to get assets from
	 *  @param {string} property The property name of the asset
	 *  @param {boolean} [visible] The set the initial visibility state of the object
	 *  @return {createjs.DisplayObject} Return the display object
	 */
	AssetUtils.add = function(target, source, property, visible)
	{
		var asset = source[property];
		if (!asset)
		{
			if (true && Debug)
			{
				Debug.error("property " + property + " not found in source");
			}
			return;
		}
		//If it's a movieclip stop it
		if (asset.gotoAndStop)
		{
			asset.gotoAndStop(0);
		}
		//Set the initial visible state
		if (visible !== undefined)
		{
			asset.visible = !!visible;
		}

		//Add the child
		target.addChild(asset);

		return asset;
	};

	/**
	 *  Removes a collection of objects from the stage and destroys them if we cant.
	 *  @example AssetUtils.remove(this, this.skipButton, this.character);
	 *  @method remove
	 *  @static
	 *  @param {createjs.Container} target The target display object to remove assets from
	 *  @param {array|*} assets Assets to clean can either be arguments or array
	 */
	AssetUtils.remove = function(target, assets)
	{
		//Start after the target
		var arg, i, j, len = arguments.length;
		for (i = 1; i < len; i++)
		{
			arg = arguments[i];
			if (!arg) continue;

			//test the current argument to see if itself is
			//an array, if it is, run .remove() recursively
			if (Array.isArray(arg) && arg.length > 0)
			{
				for (j = arg.length - 1; j >= 0; --j)
				{
					if (arg[j])
					{
						AssetUtils.remove(target, arg[j]);
					}
				}
				continue;
			}
			
			if (DwellTimer)
				DwellTimer.destroy(arg);

			if (Animator)
				Animator.stop(arg, true);

			if (arg.stop)
			{
				arg.stop();
			}

			if (arg.destroy)
			{
				arg.destroy();
			}

			if (arg.removeAllChildren)
			{
				arg.removeAllChildren(true);
			}

			if (target.contains(arg))
			{
				target.removeChild(arg);
			}
		}
	};

	/**
	 *  Add an asset or array of assets as children to container
	 *  @param {Array|createjs.DisplayObject} assets Asset or Array of assets
	 *  @param {createjs.DisplayObject} container Display object to add children to
	 */
	AssetUtils.addAssetsToContainer = function(assets, container)
	{
		if (!assets)
			return;

		if (!assets.length)
		{
			container.addChild(assets);
		}
		else
		{
			for (var i = assets.length; i >= 0; i--)
			{
				if (assets[i])
				{
					container.addChild(assets[i]);
				}
			}
		}
	};

	/**
	 *  @param container {createjs.Container|*} Container, clip, etc. to add objects to once found
	 *  @param lib {createjs.Lib} Lib that contians the assets
	 *  @param label {String} Label for assets without number suffix
	 *  @param start {Int} Initial number of asset sequence
	 *  @param count {int} How many counts from starting int
	 *  @param visible {Boolean} Initial visiblity of added asset
	 */
	AssetUtils.getAssetSequence = function(container, lib, label, start, count, visible)
	{
		var arr = [];
		arr.push(null); //1-base array
		for (var i = start, mc = null; i <= count; i++)
		{
			mc = AssetUtils.add(container, lib, label + i, visible);
			mc.id = i;
			arr.push(mc);
		}

		return arr;
	};

	//Assign to namespace
	namespace('springroll.easeljs').AssetUtils = AssetUtils;
}());
