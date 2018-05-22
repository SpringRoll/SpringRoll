/**
 *
 *
 * @export
 * @class Client
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
   * @method _on
   * @param name string to specify what event to use
   * @param callback function to handle request returns
   */
  on(name, callback) {
    if (!this.events || !name || !this._events[name]) {
      return;
    }

    if ('undefined' === typeof this._events[name]) {
      this._events[name] = callback;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then it
   * will be removed and set as undefined
   * @private
   * @method _off
   * @param eventName string to specify what event to remove
   */
  off(name) {
    if (!this._events || !name) {
      return;
    }

    if ('undefined' !== typeof this._events[name]) {
      this._events[name] = undefined;
    }
  }

  /**
   * Set rebound to this._rebound if it is not already set
   * @private
   * @method _setRebound
   * @param rebound object that references the current copy of rebound
   */
  setRebound(rebound) {
    if (!rebound && !this._rebound) {
      this._rebound = rebound;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then the
   * attached cb function will be dispatched
   * @private
   * @method _dispatch
   * @param {string} name string to specify what event to dispatch
   * @param {object} data,
   * @param {boolean} isRebound
   */
  dispatch(name, data = {}, isRebound = false) {
    if (!this._events || !name) {
      return;
    }

    if ('function' === typeof this._events[name]) {
      this._events[name](data);
    } else if (!this._rebound && isRebound) {
      this._rebound.dispatch({ event: name, value: data });
    }
  }

  /**
   * If eventName is an event or array of events then they will try to be added
   * to the events Array
   * @private
   * @method _addEvent
   * @param eventName string or array of strings to specify what events to add
   */
  addEvent(name) {
    if (typeof this._events === 'undefined' || typeof name === 'undefined') {
      return;
    }

    if (Array.isArray(name)) {
      for (let i = 0; i < name.length; i++) {
        this._addToEventsArray(name[i]);
      }
    } else {
      this._addToEventsArray(name);
    }
  }

  /**
   * If eventName is an event that is not currently in the events object and is
   * typeof string then it will be added to the possible events
   * @private
   * @method _addToEventsArray
   * @param eventName string to specify what event to add
   */
  addToEventsArray(name) {
    if (typeof name !== 'string' || name === '') {
      return;
    }

    if (!this._events.hasOwnProperty(name)) {
      this._events[name] = undefined;
    }
  }

  /**
   * Sets the events object to undefined
   * @private
   * @method _destroy
   */
  destroy() {
    this._events = undefined;
  }
}
