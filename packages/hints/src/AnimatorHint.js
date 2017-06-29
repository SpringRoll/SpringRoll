import AbstractHint from './AbstractHint';

/**
 * Handle the hinting played with the Animator, usually
 * a lip-synced animation.
 * @class
 * @memberof springroll
 * @extends springroll.AbstractHint
 * @private
 */
export default class AnimatorHint extends AbstractHint {
    /**
     * @param {springroll.HintsPlayer} hints The instance of the hints
     * @param {Function} done called on hint complete
     * @param {PIXI.animate.MovieClip|*} instance The media instance to play
     * @param {String|object|Array} events The event or events to play
     * @param {function} onComplete Callback when finished
     * @param {function|boolean} onCancel If the call is cancelled, true set onComplete
     *      to also be the cancelled callback
     */
    constructor(hints, done, instance, events, onComplete, onCancel) {
        super(hints, done);

        this.instance = instance;
        this.events = events;
        this.onComplete = onComplete;
        this.onCancel = onCancel === true ? onComplete : onCancel;
    }

    /**
     * Run the hint
     */
    play() {
        this._hints.enabled = false;
        this._hints.emit('anim',
            {
                instance: this.instance,
                events: this.events,
                complete: this._onPlayComplete.bind(this, this.onComplete, false),
                cancel: this._onPlayComplete.bind(this, this.onCancel, true)
            });
    }

    /**
     * Clean-up the hint, don't use after this
     */
    destroy() {
        this.instance = null;
        this.events = null;
        this.onComplete = null;
        this.onCancel = null;

        super.destroy();
    }
}
