/**
 * Main entry point for a game. Provides a single focal point for plugins and functionality to attach.
 * @class Application
 */
export class Application {
  /**
   * Creates a new application, setting up plugins along the way
   */
  constructor() {
    this.listeners = {};
    Application._plugins.forEach(plugin => plugin.setup.call(this));
    
    const preloads = Application._plugins
      .map(plugin => this.promisify(plugin.preload))
    Promise.all(preloads).then(() => this.emit('init'));
  }

  /**
   * Attaches an listener to events emitted on this class
   * @param {String} eventName The name of the event to listen for
   * @param {Function} method The function to call when the event is emitted
   */
  on(eventName, method) {
    if(!Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName] = this.listeners[eventName] || [];
    }

    this.listeners[eventName].push(method);
  }

  /**
   * Emits an event on this application, with some data
   * @param {String} eventName The event to emit
   * @param {Object} data The data to emit along with the event
   */
  emit(eventName, data) {
    if(this.listeners[eventName] instanceof Array) {
      this.listeners[eventName].forEach(function(callback) {
        callback(data);
      });
    }
  }

  /**
   * Converts a callback-based or synchronous function into a promise. This method is used for massaging plugin preload
   * methods before they are executed.
   * @param {Function} f A function that takes either a callback, or returns a promise
   * @return Promise A promise that resolves when the function finishes executing (whether it is asynchronous or not)
   */
  promisify(f) {
    // if it takes no argument, assume that it's synchronous or returns a Promise
    if(f.length === 0) {
      return Promise.resolve(f.call(this));
    }
    
    // if it has an argument, that means it uses a callback structure    
    return new Promise((resolve, reject) => {
      f.call(this, function(error) {
        if(error) {
          reject(error);
        } else {
          resolve(error);
        }
      });
    });
  }
}

/**
 * The list of plugins that are currently registered to run on Applications
 * @static
 */
Application._plugins = [];
