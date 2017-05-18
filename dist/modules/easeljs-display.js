/*! SpringRoll 1.0.3 */
/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	var Container = include('createjs.Container', false);

	if (!Container) return;

	/**
	 * Mixins for the CreateJS Container class
	 * @class Container
	 */
	var p = Container.prototype;

	/**
	 * Does a cache by the nominalBounds set from Flash
	 * @method cacheByBounds
	 * @param {int} [buffer=0] The space around the nominal bounds to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.cacheByBounds = function(buffer, scale)
	{
		this.cacheByRect(this.nominalBounds, buffer, scale);
	};

	/**
	 * Does a cache by a given rectangle
	 * @method cacheByRect
	 * @param {createjs.Rectangle} rect The rectangle to cache with.
	 * @param {int} [buffer=0] Additional space around the rectangle to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.cacheByRect = function(rect, buffer, scale)
	{
		buffer = (buffer === undefined || buffer === null) ? 0 : buffer;
		scale = scale > 0 ? scale : 1;
		this.cache(
			rect.x - buffer,
			rect.y - buffer,
			rect.width + (buffer * 2),
			rect.height + (buffer * 2),
			scale
		);
	};

}());
/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	// Try to include MovieClip, movieclip with CreateJS is
	// an optional library from easeljs. We should try to
	// include it and silently fail if we don't have it
	var MovieClip = include('createjs.MovieClip', false);

	if (!MovieClip) return;

	/**
	 * Mixins for the CreateJS MovieClip class
	 * @class MovieClip
	 */
	var p = MovieClip.prototype;

	/**
	 * Combines gotoAndStop and cache in createjs to cache right away. This caches by the bounds
	 * exported from Flash, preferring frameBounds and falling back to nominalBounds.
	 * @method gotoAndCacheByBounds
	 * @param {String|int} [frame=0] The 0-index frame number or frame label
	 * @param {int} [buffer=0] The space around the bounds to include in cache image
	 * @param {Number} [scale=1] The scale to cache the container by.
	 */
	p.gotoAndCacheByBounds = function(frame, buffer, scale)
	{
		frame = (frame === undefined) ? 0 : frame;
		this.gotoAndStop(frame);
		var rect = this.frameBounds ? this.frameBounds[this.currentFrame] : this.nominalBounds;
		if (rect) //only cache if there is content on this frame
			this.cacheByRect(rect, buffer, scale);
		else
			this.uncache(); //prevent leftover cached data from showing up on empty frames
	};

}());
/**
 * @module EaselJS Display
 * @namespace createjs
 * @requires Core
 */
(function(undefined)
{
	/**
	 * Mixins for the CreateJS Point class, which include methods
	 * for calculating the dot product, length, distance, normalize, etc.
	 * @class Point
	 */

	var p = include("createjs.Point", false);
	if (!p) return;

	p = p.prototype;

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

}());
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
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Bitmap = include('createjs.Bitmap'),
		Container = include('createjs.Container'),
		Rectangle = include('createjs.Rectangle');

	/**
	 * Designed to provide utility related to Bitmaps.
	 * @class BitmapUtils
	 */
	var BitmapUtils = {};

	/**
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that pulls the image from a spritesheet. This function should be
	 * called after you have loaded up javascript assets exported from Flash,
	 * but before you have instantiated those assets.
	 *
	 * @method loadSpriteSheet
	 * @static
	 * @param {Object} spritesheetData The JSON object describing the frames in the atlas. This is
	 *                                 expected to fit the JSON Hash format as exported from
	 *                                 TexturePacker.
	 * @param {Image|HTMLCanvasElement} spritesheetImage The spritesheet image that contains all of
	 *                                                   the frames.
	 * @param {Number} [scale=1] The scale to apply to all sprites from the spritesheet. For
	 *                           example, a half sized spritesheet should have a scale of 2.
	 * @param {String} [libName='lib'] The global dictionary to add items to.
	 */
	BitmapUtils.loadSpriteSheet = function(spritesheetData, spritesheetImage, scale, libName)
	{
		if (scale > 0)
		{
			// Do nothing
		}
		else if (spritesheetData.meta && parseFloat(spritesheetData.meta.scale))
		{
			// look for scale in spritesheet data
			scale = 1 / parseFloat(spritesheetData.meta.scale);
		}
		else
		{
			// scale should default to 1
			scale = 1;
		}
		if (!libName)
			libName = "lib";

		var frameDict = spritesheetData.frames || spritesheetData;
		// TexturePacker outputs frames with (not) swapped width & height when rotated, so we need to
		// swap them ourselves
		var swapFrameSize = spritesheetData.meta &&
			spritesheetData.meta.app == "http://www.codeandweb.com/texturepacker";

		var lib = window[libName];
		for (var key in frameDict)
		{
			var frame = frameDict[key];
			var index = key.indexOf(".");
			if (index > 0)
			{
				// remove any file extension from the frame id
				key = key.substring(0, index);
			}
			var bitmap = lib[key];

			/* jshint ignore:start */
			var newBitmap = lib[key] = function()
			{
				Container.call(this);
				var child = new Bitmap(this._image);
				this.addChild(child);
				child.sourceRect = this._frameRect;
				var s = this._scale;
				child.setTransform(this._frameOffsetX * s, this._frameOffsetY * s, s, s);
				if (this._rotated)
				{
					child.rotation = -90;
					//scale should not be included with regX
					child.regX = child.sourceRect.width;
				}
			};
			/* jshint ignore:end */

			var p = newBitmap.prototype = new Container();

			//give it a reference to the spritesheet
			p._image = spritesheetImage;

			//tell it what scale to use on the Bitmap to bring it to normal size
			p._scale = scale;

			var rotated = frame.rotated;
			if (rotated)
			{
				p._rotated = true;
			}
			var frameRect = frame.frame;

			//save the source rectangle of the sprite
			p._frameRect = new Rectangle(
				frameRect.x,
				frameRect.y, (rotated && swapFrameSize) ? frameRect.h : frameRect.w, (rotated && swapFrameSize) ? frameRect.w : frameRect.h
			);

			//if the sprite is trimmed, then save the amount that was trimmed
			//off the left and top sides
			if (frame.trimmed)
			{
				p._frameOffsetX = frame.spriteSourceSize.x;
				p._frameOffsetY = frame.spriteSourceSize.y;
			}
			else
			{
				p._frameOffsetX = p._frameOffsetY = 0;
			}

			if (bitmap && bitmap.prototype.nominalBounds)
			{
				//keep the nominal bounds from the original bitmap, if it existed
				p.nominalBounds = bitmap.prototype.nominalBounds;
			}
			else
			{
				p.nominalBounds = new Rectangle(0, 0,
					frame.sourceSize.w * scale,
					frame.sourceSize.h * scale
				);
			}
		}
	};

	/**
	 * Creates a faux Bitmap from a TextureAtlas entry.
	 * @method bitmapFromTexture
	 * @static
	 * @param {Texture} texture The texture from a TextureAtlas to create the Bitmap analogue from.
	 * @param {Number} scale A scale for the spritesheet to undo, e.g. a half sized spritesheet
	 *                     gets a scale of 2 to restore it to normal size.
	 */
	BitmapUtils.bitmapFromTexture = function(texture, scale)
	{
		if (scale > 0)
		{
			// Do nothing
		}
		else
		{
			// scale should default to 1
			scale = 1;
		}
		var output = new Container();
		var bitmap = new Bitmap(texture.image);
		output.addChild(bitmap);
		bitmap.sourceRect = texture.frame;
		bitmap.setTransform(
			texture.offset.x * scale,
			texture.offset.y * scale,
			scale,
			scale
		);

		if (texture.rotated)
		{
			bitmap.rotation = -90;
			bitmap.regX = bitmap.sourceRect.width;
		}
		//set up a nominal bounds to be kind
		output.nominalBounds = new Rectangle(0, 0,
			texture.width * scale,
			texture.height * scale
		);
		return output;
	};

	/**
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that uses a scaled bitmap, so you can load up smaller bitmaps behind
	 * the scenes that are scaled back up to normal size, or high res bitmaps
	 * that are scaled down.
	 *
	 * @method replaceWithScaledBitmap
	 * @static
	 * @param {String|Object} idOrDict A dictionary of Bitmap ids to replace, or a single id.
	 * @param {Number} [scale=1] The scale to apply to the image(s).
	 * @param {String} [libName='lib'] The global dictionary to add items to.
	 */
	BitmapUtils.replaceWithScaledBitmap = function(idOrDict, scale, libName)
	{
		//scale is required, but it doesn't hurt to check - also, don't bother for a scale of 1
		if (scale != 1 && scale > 0)
		{
			// Do nothing
		}
		else
		{
			return;
		}
		if (!libName)
			libName = "lib";

		var key, bitmap, newBitmap, p;
		var lib = window[libName];
		if (typeof idOrDict == "string")
		{
			key = idOrDict;
			bitmap = lib[key];
			if (bitmap)
			{
				/* jshint ignore:start */
				newBitmap = lib[key] = function()
				{
					Container.call(this);
					var child = new this._oldBM();
					this.addChild(child);
					child.setTransform(0, 0, this._scale, this._scale);
				};
				/* jshint ignore:end */
				p = newBitmap.prototype = new Container();
				p._oldBM = bitmap; //give it a reference to the Bitmap
				p._scale = scale; //tell it what scale to use on the Bitmap to bring it to normal size
				p.nominalBounds = bitmap.prototype.nominalBounds; //keep the nominal bounds
			}
		}
		else
		{
			for (key in idOrDict)
			{
				bitmap = lib[key];
				if (bitmap)
				{
					/* jshint ignore:start */
					newBitmap = lib[key] = function()
					{
						Container.call(this);
						var child = new this._oldBM();
						this.addChild(child);
						child.setTransform(0, 0, this._scale, this._scale);
					};
					/* jshint ignore:end */
					p = newBitmap.prototype = new Container();
					p._oldBM = bitmap; //give it a reference to the Bitmap
					p._scale = scale; //tell it what scale to use on the Bitmap to bring it to normal size
					p.nominalBounds = bitmap.prototype.nominalBounds; //keep the nominal bounds
				}
			}
		}
	};

	namespace("createjs").BitmapUtils = BitmapUtils;
	namespace("springroll.easeljs").BitmapUtils = BitmapUtils;
}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(undefined)
{
	var Debug;

	/**
	 * Handles the Asset loading for Flash Art takes care of unloading
	 * @class FlashArt
	 * @constructor
	 * @private
	 * @param {String} id The asset id
	 * @param {NodeElement} dom The `<script>` element added to the document
	 * @param {String} [libName='lib'] The window parameter name
	 */
	var FlashArt = function(id, dom, libName)
	{
		if (true && Debug === undefined)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 * Reference to the node element
		 * @property {NodeElement} dom
		 */
		this.dom = dom;

		/**
		 * The collection of loaded symbols by name
		 * @property {Array} symbols
		 */
		this.symbols = [];

		/**
		 * The name of the output lib name
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = libName || 'lib';

		/**
		 * The name of the output lib name
		 * @property {String} id
		 */
		this.id = id;

		// Pare the dome object
		this.parseSymbols(dom.text);
	};

	// Reference to the prototype
	var p = extend(FlashArt);

	/**
	 * The collection of all symbols and assets
	 * @property {Object} globalSymbols
	 * @static
	 * @private
	 */
	FlashArt.globalSymbols = {};

	/**
	 * Get the name of all the library elements of the dom text
	 * @method parseSymbols
	 * @param {String} text The DOM text contents
	 */
	p.parseSymbols = function(text)
	{
		// split into the initialization functions, that take 'lib' as a parameter
		var textArray = text.split(/[\(!]function\s*\(/);

		var globalSymbols = FlashArt.globalSymbols;
		// go through each initialization function
		for (var i = 0; i < textArray.length; ++i)
		{
			text = textArray[i];
			if (!text) continue;

			// determine what the 'lib' parameter has been minified into
			var libName = text.substring(0, text.indexOf(","));
			if (!libName) continue;

			// get all the things that are 'lib.X = <stuff>'
			var varFinder = new RegExp("\\(" + libName + ".(\\w+)\\s*=", "g");
			var foundName = varFinder.exec(text);
			var assetId;

			while (foundName)
			{
				assetId = foundName[1];

				// Warn about collisions with assets that already exist
				if (true && Debug && globalSymbols[assetId])
				{
					Debug.warn(
						"Flash Asset Collision: asset '" + this.id +
						"' wants to create 'lib." + assetId +
						"' which is already created by asset '" +
						FlashArt.globalSymbols[assetId] + "'"
					);
				}

				// keep track of the asset id responsible
				this.symbols.push(assetId);
				globalSymbols[assetId] = this.id;
				foundName = varFinder.exec(text);
			}
		}
	};

	/**
	 * Cleanup the Flash library that's been loaded
	 * @method destroy
	 */
	p.destroy = function()
	{
		// remove the <script> element from the stage
		this.dom.parentNode.removeChild(this.dom);
		this.dom = null;

		// Delete the elements
		var globalSymbols = FlashArt.globalSymbols;
		var lib = window[this.libName];
		this.symbols.forEach(function(id)
		{
			delete globalSymbols[id];
			delete lib[id];
		});
		this.symbols = null;
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArt = FlashArt;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		FlashArt = include('springroll.easeljs.FlashArt'),
		Application = include('springroll.Application'),
		BitmapUtils = include('springroll.easeljs.BitmapUtils');

	/**
	 * Loads javascript art exported from Flash, with special care taken to allow images to be
	 * handled properly and to attempt to avoid library definition collisions between different
	 * pieces of art.
	 * @class FlashArtTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {String} asset.format Asset format must be "springroll.easeljs.FlashArt"
	 * @param {String} asset.src The source
	 * @param {Array} [asset.images] An array of Image, TextureAtlas, or SpriteSheet assets to load
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libName='lib'] The global window object for symbols
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtTask = function(asset)
	{
		Task.call(this, asset, asset.src);

		/**
		 * The path to the flash asset
		 * @property {String} src
		 */
		this.src = this.filter(asset.src);

		/**
		 * Any image, atlas, or SpriteSheet assets that should be loaded along with this piece
		 * of flash art.
		 * @property {Array} images
		 */
		this.images = asset.images;

		this.atlas = this.filter(asset.atlas);

		this.image = this.filter(asset.image);

		this.color = this.filter(asset.color);

		this.alpha = this.filter(asset.alpha);

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';

		/**
		 * The name of the window object images hang on
		 * @property {String} imagesName
		 * @default 'images'
		 */
		this.imagesName = asset.imagesName || 'images';
	};

	// Reference to prototype
	var p = Task.extend(FlashArtTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtTask.test = function(asset)
	{
		return asset.src &&
			asset.src.search(/\.js$/i) > -1 &&
			asset.type == "easeljs" &&
			asset.format == "springroll.easeljs.FlashArt";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var images = [];
		var atlas, assetCount = 0;
		//handle the deprecated format
		if (this.atlas)
		{
			atlas = {
				atlas: this.atlas,
				id: "asset_" + (assetCount++),
				type: "easeljs",
				format: "FlashAtlas",
				libName: this.libName
			};
			if (this.image)
				atlas.image = this.image;
			else
			{
				atlas.alpha = this.alpha;
				atlas.color = this.color;
			}
			images.push(atlas);
		}
		else if (this.images)
		{
			var asset;
			for (var i = 0; i < this.images.length; ++i)
			{
				//check for texture atlases from TexturePacker or similar things
				if (this.images[i].atlas)
				{
					asset = this.images[i];
					atlas = {
						atlas: this.filter(asset.atlas),
						id: "asset_" + (assetCount++),
						type: "easeljs",
						format: "FlashAtlas",
						libName: this.libName
					};
					if (asset.image)
						atlas.image = this.filter(asset.image);
					else
					{
						atlas.alpha = this.filter(asset.alpha);
						atlas.color = this.filter(asset.color);
					}
					images.push(atlas);
				}
				//Check for EaselJS SpriteSheets
				else if (this.images[i].format == "createjs.SpriteSheet")
				{
					asset = this.images[i].clone();
					images.push(asset);
					if (!asset.type)
						asset.type = "easeljs";
					if (!asset.id)
					{
						var src = asset.src;
						src = src.substr(0, src.lastIndexOf("."));
						src = src.substr(src.lastIndexOf("/") + 1);
						asset.id = src;
					}
				}
				//standard images
				else
				{
					//check for urls
					if (typeof this.images[i] == "string")
						asset = {
							src: this.filter(this.images[i])
						};
					//and full tasks
					else
						asset = this.images[i].clone();
					//ensure an ID for these
					if (!asset.id)
					{
						var fallbackId = asset.src || asset.color;
						// Remove the file extension
						var extIndex = fallbackId.lastIndexOf('.');
						if (extIndex > -1)
						{
							fallbackId = fallbackId.substr(0, extIndex);
						}
						// Check for the last folder slash then remove it
						var slashIndex = fallbackId.lastIndexOf('/');
						if (slashIndex > -1)
						{
							fallbackId = fallbackId.substr(slashIndex + 1);
						}
						asset.id = fallbackId;
					}
					//also ensure that they are EaselJS Image assets
					asset.type = "easeljs";
					asset.format = "FlashImage";
					asset.imagesName = this.imagesName;
					images.push(asset);
				}
			}
		}

		var assets = {
			_flash: this.src
		};
		if (images.length)
			assets._images = {
				assets: images
			};

		// Load all the assets
		Application.instance.load(assets, function(results)
		{
			var art = new FlashArt(
				this.id,
				results._flash,
				this.libName
			);

			var images = results._images;
			if (images)
			{
				var image;
				var objectsToDestroy = [];
				var globalImages = namespace(this.imagesName);

				for (var id in images)
				{
					var result = images[id];
					//save the item for cleanup
					objectsToDestroy.push(result);
					//look for individual images
					if (result.image && result.scale)
					{
						//scale asset if needed
						if (result.scale != 1)
							BitmapUtils.replaceWithScaledBitmap(id, 1 / result.scale, this.libName);
					}
					//otherwise the result is a SpriteSheet or the result of a FlashArtAtlasTask
					else if (result.create)
					{
						//FlashArtAtlasTasks have delayed asset generation to ensure that it doesn't
						//interfere with the loading of the javascript that it overrides
						result.create();
					}
				}

				art._orig_destroy = art.destroy;
				art.destroy = function()
				{
					var i;
					for (i = objectsToDestroy.length - 1; i >= 0; --i)
					{
						if (objectsToDestroy[i].destroy)
							objectsToDestroy[i].destroy();
						else
							objectsToDestroy[i].dispatchEvent("destroy");
					}
					art._orig_destroy();
				};
			}

			callback(art);

		}.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtTask = FlashArtTask;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(undefined)
{
	/**
	 * Handles a spritesheet. File extensions and folder paths are dropped from frame names upon
	 * loading.
	 *
	 * @class TextureAtlas
	 * @constructor
	 * @param {Image|HTMLCanvasElement|Array} image The image that all textures pull from. This can
	 *                                          also be an array of images, if the TextureAtlas
	 *                                          should be built from several spritesheets.
	 * @param {Object|Array} spritesheetData The JSON object describing the frames in the atlas. This
	 *                                   is expected to fit the JSON Hash format as exported from
	 *                                   TexturePacker. This can also be an array of data
	 *                                   objects, if the TextureAtlas should be built from
	 *                                   several spritesheets.
	 */
	var TextureAtlas = function(image, spritesheetData)
	{
		/**
		 * The an array of image elements (Image|HTMLCanvasElement) that frames in texture atlas use.
		 * @property {Array} _image
		 * @private
		 */
		if (Array.isArray(image))
		{
			this._images = image;
		}
		else
		{
			this._images = [image];
			spritesheetData = [spritesheetData];
		}

		/**
		 * The dictionary of Textures that this atlas consists of.
		 * @property {Object} frames
		 */
		this.frames = {};

		/**
		 * The scale of the texture atlas, if available in spritesheet metadata. Defaults to 1,
		 * otherwise
		 * @property {Number} scale
		 */
		if (spritesheetData[0].meta && parseFloat(spritesheetData[0].meta.scale))
		{
			this.scale = parseFloat(spritesheetData[0].meta.scale);
		}
		else
			this.scale = 1;

		for (var i = 0; i < this._images.length; ++i)
		{
			image = this._images[i];

			//TexturePacker outputs frames with (not) swapped width & height when rotated, so we need to
			//swap them ourselves
			var swapFrameSize = spritesheetData[i].meta &&
				spritesheetData[i].meta.app == "http://www.codeandweb.com/texturepacker";

			var dataFrames = spritesheetData[i].frames;
			for (var name in dataFrames)
			{
				var data = dataFrames[name];
				var index = name.lastIndexOf(".");
				if (index > 0)
					name = name.substring(0, index); //strip off any ".png" or ".jpg" at the end
				index = name.lastIndexOf("/");
				if (index >= 0)
					name = name.substring(index + 1); //strip off any folder structure included in the name
				this.frames[name] = new Texture(image, data, swapFrameSize);
			}
		}
	};

	// Extend Object
	var p = extend(TextureAtlas);

	/**
	 * Gets a frame by name.
	 * @method getFrame
	 * @param {String} name The frame name to get.
	 * @return {createjs.TextureAtlas.Texture} The texture by that name, or null if it doesn't exist.
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
	 *                  animation exported as anim_0001.png (the ".png" is dropped when the
	 *                  TextureAtlas is loaded).
	 * @param {int} numberMin The number to start on while looking for frames. Flash PNG sequences
	 *                    generally start at 1.
	 * @param {int} numberMax The number to go until while looking for frames. If your animation runs
	 *                    from frame 0001 to frame 0014, numberMax would be 14.
	 * @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as
	 *                        anim_0001.png
	 * @param {Array} [outArray] If already using an array, this can fill it instead of creating a
	 *                       new one.
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
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
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

		var prevTex; //the previous Texture, so we can place the same object in multiple times to control animation rate
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

			//If the texture doesn't exist, use the previous texture - this should allow us to use fewer textures
			//that are in fact the same, if those textures were removed before making the spritesheet
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
		this.image = null;
		this.frames = null;
	};

	namespace("createjs").TextureAtlas = TextureAtlas;
	namespace("springroll.easeljs").TextureAtlas = TextureAtlas;

	/**
	 * A Texture - a specific portion of an image that can then be drawn by a Bitmap.
	 * This class is hidden within TextureAtlas, and can't be manually created.
	 * @class Texture
	 */
	var Texture = function(image, data, swapRotatedSize)
	{
		/**
		 * The image element that this texture references.
		 * @property {Image|HTMLCanvasElement} image
		 */
		this.image = image;
		/**
		 * If this texture has been rotated (90 degrees clockwise).
		 * @property {Boolean} rotated
		 */
		this.rotated = data.rotated;

		var f = data.frame;
		/**
		 * The frame rectangle within the image.
		 * @property {createjs.Rectangle} frame
		 */
		this.frame = new createjs.Rectangle(f.x, f.y, (data.rotated && swapRotatedSize) ? f.h : f.w, (data.rotated && swapRotatedSize) ? f.w : f.h);
		/**
		 * If this texture has been trimmed.
		 * @property {Boolean} trimmed
		 */
		this.trimmed = data.trimmed;
		/**
		 * The offset that the trimmed sprite should be placed at to restore it to the untrimmed position.
		 * @property {createjs.Point} offset
		 */
		this.offset = new createjs.Point(data.spriteSourceSize.x, data.spriteSourceSize.y);
		/**
		 * The width of the untrimmed texture.
		 * @property {Number} width
		 */
		this.width = data.sourceSize.w;
		/**
		 * The height of the untrimmed texture.
		 * @property {Number} height
		 */
		this.height = data.sourceSize.h;
	};
}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlas = include('springroll.easeljs.TextureAtlas'),
		ColorAlphaTask = include('springroll.ColorAlphaTask');

	/**
	 * Internal class for loading a texture atlas, creating a 'springroll.easeljs.TextureAtlas'.
	 * @class TextureAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var TextureAtlasTask = function(asset)
	{
		Task.call(this, asset, asset.atlas);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);

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
	};

	// Reference to prototype
	var p = Task.extend(TextureAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	TextureAtlasTask.test = function(asset)
	{
		// animation data and atlas data and an image or color/alpha split
		return asset.type == "easeljs" &&
			asset.atlas &&
			(asset.image || (asset.alpha && asset.color));
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
	 */
	p.loadAtlas = function(assets, done)
	{
		assets._atlas = this.atlas;

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
			var atlas = new TextureAtlas(image, results._atlas);
			done(atlas, results);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').TextureAtlasTask = TextureAtlasTask;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Task = include('springroll.Task');

	/**
	 * Internal class for loading an image for a FlashArt load.
	 * @class FlashArtImageTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.format The asset format must be "FlashImage".
	 * @param {String} [asset.src] The source path to the image
	 * @param {String} [asset.color] The source path to the color image, if not using src
	 * @param {String} [asset.alpha] The source path to the alpha image, if not using src
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtImageTask = function(asset)
	{
		Task.call(this, asset, asset.color);

		this.src = this.filter(asset.src);

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

		this.imagesName = asset.imagesName;
	};

	// Reference to prototype
	var p = Task.extend(FlashArtImageTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtImageTask.test = function(asset)
	{
		return asset.type == "easeljs" &&
			asset.format == "FlashImage" &&
			!!(asset.src || (asset.alpha && asset.color));
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var load = this.src;
		if (!load)
		{
			//load a standard ColorAlphaTask
			load = {
				alpha: this.alpha,
				color: this.color
			};
		}
		this.load(load,
			function(result)
			{
				var img = result;

				var images = namespace(this.imagesName);
				images[this.id] = img;

				var asset = {
					image: img,
					scale: this.scale,
					id: this.id
				};
				asset.destroy = function()
				{
					img.src = "";
					delete images[this.id];
				};

				callback(asset);

			}.bind(this)
		);
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtImageTask = FlashArtImageTask;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		TextureAtlas = include('springroll.easeljs.TextureAtlas'),
		ColorAlphaTask = include('springroll.ColorAlphaTask'),
		BitmapUtils = include('springroll.easeljs.BitmapUtils');

	/**
	 * Internal class for loading a texture atlas for a FlashArt load.
	 * @class FlashArtAtlasTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.type The asset type must be "easeljs".
	 * @param {String} asset.format The asset format must be "FlashAtlas".
	 * @param {String} asset.atlas The TextureAtlas source data
	 * @param {String} [asset.image] The atlas image path
	 * @param {String} [asset.color] The color image path, if not using image property
	 * @param {String} [asset.alpha] The alpha image path, if not using image property
	 * @param {String} [asset.libName='lib'] The global window object for symbols
	 * @param {String} [asset.id] Id of asset
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {Object} [asset.sizes=null] Define if certain sizes are not supported
	 */
	var FlashArtAtlasTask = function(asset)
	{
		Task.call(this, asset, asset.atlas);

		/**
		 * The TextureAtlas data source path
		 * @property {String} atlas
		 */
		this.atlas = this.filter(asset.atlas);

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

		this.libName = asset.libName || "lib";
	};

	// Reference to prototype
	var p = Task.extend(FlashArtAtlasTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashArtAtlasTask.test = function(asset)
	{
		// animation data and atlas data and an image or color/alpha split
		return asset.type == "easeljs" &&
			asset.format == "FlashAtlas" &&
			asset.atlas &&
			(asset.image || (asset.alpha && asset.color));
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
	 */
	p.loadAtlas = function(assets, done)
	{
		assets._atlas = this.atlas;

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

			//prefer the spritesheet's exported scale
			var scale = results._atlas.meta ? 1 / parseFloat(results._atlas.meta.scale) : 0;
			//if it doesn't have one, then use the asset scale specified by the
			//AssetManager.
			if (!scale)
				scale = 1 / this.original.scale;


			var asset = {};

			var libName = this.libName;
			asset.create = function()
			{
				BitmapUtils.loadSpriteSheet(results._atlas, image, scale, libName);
			};

			var lib = namespace(this.libName);
			var frames = results._atlas.frames;
			asset.destroy = function()
			{
				for (var id in frames)
				{
					delete lib[id];
				}
				image.src = null;
			};

			done(asset, results);
		}.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashArtAtlasTask = FlashArtAtlasTask;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var Task = include('springroll.Task'),
		SpriteSheet = include('createjs.SpriteSheet');

	/**
	 * Create a createjs.SpriteSheet object, see SpriteSheet for more information
	 * @class SpriteSheetTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {Array} asset.images The source images
	 * @param {Array} asset.frames The SpriteSheet source frame data
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.globalProperty='ss'] The global window object for spritesheets
	 */
	var SpriteSheetTask = function(asset)
	{
		Task.call(this, asset, asset.images[0]);

		/**
		 * The collection of images paths
		 * @property {String} images
		 */
		this.images = asset.images;

		/**
		 * The frame definitions as used by the createjs.SpriteSheet object
		 * @property {Array|Object} frames
		 */
		this.frames = asset.frames;

		/**
		 * The name of the window object library items hang on
		 * @property {String} globalProperty
		 * @default 'ss'
		 */
		this.globalProperty = asset.globalProperty || 'ss';
	};

	// Reference to prototype
	var p = Task.extend(SpriteSheetTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	SpriteSheetTask.test = function(asset)
	{
		return asset.images &&
			asset.type == "easeljs" &&
			Array.isArray(asset.images) &&
			asset.frames;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var globalProperty = this.globalProperty;
		var id = this.id;
		var frames = this.frames;

		this.load(this.images, function(results)
		{
			var spriteSheet = new SpriteSheet(
			{
				images: results,
				frames: frames
			});

			// Add to the window
			namespace(globalProperty)[id] = spriteSheet;

			// When spritesheet is destroyed, remove properties
			spriteSheet.addEventListener('destroy', function()
			{
				delete window[globalProperty][id];
				for (var i = results.length - 1; i >= 0; --i)
					results[i].src = "";
			});

			// Return spritesheet
			callback(spriteSheet);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').SpriteSheetTask = SpriteSheetTask;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var LoadTask = include('springroll.LoadTask');

	/**
	 * Created a createjs Spritesheet from the Flash export
	 * @class FlashSpriteSheetTask
	 * @extends springroll.LoadTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The path to the spritesheet
	 * @param {String} asset.type Asset type must be "easeljs"
	 * @param {String} asset.format Asset format must be "createjs.SpriteSheet"
	 * @param {String} [asset.globalProperty='ss'] The name of the global property
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.globalProperty='ss'] The global window object for spritesheets
	 */
	var FlashSpriteSheetTask = function(asset)
	{
		LoadTask.call(this, asset);

		/**
		 * The name of the window object library items hang on
		 * @property {String} globalProperty
		 * @default 'ss'
		 */
		this.globalProperty = asset.globalProperty || 'ss';
	};

	// Reference to prototype
	var s = LoadTask.prototype;
	var p = LoadTask.extend(FlashSpriteSheetTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	FlashSpriteSheetTask.test = function(asset)
	{
		return asset.src &&
			asset.type == "easeljs" &&
			asset.format == "createjs.SpriteSheet";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var prop = this.globalProperty;
		var id = this.id;
		s.start.call(this, function(data)
			{
				data.id = id;
				data.globalProperty = prop;
				data.type = "easeljs";
				this.load(data, callback);
			}
			.bind(this));
	};

	// Assign to namespace
	namespace('springroll.easeljs').FlashSpriteSheetTask = FlashSpriteSheetTask;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function()
{
	var LoadTask = include('springroll.LoadTask'),
		Bitmap = include('createjs.Bitmap'),
		Application = include('springroll.Application');

	/**
	 * Created a createjs Bitmap from a loaded image
	 * @class BitmapTask
	 * @extends springroll.LoadTask
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String} asset.src The path to the spritesheet
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 */
	var BitmapTask = function(asset)
	{
		LoadTask.call(this, asset);
	};

	// Reference to prototype
	var s = LoadTask.prototype;
	var p = LoadTask.extend(BitmapTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	BitmapTask.test = function(asset)
	{
		return asset.src &&
			asset.type == "easeljs" &&
			asset.format == "createjs.Bitmap";
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		s.start.call(this, function(img)
		{
			var bitmap = new Bitmap(img);
			bitmap.destroy = function()
			{
				this.removeAllEventListeners();
				this.image.src = "";
			};
			callback(bitmap);
		});
	};

	// Assign to namespace
	namespace('springroll.easeljs').BitmapTask = BitmapTask;

}());
/**
 * @module EaselJS Display
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
		var assetManager = this.assetManager;

		assetManager.register('springroll.easeljs.TextureAtlasTask', 30);
		assetManager.register('springroll.easeljs.FlashArtImageTask', 40);
		assetManager.register('springroll.easeljs.FlashArtAtlasTask', 40);
		assetManager.register('springroll.easeljs.FlashArtTask', 50);
		assetManager.register('springroll.easeljs.SpriteSheetTask', 70);
		assetManager.register('springroll.easeljs.FlashSpriteSheetTask', 80);
		assetManager.register('springroll.easeljs.BitmapTask', 90);

		this.once('displayAdded', function(display)
		{
			var options = this.options;
			if (!options.defaultAssetType && display instanceof include('springroll.EaselJSDisplay'))
			{
				options.defaultAssetType = 'easeljs';
			}
		});
	};

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
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
	 * @default createjs.Circle
	 */
	DisplayAdapter.Circle = include('createjs.Circle', false);

	/**
	 * The geometry class for Ellipse
	 * @property {Function} Ellipse
	 * @readOnly
	 * @static
	 * @default createjs.Ellipse
	 */
	DisplayAdapter.Ellipse = include('createjs.Ellipse', false);

	/**
	 * The geometry class for Rectangle
	 * @property {Function} Rectangle
	 * @readOnly
	 * @static
	 * @default createjs.Rectangle
	 */
	DisplayAdapter.Rectangle = include('createjs.Rectangle');

	/**
	 * The geometry class for Sector
	 * @property {Function} Sector
	 * @readOnly
	 * @static
	 * @default createjs.Sector
	 */
	DisplayAdapter.Sector = include('createjs.Sector', false);

	/**
	 * The geometry class for point
	 * @property {Function} Point
	 * @readOnly
	 * @static
	 * @default createjs.Point
	 */
	DisplayAdapter.Point = include('createjs.Point');

	/**
	 * The geometry class for Polygon
	 * @property {Function} Polygon
	 * @readOnly
	 * @static
	 * @default createjs.Polygon
	 */
	DisplayAdapter.Polygon = include('createjs.Polygon', false);

	/**
	 * If the rotation is expressed in radians
	 * @property {Boolean} useRadians
	 * @readOnly
	 * @static
	 * @default false
	 */
	DisplayAdapter.useRadians = false;

	/**
	 * Gets the object's boundaries in its local coordinate space, without any scaling or
	 * rotation applied.
	 * @method getLocalBounds
	 * @static
	 * @param {createjs.DisplayObject} object The createjs display object
	 * @return {createjs.Rectangle} A rectangle with additional right and bottom properties.
	 */
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds, temp;
		if (object.nominalBounds)
		{
			// Start by using nominal bounds, if it was exported from Flash, since it
			// should be fast and pretty accurate
			bounds = object.nominalBounds.clone();
		}
		else if (object.width !== undefined && object.height !== undefined)
		{
			// Next check for a width and height that someone might have set up,
			// like our Button class has. This also needs to take into account
			// the registration point, as that affects the positioning of the art
			var actW = object.width / Math.abs(object.scaleX);
			var actH = object.height / Math.abs(object.scaleY);
			bounds = new createjs.Rectangle(-object.regX, -object.regY, actW, actH);
		}
		else
		{
			// Finally fall back to using EaselJS's getBounds().
			if (object.getLocalBounds)
			{
				bounds = object.getLocalBounds();
				if (bounds)
				{
					// Clone the rectangle in case it gets changed
					bounds = bounds.clone();
				}
			}
			if (!bounds)
			{
				// Make sure we actually got a rectangle, if getLocalBounds
				// failed for some reason
				bounds = new createjs.Rectangle();
			}
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		return bounds;
	};

	/**
	 * Normalize the object scale
	 * @method getScale
	 * @static
	 * @param {createjs.DisplayObject} object The createjs display object
	 * @param {String} [direction] Either "x" or "y" to return a specific value
	 * @return {object|Number} A scale object with x and y keys or a single number if direction is set
	 */
	DisplayAdapter.getScale = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object["scale" + direction.toUpperCase()];
		}
		return {
			x: object.scaleX,
			y: object.scaleY
		};
	};

	/**
	 * Normalize the object position setting
	 * @method setPosition
	 * @static
	 * @param {createjs.DisplayObject} object The createjs display object
	 * @param {object|Number} position The position object or the value
	 * if the direction is set.
	 * @param {Number} [position.x] The x value
	 * @param {Number} [position.y] The y value
	 * @param {String} [direction] Either "x" or "y" value
	 * @return {createjs.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPosition = function(object, position, direction)
	{
		if (direction !== undefined)
		{
			object[direction] = position;
		}
		else
		{
			if (position.x !== undefined)
				object.x = position.x;
			if (position.y !== undefined)
				object.y = position.y;
		}
		return object;
	};

	/**
	 * Normalize the object position getting
	 * @method getPosition
	 * @static
	 * @param {createjs.DisplayObject} object The createjs display object
	 * @param {String} [direction] Either "x" or "y", default is an object of both
	 * @return {Object|Number} The position as an object with x and y keys if
	 * no direction value is set, or the value of the specific direction
	 */
	DisplayAdapter.getPosition = function(object, direction)
	{
		if (direction !== undefined)
		{
			return object[direction];
		}
		return {
			x: object.x,
			y: object.y
		};
	};

	/**
	 * Normalize the object scale setting
	 * @method setScale
	 * @static
	 * @param {createjs.DisplayObject} object The createjs Display object
	 * @param {Number} scale The scaling object or scale value for x and y
	 * @param {String} [direction] Either "x" or "y" if setting a specific value, default
	 * sets both the scale x and scale y.
	 * @return {createjs.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setScale = function(object, scale, direction)
	{
		if (direction !== undefined)
		{
			object["scale" + direction.toUpperCase()] = scale;
		}
		else
		{
			object.scaleX = object.scaleY = scale;
		}
		return object;
	};

	/**
	 * Set the pivot or registration point of an object
	 * @method setPivot
	 * @static
	 * @param {createjs.DisplayObject} object The createjs Display object
	 * @param {object|Number} pivot The object pivot point or the value if the direction is set
	 * @param {Number} [pivot.x] The x position of the pivot point
	 * @param {Number} [pivot.y] The y position of the pivot point
	 * @param {String} [direction] Either "x" or "y" the value for specific direction,
	 * default will set using the object.
	 * @return {createjs.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setPivot = function(object, pivot, direction)
	{
		if (direction !== undefined)
		{
			object["reg" + direction.toUpperCase()] = pivot;
		}
		object.regX = pivot.x;
		object.regY = pivot.y;
		return object;
	};

	/**
	 * Set the hit area of the shape
	 * @method setHitArea
	 * @static
	 * @param {createjs.DisplayObject} object The createjs Display object
	 * @param {Object} shape The geometry object
	 * @return {createjs.DisplayObject} Return the object for chaining
	 */
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitShape = shape;
		return object;
	};

	/**
	 * Get the original size of a bitmap
	 * @method getBitmapSize
	 * @static
	 * @param {createjs.Bitmap} bitmap The bitmap to measure
	 * @return {object} The width (w) and height (h) of the actual bitmap size
	 */
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		var rtn = {
			w: 0,
			h: 0
		};
		if (bitmap.nominalBounds)
		{
			// Start by using nominal bounds, if it was exported from Flash, since it
			// should be fast and pretty accurate
			rtn.w = bitmap.nominalBounds.width;
			rtn.h = bitmap.nominalBounds.height;
		}
		else if (bitmap.width !== undefined && bitmap.height !== undefined)
		{
			// Next check for a width and height that someone might have set up,
			// like our Button class has.
			rtn.w = bitmap.width;
			rtn.h = bitmap.height;
		}
		else if (bitmap.sourceRect)
		{
			rtn.w = bitmap.sourceRect.width;
			rtn.h = bitmap.sourceRect.height;
		}
		else if (bitmap.image)
		{
			rtn.w = bitmap.image.width;
			rtn.h = bitmap.image.height;
		}
		return rtn;
	};

	/**
	 * Remove all children from a display object
	 * @method removeChildren
	 * @static
	 * @param {createjs.Container} container The display object container
	 */
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeAllChildren();
	};

	/**
	 * If a container contains a child
	 * @method contains
	 * @static
	 * @param  {createjs.Container} container The container
	 * @param  {createjs.DisplayObject} child  The object to test
	 * @return {Boolean} If the child contained within the container
	 */
	DisplayAdapter.contains = function(container, child)
	{
		return container.contains(child);
	};

	// Assign to namespace
	namespace('springroll.easeljs').DisplayAdapter = DisplayAdapter;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(undefined)
{
	// Import createjs classes
	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage,
		Touch;

	/**
	 * EaselJSDisplay is a display plugin for the springroll Framework
	 * that uses the EaselJS library for rendering.
	 * @class EaselJSDisplay
	 * @extends springroll.AbstractDisplay
	 * @constructor
	 * @param {String} id The id of the canvas element on the page to draw to.
	 * @param {Object} options The setup data for the EaselJS stage.
	 * @param {String} [options.stageType="stage"] If the stage should be a normal stage or a
	 *                                             SpriteStage (use "spriteStage").
	 * @param {Boolean} [options.clearView=false] If the stage should wipe the canvas between
	 *                                            renders.
	 * @param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To
	 *                                         disable them, use 0 or -1.
	 * @param {Boolean} [options.autoPreventDefault=true] If preventDefault() should be called on
	 *                                                    all touch events and mousedown events.
	 */
	var EaselJSDisplay = function(id, options)
	{
		if (!Stage)
		{
			Stage = include('createjs.Stage');
			Touch = include('createjs.Touch');
		}

		AbstractDisplay.call(this, id, options);

		options = options ||
		{};

		/**
		 * The rate at which EaselJS calculates mouseover events, in times/second.
		 * @property {int} mouseOverRate
		 * @public
		 * @default 30
		 */
		this.mouseOverRate = options.mouseOverRate || 30;

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

		if (options.stageType == "spriteStage")
		{
			// TODO: make a sprite stage (not officially released yet)
			// this.stage = new SpriteStage(id);
		}
		else
		{
			/**
			 * The rendering library's stage element, the root display object
			 * @property {createjs.Stage|createjs.SpriteStage} stage
			 * @readOnly
			 * @public
			 */
			this.stage = new Stage(id);
		}
		this.stage.autoClear = !!options.clearView;
		this.stage.preventSelection = this._autoPreventDefault;

		this.adapter = include('springroll.easeljs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = AbstractDisplay.extend(EaselJSDisplay);

	/**
	 * An internal helper to avoid creating an object each render
	 * while telling EaselJS the amount of time elapsed.
	 * @property DELTA_HELPER
	 * @static
	 * @private
	 */
	var DELTA_HELPER = {
		delta: 0
	};

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

			if (value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				Touch.enable(this.stage, false, !this._autoPreventDefault);
			}
			else
			{
				if (this.keepMouseover)
				{
					this.stage.enableDOMEvents("keepMove");
				}
				else
				{
					this.stage.enableMouseOver(false);
					this.stage.enableDOMEvents(false);
				}
				Touch.disable(this.stage);
				// reset the cursor if it isn't disabled
				if (this.canvas.style.cursor != "none")
					this.canvas.style.cursor = "";
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
			if (this.stage)
			{
				if (this._enabled)
				{
					Touch.disable(this.stage);
					Touch.enable(this.stage, false, !this._autoPreventDefault);
				}
				this.stage.preventSelection = this._autoPreventDefault;
			}
		}
	});

	/**
	 * Updates the stage and draws it. This is only called by the Application.
	 * This method does nothing if paused is true or visible is false.
	 * @method render
	 * @param {int} elapsed The time elapsed since the previous frame.
	 * @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	 */
	p.render = function(elapsed, force)
	{
		if (force || (!this.paused && this._visible))
		{
			DELTA_HELPER.delta = elapsed;
			this.stage.update(DELTA_HELPER);
		}
	};

	/**
	 * Destroys the display. This method is called by the Application and should
	 * not be called directly, use Application.removeDisplay(id).
	 * The stage recursively removes all display objects here.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stage.removeAllChildren(true);

		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').EaselJSDisplay = EaselJSDisplay;
	namespace('springroll.easeljs').EaselJSDisplay = EaselJSDisplay;

}());
/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(Object)
{
	// Include classes
	var EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Application = include('springroll.Application');

	/**
	 * @class EaselJSDisplay
	 */
	/**
	 * See {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @property {springroll.Animator} animator
	 * @deprecated since version 0.4.0
	 */
	Object.defineProperty(EaselJSDisplay.prototype, 'animator',
	{
		get: function()
		{
			if (true) console.warn('EaselJSDisplay\'s animator property is now deprecated, please use the app property, e.g. : app.animator');
			return Application.instance.animator;
		}
	});

}(Object));