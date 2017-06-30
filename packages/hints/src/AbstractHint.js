/**
 * Abstract base class for hints used by HintPlayer
 * @class
 * @memberof springroll
 * @private
 */
export default class AbstractHint {
    /**
     * @param {springroll.HintsPlayer} hints The instance of the hints
     * @param {function} done called on hint complete
     */
    constructor(hints, done) {
        /**
         * The reference to the hint play
         * @member {springroll.HintsPlayer}
         */
        this._hints = hints;
        this._done = done;
    }

    /**
     * Run the hint
     */
    play() {
        // @if DEBUG
        throw 'Must override AbstractHint.play';
        // @endif
    }

    /**
     * Handle when the media completes
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
     */
    destroy() {
        this._done = null;
        this._hints = null;
    }
}
