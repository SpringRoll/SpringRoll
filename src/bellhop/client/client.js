/**
 * @export
 * @class Client
 *
 * @property {object} events
 * @property {Rebound} rebound
 */
export class Client {
  /**
   * Creates an instance of Client.
   * @memberof Client
   */
  constructor() {
    this.events = {};
    this.rebound = undefined;
  }

  /**
   * If eventName is an available event, the cb function will be attached to the
   * events object to then be used at a later time
   *
   * @method on
   * @param {string} name string to specify what event to use
   * @param {Function} callback function to handle request returns
   */
  on(name, callback) {
    let invalidName = typeof name === 'undefined';
    let noEventsObj = typeof this.events === 'undefined';

    if (noEventsObj || invalidName || !this.events.hasOwnProperty(name)) {
      return;
    }

    if (typeof this.events[name] === 'undefined') {
      this.events[name] = callback;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then it
   * will be removed and set as undefined
   *
   * @method off
   * @param {string} name string to specify what event to remove
   */
  off(name) {
    if (typeof this.events === 'undefined' || typeof name === 'undefined') {
      return;
    }

    if (typeof this.events[name] !== 'undefined') {
      this.events[name] = undefined;
    }
  }

  /**
   * Set rebound to this.rebound if it is not already set
   *
   * @method setRebound
   * @param { Rebound } rebound object that references the current copy of rebound
   */
  setRebound(rebound) {
    if (typeof rebound !== 'undefined' && typeof this.rebound === 'undefined') {
      this.rebound = rebound;
    }
  }

  /**
   * If eventName is an event that is currently in the events object then the
   * attached cb function will be dispatched
   *
   * @method dispatch
   * @param {string} name string to specify what event to dispatch
   * @param {object} data string to specify what event to dispatch
   * @param {boolean} isRebound string to specify what event to dispatch
   */
  dispatch(name, data, isRebound) {
    if (typeof this.events === 'undefined' || typeof name === 'undefined') {
      return;
    }

    if (typeof this.events[name] !== 'undefined') {
      this.events[name](data);
    } else if (typeof this.rebound !== 'undefined' && !isRebound) {
      this.rebound.dispatch({ event: name, value: data });
    }
  }

  /**
   * If eventName is an event or array of events then they will try to be added
   * to the events Array
   *
   * @method addEvent
   * @param {string | string[]} name string or array of strings to specify what events to add
   */
  addEvents(name) {
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
   *
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
   * @method destroy
   */
  destroy() {
    this.events = undefined;
  }
}
