import EventEmitter from './events/EventEmitter';
import ApplicationOptions from './ApplicationOptions';
import series from 'async-series';
import sequencify from 'sequencify';

/**
 * Application is the main entry point for using SpringRoll, creating
 * an application allows the creation of displays and adding of module
 * functionality (e.g. sound, captions, etc). All timing and asynchronous
 * events should be handled by the Application to control the play
 * and pause. Any update, Ticker-type functions, should use the Applications
 * update event.
 *
 *    const app = new Application({});
 *
 * @class Application
 * @extends springroll.EventEmitter
 * @constructor
 * @param {Object} [options] The options for creating the application,
 *         see `springroll.ApplicationOptions` for the specific options
 *        that can be overridden and set.
 * @param {Function} [ready=null] The callback when initialized
 */
export default class Application extends EventEmitter
{
    constructor(options, ready)
    {
        super();

        if (Application.instance)
        {
            throw `Only one Application can be opened at a time`;
        }
        Application.instance = this;

        /**
         * Initialization options/query string parameters, these properties are read-only
         * Application properties like raf, fps, don't have any affect on the options object.
         * @property {springroll.ApplicationOptions} options
         * @readOnly
         */
        this.options = new ApplicationOptions(this, options);

        /**
         * Override this to do post constructor initialization
         * @property {Function} ready
         */
        this.ready = ready || null;

        /**
         * If the current application is paused
         * @private
         * @property {Boolean} _paused
         */
        this._paused = false;

        /**
         * If the current application is enabled
         * @private
         * @property {Boolean} _enabled
         */
        this._enabled = true;

        /**
         * The collection of function references to call when initializing the application
         * these are registered by external modules.
         * @property {Array<springroll.ApplicationPlugin>} _plugins
         * @private
         */
        this._plugins = Application.sortPlugins();

        // Call any global libraries to initialize
        this._plugins.forEach(plugin => {
            plugin.setup.call(this);
        });

        // Options are initialized after plugins
        // so plugins can define their own options
        this.options.init();

        /**
         * The name of the game, useful for debugging purposes
         * @property {String} name
         * @default ""
         */
        this.name = this.options.name;

        //other initialization stuff too
        //if there are some specific properties on the options, use them to make a display
        //call init after handling loading up a versions file or any other needed asynchronous
        //stuff?
        setTimeout(this._preload.bind(this), 0);
    }

    /**
     * The current version of the library
     * @property {String} version
     * @static
     * @readOnly
     */
    static get version()
    {
        return '/* @echo VERSION */';
    }

    /**
     * The internal initialization
     * @method _preload
     * @private
     */
    _preload()
    {
        if (this.destroyed)
        {
            return;
        }

        /**
         * Before preload of plugins begin.
         * @event beforePreload
         */
        this.emit('beforePreload');

        const tasks = [];

        this._plugins.forEach(plugin => {
            if (plugin.preload)
            {
                tasks.push(plugin.preload.bind(this));
            }
        });

        series(tasks, this._ready.bind(this));
    }


    /**
     * Initialize the application
     * @method _ready
     * @protected
     */
    _ready()
    {
        if (this.destroyed)
        {
            return;
        }

        /**
         * Fired when before initialization of the application
         * @event beforeReady
         */
        this.emit('beforeReady');

        //start update loop
        this.paused = false;

        /**
         * Fired when initialization of the application is ready
         * @event ready
         */
        this.emit('ready');

        // Call the init function, bind to app
        if (this.ready)
        {
            this.ready(this);
        }

        /**
         * Fired when initialization of the application is done
         * @event afterReady
         */
        this.emit('afterReady');
    }

    /**
     * Enables at the application level which enables
     * and disables all the displays.
     * @property {Boolean} enabled
     * @default true
     */
    set enabled(enabled)
    {
        this._enabled = enabled;
        this.emit('enable', enabled);
        this.emit(enabled ? 'enabled' : 'disabled', enabled);
    }
    get enabled()
    {
        return this._enabled;
    }

    /**
     * Manual pause for the entire application, this suspends
     * anything driving the the application update events. Include
     * Animator, Captions, Sound and other media playback.
     * @property {Boolean} paused
     */
    get paused()
    {
        return this._paused;
    }
    set paused(value)
    {
        this._paused = !!value;
        this.internalPaused(this._paused);
    }

    /**
     * Handle the internal pause of the application
     * @protected
     * @method internalPaused
     * @param  {Boolean} paused If the application should be paused or not
     */
    internalPaused(paused)
    {
        /**
         * Fired when the pause state is toggled
         * @event pause
         * @param {boolean} paused If the application is now paused
         */
        this.emit('pause', paused);

        /**
         * Fired when the application becomes paused
         * @event paused
         */

        /**
         * Fired when the application resumes from a paused state
         * @event resumed
         */
        this.emit(paused ? 'paused' : 'resumed');
    }

    /**
     * Destroys the application and all active displays and plugins
     * @method destroy
     */
    destroy()
    {
        if (this.destroyed)
        {
            return;
        }

        this.paused = true;

        /**
         * Fired when the application is destroyed
         * @event destroy
         */
        this.emit('destroy');

        // Destroy in the reverse priority order
        const plugins = this._plugins.slice().reverse();

        plugins.forEach(plugin => {
            plugin.teardown.call(this);
        });

        this._plugins = null;

        Application.instance = null;

        this.options.destroy();
        this.options = null;

        super.destroy();
    }

    /**
     * The toString debugging method
     * @method toString
     * @return {String} The reprsentation of this class
     */
    toString()
    {
        return `[Application name='${this.name}']`;
    }

    /**
     * Register a plugin with the application. This is done before
     * constructing an Application object.
     * @static
     * @method register
     */
    static register(plugin)
    {
        const {plugins} = Application;

        if (!plugin || !plugin.name)
        {
            throw `Plugin does not contain a valid "name"`;
        }
        else if (plugins[plugin.name])
        {
            throw `Plugin is already registered with name "${plugin.name}"`;
        }

        plugins[plugin.name] = plugin;
    }

    /**
     * Internal method to sort the plugins by dependencies.
     * @static
     * @method sortPlugins
     * @private
     * @return {Array<springroll.ApplicationPlugin} List of plugins correctly sorted
     */
    static sortPlugins()
    {
        // Create the sequence based off the plugins
        const results = [];
        const {plugins} = Application;

        sequencify(plugins, Object.keys(plugins), results);

        // Resort the plugins by results
        results.forEach((name, i) => {
            results[i] = plugins[name];
        });

        return results;
    }
}

/**
 * Map of all plugins
 * @property {Object{string, springroll.ApplicationPlugin}} plugins
 * @static
 */
Application.plugins = {};

/**
 * Get the singleton instance of the application.
 * @property {springroll.Application} instance
 * @static
 * @readonly
 */
Application.instance = null;
