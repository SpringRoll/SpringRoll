/*! SpringRoll 1.0.3 */
/**
 * @module Debug
 * @namespace springroll
 */
(function()
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
	var trueKEY = 'DE' + 'BUG';

	if (_hasConsole)
	{
		try
		{
			// detect IE9's issue with apply on console functions
			console.assert.apply(console, [true, "IE9 test"]);
		}
		catch (error)
		{
			// Reference to the bind method
			var bind = Function.prototype.bind;

			// Bind all these methods in order to use apply
			// this is ONLY needed for IE9
			var methods = [
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
		 * @property {int} Levels.true
		 * @static
		 */
		trueKEY,

		/**
		 * The info log level, more priority than true
		 * @property {int} Levels.true
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
	 * The DOM element to output debug messages to
	 *
	 * @public
	 * @static
	 * @property {DOMElement} output
	 */
	Debug.output = null;

	/**
	 * Browser port for the websocket - browsers tend to block lower ports
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


	/*
	 * Prevents uglify from mangling function names attached to it so we can strip
	 * out of a stack trace for logging purpose.
	 */
	var manglePeventer = {};

	/**
	 * Methods names to use to strip out lines from stack traces
	 * in remote logging.
	 * @static
	 * @private
	 * @property {Array} methodsToStrip
	 */
	var methodsToStrip = [
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
		'globalErrorHandler',
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

	/**
	 * Regular expression to get the line number and column from a stack trace line.
	 * @static
	 * @private
	 * @property {RegEx} lineLocationFinder
	 */
	var lineLocationFinder = /(:\d+)+/;

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
		catch (error)
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
		window.onerror = manglePeventer.globalErrorHandler;

		//create and send a new session message
		_socketMessage = {
			level: 'session',
			message: '',
			stack: null,
			time: 0
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
	manglePeventer.globalErrorHandler = function(message, file, line, column, error)
	{
		Debug._remoteLog(message, Levels.ERROR, error ? error.stack : null);
		//let the error do the normal behavior
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
	 * @param {String} [stack] A stack to use for the message. A stack will be created if stack
	 *                       is omitted.
	 * @return {Debug} The instance of debug for chaining
	 */
	Debug._remoteLog = function(message, level, stack)
	{
		level = level || Levels.GENERAL;
		if (!Array.isArray(message))
			message = [message];
		message = slice.call(message);

		var i, length;
		// Go through each argument and replace any circular
		// references with simplified objects
		for (i = 0, length = message.length; i < length; i++)
		{
			if (typeof message[i] == "object")
			{
				try
				{
					message[i] = removeCircular(message[i], 3);
				}
				catch (e)
				{
					message[i] = String(message[i]);
				}
				/*console.log(message[i]);*/
			}
		}

		//figure out the stack
		if (!stack)
			stack = new Error().stack;
		//split stack lines
		stack = stack ? stack.split("\n") : [];
		//go through lines, figuring out what to strip out
		//and standardizing the format for the rest
		var splitIndex, functionSection, file, lineLocation, functionName, lineSearch,
			lastToStrip = -1,
			shouldStrip = true;
		for (i = 0, length = stack.length; i < length; ++i)
		{
			var line = stack[i].trim();
			//FF has an empty string at the end
			if (!line)
			{
				if (i == length - 1)
				{
					stack.pop();
					break;
				}
				else
					continue;
			}
			//strip out any actual errors in the stack trace, since that is the message
			//also the 'error' line from our new Error().
			if (line == "Error" || line.indexOf("Error:") > -1)
			{
				lastToStrip = i;
				continue;
			}
			// FF/Safari style:
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
			if (line.indexOf("@") > -1)
			{
				splitIndex = line.indexOf("@");
				functionSection = line.substring(0, splitIndex);
				//if we should strip this line out of the stack, we should stop parsing the stack
				//early
				if (functionSection.indexOf(".") != -1)
					functionName = functionSection.substring(functionSection.lastIndexOf(".") + 1);
				else
					functionName = functionSection;
				if (shouldStrip && methodsToStrip.indexOf(functionName) != -1)
				{
					lastToStrip = i;
					continue;
				}
				//get the file and line number/column
				file = line.substring(splitIndex + 1);
			}
			// Chrome/IE/Opera style:
			//https://msdn.microsoft.com/en-us/library/windows/apps/hh699850.aspx
			else
			{
				splitIndex = line.indexOf("(");
				//skip the "at " at the beginning of the line and the space at the end
				functionSection = line.substring(3, splitIndex - 1);
				//if we should strip this line out of the stack, we should stop parsing the stack
				//early
				if (functionSection.indexOf(".") != -1)
					functionName = functionSection.substring(functionSection.lastIndexOf(".") + 1);
				else
					functionName = functionSection;
				if (shouldStrip && methodsToStrip.indexOf(functionName) != -1)
				{
					lastToStrip = i;
					continue;
				}
				//get the file and line number/column, dropping the trailing ')'
				file = line.substring(splitIndex + 1, line.length - 2);
			}
			//find the line number/column in the combined file string
			lineSearch = lineLocationFinder.exec(file);
			//handle browsers not providing proper information (like iOS)
			if (!lineSearch)
			{
				stack[i] = {
					"function": "",
					"file": "",
					lineLocation: ""
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
				"function": functionSection || "<anonymous>",
				file: file,
				lineLocation: lineLocation
			};
		}
		if (lastToStrip >= 0)
		{
			stack = stack.slice(lastToStrip + 1);
		}

		// If we are still in the process of connecting, queue up the log
		if (_socketQueue)
		{
			_socketQueue.push(
			{
				message: message,
				level: level.name,
				stack: stack,
				time: Date.now()
			});
		}
		else // send the log immediately
		{
			_socketMessage.level = level.name;
			_socketMessage.message = message;
			_socketMessage.stack = stack;
			_socketMessage.time = Date.now();
			var send;
			try
			{
				send = JSON.stringify(_socketMessage);
			}
			catch (e)
			{
				_socketMessage.message = ["[circular object]"];
				send = JSON.stringify(_socketMessage);
			}
			_socket.send(send);
		}
		return Debug;
	};

	/**
	 * An array for preventing circular references
	 * @static
	 * @private
	 * @property {Array} circularArray
	 */
	var circularArray = [];

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
		if (depth === 0)
			circularArray.length = 0;

		circularArray.push(obj);

		var result = {};
		for (var key in obj)
		{
			var value = obj[key];
			// avoid doing properties that are known to be DOM objects,
			// because those have circular references
			if (value instanceof Window ||
				value instanceof Document ||
				value instanceof HTMLElement ||
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
				if (value instanceof HTMLElement)
				{
					var elementString;
					elementString = "<" + value.tagName;
					if (value.id)
						elementString += " id='" + value.id + "'";
					if (value.className)
						elementString += " class='" + value.className + "'";
					result[key] = elementString + " />";
				}
				continue;
			}

			switch (typeof value)
			{
				case "object":
					{
						result[key] = (depth > maxDepth || circularArray.indexOf(value) > -1) ?
						String(value) : removeCircular(value, maxDepth, depth + 1);
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
						result[key] = value;
						break;
					}
				default:
					{
						result[key] = value;
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
			Debug._remoteLog(Array.prototype.slice.call(arguments));
		}
		else if (Debug.minLogLevel == Levels.GENERAL)
		{
			if (_hasConsole)
			{
				if (arguments.length === 1)
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
			Debug._remoteLog(Array.prototype.slice.call(arguments), Levels[trueKEY]);
		}
		else if (Debug.minLogLevel.asInt <= Levels[trueKEY].asInt)
		{
			// debug() is officially deprecated
			if (_hasConsole)
			{
				if (console.debug)
				{
					if (arguments.length === 1)
						console.debug(params);
					else
						console.debug.apply(console, arguments);
				}
				else
				{
					if (arguments.length === 1)
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
			Debug._remoteLog(Array.prototype.slice.call(arguments), Levels.INFO);
		}
		else if (Debug.minLogLevel.asInt <= Levels.INFO.asInt)
		{
			if (_hasConsole)
			{
				if (arguments.length === 1)
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
			Debug._remoteLog(Array.prototype.slice.call(arguments), Levels.WARN);
		}
		else if (Debug.minLogLevel.asInt <= Levels.WARN.asInt)
		{
			if (_hasConsole)
			{
				if (arguments.length === 1)
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
			Debug._remoteLog(Array.prototype.slice.call(arguments), Levels.ERROR);
		}
		else
		{
			if (_hasConsole)
			{
				if (arguments.length === 1)
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

			if (_hasConsole && console.assert)
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
		if (Debug.enabled)
		{
			if (_useSocket)
			{
				Debug._remoteLog(Array.prototype.slice.call(arguments), Levels.GENERAL);
			}
			else if (_hasConsole)
			{
				if (arguments.length === 1)
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
			if (_useSocket)
			{
				Debug._remoteLog("", "clear");
			}

			if (_hasConsole)
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
		if (Debug.enabled)
		{
			if (_useSocket)
			{
				Debug._remoteLog(Array.prototype.slice.call(arguments), Levels.GENERAL);
			}
			else if (_hasConsole)
			{
				if (arguments.length === 1)
					console.trace(params);
				else
					console.trace.apply(console, arguments);
			}
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
		if (Debug.enabled)
		{
			if (_useSocket)
			{
				Debug._remoteLog(Array.prototype.slice.call(arguments), "group");
			}
			else if (_hasConsole && console.group)
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
		if (Debug.enabled)
		{
			if (_useSocket)
			{
				Debug._remoteLog(Array.prototype.slice.call(arguments), "groupCollapsed");
			}
			else if (_hasConsole && console.groupCollapsed)
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
		if (Debug.enabled)
		{
			if (_useSocket)
			{
				Debug._remoteLog(Array.prototype.slice.call(arguments), "groupEnd");
			}
			else if (_hasConsole && console.groupEnd)
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
	 * @property {Object} _palette
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

	// Loop through each item in the _palette object and create
	// a static function in Debug via the key (the color name) that
	// outputs a message to the console in key's value (a hex color).
	for (var key in _palette)
	{
		if (_consoleSupportsColors)
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
			if (arguments.length > 1)
			{
				var params = slice.call(arguments);
				if (typeof params[0] == "object")
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
			if (typeof arguments[0] == "object")
				return Debug.log('%c%o', colorString, message);
			return Debug.log('%c' + message, colorString);
		};
	}
	//Assign to namespace
	namespace('springroll').Debug = Debug;

}());
/**
 * @module Debug
 * @namespace springroll
 */
(function()
{
	/**
	 * Class for display a list of query string options
	 * nicely in the console.
	 * @class DebugOptions
	 */
	var DebugOptions = {};

	/**
	 * The space between columns
	 * @property {int} COLUMN_BUFFER
	 * @private
	 * @readOnly
	 * @final
	 */
	var COLUMN_BUFFER = 4;

	/**
	 * The collections of options
	 * @property {array} _options
	 * @private
	 */
	var _options = [];

	/**
	 * The maximum length of the label column
	 * @property {array} _maxLabel
	 * @private
	 */
	var _maxLabel = 0;

	/**
	 * The maximum length of the type column
	 * @property {array} _maxType
	 * @private
	 */
	var _maxType = 0;

	/**
	 * Config object for the CSS styles throughout
	 * @property {Object} CSS
	 * @private
	 * @readOnly
	 * @final
	 */
	var CSS = {
		HEADER: 'color: #FF4136; font-size: 1.2em; text-decoration:underline;', //orange-red color
		LABEL: 'color: #2ECC40;', //green
		TYPE: 'color: #0074D9;', //blue
		DESC: 'color: #FF851B' //orange
	};

	/**
	 * The header for the final log
	 * @property {String} HEADER
	 * @private
	 * @readOnly
	 * @final
	 */
	var HEADER = '\n%cQuery Debug Options:\n%c';

	/**
	 * The map of different basic types of options.
	 * @property {String} TYPES
	 * @private
	 * @readOnly
	 * @final
	 */
	var TYPES = {
		INT: 'int',
		NUMBER: 'number',
		STRING: 'string',
		BOOLEAN: 'boolean'
	};

	/**
	 * Define a int query parameter.
	 * @method int
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.int = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.INT, desc);
	};

	/**
	 * Define a boolean query parameter
	 * @method boolean
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.boolean = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.BOOLEAN, desc);
	};

	/**
	 * Define a string query parameter
	 * @method string
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.string = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.STRING, desc);
	};

	/**
	 * Define a number query parameter
	 * @method number
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.number = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.NUMBER, desc);
	};

	/**
	 * Define a number query parameter
	 * @method add
	 * @param {string} label The label for the options
	 * @param {string} type The type of value the option accepts
	 * @param {string} [desc] Description of values the option can accept
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.add = function(label, type, desc)
	{
		_maxLabel = Math.max(label.length, _maxLabel);
		_maxType = Math.max(type.length, _maxType);
		_options.push(
		{
			label: label,
			type: type,
			desc: desc
		});
		return DebugOptions;
	};

	/**
	 * Build the log and final argument array for the
	 * options output console.log();
	 * @method log
	 * @static
	 */
	DebugOptions.log = function()
	{
		// The concatinated output string
		var output = HEADER;

		// The CSS options to pass to console.log
		var css = [
			// The style for the header's text
			CSS.HEADER,
			// A 'reset' CSS that prevents the color/size of the header
			// from leaking into the first option logged
			'display:none'
		];

		// add the buffer to the max label
		// and type lengths
		_maxLabel += COLUMN_BUFFER;
		_maxType += COLUMN_BUFFER;
		var newLineSpacer = spacer(_maxLabel + _maxType + COLUMN_BUFFER);

		var option;
		var len = _options.length;

		for (var i = 0; i < len; i++)
		{
			option = _options[i];
			// tab label
			output += '\t%c' + spacer(_maxLabel, option.label);
			// tab type
			output += '%c' + spacer(_maxType, option.type);
			// null-string if no desc
			if (option.desc)
			{
				option.desc = option.desc.replace(
					/(\r\n|\n|\r)/gm,
					'\n' + newLineSpacer);
				output += ('%c' + option.desc);
			}
			// new line
			output += '\n';

			css.push(CSS.LABEL, CSS.TYPE);

			// only push the CSS for the description
			// if the description exists
			if (option.desc)
			{
				css.push(CSS.DESC);
			}
		}

		// Send the console an argument list,
		// the first item is the entire formatted string of
		// options, with the 2nd onward args being all the CSS
		// in corresponding order with the %c formatting symbols
		// in the formatted string.
		console.log.apply(console, [output + '\n'].concat(css));
	};

	/**
	 * Forget all the options that have been remembered
	 * @method reset
	 * @static
	 * @return {springroll.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.reset = function()
	{
		_options.length = [];
		_maxLabel = 0;
		_maxType = 0;

		return DebugOptions;
	};

	/**
	 * Generate a spacer slug. Returned object is concatenated
	 * space character, i.e. ' ', to the specified count.
	 * @method spacer
	 * @private
	 * @param {int} count How many characters the spacer needs
	 * @param {string} str The input string to add spaces to
	 * @return {string}
	 */
	var spacer = function(count, str)
	{
		if (str)
		{
			while (str.length < count)
			{
				str += ' '; //space
			}
		}
		else
		{
			str = ' '; //initial space is necessary?
			while (--count)
			{
				str += ' '; //space
			}
		}
		return str;
	};

	//Assign to namespace
	namespace('springroll').DebugOptions = DebugOptions;
}());
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Debug = include('springroll.Debug');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Enable the Debug class. After initialization, this
		 * is a pass-through to Debug.enabled.
		 * @property {Boolean} options.debug
		 * @default true
		 */
		this.options.add('debug', true);

		/**
		 * Minimum log level from 0 to 4
		 * @property {int} options.minLogLevel
		 * @default 0
		 */
		this.options.add('minLogLevel', 0);

		/**
		 * The framerate container
		 * @property {String|DOMElement} options.framerate
		 */
		this.options.add('framerate');

		/**
		 * The framerate container
		 * @property {DOMElement} _framerate
		 * @private
		 */
		this._framerate = null;

		/**
		 * The host computer for remote debugging, the debug
		 * module must be included to use this feature. Can be an
		 * IP address or host name. After initialization, setting
		 * this will still connect or disconect Debug for remote
		 * debugging. This is a write-only property.
		 * @property {String} options.debugRemote
		 */
		this.options.add('debugRemote', null)
			.respond('debug', function()
			{
				return Debug.enabled;
			})
			.on('debug', function(value)
			{
				Debug.enabled = value;
			})
			.on('debugRemote', function(value)
			{
				Debug.disconnect();
				if (value)
				{
					Debug.connect(value);
				}
			})
			.respond('minLogLevel', function()
			{
				return Debug.minLogLevel.asInt;
			})
			.on('minLogLevel', function(value)
			{
				Debug.minLogLevel = Debug.Levels.valueFromInt(
					parseInt(value, 10)
				);

				if (!Debug.minLogLevel)
				{
					Debug.minLogLevel = Debug.Levels.GENERAL;
				}
			});
	};

	plugin.preload = function(done)
	{
		this.options.asDOMElement('framerate');
		var framerate = this.options.framerate;
		var display = this.display;

		if (!framerate && display)
		{
			var stage = display.canvas;
			framerate = document.createElement("div");
			framerate.id = "framerate";
			stage.parentNode.insertBefore(framerate, stage);
		}

		// Check for no framerate in the case of no display
		// and no option.framerate being set
		if (framerate)
		{
			this._framerate = framerate;

			// Set the default text
			framerate.innerHTML = "FPS: 00.000";

			var frameCount = 0;
			var framerateTimer = 0;

			this.on('update', function(elapsed)
				{
					frameCount++;
					framerateTimer += elapsed;

					// Only update the framerate every second
					if (framerateTimer >= 1000)
					{
						var fps = 1000 / framerateTimer * frameCount;
						framerate.innerHTML = "FPS: " + fps.toFixed(3);
						framerateTimer = 0;
						frameCount = 0;
					}
				})
				.on('resumed', function()
				{
					frameCount = framerateTimer = 0;
				});
		}
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (true)
		{
			this.off('update resumed');

			// Remove the framerate container
			var framerate = this._framerate;
			if (framerate && framerate.parentNode)
			{
				framerate.parentNode.removeChild(framerate);
			}
		}
		Debug.disconnect();
	};

}());