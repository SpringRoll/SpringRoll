import ApplicationPlugin from '../../ApplicationPlugin';
import Ticker from './Ticker';
    
(function() {

    const plugin = new ApplicationPlugin('ticker');

    // Init the animator
    plugin.setup = function() {
        const options = this.options;

        /**
         * The framerate to use for rendering the stage
         * @member {number} springroll.ApplicationOptions#fps
         * @default 60
         */
        options.add('fps', 60);

        /**
         * The StringFilters instance
         * @member {springroll.StringFilters} springroll.ApplicationOptions#filters
         */
        const ticker = this.ticker = new Ticker(options.fps, options.raf);

        this.options.on('fps', fps => {
            ticker.fps = fps;
        });

        // Fire an update event on the application
        ticker.on('update', (elapsed, time) => {
            
            /**
             * Fired when an update is called, every frame update
             * @event springroll.Application#update
             * @param {number} elasped - The number of milliseconds since the last frame update
             * @param {number} time - Current player time
             */
            this.emit('update', elapsed, time);
        });

        // Handle the pause state
        this.on('pause', paused => {
            if (paused) {
                ticker.stop();
            }
            else {
                ticker.start();
            }
        });

        /**
         * Works just like `window.setTimeout` but respects the pause
         * state of the Application.
         * @method springroll.Application#setTimeout
         * @param {function} callback    The callback function, passes one argument which is the DelayedCall instance
         * @param {number}   delay       The time in milliseconds or the number of frames (useFrames must be true)
         * @param {boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
         * @param {boolean}   [autoDestroy=true] If the DelayedCall object should be destroyed after completing
         * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
         */
        this.setTimeout = ticker.setTimeout.bind(ticker);

        /**
         * Works just like `window.setInterval` but respects the pause
         * state of the Application.
         * @method springroll.Application#setInterval
         * @param {function} callback    The callback function, passes one argument which is the DelayedCall instance
         * @param {number}   delay       The time in milliseconds or the number of frames (useFrames must be true)
         * @param {boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
         * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
         */
        this.setInterval = ticker.setInterval.bind(ticker);
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this.ticker) {
            this.ticker.destroy();
        }
        this.ticker = null;
    };

}());