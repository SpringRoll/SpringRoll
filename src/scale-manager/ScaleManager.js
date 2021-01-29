import { ResizeHelper } from './ResizeHelper';

/**
 * [Deprecated]
 * 
 * Simplifies listening to resize events by passing the relevant data to a provided callback.
 * @class ScaleManager
 * @param {Function} [callback=undefined]
 * @property {Function} [callback=undefined]
 */
export class ScaleManager {
  /**
   *Creates an instance of ScaleManager.
   */
  constructor(callback = () => {}) {
    console.warn('SpringRoll.ScaleManager has been deprecated. Use SpringRoll.SafeScaleManager instead.');

    this.width = 1;
    this.height = 1;
    this.callback = callback;

    /** @private */
    this.resizer = new ResizeHelper(this.onResize.bind(this));

    if (callback instanceof Function) {
      this.enable(callback);
    }
  }

  /**
   * onResize maps and passes the relevant data to the user provided callback function.
   * @param {object} param
   * @param {number} param.width - Current window width
   * @param {number} param.height - Current window height
   * @private
   */
  onResize({ width, height }) {
    this.width = width;
    this.height = height;

    const ratio = width / height;
    this.callback({ width, height, ratio });
  }

  /**
   * Enables the scale manager listener. Will not be enabled if a callback is not supplied.
   * @param {Function} callback The function to be called on resize events.
   */
  enable(callback) {
    if (callback instanceof Function) {
      this.callback = callback;
      this.resizer.enabled = true;
    } else {
      console.warn('Scale Manager was not passed a function');
    }
  }

  /**
   * Disables the scale manager.
   */
  disable() {
    this.resizer.enabled = false;
  }
}
