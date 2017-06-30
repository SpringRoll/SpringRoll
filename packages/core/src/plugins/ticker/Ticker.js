import EventEmitter from '../../events/EventEmitter';
import DelayedCall from './DelayedCall';

/**
 * Handle frame update ticks.
 * ### module: @springroll/core
 * @class
 * @extends springroll.EventEmitter
 * @memberof springroll
 */
export default class Ticker extends EventEmitter {
    /**
     * @param {number} fps - Frames per second
     */
    constructor(fps) {
        super();

        /**
         * The number of ms since the last frame update
         * @private
         * @member {number}
         */
        this._lastFrameTime = 0;

        /**
         * The bound callback for listening to tick events
         * @private
         * @member {function}
         */
        this._tick = this._tick.bind(this);

        /**
         * The id of the active requestAnimationFrame or setTimeout call.
         * @member {number}
         * @private
         */
        this._tickId = -1;

        /**
         * Set the frames per second.
         * @member {number}
         * @private
         */
        this._fps = fps;

        /**
         * The number of milliseconds per frame
         * @member {number}
         * @private
         */
        this._msPerFrame = 0;

        /**
         * If we are currently running
         * @member {boolean}
         * @private
         */
        this._running = false;

        /**
         * Accumulated number of milliseconds since start.
         * @member {number}
         * @private
         */
        this._time = performance.now();

        // Set the frames
        this.fps = fps;
    }

    /**
     * Se the frames per second.
     * @member {number}
     */
    set fps(fps) {
        if (typeof fps === 'number') {
            this._msPerFrame = (1000 / fps) | 0;
            this._fps = fps;
        }
    }
    get fps() {
        return this._fps;
    }

    /**
     * Begin the ticker.
     */
    start() {
        this._running = true;
        if (this._tickId === -1) {
            this._lastFrameTime = performance.now();
            this._tickId = requestAnimationFrame(this._tick);
        }
    }

    /**
     * Stop or pause the ticker.
     */
    stop() {
        this._running = false;

        if (this._tickId !== -1) {
            cancelAnimationFrame(this._tickId);
            this._tickId = -1;
        }
    }

    /**
     * _tick would be bound in _tick
     * @private
     */
    _tick() {
        if (!this._running) {
            this._tickId = -1;
            return;
        }

        const now = performance.now();
        const elapsed = now - this._lastFrameTime;
        this._lastFrameTime = now;

        /**
         * Frame is updated.
         * @event springroll.Ticker#update
         * @param {number} elapsed - Time elapsed since last frame in milliseconds
         * @param {number} time - Current time in micromilliseconds
         */
        this.emit('update', elapsed, this._time += elapsed);

        //request the next animation frame
        this._tickId = requestAnimationFrame(this._tick);
    }

    /**
     * Works just like `window.setTimeout` but respects the pause
     * state of the Application.
     * @param {function} callback    The callback function, passes one argument which is the DelayedCall instance
     * @param {number}   delay       The time in milliseconds or the number of frames (useFrames must be true)
     * @param {boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
     * @param {boolean}   [autoDestroy=true] If the DelayedCall object should be destroyed after completing
     * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
     */
    setTimeout(callback, delay, useFrames, autoDestroy) {
        return new DelayedCall(this, callback, delay, false, autoDestroy, useFrames);
    }

    /**
     * Works just like `window.setInterval` but respects the pause
     * state of the Application.
     * @param {function} callback    The callback function, passes one argument which is the DelayedCall instance
     * @param {number}   delay       The time in milliseconds or the number of frames (useFrames must be true)
     * @param {boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
     * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
     */
    setInterval(callback, delay, useFrames) {
        return new DelayedCall(this, callback, delay, true, false, useFrames);
    }

    /**
     * Destroy and don't use after this.
     */
    destroy() {
        this.stop();
        this._tick = null;
        super.destroy();
    }
}
