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