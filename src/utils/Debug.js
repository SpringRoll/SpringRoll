/**
 * @module Core
 */
(function(window, undefined)
{
	// Import classes
	var Enum = include('springroll.Enum');

	/**
	 * A static closure to provide easy access to the console
	 * without having errors if the console doesn't exist
	 * to use call: Debug.log('Your log here')
	 *
	 * @class Debug
	 * @static
	 */
	var Debug = {};

	/**
	 * If we have a console
	 *
	 * @private
	 * @property {bool} _hasConsole
	 */
	var _hasConsole = (window.console !== undefined);

	// Because of the compile constants, we need to
	// cut this word into pieces and do a dynamic access
	var DEBUGKEY = 'DE' + 'BUG';
	
	//detect IE9's issue with apply on console functions
	try
	{
		console.assert.apply(console, [true, "IE9 test"]);
	}
	catch(error)
	{
		var bind = Function.prototype.bind;
		console.log = bind.call(console.log, console);
		if(console.debug)
			console.debug = bind.call(console.debug, console);
		console.warn = bind.call(console.warn, console);
		console.error = bind.call(console.error, console);
		console.dir = bind.call(console.dir, console);
		console.assert = bind.call(console.assert, console);
		console.trace = bind.call(console.trace, console);
		if(console.group)
		{
			console.group = bind.call(console.group, console);
			console.groupCollapsed = bind.call(console.groupCollapsed, console);
			console.groupEnd = bind.call(console.groupEnd, console);
		}
	}

	/**
	 * The levels of logging
	 * @property {springroll.Enum} Levels
	 * @static
	 */
	var Levels = Debug.Levels = new Enum(

		/**
		 * The most basic general log level
		 * @property {int} Levels.GENERAL
		 * @static
		 */
		'GENERAL',

		/**
		 * The debug log level, more priority than GENERAL
		 * @property {int} Levels.DEBUG
		 * @static
		 */
		DEBUGKEY,

		/**
		 * The info log level, more priority than DEBUG
		 * @property {int} Levels.DEBUG
		 * @static
		 */
		'INFO',

		/**
		 * The warn log level, more priority than WARN
		 * @property {int} Levels.WARN
		 * @static
		 */
		'WARN',

		/**
		 * The error log level, the most priority log level
		 * @property {int} Levels.ERROR
		 * @static
		 */
		'ERROR'
	);

	/**
	 * The minimum log level to show, by default it's set to
	 * show all levels of logging.
	 * @public
	 * @static
	 * @property {int} minLogLevel
	 */
	Debug.minLogLevel = Levels.GENERAL;

	/**
	 * Boolean to turn on or off the debugging
	 * @public
	 * @static
	 * @property {bool} enabled
	 */
	Debug.enabled = true;

	/**
	 * The jQuery element to output debug messages to
	 *
	 * @public
	 * @static
	 * @property {DOMElement} output
	 */
	Debug.output = null;

	/**
	 * Browser port for the websocket browsers tend to block ports
	 * @static
	 * @private
	 * @property {int} NET_PORT
	 * @default 1025
	 */
	var NET_PORT = 1025;

	/**
	 * If the WebSocket is connected
	 * @static
	 * @private
	 * @default false
	 * @property {bool} _useSocket
	 */
	var _useSocket = false;

	/**
	 * The socket connection
	 * @static
	 * @private
	 * @property {WebSocket} _socket
	 */
	var _socket = null;

	/**
	 * The current message object being sent to the `WebSocket`
	 * @static
	 * @private
	 * @property {object} _socketMessage
	 */
	var _socketMessage = null;

	/**
	 * The `WebSocket` message queue
	 * @static
	 * @private
	 * @property {Array} _socketQueue
	 */
	var _socketQueue = null;

	/**
	 * Connect to the `WebSocket`
	 * @public
	 * @static
	 * @method connect
	 * @param {string} host The remote address to connect to, IP address or host name
	 * @return {boolean} If a connection was attempted
	 */
	Debug.connect = function(host)
	{
		//Make sure WebSocket exists without prefixes for us
		if (!('WebSocket' in window) && !('MozWebSocket' in window)) return false;

		window.WebSocket = WebSocket || MozWebSocket;

		try
		{
			_socket = new WebSocket('ws://' + host + ':' + NET_PORT);
			_socket.onopen = onConnect;
			_socket.onclose = onClose;
			_socket.onerror = onClose;
			_socketQueue = [];
			_useSocket = true;
		}
		catch(error)
		{
			return false;
		}
		return true;
	};

	/**
	 * Disconnect from the `WebSocket`
	 * @public
	 * @static
	 * @method disconnect
	 */
	Debug.disconnect = function()
	{
		if (_useSocket)
		{
			_socket.close();
			onClose();
		}
	};

	/**
	 * Callback when the `WebSocket` is connected
	 * @private
	 * @static
	 * @method onConnect
	 */
	var onConnect = function()
	{
		//set up a function to handle all messages
		window.onerror = globalErrorHandler;

		//create and send a new session message
		_socketMessage = {
			level: 'session',
			message: ''
		};
		_socket.send(JSON.stringify(_socketMessage));

		//send any queued logs
		for (var i = 0, len = _socketQueue.length; i < len; ++i)
		{
			_socket.send(JSON.stringify(_socketQueue[i]));
		}

		//get rid of this, since we are connected
		_socketQueue = null;
	};

	/**
	 * Global window error handler, used for remote connections.
	 * @static
	 * @private
	 * @method globalErrorHandler
	 * @param {String} message The error message
	 * @param {String} file The url of the file
	 * @param {int} line The line within the file
	 * @param {int} column The column within the line
	 * @param {Error} error The error itself
	 */
	var globalErrorHandler = function(message, file, line, column, error)
	{
		var logMessage = 'Error: ' + message + ' in ' + file + ' at line ' + line;
		
		if (column !== undefined)
		{
			logMessage += ':' + column;
		}

		if (error)
		{
			logMessage += "\n" + error.stack;
		}

		Debug.remoteLog(logMessage, Levels.ERROR);

		return false;
	};

	/**
	 * Callback for when the websocket is closed
	 * @private
	 * @static
	 * @method onClose
	 */
	var onClose = function()
	{
		window.onerror = null;
		_useSocket = false;
		_socket.onopen = null;
		_socket.onmessage = null;
		_socket.onclose = null;
		_socket.onerror = null;
		_socket = null;
		_socketMessage = null;
		_socketQueue = null;
	};

	/**
	 * Sent to the output
	 * @private
	 * @static
	 * @method domOutput
	 * @param {string} level The log level
	 * @param {string} args Additional arguments
	 */
	var domOutput = function(level, args)
	{
		if (Debug.output)
		{
			Debug.output.innerHTML += '<div class="' + level + '">' + args + '</div>';
		}
	};

	/**
	 * Send a remote log message using the socket connection
	 * @public
	 * @static
	 * @method remoteLog
	 * @param {string} message The message to send
	 * @param {level} [level=0] The log level to send
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.remoteLog = function(message, level)
	{
		level = level || Levels.GENERAL;
		
		// If we are still in the process of connecting, queue up the log
		if (_socketQueue)
		{
			_socketQueue.push({
				message: message,
				level: level
			});
		}
		else // send the log immediately
		{
			_socketMessage.level = level;
			_socketMessage.message = message;
			_socket.send(JSON.stringify(_socketMessage));
		}
		return Debug;
	};

	/**
	 * Log something in the console or remote
	 * @static
	 * @public
	 * @method log
	 * @param {*} params The statement or object to log
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.log = function(params)
	{
		if (!Debug.enabled) return Debug;

		if (_useSocket)
		{
			Debug.remoteLog(params);
		}
		else if (Debug.minLogLevel == Levels.GENERAL && _hasConsole)
		{
			if(arguments.length === 1)
				console.log(params);
			else
				console.log.apply(console, arguments);
			domOutput('general', params);
		}
		return Debug;
	};

	/**
	 * Debug something in the console or remote
	 * @static
	 * @public
	 * @method debug
	 * @param {*} params The statement or object to debug
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.debug = function(params)
	{
		if (!Debug.enabled) return Debug;

		if (_useSocket)
		{
			Debug.remoteLog(params, Levels[DEBUGKEY]);
		}
		else if (Debug.minLogLevel.asInt <= Levels[DEBUGKEY].asInt && _hasConsole)
		{
			// debug() is officially deprecated
			if (console.debug)
			{
				if(arguments.length === 1)
					console.debug(params);
				else
					console.debug.apply(console, arguments);
			}
			else
			{
				if(arguments.length === 1)
					console.log(params);
				else
					console.log.apply(console, arguments);
			}
			domOutput('debug', params);
		}
		return Debug;
	};

	/**
	 * Info something in the console or remote
	 * @static
	 * @public
	 * @method info
	 * @param {*} params The statement or object to info
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.info = function(params)
	{
		if (!Debug.enabled) return Debug;

		if (_useSocket)
		{
			Debug.remoteLog(params, Levels.INFO);
		}
		else if (Debug.minLogLevel.asInt <= Levels.INFO.asInt && _hasConsole)
		{
			if(arguments.length === 1)
				console.info(params);
			else
				console.info.apply(console, arguments);
			domOutput('info', params);
		}
		return Debug;
	};

	/**
	 * Warn something in the console or remote
	 * @static
	 * @public
	 * @method warn
	 * @param {*} params The statement or object to warn
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.warn = function(params)
	{
		if (!Debug.enabled) return Debug;

		if (_useSocket)
		{
			Debug.remoteLog(params, Levels.WARN);
		}
		else if (Debug.minLogLevel.asInt <= Levels.WARN.asInt && _hasConsole)
		{
			if(arguments.length === 1)
				console.warn(params);
			else
				console.warn.apply(console, arguments);
			domOutput('warn', params);
		}
		return Debug;
	};

	/**
	 * Error something in the console or remote
	 * @static
	 * @public
	 * @method error
	 * @param {*} params The statement or object to error
	 */
	Debug.error = function(params)
	{
		if (!Debug.enabled) return;

		if (_useSocket)
		{
			Debug.remoteLog(params, Levels.ERROR);
		}
		else if (_hasConsole)
		{
			if(arguments.length === 1)
				console.error(params);
			else
				console.error.apply(console, arguments);
			domOutput('error', params);
		}
		return Debug;
	};

	/**
	 * Assert that something is true
	 * @static
	 * @public
	 * @method assert
	 * @param {bool} truth As statement that is assumed true
	 * @param {*} params The message to error if the assert is false
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.assert = function(truth, params)
	{
		if (_hasConsole && Debug.enabled && console.assert)
		{
			console.assert(truth, params);

			if (!truth)
			{
				domOutput('error', params);
			}
		}
		return Debug;
	};

	/**
	 * Method to describe an object in the console
	 * @static
	 * @method dir
	 * @public
	 * @param {object} params The object to describe in the console
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.dir = function(params)
	{
		if (_hasConsole && Debug.enabled)
		{
			if(arguments.length === 1)
				console.dir(params);
			else
				console.dir.apply(console, arguments);
		}
		return Debug;
	};

	/**
	 * Method to clear the console
	 * @static
	 * @public
	 * @method clear
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.clear = function()
	{
		if (_hasConsole && Debug.enabled)
		{
			console.clear();

			if (Debug.output)
			{
				Debug.output.innerHTML = "";
			}
		}
		return Debug;
	};

	/**
	 * Generate a stack track in the output
	 * @static
	 * @public
	 * @method trace
	 * @param {*} params Optional parameters to log
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.trace = function(params)
	{
		if (_hasConsole && Debug.enabled)
		{
			if(arguments.length === 1)
				console.trace(params);
			else
				console.trace.apply(console, arguments);
		}
		return Debug;
	};

	/**
	 * Starts a new logging group with an optional title. All console output that
	 * occurs after calling this method and calling `Debug.groupEnd()` appears in
	 * the same visual group.
	 * @static
	 * @public
	 * @method group
	 * @param {*} params Optional parameters to log
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.group = function(params)
	{
		if (_hasConsole && Debug.enabled && console.group)
		{
			console.group.apply(console, arguments);
		}
		return Debug;
	};

	/**
	 * Creates a new logging group that is initially collapsed instead of open,
	 * as with `Debug.group()`.
	 * @static
	 * @public
	 * @method groupCollapsed
	 * @param {*} params Optional parameters to log
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.groupCollapsed = function(params)
	{
		if (_hasConsole && Debug.enabled && console.groupCollapsed)
		{
			console.groupCollapsed.apply(console, arguments);
		}
		return Debug;
	};

	/**
	 * Starts a new logging group with an optional title. All console output that
	 * occurs after calling this method and calling console.groupEnd() appears in
	 * the same visual group.
	 * @static
	 * @public
	 * @method groupEnd
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.groupEnd = function()
	{
		if (_hasConsole && Debug.enabled && console.groupEnd)
		{
			console.groupEnd();
		}
		return Debug;
	};

	/**
	 * List of hex colors to create Debug shortcuts for.
	 * Each key will become a function Debug[key]() that outputs
	 * the message in the specified color to the console if
	 * the browsers allows colored logging.
	 * Color Palette pulled from "Better CSS Defaults"
	 * (https://github.com/mrmrs/colors)
	 *
	 * @private
	 * @param {Object} _palette
	 */
	var _palette = {

		/**
		 * Output a general log colored as navy
		 * @method navy
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		navy: '#001F3F',

		/**
		 * Output a general log colored as blue
		 * @method blue
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		blue: '#0074D9',

		/**
		 * Output a general log colored as aqua
		 * @method aqua
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		aqua: '#7FDBFF',

		/**
		 * Output a general log colored as teal
		 * @method teal
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		teal: '#39CCCC',

		/**
		 * Output a general log colored as olive
		 * @method olive
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		olive: '#3D9970',

		/**
		 * Output a general log colored as green
		 * @method green
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		green: '#2ECC40',

		/**
		 * Output a general log colored as lime
		 * @method lime
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		lime: '#01FF70',

		/**
		 * Output a general log colored as yellow
		 * @method yellow
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		yellow: '#FFDC00',

		/**
		 * Output a general log colored as orange
		 * @method orange
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		orange: '#FF851B',

		/**
		 * Output a general log colored as red
		 * @method red
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		red: '#FF4136',

		/**
		 * Output a general log colored as pink
		 * @method pink
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		pink: '#F012BE',

		/**
		 * Output a general log colored as purple
		 * @method purple
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		purple: '#B10DC9',

		/**
		 * Output a general log colored as maroon
		 * @method maroon
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		maroon: '#85144B',

		/**
		 * Output a general log colored as silver
		 * @method silver
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		silver: '#ddd',

		/**
		 * Output a general log colored as gray
		 * @method gray
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		gray: '#aaa'
	};

	/**
	 * Loop through each item in the _palette object and create
	 * a static function in Debug via the key (the color name) that
	 * outputs a message to the console in key's value (a hex color).
	 */
	for (var key in _palette)
	{
		Debug[key] = _lintingWorkAroundClosure(_palette[key]);
	}

	/**
	 * Linting will not allow for functions to be inside a loop.
	 * Returning the function in closure placed outside the for-loop
	 * that generates the Debug[<color>] functions will bypass
	 * this linting restriction.
	 *
	 * @method _lintingWorkAroundClosure
	 * @private
	 * @param {String} hex Hex value to apply to CSS color
	 * @return {Function}
	 */
	function _lintingWorkAroundClosure(hex)
	{
		return function(message)
		{
			if(arguments.length > 1)
			{
				var params = Array.prototype.slice.call(arguments);
				var first = '%c' + params[0];
				params[0] = 'color:' + hex;
				params.unshift(first);
				return Debug.log.apply(Debug, params);
			}
			return Debug.log('%c' + message, 'color:' + hex);
		};
	}

	// Make the debug class globally accessible.
	// If the console doesn't exist, use the dummy to prevent errors.
	window.Debug = Debug;

}(window));