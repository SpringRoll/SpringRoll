import { BellhopSingleton } from '../communication/BellhopSingleton';
const onReturn = Symbol('onReturn');
const READ = 'userDataRead';
const WRITE = 'userDataWrite';
const DELETE = 'userDataRemove';

const IDBOPEN = 'IDBOpen';
const IDBADD = 'addToDb';
const IDBDELETE = 'deleteFromDb';
const IDBREAD = 'readDb';
const IDBUPDATE = 'getCursorDb';
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
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete read action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](READ, name)
      .then(({ data }) => {
        return data;
      });
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
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete read action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](DELETE, name);
  }


  /**
   * Opens a connection with the indexedDB database
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static IDBOpen(dbName, dbVersion = null, additions = {}, deletions = {}) {
    if (!BellhopSingleton.connected) {
      console.log('gggg');
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](IDBOPEN, {dbName: dbName, dbVersion: dbVersion, additions: additions, deletions: deletions });
  }

  /**
   * Adds a record to the indexedDB database
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static addToStore(storeName, value) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](IDBADD, { storeName, value });
  }

  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static deleteFromStore(storeName, key) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](IDBDELETE, {storeName, key });
  }
  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static readFromStore(storeName, key) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    
    return this[onReturn](IDBREAD, {storeName, key });
  }

  /**
   * 
   * @param {string} storeName 
   * @param {string} key 
   * @param {string} object 
   */
  static updateFromStore(storeName, key, object ) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    return this[onReturn](IDBUPDATE, {storeName, key, object });

  }
}
export default UserData;

