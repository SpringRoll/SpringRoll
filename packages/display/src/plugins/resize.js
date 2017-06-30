
import {include} from '@springroll/core';

import {ApplicationPlugin} from '@springroll/core';

(function() {
    const devicePixelRatio = include('devicePixelRatio', false);

    const plugin = new ApplicationPlugin('resize', ['dom', 'display']);

    /**
     * The maximum width of the primary display, compared to the original height.
     * @member {number}
     * @private
     */
    let maxWidth = 0;

    /**
     * The maximum height of the primary display, compared to the original width.
     * @member {number}
     * @private
     */
    let maxHeight = 0;

    /**
     * The original width of the primary display, used to calculate the aspect ratio.
     * @member {number}
     * @private
     */
    let originalWidth = 0;

    /**
     * The original height of the primary display, used to calculate the aspect ratio.
     * @member {number}
     * @private
     */
    let originalHeight = 0;

    /**
     * A helper object to avoid object creation each resize event.
     * @member {object}
     * @private
     */
    let resizeHelper = {
        width: 0,
        height: 0,
        normalWidth: 0,
        normalHeight: 0
    };

    /**
     * The timeout when the window is being resized
     * @member {springroll.DelayedCall}
     * @private
     */
    let windowResizer = null;

    // Init the animator
    plugin.setup = function() {

        const {options} = this;

        /**
         * Fired when a resize is called
         * ### module: @springroll/display
         * @event springroll.Application#resize
         * @param {number} width The width of the resize element
         * @param {number} height The height of the resize element
         */

        /**
         * If doing uniform resizing, optional parameter to add
         * a maximum width relative to the original height. This
         * allows for "title-safe" responsiveness. Must be greater
         * than the original width of the canvas.
         * ### module: @springroll/display
         * @member {number} maxWidth
         * @memberof springroll.ApplicationOptions#
         */
        options.add('maxWidth', 0);

        /**
         * If doing uniform resizing, optional parameter to add
         * a maximum height relative to the original width. This
         * allows for "title-safe" responsiveness. Must be greater
         * than the original height of the canvas.
         * ### module: @springroll/display
         * @member {number} maxHeight
         * @memberof springroll.ApplicationOptions#
         */
        options.add('maxHeight', 0);

        /**
         * Whether to resize the displays to the original aspect ratio
         * ### module: @springroll/display
         * @member {boolean} uniformResize
         * @memberof springroll.ApplicationOptions#
         * @default true
         */
        options.add('uniformResize', true);

        /**
         * If responsive is true, the width and height properties
         * are adjusted on the `<canvas>` element. It's assumed that
         * responsive applications will adjust their own elements.
         * If responsive is false then the style properties are changed.
         * ### module: @springroll/display
         * @member {boolean} responsive
         * @memberof springroll.ApplicationOptions#
         * @default false
         */
        options.add('responsive', false, true);

        /**
         * Whether to account for devicePixelRatio when rendering game
         * ### module: @springroll/display
         * @member {boolean} retina
         * @memberof springroll.ApplicationOptions#
         * @default false
         */
        options.add('retina', false);

        options.on('maxWidth', value => {
            maxWidth = value;
        });

        options.on('maxHeight', value => {
            maxHeight = value;
        });

        /**
         * The current width of the application, in real point values
         * ### module: @springroll/display
         * @member {number} realWidth
         * @memberof springroll.Application#
         */
        this.realWidth = 0;

        /**
         * The current height of the application, in real point values
         * ### module: @springroll/display
         * @member {number} realHeight
         * @memberof springroll.Application#
         */
        this.realHeight = 0;

        /**
         * Fire a resize event with the current width and height of the display
         * ### module: @springroll/display
         * @method triggerResize
         * @memberof springroll.Application#
         */
        this.triggerResize = () => {

            const {frameElement} = this;

            // window uses innerWidth, DOM elements clientWidth
            resizeHelper.width = (frameElement.innerWidth || frameElement.clientWidth) | 0;
            resizeHelper.height = (frameElement.innerHeight || frameElement.clientHeight) | 0;

            this.calculateDisplaySize(resizeHelper);

            // round up, as canvases require integer sizes
            // and canvas should be slightly larger to avoid
            // a hairline around outside of the canvas
            let {width, height, normalWidth, normalHeight} = resizeHelper;

            this.realWidth = width;
            this.realHeight = height;

            let responsive = this.options.responsive;
            let retina = this.options.retina;

            if (responsive) {
                if (retina && devicePixelRatio) {
                    this.display.view.style.width = `${width}px`;
                    this.display.view.style.height = `${height}px`;

                    width *= devicePixelRatio;
                    height *= devicePixelRatio;
                }
                // update the dimensions of the canvas
                this.display.resize(width, height);
            }
            else {
                // scale the canvas element
                this.display.view.style.width = `${width}px`;
                this.display.view.style.height = `${height}px`;

                if (retina && devicePixelRatio) {
                    normalWidth *= devicePixelRatio;
                    normalHeight *= devicePixelRatio;
                }
                // Update the canvas size for maxWidth and maxHeight
                this.display.resize(normalWidth, normalHeight);
            }

            //send out the resize event
            this.emit('resize', (responsive ? width : normalWidth), (responsive ? height : normalHeight));

            //redraw all displays
            this.display.render(0, true); // force renderer
        };

        /**
         * Handle the window resize events.
         * @private
         */
        this._onWindowResize = () => {
            // Call the resize once
            this.triggerResize();

            // After a short timeout, call the resize again
            // this will solve issues where the window doesn't
            // properly get the "full" resize, like on some mobile
            // devices when pulling-down/releasing the HUD
            windowResizer = this.setTimeout(() => {
                this.triggerResize();
                windowResizer = null;
            }, 500);
        };

        /**
         * Calculates the resizing of displays. By default, this limits the new size
         * to the initial aspect ratio of the primary display. Override this function
         * if you need variable aspect ratios.
         * ### module: @springroll/display
         * @method calculateDisplaySize
         * @memberof springroll.Application#
         * @param {object} size A size object containing the width and height of the resized container.
         *                     The size parameter is also the output of the function, so the size
         *                     properties are edited in place.
         * @param {number} size.width The width of the resized container.
         * @param {number} size.height The height of the resized container.
         */
        this.calculateDisplaySize = function(size) {
            if (!originalHeight || !this.options.uniformResize) {
                return;
            }

            let maxAspectRatio = maxWidth / originalHeight;
            let minAspectRatio = originalWidth / maxHeight;
            let originalAspect = originalWidth / originalHeight;
            let currentAspect = size.width / size.height;

            if (currentAspect < minAspectRatio) {
                //limit to the narrower width
                size.height = size.width / minAspectRatio;
            }
            else if (currentAspect > maxAspectRatio) {
                //limit to the shorter height
                size.width = size.height * maxAspectRatio;
            }


            // Calculate the unscale, real-sizes
            currentAspect = size.width / size.height;
            size.normalWidth = originalWidth;
            size.normalHeight = originalHeight;

            if (currentAspect > originalAspect) {
                size.normalWidth = originalHeight * currentAspect;
            }
            else if (currentAspect < originalAspect) {
                size.normalHeight = originalWidth / currentAspect;
            }

            // round up, as canvases require integer sizes
            // and canvas should be slightly larger to avoid
            // a hairline around outside of the canvas
            size.width = Math.ceil(size.width);
            size.height = Math.ceil(size.height);
            size.normalWidth = Math.ceil(size.normalWidth);
            size.normalHeight = Math.ceil(size.normalHeight);
        };

        // Do an initial resize to make sure everything is positioned correctly
        this.once('beforeReady', () => {

            originalWidth = this.display.width;
            originalHeight = this.display.height;

            if (!maxWidth) {
                maxWidth = originalWidth;
            }

            if (!maxHeight) {
                maxHeight = originalHeight;
            }

            this.triggerResize();
        });
    };

    // Add common filters interaction
    plugin.preload = function(done) {
        window.addEventListener('resize', this._onWindowResize);
        done();
    };

    plugin.teardown = function() {
        if (windowResizer) {
            windowResizer.destroy();
            windowResizer = null;
        }
        window.removeEventListener('resize', this._onWindowResize);
        resizeHelper.width = 0;
        resizeHelper.height = 0;
        resizeHelper.normalWidth = 0;
        resizeHelper.normalHeight = 0;
        originalWidth = 0;
        originalHeight = 0;
        maxHeight = 0;
        maxWidth = 0;
    };

}());