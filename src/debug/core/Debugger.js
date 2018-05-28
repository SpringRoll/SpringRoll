import DebuggerConfig from './Config';

/**
 *
 *
 * @export
 * @class Debugger
 * @property {DebuggerConfig} config
 */
export default class Debugger {
  /**
   * Creates an instance of Debugger.
   * @memberof Debugger
   */
  constructor(config = {}) {
    if (0 < Object.keys(config).length) {
      config.globalConfig = false;
      this.config = new DebuggerConfig(config);
    } else {
      this.config = DebuggerConfig.getConfig();
    }
  }
}
