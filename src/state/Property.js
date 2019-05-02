/**
 * A class for representing changeable/subscribable properties.
 * @class Property
 * @property {*} _value the value of the property
 * @property {[]} listeners all the objects listening to this property
 */
export class Property {
  /**
   * Creates a new property with an initial value.
   * @param {*} initialValue The initial value of this property.
   */
  constructor(initialValue) {
    this._value = initialValue;
    this.listeners = [];
  }

  /**
   * returns the current value of the property
   * @readonly
   * @returns {*}
   * @memberof Property
   */
  get value() {
    return this._value;
  }

  /**
   * Sets the value of the property and notifies all listeners of the change
   * @param {*} value the new property value
   * @memberof Property
   */
  set value(value) {
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
   * @return {Boolean} True if this property has at least one subscriber
   */
  get hasListeners() {
    return this.listeners.length > 0;
  }
}
