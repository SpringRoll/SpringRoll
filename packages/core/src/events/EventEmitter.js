import EventEmitter from 'eventemitter3';

/**
 * The EventEmitter is the npm module `eventemitter3` but mixes in two additional
 * convenience APIs: `has` and `destroy`.
 *
 * @class EventEmitter
 * @namespace springroll
 */

/**
 * Flag if this has been destroyed.
 * @property {Boolean} destroyed
 */
EventEmitter.prototype.destroyed = false;

/**
 * Checks if the EventEmitter has a specific listener or any listener for a given event.
 *
 * @method has
 * @param {String} name The name of the single event type to check for
 * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
 * @return {Boolean} If the EventEmitter has the specified listener.
 */
EventEmitter.prototype.has = function has(event, fn) {
    const listeners = this.listeners(event);
    return listeners.indexOf(fn) >= 0;
};

/**
 * Destroy and don't use after this
 *
 * @method destroy
 */
EventEmitter.prototype.destroy = function destroy() {
    this.removeAllListeners();
    this.destroyed = true;
};

export default EventEmitter;
