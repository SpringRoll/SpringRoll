import Property from './Property';

/**
 * A class for managing a group of subscribable properties together. Allows for the registration of new properties
 *
 * For example:
 * var manager = new StateManager();
 * manager.addField('paused', false);
 * manager.paused.subscribe(function(newValue) {
 *   console.log('New value is ', newValue);
 * })
 *
 * manager.paused = true;
 */
export default class StateManager {
  /**
   * Adds a new subscribable field field to the state manager
   * @param {String} name The name of the field
   * @param {Any} initialValue The initial value of the property
   * @return Property The newly created property
   */
  addField(name, initialValue) {
    this[name] = new Property(initialValue);
    return this[name];
  }
}
