import eventemitter3 from 'eventemitter3';

/**
 * The EventEmitter is the npm module `eventemitter3` but mixes in two additional
 * convenience APIs: `has` and `destroy`.
 * ### module: @springroll/core
 *
 * @class
 * @extends eventemitter3
 * @memberof springroll
 * @see https://github.com/primus/eventemitter3
 */
export default class EventEmitter extends eventemitter3 {
    constructor() {
        
        super();

        /**
         * Flag if this has been destroyed.
         * @member {boolean}
         */
        this.destroyed = false;
    }

    /**
     * Additional override for `on` method.
     * @override
     * @param {String|Symbol|Object} event The event name or map of event names to functions
     * @param {Function} [fn] The listener function
     * @param {any} [context=this] The context to invote the listener with.
     * @returns {springroll.EventEmitter} `this`
     */
    on(event, fn, context) {
        if (typeof event === 'object') {
            for (const name in event) {
                this.on(name, event[name]);
            }
            return this;
        }
        else {
            return super.on(event, fn, context);
        }
    }

    /**
     * Checks if the EventEmitter has a specific listener or any listener for a given event.
     * @param {string} name The name of the single event type to check for
     * @param {function} [callback] The listener function to check for. If omitted, checks for any listener.
     * @return {boolean} If the EventEmitter has the specified listener.
     */
    has(event, fn) {
        const listeners = this.listeners(event);
        return listeners.indexOf(fn) >= 0;
    }

    /**
     * Destroy and don't use after this
     */
    destroy() {
        this.removeAllListeners();
        this.destroyed = true;
    }
}
