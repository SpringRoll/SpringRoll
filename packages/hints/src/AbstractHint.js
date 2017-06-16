/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound, Learning
 */
(function()
{
    /**
     * Abstract base class for hints used by HintPlayer
     * @class AbstractHint
     * @constructor
     * @private
     * @param {springroll.HintsPlayer} hints The instance of the hints
     * @param {Function} done called on hint complete
     */
    var AbstractHint = function(hints, done)
    {
        /**
         * The reference to the hint play
         * @property {springroll.HintsPlayer} _hints
         */
        this._hints = hints;
        this._done = done;
    };

    //Reference to the prototype
    var p = extend(AbstractHint);

    /**
     * Run the hint
     * @method play
     */
    p.play = function()
    {
        if (DEBUG)
            throw 'Must override AbstractHint.play';
    };

    /**
     * Handle when the media completes
     * @method _onPlayComplete
     * @private
     * @param {function} original The original callback, either complete or cancelled
     */
    p._onPlayComplete = function(original, cancelled)
    {
        this._done(cancelled);
        if (typeof original == 'function')
        {
            original();
        }
    };

    /**
     * Clean-up the hint, don't use after this
     * @method destroy
     */
    p.destroy = function()
    {
        this._done = null;
        this._hints = null;
    };

    //Assign to namespace
    namespace('springroll').AbstractHint = AbstractHint;
}());