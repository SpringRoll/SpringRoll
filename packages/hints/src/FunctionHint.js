import AbstractHint from './AbstractHint';

/**
 * Generic function to act as a hint
 * @class FunctionHint
 * @extends springroll.AbstractHint
 * @constructor
 * @private
 * @param {springroll.HintsPlayer} hints The instance of the hints
 * @param {Function} done called on hint done
 * @param {function} onStart Function to call
 *                           should accept 2 arguments (callbacks: 
 *                           onComplete and onCancelled
 *                           and call them when complete or cancelled
 */
export default class FunctionHint extends AbstractHint
{
    constructor(hints, done, onStart)
    {
        super(hints, done);
        this.onStart = onStart;
    }

    //Reference to the prototype


    /**
     * Start function hint
     * @method play
     */
    play()
    {
        this._hints.enabled = false;
        this.onStart(
            this._onPlayComplete.bind(this, null, false),
            this._onPlayComplete.bind(this, null, true)
        );
    }

    /**
     * Clean-up the hint, don't use after this
     * @method destroy
     */
    destroy()
    {
        this.onStart = null;
        super.destroy();
    }
}
