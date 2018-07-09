/**
 * A class for representing changeable/subscribable properties
 * @class Property
 */
export default class Property {
  /**
   * Creates a new property with an initial value
   * @param Any initialValue The initial value of this property
   */
  constructor(initialValue) {
    this._value = initialValue;
    this.listeners = [];

    Object.defineProperty(this, 'value', {
      get: () => this._value,
      set: (value) => {
        this._value = value;
        this.notifyChange();
      }
    });
  }

  /**
   * Notifies all subscribers to the property of a new value
   */
  notifyChange() {
    this.listeners.forEach(listener => {
      listener(this.value);
    });
  }

  /**
   * Add a subscriber to this property
   * @param Function callback The callback to call whenever the property changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Unsubscribes a listener from this property
   * @param Function callback The callback to unsubscribe
   */
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}
