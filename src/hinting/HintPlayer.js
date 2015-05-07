/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
 */
(function()
{
	//Include classes
	var EventDispatcher = include('springroll.EventDispatcher'),
		AnimatorHint = include('springroll.AnimatorHint'),
		FunctionHint = include('springroll.FunctionHint'),
		VOHint = include('springroll.VOHint'),
		GroupHint = include('springroll.GroupHint');

	/**
	 *  Design to handle the setting and playing of hints
	 *  @class HintPlayer
	 *  @constructor
	 *  @param {springroll.Application} game Reference to the current game
	 */
	var HintPlayer = function(game)
	{
		EventDispatcher.call(this);

		/**
		 *  Reference to the current game
		 *  @property {springroll.Application} _app
		 *  @private
		 */
		this._app = game;

		/**
		 *  The currently selected hint
		 *  @property {springroll.AbstractHint} _hint
		 *  @private
		 */
		this._hint = null;

		/**
		 *  The total number of milliseconds until playing
		 *  @property {int} _duration
		 *  @private
		 */
		this._duration = 0;

		/**
		 *  The countdown in milliseconds
		 *  @property {int} _timer
		 *  @private
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
		 * Contains previously set hints to be cleaned up after the new hint plays,
		 * to prevent erasing callbacks too soon.
		 * @property {Array} _oldHints
		 */
		this._oldHints = [];
	};

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = extend(HintPlayer, EventDispatcher);

	/**
	 *  Add a VO hint to the player.
	 *  @method vo
	 *  @param {String|Array} idOrList The list of VO element, see VOPlayer.play
	 *  @param {Function} onComplete Call when the VO is done playing
	 *  @param {Function|Boolean} [onCancel] Call when the VO is cancelled playing,
	 *         a value of true sets onComplete to also be the onCancelled callback.
	 *  @return {springroll.VOHint} The newly added hint
	 */
	p.vo = function(idOrList, onComplete, onCancel)
	{
		return this.set(new VOHint(
			this._app,
			this._done,
			idOrList,
			onComplete,
			onCancel
		));
	};

	/**
	 *  Add an animator hint to the player
	 *  @method anim
	 *  @param {createjs.MovieClip|*} instance The instance of the clip to play with Animator
	 *  @param {String|Array|Object} events The event aliases to play, see Animator.play
	 *  @param {Function} onComplete Call when the VO is done playing
	 *  @param {Function|Boolean} [onCancel] Call when the VO is cancelled playing,
	 *         a value of true sets onComplete to also be the onCancelled callback.
	 *  @return {springroll.AnimatorHint} The newly added hint
	 */
	p.anim = function(instance, events, onComplete, onCancel)
	{
		return this.set(new AnimatorHint(
			this._app,
			this._done,
			instance,
			events,
			onComplete,
			onCancel
		));
	};

	/**
	 *  Add an animator hint to the player. If you use this hinting method, you
	 *  NEED to re-enable the hinting when it's done. Whereas the VO and ANIM methods
	 *  with automatically re-enable the hinting button.
	 *  @method func
	 *  @param {Function} onStart The instance of the clip to play with Animator
	 *  @return {springroll.FunctionHint} The newly added hint
	 */
	p.func = function(onStart)
	{
		return this.set(new FunctionHint(this._app, this._done, onStart));
	};

	/**
	 *  Create the new group hint for randomizing hints or for tiered hinting.
	 *  You can save this group hint for later and assign using HintPlayer.set()
	 *  @method group
	 *  @return {springroll.GroupHint} The new group hint
	 */
	p.group = function()
	{
		return this.set(new GroupHint(this._app, this._done));
	};

	/**
	 *  Set the current method to use
	 *  @method set
	 *  @param {springroll.AbstractHint} hint The new hint to add
	 *  @return {springroll.AbstractHint} Instance of the player, for chaining
	 */
	p.set = function(hint)
	{
		//Remove any existing hint
		this.clear();
		this.enabled = true;
		this._hint = hint;
		return hint;
	};

	/**
	 *  Removes the current hint
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */
	p.clear = function()
	{
		this.removeTimer();
		this.enabled = false;
		if (this._hint)
		{
			this._oldHints.push(this._hint); //we'll destroy these when it's safe
		}
		this._hint = null;
	};

	/**
	 *  Manually play the current hint
	 *  @method play
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */
	p.play = function()
	{
		if (this._hint)
		{
			//Start playing the hint
			this._hint.play(this._done);

			//it is now safe to destroy old hints since their callbacks have already fired
			this._clearOldHints();
		}
		return this;
	};

	/**
	 *  Start a timer
	 *  @method startTimer
	 *  @param {int} [duration=12000] The number of milliseconds before playing hint
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */
	p.startTimer = function(duration)
	{
		this._timer = this._duration = duration || this.timerDuration;
		this._app.off('update', this._update).on('update', this._update);
		return this;
	};

	/**
	 *  Stop the timer and remove update listener
	 *  @method stopTimer
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */

	/**
	 *  Stop the timer and remove update listener.
	 *  Alias for stopTimer
	 *  @method removeTimer
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */
	p.stopTimer = p.removeTimer = function()
	{
		this._app.off('update', this._update);
		this._timer = this._duration = 0;
		return this;
	};

	/**
	 *  Reset the timer to start over
	 *  @method resetTimer
	 *  @return {springroll.HintPlayer} instance of the player for chaining
	 */
	p.resetTimer = function()
	{
		this._app.off('update', this._update).on('update', this._update);
		this._timer = this._duration;
		return this;
	};

	/**
	 *  If the help button is enabled
	 *  @property {Boolean} enabled
	 */
	Object.defineProperty(p, 'enabled',
	{
		set: function(enabled)
		{
			this.trigger('enabled', enabled);
		}
	});

	/**
	 *  Handle the update function
	 *  @method _update
	 *  @private
	 *  @param {int} elapsed Number of milliseconds since the last update
	 */
	p._update = function(elapsed)
	{
		if (this._app.media.isPlaying())
			return;

		if (this._timer > 0)
		{
			this._timer -= elapsed;

			if (this._timer <= 0)
			{
				this._app.off('update', this._update);
				this.play();
			}
		}
	};

	/**
	 *  Internal callback when a hint is done playing
	 *  @method _done
	 *  @private
	 */
	p._done = function(cancelled)
	{
		this.resetTimer();

		//Enable the button to play again
		this.enabled = !cancelled;

		//After playing the current tier, goto the next tier
		if (this._hint instanceof GroupHint)
		{
			this._hint.nextTier();
		}
	};

	/**
	 * destroys old hints
	 */
	p._clearOldHints = function()
	{
		if (this._oldHints.length)
		{
			for (var i = 0; i < this._oldHints.length; i++)
			{
				this._oldHints[i].destroy();
			}
			this._oldHints.length = 0;
		}
	};

	/**
	 *  Destroy, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.clear();
		this._clearOldHints();
		this._app = null;
		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').HintPlayer = HintPlayer;
}());