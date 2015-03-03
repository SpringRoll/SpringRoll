/**
 * @module Core
 */
(function(window, undefined)
{
	// Import classes
	var Enum = include('springroll.Enum'),
		slice = Array.prototype.slice;

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
	 * @property {Boolean} _hasConsole
	 */
	var _hasConsole = (window.console !== undefined);
	
	/**
	 * If the console supports coloring
	 *
	 * @private
	 * @property {Boolean} _consoleSupportsColors
	 */
	//document.documentMode is an IE only property specifying what version of IE the document is
	//being displayed for
	var _consoleSupportsColors = document.documentMode === undefined;

	// Because of the compile constants, we need to
	// cut this word into pieces and do a dynamic access
	var DEBUGKEY = 'DE' + 'BUG';
	
	if (_hasConsole)
	{
		try
		{
			// detect IE9's issue with apply on console functions
			console.assert.apply(console, [true, "IE9 test"]);
		}
		catch(error)
		{
			// Reference to the bind method
			var bind = Function.prototype.bind;

			// Bind all these methods in order to use apply
			// this is ONLY needed for IE9
			var methods = [
				'log',
				'debug',
				'warn',
				'error',
				'assert',
				'dir',
				'trace',
				'group',
				'groupCollapsed',
				'groupEnd'
			];

			// Loop through console methods
			for (var method, i = 0; i < methods.length; i++)
			{
				method = methods[i];
				if (console[method])
				{
					console[method] = bind.call(console[method], console);
				}
			}
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
	 * @property {Boolean} enabled
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
	 * @default 1026
	 */
	var NET_PORT = 1026;

	/**
	 * If the WebSocket is connected
	 * @static
	 * @private
	 * @default false
	 * @property {Boolean} _useSocket
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
	 * @property {Object} _socketMessage
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
	 * @param {String} host The remote address to connect to, IP address or host name
	 * @return {Boolean} If a connection was attempted
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

		Debug._remoteLog(logMessage, Levels.ERROR);

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
	 * @param {String} level The log level
	 * @param {String} args Additional arguments
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
	 * @private
	 * @static
	 * @method _remoteLog
	 * @param {Array} message The message to send
	 * @param {level} [level=0] The log level to send
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug._remoteLog = function(message, level)
	{
		level = level || Levels.GENERAL;
		if(!Array.isArray(message))
			message = [message];
		message = slice.call(message);

		// Go through each argument and replace any circular
		// references with simplified objects
		for (var i = 0; i < message.length; i++)
		{
			if (typeof message[i] == "object")
			{
				try
				{
					message[i] = removeCircular(message[i], 2);
				}
				catch(e)
				{
					message[i] = String(message[i]);
				}
				/*console.log(message[i]);*/
			}
		}

		// If we are still in the process of connecting, queue up the log
		if (_socketQueue)
		{
			_socketQueue.push({
				message: message,
				level: level.name
			});
		}
		else // send the log immediately
		{
			_socketMessage.level = level.name;
			_socketMessage.message = message;
			var send;
			try
			{
				send = JSON.stringify(_socketMessage);
			}
			catch(e)
			{
				_socketMessage.message = ["[circular object]"];
				send = JSON.stringify(_socketMessage);
			}
			_socket.send(send);
		}
		return Debug;
	};

	/**
	 * Strip out known circular references
	 * @method removeCircular
	 * @private
	 * @param {Object} obj The object to remove references from
	 */
	var removeCircular = function(obj, maxDepth, depth)
	{
		if (Array.isArray(obj)) return obj;

		depth = depth || 0;

		var result = {};
		for (var key in obj)
		{
			// avoid doing properties that are known to be DOM objects,
			// because those have circular references
			if (obj[key] instanceof Window ||
				obj[key] instanceof Document ||
				obj[key] instanceof HTMLElement ||
				key == "document" ||
				key == "window" ||
				key == "ownerDocument" ||
				key == "view" ||
				key == "target" ||
				key == "currentTarget" ||
				key == "originalTarget" ||
				key == "explicitOriginalTarget" ||
				key == "rangeParent" ||
				key == "srcElement" ||
				key == "relatedTarget" ||
				key == "fromElement" ||
				key == "toElement")
			{
				if(obj[key] instanceof HTMLElement)
				{
					var element = obj[key], value;
					value = "<" + element.tagName;
					if(element.id)
						value += " id='" + element.id + "'";
					if(element.className)
						value += " class='" + element.className + "'";
					result[key] = value + " />";
				}
				continue;
			}

			switch(typeof obj[key])
			{
				case "object":
				{
					result[key] = depth > maxDepth ?
						String(obj[key]) :
						removeCircular(obj[key], maxDepth, depth + 1);
					break;
				}
				case "function":
				{
					result[key] = "[function]";
					break;
				}
				case "string":
				case "number":
				case "boolean":
				case "bool":
				{
					result[key] = obj[key];
					break;
				}
				default:
				{
					result[key] = obj[key];
					break;
				}
			}
		}
		return result;
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
			Debug._remoteLog(arguments);
		}
		else if (Debug.minLogLevel == Levels.GENERAL)
		{
			if(_hasConsole)
			{
				if(arguments.length === 1)
					console.log(params);
				else
					console.log.apply(console, arguments);
			}
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
			Debug._remoteLog(arguments, Levels[DEBUGKEY]);
		}
		else if (Debug.minLogLevel.asInt <= Levels[DEBUGKEY].asInt)
		{
			// debug() is officially deprecated
			if(_hasConsole)
			{
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
			Debug._remoteLog(arguments, Levels.INFO);
		}
		else if (Debug.minLogLevel.asInt <= Levels.INFO.asInt)
		{
			if(_hasConsole)
			{
				if(arguments.length === 1)
					console.info(params);
				else
					console.info.apply(console, arguments);
			}
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
			Debug._remoteLog(arguments, Levels.WARN);
		}
		else if (Debug.minLogLevel.asInt <= Levels.WARN.asInt)
		{
			if(_hasConsole)
			{
				if(arguments.length === 1)
					console.warn(params);
				else
					console.warn.apply(console, arguments);
			}
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
			Debug._remoteLog(arguments, Levels.ERROR);
		}
		else
		{
			if(_hasConsole)
			{
				if(arguments.length === 1)
					console.error(params);
				else
					console.error.apply(console, arguments);
			}
			domOutput('error', params);
		}
		return Debug;
	};

	/**
	 * Assert that something is true
	 * @static
	 * @public
	 * @method assert
	 * @param {Boolean} truth As statement that is assumed true
	 * @param {*} params The message to error if the assert is false
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.assert = function(truth, params)
	{
		if (Debug.enabled)
		{
			if (!truth)
			{
				domOutput('error', params);
				if (_useSocket)
				{
					Debug._remoteLog(params, Levels.ERROR);
				}
			}
			
			if(_hasConsole && console.assert)
				console.assert(truth, params);
		}
		return Debug;
	};

	/**
	 * Method to describe an object in the console
	 * @static
	 * @method dir
	 * @public
	 * @param {Object} params The object to describe in the console
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug.dir = function(params)
	{
		if(Debug.enabled)
		{
			if (_hasConsole)
			{
				if(arguments.length === 1)
					console.dir(params);
				else
					console.dir.apply(console, arguments);
			}
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
		if (Debug.enabled)
		{
			if(_hasConsole)
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
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		navy: '#001F3F',

		/**
		 * Output a general log colored as blue
		 * @method blue
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		blue: '#0074D9',

		/**
		 * Output a general log colored as aqua
		 * @method aqua
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		aqua: '#7FDBFF',

		/**
		 * Output a general log colored as teal
		 * @method teal
		 * @static
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
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		green: '#2ECC40',

		/**
		 * Output a general log colored as lime
		 * @method lime
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		lime: '#01FF70',

		/**
		 * Output a general log colored as yellow
		 * @method yellow
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		yellow: '#FFDC00',

		/**
		 * Output a general log colored as orange
		 * @method orange
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		orange: '#FF851B',

		/**
		 * Output a general log colored as red
		 * @method red
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		red: '#FF4136',

		/**
		 * Output a general log colored as pink
		 * @method pink
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		pink: '#F012BE',

		/**
		 * Output a general log colored as purple
		 * @method purple
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		purple: '#B10DC9',

		/**
		 * Output a general log colored as maroon
		 * @method maroon
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		maroon: '#85144B',

		/**
		 * Output a general log colored as silver
		 * @method silver
		 * @static
		 * @param {*} message The message to log
		 * @return {Debug} The instance of debug for chaining
		 */
		silver: '#ddd',

		/**
		 * Output a general log colored as gray
		 * @method gray
		 * @static
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
		if(_consoleSupportsColors)
			Debug[key] = _colorClosure(_palette[key]);
		else
			Debug[key] = Debug.log;
	}

	/**
	 * Due to the way closures and variables work, _colorClosure returns
	 * the color logging function needed for the color that you pass it.
	 *
	 * @method _colorClosure
	 * @private
	 * @param {String} hex Hex value to apply to CSS color
	 * @return {Function}
	 */
	function _colorClosure(hex)
	{
		var colorString = 'color:' + hex;
		return function(message)
		{
			if(arguments.length > 1)
			{
				var params = slice.call(arguments);
				if(typeof params[0] == "object")
				{
					params.unshift(colorString);
					params.unshift('%c%o');
				}
				else
				{
					var first = '%c' + params[0];
					params[0] = colorString;
					params.unshift(first);
				}
				return Debug.log.apply(Debug, params);
			}
			if(typeof arguments[0] == "object")
				return Debug.log('%c%o', colorString, message);
			return Debug.log('%c' + message, colorString);
		};
	}

	// Make the debug class globally accessible.
	// If the console doesn't exist, use the dummy to prevent errors.
	window.Debug = Debug;

}(window));