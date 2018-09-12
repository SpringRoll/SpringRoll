/**
 * Represents a single plugin for applications. Allows developers to inject code in the start up process of an
 * application providing new features to the application.
 * @class ApplicationPlugin
 */
export class ApplicationPlugin {
  /**
   * Creates a new Application plugin, with the provided priority.
   * @param {Number} priority The priority of the plugin. A higher value for priority will cause the plugin to execute sooner.
   */
  constructor(priority = 0) {
    this.priority = priority;
  }

  /**
   * A setup method for the plugin. This method is ran synchronously in the constructor of the Application.
   */
  setup() {}

  /**
   * A preload method for the plugin which allows for asynchronous setup tasks. Either takes a callback as first
   * parameter, or should return a Promise indicating that loading is finished.
   * @return {Promise} A promise indicating when the plugin is finished loading.
   */
  preload() {
    return Promise.resolve();
  }
}
