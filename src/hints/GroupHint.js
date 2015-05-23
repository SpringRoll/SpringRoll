/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound, Learning
 */
(function()
{
	//Import classes
	var AbstractHint = include('springroll.AbstractHint'),
		AnimatorHint = include('springroll.AnimatorHint'),
		FunctionHint = include('springroll.FunctionHint'),
		VOHint = include('springroll.VOHint');

	/**
	 *  Class to create tiered hinting or randomized hinting.
	 *     this.app.hints.group()
	 *     	.vo('Something', onCompleted)
	 *     	.vo('Another', onComplete)
	 *     	.addTier()
	 *     	.vo('DetailedSomething', onComplete)
	 *     	.vo('DetailedAnother', onComplete);
	 *  @class GroupHint
	 *  @extends springroll.AbstractHint
	 *  @constructor
	 *  @param {springroll.HintsPlayer} hints The instance of the hints
	 *  @param {Function} done called on hint done
	 */
	var GroupHint = function(hints, done)
	{
		AbstractHint.call(this, hints, done);

		/**
		 *  The collection of tiers
		 *  @property {Array} tiers
		 */
		this._tiers = [
			[] //our first tier
		];

		/**
		 *  The current tier index
		 *  @property {int} _current
		 *  @private
		 */
		this._current = -1;

		/**
		 *  The current tier selected
		 *  @property {array} _tier
		 *  @private
		 */
		this._tier = null;

		this.nextTier();
	};

	//Reference to the prototype
	var s = AbstractHint.prototype;
	var p = extend(GroupHint, AbstractHint);

	/**
	 *  Run the hint
	 *  @method play
	 */
	p.play = function()
	{
		//play random hint from current tier
		var hint = this._tier.random();
		hint.play();
	};

	/**
	 *  Add a VO hint to the player.
	 *  @method setVO
	 *  @param {string|array} [idOrList] The list of VO element, see VOPlayer.play
	 *  @param {function} onComplete Call when the VO is done playing
	 *  @param {function|boolean} [onCancel] Call when the VO is cancelled playing,
	 *         a value of true sets onComplete to also be the onCancelled callback.
	 *  @return {springroll.VOHint} The newly added hint
	 */
	p.vo = function(idOrList, onComplete, onCancel)
	{
		this.tier.push(new VOHint(
			this._hints,
			this._done,
			idOrList,
			onComplete,
			onCancel
		));
		return this;
	};

	/**
	 *  Add an animator hint to the player
	 *  @method setAnim
	 *  @param {createjs.MovieClip|*} instance The instance of the clip to play with Animator
	 *  @param {String|Array|Object} events The event aliases to play, see Animator.play
	 *  @param {function} onComplete Call when the VO is done playing
	 *  @param {function|boolean} [onCancel] Call when the VO is cancelled playing,
	 *         a value of true sets onComplete to also be the onCancelled callback.
	 *  @return {springroll.AnimatorHint} The newly added hint
	 */
	p.anim = function(instance, events, onComplete, onCancel)
	{
		this.tier.push(new AnimatorHint(
			this._hints,
			this._done,
			instance,
			events,
			onComplete,
			onCancel
		));
		return this;
	};

	/**
	 *  Add an animator hint to the player. If you use this hinting method, you
	 *  NEED to re-enable the hinting when it's done. Whereas the VO and ANIM methods
	 *  with automatically re-enable the hinting button.
	 *  @method setFunc
	 *  @param {function} onStart The instance of the clip to play with Animator
	 *  @return {springroll.FunctionHint} The newly added hint
	 */
	p.func = function(onStart)
	{
		this.tier.push(new FunctionHint(
			this._hints,
			this._done,
			onStart));
		return this;
	};

	/**
	 *  Add a new timeout tier of hinting
	 *  @method addTier
	 *  @return {springroll.GroupHint} The instance of the group hint, for chaining
	 */
	p.addTier = function()
	{
		this._tier = [];
		this._tiers.push(this._tier);
		return this;
	};

	/**
	 *  Advance to the next tier of hints.
	 *  @method nextTier
	 *  @return {springroll.GroupHint} The instance of the group hint, for chaining
	 */
	p.nextTier = function()
	{
		var len = this._tiers.length;
		this._current++;

		//Make sure we don't go past the last tier
		if (this._current >= len)
		{
			this._current = len - 1;
		}
		this._tier = this._tiers[this._current];
		return this;
	};

	/**
	 *  Reset the current tier to be the first
	 *  @method reset
	 *  @return {[type]} [description]
	 */
	p.reset = function()
	{
		this._current = -1;
		this.nextTier();
	};

	/**
	 *  Clean-up the hint, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this._tiers = null;
		this._tier = null;
		this._current = -1;

		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').GroupHint = GroupHint;
}());
