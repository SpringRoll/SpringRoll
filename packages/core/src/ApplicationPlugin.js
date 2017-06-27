import Application from './Application';

/**
 * Responsible for creating properties, methods to 
 * the SpringRoll Application when it's created.
 *
 *    var plugin = new ApplicationPlugin('custom');
 *    plugin.setup = function()
 *    {
 *        this.options.add('customOption', null);
 *    };
 *
 * @class ApplicationPlugin
 * @constructor
 * @param {String} name The unique name for the plugin
 * @param {String|Array<String>} [dep] Other plugins names that are required for this plugin.
 */
export default class ApplicationPlugin {
    constructor(name, dep) {
        if (!name || typeof name !== 'string') {
            throw 'ApplicationPlugin first argument must be a name (string)';
        }

        /**
         * The priority of the plugin. Higher numbers handled first. This should be set
         * in the constructor of the extending ApplicationPlugin.
         * @property {int} priority
         * @default 0
         * @private
         */
        this.name = name;

        // Convert single deep to array
        if (typeof dep === 'string') {
            dep = [dep];
        }

        /**
         * The list of dependencies.
         * @property {Array<String>} dep
         * @private
         */
        this.dep = dep || [];

        /**
         * When the application is being initialized. This function 
         * is bound to the Application. This should be overridden.
         * @method setup
         */
        this.setup = () => {};

        /**
         * When the application is being destroyed. This function 
         * is bound to the Application. This should be overridden.
         * @method teardown
         */
        this.teardown = () => {};

        /**
         * When the application is ready to use. All plugins have been preloaded.
         * @method ready
         */
        this.ready = () => {};

        /**
         * The function to call right before the application is initailized. 
         * This function is bound to the Application. `preload` takes
         * a single parameter which is a call back to call when
         * the asyncronous event is completed.
         * @method preload 
         * @param {function} done The event to call when complete
         */
        this.preload = null;

        // Add the plugin to application
        Application.register(this);
    }
}
