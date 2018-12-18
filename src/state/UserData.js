import { BellhopSingleton } from '../communication/BellhopSingleton';
const onReturn = Symbol('onReturn');
const READ = 'userDataRead';
const WRITE = 'userDataWrite';
const DELETE = 'userDataRemove';
/**
 *
 * Manages data between SpringRoll Container and SpringRoll
 * @export
 * @class UserData
 */
export class UserData {
  /**
   * Handles return
   * @function
   * @memberof UserData
   * @name onReturn
   * @param {*} data
   * @param {number} [attempts=3]
   * @param {string} METHOD
   * @private
   * @returns
   * @static
   */
  static [onReturn](METHOD, data, attempts = 3) {
    return new Promise((resolve, reject) => {
      let success = false;
      let count = 0;

      const onReturn = event => {
        BellhopSingleton.off(METHOD, onReturn);
        success = true;
        resolve(event);
      };
      BellhopSingleton.on(METHOD, onReturn);

      BellhopSingleton.send(METHOD, data);

      const interval = setInterval(() => {
        if (success) {
          clearInterval(interval);
          return;
        }

        if (count >= attempts) {
          clearInterval(interval);
          BellhopSingleton.off(METHOD, onReturn);
          reject('No Response');
        }
        count++;
      }, 100);
    });
  }

  /**
   * Gets data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @return {Promise}
   * @static
   */
  static read(name) {
    const warning = `Could not complete read action for ${name}. Bellhop is not connected.`;
    return BellhopSingleton.connected
      ? this[onReturn](READ, {})
      : new Promise((_, reject) => reject(warning));
  }

  /**
   * Sends data to SpringRoll Container
   * @memberof UserData
   * @param {*} value
   * @param {string} name
   * @returns {Promise}
   * @static
   */
  static write(name, value) {
    const warning = `Could not complete write action for ${name} with value ${value}. Bellhop is not connected.`;
    return BellhopSingleton.connected
      ? this[onReturn](WRITE, { name, value })
      : new Promise((_, reject) => reject(warning));
  }

  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static delete(name) {
    const warning = `Could not complete delete action for ${name}. Bellhop is not connected.`;
    BellhopSingleton.connected
      ? BellhopSingleton.send(DELETE, { name })
      : console.warn(warning);
  }
}
export default UserData;
