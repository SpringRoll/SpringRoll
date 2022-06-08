import { BellhopSingleton } from '../communication/BellhopSingleton';
const onReturn = Symbol('onReturn');
const READ = 'userDataRead';
const WRITE = 'userDataWrite';
const DELETE = 'userDataRemove';

const IDBOPEN = 'IDBOpen';
const IDBADD = 'IDBAdd';
const IDBREMOVE = 'IDBRemove';
const IDBREAD = 'IDBRead';
const IDBUPDATE = 'IDBUpdate';
const IDBCLOSE = 'IDBClose';
const IDBREADALL = 'IDBReadAll';
const IDBDELETEDB = 'IDBDeleteDB';
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
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    const data = {dbName: dbName, dbVersion: dbVersion, additions: additions, deletions: deletions };

    return this[onReturn](IDBOPEN, data)
      .then(({ data }) => {
        return data;
      });
  }

  /**
   * Adds a record to the indexedDB database
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static IDBAdd(storeName, value, key = null) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](IDBADD, { storeName, value, key });
  }

  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static IDBRemove(storeName, key) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }

    return this[onReturn](IDBREMOVE, {storeName, key });
  }
  /**
   * Removes data from SpringRoll Container
   * @memberof UserData
   * @param {string} name
   * @static
   */
  static IDBRead(storeName, key) {
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
  static IDBUpdate(storeName, key, value ) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    return this[onReturn](IDBUPDATE, {storeName, key, value });

  }


  /**
   *
   * @param {string} storeName The name of the store to read from
   * @param {integer} count Specifies the number of values to return if more than one is found.
   */
  static IDBReadAll(storeName, count = null) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    return this[onReturn](IDBREADALL, {storeName, count});

  }

  /**
   * Close the connection with the database
   */
  static IDBClose() {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    return this[onReturn](IDBCLOSE);

  }
  /**
   * Delete a given database
   * @param {string} DBName The name of the database to be deleted
   */
  static IDBDeleteDB(dbName) {
    if (!BellhopSingleton.connected) {
      const warning = `Could not complete connect action for ${name}. Bellhop is not connected.`;
      return Promise.reject(warning);
    }
    return this[onReturn](IDBDELETEDB, {dbName});

  }
}
export default UserData;
