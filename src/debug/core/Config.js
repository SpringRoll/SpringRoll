/**
 *
 *
 * @export
 * @class DebuggerConfig
 */
export default class DebuggerConfig {
  /**
   * Creates a new instance of Debugger or returns the current instance from the window.
   * @memberof Debugger
   */
  constructor({ globalConfig = true, logLevel = 1, debug = false } = {}) {
    if (globalConfig && 'undefined' !== typeof window.srDebuggerConfig) {
      return window.srDebuggerConfig;
    }
    this.logLevel = logLevel;
    this.debug = debug;

    if (globalConfig) {
      window.srDebuggerConfig = this;
    }
  }

  /**
   *
   *
   * @static
   * @param {boolean} [enabled=true]
   * @memberof DebuggerConfig
   */
  static debug(enabled = true) {
    if (window.srDebuggerConfig) {
      window.srDebuggerConfig.debug = enabled;
    } else {
      new DebuggerConfig({ debug: enabled });
    }
  }

  /**
   *
   *
   * @static
   * @param {number} [level=1]
   * @memberof DebuggerConfig
   */
  static logLevel(level = 1) {
    if (window.srDebuggerConfig) {
      window.srDebuggerConfig.logLevel = level;
    } else {
      new DebuggerConfig({ logLevel: level });
    }
  }

  /**
   *
   *
   * @static
   * @returns
   * @memberof DebuggerConfig
   */
  static getConfig() {
    if (window.srDebuggerConfig) {
      return window.srDebuggerConfig;
    } else {
      return new DebuggerConfig();
    }
  }
}
