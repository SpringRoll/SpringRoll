import {Enum} from '@springroll/core';
import {ConsoleTarget, DOMTarget, RemoteTarget} from './targets';

/**
 * A static closure to provide easy access to the console
 * without having errors if the console doesn't exist. This also
 * handles some edge cases with IE9 browsers which have limited
 * support for the console. In addition, this class allows support
 * for outputting console lots to the DOM (HTMLElement) or a 
 * websocket connection.
 * ### module: @springroll/debug
 * @example
 * import {Debug} from '@springroll/debug';
 * Debug.log('Your log here');
 * @class
 * @memberof springroll
 */
export default class Debug {

    /**
     * Connect to the `WebSocket`
     * @public
     * @static
     * @param {String} host The remote address to connect to, IP address or host name
     * @return {Boolean} If a connection was attempted
     */
    static connect(host) {
        Debug.remote.connect(host);
    }

    /**
     * Disconnect from the `WebSocket`
     * @public
     * @static
     */
    static disconnect() {
        Debug.remote.disconnect();
    }

    /**
     * Run a command on all targets.
     * @static
     * @private
     */
    static run(command, params, logLevel) {
        const currentLevel = logLevel ? logLevel.asInt : -1;
        if (Debug.enabled && Debug.minLogLevel.asInt >= currentLevel) {
            for (let i = 0, len = Debug.targets.length; i < len; i++) {
                Debug.targets[i].run(command, params);
            }
        }
        return Debug;
    }

    /**
     * Log something in the console or remote
     * @static
     * @param {mixed} params The statement or object to log
     * @return {Debug} The instance of debug for chaining
     */
    static log(...params) {
        return Debug.run('log', params, Debug.Levels.GENERAL);
    }

    /**
     * Debug something in the console or remote
     * @static
     * @param {mixed} params The statement or object to debug
     * @return {Debug} The instance of debug for chaining
     */
    static debug(...params) {
        return Debug.run('debug', params, Debug.Levels.DEBUG);
    }

    /**
     * Info something in the console or remote
     * @static
     * @param {mixed} params The statement or object to info
     * @return {Debug} The instance of debug for chaining
     */
    static info(...params) {
        return Debug.run('info', params, Debug.Levels.INFO);
    }

    /**
     * Warn something in the console or remote
     * @static
     * @param {mixed} params The statement or object to warn
     * @return {Debug} The instance of debug for chaining
     */
    static warn(...params) {
        return Debug.run('warn', params, Debug.Levels.WARN);
    }

    /**
     * Error something in the console or remote
     * @static
     * @param {mixed} params The statement or object to error
     */
    static error(...params) {
        return Debug.run('error', params, Debug.Levels.ERROR);
    }

    /**
     * Assert that something is true
     * @static
     * @param {Boolean} truth As statement that is assumed true
     * @param {mixed} params The message to error if the assert is false
     * @return {Debug} The instance of debug for chaining
     */
    static assert(truth, ...params) {
        return Debug.run('assert', params, Debug.Levels.ERROR);
    }

    /**
     * Method to describe an object in the console
     * @static
     * @param {Object} params The object to describe in the console
     * @return {Debug} The instance of debug for chaining
     */
    static dir(...params) {
        return Debug.run('dir', params);
    }

    /**
     * Method to clear the console
     * @static
     * @return {Debug} The instance of debug for chaining
     */
    static clear() {
        return Debug.run('clear');
    }

    /**
     * Generate a stack track in the output
     * @static
     * @param {mixed} params Optional parameters to log
     * @return {Debug} The instance of debug for chaining
     */
    static trace(...params) {
        return Debug.run('trace', params);
    }

    /**
     * Starts a new logging group with an optional title. All console output that
     * occurs after calling this method and calling `Debug.groupEnd()` appears in
     * the same visual group.
     * @static
     * @param {mixed} params Optional parameters to log
     * @return {Debug} The instance of debug for chaining
     */
    static group(...params) {
        return Debug.run('group', params);
    }

    /**
     * Creates a new logging group that is initially collapsed instead of open,
     * as with `Debug.group()`.
     * @static
     * @param {mixed} params Optional parameters to log
     * @return {Debug} The instance of debug for chaining
     */
    static groupCollapsed(...params) {
        return Debug.run('groupCollapsed', params);
    }

    /**
     * Starts a new logging group with an optional title. All console output that
     * occurs after calling this method and calling console.groupEnd() appears in
     * the same visual group.
     * @static
     * @return {Debug} The instance of debug for chaining
     */
    static groupEnd() {
        return Debug.run('groupEnd');
    }

    /**
     * Due to the way closures and variables work, _color returns
     * the color logging function needed for the color that you pass it.
     * @private
     * @param {String} hex Hex value to apply to CSS color
     * @return {Function}
     */
    static _color(hexColor) {
        return function(...params) {
            if (Debug.enabled && Debug.minLogLevel.asInt >= Debug.Levels.GENERAL.asInt) {
                for (let i = 0, len = Debug.targets.length; i < len; i++) {
                    Debug.targets[i].color(hexColor, params);
                }
            }
            return Debug;
        };
    }

    /**
     * The DOM element to output debug messages to
     *
     * @public
     * @static
     * @member {DOMElement}
     */
    static set output(output) {
        Debug.dom.output = output;
    }
    static get output() {
        return Debug.dom.output;
    }
}

/**
 * The levels of logging
 * @member {springroll.Enum}
 * @static
 * @property {int} GENERAL - The most basic general log level
 * @property {int} DEBUG - The debug log level, more priority than GENERAL
 * @property {int} INFO - The info log level, more priority than DEBUG
 * @property {int} WARN - The warn log level, more priority than WARN
 * @property {int} ERROR - The error log level, the most priority log level
 * @property {int} NONE - Hide all debug messages, including errors.
 */
Debug.Levels = new Enum(
    'GENERAL',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'NONE'
);

/**
 * The minimum log level to show, by default it's set to
 * show all levels of logging.
 * @static
 * @member {springroll.Debug.Levels}
 * @default Debug.Levels.GENERAL
 */
Debug.minLogLevel = Debug.Levels.GENERAL;

/**
 * Target for the DOM output.
 * @member {springroll.DOMTarget}
 * @private
 * @static
 */
Debug.dom = new DOMTarget();

/**
 * Target for the console.
 * @member {springroll.ConsoleTarget}
 * @private
 * @static
 */
Debug.console = new ConsoleTarget();

/**
 * Target for the WebSocket connection.
 * @member {springroll.RemoteTarget}
 * @private
 * @static
 */
Debug.remote = new RemoteTarget();

/**
 * Collection of target to output logs to.
 * @member {Array<mixed>}
 * @private
 * @static
 */
Debug.targets = [
    Debug.dom,
    Debug.console,
    Debug.remote
];

/**
 * Boolean to turn on or off the debugging
 * @static
 * @member {Boolean}
 */
Debug.enabled = true;

/**
 * List of hex colors to create Debug shortcuts for.
 * Each key will become a function Debug[key]() that outputs
 * the message in the specified color to the console if
 * the browsers allows colored logging.
 * Color Palette pulled from "Better CSS Defaults"
 * (https://github.com/mrmrs/colors)
 *
 * @private
 * @member {Object}
 */
Debug._palette = {

    /**
     * Output a general log colored as navy
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    navy: '#001F3F',

    /**
     * Output a general log colored as blue
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    blue: '#0074D9',

    /**
     * Output a general log colored as aqua
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    aqua: '#7FDBFF',

    /**
     * Output a general log colored as teal
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    teal: '#39CCCC',

    /**
     * Output a general log colored as olive
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    olive: '#3D9970',

    /**
     * Output a general log colored as green
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    green: '#2ECC40',

    /**
     * Output a general log colored as lime
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    lime: '#01FF70',

    /**
     * Output a general log colored as yellow
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    yellow: '#FFDC00',

    /**
     * Output a general log colored as orange
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    orange: '#FF851B',

    /**
     * Output a general log colored as red
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    red: '#FF4136',

    /**
     * Output a general log colored as pink
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    pink: '#F012BE',

    /**
     * Output a general log colored as purple
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    purple: '#B10DC9',

    /**
     * Output a general log colored as maroon
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    maroon: '#85144B',

    /**
     * Output a general log colored as silver
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    silver: '#ddd',

    /**
     * Output a general log colored as gray
     * @method
     * @memberof springroll.Debug
     * @param {mixed} message The message to log
     * @return {Debug} The instance of debug for chaining
     */
    gray: '#aaa'
};


// Loop through each item in the _palette object and create
// a static function in Debug via the key (the color name) that
// outputs a message to the console in key's value (a hex color).
for (let key in Debug._palette) {
    const hexColor = Debug._palette[key];
    Debug[key] = Debug._color(hexColor);
}
