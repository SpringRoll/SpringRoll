/**
 * A state-related event used by the State Manager.
 * ### module: @springroll/states
 *
 * @class
 * @memberof springroll
 */
export default class StateEvent {
    /**
     * @param {String} type The type of event.
     * @param {BaseState} currentState The currentState of the state manager
     * @param {BaseState} visibleState The current state being transitioned or changing visibility,
     *                               default to currentState
     */
    constructor(type, currentState, visibleState) {
        /**
         * A reference to the current state of the state manager
         *
         * @member {BaseState}
         */
        this.currentState = currentState;

        /**
         * A reference to the state who's actually being transitioned or being changed
         *
         * @member {BaseState}
         */
        this.visibleState = visibleState === undefined ? currentState : visibleState;

        /** The type of event
         *
         * @member {String}
         */
        this.type = type;
    }
}

/**
 * When the state besome visible
 *
 * @event springroll.StateEvent#onVisible
 */
StateEvent.VISIBLE = 'onVisible';

/**
 * When the state becomes hidden
 *
 * @event springroll.StateEvent#onHidden
 */
StateEvent.HIDDEN = 'onHidden';
