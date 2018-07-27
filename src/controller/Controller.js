import { Key } from './Key';
/**
 * Controller interface class to simplify working with key presses.
 * @export
 * @class Controller
 * @param {Array} [buttons=[]] An object containing all keys you want to watch and their functions. e.g. {enter: () => {}}. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values for potential values.
 */
export class Controller {
  /**
   * Creates an instance of Controller.
   * @memberof Controller
   */
  constructor(buttons = []) {
    this.assignButtons(buttons);

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
   * Sets an object of button functions to the controller to be called.
   * @param {Array} buttons
   * @memberof Controller
   */
  assignButtons(buttons) {
    this.buttons = {};
    this.keys = [];
    for (let i = 0, l = buttons.length; i < l; i++) {
      this.keys.push(buttons[i].key);
      this.buttons[buttons[i].key] = new Key(
        buttons[i].key,
        buttons[i].down,
        buttons[i].up
      );
    }
  }

  /**
   * Helper class to reduce code between event functions.
   * @private
   * @param {KeyboardEvent} event
   * @param {0 | 1 | 2} state
   * @memberof Controller
   */
  onKey(event, state) {
    const key = event.key.toLowerCase();
    if (this.buttons[key]) {
      this.buttons[key].updateState(state);
    }
  }
}
