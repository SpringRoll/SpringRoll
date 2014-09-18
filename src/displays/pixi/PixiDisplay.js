/**
*  @module cloudkid.pixi
*/
(function(undefined){

	var Stage = include('PIXI.Stage'),
		CanvasRenderer = include('PIXI.CanvasRenderer'),
		WebGLRenderer = include('PIXI.WebGLRenderer'),
		autoDetectRenderer = include('PIXI.autoDetectRenderer');

	/**
	*   PixiDisplay is a display plugin for the CloudKid Framework 
	*	that uses the Pixi library for rendering.
	*
	*   @class pixi.PixiDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the Pixi stage.
	*	@param {String} [options.forceContext=null] If a specific renderer should be used instead of WebGL 
	*	                                            falling back to Canvas. Use "webgl" or "canvas2d" to specify a renderer.
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {uint} [options.backgroundColor=0x000000] The background color of the stage (if it is not transparent).
	*	@param {Boolean} [options.transparent=false] If the stage should be transparent.
	*	@param {Boolean} [options.antiAlias=false] If the WebGL renderer should use anti-aliasing.
	*	@param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all images as pre-multiplied alpha.
	*	                                              In most cases, you probably do not want to set this option to true.
	*	@param {Boolean} [options.preserveDrawingBuffer=false] Set this to true if you want to call toDataUrl
	*	                                                       on the WebGL rendering context.
	*/
	var PixiDisplay = function(id, options)
	{
		options = options || {};

		/**
		*  the canvas managed by this display
		*  @property {DOMElement} canvas
		*  @readOnly
		*  @public
		*/
		this.canvas = document.getElementById(id);

		/**
		*  The DOM id for the canvas
		*  @property {String} id
		*  @readOnly
		*  @public
		*/
		this.id = id;

		/**
		*  Convenience method for getting the width of the canvas element
		*  would be the same thing as canvas.width
		*  @property {int} width
		*  @readOnly
		*  @public
		*/
		this.width = this.canvas.width;

		/**
		*  Convenience method for getting the height of the canvas element
		*  would be the same thing as canvas.height
		*  @property {int} height
		*  @readOnly
		*  @public
		*/
		this.height = this.canvas.height;

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

		/**
		*  If rendering is paused on this display only. Pausing all displays can be done
		*  using Application.paused setter.
		*  @property {Boolean} paused
		*  @public
		*/
		this.paused = false;

		/**
		*  If input is enabled on the stage.
		*  @property {Boolean} _enabled
		*  @private
		*/
		this._enabled = true;//enable mouse/touch input

		/**
		*  If the display is visible.
		*  @property {Boolean} _visible
		*  @private
		*/
		this._visible = this.canvas.style.display != "none";

		// prevent mouse down turning into text cursor
		this.canvas.onmousedown = function(e)
		{
			e.preventDefault();
		};

		//make the renderer
		var preMultAlpha = !!options.preMultAlpha;
		var transparent = !!options.transparent;
		var antiAlias = !!options.antiAlias;
		var preserveDrawingBuffer = !!options.preserveDrawingBuffer;
		if(transparent && !preMultAlpha)
			transparent = "notMultiplied";

		if(options.forceContext == "canvas2d")
		{
			this.renderer = new CanvasRenderer(
				this.width, 
				this.height, 
				this.canvas, 
				transparent
			);
		}
		else if(options.forceContext == "webgl")
		{
			this.renderer = new WebGLRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				antiAlias,//antiAlias, not all browsers may support it
				preserveDrawingBuffer
			);
		}
		else
		{
			this.renderer = autoDetectRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				false,//antialias, not all browsers may support it
				preMultAlpha
			);
		}

		/**
		*  If Pixi is being rendered with WebGL.
		*  @property {Boolean} isWebGL
		*  @readOnly
		*  @public
		*/
		this.isWebGL = this.renderer instanceof WebGLRenderer;
		
		/**
		*  The Animator class to use when using this display.
		*  @property {Animator} Animator
		*  @readOnly
		*  @public
		*/
		this.Animator = include('cloudkid.pixi.Animator');

		/**
		*  The DisplayAdapter class to use when providing standard
		*  ways for accessing properties like position, scale, etc.
		*  @property {pixi.DisplayAdapter} DisplayAdapter
		*  @readOnly
		*  @public
		*/
		this.DisplayAdapter = include('cloudkid.pixi.DisplayAdapter');
	};

	var p = PixiDisplay.prototype = {};

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
			var interactionManager = this.stage.interactionManager;
			if(value)
			{
				//add events to the interaction manager's target
				interactionManager.setTargetDomElement(this.canvas);
			}
			else
			{
				//remove event listeners
				interactionManager.removeEvents();
			}
		}
	});

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
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
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
		this.renderer.resize(width, height);
	};

	/** 
	* Updates the stage and draws it. This is only called by the Application.
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;

		this.renderer.render(this.stage);
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.stage.removeChildren(true);
		this.stage.destroy();
		this.renderer.destroy();
		this.canvas.onmousedown = null;
		this.renderer = this.stage = this.canvas = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').PixiDisplay = PixiDisplay;
	namespace('cloudkid.pixi').PixiDisplay = PixiDisplay;

}());