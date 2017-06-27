/**
 * A class for delaying a call through the Application, instead of relying on setInterval() or
 * setTimeout().
 *
 * @class DelayedCall
 * @constructor
 * @param {springroll.Ticker} ticker Instance of ticker
 * @param {function} callback The function to call when the delay has completed.
 * @param {int} delay The time to delay the call, in milliseconds (or optionally frames).
 * @param {Object|Boolean} [options=false] The options to use or repeat value
 * @param {Boolean} [options.repeat=false] If the DelayedCall should automatically repeat itself when
 *                              completed.
 * @param {Boolean} [options.autoDestroy=true] If the DelayedCall should clean itself up when completed.
 * @param {Boolean} [options.useFrames=false] If the DelayedCall should use frames instead of
 *                                 milliseconds for the delay.
 */
export default class DelayedCall {
    constructor(ticker, callback, delay, options) {
        // Set the default options
        options = Object.assign({
            repeat: false,
            autoDestroy: true,
            useFrames: false
        }, options || {});

        /**
         * Update ticker
         * @property {springroll.Ticker} _ticker
         * @private
         */
        this._ticker = ticker;

        /**
         * The function to call when the delay is completed.
         * @private
         * @property {function} _callback
         */
        this._callback = callback;

        /**
         * The delay time, in milliseconds.
         * @private
         * @property {int} _delay
         */
        this._delay = delay;

        /**
         * The timer counting down from _delay, in milliseconds.
         * @private
         * @property {int} _timer
         */
        this._timer = delay;

        /**
         * If the DelayedCall should repeat itself automatically.
         * @private
         * @property {Boolean} _repeat
         * @default false
         */
        this._repeat = options.repeat;

        /**
         * If the DelayedCall should destroy itself after completing
         * @private
         * @property {Boolean} _autoDestroy
         * @default true
         */
        this._autoDestroy = options.autoDestroy;

        /**
         * If the DelayedCall should use frames instead of milliseconds for the delay.
         * @private
         * @property {Boolean} _useFrames
         * @default false
         */
        this._useFrames = options.useFrames;

        /**
         * If the DelayedCall is currently paused (not stopped).
         * @private
         * @property {Boolean} _paused
         */
        this._paused = false;

        //save a bound version of the update function
        this._update = this._update.bind(this);

        //start the delay
        this._ticker.on('update', this._update, this);
    }

    /**
     * The callback supplied to the Application for an update each frame.
     * @private
     * @method _update
     * @param {int} elapsed The time elapsed since the previous frame.
     */
    _update(elapsed) {
        if (!this._callback) {
            this.destroy();
            return;
        }

        this._timer -= this._useFrames ? 1 : elapsed;

        if (this._timer <= 0) {
            this._callback(this);

            if (this._repeat) {
                this._timer += this._delay;
            }
            else if (this._autoDestroy) {
                this.destroy();
            }
            else {
                this._ticker.off('update', this._update, this);
            }
        }
    }

    /**
     * Restarts the DelayedCall, whether it is running or not.
     * @public
     * @method restart
     */
    restart() {
        if (!this._callback) {
            return;
        }

        if (!this._ticker.has('update', this._update)) {
            this._ticker.on('update', this._update, this);
        }

        this._timer = this._delay;
        this._paused = false;
    }

    /**
     * Stops the DelayedCall, without destroying it.
     * @public
     * @method stop
     */
    stop() {
        this._ticker.off('update', this._update, this);
        this._paused = false;
    }

    /**
     * If the DelayedCall is paused or not.
     * @public
     * @property {Boolean} paused
     */
    get paused() {
        return this._paused;
    }
    set paused(value) {
        if (!this._callback) {
            return;
        }
        
        if (this._paused && !value) {
            this._paused = false;

            if (!this._ticker.has('update', this._update)) {
                this._ticker.on('update', this._update, this);
            }
        }
        else if (value) {
            if (this._ticker.has('update', this._update)) {
                this._paused = true;
                this._ticker.off('update', this._update, this);
            }
        }
    }

    /**
     * Stops and cleans up the DelayedCall. Do not use it after calling
     * destroy().
     * @public
     * @method destroy
     */
    destroy() {
        this._ticker.off('update', this._update, this);
        this._callback = null;
        this._ticker = null;
    }
}
