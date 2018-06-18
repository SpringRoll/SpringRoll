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

    this.keys = Object.keys(buttons);

    this.buttonActions = {};
    this.availableButtons = {};
    for (let i = 0, l = this.keys.length; i < l; i++) {
      if ('function' === typeof buttons[this.keys[i]]) {
        this.availableButtons[this.keys[i]] = false;
        this.buttonActions[this.keys[i]] = buttons[this.keys[i]];
      } else {
        console.warn(
          `Controller: Warning ${this.keys[i]}'s property was not a function`
        );
      }
    }

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.buttons = buttons;
  }

  /**
   *
   * Updates Controller values
   * @memberof Controller
   */
  update() {
    for (let i = 0, l = this.keys.length; i < l; i++) {
      if (this.availableButtons[this.keys[i]]) {
        this.buttonActions[this.keys[i]]();
      }
    }
  }

  /**
   *
   *
   * @memberof Controller
   */
  onKeyDown(e) {
    if (this.keys.includes(e.keyCode)) {
      this.availableButtons[e.keyCode] = true;
    }
  }

  /**
   *
   *
   * @memberof Controller
   */
  onKeyUp(e) {
    if (this.keys.includes(e.keyCode)) {
      this.availableButtons[e.keyCode] = false;
    }
  }
}
