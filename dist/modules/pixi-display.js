/*! SpringRoll 0.3.8 */
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	// Import classes
	var Texture = include('PIXI.Texture');

	/**
	 * Container for the Pixi assets
	 * @class PixiAssets
	 * @constructor
	 * @param {Array} urls The collection of URLs that have been loaded
	 */
	var PixiAssets = function(urls)
	{
		/**
		 * The Asset URLs that have been loaded
		 * @property {Array} urls
		 */
		this.urls = urls;
	};

	// Reference to the prototype
	var p = PixiAssets.prototype;

	/**
	 * Destroy and clean-up
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.urls.forEach(function(url)
		{
			Texture.destroyTexture(url);
		});
		this.urls = null;
	};

	// Assign to namespace
	namespace('springroll.pixi').PixiAssets = PixiAssets;

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	var Loader = include('springroll.Loader'),
		Application = include('springroll.Application'),
		AssetLoader = include('PIXI.AssetLoader'),
		PixiAssets = include('springroll.pixi.PixiAssets'),
		Task = include('springroll.Task');

	/**
	 * PixiLoadTask loads things through PIXI.AssetLoader for pixi.js.
	 * This means textures, spritesheets, and bitmap fonts.
	 * @class PixiLoadTask
	 * @constructor
	 * @param {Array} asset.urls The urls to load using PIXI.AssetLoader
	 * @param {String} [asset.id] The id of the task
	 * @param {Function} [asset.complete] The callback to call when the load is completed
	 * @param {Function} [asset.progress] The optional callback to call each time 
	 * an itemfinishes loading
	 */
	var PixiLoadTask = function(asset)
	{
		Task.call(this, asset);

		/**
		 * The optional callback to get updates (to show load progress)
		 * @property {Function} progress
		 * @private
		 */
		this.progress = asset.progress;

		/**
		 * The AssetLoader used to load all files.
		 * @property {PIXI.AssetLoader} _assetLoader
		 * @private
		 */
		this._assetLoader = null;

		/**
		 * The urls of the files to load (passed through cache manager)
		 * @property {Array} urls
		 */
		this.urls = asset.urls.slice(0);

		/**
		 * The original urls of the files to load
		 * @property {Array} originalUrls
		 */
		this.originalUrls = asset.urls;

		// Prepare each url via the cache manager
		this.urls.forEach(function(url, i, urls)
		{
			urls[i] = Loader.instance.cacheManager.prepare(url, true);
		});
	};

	// Extend the base Task
	var p = extend(PixiLoadTask, Task);

	/**
	 * Test to see if we should load an asset
	 * @method test
	 * @static
	 * @param {Object} asset The asset to test
	 * @return {Boolean} If this qualifies for this task
	 */
	PixiLoadTask.test = function(asset)
	{
		return !!asset.urls && Array.isArray(asset.urls);
	};

	/**
	 * Start the load
	 * @method start
	 * @param callback Callback to call when the load is done
	 */
	p.start = function(callback)
	{
		var options = Application.instance.options;

		this._assetLoader = new AssetLoader(
			this.urls,
			options.crossOrigin,
			options.basePath
		);

		var assets = new PixiAssets(this.originalUrls);
		this._assetLoader.onComplete = callback.bind(null, assets);

		if (this.progress)
		{
			this._assetLoader.onProgress = this.progress;
		}
		this._assetLoader.load();
	};

	/**
	 * Destroy this load task and don't use after this.
	 * @method destroy
	 */
	p.destroy = function()
	{
		Task.prototype.destroy.call(this);

		this.progress = null;
		this.urls = null;

		if (this._assetLoader)
		{
			this._assetLoader.onComplete = null;
			this._assetLoader.onProgress = null;
		}
		this._assetLoader = null;
	};

	// Assign to the namespace
	namespace('springroll.pixi').PixiLoadTask = PixiLoadTask;

}());
/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for EaselJSDisplay, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class PixiDisplayPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		var multiLoader = this.multiLoader;
		multiLoader.register('springroll.pixi.PixiLoadTask', 60);
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
	*  Provide a normalized way to get size, position, scale values
	*  as well as provide reference for different geometry classes.
	*  @class DisplayAdapter
	*/
	var DisplayAdapter = {};

	/**
	*  The geometry class for Circle
	*  @property {Function} Circle
	*  @readOnly
	*  @static
	*  @default PIXI.Circle
	*/
	DisplayAdapter.Circle = include('PIXI.Circle');

	/**
	*  The geometry class for Ellipse
	*  @property {Function} Ellipse
	*  @readOnly
	*  @static
	*  @default PIXI.Ellipse
	*/
	DisplayAdapter.Ellipse = include('PIXI.Ellipse');

	/**
	*  The geometry class for Rectangle
	*  @property {Function} Rectangle
	*  @readOnly
	*  @static
	*  @default PIXI.Rectangle
	*/
	DisplayAdapter.Rectangle = include('PIXI.Rectangle');

	/**
	*  The geometry class for Sector
	*  @property {Function} Sector
	*  @readOnly
	*  @static
	*  @default PIXI.Sector
	*/
	DisplayAdapter.Sector = include('PIXI.Sector', false);

	/**
	*  The geometry class for point
	*  @property {Function} Point
	*  @readOnly
	*  @static
	*  @default PIXI.Point
	*/
	DisplayAdapter.Point = include('PIXI.Point');

	/**
	*  The geometry class for Polygon
	*  @property {Function} Polygon
	*  @readOnly
	*  @static
	*  @default PIXI.Polygon
	*/
	DisplayAdapter.Polygon = include('PIXI.Polygon');

	/**
	*  If the rotation is expressed in radians
	*  @property {Boolean} useRadians
	*  @readOnly
	*  @static
	*  @default true
	*/
	DisplayAdapter.useRadians = true;

	/**
	*  Gets the object's boundaries in its local coordinate space, without any scaling or
	*  rotation applied.
	*  @method getLocalBounds
	*  @static
	*  @param {PIXI.DisplayObject} object The createjs display object
	*  @return {PIXI.Rectangle} A rectangle with additional right and bottom properties.
	*/
	DisplayAdapter.getLocalBounds = function(object)
	{
		var bounds;
		var width = object.width;
		var height = object.height;
		if(width && height)
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
	*  Normalize the object scale
	*  @method getScale
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {String} [direction] Either "x" or "y" to return a specific value
	*  @return {object|Number} A scale object with x and y keys or a single number if direction is set
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
	*  Normalize the object position setting
	*  @method setPosition
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {object|Number} position The position object or the value
	* 		if the direction is set.
	*  @param {Number} [position.x] The x value
	*  @param {Number} [position.y] The y value
	*  @param {String} [direction] Either "x" or "y" value
	*  @return {PIXI.DisplayObject} Return the object for chaining
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
	*  Normalize the object position getting
	*  @method getPosition
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI display object
	*  @param {String} [direction] Either "x" or "y", default is an object of both
	*  @return {Object|Number} The position as an object with x and y keys if no direction
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
	*  Normalize the object scale setting
	*  @method setScale
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {Number} scale The scaling object or scale value for x and y
	*  @param {String} [direction] Either "x" or "y" if setting a specific value, default
	* 		sets both the scale x and scale y.
	*  @return {PIXI.DisplayObject} Return the object for chaining
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
	*  Set the pivot or registration point of an object
	*  @method setPivot
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {object|Number} pivot The object pivot point or the value if the direction is set
	*  @param {Number} [pivot.x] The x position of the pivot point
	*  @param {Number} [pivot.y] The y position of the pivot point
	*  @param {String} [direction] Either "x" or "y" the value for specific direction, default
	* 		will set using the object.
	*  @return {PIXI.DisplayObject} Return the object for chaining
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
	*  Set the hit area of the shape
	*  @method setHitArea
	*  @static
	*  @param {PIXI.DisplayObject} object The PIXI Display object
	*  @param {Object} shape The geometry object
	*  @return {PIXI.DisplayObject} Return the object for chaining
	*/
	DisplayAdapter.setHitArea = function(object, shape)
	{
		object.hitArea = shape;
		return object;
	};

	/**
	*  Get the original size of a bitmap
	*  @method getBitmapSize
	*  @static
	*  @param {PIXI.Bitmap} bitmap The bitmap to measure
	*  @return {object} The width (w) and height (h) of the actual bitmap size
	*/
	DisplayAdapter.getBitmapSize = function(bitmap)
	{
		return {
			h: bitmap.height / bitmap.scale.y,
			w: bitmap.width / bitmap.scale.x
		};
	};

	/**
	*  Remove all children from a display object
	*  @method removeChildren
	*  @static
	*  @param {PIXI.DisplayObjectContainer} container The display object container
	*/
	DisplayAdapter.removeChildren = function(container)
	{
		container.removeChildren(true);
	};

	/**
	 * If a container contains a child
	 * @param  {PIXI.DisplayObjectContainer} container The container
	 * @param  {PIXI.DisplayObject} child  The object to test
	 * @return {Boolean} If the child contained within the container
	 */
	DisplayAdapter.contains = function(container, child)
	{
		while (child)
		{
            if (child == container) { return true; }
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
(function(undefined){

	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage = include('PIXI.Stage'),
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
	* @param {String} [options.forceContext=null] If a specific renderer should be used instead of
	*                                             WebGL falling back to Canvas. Use "webgl" or
	*                                             "canvas2d" to specify a renderer.
	* @param {Boolean} [options.clearView=false] If the stage should wipe the canvas between
	*                                            renders.
	* @param {uint} [options.backgroundColor=0x000000] The background color of the stage (if it is
	*                                                  not transparent).
	* @param {Boolean} [options.transparent=false] If the stage should be transparent.
	* @param {Boolean} [options.antiAlias=false] If the WebGL renderer should use anti-aliasing.
	* @param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all
	*                                               images as pre-multiplied alpha. In most cases,
	*                                               you probably do not want to set this option to
	*                                               true.
	* @param {Boolean} [options.preserveDrawingBuffer=false] Set this to true if you want to call
	*                                                        toDataUrl on the WebGL rendering
	*                                                        context.
	*/
	var PixiDisplay = function(id, options)
	{
		AbstractDisplay.call(this, id, options);

		options = options || {};
		
		/**
		*  If the display should keep mouse move events running when the display is disabled.
		*  @property {Boolean} keepMouseover
		*  @public
		*/
		this.keepMouseover = options.keepMouseover || false;

		/**
		*  The rendering library's stage element, the root display object
		*  @property {PIXI.Stage} stage
		*  @readOnly
		*  @public
		*/
		this.stage = new Stage(options.backgroundColor || 0);

		/**
		*  The Pixi renderer.
		*  @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer
		*  @readOnly
		*  @public
		*/
		this.renderer = null;

		//make the renderer
		var rendererOptions =
		{
			view: this.canvas,
			transparent: !!options.transparent,
			antialias: !!options.antiAlias,
			preserveDrawingBuffer: !!options.preserveDrawingBuffer,
			clearBeforeRender: !!options.clearView
		};
		var preMultAlpha = !!options.preMultAlpha;
		if(rendererOptions.transparent && !preMultAlpha)
			rendererOptions.transparent = "notMultiplied";
		
		//check for IE11 because it tends to have WebGL problems (especially older versions)
		//if we find it, then make Pixi use to the canvas renderer instead
		if(options.forceContext != "webgl")
		{
			var ua = window.navigator.userAgent;
			if (ua.indexOf("Trident/7.0") > 0)
				options.forceContext = "canvas2d";
		}
		if(options.forceContext == "canvas2d")
		{
			this.renderer = new CanvasRenderer(this.width, this.height, rendererOptions);
		}
		else if(options.forceContext == "webgl")
		{
			this.renderer = new WebGLRenderer(this.width, this.height, rendererOptions);
		}
		else
		{
			this.renderer = autoDetectRenderer(this.width, this.height, rendererOptions);
		}

		/**
		*  If Pixi is being rendered with WebGL.
		*  @property {Boolean} isWebGL
		*  @readOnly
		*  @public
		*/
		this.isWebGL = this.renderer instanceof WebGLRenderer;
		
		// Set the animator and display adapter classes
		this.animator = include('springroll.pixi.Animator', false);
		this.adapter = include('springroll.pixi.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = extend(PixiDisplay, AbstractDisplay);

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);
			
			var interactionManager = this.stage.interactionManager;
			if(!interactionManager) return;
			if(value)
			{
				//add events to the interaction manager's target
				interactionManager.setTargetDomElement(this.canvas);
			}
			else
			{
				//remove event listeners
				if(this.keepMouseover)
					interactionManager.removeInteractionEvents();
				else
					interactionManager.removeEvents();
			}
		}
	});

	/**
	* Resizes the canvas and the renderer. This is only called by the Application.
	* @method resize
	* @internal
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
	* @internal
	* @param {int} elapsed
	* @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	*/
	p.render = function(elapsed, force)
	{
		if(force || (!this.paused && this._visible))
		{
			this.renderer.render(this.stage);
		}
	};

	/**
	*  Destroys the display. This method is called by the Application and should
	*  not be called directly, use Application.removeDisplay(id).
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.stage.removeChildren();
		this.stage.destroy();
		this.renderer.destroy();
		this.renderer = null;
		
		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').PixiDisplay = PixiDisplay;
	namespace('springroll.pixi').PixiDisplay = PixiDisplay;

}());