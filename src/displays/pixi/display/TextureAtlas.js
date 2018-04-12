/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	var Spritesheet = include('PIXI.Spritesheet'),
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
	 */
	var TextureAtlas = function(texture, data)
	{
		this.spritesheet = new Spritesheet(texture.baseTexture, data);

		/**
		 * The dictionary of Textures that this atlas consists of.
		 * @property {Object} frames
		 */
		this.frames = {};
	};

	// Extend Object
	var p = extend(TextureAtlas);

	/**
	 * Parses the texture. May be asynchronous in very large atlases.
	 * @method parse
	 * @param {Function} callback Function to call when parse is complete.
	 */
	p.parse = function(callback)
	{
		this.spritesheet.parse(function(textures)
		{
			//copy over the textures into our array
			for (var name in textures)
			{
				var origName = name;
				var texture = textures[name];
				var index = name.lastIndexOf(".");
				//strip off any ".png" or ".jpg" at the end
				if (index > 0)
					name = name.substring(0, index);
				index = name.lastIndexOf("/");
				//strip off any folder structure included in the name
				if (index >= 0)
					name = name.substring(index + 1);
				this.frames[name] = texture;
				if (origName != name)
				{
					//add to cache under changed name
					Texture.addToCache(texture, name);
				}
			}
			callback();
		}.bind(this));
	};

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
		this.spritesheet.destroy(true);
		this.spritesheet = null;
		this.frames = null;
	};

	namespace("springroll.pixi").TextureAtlas = TextureAtlas;
}());