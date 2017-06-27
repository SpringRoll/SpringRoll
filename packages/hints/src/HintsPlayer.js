import {EventDispatcher} from '@springroll/core';
import AnimatorHint from './AnimatorHint';
import FunctionHint from './FunctionHint';
import VOHint from './VOHint';
import GroupHint from './GroupHint';

/**
 * Design to handle the setting and playing of hints
 * @class HintsPlayer
 * @constructor
 * @param {springroll.Application} app Reference to the current app
 */
export default class HintsPlayer extends EventDispatcher
{
    constructor(app)
    {
        super();

        /**
         * Reference to the current app
         * @property {springroll.Application} _app
         * @private
         */
        this._app = app;

        /**
         * The currently selected hint
         * @property {springroll.AbstractHint} _hint
         * @private
         */
        this._hint = null;

        /**
         * The total number of milliseconds until playing
         * @property {int} _duration
         * @private
         */
        this._duration = 0;

        /**
         * The countdown in milliseconds
         * @property {int} _timer
         * @private
         */
        this._timer = 0;

        /**
         * Time in ms between timeout lines
         * @property {Number} timerDuration
         * @default  12000
         */
        this.timerDuration = 12000;

        //Bind functions
        this._update = this._update.bind(this);
        this._done = this._done.bind(this);
        this.play = this.play.bind(this);

        /**
         * If a hint is currently playing
         * @property {Boolean} _playing
         * @default false
         * @private
         */
        this._playing = false;

        /**
         * Contains previously set hints to be cleaned up after the new hint plays,
         * to prevent erasing callbacks too soon.
         * @property {Array} _oldHints
         */
        this._oldHints = [];
    }

    /**
     * Play an animation event
     * @event start
     * @param {springroll.AbstractHint} hint The hint being played
     */

    /**
     * Play an animation event
     * @event anim
     * @param {Object} data The event data
     * @param {createjs.MovieClip} data.instance The movieclip instance
     * @param {String|Array} data.events The Animator events
     * @param {Function} data.complete Callback when complete
     * @param {Function} data.cancel Callback when canceled
     */

    /**
     * Play an Voice-Over event
     * @event vo
     * @param {Object} data The event data
     * @param {String|Array} data.events The VO alias or array of aliases/times/etc
     * @param {Function} data.complete Callback when complete
     * @param {Function} data.cancel Callback when canceled
     */

    /**
     * Event when the enabled status of the hint changes
     * @event enabled
     * @param {Boolean} enabled If the player is enabled
     */

    /**
     * Add a VO hint to the player.
     * @method vo
     * @param {String|Array} idOrList The list of VO element, see VOPlayer.play
     * @param {Function} onComplete Call when the VO is done playing
     * @param {Function|Boolean} [onCancel] Call when the VO is cancelled playing,
     *       a value of true sets onComplete to also be the onCancelled callback.
     * @return {springroll.VOHint} The newly added hint
     */
    vo(idOrList, onComplete, onCancel)
    {
        return this.set(new VOHint(
            this,
            this._done,
            idOrList,
            onComplete,
            onCancel
        ));
    }

    /**
     * Add an animator hint to the player
     * @method anim
     * @param {createjs.MovieClip|*} instance The instance of the clip to play with Animator
     * @param {String|Array|Object} events The event aliases to play, see Animator.play
     * @param {Function} onComplete Call when the VO is done playing
     * @param {Function|Boolean} [onCancel] Call when the VO is cancelled playing,
     *       a value of true sets onComplete to also be the onCancelled callback.
     * @return {springroll.AnimatorHint} The newly added hint
     */
    anim(instance, events, onComplete, onCancel)
    {
        return this.set(new AnimatorHint(
            this,
            this._done,
            instance,
            events,
            onComplete,
            onCancel
        ));
    }

    /**
     * Add an animator hint to the player. If you use this hinting method, you
     * NEED to re-enable the hinting when it's done. Whereas the VO and ANIM methods
     * with automatically re-enable the hinting button.
     * @method func
     * @param {Function} onStart The function to call when hint is played.
     *                           Should accept 2 arguments (callbacks): onComplete, onCancelled
     *                           and call them when complete or cancelled
     * @return {springroll.FunctionHint} The newly added hint
     */
    func(onStart)
    {
        return this.set(new FunctionHint(this, this._done, onStart));
    }

    /**
     * Create the new group hint for randomizing hints or for tiered hinting.
     * You can save this group hint for later and assign using HintsPlayer.set()
     * @method group
     * @return {springroll.GroupHint} The new group hint
     */
    group()
    {
        return this.set(new GroupHint(this, this._done));
    }

    /**
     * Set the current method to use
     * @method set
     * @param {springroll.AbstractHint} hint The new hint to add
     * @return {springroll.AbstractHint} Instance of the player, for chaining
     */
    set(hint)
    {
        //Remove any existing hint
        this.clear();
        this.enabled = true;
        this._hint = hint;
        return hint;
    }

    /**
     * Removes the current hint
     * @method clear
     */
    clear()
    {
        this._playing = false;
        this.removeTimer();
        this.enabled = false;
        if (this._hint)
        {
            this._oldHints.push(this._hint); //we'll destroy these when it's safe
        }
        this._hint = null;
    }

    /**
     * Manually play the current hint
     * @method play
     * @return {springroll.HintsPlayer} instance of the player for chaining
     */
    play()
    {
        if (this._hint)
        {
            // Keep track of the playing status
            this._playing = true;

            // Start playing the hint
            this._hint.play();

            // it is now safe to destroy old hints since 
            // their callbacks have already fired
            this._clearOldHints();

            // Trigger start event
            this.emit('start', this._hint);
        }
        return this;
    }

    /**
     * Start a timer
     * @method startTimer
     * @param {int} [duration=12000] The number of milliseconds before playing hint
     * @return {springroll.HintsPlayer} instance of the player for chaining
     */
    startTimer(duration)
    {
        this._timer = this._duration = duration || this.timerDuration;
        this._app.off('update', this._update).on('update', this._update);
        return this;
    }

    /**
     * Stop the timer and remove update listener
     * @method stopTimer
     * @return {springroll.HintsPlayer} instance of the player for chaining
     */

    /**
     * Stop the timer and remove update listener.
     * Alias for stopTimer
     * @method removeTimer
     * @return {springroll.HintsPlayer} instance of the player for chaining
     */
    stopTimer()
    {
        if (this._app)
        {
            this._app.off('update', this._update);
        }
        this._timer = this._duration = 0;
        return this;
    }

    /**
     * Reset the timer to start over
     * @method resetTimer
     * @return {springroll.HintsPlayer} instance of the player for chaining
     */
    resetTimer()
    {
        this._app.off('update', this._update).on('update', this._update);
        this._timer = this._duration;
        return this;
    }

    /**
     * If the help button is enabled
     * @property {Boolean} enabled
     */
    set enabled(enabled)
    {
        this.emit('enabled', enabled);
    }

    /**
     * Handle the update function
     * @method _update
     * @private
     * @param {int} elapsed Number of milliseconds since the last update
     */
    _update(elapsed)
    {
        if (this._playing) 
        {
            return;
        }

        if (this._timer > 0)
        {
            this._timer -= elapsed;

            if (this._timer <= 0)
            {
                this._app.off('update', this._update);
                this.play();
            }
        }
    }

    /**
     * Call this when a FunctionHint is done playing to reset HintsPlayer
     * @method funcDone
     * @param {Boolean} [cancelled=false] If the function was interrupted by the user or something else.
     */
    /**
     * Internal callback when a hint is done playing
     * @method _done
     * @private
     * @param {Boolean} [cancelled=false] If the function was interrupted by the user or something else.
     */
    funcDone(cancelled)
    {
        this._playing = false;
        this.resetTimer();

        //Enable the button to play again
        this.enabled = !cancelled;

        //After playing the current tier, goto the next tier
        if (this._hint instanceof GroupHint)
        {
            this._hint.nextTier();
        }
    }

    _done(cancelled)
    {
        this.funcDone(cancelled);
    }

    /**
     * Destroys old hints
     * @method _clearOldHints
     * @private
     */
    _clearOldHints()
    {
        if (this._oldHints.length)
        {
            for (var i = 0; i < this._oldHints.length; i++)
            {
                this._oldHints[i].destroy();
            }
            this._oldHints.length = 0;
        }
    }

    /**
     * Destroy, don't use after this
     * @method destroy
     */
    destroy()
    {
        this.clear();
        this._clearOldHints();
        this._app = null;
        super.destroy();
    }
}
