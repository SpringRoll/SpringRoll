import StateManager from './state/StateManager';

/**
 * Main entry point for a game. Provides a single focal point for plugins and functionality to attach.
 * @class Application
 */
export class Application {
  /**
   * Creates a new application, setting up plugins along the way
   */
  constructor() {
    this.state = new StateManager();
    this.state.addField('ready', false);

    Application._plugins.forEach(plugin => plugin.setup.call(this));
    
    const preloads = Application._plugins
      .map(plugin => this.promisify(plugin.preload));
    Promise.all(preloads).then(() => this.state.ready.value = true);
  }

  /**
   * Converts a callback-based or synchronous function into a promise. This method is used for massaging plugin preload
   * methods before they are executed.
   * @param {Function} callback A function that takes either a callback, or returns a promise
   * @return Promise A promise that resolves when the function finishes executing (whether it is asynchronous or not)
   */
  promisify(callback) {
    // if it takes no argument, assume that it's synchronous or returns a Promise
    if(callback.length === 0) {
      return Promise.resolve(callback.call(this));
    }
    
    // if it has an argument, that means it uses a callback structure    
    return new Promise((resolve, reject) => {
      callback.call(this, function(error) {
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

/**
 * Registers a plugin to be used by applications, sorting it by priority order
 * @param {ApplicationPlugin} plugin The plugin to register
 */
Application.uses = function(plugin) {
  Application._plugins.push(plugin);
  Application._plugins.sort((p1, p2) => p2.priority - p1.priority);
};
