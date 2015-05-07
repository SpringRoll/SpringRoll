/*! SpringRoll 0.3.0 */
/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
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

/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
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
		this._game.media.playInstruction(
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

/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
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
		this._game.hint.enabled = false;
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

/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
 */
(function()
{
	//Import classes
	var AbstractHint = include('springroll.AbstractHint');

	/**
	 *  Generic function to act as a hint
	 *  @class FunctionHint
	 *  @extends springroll.AbstractHint
	 *  @constructor
	 *  @param {springroll.TrackingGame} game The instance of the game
	 *  @param {Function} done called on hint done
	 *  @param {function} onStart Function to call
	 */
	var FunctionHint = function(game, done, onStart)
	{
		AbstractHint.call(this, game, done);
		this.onStart = onStart;
	};

	//Reference to the prototype
	var s = AbstractHint.prototype;
	var p = extend(FunctionHint, AbstractHint);

	/**
	 *  Start function hint
	 *  @method play
	 */
	p.play = function()
	{
		this._game.hint.enabled = false;
		this.onStart();
	};

	/**
	 *  Clean-up the hint, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.onStart = null;
		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').FunctionHint = FunctionHint;
}());

/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
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
	 *     this.game.hinting.group()
	 *     	.vo('Something', onCompleted)
	 *     	.vo('Another', onComplete)
	 *     	.addTier()
	 *     	.vo('DetailedSomething', onComplete)
	 *     	.vo('DetailedAnother', onComplete);
	 *  @class GroupHint
	 *  @extends springroll.AbstractHint
	 *  @constructor
	 *  @param {springroll.TrackingGame} game The instance of the game
	 *  @param {Function} done called on hint done
	 */
	var GroupHint = function(game, done)
	{
		AbstractHint.call(this, game, done);

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
			this._game,
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
			this._game,
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
			this._game,
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
/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var HintPlayer = include('springroll.HintPlayer');

	/**
	 * Create an app plugin for Hinting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class HintingPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var HintingPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(HintingPlugin, ApplicationPlugin);

	// Init the animator
	p.init = function()
	{
		/**
		 * The hint player API
		 * @property {springroll.HintPlayer} hint
		 */
		this.hint = new HintPlayer(this);
	};

	// Check for dependencies
	p.ready = function(done)
	{
		if (!this.messenger) throw "Hinting requires ContainerPlugin";
		if (!this.media) throw "Hinting requires LearningMedia";

		// Listen for manual help clicks
		this.messenger.on('playHelp', this.hint.play);

		// Listen whtn the hint changes
		this.hint.on('enabled', function(enabled)
		{
			this.messenger.send('helpEnabled', enabled);
		}
		.bind(this));

		done();
	};

	// Destroy the animator
	p.destroy = function()
	{
		this.messenger.off('playHelp');
		this.hint.off('enabled');
		this.hint.destroy();
		this.hint = null;
	};

	// register plugin
	ApplicationPlugin.register(HintingPlugin);

}());