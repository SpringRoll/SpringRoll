/**
 * @module CreateJS Animation
 * @namespace springroll.createjs
 * @requires CreateJS Display
 */
(function(undefined) {

	"use strict";

	/**
	*  Handles a spritesheet. File extensions and folder paths are dropped from frame names upon loading.
	*  @class TextureAtlas
	*  @constructor
	*  @param {Image|HTMLCanvasElement|Array} image The image that all textures pull from.
	*       This can also be an array of images, if the TextureAtlas should be built from several spritesheets.
	*  @param {Object|Array} spritesheetData The JSON object describing the frames in the atlas.
	*       This is expected to fit the JSON Hash format as exported from TexturePacker.
	*       This can also be an array of data objects, if the TextureAtlas should be built from several spritesheets.
	*/
	var TextureAtlas = function(image, spritesheetData)
	{
		/**
		*  The an array of image elements (Image|HTMLCanvasElement) that frames in texture atlas use.
		*  @property {Array} _image
		*  @private
		*/
		if(Array.isArray(image))
		{
			this._images = image;
		}
		else
		{
			this._images = [image];
			spritesheetData = [spritesheetData];
		}

		/**
		*  The dictionary of Textures that this atlas consists of.
		*  @property {Object} frames
		*/
		this.frames = {};

		for(var i = 0; i < this._images.length; ++i)
		{
			image = this._images[i];

			var dataFrames = spritesheetData[i].frames;
			for(var name in dataFrames)
			{
				var data = dataFrames[name];
				var index = name.lastIndexOf(".");
				if(index > 0)
					name = name.substring(0, index);//strip off any ".png" or ".jpg" at the end
				index = name.lastIndexOf("/");
				if(index < 0)
					name = name.substring(index + 1);//strip off any folder structure included in the name
				this.frames[name] = new Texture(image, data);
			}
		}
	};
	
	// Extend Object
	var p = TextureAtlas.prototype = {};

	/**
	*  Gets a frame by name.
	*  @method getFrame
	*  @param {String} name The frame name to get.
	*  @return {createjs.TextureAtlas.Texture} The texture by that name, or null if it doesn't exist.
	*/
	p.getFrame = function(name)
	{
		return this.frames[name] || null;
	};

	/**
	*  Get an array of Textures that match a specific name. If a frame in a sequence is not in the atlas,
	*  the previous frame in the sequence is used in place of it.
	*  @method getFrames
	*  @param {String} name The base name of all frames to look for, like "anim_#" to search for an animation exported
	*         as anim_0001.png (the ".png" is dropped when the TextureAtlas is loaded).
	*  @param {int} numberMin The number to start on while looking for frames. Flash PNG sequences generally start at 1.
	*  @param {int} numberMax The number to go until while looking for frames.
	*         If your animation runs from frame 0001 to frame 0014, numberMax would be 14.
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as anim_0001.png
	*  @param {Array} [outArray] If already using an array, this can fill it instead of creating a new one.
	*  @return {Array} The collection of createjs.TextureAtlas.Textures.
	*/
	p.getFrames = function(name, numberMin, numberMax, maxDigits, outArray)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		if(!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
		var zeros = [];//preceding zeroes array
		var compares = [];//powers of 10 array for determining how many preceding zeroes to use
		var i, c;
		for(i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for(var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length;//the length of the compar

		var prevTex;//the previous Texture, so we can place the same object in multiple times to control animation rate
		var len;
		for(i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
			for(c = 0; c < compareLength; ++c)
			{
				if(i < compares[c])
				{
					num = zeros[c] + i;
					break;
				}
			}
			if(!num)
				num = i.toString();
			
			//If the texture doesn't exist, use the previous texture - this should allow us to use fewer textures
			//that are in fact the same, if those textures were removed before making the spritesheet
			var texName = name.replace("#", num);
			var tex = this.frames[texName];
			if(tex)
				prevTex = tex;
			if(prevTex)
				outArray.push(prevTex);
		}

		return outArray;
	};

	/**
	*  Destroys the TextureAtlas by nulling the image and frame dictionary references.
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.image = null;
		this.frames = null;
	};

	namespace("createjs").TextureAtlas = TextureAtlas;
	namespace("springroll.createjs").TextureAtlas = TextureAtlas;

	/**
	*  A Texture - a specific portion of an image that can then be drawn by a Bitmap.
	*  This class is hidden within TextureAtlas, and can't be manually created.
	*  @class Texture
	*/
	var Texture = function(image, data)
	{
		/**
		*  The image element that this texture references.
		*  @property {Image|HTMLCanvasElement} image
		*/
		this.image = image;
		var f = data.frame;
		/**
		*  The frame rectangle within the image.
		*  @property {createjs.Rectangle} frame
		*/
		this.frame = new createjs.Rectangle(f.x, f.y, f.w, f.h);
		/**
		*  If this texture has been trimmed.
		*  @property {Boolean} trimmed
		*/
		this.trimmed = data.trimmed;
		/**
		*  The offset that the trimmed sprite should be placed at to restore it to the untrimmed position.
		*  @property {createjs.Point} offset
		*/
		this.offset = new createjs.Point(data.spriteSourceSize.x, data.spriteSourceSize.y);
		/**
		*  The width of the untrimmed texture.
		*  @property {Number} width
		*/
		this.width = data.sourceSize.w;
		/**
		*  The height of the untrimmed texture.
		*  @property {Number} height
		*/
		this.height = data.sourceSize.h;
	};
}());