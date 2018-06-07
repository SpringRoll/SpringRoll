/**
 *
 *
 * @export
 * @class Tester
 */
export default class Debugger {
  /**
   * Creates an instance of Tester.
   * @param {object} options
   * @param {boolean} [options.emitEnabled=false]
   * @param {'GENERAL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'} [options.minLevel='GENERAL']
   * @memberof Tester
   */
  constructor({ emitEnabled = false, minLevel = 'GENERAL' } = {}) {
    this.flag = Debugger.flagKey();
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
   *
   *
   * @param {any} level
   * @memberof Debugger
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
   *
   *
   * @param {string} [level='GENERAL']
   * @returns
   * @memberof Debugger
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
   *
   *
   * @param {string} level
   * @memberof Debugger
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
   *
   *
   * @param {any} isTrue
   * @param {any} [success=() => {}]
   * @param {any} [reject=() => {}]
   * @returns
   * @memberof Tester
   */
  assert(isTrue, success = () => {}, reject = () => {}) {
    Debugger.assert(isTrue, success, reject);
  }

  /**
   *
   *
   * @param {any} isTrue
   * @param {any} [success=() => {}]
   * @param {any} [reject=() => {}]
   * @returns
   * @static
   * @memberof Tester
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
   *
   *
   * @export
   * @param {'log' | 'general' | 'warn'| 'error' | 'debug' | 'info'} [type='log']
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
   *
   *
   * @param {string} [eventName='']
   * @memberof Tester
   */
  emit(eventName = 'Debugger') {
    if (this.emitEnabled) {
      window.dispatchEvent(new Event(eventName));
    }
  }

  /**
   *
   * @static
   * @returns
   * @memberof Debugger
   */
  static isEnabled() {
    return window[Debugger.flagKey()];
  }

  /**
   *
   *
   * @static
   * @param {any} flag
   * @memberof Debugger
   */
  static enable(flag) {
    window[Debugger.flagKey()] = flag;
  }

  /**
   *
   *
   * @static
   * @returns
   * @memberof Debugger
   */
  static flagKey() {
    return '__spring_roll_debugger_enabled__';
  }
}
