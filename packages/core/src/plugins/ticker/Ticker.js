import EventEmitter from '../../events/EventEmitter';
import DelayedCall from './DelayedCall';

/**
 * Handle frame update ticks.
 * @class Ticker
 * @namespace springroll
 * @extends springroll.EventEmitter
 * @param {Number} fps - Frames per second
 */
export default class Ticker extends EventEmitter
{
    constructor(fps)
    {
        super();

        /**
         * The number of ms since the last frame update
         * @private
         * @property {int} _lastFrameTime
         */
        this._lastFrameTime = 0;

        /**
         * The bound callback for listening to tick events
         * @private
         * @property {Function} _tick
         */
        this._tick = this._tick.bind(this);

        /**
         * The id of the active requestAnimationFrame or setTimeout call.
         * @property {Number} _tickId
         * @private
         */
        this._tickId = -1;

        /**
         * Set the frames per second.
         * @property {Number} _fps
         * @private
         */
        this._fps = fps;

        /**
         * The number of milliseconds per frame
         * @property {int} _msPerFrame
         * @private
         */
        this._msPerFrame = 0;

        /**
         * If we are currently running
         * @property {boolean} _running
         * @private
         */
        this._running = false;

        // Set the frames
        this.fps = fps;
    }

    /**
     * Se the frames per second.
     * @property {Number} fps
     */
    set fps(fps)
    {
        if (typeof fps === 'number')
        {
            this._msPerFrame = (1000 / fps) | 0;
            this._fps = fps;
        }
    }
    get fps()
    {
        return this._fps;
    }

    /**
     * Begin the ticker.
     * @method
     */
    start()
    {
        this._running = true;

        if (this._tickId === -1)
        {
            this._lastFrameTime = performance.now();
            this._tickId = requestAnimationFrame(this._tick);
        }
    }

    /**
     * Stop or pause the ticker.
     * @method
     */
    stop()
    {
        this._running = false;

        if (this._tickId !== -1)
        {
            cancelAnimationFrame(this._tickId);
            this._tickId = -1;
        }
    }

    /**
     * _tick would be bound in _tick
     * @method _tick
     * @private
     */
    _tick()
    {
        if (!this._running)
        {
            this._tickId = -1;
            return;
        }

        const now = performance.now();
        const elapsed = now - this._lastFrameTime;
        this._lastFrameTime = now;

        /**
         * Frame is updated.
         * @event update
         * @param {number} elapsed - Time elapsed since last frame in milliseconds
         * @param {number} time - Current time in micromilliseconds
         */
        this.emit('update', elapsed, now);

        //request the next animation frame
        this._tickId = requestAnimationFrame(this._tick);
    }

    /**
     * Works just like `window.setTimeout` but respects the pause
     * state of the Application.
     * @method  setTimeout
     * @param {Function} callback    The callback function, passes one argument which is the DelayedCall instance
     * @param {int}   delay       The time in milliseconds or the number of frames (useFrames must be true)
     * @param {Boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
     * @param {[type]}   [autoDestroy=true] If the DelayedCall object should be destroyed after completing
     * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
     */
    setTimeout(callback, delay, useFrames, autoDestroy)
    {
        return new DelayedCall(this, callback, delay, false, autoDestroy, useFrames);
    }

    /**
     * Works just like `window.setInterval` but respects the pause
     * state of the Application.
     * @method  setInterval
     * @param {Function} callback    The callback function, passes one argument which is the DelayedCall instance
     * @param {int}   delay       The time in milliseconds or the number of frames (useFrames must be true)
     * @param {Boolean}   [useFrames=false]   If the delay is frames (true) or millseconds (false)
     * @return {springroll.DelayedCall} The object for pausing, restarting, destroying etc.
     */
    setInterval(callback, delay, useFrames)
    {
        return new DelayedCall(this, callback, delay, true, false, useFrames);
    }

    /**
     * Destroy and don't use after this.
     * @method
     */
    destroy()
    {
        this.stop();
        this._tick = null;
        super.destroy();
    }
}
