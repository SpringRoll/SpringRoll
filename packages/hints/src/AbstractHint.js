/**
 * Abstract base class for hints used by HintPlayer
 * @class AbstractHint
 * @constructor
 * @private
 * @param {springroll.HintsPlayer} hints The instance of the hints
 * @param {Function} done called on hint complete
 */
export default class AbstractHint {
    constructor(hints, done) {
        /**
         * The reference to the hint play
         * @property {springroll.HintsPlayer} _hints
         */
        this._hints = hints;
        this._done = done;
    }

    /**
     * Run the hint
     * @method play
     */
    play() {
        // @if DEBUG
        throw 'Must override AbstractHint.play';
        // @endif
    }

    /**
     * Handle when the media completes
     * @method _onPlayComplete
     * @private
     * @param {function} original The original callback, either complete or cancelled
     */
    _onPlayComplete(original, cancelled) {
        this._done(cancelled);
        
        if (typeof original === 'function') {
            original();
        }
    }

    /**
     * Clean-up the hint, don't use after this
     * @method destroy
     */
    destroy() {
        this._done = null;
        this._hints = null;
    }
}
