import { comm } from '../communication/comm';
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
   * Gets data from SpringRoll Container
   * @memberof UserData
   * @param {function} callback
   * @param {string} name
   * @static
   */
  static read(name, callback) {
    const warning = `Could not complete read action for ${name}. Bellhop is not connected.`;
    comm.connected
      ? comm.fetch(READ, callback, { name }, true)
      : console.warn(warning);
  }

  /**
   * Sends data to SpringRoll Container
   * @memberof UserData
   * @param {*} value
   * @param {string} name
   * @static
   */
  static write(name, value) {
    const warning = `Could not complete write action for ${name} with value ${value}. Bellhop is not connected.`;
    comm.connected ? comm.send(WRITE, { name, value }) : console.warn(warning);
  }

  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static delete(name) {
    const warning = `Could not complete delete action for ${name}. Bellhop is not connected.`;
    comm.connected ? comm.send(DELETE, { name }) : console.warn(warning);
  }
}
export default UserData;
