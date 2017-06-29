import {EventEmitter} from '@springroll/core';
import State from './State';
import StateEvent from './StateEvent';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * The State Manager used for managing the different states of a game or site
 * ### module: @springroll/states
 *
 * @class
 * @memberof springroll
 * @extends springroll.EventEmitter
 */
export default class StateManager extends EventEmitter {
    /**
     * @param {Object} [transitionSounds] Data object with aliases and start times (seconds) for
     *     transition in, loop and out sounds. Example: `{in:{alias:"myAlias", start:0.2}}`.
     *     These objects are in the format for Animator from EaselJSDisplay or PixiDisplay,
     *     so they can be just the sound alias instead of an object.
     * @param {Object|String} [transitionSounds.in] The sound to play for transition in
     * @param {Object|String} [transitionSounds.out] The sound to play for transition out
     * @param {Object|String} [transitionSounds.loading] The sound to play for loading
     */
    constructor(transitionSounds) {
        super();

        /**
         * The animator playback.
         * @member {springroll.Animator}
         * @private
         */
        this.animator = null;

        /**
         * The click to play in between transitioning states
         * @member {PIXI.animate.MovieClip|PIXI.Spine}
         */
        this.transition = null;

        /**
         * Wait to fire the onTransitionIn event until the onTransitionLoading
         * loop reaches it’s final frame.
         * @member {boolean}
         */
        this.waitForLoadingComplete = false;

        /**
         * The sounds for the transition
         *
         * @member {Object}
         * @private
         */
        this._transitionSounds = transitionSounds || null;

        /**
         * The collection of states map
         *
         * @member {Object}
         * @private
         */
        this._states = {};

        /**
         * The currently selected state
         *
         * @member {springroll.State}
         * @private
         */
        this._state = null;

        /**
         * The currently selected state id
         *
         * @member {String}
         * @private
         */
        this._stateId = null;

        /**
         * The old state
         *
         * @member {springroll.State}
         * @private
         */
        this._oldState = null;

        /**
         * If the manager is loading a state
         *
         * @member {Boolean}
         * @private
         */
        this._isLoading = false;

        /**
         * If the state or manager is current transitioning
         *
         * @member {Boolean}
         * @private
         */
        this._isTransitioning = false;

        /**
         * If the current object is destroyed
         *
         * @member {Boolean}
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
    }

    /**
     * The amount of progress while state is being preloaded from zero to 1
     * @event springroll.StateManager#progress
     * @param {Number} percentage The amount loaded
     */


    /**
     * Register a state with the state manager, done initially
     *
     * @param {String} id The string alias for a state
     * @param {springroll.State} state State object reference
     */
    addState(id, state) {
        // @if DEBUG
        Debug.assert(state instanceof State, `State (${id}) needs to subclass springroll.State`);
        // @endif

        // Add to the collection of states
        this._states[id] = state;

        // Give the state a reference to the id
        state.stateId = id;

        // Give the state a reference to the manager
        state.manager = this;
    }

    /**
     * Get the current selected state (state object)
     * @member {springroll.State}
     * @readOnly
     */
    get currentState() {
        return this._state;
    }

    /**
     * Access a certain state by the ID
     * @param {String} id State alias
     * @return {springroll.State} The base State object
     */
    getStateById(id) {
        // @if DEBUG
        Debug.assert(this._states[id] !== undefined, `No alias matching "${id}"`);
        // @endif
        return this._states[id];
    }

    /**
     * If the StateManager is busy because it is currently loading or transitioning.
     * @return {Boolean} If StateManager is busy
     */
    isBusy() {
        return this._isLoading || this._isTransitioning;
    }

    /**
     * If the state needs to do some asyncronous tasks,
     * The state can tell the manager to stop the animation
     */
    loadingStart() {
        if (this._destroyed) {
            return;
        }

        this.emit(StateManager.LOADING_START);

        this._onTransitionLoading();
    }

    /**
     * If the state has finished it's asyncronous task loading
     * Lets enter the state
     */
    loadingDone() {
        if (this._destroyed) {
            return;
        }

        this.emit(StateManager.LOADING_DONE);
    }

    /**
     * Internal setter for the enabled status
     * @private
     * @member {Boolean}
     */
    set enabled(enabled) {
        /**
         * If the state manager is enabled, used internally
         * @event springroll.StateManager#enabled
         * @param {Boolean} enabled
         */
        this.emit('enabled', enabled);
    }

    /**
     * This transitions out of the current state and
     * enters it again. Can be useful for clearing a state
     */
    refresh() {
        // @if DEBUG
        Debug.assert(!!this._state, 'No current state to refresh!');
        // @endif
        this.state = this._stateId;
    }

    /**
     * Get or change the current state, using the state id.
     * @member {String}
     */
    set state(id) {
        // @if DEBUG
        Debug.assert(this._states[id] !== undefined, `No current state mattching id "${id}"`);
        // @endif

        // If we try to transition while the transition or state
        // is transition, then we queue the state and proceed
        // after an animation has played out, to avoid abrupt changes
        if (this._isTransitioning) {
            return;
        }

        this._stateId = id;
        this.enabled = false;
        this._oldState = this._state;
        this._state = this._states[id];

        if (!this._oldState) {
            // There is not current state
            // this is only possible if this is the first
            // state we're loading
            this._isTransitioning = true;
            if (this.transition) {
                this.transition.visible = true;
            }
            this._onTransitionLoading();
            this.emit(StateManager.TRANSITION_INIT_DONE);
            this._isLoading = true;
            this._state._internalEnter(this._onStateLoaded);
        }
        else {
            // Check to see if the state is currently in a load
            // if so cancel the state
            if (this._isLoading) {
                this._oldState._internalCancel();
                this._isLoading = false;
                this._state._internalEnter(this._onStateLoaded);
            }
            else {
                this._isTransitioning = true;
                this._oldState._internalExitStart();
                this.enabled = false;

                this.emit(StateManager.TRANSITION_OUT);

                this._transitioning(StateManager.TRANSITION_OUT, this._onTransitionOut);
            }
        }
    }
    get state() {
        return this._stateId;
    }

    /**
     * When the transition out of a state has finished playing during a state change.
     * @private
     */
    _onTransitionOut() {
        this.emit(StateManager.TRANSITION_OUT_DONE);

        this._isTransitioning = false;

        if (this.has(StateEvent.HIDDEN)) {
            this.emit(
                StateEvent.HIDDEN,
                new StateEvent(StateEvent.HIDDEN, this._state, this._oldState));
        }
        this._oldState.panel.visible = false;
        this._oldState._internalExit();
        this._oldState = null;

        this._onTransitionLoading(); //play the transition loop animation

        this._isLoading = true;
        this._state._internalEnter(this._onStateLoaded);
    }

    /**
     * When the state has completed its loading sequence.
     * This should be treated as an asynchronous process.
     * @private
     */
    _onStateLoaded() {
        this._isLoading = false;
        this._isTransitioning = true;

        if (this.has(StateEvent.VISIBLE)) {
            this.emit(StateEvent.VISIBLE, new StateEvent(StateEvent.VISIBLE, this._state));
        }
        this._state.panel.visible = true;

        if (this.waitForLoadingComplete && this.animator.hasAnimation(this.transition, StateManager.TRANSITION_LOADING)) {
            let timeline = this.animator.getTimeline(this.transition);
            timeline.onComplete = function() {
                this.emit(StateManager.TRANSITION_IN);
                this._transitioning(StateManager.TRANSITION_IN, this._onTransitionIn);
            }.bind(this);
            timeline.isLooping = false;
        }
        else {
            this.emit(StateManager.TRANSITION_IN);
            this._transitioning(StateManager.TRANSITION_IN, this._onTransitionIn);
        }
    }

    /**
     * When the transition into a state has finished playing during a state change.
     * @private
     */
    _onTransitionIn() {
        if (this.transition) {
            this.transition.visible = false;
        }
        this.emit(StateManager.TRANSITION_IN_DONE);
        this._isTransitioning = false;
        this.enabled = true;

        this._state._internalEnterDone();
    }

    /**
     * Plays the animation "onTransitionLoading" on the transition. Also serves as the animation callback.
     * Manually looping the animation allows the animation to be synced to the audio while looping.
     * @private
     */
    _onTransitionLoading() {
        // Ignore if no transition
        if (!this.transition) {
            return;
        }

        let audio;
        let sounds = this._transitionSounds;
        if (sounds) {
            audio = sounds.loading;
        }
        let animator = this.animator;
        if (animator.hasAnimation(this.transition, StateManager.TRANSITION_LOADING)) {
            this.emit(StateManager.TRANSITION_LOADING);
            animator.play(
                this.transition,
                {
                    anim: StateManager.TRANSITION_LOADING,
                    audio: audio
                }
            );
        }
    }

    /**
     * Displays the transition out animation, without changing states. Upon completion, the
     * transition looping animation automatically starts playing.
     * @param {function} callback The function to call when the animation is complete.
     */
    showTransitionOut(callback) {
        this.enabled = false;
        this._transitioning(StateManager.TRANSITION_OUT, function() {
            this._onTransitionLoading();
            if (callback) {
                callback();
            }
        }
            .bind(this));
    }

    /**
     * Displays the transition in animation, without changing states.
     * @param {function} callback The function to call when the animation is complete.
     */
    showTransitionIn(callback) {
        this._transitioning(StateManager.TRANSITION_IN, function() {
            this.enabled = true;
            this.transition.visible = false;
            if (callback) {
                callback();
            }
        }
            .bind(this));
    }

    /**
     * Generalized function for transitioning with the manager
     * @param {String} The animator event to play
     * @param {Function} The callback function after transition is done
     * @private
     */
    _transitioning(event, callback) {
        let transition = this.transition;
        let sounds = this._transitionSounds;

        // Ignore with no transition
        if (!transition) {
            return callback();
        }

        transition.visible = true;

        let audio;
        if (sounds) {
            audio = (event === StateManager.TRANSITION_IN) ? sounds.in : sounds.out;
        }
        this.animator.play(
            transition,
            {
                anim: event,
                audio: audio
            },
            callback
        );
    }

    /**
     * Remove the state manager
     */
    destroy() {
        this._destroyed = true;

        this.off();

        if (this.transition) {
            this.animator.stop(this.transition);
        }

        if (this._state) {
            this._state._internalExit();
        }

        if (this._states) {
            for (let id in this._states) {
                this._states[id].destroy();
                delete this._states[id];
            }
        }

        this.transition = null;
        this._state = null;
        this._oldState = null;
        this._states = null;
    }
}

/**
 * The name of the Animator label and event for transitioning into a state.
 * @event springroll.StateManager#onTransitionIn
 */
StateManager.TRANSITION_IN = 'onTransitionIn';

/**
 * The name of the Animator label and event for loading between state change.
 * this event is only dispatched if there is a loading sequence to show in the
 * transition. Recommended to use 'loadingStart' instead for checking.
 *
 * @event springroll.StateManager#onTransitionLoading
 */
StateManager.TRANSITION_LOADING = 'onTransitionLoading';

/**
 * The name of the event for completing transitioning into a state.
 *
 * @event springroll.StateManager#onTransitionInDone
 */
StateManager.TRANSITION_IN_DONE = 'onTransitionInDone';

/**
 * The name of the Animator label and event for transitioning out of a state.
 *
 * @event springroll.StateManager#onTransitionOut
 */
StateManager.TRANSITION_OUT = 'onTransitionOut';

/**
 * The name of the event for completing transitioning out of a state.
 *
 * @event springroll.StateManager#onTransitionOutDone
 */
StateManager.TRANSITION_OUT_DONE = 'onTransitionOutDone';

/**
 * The name of the event for initialization complete - the first state is then being entered.
 *
 * @event springroll.StateManager#onInitDone
 */
StateManager.TRANSITION_INIT_DONE = 'onInitDone';

/**
 * Event when the state begins loading assets when it is entered.
 *
 * @event springroll.StateManager#onLoadingStart
 */
StateManager.LOADING_START = 'onLoadingStart';

/**
 * Event when the state finishes loading assets when it is entered.
 *
 * @event springroll.StateManager#onLoadingDone
 */
StateManager.LOADING_DONE = 'onLoadingDone';
