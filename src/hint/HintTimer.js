import { Debugger } from './../debug/Debugger';
/**
 *
 * @export
 * @class HintTimer
 */
export class HintTimer {
  /**
   * Creates an instance of HintTimer.
   * @memberof HintTimer
   */
  constructor() {
    this.listeners = [];
  }

  /**
   * @param  {Number} time time in milliseconds
   * @return {void}@memberof HintTimer
   */
  start(time) {
    if (!time) {
      Debugger.log('warn', '[HintTimer.start()] must specify a time!');
      return;
    }

    this.length = time;
    this.timer = setTimeout(this.dispatch.bind(this), time);
  }

  /**
   * resets the timer, does not call subscribed functions
   * @return {void}@memberof HintTimer
   */
  reset() {
    if (!this.timer) {
      Debugger.log('warn', '[HintTimer.reset()] timer has not been started');
      return;
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(this.dispatch.bind(this), this.length);
  }

  /**
   * @return {void}@memberof HintTimer
   */
  stop() {
    if (!this.timer) {
      Debugger.log('warn', '[HintTimer.reset()] timer has not been started');
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
  }

  /**
   * Calls all subscribed functions, and resets the timer.
   * @return {void}@memberof HintTimer
   */
  dispatch() {
    this.listeners.forEach(listener => {
      listener(this._value);
    });
    this.reset();
  }

  /**
   * Adds a function to be called when timer is dispatched
   * @param  {Function()} callback 
   * @return {void}@memberof HintTimer
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Removes a function from being called when timer is dispatched
   * @param  {any} callback
   * @return {void}@memberof HintTimer
   */
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}
