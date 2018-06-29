/**
 * Simple event emitter class
 * @class EventEmitter
 */
export default class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Attaches an listener to events emitted on this class
   * @param {String} eventName The name of the event to listen for
   * @param {Function} method The function to call when the event is emitted
   */
  on(eventName, method) {
    if(!Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(method);
  }
  
  /**
   * Emits an event on this application, with some data
   * @param {String} eventName The event to emit
   * @param {Object} data The data to emit along with the event
   */
  emit(eventName, data) {
    if(Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName].forEach(function(callback) {
        callback(data);
      });
    }
  }
}
