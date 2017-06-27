import AbstractHint from './AbstractHint';

/**
 * Handle the hinting played with the Animator, usually
 * a lip-synced animation.
 * @class AnimatorHint
 * @extends springroll.AbstractHint
 * @constructor
 * @private
 * @param {springroll.HintsPlayer} hints The instance of the hints
 * @param {Function} done called on hint complete
 * @param {createjs.MovieClip|*} instance The media instance to play
 * @param {String|object|Array} events The event or events to play
 * @param {function} onComplete Callback when finished
 * @param {function|boolean} onCancel If the call is cancelled, true set onComplete
 *      to also be the cancelled callback
 */
export default class AnimatorHint extends AbstractHint
{
    constructor(hints, done, instance, events, onComplete, onCancel)
    {
        super(hints, done);

        this.instance = instance;
        this.events = events;
        this.onComplete = onComplete;
        this.onCancel = onCancel === true ? onComplete : onCancel;
    }

    /**
     * Run the hint
     * @method play
     */
    play()
    {
        this._hints.enabled = false;
        this._hints.trigger('anim',
            {
                instance: this.instance,
                events: this.events,
                complete: this._onPlayComplete.bind(this, this.onComplete, false),
                cancel: this._onPlayComplete.bind(this, this.onCancel, true)
            });
    }

    /**
     * Clean-up the hint, don't use after this
     * @method destroy
     */
    destroy()
    {
        this.instance = null;
        this.events = null;
        this.onComplete = null;
        this.onCancel = null;

        super.destroy();
    }
}
