import { Debugger } from '../debug/Debugger';
/**
 *
 * @export
 * @class IdleTimer
 */
export class IdleTimer {
  /**
   * Creates an instance of IdleTimer.
   * @memberof IdleTimer
   */
  constructor() {
    this.listeners = [];
  }

  /**
   * @param  {Number} time time in milliseconds
   * @return {void}@memberof IdleTimer
   */
  start(time = 15000) {
    if (!time) {
      Debugger.log('warn', '[IdleTimer.start()] must specify a time!');
      return;
    }

    this.length = time;
    this.timer = setTimeout(this.dispatch.bind(this), time);
  }

  /**
   * resets the timer, does not call subscribed functions
   * @return {void}@memberof IdleTimer
   */
  reset() {
    if (!this.timer) {
      Debugger.log('warn', '[IdleTimer.reset()] timer has not been started');
      return;
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(this.dispatch.bind(this), this.length);
  }

  /**
   * @return {void}@memberof IdleTimer
   */
  stop() {
    if (!this.timer) {
      Debugger.log('warn', '[IdleTimer.reset()] timer has not been started');
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
  }

  /**
   * Calls all subscribed functions, and resets the timer.
   * @return {void}@memberof IdleTimer
   */
  dispatch() {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i]();
    }
    this.reset();
  }

  /**
   * Adds a function to be called when timer is dispatched
   * @param  {Function()} callback
   * @return {void}@memberof IdleTimer
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Removes a function from being called when timer is dispatched
   * @param  {any} callback
   * @return {void}@memberof IdleTimer
   */
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}
