/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Tracking Game
 */
(function()
{
	/**
	 *  Abstract base class for hints used by HintPlayer
	 *  @class AbstractHint
	 *  @constructor
	 *  @param {springroll.TrackingGame} game The instance of the game
	 *  @param {Function} done called on hint complete
	 */
	var AbstractHint = function(game, done)
	{
		//The instance of the game
		this._game = game;
		this._done = done;
	};

	//Reference to the prototype
	var p = AbstractHint.prototype;

	/**
	 *  Run the hint
	 *  @method play
	 */
	p.play = function()
	{
		throw 'Must override Hint.play';
	};

	/**
	 *  Handle when the media completes
	 *  @method _onPlayComplete
	 *  @private
	 *  @param {function} original The original callback, either complete or cancelled
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
	 *  Clean-up the hint, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this._done = null;
		this._game = null;
	};

	//Assign to namespace
	namespace('springroll').AbstractHint = AbstractHint;
}());
