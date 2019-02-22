/**
 * Represents a single plugin for applications. Allows developers to inject code in the start up process of an
 * application providing new features to the application.
 * @class ApplicationPlugin
 */
export class ApplicationPlugin {
  /**
   * Creates a new Application plugin with a given name and other required plugins
   * @param {Object} [options={}] The configuration options to the plugin
   * @param {String} [options.name] The name of the plugin. Used by other plugins to specify a dependency on the plugin
   */
  constructor(options = {}) {
    if (options.name === undefined) {
      throw new Error('Application plugin not provided a name field');
    }

    this.name = options.name;
  }

  /**
   * A preload method for the plugin which allows for asynchronous setup tasks. Either takes a callback as first
   * parameter, or should return a Promise indicating that loading is finished.
   * @return {Promise} A promise indicating when the plugin is finished loading.
   */
  preload() {
    return Promise.resolve();
  }

  /**
   * An init method for the plugin. This method is ran synchronously in the constructor of the Application.
   * After all plugins preloads  has completed
   */
  init() {}

  /**
   * A start method for the plugin. This method is ran synchronously in the constructor of the Application.
   * After all plugins inits has completed
   */
  start() {}
}
