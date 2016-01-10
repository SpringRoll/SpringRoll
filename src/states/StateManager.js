/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{

	// Imports
	var Debug = include('springroll.Debug', false),
		EventDispatcher = include('springroll.EventDispatcher'),
		State = include('springroll.State'),
		StateEvent = include('springroll.StateEvent');

	/**
	 * The State Manager used for managing the different states of a game or site
	 *
	 * @class StateManager
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {Object} [transitionSounds] Data object with aliases and start times (seconds) for
	 *     transition in, loop and out sounds. Example: `{in:{alias:"myAlias", start:0.2}}`.
	 *     These objects are in the format for Animator from EaselJSDisplay or PixiDisplay,
	 *     so they can be just the sound alias instead of an object.
	 * @param {Object|String} [transitionSounds.in] The sound to play for transition in
	 * @param {Object|String} [transitionSounds.out] The sound to play for transition out
	 * @param {Object|String} [transitionSounds.loading] The sound to play for loading
	 */
	var StateManager = function(transitionSounds)
	{
		EventDispatcher.call(this);

		/**
		 * The animator playback.
		 *
		 * @property {springroll.Animator} animator
		 * @private
		 */
		this.animator = null;

		/**
		 * The click to play in between transitioning states
		 *
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} transition
		 */
		this.transition = null;

		/**
		 * Wait to fire the onTransitionIn event until the onTransitionLoading
		 * loop reaches it’s final frame.
		 * @property {boolean} waitForLoadingComplete
		 */
		this.waitForLoadingComplete = false;

		/**
		 * The sounds for the transition
		 *
		 * @property {Object} _transitionSounds
		 * @private
		 */
		this._transitionSounds = transitionSounds || null;

		/**
		 * The collection of states map
		 *
		 * @property {Object} _states
		 * @private
		 */
		this._states = {};

		/**
		 * The currently selected state
		 *
		 * @property {springroll.State} _state
		 * @private
		 */
		this._state = null;

		/**
		 * The currently selected state id
		 *
		 * @property {String} _stateID
		 * @private
		 */
		this._stateId = null;

		/**
		 * The old state
		 *
		 * @property {springroll.State} _oldState
		 * @private
		 */
		this._oldState = null;

		/**
		 * If the manager is loading a state
		 *
		 * @property {Boolean} name description
		 * @private
		 */
		this._isLoading = false;

		/**
		 * If the state or manager is current transitioning
		 *
		 * @property {Boolean} _isTransitioning
		 * @private
		 */
		this._isTransitioning = false;

		/**
		 * If the current object is destroyed
		 *
		 * @property {Boolean} _destroyed
		 * @private
		 */
		this._destroyed = false;

		// Hide the blocker
		this.enabled = true;

		// Binding
		this._onTransitionLoading = this._onTransitionLoading.bind(this);
		this._onTransitionOut = this._onTransitionOut.bind(this);
		this._onStateLoaded = this._onStateLoaded.bind(this);
		this._onTransitionIn = this._onTransitionIn.bind(this);
	};

	var p = EventDispatcher.extend(StateManager);

	/**
	 * The amount of progress while state is being preloaded from zero to 1
	 * @event progress
	 * @param {Number} percentage The amount loaded
	 */

	/**
	 * The name of the Animator label and event for transitioning into a state.
	 *
	 * @event onTransitionIn
	 */
	var TRANSITION_IN = StateManager.TRANSITION_IN = "onTransitionIn";

	/**
	 * The name of the Animator label and event for loading between state change.
	 * this event is only dispatched if there is a loading sequence to show in the
	 * transition. Recommended to use 'loadingStart' instead for checking.
	 *
	 * @event onTransitionLoading
	 */
	var TRANSITION_LOADING = StateManager.TRANSITION_LOADING = "onTransitionLoading";

	/**
	 * The name of the event for completing transitioning into a state.
	 *
	 * @event onTransitionInDone
	 */
	var TRANSITION_IN_DONE = StateManager.TRANSITION_IN_DONE = "onTransitionInDone";

	/**
	 * The name of the Animator label and event for transitioning out of a state.
	 *
	 * @event onTransitionOut
	 */
	var TRANSITION_OUT = StateManager.TRANSITION_OUT = "onTransitionOut";

	/**
	 * The name of the event for completing transitioning out of a state.
	 *
	 * @event onTransitionOutDone
	 */
	var TRANSITION_OUT_DONE = StateManager.TRANSITION_OUT_DONE = "onTransitionOutDone";

	/**
	 * The name of the event for initialization complete - the first state is then being entered.
	 *
	 * @event onInitDone
	 */
	var TRANSITION_INIT_DONE = StateManager.TRANSITION_INIT_DONE = "onInitDone";

	/**
	 * Event when the state begins loading assets when it is entered.
	 *
	 * @event onLoadingStart
	 */
	var LOADING_START = StateManager.LOADING_START = "onLoadingStart";

	/**
	 * Event when the state finishes loading assets when it is entered.
	 *
	 * @event onLoadingDone
	 */
	var LOADING_DONE = StateManager.LOADING_DONE = "onLoadingDone";

	/**
	 * Register a state with the state manager, done initially
	 *
	 * @method addState
	 * @param {String} id The string alias for a state
	 * @param {springroll.State} state State object reference
	 */
	p.addState = function(id, state)
	{
		if (DEBUG && Debug)
		{
			Debug.assert(state instanceof State, "State (" + id + ") needs to subclass springroll.State");
		}

		// Add to the collection of states
		this._states[id] = state;

		// Give the state a reference to the id
		state.stateId = id;

		// Give the state a reference to the manager
		state.manager = this;
	};

	/**
	 * Get the current selected state (state object)
	 * @property {springroll.State} currentState
	 * @readOnly
	 */
	Object.defineProperty(p, 'currentState',
	{
		get: function()
		{
			return this._state;
		}
	});

	/**
	 * Access a certain state by the ID
	 *
	 * @method getStateById
	 * @param {String} id State alias
	 * @return {springroll.State} The base State object
	 */
	p.getStateById = function(id)
	{
		if (DEBUG && Debug) Debug.assert(this._states[id] !== undefined, "No alias matching " + id);
		return this._states[id];
	};

	/**
	 * If the StateManager is busy because it is currently loading or transitioning.
	 *
	 * @method isBusy
	 * @return {Boolean} If StateManager is busy
	 */
	p.isBusy = function()
	{
		return this._isLoading || this._isTransitioning;
	};

	/**
	 * If the state needs to do some asyncronous tasks,
	 * The state can tell the manager to stop the animation
	 *
	 * @method loadingStart
	 */
	p.loadingStart = function()
	{
		if (this._destroyed) return;

		this.trigger(LOADING_START);

		this._onTransitionLoading();
	};

	/**
	 * If the state has finished it's asyncronous task loading
	 * Lets enter the state
	 *
	 * @method loadingDone
	 */
	p.loadingDone = function()
	{
		if (this._destroyed) return;

		this.trigger(LOADING_DONE);
	};

	/**
	 * Internal setter for the enabled status
	 * @private
	 * @property {Boolean} enabled
	 */
	Object.defineProperty(p, 'enabled',
	{
		set: function(enabled)
		{
			/**
			 * If the state manager is enabled, used internally
			 * @event enabled
			 * @param {Boolean} enabled
			 */
			this.trigger('enabled', enabled);
		}
	});

	/**
	 * This transitions out of the current state and
	 * enters it again. Can be useful for clearing a state
	 *
	 * @method refresh
	 */
	p.refresh = function()
	{
		if (DEBUG && Debug) Debug.assert(!!this._state, "No current state to refresh!");
		this.state = this._stateId;
	};

	/**
	 * Get or change the current state, using the state id.
	 * @property {String} state
	 */
	Object.defineProperty(p, "state",
	{
		set: function(id)
		{
			if (DEBUG && Debug) Debug.assert(this._states[id] !== undefined, "No current state mattching id '" + id + "'");

			// If we try to transition while the transition or state
			// is transition, then we queue the state and proceed
			// after an animation has played out, to avoid abrupt changes
			if (this._isTransitioning)
			{
				return;
			}

			this._stateId = id;
			this.enabled = false;
			this._oldState = this._state;
			this._state = this._states[id];

			if (!this._oldState)
			{
				// There is not current state
				// this is only possible if this is the first
				// state we're loading
				this._isTransitioning = true;
				if (this.transition)
					this.transition.visible = true;
				this._onTransitionLoading();
				this.trigger(TRANSITION_INIT_DONE);
				this._isLoading = true;
				this._state._internalEnter(this._onStateLoaded);
			}
			else
			{
				// Check to see if the state is currently in a load
				// if so cancel the state
				if (this._isLoading)
				{
					this._oldState._internalCancel();
					this._isLoading = false;
					this._state._internalEnter(this._onStateLoaded);
				}
				else
				{
					this._isTransitioning = true;
					this._oldState._internalExitStart();
					this.enabled = false;

					this.trigger(TRANSITION_OUT);

					this._transitioning(TRANSITION_OUT, this._onTransitionOut);
				}
			}
		},
		get: function()
		{
			return this._stateId;
		}
	});

	/**
	 * When the transition out of a state has finished playing during a state change.
	 * @method _onTransitionOut
	 * @private
	 */
	p._onTransitionOut = function()
	{
		this.trigger(TRANSITION_OUT_DONE);

		this._isTransitioning = false;

		if (this.has(StateEvent.HIDDEN))
		{
			this.trigger(
				StateEvent.HIDDEN,
				new StateEvent(StateEvent.HIDDEN, this._state, this._oldState));
		}
		this._oldState.panel.visible = false;
		this._oldState._internalExit();
		this._oldState = null;

		this._onTransitionLoading(); //play the transition loop animation

		this._isLoading = true;
		this._state._internalEnter(this._onStateLoaded);
	};

	/**
	 * When the state has completed its loading sequence.
	 * This should be treated as an asynchronous process.
	 *
	 * @method _onStateLoaded
	 * @private
	 */
	p._onStateLoaded = function()
	{
		this._isLoading = false;
		this._isTransitioning = true;

		if (this.has(StateEvent.VISIBLE))
			this.trigger(StateEvent.VISIBLE, new StateEvent(StateEvent.VISIBLE, this._state));
		this._state.panel.visible = true;

		if (this.waitForLoadingComplete && this.animator.hasAnimation(this.transition, TRANSITION_LOADING))
		{
			var timeline = this.animator.getTimeline(this.transition);
			timeline.onComplete = function()
			{
				this.trigger(TRANSITION_IN);
				this._transitioning(TRANSITION_IN, this._onTransitionIn);
			}.bind(this);
			timeline.isLooping = false;
		}
		else
		{
			this.trigger(TRANSITION_IN);
			this._transitioning(TRANSITION_IN, this._onTransitionIn);
		}
	};

	/**
	 * When the transition into a state has finished playing during a state change.
	 * @method _onTransitionIn
	 * @private
	 */
	p._onTransitionIn = function()
	{
		if (this.transition)
		{
			this.transition.visible = false;
		}
		this.trigger(TRANSITION_IN_DONE);
		this._isTransitioning = false;
		this.enabled = true;

		this._state._internalEnterDone();
	};

	/**
	 * Plays the animation "onTransitionLoading" on the transition. Also serves as the animation callback.
	 * Manually looping the animation allows the animation to be synced to the audio while looping.
	 *
	 * @method _onTransitionLoading
	 * @private
	 */
	p._onTransitionLoading = function()
	{
		// Ignore if no transition
		if (!this.transition) return;

		var audio;
		var sounds = this._transitionSounds;
		if (sounds)
		{
			// @deprecate the use of 'loop' sound property in favor of 'loading'
			audio = sounds.loading || sounds.loop;
		}
		var animator = this.animator;
		if (animator.hasAnimation(this.transition, TRANSITION_LOADING))
		{
			this.trigger(TRANSITION_LOADING);
			animator.play(
				this.transition,
				{
					anim: TRANSITION_LOADING,
					audio: audio
				}
			);
		}
		// @deprecate the use of 'transitionLoop' in favor of 'onTransitionLoading'
		else if (animator.hasAnimation(this.transition, 'transitionLoop'))
		{
			this.trigger(TRANSITION_LOADING);
			animator.play(
				this.transition,
				{
					anim: 'transitionLoop',
					audio: audio
				}
			);
		}
	};

	/**
	 * Displays the transition out animation, without changing states. Upon completion, the
	 * transition looping animation automatically starts playing.
	 *
	 * @method showTransitionOut
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionOut = function(callback)
	{
		this.enabled = false;
		this._transitioning(TRANSITION_OUT, function()
			{
				this._onTransitionLoading();
				if (callback) callback();
			}
			.bind(this));
	};

	/**
	 * Displays the transition in animation, without changing states.
	 *
	 * @method showTransitionIn
	 * @param {function} callback The function to call when the animation is complete.
	 */
	p.showTransitionIn = function(callback)
	{
		this._transitioning(TRANSITION_IN, function()
			{
				this.enabled = true;
				this.transition.visible = false;
				if (callback) callback();
			}
			.bind(this));
	};

	/**
	 * Generalized function for transitioning with the manager
	 *
	 * @method _transitioning
	 * @param {String} The animator event to play
	 * @param {Function} The callback function after transition is done
	 * @private
	 */
	p._transitioning = function(event, callback)
	{
		var transition = this.transition;
		var sounds = this._transitionSounds;

		// Ignore with no transition
		if (!transition)
		{
			return callback();
		}

		transition.visible = true;

		var audio;
		if (sounds)
		{
			audio = (event == TRANSITION_IN) ? sounds.in : sounds.out;
		}
		this.animator.play(
			transition,
			{
				anim: event,
				audio: audio
			},
			callback
		);
	};

	/**
	 * Remove the state manager
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._destroyed = true;

		this.off();

		if (this.transition)
		{
			this.animator.stop(this.transition);
		}

		if (this._state)
		{
			this._state._internalExit();
		}

		if (this._states)
		{
			for (var id in this._states)
			{
				this._states[id].destroy();
				delete this._states[id];
			}
		}

		this.transition = null;
		this._state = null;
		this._oldState = null;
		this._states = null;
	};

	// Add to the name space
	namespace('springroll').StateManager = StateManager;
})();