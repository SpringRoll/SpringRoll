import {ApplicationPlugin} from '@springroll/core';
import StateManager from '../StateManager';

(function() {

    const plugin = new ApplicationPlugin('states', 'display');

    plugin.setup = function() {
        /**
         * Fired when an event has been added
         * ### module: @springroll/states
         * @event springroll.Application#stateAdded
         * @param {string} alias The state alias
         * @param {springroll.State} state The State object
         */

        /**
         * The collection of states
         * ### module: @springroll/states
         * @member {object} _states
         * @memberof springroll.Application#
         * @private
         */
        this._states = null;

        /**
         * The state manager, for managing visual and loading states in the game.
         * ### module: @springroll/states
         * @member {springroll.StateManager} manager
         * @memberof springroll.Application#
         */
        this.manager = null;

        /**
         * The transition animation to use between the StateManager state changes
         * ### module: @springroll/states
         * @member {PIXI.animate.MovieClip|PIXI.Spine} _transition
         * @memberof springroll.Application#
         * @private
         */
        this._transition = null;

        /**
         * The transition animation to use between the StateManager state changes
         * ### module: @springroll/states
         * @member {PIXI.animate.MovieClip|PIXI.Spine} transition
         * @memberof springroll.Application#
         */
        Object.defineProperty(this, 'transition',
            {
                set(transition) {
                    if (!this.display) {
                        // @if DEBUG
                        throw 'No default display is available to set the states. Use the display application option';
                        // @endif

                        // @if RELEASE
                        // eslint-disable-next-line no-unreachable
                        throw 'No default display';
                        // @endif
                    }

                    if (transition && !this.animator) {
                        // @if DEBUG
                        throw 'Use of a transition requires the animation module, please include';
                        // @endif

                        // @if RELEASE
                        // eslint-disable-next-line no-unreachable
                        throw 'No animation module';
                        // @endif
                    }

                    // Remove the old transition
                    const stage = this.display.stage;
                    if (this._transition) {
                        stage.removeChild(this._transition);
                    }

                    // Save the transtion reference
                    this._transition = transition;

                    // Add to the manager
                    if (this.manager) {
                        this.manager.transition = transition;
                    }

                    // Add to the stage
                    if (transition) {
                    // Stop the transition from playing
                        if (transition.stop) {
                            transition.stop();
                        }
                        stage.addChild(transition);
                    }
                },
                get() {
                    return this._transition;
                }
            });

        /**
         * The initial state to go to when everything is finished
         * ### module: @springroll/states
         * @member {boolean} state
         * @memberof springroll.ApplicationOptions#
         * @default null
         * @readOnly
         */
        this.options.add('state', null, true);

        /**
         * The animation to use for the StateManager
         * ### module: @springroll/states
         * @member {PIXI.Spine} transition
         * @memberof springroll.ApplicationOptions#
         */
        this.options.add('transition');

        /**
         * The transition sounds to use for the state transition
         * ### module: @springroll/states
         * @member {object} transitionSounds
         * @memberof springroll.ApplicationOptions#
         * @property {object} [in=null] - The transition in sound alias or sound object
         * @property {object} [out=null] - The transition out sound alias or sound object
         * @readOnly
         */
        this.options.add('transitionSounds',
            {
                'in': null,
                'out': null
            }, true);

        /**
         * The collection of states where the key is the state alias and value is the state display object
         * ### module: @springroll/states
         * @member {object} states
         * @memberof springroll.Application#
         * @default null
         */
        Object.defineProperty(this, 'states',
            {
                set(states) {
                    if (this.manager) {
                        // @if DEBUG
                        throw 'StateManager has already been initialized, cannot set states multiple times';
                        // @endif

                        // @if RELEASE
                        // eslint-disable-next-line no-unreachable
                        throw 'States already set';
                        // @endif
                    }

                    if (!this.display) {
                        // @if DEBUG
                        throw 'No default display is available to set the states. Use the display application option';
                        // @endif
                        
                        // @if RELEASE
                        // eslint-disable-next-line no-unreachable
                        throw 'No default display';
                        // @endif
                    }

                    // Create the state manager
                    const manager = this.manager = new StateManager(
                        this.options.transitionSounds
                    );

                    // Pass the animator reference
                    manager.animator = this.animator;

                    // Add a handler to enable to disable the display
                    manager.on('enabled', enabled => {
                        this.display.enabled = enabled;
                    });

                    const stage = this.display.stage;

                    //create states
                    for (let alias in states) {
                    // Add to the manager
                        manager.addState(alias, states[alias]);

                        // Add the state display object to the main display
                        stage.addChild(states[alias].panel);

                        this.emit('stateAdded', alias, states[alias]);
                    }

                    this._states = states;

                    // Get the transition from either the transition manual set or the options
                    const transition = this._transition || this.options.transition;

                    //if the transition is a EaselJS movieclip, start it out
                    //at the end of the transition out animation. If it has a
                    //'transitionLoop' animation, that will be played as soon as a state is set
                    if (transition) {
                    // Add the transition this will addChild on top of all the panels
                        this.transition = transition;

                        // Goto the fully covered state
                        if (transition.gotoAndStop) {
                            transition.gotoAndStop('onTransitionOut_stop');
                        }
                    }

                    // Goto the first state
                    if (this.options.state) {
                        manager.state = this.options.state;
                    }
                },
                get() {
                    return this._states;
                }
            });
    };

    plugin.teardown = function() {
        // @if DEBUG
        window.onkeyup = null;
        // @endif
        this._state = null;
        if (this.manager) {
            this.manager.destroy();
            this.manager = null;
        }
        if (this.transition) {
            this.transition.removeChildren();
            this.transition = null;
        }
    };

}());