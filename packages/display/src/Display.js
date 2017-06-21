import DisplayAdapter from './DisplayAdapter';

/**
 * Display is a display plugin for the springroll Framework
 * that uses the Pixi library for rendering.
 *
 * @class Display
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
var Display = function(id, options)
{
    EventDispatcher.call(this);

    options = options || {};

    /**
     * the canvas managed by this display
     * @property {DOMElement} canvas
     * @readOnly
     * @public
     */
    this.canvas = document.getElementById(id);

    /**
     * The DOM id for the canvas
     * @property {String} id
     * @readOnly
     * @public
     */
    this.id = id;

    /**
     * Convenience method for getting the width of the canvas element
     * would be the same thing as canvas.width
     * @property {int} width
     * @readOnly
     * @public
     */
    this.width = this.canvas.width;

    /**
     * Convenience method for getting the height of the canvas element
     * would be the same thing as canvas.height
     * @property {int} height
     * @readOnly
     * @public
     */
    this.height = this.canvas.height;

    /**
     * The main rendering context or the root display object or stage.
     * @property {mixed} stage
     * @readOnly
     * @public
     */
    this.stage = null;

    /**
     * If rendering is paused on this display only. Pausing all displays can be done
     * using Application.paused setter.
     * @property {Boolean} paused
     * @public
     */
    this.paused = false;

    /**
     * If input is enabled on the stage.
     * @property {Boolean} _enabled
     * @private
     */
    this._enabled = false;

    /**
     * If the display is visible.
     * @property {Boolean} _visible
     * @private
     */
    this._visible = this.canvas.style.display !== "none";

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
    this._autoPreventDefault = options.autoPreventDefault !== undefined ?
        options.autoPreventDefault : true;

    /**
     * The rendering library's stage element, the root display object
     * @property {PIXI.Stage} stage
     * @readOnly
     * @public
     */
    this.stage = new PIXI.Container();

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
        // this defaults to false, but we never want it to auto resize.
        autoResize: false
    };

    var preMultAlpha = !!options.preMultAlpha;

    if (rendererOptions.transparent && !preMultAlpha)
    {
        rendererOptions.transparent = "notMultiplied";
    }

    //check for IE11 because it tends to have WebGL problems (especially older versions)
    //if we find it, then make Pixi use to the canvas renderer instead
    if (options.forceContext !== "webgl")
    {
        var ua = window.navigator.userAgent;

        if (ua.indexOf("Trident/7.0") > 0)
        {
            options.forceContext = "canvas2d";
        }
    }

    if (options.forceContext === "canvas2d")
    {
        this.renderer = new PIXI.CanvasRenderer(this.width, this.height, rendererOptions);
    }
    else if (options.forceContext === "webgl")
    {
        this.renderer = new PIXI.WebGLRenderer(this.width, this.height, rendererOptions);
    }
    else
    {
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, rendererOptions);
    }

    /**
     * If Pixi is being rendered with WebGL.
     * @property {Boolean} isWebGL
     * @readOnly
     * @public
     */
    this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;

    // Set display adapter classes
    this.adapter = DisplayAdapter;

    // Initialize the autoPreventDefault
    this.autoPreventDefault = this._autoPreventDefault;
};

Display.prototype = Object.create(EventDispatcher.prototype);

/**
 * If input is enabled on the stage for this display. The default is true.
 * @property {Boolean} enabled
 * @public
 */
Object.defineProperty(Display.prototype, "enabled",
{
    get: function()
    {
        return this._enabled;
    },
    set: function(value)
    {
        var oldEnabled = this._enabled;
        this._enabled = value;

        if (oldEnabled !== value)
        {
            var interactionManager = this.renderer.plugins.interaction;

            if (interactionManager)
            {
                if (value)
                {
                    //add events to the interaction manager's target
                    interactionManager.setTargetElement(this.canvas);
                }
                else
                {
                    //remove event listeners
                    if (this.keepMouseover)
                    {
                        interactionManager.removeClickEvents();
                    }
                    else
                    {
                        interactionManager.removeEvents();
                    }
                }
            }

            /**
             * If the display becomes enabled
             * @event enabled
             */

            /**
             * If the display becomes disabled
             * @event disabled
             */
            this.trigger(value ? 'enabled' : 'disabled');

            /**
             * Enabled state changed on the display
             * @event enable
             * @param {Boolean} enabled Current state of enabled
             */
            this.trigger('enable', value);
        }
    }
});

/**
 * If preventDefault() should be called on all touch events and mousedown events. Defaults
 * to true.
 * @property {Boolean} autoPreventDefault
 * @public
 */
Object.defineProperty(Display.prototype, "autoPreventDefault",
{
    get: function()
    {
        return this._autoPreventDefault;
    },
    set: function(value)
    {
        this._autoPreventDefault = !!value;
        var interactionManager = this.renderer.plugins.interaction;

        if (interactionManager)
        {
            interactionManager.autoPreventDefault = this._autoPreventDefault;
        }
    }
});

/**
 * Resizes the canvas and the renderer. This is only called by the Application.
 * @method resize
 * @param {int} width The width that the display should be
 * @param {int} height The height that the display should be
 */
Display.prototype.resize = function(width, height)
{
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.renderer.resize(width, height);
};

/**
 * Updates the stage and draws it. This is only called by the Application.
 * This method does nothing if paused is true or visible is false.
 * @method render
 * @param {int} elapsed
 * @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
 */
Display.prototype.render = function(elapsed, force)
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
Display.prototype.destroy = function()
{
    this.stage.destroy(true);
    this.stage = null;

    this.enabled = false;
    this.adapter = null;
    this.stage = null;

    if (this.canvas.parentNode)
    {
        this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas.onmousedown = null;
    this.canvas = null;

    EventDispatcher.prototype.destroy.call(this);

    this.renderer.destroy();
    this.renderer = null;
};

/**
 * If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
 * @property {Boolean} visible
 * @public
 */
Object.defineProperty(Display.prototype, "visible",
{
    // visible getter
    get: function()
    {
        return this._visible;
    },
    // visible setter
    set: function(value)
    {
        var oldVisible = this._visible;
        this._visible = value;
        this.canvas.style.display = value ? "block" : "none";

        if (oldVisible !== value)
        {
            /**
             * If the display becomes visible
             * @event visible
             */

            /**
             * If the display becomes hidden
             * @event hidden
             */
            this.trigger(value ? 'visible' : 'hidden');

            /**
             * Visibility changed on the display
             * @event visibility
             * @param {Boolean} visible Current state of the visibility
             */
            this.trigger('visibility', value);
        }
    }
});

export default Display;
