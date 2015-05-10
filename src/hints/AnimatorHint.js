/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound, Learning, Container Client
 */
(function()
{
	//Import classes
	var AbstractHint = include('springroll.AbstractHint'),
		Animator = include('springroll.Animator');

	/**
	 *  Handle the hinting played with the Animator, usually
	 *  a lip-synced animation.
	 *  @class AnimatorHint
	 *  @extends springroll.AbstractHint
	 *  @constructor
	 *  @param {springroll.TrackingGame} game The instance of the game
	 *  @param {Function} done called on hint complete
	 *  @param {createjs.MovieClip|*} instance The media instance to play
	 *  @param {String|object|Array} events The event or events to play
	 *  @param {function} onComplete Callback when finished
	 *  @param {function|boolean} onCancel If the call is cancelled, true set onComplete
	 *         to also be the cancelled callback
	 */
	var AnimatorHint = function(game, done, instance, events, onComplete, onCancel)
	{
		AbstractHint.call(this, game, done);

		this.instance = instance;
		this.events = events;
		this.onComplete = onComplete;
		this.onCancel = onCancel === true ? onComplete : onCancel;
	};

	//Reference to the prototype
	var s = AbstractHint.prototype;
	var p = extend(AnimatorHint, AbstractHint);

	/**
	 *  Run the hint
	 *  @method play
	 */
	p.play = function()
	{
		this._game.hints.enabled = false;
		this._game.media.playInstruction(
			this.instance,
			this.events,
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
		this.instance = null;
		this.events = null;
		this.onComplete = null;
		this.onCancel = null;

		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').AnimatorHint = AnimatorHint;
}());
