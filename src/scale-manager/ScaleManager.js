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
  constructor(callback) {
    this.width = 1;
    this.height = 1;
    this.callback = callback;

    this.onResize = this.onResize.bind(this);

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
    setTimeout(() => {
      const width = event.target.innerWidth;
      const height = event.target.innerHeight;

      this.callback({
        width,
        height,
        ratio: width / height
      });

      this.width = width;
      this.height = height;
    }, 500);
  }

  /**
   * Enables the scale manager listener. Will not be enabled if a callback is not supplied.
   * @param {Function} callback The function to be called on resize events.
   */
  enable(callback) {
    if (callback instanceof Function) {
      this.callback = callback;
      window.addEventListener('resize', this.onResize);
    } else {
      console.warn('Scale Manager was not passed a function');
    }
  }

  /**
   * Disables the scale manager.
   */
  disable() {
    window.removeEventListener('resize', this.onResize);
  }
}
