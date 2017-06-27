import DisplayAdapter from './DisplayAdapter';
import {EventEmitter} from '@springroll/core';

/**
 * Display is a display plugin for the springroll Framework
 * that uses the Pixi library for rendering.
 *
 * @class Display
 * @constructor
 * @param {Object} [options] Include all renderer option for PIXI renderers. See
 *        http://pixijs.download/release/docs/PIXI.html#.autoDetectRenderer for more info.
 * @param {String} [options.forceContext=null] If a specific renderer should be used instead
 *        of WebGL falling back to Canvas. Use "webgl" or "canvas2d" to specify a renderer.
 * @param {Boolean} [options.autoPreventDefault=true] `true` to call preventDefault() on
 *        all touch events and mousedown events.
 */
export default class Display extends EventEmitter
{
    constructor(id, options)
    {
        super();

        options = Object.assign({
            forceContext: null, // force context 
            autoPreventDefault: true, // specific to springroll
            width: 800,
            height: 600
        }, options || {});

        const container = document.getElementById(id);

        if (!container)
        {
            throw `No <div> element found matching id "${id}"`;
        }

        /**
         * The DOM id for the canvas
         * @property {String} id
         * @readOnly
         * @public
         */
        this.id = id;

        /**
         * Convenience method for getting the width of the canvas element
         * would be the same thing as view.width
         * @property {int} width
         * @readOnly
         * @public
         */
        this.width = options.width;

        /**
         * Convenience method for getting the height of the canvas element
         * would be the same thing as view.height
         * @property {int} height
         * @readOnly
         * @public
         */
        this.height = options.height;

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
        this._visible = true;

        /**
         * If preventDefault() should be called on all touch events and mousedown events. Defaults
         * to true.
         * @property {Boolean} _autoPreventDefault
         * @private
         */
        this._autoPreventDefault = options.autoPreventDefault;

        /**
         * The rendering library's stage element, the root display object
         * @property {PIXI.Stage} stage
         * @readOnly
         * @public
         */
        this.stage = new PIXI.Container();

        /**
         * Normalizes the interactions with the PIXI renderer
         * @property {springroll.DisplayAdapter}
         * @readonly
         */
        this.adapter = DisplayAdapter;

        /**
         * The Pixi renderer.
         * @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer
         * @readOnly
         * @public
         */
        this.renderer = null;

        //check for IE11 because it tends to have WebGL problems (especially older versions)
        //if we find it, then make Pixi use to the canvas renderer instead
        if (navigator.userAgent.indexOf('Trident/7.0') > -1)
        {
            options.forceContext = 'canvas2d';
        }

        if (options.forceContext === 'canvas2d')
        {
            this.renderer = new PIXI.CanvasRenderer(
                this.width, 
                this.height,
                options
            );
        }
        else if (options.forceContext === 'webgl')
        {
            this.renderer = new PIXI.WebGLRenderer(
                this.width, 
                this.height,
                options
            );
        }
        else
        {
            this.renderer = PIXI.autoDetectRenderer(
                this.width, 
                this.height,
                options
            );
        }

        // View should be created by the renderer here
        // especially if it's not passed in through the options
        container.appendChild(this.view);

        /**
         * If Pixi is being rendered with WebGL.
         * @property {Boolean} isWebGL
         * @readOnly
         * @public
         */
        this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;

        // Initialize the autoPreventDefault
        this.autoPreventDefault = this._autoPreventDefault;
    }

    /**
     * If input is enabled on the stage for this display. The default is true.
     * @property {Boolean} enabled
     * @public
     */
    get enabled()
    {
        return this._enabled;
    }
    set enabled(value)
    {
        var oldEnabled = this._enabled;
        this._enabled = value;

        if (oldEnabled === value)
        {
            return;
        }

        /**
         * If the display becomes enabled
         * @event enabled
         */

        /**
         * If the display becomes disabled
         * @event disabled
         */
        this.emit(value ? 'enabled' : 'disabled');

        /**
         * Enabled state changed on the display
         * @event enable
         * @param {Boolean} enabled Current state of enabled
         */
        this.emit('enable', value);
    }

    /**
     * If preventDefault() should be called on all touch events and mousedown events. Defaults
     * to true.
     * @property {Boolean} autoPreventDefault
     * @public
     */
    get autoPreventDefault()
    {
        return this._autoPreventDefault;
    }
    set autoPreventDefault(value)
    {
        this._autoPreventDefault = !!value;

        const interactionManager = this.renderer.plugins.interaction;

        if (interactionManager)
        {
            interactionManager.autoPreventDefault = this._autoPreventDefault;
        }
    }

    /**
     * Resizes the canvas and the renderer. This is only called by the Application.
     * @method resize
     * @param {int} width The width that the display should be
     * @param {int} height The height that the display should be
     */
    resize(width, height)
    {
        this.width = this.view.width = width;
        this.height = this.view.height = height;

        this.renderer.resize(width, height);
    }

    /**
     * Updates the stage and draws it. This is only called by the Application.
     * This method does nothing if paused is true or visible is false.
     * @method render
     * @param {int} elapsed
     * @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
     */
    render(elapsed, force = false)
    {
        if (force || (!this.paused && this._visible))
        {
            this.renderer.render(this.stage);
        }
    }

    /**
     * Destroys the display. This method is called by the Application and should
     * not be called directly, use Application.removeDisplay(id).
     * @method destroy
     */
    destroy()
    {
        this.stage.destroy(true);
        this.stage = null;

        this.enabled = false;
        this.view = null;

        super.destroy();

        this.renderer.destroy(true);
        this.renderer = null;
    }

    /**
     * Canvas element which renders the display.
     * @property {HTMLCanvasElement} view
     * @readonly
     */
    get view()
    {
        return this.renderer.view;
    }

    /**
     * If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
     * @property {Boolean} visible
     * @public
     */
    get visible()
    {
        return this._visible;
    }
    // visible setter
    set visible(value)
    {
        var oldVisible = this._visible;
        this._visible = value;
        this.view.style.display = value ? 'block' : 'none';

        if (oldVisible === value)
        {
            return
        }
        /**
         * If the display becomes visible
         * @event visible
         */

        /**
         * If the display becomes hidden
         * @event hidden
         */
        this.emit(value ? 'visible' : 'hidden');

        /**
         * Visibility changed on the display
         * @event visibility
         * @param {Boolean} visible Current state of the visibility
         */
        this.emit('visibility', value);
    }
}
