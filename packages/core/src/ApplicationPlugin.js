import Application from './Application';

/**
 * Responsible for creating properties, methods to 
 * the SpringRoll Application when it's created.
 *
 *    var plugin = new ApplicationPlugin();
 *    plugin.setup = function()
 *    {
 *        this.options.add('customOption', null);
 *    };
 *
 * @class ApplicationPlugin
 * @constructor
 * @param {int} [priority=0] The priority, higher priority
 *        plugins are setup, preloaded and destroyed first.
 */
export default class ApplicationPlugin
{
    constructor(priority)
    {
        function noop() {};
        
        /**
         * The priority of the plugin. Higher numbers handled first. This should be set
         * in the constructor of the extending ApplicationPlugin.
         * @property {int} priority
         * @default 0
         * @private
         */
        this.priority = priority || 0;


        /**
         * When the application is being initialized. This function 
         * is bound to the Application. This should be overridden.
         * @method setup
         */
        this.setup = noop;

        /**
         * The function to call right before the application is initailized. 
         * This function is bound to the Application. `preload` takes
         * a single parameter which is a call back to call when
         * the asyncronous event is completed.
         * @method preload 
         * @param {function} done The event to call when complete
         */
        this.preload = null;

        /**
         * When the application is being destroyed. This function 
         * is bound to the Application. This should be overridden.
         * @method teardown
         */
        this.teardown = noop;

        // Add the plugin to application
        Application._plugins.push(this);
        Application._plugins.sort(function(a, b)
        {
            return b.priority - a.priority;
        });
    }
}
