/**
 * @export
 * @class Debugger
 * @param {Object} params - options
 * @param {boolean} [params.emitEnabled=false] If this should emit events to the window
 * @param {'GENERAL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'} [params.minLevel='GENERAL'] The starting log level for the logger
 */
export default class Debugger {
  /**
   *Creates an instance of Debugger.
   */
  constructor({ emitEnabled = false, minLevel = 'GENERAL' } = {}) {
    this.flag = Debugger.flagKey;
    this.emitEnabled = emitEnabled;

    if ('undefined' === typeof window[this.flag]) {
      window[this.flag] = true;
    }

    this.LEVEL = {
      GENERAL: 1,
      DEBUG: 2,
      INFO: 3,
      WARN: 4,
      ERROR: 5
    };
    this.setLevel(minLevel);
  }

  /**
   * Checks to see if the string argument is a valid level name
   * @param {string} level the level name
   * @return {boolean}
   * @private
   */
  isValidLevelName(level) {
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
   * Function to test if level meets requirements
   * @param {string} [level='GENERAL']
   * @returns {boolean}
   * @private
   */
  meetsLevelRequirement(level = 'GENERAL') {
    if (this.isValidLevelName(level)) {
      if (this.LEVEL[level] >= this.minLevel) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sets the logging level of the debugger
   * @param {string} level the name of the level
   * @return {void}
   */
  setLevel(level) {
    level = level.toUpperCase();
    if (this.isValidLevelName(level)) {
      this.minLevel = this.LEVEL[level];
    } else {
      this.minLevel = this.LEVEL['GENERAL'];
    }
  }

  /**
   * Will call the first or second supplied function depending if the isTrue argument passes.
   * Is also only called when Debugging is enabled
   * @param {boolean} isTrue the expression to evaluate
   * @param {Function} [success=() => {}] success callback
   * @param {Function} [reject=() => {}] reject callback
   * @returns
   */
  assert(isTrue, success = () => {}, reject = () => {}) {
    Debugger.assert(isTrue, success, reject);
  }

  /**
   *
   * Console logs all supplied arguments if the log level is low enough for them to be logged
   * @param {'log' | 'general' | 'warn'| 'error' | 'debug' | 'info'} [type='log'] minimum level for this log to run at
   * @param {*[]} args arguments you wish to log
   */
  log(type = 'log', ...args) {
    if (Debugger.isEnabled()) {
      switch (type.toLowerCase()) {
      case 'info':
        if (this.meetsLevelRequirement('INFO')) {
          console.info(...args);
          this.emit();
          return true;
        }
        return false;
      case 'debug':
        if (this.meetsLevelRequirement('DEBUG')) {
          console.debug(...args);
          this.emit();
          return true;
        }
        return false;
      case 'error':
        if (this.meetsLevelRequirement('ERROR')) {
          console.error(...args);
          this.emit();
          return true;
        }
        return false;
      case 'warn':
        if (this.meetsLevelRequirement('WARN')) {
          console.warn(...args);
          this.emit();
          return true;
        }
        return false;
      case 'log':
      case 'general':
      default:
        if (this.meetsLevelRequirement('GENERAL')) {
          console.log(...args);
          this.emit();
          return true;
        }
        return false;
      }
    }
  }

  /**
   * Will call the first or second supplied function depending if the isTrue argument passes.
   * Is also only called when Debugging is enabled
   * @static
   * @param {boolean} isTrue the expression to evaluate
   * @param {Function} [success=() => {}] success callback
   * @param {function} [reject=() => {}] reject callback
   * @returns
   */
  static assert(isTrue, success = () => {}, reject = () => {}) {
    if (Debugger.isEnabled()) {
      if (isTrue) {
        return success(isTrue);
      }
      // this.emit('assert');
      return reject(isTrue);
    }
  }

  /**
   * If emitting is enabled for this instance than it will dispatch a event on the window
   * @param {string} [eventName='Debugger'] Name of the event
   */
  emit(eventName = 'Debugger') {
    if (this.emitEnabled) {
      window.dispatchEvent(new Event(eventName));
    }
  }

  /**
   * returns a boolean indicating if the debugger has been enabled or not
   * @static
   * @returns {boolean}
   */
  static isEnabled() {
    return window[Debugger.flagKey];
  }

  /**
   * Disabled or enables all debugger instances
   * @static
   * @param {boolean} flag
   * @returns {void}
   */
  static enable(flag) {
    window[Debugger.flagKey] = flag;
  }

  /**
   * returns the global debugger flag key name
   * @static
   * @private
   * @returns {string}
   */
  static get flagKey() {
    return '__spring_roll_debugger_enabled__';
  }
}
