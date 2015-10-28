/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	var Rectangle = include('PIXI.Rectangle'),
		Texture = include('PIXI.Texture'),
		PixiUtils = include('PIXI.utils');

	/**
	 * Handles a spritesheet. File extensions and folder paths are dropped from frame names upon
	 * loading.
	 *
	 * @class TextureAtlas
	 * @constructor
	 * @param {PIXI.Texture} texture The PIXI Texture that all sub-textures pull from.
	 * @param {Object} data The JSON object describing the frames in the atlas. This
	 *                      is expected to fit the JSON Hash format as exported from
	 *                      TexturePacker.
	 * @param {Boolean} [useGlobalCache] If sub-textures should be placed in Pixi's global
	 *                                   texture cache.
	 */
	var TextureAtlas = function(texture, data, useGlobalCache)
	{
		this.baseTexture = texture.baseTexture;
		this.texture = texture;

		/**
		 * The dictionary of Textures that this atlas consists of.
		 * @property {Object} frames
		 */
		this.frames = {};

		//TexturePacker outputs frames with (not) swapped width & height when rotated, so we need to
		//swap them ourselves - Flash exported textures do not require width & height to swap
		var swapFrameSize = data.meta &&
			data.meta.app == "http://www.codeandweb.com/texturepacker";

		var frames = data.frames;

		//parse the spritesheet
		for (var name in frames)
		{
			var frame = frames[name];

			var index = name.lastIndexOf(".");
			//strip off any ".png" or ".jpg" at the end
			if (index > 0)
				name = name.substring(0, index);
			index = name.lastIndexOf("/");
			//strip off any folder structure included in the name
			if (index >= 0)
				name = name.substring(index + 1);

			var rect = frame.frame;

			if (rect)
			{
				var size = null;
				var trim = null;

				if (frame.rotated && swapFrameSize)
				{
					size = new Rectangle(rect.x, rect.y, rect.h, rect.w);
				}
				else
				{
					size = new Rectangle(rect.x, rect.y, rect.w, rect.h);
				}

				//  Check to see if the sprite is trimmed
				if (frame.trimmed)
				{
					trim = new Rectangle(
						frame.spriteSourceSize.x, // / resolution,
						frame.spriteSourceSize.y, // / resolution,
						frame.sourceSize.w, // / resolution,
						frame.sourceSize.h // / resolution
					);
				}

				/*size.x /= resolution;
				size.y /= resolution;
				size.width /= resolution;
				size.height /= resolution;*/

				this.frames[name] = new Texture(this.baseTexture, size, size.clone(), trim,
					frame.rotated);

				if (useGlobalCache)
				{
					// lets also add the frame to pixi's global cache for fromFrame and fromImage
					// functions
					PixiUtils.TextureCache[name] = this.frames[name];
				}
			}
		}
	};

	// Extend Object
	var p = extend(TextureAtlas);

	/**
	 * Gets a frame by name.
	 * @method getFrame
	 * @param {String} name The frame name to get.
	 * @return {createjs.TextureAtlas.Texture} The texture by that name, or null if it doesn't
	 *                                         exist.
	 */
	p.getFrame = function(name)
	{
		return this.frames[name] || null;
	};

	/**
	 * Get an array of Textures that match a specific name. If a frame in a sequence is not in the
	 * atlas, the previous frame in the sequence is used in place of it.
	 * @method getFrames
	 * @param {String} name The base name of all frames to look for, like "anim_#" to search for an
	 *                      animation exported as anim_0001.png (the ".png" is dropped when the
	 *                      TextureAtlas is loaded).
	 * @param {int} numberMin The number to start on while looking for frames. Flash PNG sequences
	 *                        generally start at 1.
	 * @param {int} numberMax The number to go until while looking for frames. If your animation
	 *                        runs from frame 0001 to frame 0014, numberMax would be 14.
	 * @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as
	 *                            anim_0001.png
	 * @param {Array} [outArray] If already using an array, this can fill it instead of creating a
	 *                           new one.
	 * @return {Array} The collection of createjs.TextureAtlas.Textures.
	 */
	p.getFrames = function(name, numberMin, numberMax, maxDigits, outArray)
	{
		if (maxDigits === undefined)
			maxDigits = 4;
		if (maxDigits < 0)
			maxDigits = 0;
		if (!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid
		//creating even more strings.
		var zeros = []; //preceding zeroes array
		var compares = []; //powers of 10 array for determining how many preceding zeroes to use
		var i, c;
		for (i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for (var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length; //the length of the compar

		//the previous Texture, so we can place the same object in multiple times to control
		//animation rate
		var prevTex;
		var len;
		for (i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
			for (c = 0; c < compareLength; ++c)
			{
				if (i < compares[c])
				{
					num = zeros[c] + i;
					break;
				}
			}
			if (!num)
				num = i.toString();

			//If the texture doesn't exist, use the previous texture - this should allow us to
			//use fewer textures that are in fact the same, if those textures were removed before
			//making the spritesheet
			var texName = name.replace("#", num);
			var tex = this.frames[texName];
			if (tex)
				prevTex = tex;
			if (prevTex)
				outArray.push(prevTex);
		}

		return outArray;
	};

	/**
	 * Destroys the TextureAtlas by nulling the image and frame dictionary references.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.texture.destroy(true);
		this.texture = null;
		this.baseTexture = null;
		this.frames = null;
	};

	namespace("springroll.pixi").TextureAtlas = TextureAtlas;
}());