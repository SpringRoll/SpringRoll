import {ApplicationPlugin} from '@springroll/core';
import Display from '../Display';

// import {TextureTask, TextureAtlasTask, BitmapFontTask} from '../../tasks';
    
(function() {

    const plugin = new ApplicationPlugin('display', ['dom', 'ticker']);

    // Init the animator
    plugin.setup = function() {

        /**
         * Display specific setup options
         * ### module: @springroll/display
         * @member {Object} display
         * @memberof springroll.ApplicationOptions#
         */
        this.options.add('display', null, true);

        /**
         * Primary renderer for the application, for simply accessing
         * `Application.instance.display.stage`
         * ### module: @springroll/display
         * @member {springroll.Display} display
         * @memberof springroll.Application#
         */
        this.display = null;

        /**
         * Render the displays, if any.
         * ### module: @springroll/display
         * @method render
         * @memberof springroll.Application#
         * @param {Number} elapsed Time elapsed since last frame render
         * @param {Boolean} [force=false] For update, regardless if visible/paused state.
         */
        this.render = (elapsed, force = false) => {
            if (this.display) {
                this.display.render(elapsed, force);
            }
        };

        // Ticker handle updates added to the ticker directly and not the Application
        // so that it will always run after the Application's update event.
        this.ticker.on('update', this.render, this);

        // Handle enabled
        this.on('enable', enabled => {
            this.display.enabled = enabled;
        });

        // add the initial display if specified
        this.once('beforePreload', () => {
            this.display = new Display(
                this.displayElement,
                this.options.display
            );
        });
    };

    // Destroy the animator
    plugin.teardown = function() {
        this.ticker.off('update', this.render, this);
        this.render = null;

        if (this.display) {
            this.display.destroy();
            this.display = null;
        }
    };

}());