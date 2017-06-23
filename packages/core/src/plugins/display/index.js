import ApplicationPlugin from '../../ApplicationPlugin';
    
(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('display', ['ticker']);

    // Init the animator
    plugin.setup = function()
    {
        const options = this.options;

        /**
         * The default display DOM ID name
         * @property {String} options.canvasId
         */
        options.add('canvasId', null, true);

        /**
         * The name of the class to automatically instantiate as the
         * display (e.g. `springroll.PixiDisplay`)
         * @property {Function} options.display
         */
        options.add('display', null, true);

        /**
         * Display specific setup options
         * @property {Object} options.displayOptions
         */
        options.add('displayOptions', null, true);

        /**
         * Primary renderer for the application, for simply accessing
         * Application.instance.display.stage;
         * The first display added becomes the primary display automatically.
         * @property {Display} display
         * @public
         */
        this.display = null;

        /**
         * The collection of displays
         * @property {Array} _displays
         * @private
         */
        this._displays = [];

        /**
         * The displays by canvas id
         * @property {Object} _displaysMap
         * @private
         */
        this._displaysMap = {};

        /**
         * Add a display. If this is the first display added, then it will be stored as this.display.
         * @method addDisplay
         * @param {String} id The id of the canvas element, this will be used to grab the Display later
         *                   also the Display should be the one to called document.getElementById(id)
         *                   and not the application sinc we don't care about the DOMElement as this
         *                   point
         * @param {function} displayConstructor The function to call to create the display instance
         * @param {Object} [options] Optional Display specific options
         * @return {Display} The created display.
         */
        this.addDisplay = (id, displayConstructor, options) => {

            if (this._displaysMap[id])
            {
                throw `Display exists with id '${id}'`;
            }
            // Creat the display
            var display = new displayConstructor(id, options);

            // Add it to the collections
            this._displaysMap[id] = display;
            this._displays.push(display);

            // Inherit the enabled state from the application
            display.enabled = this._enabled;

            if (!this.display)
            {
                this.display = display;
            }

            /**
             * When a display is added.
             * @event displayAdded
             * @param {springroll.AbstractDisplay} [display] The current display being added
             */
            this.emit('displayAdded', display);
            return display;
        };

        /**
         * Get all the displays
         * @property {Array} displays
         * @readOnly
         */
        Object.defineProperty(this, 'displays', {
            get()
            {
                return this._displays;
            }
        });

        /**
         * Gets a specific renderer by the canvas id.
         * @method getDisplay
         * @param {String} id The id of the canvas
         * @return {Display} The requested display.
         */
        this.getDisplay = (id) => {
            return this._displaysMap[id];
        };

        /**
         * Removes and destroys a display
         * @method removeDisplay
         * @param {String} id The Display's id (also the canvas ID)
         */
        this.removeDisplay = (id) => {
            var display = this._displaysMap[id];
            if (display)
            {
                this._displays.splice(this._displays.indexOf(display), 1);
                display.destroy();
                delete this._displaysMap[id];

                /**
                 * When a display is removed.
                 * @event displayRemoved
                 * @param {string} [displayId] The display alias
                 */
                this.emit('displayRemoved', id);
            }
        };

        /**
         * Render the displays, if any.
         * @method render
         * @param {Number} elapsed Time elapsed since last frame render
         */
        this.render = (elapsed) => {
            if (this._displays)
            {
                for (let i = 0; i < this._displays.length; i++)
                {
                    this._displays[i].render(elapsed);
                }
            }
        }

        // Ticker handle updates
        // added to the ticker directly and not the application
        // so that it will always run after the Application's
        // update event.
        this.ticker.on('update', this.render, this);

        // Handle enabled
        this.on('enable', enabled => {
            this._displays.forEach(display => {
                display.enabled = enabled;
            });
        });

        // add the initial display if specified
        if (options.canvasId && options.display)
        {
            this.once('beforePreload', () => {
                this.addDisplay(
                    options.canvasId,
                    options.display,
                    options.displayOptions
                );
            });
        }
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        this.ticker.off('update', this.render, this);
        this._displays.forEach(display => {
            display.destroy();
        });
        this.render = null;
        this.removeDisplay = null;
        this.getDisplay = null;
        this.addDisplay = null;
        this._displays = null;
        this._displaysMap = null;
        this.display = null;   
    };

}());