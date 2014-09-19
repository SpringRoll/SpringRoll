/**
*  @module Framework
*/
(function(window, undefined){
	
	/**
	*  A static closure to provide easy access to the console
	*  without having errors if the console doesn't exist
	*  to use call: Debug.log('Your log here')
	*  
	*  @class Debug
	*  @static
	*/
	var Debug = function(){};	
	
	/**
	*  If we have a console
	*
	*  @private
	*  @property {bool} hasConsole
	*/
	var hasConsole = (window.console !== undefined);
	
	/** 
	* The most general default debug level
	* @static
	* @final
	* @property {int} GENERAL
	*/
	Debug.GENERAL = 0;
	
	/** 
	* Log level for debug messages
	* @static
	* @final
	* @property {int} DEBUG
	*/
	Debug.DEBUG = 1;
	
	/** 
	* Log level for debug messages
	* @static
	* @final
	* @property {int} INFO
	*/
	Debug.INFO = 2;
	
	/** 
	* Log level for warning messages
	* @static
	* @final
	* @property {int} WARN
	*/
	Debug.WARN = 3;
	
	/** 
	* Log level for error messages
	* @static
	* @final
	* @property {int} ERROR
	*/
	Debug.ERROR = 4;
	
	/**
	* The minimum log level to show, by default it's set to
	* show all levels of logging. 
	* @public
	* @static
	* @property {int} minLogLevel
	*/
	Debug.minLogLevel = Debug.GENERAL;
	
	/** 
	* Boolean to turn on or off the debugging
	* @public
	* @static
	* @property {bool} enabled
	*/
	Debug.enabled = true;
	
	/**
	*  The jQuery element to output debug messages to
	*
	*  @public
	*  @static
	*  @property {jQuery} output
	*/
	Debug.output = null;

	/**
	*	If the console is currently connected with JSConsole (jsconsole.com).
	*	@private
	*	@static
	*	@property {bool} _isJSConsole
	*/
	Debug._isJSConsole = window.remote === window.console;//The JSConsole script sets one object as 'remote' and trys to overwrite 'console'
	
	/** 
	* Browser port for the websocket browsers tend to block ports 
	*  @static
	*  @private
	*  @property {int} _NET_PORT
	*  @default 1025
	*/
	Debug._NET_PORT = 1025;
	
	/** 
	* If the web socket is connected 
	* @static
	* @private
	* @default false
	* @property {bool} _isConnected
	*/
	Debug._isConnected = false;
	
	/** 
	* The socket connection
	* @static
	* @private
	* @property {WebSocket} _socket
	*/
	Debug._socket = null;
	
	/** 
	* The current message object being sent to the `WebSocket`
	* @static
	* @private
	* @property {object} _messageObj
	*/
	Debug._messageObj = null;
	
	/** 
	* The `WebSocket` message queue 
	* @static
	* @private
	* @property {Array} _messageQueue
	*/
	Debug._messageQueue = null;
	
	/**
	*  Connect to the `WebSocket`
	*  @public
	*  @static
	*  @method connect
	*  @param {string} The IP address to connect to
	*/
	Debug.connect = function(ipAddr)
	{
		// Make sure WebSocket exists without prefixes for us
		if(!("WebSocket" in window) && !("MozWebSocket" in window)) return false;
		
		window.WebSocket = WebSocket || MozWebSocket; 
		
		try
		{
			var s = Debug._socket = new WebSocket("ws://" + ipAddr + ":" + Debug._NET_PORT);
			s.onopen = onConnect;
			s.onmessage = function(){};
			s.onclose = onClose;
			s.onerror = onClose;
			Debug._messageQueue = [];
			Debug._isConnected = true;
		}
		catch(error)
		{
			return false;
		}
		return true;
	};
	
	/**
	*  Disconnect from the `WebSocket`
	*  @public
	*  @static
	*  @method disconnect
	*/
	Debug.disconnect = function()
	{
		if(Debug._isConnected)
		{
			Debug._socket.close();
			onClose();
		}
	};
	
	/**
	*  Callback when the `WebSocket` is connected
	*  @private
	*  @static
	*  @method onConnect
	*/
	var onConnect = function()
	{
		// set up a function to handle all messages
		window.onerror = globalErrorHandler;
		
		// create and send a new session message
		Debug._messageObj = {level:"session", message:""};
		Debug._socket.send(JSON.stringify(Debug._messageObj));
		
		// send any queued logs
		for(var i = 0; i < Debug._messageQueue.length; ++i)
		{
			Debug._socket.send(JSON.stringify(Debug._messageQueue[i]));
		}
		// get rid of this, since we are connected
		Debug._messageQueue = null;
	};
	
	/**
	*  Global window error handler
	*  @static
	*  @private
	*  @method globalErrorHandler
	*  @param THe error message
	*  @param The url of the file
	*  @param The line within the file
	*/
	var globalErrorHandler = function(errorMsg, url, lineNumber)
	{
		Debug.remoteLog("Error: " + errorMsg + " in " + url + " at line " + lineNumber, "ERROR");
		return false;
	};
	
	/**
	*  Callback for when the websocket is closed
	*  @private
	*  @static
	*  @method onClose
	*/
	var onClose = function()
	{
		window.onerror = null;
		Debug._isConnected = false;
		var s = Debug._socket;
		s.onopen = null;
		s.onmessage = null;
		s.onclose = null;
		s.onerror = null;
		Debug._socket = null;
		Debug._messageObj = null;
		Debug._messageQueue = null;
	};
	
	/**
	*  Sent to the output
	*  @private
	*  @static
	*  @method output
	*  @param {string} level The log level
	*  @param {string} args Additional arguments
	*/
	function output(level, args)
	{
		if (Debug.output)
		{
			Debug.output.append("<div class=\""+level+"\">" + args + "</div>");
		}
	}
	
	/**
	*  Send a remote log message using the socket connection
	*  @public
	*  @static
	*  @method remoteLog
	*  @param {string} message The message to send 
	*  @param {level} level The log level to send
	*/
	Debug.remoteLog = function(message, level)
	{
		if(!level)
			level = "GENERAL";
		if(Debug._messageQueue)//If we are still in the process of connecting, queue up the log
		{
			Debug._messageQueue.push({message:message, level:level});
		}
		else//send the log immediately
		{
			Debug._messageObj.level = level;
			Debug._messageObj.message = message;
			Debug._socket.send(JSON.stringify(Debug._messageObj));
		}
	};

	function JSC_stringify(obj, depth)
	{
		if(!depth)
			depth = 1;
		var spacing = "";
		var endSpacing = "";
		for(var i = 0; i < depth * 4; ++i)
		{
			spacing += "&nbsp;";
			if(i < (depth - 1) * 4)
				endSpacing += "&nbsp;";
		}
		var rtn = "{<br />";
		for(var key in obj)
		{
			//avoid doing properties that are known to be DOM objects, because those have circular references
			if(key == "document" || key == "window" || key == "ownerDocument" || key == "view")
				continue;
			if(key == "target" || key == "currentTarget" || key == "originalTarget" || key == "explicitOriginalTarget" || key == "rangeParent")
				continue;
			if(key == "srcElement" || key == "relatedTarget" || key == "fromElement" || key == "toElement")
				continue;
			switch(typeof obj[key])
			{
				case "string":
				case "number":
				case "boolean":
				case "bool":
					rtn += spacing + key + ": " + obj[key] + "<br />";
					break;
				case "object":
					rtn += spacing + key + ": " + JSC_stringify(obj[key], depth + 1) + "<br />";
					break;
				case "function":
					rtn += spacing + key + ": (function)<br />";
					break;
				default:
					rtn += spacing + key + ": " + obj[key] + "<br />";
					break;
			}
		}
		rtn += endSpacing + "}";
		return rtn;
	}

	function JSC_format(input)
	{
		if(typeof input == "string")
		{
			return input.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\n/g, "<br />");
		}
		else if(typeof input == "object")
		{
			return JSC_stringify(input);
		}
		return input;
	}
	
	/**
	*  Log something in the console or remote
	*  @static
	*  @public 
	*  @method log
	*  @param {*} params The statement or object to log
	*/
	Debug.log = function(params)
	{
		if(!Debug.enabled) return;
		if(Debug._isConnected)
		{
			Debug.remoteLog(params, "GENERAL");
		}
		else if (Debug.minLogLevel == Debug.GENERAL && hasConsole) 
		{
			console.log(Debug._isJSConsole ? JSC_format(params) : params);
			output("general", params);
		}	
	};
	
	/**
	*  Debug something in the console or remote
	*  @static
	*  @public 
	*  @method debug
	*  @param {*} params The statement or object to debug
	*/
	Debug.debug = function(params)
	{
		if(!Debug.enabled) return;
		if(Debug._isConnected)
		{
			Debug.remoteLog(params, "DEBUG");
		}
		else if (Debug.minLogLevel <= Debug.DEBUG && hasConsole) 
		{
			console.debug(Debug._isJSConsole ? JSC_format(params) : params);
			output("debug", params);
		}
	};
	
	/**
	*  Info something in the console or remote
	*  @static
	*  @public 
	*  @method info
	*  @param {*} params The statement or object to info
	*/
	Debug.info = function(params)
	{
		if(!Debug.enabled) return;
		if(Debug._isConnected)
		{
			Debug.remoteLog(params, "INFO");
		}
		else if (Debug.minLogLevel <= Debug.INFO && hasConsole) 
		{
			console.info(Debug._isJSConsole ? JSC_format(params) : params);
			output("info", params);
		}	
	};
	
	/**
	*  Warn something in the console or remote
	*  @static
	*  @public 
	*  @method warn
	*  @param {*} params The statement or object to warn
	*/
	Debug.warn = function(params)
	{
		if(!Debug.enabled) return;
		if(Debug._isConnected)
		{
			Debug.remoteLog(params, "WARNING");
		}
		else if (Debug.minLogLevel <= Debug.WARN && hasConsole) 
		{
			console.warn(Debug._isJSConsole ? JSC_format(params) : params);
			output("warn", params);
		}	
	};
	
	/**
	*  Error something in the console or remote
	*  @static
	*  @public 
	*  @method error
	*  @param {*} params The statement or object to error
	*/
	Debug.error = function(params)
	{
		if(!Debug.enabled) return;
		if(Debug._isConnected)
		{
			Debug.remoteLog(params, "ERROR");
		}
		else if (hasConsole) 
		{
			console.error(Debug._isJSConsole ? JSC_format(params) : params);
			output("error", params);
		}	
	};
	
	/**
	*  Assert that something is true
	*  @static
	*  @public
	*  @method assert
	*  @param {bool} truth As statement that is assumed true
	*  @param {*} params The message to error if the assert is false
	*/
	Debug.assert = function(truth, params)
	{
		if (hasConsole && Debug.enabled && console.assert) 
		{
			console.assert(truth, Debug._isJSConsole ? JSC_format(params) : params);
			if (!truth) output("error", params);
		}	
	};
	
	/**
	*  Method to describe an object in the console
	*  @static
	*  @method dir
	*  @public
	*  @param {object} params The object to describe in the console
	*/
	Debug.dir = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled) 
		{
			console.dir(Debug._isJSConsole ? JSC_format(params) : params);
		}	
	};
	
	/**
	*  Method to clear the console
	*
	*  @static
	*  @public
	*  @method clear
	*/
	Debug.clear = function()
	{
		if (hasConsole && Debug.enabled) 
		{
			console.clear();
			if (Debug.output) Debug.output.html("");
		}	
	};
	
	/**
	*  Generate a stack track in the output
	*  @static
	*  @public
	*  @method trace
	*  @param {*} params Optional parameters to log
	*/
	Debug.trace = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled) 
		{
			console.trace(Debug._isJSConsole ? JSC_format(params) : params);
		}	
	};
	
	// Make the debug class globally accessible
	// If the console doesn't exist, use the dummy to prevent errors
	window.Debug = Debug;
	
}(window));