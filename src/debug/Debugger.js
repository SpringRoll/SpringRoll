/**
 * @typedef {object} DebuggerParams
 * @property {boolean} emitEnabled
 * @property {boolean} enabled
 * @property {number} minLevel
 * @class Debugger
 * @param {Object} params - Options
 * @param {boolean} [params.emitEnabled=false] If this should emit events to the window.
 * @param {'GENERAL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'} [params.minLevel='GENERAL'] The starting log level for the logger.
 */
export class Debugger {
  /**
   * Returns the params of the debugger.
   * @returns {DebuggerParams}
   * @readonly
   * @static
   * @memberof Debugger
   */
  static get params() {
    Debugger.initParams();
    return window[Debugger.paramKey];
  }

  /**
   * Sets the logging level of the debugger.
   * @param {string | number} level The name of the level.
   * @return {void}
   */
  static minLevel(level) {
    Debugger.initParams();
    if ('number' === typeof level) {
      window[Debugger.paramKey].minLevel = level;
      return;
    }

    level = level.toUpperCase();
    if (Debugger.isValidLevelName(level)) {
      window[Debugger.paramKey].minLevel = Debugger.LEVEL[level];
    } else {
      window[Debugger.paramKey].minLevel = Debugger.LEVEL['GENERAL'];
    }
  }

  /**
   * Setup the params if not set already.
   * @private
   * @static
   * @memberof Debugger
   */
  static initParams() {
    if (!window[Debugger.paramKey]) {
      window[Debugger.paramKey] = {
        emitEnabled: false,
        enabled: true,
        minLevel: 1
      };
    }
  }

  /**
   * If emitting is enabled for this instance, then it will dispatch an event on the window.
   * @param {string} [eventName='Debugger'] Name of the event
   */
  static emit(eventName = 'Debugger') {
    Debugger.initParams();
    if (Debugger.params.emitEnabled) {
      window.dispatchEvent(new Event(eventName));
    }
  }

  /**
   * Returns logging levels.
   * @readonly
   * @returns {object}
   * @static
   * @memberof Debugger
   */
  static get LEVEL() {
    return {
      GENERAL: 1,
      DEBUG: 2,
      INFO: 3,
      WARN: 4,
      ERROR: 5
    };
  }

  /**
   * Function to test if level meets requirements.
   * @param {string} [level='GENERAL']
   * @returns {boolean}
   * @private
   */
  static meetsLevelRequirement(level = 'GENERAL') {
    Debugger.initParams();
    if (Debugger.isValidLevelName(level)) {
      if (Debugger.LEVEL[level] >= Debugger.params.minLevel) {
        return true;
      }
    }
    return false;
  }

  /**
   * Console logs all supplied arguments if the log level is low enough for them to be logged.
   * @param {'log' | 'general' | 'warn'| 'error' | 'debug' | 'info'} [type='log'] minimum level for this log to run at
   * @param {*[]} args Arguments you wish to log.
   */
  static log(type = 'log', ...args) {
    Debugger.initParams();
    if (Debugger.isEnabled()) {
      switch (type.toLowerCase()) {
      case 'info':
        if (Debugger.meetsLevelRequirement('INFO')) {
          console.info(...args);
          Debugger.emit();
          return true;
        }
        return false;
      case 'debug':
        if (Debugger.meetsLevelRequirement('DEBUG')) {
          console.debug(...args);
          Debugger.emit();
          return true;
        }
        return false;
      case 'error':
        if (Debugger.meetsLevelRequirement('ERROR')) {
          console.error(...args);
          Debugger.emit();
          return true;
        }
        return false;
      case 'warn':
        if (Debugger.meetsLevelRequirement('WARN')) {
          console.warn(...args);
          Debugger.emit();
          return true;
        }
        return false;
      case 'log':
      case 'general':
      default:
        if (Debugger.meetsLevelRequirement('GENERAL')) {
          console.log(...args);
          Debugger.emit();
          return true;
        }
        return false;
      }
    }
  }

  /**
   * Checks to see if the string argument is a valid level name.
   * @param {string} level The level name.
   * @return {boolean}
   * @private
   */
  static isValidLevelName(level) {
    Debugger.initParams();
    if (
      'GENERAL' == level ||
      'DEBUG' == level ||
      'INFO' == level ||
      'WARN' == level ||
      'ERROR' == level
    ) {
      return true;
    }

    return false;
  }

  /**
   * Will throw if statement is false.
   * @static
   * @param {boolean} isTrue The expression to evaluate.
   */
  static assert(isTrue) {
    Debugger.initParams();
    if (!isTrue) {
      throw `Assert Error: ${isTrue}`;
    }
  }

  /**
   * Returns a boolean indicating if the debugger has been enabled or not.
   * @static
   * @returns {boolean}
   */
  static isEnabled() {
    return window[Debugger.paramKey].enabled;
  }

  /**
   * Disables or enables all debugger instances.
   * TODO: Remove the parameter here, and add a disable method as well
   * @static
   * @param {boolean} flag
   * @returns {void}
   */
  static enable(flag) {
    Debugger.initParams();
    window[Debugger.paramKey].enabled = flag;
  }

  /**
   * Returns the global params key.
   * @readonly
   * @static
   * @memberof Debugger
   */
  static get paramKey() {
    return '__spring_roll_debugger_params__';
  }
}
