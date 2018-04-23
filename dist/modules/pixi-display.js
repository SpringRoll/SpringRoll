/*! SpringRoll 1.0.3 */
/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI BitmapText class
	 *  @class BitmapText
	 */

	var BitmapText = include("PIXI.extras.BitmapText", false);
	if (!BitmapText) return;

	var p = BitmapText.prototype;

	/**
	 * Determines if the text object's pivot property will reflect the text's alignment, e.g.
	 * a BitmapText with align of 'right' will have pivot.x set to the text's width, so that the
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
			switch (this.align)
			{
				case 'center':
					this.pivot.x = this.textWidth / 2;
					break;
				case 'right':
					this.pivot.x = this.textWidth;
					break;
				default: //left or unspecified
					this.pivot.x = 0;
					break;
			}
		}
	};

}());
/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI Container class
	 *  @class Container
	 */

	var Container = include("PIXI.Container", false);
	if (!Container) return;

	var p = Container.prototype;

	/**
	 * Determines if width and height will calculate bounds of all children using getLocalBounds(),
	 * or only use the internal _width or _height. This should really only be set once, when the
	 * display object is initialized. Note that without this property, the default would be to
	 * use getLocalBounds();
	 * @property useBoundsForSize
	 * @type {Boolean}
	 * @default true
	 */
	p.useBoundsForSize = true;

	p._width = 0;
	p._height = 0;

	if (Object.getOwnPropertyDescriptor(p, 'width').configurable)
	{
		Object.defineProperty(p, 'width',
		{
			configurable: true,
			get: function()
			{
				if (this.useBoundsForSize)
					return this.scale.x * this.getLocalBounds().width;
				else
					return this.scale.x * this._width;
			},
			set: function(value)
			{
				if (this.useBoundsForSize)
				{
					var width = this.getLocalBounds().width;
					if (width !== 0)
						this.scale.x = value / width;
					else
						this.scale.x = 1;
					this._width = value;
				}
				else
				{
					if (this._width === 0)
						this._width = value / this.scale.x;
					else
						this.scale.x = value / this._width;
				}
			}
		});

		Object.defineProperty(p, 'height',
		{
			configurable: true,
			get: function()
			{
				if (this.useBoundsForSize)
					return this.scale.y * this.getLocalBounds().height;
				else
					return this.scale.y * this._height;
			},
			set: function(value)
			{
				if (this.useBoundsForSize)
				{
					var height = this.getLocalBounds().height;
					if (height !== 0)
						this.scale.y = value / height;
					else
						this.scale.y = 1;
					this._height = value;
				}
				else
				{
					if (this._height === 0)
						this._height = value / this.scale.y;
					else
						this.scale.y = value / this._height;
				}
			}
		});
	}

}());
/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI InteractionManager class
	 *  @class InteractionManager
	 */

	var InteractionManager = include("PIXI.interaction.InteractionManager", false);
	if (!InteractionManager) return;

	var p = InteractionManager.prototype;

	/**
	 * Removes mousedown, mouseup, etc. events, but leaves the mousemove events. This allows a
	 * custom cursor to continue to update its position while disabling any real interaction.
	 * @method removeClickEvents
	 */
	p.removeClickEvents = function()
	{
		if (!this.interactionDOMElement)
		{
			return;
		}

		//core.ticker.shared.remove(this.update);

		if (window.navigator.msPointerEnabled)
		{
			this.interactionDOMElement.style['-ms-content-zooming'] = '';
			this.interactionDOMElement.style['-ms-touch-action'] = '';
		}

		//window.document.removeEventListener('mousemove', this.onMouseMove, true);
		this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
		//this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);
		//this.interactionDOMElement.removeEventListener('mouseover', this.onMouseOver, true);

		this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
		this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
		this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

		//this.interactionDOMElement = null;

		window.removeEventListener('mouseup', this.onMouseUp, true);

		//this.eventsAdded = false;
	};

}());
/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI Point class, which include methods
	 *  for calculating the dot product, length, distance, normalize, etc.
	 *  @class Point
	 */

	var Point = include("PIXI.Point", false);
	if (!Point) return;

	var p = Point.prototype;

	/**
	 * Returns the dot product between this point and another one.
	 * @method dotProd
	 * @param other {Point} The point to form a dot product with
	 * @return The dot product between the two points.
	 */
	p.dotProd = function(other)
	{
		return this.x * other.x + this.y * other.y;
	};

	/**
	 * Returns the length (or magnitude) of this point.
	 * @method length
	 * @return The length of this point.
	 */
	p.length = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	/**
	 * Returns the squared length (or magnitude) of this point. This is faster than length().
	 * @method lengthSq
	 * @return The length squared of this point.
	 */
	p.lengthSq = function()
	{
		return this.x * this.x + this.y * this.y;
	};

	/**
	 * Reduces the point to a length of 1.
	 * @method normalize
	 */
	p.normalize = function()
	{
		var oneOverLen = 1 / this.length();
		this.x *= oneOverLen;
		this.y *= oneOverLen;
	};

	/**
	 * Subtracts the x and y values of a point from this point.
	 * @method subtract
	 * @param other {Point} The point to subtract from this one
	 */
	p.subtract = function(other)
	{
		this.x -= other.x;
		this.y -= other.y;
	};

	/**
	 * Adds the x and y values of a point to this point.
	 * @method add
	 * @param other {Point} The point to add to this one
	 */
	p.add = function(other)
	{
		this.x += other.x;
		this.y += other.y;
	};

	/**
	 * Truncate the length of the point to a maximum.
	 * @method truncate
	 * @param maxLength {Number} The maximum length to allow in this point.
	 */
	p.truncate = function(maxLength)
	{
		var l = this.length();
		if (l > maxLength)
		{
			var maxOverLen = maxLength / l;
			this.x *= maxOverLen;
			this.y *= maxOverLen;
		}
	};

	/**
	 * Multiplies the x and y values of this point by a value.
	 * @method scaleBy
	 * @param value {Number} The value to scale by.
	 */
	p.scaleBy = function(value)
	{
		this.x *= value;
		this.y *= value;
	};

	/**
	 * Calculates the distance between this and another point.
	 * @method distance
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance.
	 */
	p.distance = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	};

	/**
	 * Calculates the squared distance between this and another point.
	 * @method distanceSq
	 * @param other {Point} The point to calculate the distance to.
	 * @return {Number} The distance squared.
	 */
	p.distanceSq = function(other)
	{
		var xDiff = this.x - other.x;
		var yDiff = this.y - other.y;
		return xDiff * xDiff + yDiff * yDiff;
	};

	Point.localToGlobal = function(displayObject, localX, localY, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = localX;
		outPoint.y = localY;
		return displayObject.toGlobal(outPoint, outPoint);
	};

	Point.globalToLocal = function(displayObject, globalX, globalY, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = globalX;
		outPoint.y = globalY;
		return displayObject.toLocal(outPoint, null, outPoint);
	};

	Point.localToLocal = function(sourceDisplayObject, targetDisplayObject, x, y, outPoint)
	{
		if (!outPoint)
			outPoint = new PIXI.Point();
		outPoint.x = x;
		outPoint.y = y;
		return targetDisplayObject.toLocal(outPoint, sourceDisplayObject, outPoint);
	};

	p.toString = function()
	{
		return "(" + this.x + ", " + this.y + ")";
	};

}());
/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	var RAD_TO_DEGREES = 180 / Math.PI;

	/**
	 * The Sector object can be used to specify a hit area for display objects.
	 * It represents a sector of a circle, with angles expressed in degrees going
	 * counterclockwise.
	 *
	 * @class Sector
	 * @constructor
	 * @param x {Number} The X coord of the center of the circle this sector is on
	 * @param y {Number} The Y coord of the center of the circle this sector is on
	 * @param radius {Number} The radius of the circle
	 * @param startAngle {Number} The starting angle of the sector, in degrees
	 * @param endAngle {Number} The ending angle of the sector, in degrees
	 */
	var Sector = function(x, y, radius, startAngle, endAngle)
	{
		/**
		 * @property x
		 * @type Number
		 * @default 0
		 */
		this.x = x || 0;

		/**
		 * @property y
		 * @type Number
		 * @default 0
		 */
		this.y = y || 0;

		/**
		 * @property radius
		 * @type Number
		 * @default 0
		 */
		this.radius = radius || 0;

		/**
		 * @property startAngle
		 * @type Number
		 * @default 0
		 */
		this.startAngle = startAngle || 0;
		//for math purposes, ensure that this is greater than 0
		while (this.startAngle < 0)
			this.startAngle += 360;

		/**
		 * @property endAngle
		 * @type Number
		 * @default 0
		 */
		this.endAngle = endAngle || 0;
		//for math purposes, ensure that this is greater than startAngle
		if (this.endAngle < this.startAngle)
			this.endAngle += 360;
	};

	var p = Sector.prototype;

	/**
	 * Creates a clone of this Sector instance
	 *
	 * @method clone
	 * @return {Sector} a copy of the polygon
	 */
	p.clone = function()
	{
		return new PIXI.Sector(this.x, this.y, this.radius, this.startAngle, this.endAngle);
	};

	/**
	 * Checks if the x, and y coords passed to this function are contained within this circle
	 *
	 * @method contains
	 * @param x {Number} The X coord of the point to test
	 * @param y {Number} The Y coord of the point to test
	 * @return {Boolean} if the x/y coords are within this polygon
	 */
	p.contains = function(x, y)
	{
		if (this.radius <= 0)
			return false;

		var dx = (this.x - x),
			dy = (this.y - y),
			r2 = this.radius * this.radius;

		dx *= dx;
		dy *= dy;

		if (dx + dy > r2) return false;

		var angle = Math.atan2(y - this.y, x - this.x) * RAD_TO_DEGREES;
		//make the angle in the same space as the sector
		while (angle < this.startAngle) angle += 360;
		return angle >= this.startAngle && angle <= this.endAngle;
	};

	// constructor
	p.constructor = Sector;

	namespace("PIXI").Sector = Sector;

}());
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
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var ColorAlphaTask = include('springroll.ColorAlphaTask'),
		Task = include('springroll.Task'),
		Texture = include('PIXI.Texture'),
		BaseTexture = include('PIXI.BaseTexture'),
		PixiUtils = include('PIXI.utils'),
		Application = include('springroll.Application');
	var PixiDisplay;

	/**
	 * TextureTask loads an image and sets it up for Pixi to use as a PIXI.Texture.
	 * @class TextureTask
	 * @constructor
	 * @private
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} [asset.image] The texture image path.
	 * @param {String} [asset.color] The color image path, if not using image property.
	 * @param {String} [asset.alpha] The alpha image path, if not using image property.
	 * @param {Boolean} [asset.cache=false] If we should cache the result - caching results in
	 *                                      caching in the global Pixi texture cache as well as
	 *                                      Application's asset cache.
	 * @param {String} [asset.id] The id of the task.
	 * @param {Function} [asset.complete] The callback to call when the load is completed.
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureTask = function(asset, fallbackId)
	{
		if (!PixiDisplay) PixiDisplay = include('springroll.pixi.PixiDisplay');

		Task.call(this, asset, fallbackId || asset.image);

		/**
		 * The atlas source path
		 * @property {String} image
		 */
		this.image = this.filter(asset.image);

		/**
		 * The atlas color source path
		 * @property {String} color
		 */
		this.color = this.filter(asset.color);

		/**
		 * The atlas alpha source path
		 * @property {String} alpha
		 */
		this.alpha = this.filter(asset.alpha);

		/**
		 * If the texture should be uploaded to the GPU immediately.
		 * @property {Boolean} uploadToGPU
		 */
		this.uploadToGPU = !!asset.uploadToGPU;
	};

	// Extend the base Task
	var p = Task.extend(TextureTask);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	TextureTask.test = function(asset)
	{
		return asset.type == "pixi" && (!!asset.image || (!!asset.alpha && !!asset.color));
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		this.loadImage(
		{}, callback);
	};

	/**
	 * Load the texture from the properties
	 * @method loadImage
	 * @param {Object} assets The assets object to load
	 * @param {Function} done Callback when complete, returns new TextureAtlas
	 * @param {Boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
	 *                                       because this task is still returning stuff to another
	 *                                       task.
	 */
	p.loadImage = function(assets, done, ignoreCacheSetting)
	{
		if (this.image)
		{
			assets._image = this.image;
		}
		else
		{
			assets._color = this.color;
			assets._alpha = this.alpha;
		}

		// Do the load
		this.load(assets, function(results)
		{
			var image;
			if (results._image)
			{
				image = results._image;
			}
			else
			{
				image = ColorAlphaTask.mergeAlpha(
					results._color,
					results._alpha
				);
			}

			//determine scale using SpringRoll's scale management
			var scale = this.original.scale;
			//if the scale doesn't exist, or is 1, then see if the devs are trying to use Pixi's
			//built in scale recognition
			if (!scale || scale === 1)
			{
				scale = PixiUtils.getResolutionOfUrl(this.image || this.color);
			}
			//create the Texture and BaseTexture
			var texture = new Texture(new BaseTexture(image, null, scale));
			texture.baseTexture.imageUrl = this.image;

			if (this.cache && !ignoreCacheSetting)
			{
				//for cache id, prefer task id, but if Pixi global texture cache is using urls, then
				//use that
				var id = this.id;
				//if pixi is expecting URLs, then use the URL
				if (!PixiUtils.useFilenamesForTextures)
				{
					//use color image if regular image is not available
					id = this.image || this.color;
				}
				//also add the frame to Pixi's global cache for fromFrame and fromImage functions
				PixiUtils.TextureCache[id] = texture;
				PixiUtils.BaseTextureCache[id] = texture.baseTexture;

				//set up a special destroy wrapper for this texture so that Application.instance.unload
				//works properly to completely unload it
				texture.__T_destroy = texture.destroy;
				texture.destroy = function()
				{
					if (this.__destroyed) return;
					this.__destroyed = true;
					//destroy the base texture as well
					this.__T_destroy(true);

					//remove it from the global texture cache, if relevant
					if (PixiUtils.TextureCache[id] == this)
						delete PixiUtils.TextureCache[id];
				};
			}
			if (this.uploadToGPU)
			{
				var displays = Application.instance.displays;
				for (var dispId in displays)
				{
					var display = displays[dispId];
					if (display instanceof PixiDisplay && display.isWebGL)
					{
						display.renderer.updateTexture(texture);
						break;
					}
				}
			}
			done(texture, results);
		}.bind(this));
	};

	/**
	 * Destroy this load task and don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);
	};

	// Assign to the namespace
	namespace('springroll.pixi').TextureTask = TextureTask;

}());
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
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		Texture = include('PIXI.Texture'),
		TextureAtlas = include('springroll.pixi.TextureAtlas'),
		PixiUtils = include('PIXI.utils');

	/**
	 * Internal class for loading a texture atlas for Pixi.
	 * @class TextureAtlasTask
	 * @extends springroll.pixi.TextureTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureAtlasTask = function(asset, fallbackId)
	{
		TextureTask.call(this, asset, fallbackId || asset.atlas);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);
	};

	// Reference to prototype
	var p = TextureTask.extend(TextureAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	TextureAtlasTask.test = function(asset)
	{
		// atlas data and an image or color/alpha split
		return !!asset.atlas && TextureTask.test(asset);
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadAtlas(
		{}, callback);
	};

	/**
	 * Load a texture atlas from the properties
	 * @method loadAtlas
	 * @param {Object} assets The assets object to load
	 * @param {Function} done Callback when complete, returns new TextureAtlas
	 * @param {Boolean} [ignoreCacheSetting] If the setting to cache results should be ignored
	 *                                       because this task is still returning stuff to another
	 *                                       task.
	 */
	p.loadAtlas = function(assets, done, ignoreCacheSetting)
	{
		assets._atlas = this.atlas;

		this.loadImage(assets, function(texture, results)
		{
			var data = results._atlas;
			var atlas = new TextureAtlas(
				texture,
				data,
				this.cache && !ignoreCacheSetting
			);
			//if the spritesheet JSON had a scale in it, use that to override
			//whatever settings came from loading, as the texture atlas size is more important
			if (data.meta && data.meta.scale && parseFloat(data.meta.scale) != 1)
			{
				texture.baseTexture.resolution = parseFloat(results._atlas.meta.scale);
				texture.baseTexture.update();
			}
			done(atlas, results);
		}.bind(this), true);
	};

	// Assign to namespace
	namespace('springroll.pixi').TextureAtlasTask = TextureAtlasTask;

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var TextureTask = include('springroll.pixi.TextureTask'),
		Texture = include('PIXI.Texture'),
		Rectangle = include('PIXI.Rectangle'),
		BitmapText = include('PIXI.extras.BitmapText', false),
		PixiUtils = include('PIXI.utils');

	if (!BitmapText) return;

	/**
	 * Internal class for loading a bitmap font for Pixi.
	 * @class BitmapFontTask
	 * @extends springroll.pixi.TextureTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Must be "pixi" to signify that this asset should be parsed
	 *                            specifically for Pixi.
	 * @param {String} asset.font The BitmapFont source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var BitmapFontTask = function(asset)
	{
		TextureTask.call(this, asset, asset.font);

		/**
		 * The BitmapFont data source path
		 * @property {String} font
		 */
		this.font = this.filter(asset.font);
	};

	// Reference to prototype
	var p = TextureTask.extend(BitmapFontTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	BitmapFontTask.test = function(asset)
	{
		// atlas data and an image or color/alpha split
		return !!asset.font && TextureTask.test(asset);
	};

	/*
    NOTE: PixiV2 did the following to ensure successful getting of XML data in all situations
    we may need to have PreloadJS do something similar, or perhaps have it recognize .fnt as .xml
    at least
	
    var responseXML = this.ajaxRequest.responseXML || this.ajaxRequest.response || this.ajaxRequest.responseText;
    if(typeof responseXML === 'string')
    {
    	if(responseXML.xml)
    		responseXML = responseXML.xml;
    	else
    	{
    		var text = responseXML;
    		if (window.DOMParser)
    		{
    			var parser = new DOMParser();
    			responseXML = parser.parseFromString(text,'text/xml');
    		}
    		else // Internet Explorer
    		{
    			responseXML = new window.ActiveXObject('Microsoft.XMLDOM');
    			responseXML.async=false;
    			responseXML.loadXML(text);
    		}
    	}
    }
     */

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		this.loadImage(
		{
			_font: this.font
		}, function(texture, results)
		{
			var data = results._font;

			var font = {};

			var info = data.getElementsByTagName('info')[0];
			var common = data.getElementsByTagName('common')[0];

			font.font = info.getAttribute('face');
			font.size = parseInt(info.getAttribute('size'), 10);
			font.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
			font.chars = {};

			//parse letters
			var letters = data.getElementsByTagName('char');

			var i;
			for (i = 0; i < letters.length; i++)
			{
				var l = letters[i];
				var charCode = parseInt(l.getAttribute('id'), 10);

				var textureRect = new Rectangle(
					parseInt(l.getAttribute('x'), 10) + texture.frame.x,
					parseInt(l.getAttribute('y'), 10) + texture.frame.y,
					parseInt(l.getAttribute('width'), 10),
					parseInt(l.getAttribute('height'), 10)
				);

				font.chars[charCode] = {
					xOffset: parseInt(l.getAttribute('xoffset'), 10),
					yOffset: parseInt(l.getAttribute('yoffset'), 10),
					xAdvance: parseInt(l.getAttribute('xadvance'), 10),
					kerning:
					{},
					texture: new Texture(texture.baseTexture, textureRect)
				};
			}

			//parse kernings
			var kernings = data.getElementsByTagName('kerning');
			for (i = 0; i < kernings.length; i++)
			{
				var k = kernings[i];
				var first = parseInt(k.getAttribute('first'), 10);
				var second = parseInt(k.getAttribute('second'), 10);
				var amount = parseInt(k.getAttribute('amount'), 10);

				font.chars[second].kerning[first] = amount;
			}

			// I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
			// but it's very likely to change
			if (this.cache && BitmapText.fonts)
				BitmapText.fonts[font.font] = font;

			//add a cleanup function
			font.destroy = function()
			{
				font.chars = null;
				texture.destroy();
			};

			callback(font, results);
		}.bind(this), true);
	};

	// Assign to namespace
	namespace('springroll.pixi').BitmapFontTask = BitmapFontTask;

}());
/**
 * @module PIXI Display
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		this.assetManager.register('springroll.pixi.TextureTask', 60);
		this.assetManager.register('springroll.pixi.TextureAtlasTask', 70);
		this.assetManager.register('springroll.pixi.BitmapFontTask', 80);


		this.once('displayAdded', function(display)
		{
			var options = this.options;
			if (!options.defaultAssetType && display instanceof include('springroll.PixiDisplay'))
			{
				options.defaultAssetType = 'pixi';
			}
		});
	};

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	/**
	 * Provide a normalized way to get size, position, scale values
	 * as well as provide reference for different geometry classes.
	 * @class DisplayAdapter
	 */
	var DisplayAdapter = {};

	/**
	 * The geometry class for Circle
	 * @property {Function} Circle
	 * @readOnly
	 * @static
	 * @default PIXI.Circle
	 */
	DisplayAdapter.Circle = include('PIXI.Circle');

	/**
	 * The geometry class for Ellipse
	 * @property {Function} Ellipse
	 * @readOnly
	 * @static
	 * @default PIXI.Ellipse
	 */
	DisplayAdapter.Ellipse = include('PIXI.Ellipse');

	/**
	 * The geometry class for Rectangle
	 * @property {Function} Rectangle
	 * @readOnly
	 * @static
	 * @default PIXI.Rectangle
	 */
	DisplayAdapter.Rectangle = include('PIXI.Rectangle');

	/**
	 * The geometry class for Sector
	 * @property {Function} Sector
	 * @readOnly
	 * @static
	 * @default PIXI.Sector
	 */
	DisplayAdapter.Sector = include('PIXI.Sector');

	/**
	 * The geometry class for point
	 * @property {Function} Point
	 * @readOnly
	 * @static
	 * @default PIXI.Point
	 */
	DisplayAdapter.Point = include('PIXI.Point');

	/**
	 * The geometry class for Polygon
	 * @property {Function} Polygon
	 * @readOnly
	 * @static
	 * @default PIXI.Polygon
	 */
	DisplayAdapter.Polygon = include('PIXI.Polygon');

	/**
	 * If the rotation is expressed in radians
	 * @property {Boolean} useRadians
	 * @readOnly
	 * @static
	 * @default true
	 */
	DisplayAdapter.useRadians = true;

	/**
	 * Gets the object's boundaries in its local coordinate space, without any scaling or
	 * rotation applied.
	 * @method getLocalBounds
	 * @static
	 * @param {PIXI.DisplayObject} object The createjs display object
	 * @return {PIXI.Rectangle} A rectangle with additional right and bottom properties.
	 */
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds;
		var width = object.width;
		var height = object.height;
		if (width && height)
		{
			bounds = new PIXI.Rectangle(-object.pivot.x, -object.pivot.y, width / object.scale.x, height / object.scale.y);
		}
		else
		{
			bounds = new PIXI.Rectangle();
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	 * Normalize the object scale
	 * @method getScale
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {String} [direction] Either "x" or "y" to return a specific value
	 * @return {object|Number} A scale object with x and y keys or a single number if direction is set
	 */
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.scale[direction];
		}
		return object.scale;
	};

	/**
	 * Normalize the object position setting
	 * @method setPosition
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {object|Number} position The position object or the value
	 * 		if the direction is set.
	 * @param {Number} [position.x] The x value
	 * @param {Number} [position.y] The y value
	 * @param {String} [direction] Either "x" or "y" value
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object.position[direction] = position;
		}
		else
		{
			if (position.x !== undefined) object.position.x = position.x;
			if (position.y !== undefined) object.position.y = position.y;
		}
		return object;
	};

	/**
	 * Normalize the object position getting
	 * @method getPosition
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI display object
	 * @param {String} [direction] Either "x" or "y", default is an object of both
	 * @return {Object|Number} The position as an object with x and y keys if no direction
	 *		value is set, or the value of the specific direction
	 */
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object.position[direction];
		}
		return object.position;
	};

	/**
	 * Normalize the object scale setting
	 * @method setScale
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {Number} scale The scaling object or scale value for x and y
	 * @param {String} [direction] Either "x" or "y" if setting a specific value, default
	 * 		sets both the scale x and scale y.
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object.scale[direction] = scale;
		}
		else
		{
			object.scale.x = object.scale.y = scale;
		}
		return object;
	};

	/**
	 * Set the pivot or registration point of an object
	 * @method setPivot
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {object|Number} pivot The object pivot point or the value if the direction is set
	 * @param {Number} [pivot.x] The x position of the pivot point
	 * @param {Number} [pivot.y] The y position of the pivot point
	 * @param {String} [direction] Either "x" or "y" the value for specific direction, default
	 * 		will set using the object.
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object.pivot[direction] = pivot;
		}
		object.pivot = pivot;
		return object;
	};

	/**
	 * Set the hit area of the shape
	 * @method setHitArea
	 * @static
	 * @param {PIXI.DisplayObject} object The PIXI Display object
	 * @param {Object} shape The geometry object
	 * @return {PIXI.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitArea = shape;
		return object;
	};

	/**
	 * Get the original size of a bitmap
	 * @method getBitmapSize
	 * @static
	 * @param {PIXI.Bitmap} bitmap The bitmap to measure
	 * @return {object} The width (w) and height (h) of the actual bitmap size
	 */
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			h: bitmap.height / bitmap.scale.y,
			w: bitmap.width / bitmap.scale.x
		};
	};

	/**
	 * Remove all children from a display object
	 * @method removeChildren
	 * @static
	 * @param {PIXI.DisplayObjectContainer} container The display object container
	 */
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeChildren();
	};

	/**
	 * If a container contains a child
	 * @method contains
	 * @static
	 * @param  {PIXI.DisplayObjectContainer} container The container
	 * @param  {PIXI.DisplayObject} child  The object to test
	 * @return {Boolean} If the child contained within the container
	 */
	DisplayAdapter.contains = function(container, child)
	{
		while (child)
		{
			if (child == container)
			{
				return true;
			}
			child = child.parent;
		}
		return false;
	};

	// Assign to namespace
	namespace('springroll.pixi').DisplayAdapter = DisplayAdapter;

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{

	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Container = include('PIXI.Container'),
		CanvasRenderer = include('PIXI.CanvasRenderer'),
		WebGLRenderer = include('PIXI.WebGLRenderer'),
		autoDetectRenderer = include('PIXI.autoDetectRenderer');

	/**
	 * PixiDisplay is a display plugin for the springroll Framework
	 * that uses the Pixi library for rendering.
	 *
	 * @class PixiDisplay
	 * @extends springroll.AbstractDisplay
	 * @constructor
	 * @param {String} id The id of the canvas element on the page to draw to.
	 * @param {Object} options The setup data for the Pixi stage.
	 * @param {String} [options.forceContext=null] If a specific renderer should be used instead
	 *                                             of WebGL falling back to Canvas. Use "webgl" or
	 *                                             "canvas2d" to specify a renderer.
	 * @param {Boolean} [options.clearView=false] If the canvas should be wiped between renders.
	 * @param {uint} [options.backgroundColor=0x000000] The background color of the stage (if
	 *                                                  it is not transparent).
	 * @param {Boolean} [options.transparent=false] If the stage should be transparent.
	 * @param {Boolean} [options.antiAlias=false] If the WebGL renderer should use anti-aliasing.
	 * @param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all
	 *                                               images as pre-multiplied alpha. In most
	 *                                               cases, you probably do not want to set this
	 *                                               option to true.
	 * @param {Boolean} [options.preserveDrawingBuffer=false] Set this to true if you want to call
	 *                                                        toDataUrl on the WebGL rendering
	 *                                                        context.
	 * @param {Boolean} [options.autoPreventDefault=true] If preventDefault() should be called on
	 *                                                    all touch events and mousedown events.
	 */
	var PixiDisplay = function(id, options)
	{
		AbstractDisplay.call(this, id, options);

		options = options ||
		{};

		/**
		 * If the display should keep mouse move events running when the display is disabled.
		 * @property {Boolean} keepMouseover
		 * @public
		 */
		this.keepMouseover = options.keepMouseover || false;

		/**
		 * If preventDefault() should be called on all touch events and mousedown events. Defaults
		 * to true.
		 * @property {Boolean} _autoPreventDefault
		 * @private
		 */
		this._autoPreventDefault = options.hasOwnProperty("autoPreventDefault") ?
			options.autoPreventDefault : true;

		/**
		 * The rendering library's stage element, the root display object
		 * @property {PIXI.Stage} stage
		 * @readOnly
		 * @public
		 */
		this.stage = new Container();

		/**
		 * The Pixi renderer.
		 * @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer
		 * @readOnly
		 * @public
		 */
		this.renderer = null;

		//make the renderer
		var rendererOptions = {
			view: this.canvas,
			transparent: !!options.transparent,
			antialias: !!options.antiAlias,
			preserveDrawingBuffer: !!options.preserveDrawingBuffer,
			clearBeforeRender: !!options.clearView,
			backgroundColor: options.backgroundColor || 0,
			//this defaults to false, but we never want it to auto resize.
			autoResize: false
		};
		var preMultAlpha = !!options.preMultAlpha;
		if (rendererOptions.transparent && !preMultAlpha)
			rendererOptions.transparent = "notMultiplied";

		//check for IE11 because it tends to have WebGL problems (especially older versions)
		//if we find it, then make Pixi use to the canvas renderer instead
		if (options.forceContext != "webgl")
		{
			var ua = window.navigator.userAgent;
			if (ua.indexOf("Trident/7.0") > 0)
				options.forceContext = "canvas2d";
		}
		if (options.forceContext == "canvas2d")
		{
			this.renderer = new CanvasRenderer(this.width, this.height, rendererOptions);
		}
		else if (options.forceContext == "webgl")
		{
			this.renderer = new WebGLRenderer(this.width, this.height, rendererOptions);
		}
		else
		{
			this.renderer = autoDetectRenderer(this.width, this.height, rendererOptions);
		}

		/**
		 * If Pixi is being rendered with WebGL.
		 * @property {Boolean} isWebGL
		 * @readOnly
		 * @public
		 */
		this.isWebGL = this.renderer instanceof WebGLRenderer;

		// Set display adapter classes
		this.adapter = include('springroll.pixi.DisplayAdapter');

		// Initialize the autoPreventDefault
		this.autoPreventDefault = this._autoPreventDefault;
	};

	var s = AbstractDisplay.prototype;
	var p = AbstractDisplay.extend(PixiDisplay);

	/**
	 * If input is enabled on the stage for this display. The default is true.
	 * @property {Boolean} enabled
	 * @public
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);

			var interactionManager = this.renderer.plugins.interaction;
			if (!interactionManager) return;
			if (value)
			{
				//add events to the interaction manager's target
				interactionManager.setTargetElement(this.canvas);
			}
			else
			{
				//remove event listeners
				if (this.keepMouseover)
					interactionManager.removeClickEvents();
				else
					interactionManager.removeEvents();
			}
		}
	});

	/**
	 * If preventDefault() should be called on all touch events and mousedown events. Defaults
	 * to true.
	 * @property {Boolean} autoPreventDefault
	 * @public
	 */
	Object.defineProperty(p, "autoPreventDefault",
	{
		get: function()
		{
			return this._autoPreventDefault;
		},
		set: function(value)
		{
			this._autoPreventDefault = !!value;
			var interactionManager = this.renderer.plugins.interaction;
			if (!interactionManager) return;
			interactionManager.autoPreventDefault = this._autoPreventDefault;
		}
	});

	/**
	 * Resizes the canvas and the renderer. This is only called by the Application.
	 * @method resize
	 * @param {int} width The width that the display should be
	 * @param {int} height The height that the display should be
	 */
	p.resize = function(width, height)
	{
		s.resize.call(this, width, height);
		this.renderer.resize(width, height);
	};

	/**
	 * Updates the stage and draws it. This is only called by the Application.
	 * This method does nothing if paused is true or visible is false.
	 * @method render
	 * @param {int} elapsed
	 * @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	 */
	p.render = function(elapsed, force)
	{
		if (force || (!this.paused && this._visible))
		{
			this.renderer.render(this.stage);
		}
	};

	/**
	 * Destroys the display. This method is called by the Application and should
	 * not be called directly, use Application.removeDisplay(id).
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stage.destroy();

		s.destroy.call(this);

		this.renderer.destroy();
		this.renderer = null;
	};

	// Assign to the global namespace
	namespace('springroll').PixiDisplay = PixiDisplay;
	namespace('springroll.pixi').PixiDisplay = PixiDisplay;

}());
/**
 * @module PIXI Display
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ticker = include('PIXI.ticker.shared', false),
		ApplicationPlugin = include('springroll.ApplicationPlugin');

	if (!ticker) return;

	/**
	 *	@class Application
	 */
	var plugin = new ApplicationPlugin();

	/**
	 *  Keep track of total time elapsed to feed to the Ticker
	 *  @property {Number} _time
	 *  @private
	 *  @default 0
	 */
	var _time = 0;

	ticker.autoStart = false;
	ticker.stop();

	plugin.setup = function()
	{
		//update early so that the InteractionManager updates in response to mouse movements
		//and what the user saw the previous frame
		this.on('update', updateTicker, 300);
	};

	function updateTicker(elapsed)
	{
		_time += elapsed;
		ticker.update(_time);
	}

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(Object)
{
	// Include classes
	var PixiDisplay = include('springroll.pixi.PixiDisplay'),
		Application = include('springroll.Application');

	/**
	 * @class PixiDisplay
	 */
	/**
	 * See {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @property {springroll.Animator} animator
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(PixiDisplay.prototype, 'animator',
	{
		get: function()
		{
			if (true) console.warn('PixiDisplay\'s animator property is now deprecated, please use the app property, e.g. : app.animator');
			return Application.instance.animator;
		}
	});

}(Object));