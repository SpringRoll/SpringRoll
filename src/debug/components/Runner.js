import Debugger from '../core/Debugger';

/**
 *
 *
 * @export
 * @class Runner
 */
export default class Runner extends Debugger {
  /**
   * Creates an instance of Runner.
   * @memberof Runner
   */
  constructor() {
    super();
  }

  /**
   *
   *
   * @param {any} callback
   * @memberof Debugger
   */
  run(callback) {
    if (this.config.debug) {
      console.log(callback());
      debugger; // eslint-disable-line
    } else {
      console.log(callback());
    }
  }
}
