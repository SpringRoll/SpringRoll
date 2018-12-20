/**
 * Represents a single key on the keyboard and the functions related to it.
 * @class Key
 * @property {0 | 1 | 2} state The current state of the key. 0 = inactive, 1 = active, 2 = to be set to inactive.
 * @property {string} key The name of the key we are targeting.
 * @property {object} actions
 * @property {function} actions.down Function to be called while the key is held down.
 * @property {function} actions.up Function to be called when the key is lifted up.
 * @param {string} key What this object represents.
 * @param {Function} [down=() => {}] Function to be called while the key is held down.
 * @param {Function} [up=() => {}] Function to be called when the key is lifted up.
 */
export class Key {
  /**
   * Creates an instance of Key.
   */
  constructor(key, down, up) {
    this.key = key;
    this._state = 0;
    this.actions = {
      up,
      down
    };
  }

  /**
   *
   * Updates the internal state of the key. Accepts a range between 0-2. Will set key state to 0 if nothing is passed.
   * @param {0 | 1 | 2} [state=0]
   * @memberof Key
   */
  updateState(state = 0) {
    if (state < 3 && state > -1) {
      this._state = state;
    }
  }

  /**
   * Calls the relevant action for the current state of the key.
   * @memberof Key
   */
  action() {
    if (1 === this.state) {
      if (this.actions.down) {
        this.actions.down();
      }
    } else if (2 === this.state) {
      if (this.actions.up) {
        this.actions.up();
      }
      this.updateState(0);
    }
  }

  /**
   *
   * Returns the current state of the key.
   * @readonly
   * @returns { number }
   * @memberof Key
   */
  get state() {
    return this._state;
  }
}
