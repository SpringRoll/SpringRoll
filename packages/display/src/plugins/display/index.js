import {ApplicationPlugin} from '@springroll/core';
import Display from '../../Display';

// import {TextureTask, TextureAtlasTask, BitmapFontTask} from '../../tasks';
    
(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('display', 'ticker');

    // Init the animator
    plugin.setup = function()
    {
        // this.assetManager.register(TextureTask, 60);
        // this.assetManager.register(TextureAtlasTask, 70);
        // this.assetManager.register(BitmapFontTask, 80);

        const options = this.options;

        /**
         * The default display DOM ID name
         * @property {String} options.displayElement
         * @default 'springroll-display'
         */
        options.add('displayElement', 'springroll-display', true);

        /**
         * Display specific setup options
         * @property {Object} options.display
         */
        options.add('display', null, true);

        /**
         * Primary renderer for the application, for simply accessing
         * Application.instance.display.stage;
         * The first display added becomes the primary display automatically.
         * @property {springroll.Display} display
         * @public
         */
        this.display = null;

        /**
         * Render the displays, if any.
         * @method render
         * @param {Number} elapsed Time elapsed since last frame render
         * @param {Boolean} [force=false] For update, regardless if visible/paused state.
         */
        this.render = (elapsed, force = false) => {
            if (this.display)
            {
                this.display.render(elapsed, force);
            }
        }

        // Ticker handle updates added to the ticker directly and not the Application
        // so that it will always run after the Application's update event.
        this.ticker.on('update', this.render, this);

        // Handle enabled
        this.on('enable', enabled => {
            this.display.enabled = enabled;
        });

        // add the initial display if specified
        this.once('beforePreload', () => {
            this.display = new Display(options.displayElement, options.display);
        });
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        this.ticker.off('update', this.render, this);
        this.render = null;

        if (this.display)
        {
            this.display.destroy();
            this.display = null;
        }
    };

}());