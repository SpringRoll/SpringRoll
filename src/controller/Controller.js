/**
 *
 *
 * @export
 * @class Controller
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
   *
   * Updates Controller values
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
   *
   *
   * @param {KeyboardEvent} e
   * @memberof Controller
   */
  onKeyDown(e) {
    this.onKey(e, true);
  }

  /**
   *
   *
   * @memberof Controller
   */
  onKeyUp(e) {
    this.onKey(e, false);
  }

  /**
   *
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
