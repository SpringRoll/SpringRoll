import AbstractHint from './AbstractHint';

/**
 * Generic function to act as a hint
 * @class 
 * @extends springroll.AbstractHint
 * @private
 */
export default class FunctionHint extends AbstractHint {
    /**
     * @param {springroll.HintsPlayer} hints The instance of the hints
     * @param {function} done called on hint done
     * @param {function} onStart Function to call
     *                           should accept 2 arguments (callbacks: 
     *                           onComplete and onCancelled
     *                           and call them when complete or cancelled
     */
    constructor(hints, done, onStart) {
        super(hints, done);
        this.onStart = onStart;
    }

    /**
     * Start function hint
     */
    play() {
        this._hints.enabled = false;
        this.onStart(
            this._onPlayComplete.bind(this, null, false),
            this._onPlayComplete.bind(this, null, true)
        );
    }

    /**
     * Clean-up the hint, don't use after this
     */
    destroy() {
        this.onStart = null;
        super.destroy();
    }
}
