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

/**
 * Run the hint
 * @method play
 */
AbstractHint.prototype.play = function()
{
    // @if DEBUG
    throw 'Must override AbstractHint.play';
    // @endif
};

/**
 * Handle when the media completes
 * @method _onPlayComplete
 * @private
 * @param {function} original The original callback, either complete or cancelled
 */
AbstractHint.prototype._onPlayComplete = function(original, cancelled)
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
AbstractHint.prototype.destroy = function()
{
    this._done = null;
    this._hints = null;
};

export default AbstractHint;
