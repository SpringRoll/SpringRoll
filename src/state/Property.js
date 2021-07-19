/**
 * A class for representing changeable/subscribable properties.
 * @class Property
 * @property {*} _value the value of the property
 * @property {[]} listeners all the objects listening to this property
 * @property {boolean} alwaysNotify Determines if the property will notify a value change regardless if it's a new value or not.
 */
export class Property {
  /**
   * Creates a new property with an initial value.
   * @param {*} initialValue The initial value of this property.
   * @param {boolean} alwaysNotify Determines if the property will notify a value change regardless if it's a new value or not.
   */
  constructor(initialValue, alwaysNotify = false) {
    this._value = initialValue;
    this.listeners = [];
    this.alwaysNotify = alwaysNotify;
  }

  /**
   * The current value of the property
   * @type {*}
   */
  get value() {
    return this._value;
  }
  /**
   * Setting this value notifies all listeners of the change.
   * @type {*}
   */
  set value(value) {
    if (this.value === value && !this.alwaysNotify) {
      return;
    }

    const prevValue = this._value;
    this._value = value;

    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](this._value, prevValue);
    }
  }

  /**
   * Adds a subscriber to this property.
   * @param {function} callback The callback to call whenever the property changes.
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Unsubscribes a listener from this property.
   * @param {function} callback The callback to unsubscribe.
   */
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Whether or not this property has any subscribed listeners
   * @readonly
   * @type {Boolean}
   */
  get hasListeners() {
    return this.listeners.length > 0;
  }
}
