import Debug from '../Debug';

/**
 * Websock remote target
 * @class
 * @private
 */
export default class RemoteTarget {
    
    /**
     * Browser port for the websocket - browsers tend to block lower ports
     * @static
     * @member {int}
     * @readonly
     * @default 1026
     */
    static get NET_PORT() {
        return 1026;
    }

    constructor() {

        this._enabled = false;
        this._socket = null;
        this._socketQueue = null;
        this._socketMessage = null;

        this.levels = {
            log: Debug.Levels.GENERAL,
            warn: Debug.Levels.WARN,
            info: Debug.Levels.INFO,
            error: Debug.Levels.ERROR,
            debug: Debug.Levels.DEBUG
        };

        /**
         * An array for preventing circular references
         * @static
         * @private
         * @member {Array}
         */
        this._circularArray = [];

        /**
         * Methods names to use to strip out lines from stack traces
         * in remote logging.
         * @private
         * @member {Array}
         */
        this._methodsToStrip = [
            //general logging
            'log',
            'debug',
            'warn',
            'info',
            'error',
            'assert',
            'dir',
            'trace',
            'group',
            'groupCollapsed',
            'groupEnd',
            //remote logging
            '_remoteLog',
            '_globalErrorHandler',
            //our color functions
            'navy',
            'blue',
            'aqua',
            'teal',
            'olive',
            'green',
            'lime',
            'yellow',
            'orange',
            'red',
            'pink',
            'purple',
            'maroon',
            'silver',
            'gray'
        ];
    }

    /**
     * Run the target.
     * @param {String} command - Values include: log, debug, warn, info, error, assert, dir
     *        trace, clear, group, groupCollapsed, groupEnd
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    run(command, params) {
        
        const level = this.levels[command];

        if (level) {
            this._remoteLog(params, level);
        }
        else if (command === 'assert' && !params[0]) {
            this._remoteLog(params.shift(), Debug.Levels.ERROR);
        }
        else if (command === 'clear') {
            this._remoteLog('', 'clear');
        }
        else if (command === 'trace' || command === 'dir') {
            this._remoteLog(params, Debug.Levels.GENERAL);
        }
        else {
            this._remoteLog(params, command);
        }
    }

    /**
     * Run the target.
     * @param {String} hexColor - Color to output
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    color(hexColor, params) {
        const colorString = `color:${hexColor}`;
        
        if (typeof params[0] === 'object') {
            params.unshift(colorString);
            params.unshift('%c%o');
        }
        else {
            params[0] = '%c' + params[0];
            params.push(colorString);
        }
        this.run('log', params);
    }

    /**
     * Connect to the `WebSocket`
     * @param {String} host The remote address to connect to, IP address or host name
     * @return {Boolean} If a connection was attempted
     */
    connect(host) {
        //Make sure WebSocket exists without prefixes for us
        if (!('WebSocket' in window) && !('MozWebSocket' in window)) {
            return false;
        }

        window.WebSocket = WebSocket || MozWebSocket;

        try {
            this._socket = new WebSocket('ws://' + host + ':' + RemoteTarget.NET_PORT);
            this._socket.onopen = this._onConnect.bind(this);
            this._socket.onclose = this._onClose.bind(this);
            this._socket.onerror = this._onClose.bind(this);
            this._socketQueue = [];
            this._enabled = true;
        }
        catch (error) {
            return false;
        }
        return true;
    }

    /**
     * Disconnect from the `WebSocket`
     */
    disconnect() {
        if (this._enabled) {
            this._socket.close();
            this._onClose();
        }
    }

    /**
     * Callback when the `WebSocket` is connected
     * @private
     */
    _onConnect() {
        //set up a function to handle all messages
        window.onerror = this._globalErrorHandler.bind(this);

        //create and send a new session message
        this._socketMessage = {
            level: 'session',
            message: '',
            stack: null,
            time: 0
        };
        this._socket.send(JSON.stringify(this._socketMessage));

        //send any queued logs
        for (let i = 0, len = this._socketQueue.length; i < len; ++i) {
            this._socket.send(JSON.stringify(this._socketQueue[i]));
        }

        //get rid of this, since we are connected
        this._socketQueue = null;
    }

    /**
     * Global window error handler, used for remote connections.
     * @private
     * @param {String} message The error message
     * @param {String} file The url of the file
     * @param {int} line The line within the file
     * @param {int} column The column within the line
     * @param {Error} error The error itself
     */
    _globalErrorHandler(message, file, line, column, error) {
        this._remoteLog(message, Debug.Levels.ERROR, error ? error.stack : null);
        //let the error do the normal behavior
        return false;
    }


    /**
     * Callback for when the websocket is closed
     * @private
     */
    _onClose() {
        window.onerror = null;
        this._enabled = false;
        this._socket.onopen = null;
        this._socket.onmessage = null;
        this._socket.onclose = null;
        this._socket.onerror = null;
        this._socket = null;
        this._socketMessage = null;
        this._socketQueue = null;
    }

    /**
     * Send a remote log message using the socket connection
     * @private
     * @param {Array} message The message to send
     * @param {level} [level=0] The log level to send
     * @param {String} [stack] A stack to use for the message. A stack will be created if stack
     *                       is omitted.
     * @return {Debug} The instance of debug for chaining
     */
    _remoteLog(message, level, stack) {

        level = level || Debug.Levels.GENERAL;

        // Make sure we're enabled
        if (!this._enabled) {
            return;
        }

        if (!Array.isArray(message)) {
            message = [message];
        }
        message = Array.prototype.slice.call(message);

        let i, length;
        // Go through each argument and replace any circular
        // references with simplified objects
        for (i = 0, length = message.length; i < length; i++) {
            if (typeof message[i] === 'object') {
                try {
                    message[i] = this._removeCircular(message[i], 3);
                }
                catch (e) {
                    message[i] = String(message[i]);
                }
            }
        }

        //figure out the stack
        if (!stack) {
            stack = new Error().stack;
        }

        //split stack lines
        stack = stack ? stack.split('\n') : [];
        //go through lines, figuring out what to strip out
        //and standardizing the format for the rest
        let splitIndex, functionSection, file, lineLocation, functionName, lineSearch,
            lastToStrip = -1,
            shouldStrip = true;

        for (i = 0, length = stack.length; i < length; ++i) {
            let line = stack[i].trim();

            //FF has an empty string at the end
            if (!line) {
                if (i === length - 1) {
                    stack.pop();
                    break;
                }
                else {
                    continue;
                }
            }
            //strip out any actual errors in the stack trace, since that is the message
            //also the 'error' line from our new Error().
            if (line === 'Error' || line.indexOf('Error:') > -1) {
                lastToStrip = i;
                continue;
            }

            // FF/Safari style:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
            if (line.indexOf('@') > -1) {
                splitIndex = line.indexOf('@');
                functionSection = line.substring(0, splitIndex);

                //if we should strip this line out of the stack, we should stop parsing the stack
                //early
                if (functionSection.indexOf('.') !== -1) {
                    functionName = functionSection.substring(functionSection.lastIndexOf('.') + 1);
                }
                else {
                    functionName = functionSection;
                }

                if (shouldStrip && this._methodsToStrip.indexOf(functionName) !== -1) {
                    lastToStrip = i;
                    continue;
                }

                //get the file and line number/column
                file = line.substring(splitIndex + 1);
            }

            // Chrome/IE/Opera style:
            //https://msdn.microsoft.com/en-us/library/windows/apps/hh699850.aspx
            else {
                splitIndex = line.indexOf('(');

                //skip the "at " at the beginning of the line and the space at the end
                functionSection = line.substring(3, splitIndex - 1);

                //if we should strip this line out of the stack, we should stop parsing the stack
                //early
                if (functionSection.indexOf('.') !== -1) {
                    functionName = functionSection.substring(functionSection.lastIndexOf('.') + 1);
                }
                else {
                    functionName = functionSection;
                }

                if (shouldStrip && this._methodsToStrip.indexOf(functionName) !== -1) {
                    lastToStrip = i;
                    continue;
                }

                //get the file and line number/column, dropping the trailing ')'
                file = line.substring(splitIndex + 1, line.length - 2);
            }

            //find the line number/column in the combined file string
            // Regular expression to get the line number and column from a stack trace line.
            lineSearch = /(:\d+)+/.exec(file);

            //handle browsers not providing proper information (like iOS)
            if (!lineSearch) {
                stack[i] = {
                    'function': '',
                    'file': '',
                    lineLocation: ''
                };
                continue;
            }

            //split the file and line number/column from each other
            file = file.substring(0, lineSearch.index);
            lineLocation = lineSearch[0].substring(1);

            //If we got here, we got out of the Debug functions and should stop trying to
            //strip stuff out, in case someone else's functions are named the same
            shouldStrip = false;

            stack[i] = {
                'function': functionSection || '<anonymous>',
                file: file,
                lineLocation: lineLocation
            };
        }

        if (lastToStrip >= 0) {
            stack = stack.slice(lastToStrip + 1);
        }

        // If we are still in the process of connecting, queue up the log
        if (this._socketQueue) {
            this._socketQueue.push(
                {
                    message: message,
                    level: level.name,
                    stack: stack,
                    time: Date.now()
                });
        }
        else {
            this._socketMessage.level = level.name;
            this._socketMessage.message = message;
            this._socketMessage.stack = stack;
            this._socketMessage.time = Date.now();

            let send;

            try {
                send = JSON.stringify(this._socketMessage);
            }
            catch (e) {
                this._socketMessage.message = ['[circular object]'];
                send = JSON.stringify(this._socketMessage);
            }

            this._socket.send(send);
        }
    }

    /**
     * Strip out known circular references
     * @private
     * @param {Object} obj The object to remove references from
     */
    _removeCircular(obj, maxDepth, depth) {
        if (Array.isArray(obj)) {
            return obj;
        }

        depth = depth || 0;

        if (depth === 0) {
            Debug._circularArray.length = 0;
        }

        Debug._circularArray.push(obj);

        let result = {};

        for (let key in obj) {
            let value = obj[key];

            // avoid doing properties that are known to be DOM objects,
            // because those have circular references
            if (value instanceof Window ||
                value instanceof Document ||
                value instanceof HTMLElement ||
                key === 'document' ||
                key === 'window' ||
                key === 'ownerDocument' ||
                key === 'view' ||
                key === 'target' ||
                key === 'currentTarget' ||
                key === 'originalTarget' ||
                key === 'explicitOriginalTarget' ||
                key === 'rangeParent' ||
                key === 'srcElement' ||
                key === 'relatedTarget' ||
                key === 'fromElement' ||
                key === 'toElement') {
                if (value instanceof HTMLElement) {
                    let elementString;
                    elementString = '<' + value.tagName;

                    if (value.id) {
                        elementString += ' id=\'' + value.id + '\'';
                    }
                    if (value.className) {
                        elementString += ' class=\'' + value.className + '\'';
                    }

                    result[key] = elementString + ' />';
                }
                continue;
            }

            switch (typeof value) {
                case 'object':
                    result[key] = (depth > maxDepth || Debug._circularArray.indexOf(value) > -1) ?
                        String(value) : this._removeCircular(value, maxDepth, depth + 1);
                    break;
                case 'function':
                    result[key] = '[function]';
                    break;
                case 'string':
                case 'number':
                case 'boolean':
                case 'bool':
                    result[key] = value;
                    break;
                default:
                    result[key] = value;
                    break;
            }
        }
        return result;
    }
}