import { ResizeHelper } from './ResizeHelper';

/**
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
    this.width = 1;
    this.height = 1;
    this.callback = callback;

    /** @private */
    this.resizer = new ResizeHelper(this);

    if (callback instanceof Function) {
      this.enable(callback);
    }
  }

  /**
   * onResize maps and passes the relevant data to the user provided callback function.
   * @param {UIEvent} event
   * @private
   */
  onResize(event) {
    const resize = () => {
      const width = event.target.innerWidth;
      const height = event.target.innerHeight;

      this.callback({
        width,
        height,
        ratio: width / height
      });

      this.width = width;
      this.height = height;
    };

    resize();

    // handle a bug in iOS where innerWidth and innerHeight aren't correct immediately after resize.
    setTimeout(resize, 500);
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
