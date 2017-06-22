import EventDispatcher from './events/EventDispatcher';
import ApplicationOptions from './ApplicationOptions';
import series from 'async-series';

/**
 * Application is the main entry point for using SpringRoll, creating
 * an application allows the creation of displays and adding of module
 * functionality (e.g. sound, captions, etc). All timing and asynchronous
 * events should be handled by the Application to control the play
 * and pause. Any update, Ticker-type functions, should use the Applications
 * update event.
 *
 *    var app = new Application();
 *
 * @class Application
 * @extends springroll.EventDispatcher
 * @constructor
 * @param {Object} [options] The options for creating the application,
 *         see `springroll.ApplicationOptions` for the specific options
 *        that can be overridden and set.
 * @param {Function} [init=null] The callback when initialized
 */
export default class Application extends EventDispatcher
{
    constructor(options, init)
    {
        super();

        if (Application._instance)
        {
            throw `Only one Application can be opened at a time`;
        }
        Application._instance = this;

        /**
         * Initialization options/query string parameters, these properties are read-only
         * Application properties like raf, fps, don't have any affect on the options object.
         * @property {springroll.ApplicationOptions} options
         * @readOnly
         */
        this.options = new ApplicationOptions(this, options);

        /**
         * Override this to do post constructor initialization
         * @property {Function} init
         */
        this.init = init || null;

        /**
         * The preload progress
         * @property {springroll.AssetLoad} pluginLoad
         * @protected
         */
        this.pluginLoad = null;

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

        // Call any global libraries to initialize
        Application._plugins.forEach(plugin => {
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
        setTimeout(this._preInit.bind(this), 0);
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
     * Get the singleton instance of the application
     * @property {Application} instance
     * @static
     * @public
     */
    static get instance()
    {
        return Application._instance;
    }

    /**
     * The internal initialization
     * @method _preInit
     * @private
     */
    _preInit()
    {
        if (this.destroyed)
        {
            return;
        }

        this.trigger('beforePreload');

        const tasks = [];

        Application._plugins.forEach(plugin => {
            if (plugin.preload)
            {
                tasks.push(plugin.preload.bind(this));
            }
        });

        series(tasks, this._doInit.bind(this));
    }


    /**
     * Initialize the application
     * @method _doInit
     * @protected
     */
    _doInit()
    {
        if (this.destroyed)
        {
            return;
        }

        this.pluginLoad = null;

        this.trigger('beforeInit');

        //start update loop
        this.paused = false;

        // Dispatch the init event
        this.trigger('init');

        // Call the init function, bind to app
        if (this.init)
        {
            this.init.call(this);
        }

        this.trigger('afterInit');
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
        this.trigger('enable', enabled);
        this.trigger(enabled ? 'enabled' : 'disabled', enabled);
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
        this.trigger('pause', paused);
        this.trigger(paused ? 'paused' : 'resumed', paused);
    }

    /**
     * Destroys the application and all active displays and plugins
     * @method destroy
     */
    destroy()
    {
        // Only destroy the application once
        if (this.destroyed)
        {
            return;
        }

        this.paused = true;

        this.trigger('destroy');

        // Destroy in the reverse priority order
        const plugins = Application._plugins.slice().reverse();

        plugins.forEach(plugin => {
            plugin.teardown.call(this);
        });

        Application._instance = null;

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
}

/**
 * The collection of function references to call when initializing the application
 * these are registered by external modules.
 * @property {Array} _plugins
 * @private
 * @static
 */
Application._plugins = [];

/**
 * Get the singleton instance of the application
 * @property {Application} _instance
 * @static
 * @private
 */
Application._instance = null;

/**
 * Fired when initialization of the application is ready
 * @event init
 */

/**
 * The handler for the plugin progress
 * @event pluginProgress
 */

/**
 * Before preload of plugins begin.
 * @event beforePreload
 */

/**
 * Fired when initialization of the application is done
 * @event afterInit
 */

/**
 * Fired when before initialization of the application
 * @event beforeInit
 */

/**
 * Fired when an update is called, every frame update
 * @event update
 * @param {int} elasped The number of milliseconds since the last frame update
 */

/**
 * Fired when the pause state is toggled
 * @event pause
 * @param {boolean} paused If the application is now paused
 */

/**
 * Fired when the application becomes paused
 * @event paused
 */

/**
 * Fired when the application resumes from a paused state
 * @event resumed
 */

/**
 * Fired when the application is destroyed
 * @event destroy
 */
