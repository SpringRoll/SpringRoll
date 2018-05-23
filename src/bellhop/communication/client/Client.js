/**
 *
 *
 * @export
 * @class Client
 * @property {object} events Stores all callback functions, organized by event name
 * @property {Rebound} rebound the instance of that interacts with the Client
 */
export default class Client {
  /**
   * An object used to keep track of all of the events
   * @property {Object} events
   * @private
   */
  constructor({ events = {}, rebound = undefined } = {}) {
    this.events = events;
    this.rebound = rebound;
  }

  /**
   * If eventName is an available event, the cb function will be attached to the
   * events object to then be used at a later time
   * @private
   * @method on
   * @param name string to specify what event to use
   * @param callback function to handle request returns
   */
  on(name, callback) {
    if ('string' !== typeof name) {
      return;
    }

    if ('undefined' === typeof this.events[name]) {
      this.events[name] = callback;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then it
   * will be removed and set as undefined
   * @private
   * @method off
   * @param name string to specify what event to remove
   */
  off(name) {
    if (!this.events || !name) {
      return;
    }

    if ('undefined' !== typeof this.events[name]) {
      this.events[name] = undefined;
    }
  }

  /**
   * Set rebound to this.rebound if it is not already set
   * @private
   * @method setRebound
   * @param rebound object that references the current copy of rebound
   */
  setRebound(rebound) {
    if ('undefined' !== typeof rebound && 'undefined' === typeof this.rebound) {
      this.rebound = rebound;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then the
   * attached cb function will be dispatched
   * @private
   * @method dispatch
   * @param {string} name string to specify what event to dispatch
   * @param {object} data,
   * @param {boolean} isRebound
   */
  dispatch(name, data = {}, isRebound = false) {
    if (!this.events || !name) {
      return;
    }

    if ('function' === typeof this.events[name]) {
      this.events[name](data);
    } else if ('undefined' !== typeof this.rebound && !isRebound) {
      this.rebound.dispatch({ event: name, value: data });
    }
  }

  /**
   * If eventName is an event or array of events then they will try to be added
   * to the events Array
   * @private
   * @method addEvent
   * @param {string | string[]} name string or array of strings to specify what events to add
   */
  addEvent(name) {
    if (typeof this.events === 'undefined' || typeof name === 'undefined') {
      return;
    }

    if (Array.isArray(name)) {
      for (let i = 0; i < name.length; i++) {
        this.addToEventsArray(name[i]);
      }
    } else {
      this.addToEventsArray(name);
    }
  }

  /**
   * If eventName is an event that is not currently in the events object and is
   * typeof string then it will be added to the possible events
   * @private
   * @method addToEventsArray
   * @param {string} name string to specify what event to add
   */
  addToEventsArray(name) {
    if (typeof name !== 'string' || name === '') {
      return;
    }

    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = undefined;
    }
  }

  /**
   * Sets the events object to undefined
   * @private
   * @method destroy
   */
  destroy() {
    this.events = undefined;
  }
}
