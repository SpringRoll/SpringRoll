/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Tracking Game
 */
(function()
{
	//Import classes
	var AbstractHint = include('springroll.AbstractHint');

	/**
	 *  A hint designed to be played with the VOPlayer, typically
	 *  off-screen voice-over.
	 *  @class VOHint
	 *  @extends springroll.AbstractHint
	 *  @constructor
	 *  @param {springroll.TrackingGame} game The instance of the game
	 *  @param {Function} done called on hint complete
	 *  @param {String|Array} idOrList
	 *  @param {Function} onComplete
	 *  @param {Function} onCancel
	 */
	var VOHint = function(game, done, idOrList, onComplete, onCancel)
	{
		AbstractHint.call(this, game, done);

		this.idOrList = idOrList;
		this.onComplete = onComplete;
		this.onCancel = onCancel;
	};

	//Reference to the prototype
	var s = AbstractHint.prototype;
	var p = extend(VOHint, AbstractHint);

	/**
	 *  Run the hint
	 *  @method play
	 */
	p.play = function()
	{
		this._game.hint.enabled = false;
		this._game.playInstruction(
			this.idOrList,
			this._onPlayComplete.bind(this, this.onComplete, false),
			this._onPlayComplete.bind(this, this.onCancel, true)
		);
	};

	/**
	 *  Clean-up the hint, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.idOrList = null;
		this.onComplete = null;
		this.onCancel = null;

		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').VOHint = VOHint;
}());
