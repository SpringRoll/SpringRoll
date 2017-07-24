import {EventEmitter} from '@springroll/core';

/**
 * Display is a display plugin for the springroll Framework
 * that uses the Pixi library for rendering.
 * ### module: @springroll/display
 * @class
 * @extends springroll.EventEmitter
 * @memberof springroll
 */
export default class Display extends EventEmitter {
    /**
     * The ID of the DOM element which contains all of the SpringRoll display elements.
     * @member {string}
     * @readOnly
     * @default 'springroll'
     */
    static get FRAME_ID() {
        return 'springroll';
    }

    /**
     * The ID of the DOM element which contains the display's HTMLCanvasElement.
     * @member {string}
     * @readOnly
     * @default 'springroll-display'
     */
    static get DISPLAY_ID() {
        return 'springroll-display';
    }

    /**
     * The ID of the HTMLCanvasElement for display.
     * @member {string}
     * @readOnly
     * @default 'springroll-stage'
     */
    static get STAGE_ID() {
        return 'springroll-stage';
    }

    /**
     * @param {HTMLElement} container - Container for the canvas element.
     * @param {object} [options] Include all renderer option for PIXI renderers. See
     *        http://pixijs.download/release/docs/PIXI.html#.autoDetectRenderer for more info.
     * @param {string} [options.forceContext=null] If a specific renderer should be used instead
     *        of WebGL falling back to Canvas. Use "webgl" or "canvas2d" to specify a renderer.
     * @param {boolean} [options.autoPreventDefault=true] `true` to call preventDefault() on
     *        all touch events and mousedown events.
     */
    constructor(container, options) {
        super();

        options = Object.assign({
            forceContext: null, // force context 
            autoPreventDefault: true, // specific to springroll
            width: 800,
            height: 600
        }, options || {});


        /**
         * The DOM id for the canvas
         * @member {string}
         * @readOnly
         */
        this.id = Display.DISPLAY_ID;

        /**
         * Convenience method for getting the width of the canvas element
         * would be the same thing as view.width
         * @member {number}
         * @readOnly
         */
        this.width = options.width;

        /**
         * Convenience method for getting the height of the canvas element
         * would be the same thing as view.height
         * @member {number}
         * @readOnly
         */
        this.height = options.height;

        /**
         * The main rendering context or the root display object or stage.
         * @member {any}
         * @readOnly
         */
        this.stage = null;

        /**
         * If rendering is paused on this display only. Pausing all displays can be done
         * using Application.paused setter.
         * @member {boolean}
         */
        this.paused = false;

        /**
         * If input is enabled on the stage.
         * @member {boolean}
         * @private
         */
        this._enabled = false;

        /**
         * If the display is visible.
         * @member {boolean}
         * @private
         */
        this._visible = true;

        /**
         * If preventDefault() should be called on all touch events and mousedown events. Defaults
         * to true.
         * @member {boolean}
         * @private
         */
        this._autoPreventDefault = options.autoPreventDefault;

        /**
         * The rendering library's stage element, the root display object
         * @member {PIXI.Stage}
         * @readOnly
         */
        this.stage = new PIXI.Container();

        /**
         * The Pixi renderer.
         * @member {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
         * @readOnly
         */
        this.renderer = null;

        //check for IE11 because it tends to have WebGL problems (especially older versions)
        //if we find it, then make Pixi use to the canvas renderer instead
        if (navigator.userAgent.indexOf('Trident/7.0') > -1) {
            options.forceContext = 'canvas2d';
        }

        if (options.forceContext === 'canvas2d') {
            this.renderer = new PIXI.CanvasRenderer(
                this.width, 
                this.height,
                options
            );
        }
        else if (options.forceContext === 'webgl') {
            this.renderer = new PIXI.WebGLRenderer(
                this.width, 
                this.height,
                options
            );
        }
        else {
            this.renderer = PIXI.autoDetectRenderer(
                this.width, 
                this.height,
                options
            );
        }

        // View should be created by the renderer here
        // especially if it's not passed in through the options
        container.appendChild(this.view);

        // Add ID to the view
        this.view.id = Display.STAGE_ID;

        /**
         * If Pixi is being rendered with WebGL.
         * @member {boolean}
         * @readOnly
         */
        this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;

        // Initialize the autoPreventDefault
        this.autoPreventDefault = this._autoPreventDefault;
    }

    /**
     * If input is enabled on the stage for this display. The default is true.
     * @member {boolean}
     */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        let oldEnabled = this._enabled;
        this._enabled = value;

        if (oldEnabled === value) {
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
         * @param {boolean} enabled Current state of enabled
         */
        this.emit('enable', value);
    }

    /**
     * If preventDefault() should be called on all touch events and mousedown events. Defaults
     * to true.
     * @member {boolean}
     */
    get autoPreventDefault() {
        return this._autoPreventDefault;
    }
    set autoPreventDefault(value) {
        this._autoPreventDefault = !!value;

        const interactionManager = this.renderer.plugins.interaction;

        if (interactionManager) {
            interactionManager.autoPreventDefault = this._autoPreventDefault;
        }
    }

    /**
     * Resizes the canvas and the renderer. This is only called by the Application.
     * @param {number} width The width that the display should be
     * @param {number} height The height that the display should be
     */
    resize(width, height) {
        this.width = this.view.width = width;
        this.height = this.view.height = height;

        this.renderer.resize(width, height);
    }

    /**
     * Updates the stage and draws it. This is only called by the Application.
     * This method does nothing if paused is true or visible is false.
     * @param {number} elapsed
     * @param {boolean} [force=false] Will re-render even if the game is paused or not visible
     */
    render(elapsed, force = false) {
        if (force || (!this.paused && this._visible)) {
            this.renderer.render(this.stage);
        }
    }

    /**
     * Destroys the display. This method is called by the Application and should
     * not be called directly, use Application.removeDisplay(id).
     */
    destroy() {
        this.stage.destroy(true);
        this.stage = null;

        this.enabled = false;

        super.destroy();

        this.renderer.destroy(true);
        this.renderer = null;
    }

    /**
     * Canvas element which renders the display.
     * @member {HTMLCanvasElement}
     * @readonly
     */
    get view() {
        return this.renderer.view;
    }

    /**
     * If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
     * @member {boolean}
     */
    get visible() {
        return this._visible;
    }
    // visible setter
    set visible(value) {
        let oldVisible = this._visible;
        this._visible = value;
        this.view.style.display = value ? 'block' : 'none';

        if (oldVisible === value) {
            return;
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
         * @param {boolean} visible Current state of the visibility
         */
        this.emit('visibility', value);
    }
}
