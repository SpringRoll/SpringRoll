import Debugger from '../core/Debugger';

/**
 *
 *
 * @export
 * @class Logger
 * @extends {Debugger}
 */
export default class Logger extends Debugger {
  /**
   * Creates an instance of Logger.
   * @memberof Logger
   */
  constructor() {
    super();
  }

  /**
   *
   *
   * @memberof Logger
   */
  log(...args) {
    console.log(...args);
  }
}
