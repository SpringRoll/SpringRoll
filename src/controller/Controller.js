import { alternateKeyMap } from './AlternateKeyMap';
import { Key } from './Key';

/**
 * @typedef {object} KeyTemplate
 * @property {Function} down
 * @property {Function} up
 * @property {string} key
 *
 * @typedef {0 | 1 | 2} KeyState
 */

/**
 * Controller interface class to simplify working with key presses.
 * @export
 * @class Controller
 * @param {KeyTemplate[]} [buttons=[]] An object containing all keys you want to watch and their functions. e.g. {enter: () => {}}. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values for potential values.
 */
export class Controller {
  /**
   * Creates an instance of Controller.
   * @memberof Controller
   */
  constructor(keys = []) {
    this.assignButtons(keys);

    window.addEventListener('blur', this.onWindowBlur.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  /**
   * Calls all functions for buttons that are currently set to enabled.
   * @memberof Controller
   */
  update() {
    for (let i = 0, l = this.keys.length; i < l; i++) {
      this.buttons[this.keys[i]].action();
    }
  }

  /**
   * Called on keyup. Sets flag to 1 if key is being watched.
   * @param {KeyboardEvent} e
   * @memberof Controller
   */
  onKeyDown(e) {
    this.onKey(e, 1);
  }

  /**
   * Called on keyup. Sets flag to 2 if key is being watched.
   * @param {KeyboardEvent} e
   * @memberof Controller
   */
  onKeyUp(e) {
    this.onKey(e, 2);
  }

  /**
   * Called on window blur, sets button state to up if button was down;
   * @return {void}@memberof Controller
   */
  onWindowBlur() {
    for (const key of Object.keys(this.buttons)) {
      const button = this.buttons[key];

      if (button._state === 1) {
        this.buttons[key].updateState(2);
      }
    }
  }

  /**
   * Sets an object of button functions to the controller to be called.
   * @param {KeyTemplate[]} keys
   * @memberof Controller
   */
  assignButtons(keys) {
    this.buttons = {};
    this.keys = [];
    for (let i = 0, l = keys.length; i < l; i++) {
      const currentKey = keys[i].key.toLowerCase();
      const altKey = alternateKeyMap[currentKey];

      if (altKey !== undefined) {
        this.keys.push(altKey);
        this.buttons[altKey] = new Key(altKey, keys[i].down, keys[i].up);
      }

      this.keys.push(currentKey);
      this.buttons[currentKey] = new Key(currentKey, keys[i].down, keys[i].up);
    }
  }

  /**
   * Helper class to reduce code between event functions.
   * @private
   * @param {KeyboardEvent} event
   * @param {KeyState} state
   * @memberof Controller
   */
  onKey(event, state) {
    const key = event.key.toLowerCase();
    if (this.buttons[key]) {
      this.buttons[key].updateState(state);
    }
  }
}
