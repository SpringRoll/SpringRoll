/**
 * Controller interface class to simplify working with key presses
 * @export
 * @class Controller
 * @param {Object} [buttons={}] a object containing all keys you want to watch and their functions. e.g. {enter: () => {}}. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values for potential values
 */
export class Controller {
  /**
   *Creates an instance of Controller.
   * @memberof Controller
   */
  constructor(buttons = {}) {
    this.options = {};

    this.keys = Object.keys(buttons)
      .filter(key => 'function' === typeof buttons[key])
      .map(key => key.toLowerCase());

    this.buttons = {};

    for (let i = 0, l = this.keys.length; i < l; i++) {
      this.buttons[this.keys[i]] = {
        enabled: false,
        action: buttons[this.keys[i]]
      };
    }

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  /**
   * Calls all functions for buttons that are currently set to enabled
   * @memberof Controller
   */
  update() {
    for (let i = 0, l = this.keys.length; i < l; i++) {
      if (this.buttons[this.keys[i]].enabled) {
        this.buttons[this.keys[i]].action();
      }
    }
  }

  /**
   * Called on keyup. Sets flag to true if key is being watched
   * @param {KeyboardEvent} e
   * @memberof Controller
   */
  onKeyDown(e) {
    this.onKey(e, true);
  }

  /**
   * Called on keyup. Sets flag to false if key is being watched
   * @param {KeyboardEvent} e
   * @memberof Controller
   */
  onKeyUp(e) {
    this.onKey(e, false);
  }

  /**
   * Helper class to reduce code between event functions
   * @private
   * @param {*} event
   * @param {*} enable
   * @memberof Controller
   */
  onKey(event, enable) {
    const key = event.key.toLocaleLowerCase();
    if (this.keys.includes(key)) {
      this.buttons[key].enabled = enable;
    }
  }
}
