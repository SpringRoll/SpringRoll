import AbstractHint from './AbstractHint';

/**
 * A hint designed to be played with the VOPlayer, typically
 * off-screen voice-over.
 * @class 
 * @memberof springroll
 * @extends springroll.AbstractHint
 * @private
 */
export default class VOHint extends AbstractHint {
    /**
     * @param {springroll.Application} hints The instance of the hints
     * @param {function} done called on hint complete
     * @param {string|Array} idOrList
     * @param {function} onComplete
     * @param {function} onCancel
     */
    constructor(hints, done, idOrList, onComplete, onCancel) {
        super(hints, done);

        this.idOrList = idOrList;
        this.onComplete = onComplete;
        this.onCancel = onCancel;
    }

    /**
     * Run the hint
     */
    play() {
        this._hints.enabled = false;
        this._hints.emit('vo',
            {
                events: this.idOrList,
                complete: this._onPlayComplete.bind(this, this.onComplete, false),
                cancel: this._onPlayComplete.bind(this, this.onCancel, true)
            });
    }

    /**
     * Clean-up the hint, don't use after this
     */
    destroy() {
        this.idOrList = null;
        this.onComplete = null;
        this.onCancel = null;

        super.destroy(this);
    }
}
