/*! SpringRoll 0.0.7 */
/**
*  @module Core
*/
/**
*  Static class for namespacing objects and adding
*  classes to it.
*  @class namespace
*  @static
*/
(function(window){
	
	// The namespace function already exists
	if ("namespace" in window) return;
	
	/**
	*  Create the namespace and assing to the window
	*
	*  @example
		var SpriteUtils = function(){};
		namespace('springroll').SpriteUtils = SpriteUtils;
	*
	*  @constructor
	*  @method namespace
	*  @param {string} namespaceString Name space, for instance 'springroll.utils'
	*  @return {object} The namespace object attached to the current window
	*/
	var namespace = function(namespaceString) {
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';

		for(var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	};
	
	// Assign to the window namespace
	window.namespace = namespace;
	
}(window));


/**
*  @module Core
*/
/**
*  Used to include required classes by name
*  @class include
*  @static
*/
(function(window, undefined){
	
	// The include function already exists
	if ("include" in window) return;
	
	/**
	*  Import a class
	*
	*  @example
		var Application = include('springroll.Application');
	*
	*  @constructor
	*  @method include
	*  @param {string} namespaceString Name space, for instance 'springroll.Application'
	*  @param {Boolean} [required=true] If the class we're trying to include is required.
	* 		For classes that aren't found and are required, an error is thrown.
	*  @return {object|function} The object attached at the given namespace
	*/
	var include = function(namespaceString, required)
	{
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';
		
		required = required !== undefined ? !!required : true;

		for(var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			if (!parent[currentPart])
			{
				if (!required)
				{
					return null;
				}
				if (true)
				{
					throw "Unable to include '" + namespaceString + "' because the code is not included or the class needs to loaded sooner.";
				}
				else
				{
					throw "Unable to include '" + namespaceString + "'";
				}
			}
			parent = parent[currentPart];
		}
		return parent;
	};
	
	// Assign to the window namespace
	window.include = include;
	
}(window));
/**
*  @module Core
*/
(function(Object, undefined){

	/**
	*  Add methods to Object
	*  @class Object
	*/

	/**
	*  Merges two (or more) objects, giving the last one precedence
	*  @method merge
	*  @example
		var obj1 = { id : 'foo', name : 'Hello!', value : 100 };
		var obj2 = { id : 'bar', value : 200 };
		Object.merge({}, obj1, obj2); // Returns: { id : 'bar', name : 'Hello!', value : 200 }
	*  @static
	*  @param {Object} target The target object
	*  @param {Object} source* Additional objects to add
	*/
	Object.merge = function(target, source)
	{
		if (typeof target !== 'object')
		{
			target = {};
		}
		
		for (var property in source)
		{
			if (source.hasOwnProperty(property))
			{
				var sourceProperty = source[property];
				
				if (typeof sourceProperty === 'object' && Object.isPlain(sourceProperty))
				{
					target[property] = Object.merge(target[property], sourceProperty);
					continue;
				}
				target[property] = sourceProperty;
			}
		}
		
		for (var i = 2, l = arguments.length; i < l; i++)
		{
			Object.merge(target, arguments[i]);
		}
		return target;
	};

	/**
	*  Check to see if an object is a plain object definition
	*  @method isPlain
	*  @static
	*  @param {Object} target The target object
	*  @return {Boolean} If the object is plain
	*/
	Object.isPlain = function(obj)
	{
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if (!obj || typeof obj !== "object" || obj.nodeType || obj === window)
		{
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		}
		catch (e)
		{
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if (support.ownLast)
		{
			for (key in obj)
			{
				return hasOwn.call(obj, key);
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for (key in obj) {}

		return key === undefined || hasOwn.call(obj, key);
	};
	
	/**
	*  Creates a shallow copy of the object.
	*  @method clone
	*  @return {Object} The shallow copy.
	*/
	if(!Object.prototype.clone)
	{
		Object.defineProperty(Object.prototype, 'clone',
		{
			enumerable: false,
			writable: true,
			value: function()
			{
				var rtn = {};
				var thisObj = this;
				for(var key in thisObj)
				{
					rtn[key] = thisObj[key];
				}
				return rtn;
			}
		});
	}

}(Object));
/**
*  @module Core
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
	* @property {int} true
	*/
	Debug['DE'+'BUG'] = 1; // jshint ignore:line

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
	*  @param {string} host The remote address to connect to, IP address or host name
	*/
	Debug.connect = function(host)
	{
		// Make sure WebSocket exists without prefixes for us
		if(!("WebSocket" in window) && !("MozWebSocket" in window)) return false;

		window.WebSocket = WebSocket || MozWebSocket;

		try
		{
			var s = Debug._socket = new WebSocket("ws://" + host + ":" + Debug._NET_PORT);
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
		for (var i = 0, len = Debug._messageQueue.length; i < len; ++i)
		{
			Debug._socket.send(JSON.stringify(Debug._messageQueue[i]));
		}
		// get rid of this, since we are connected
		Debug._messageQueue = null;
	};

	/**
	*  Global window error handler, used for remote connections.
	*  @static
	*  @private
	*  @method globalErrorHandler
	*  @param {String} message The error message
	*  @param {String} file The url of the file
	*  @param {int} line The line within the file
	*  @param {int} column The column within the line
	*  @param {Error} error The error itself
	*/
	var globalErrorHandler = function(message, file, line, column, error)
	{
		var logMessage = "Error: " + message + " in " + file + " at line " + line;
		if(column !== undefined)
			logMessage += ":" + column;
		if(error)
			logMessage += "\n" + error.stack;
		Debug.remoteLog(logMessage, "ERROR");
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
		for (var i = 0, len = depth * 4; i < len; ++i)
		{
			spacing += "&nbsp;";
			if(i < (depth - 1) * 4)
				endSpacing += "&nbsp;";
		}
		var rtn = "{<br />";
		for (var key in obj)
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
			Debug.remoteLog(params, 'DE'+'BUG');
		}
		else if (Debug.minLogLevel <= Debug['DE'+'BUG'] && hasConsole) // jshint ignore:line
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

/**
*  @module Core
*  @namespace springroll
*/
(function(window){
		
	// Include the window.performance object
	var performance = include('performance', false);

	// See if we have performance.now or any of
	// the brower-specific versions
	var now = performance && (
		performance.now || 
		performance.mozNow || 
		performance.msNow || 
		performance.oNow || 
		performance.webkitNow
	);

	// Browser prefix polyfill
	if (now) performance.now = now;

	/**
	*  A collection of Time related utility functions
	*  @class TimeUtils
	*/
	var TimeUtils = {};
	
	/**
	*  This method gets timestamp in micromilliseconds for doing performance
	*  intense operations. Fallback support is to `Date.now()`. We aren't overridding
	*  `performance.now()` incase dependencies on this actually demand 
	*  the optimization and accuracy that performance actually provides.
	*  @static
	*  @method now
	*  @return {int} The number of micromilliseconds of the current timestamp
	*/
	TimeUtils.now = !now ? Date.now : function()
	{ 
		return performance.now(); 
	};

	// Assign to namespace
	namespace('springroll').TimeUtils = TimeUtils;
	
}(window));
(function(){

	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	var	len = vendors.length;
	for(var x = 0; x < len  && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	// create a setTimeout based fallback if there wasn't an official or prefixed version
	if (!window.requestAnimationFrame)
	{
		var TimeUtils = include('springroll.TimeUtils');
		var lastTime = 0;
		// Create the polyfill
		window.requestAnimationFrame = function(callback)
		{
			var currTime = TimeUtils.now();//use the now function from down below
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		// Only set this up if the corresponding requestAnimationFrame was set up
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}

	// Short alias
	window.requestAnimFrame = window.requestAnimationFrame;

}());

/**
*  @module Core
*  @namespace springroll
*/
(function(undefined){

	/**
	*  The EventDispatcher mirrors the functionality of AS3 and CreateJS's EventDispatcher,
	*  but is more robust in terms of inputs for the `on()` and `off()` methods.
	*
	*  @class EventDispatcher
	*  @constructor
	*/
	var EventDispatcher = function()
	{
		/**
		* The collection of listeners
		* @property {Array} _listeners
		* @private
		*/
		this._listeners = [];

		/**
		 * If the dispatcher is destroyed
		 * @property {Boolean} _destroyed
		 * @protected
		 */
		this._destroyed = false;
	},

	// Reference to the prototype
	p = EventDispatcher.prototype;

	/**
	*  Dispatch an event
	*  @method trigger
	*  @param {String} type The type of event to trigger
	*  @param {*} arguments Additional parameters for the listener functions.
	*/
	p.trigger = function(type)
	{
		if (this._destroyed) return;

		if (this._listeners[type] !== undefined)
		{
			// copy the listeners array
			var listeners = this._listeners[type].slice();

			var args;

			if(arguments.length > 1)
			{
				args = Array.prototype.slice.call(arguments, 1);
			}

			for(var i = listeners.length - 1; i >= 0; --i)
			{
				var listener = listeners[i];
				if (listener._eventDispatcherOnce)
				{
					delete listener._eventDispatcherOnce;
					this.off(type, listener);
				}
				listener.apply(this, args);
			}
		}
	};

	/**
	*  Add an event listener but only handle it one time.
	*
	*  @method once
	*  @param {String|object} name The type of event (can be multiple events separated by spaces),
	*          or a map of events to handlers
	*  @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	*  @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	*  @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	*/
	p.once = function(name, callback, priority)
	{
		return this.on(name, callback, priority, true);
	};

	/**
	*  Add an event listener. The parameters for the listener functions depend on the event.
	*
	*  @method on
	*  @param {String|object} name The type of event (can be multiple events separated by spaces),
	*          or a map of events to handlers
	*  @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	*  @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	*  @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	*/
	p.on = function(name, callback, priority, once)
	{
		if (this._destroyed) return;

		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key], priority, once);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '), n = null;

			var listener;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				listener = this._listeners[n];
				if(!listener)
					listener = this._listeners[n] = [];

				if (once)
				{
					callback._eventDispatcherOnce = true;
				}
				callback._priority = parseInt(priority) || 0;

				if (listener.indexOf(callback) === -1)
				{
					listener.push(callback);
					if(listener.length > 1)
						listener.sort(listenerSorter);
				}
			}
		}
		// Callbacks array
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f], priority, once);
			}
		}
		return this;
	};

	function listenerSorter(a, b)
	{
		return a._priority - b._priority;
	}

	/**
	*  Remove the event listener
	*
	*  @method off
	*  @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
	*  @param {Function|Array*} callback The listener function or collection of callback functions
	*  @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	*/
	p.off = function(name, callback)
	{
		if (this._destroyed) return;

		// remove all
		if (name === undefined)
		{
			this._listeners = [];
		}
		// remove multiple callbacks
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' '), n = null;
			var listener, index;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				listener = this._listeners[n];
				if(listener)
				{
					// remove all listeners for that event
					if (callback === undefined)
					{
						listener.length = 0;
					}
					else
					{
						//remove single listener
						index = listener.indexOf(callback);
						if (index !== -1)
						{
							listener.splice(index, 1);
						}
					}
				}
			}
		}
		return this;
	};

	/**
	*  Checks if the EventDispatcher has a specific listener or any listener for a given event.
	*
	*  @method has
	*  @param {String} name The name of the single event type to check for
	*  @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
	*  @return {Boolean} If the EventDispatcher has the specified listener.
	*/
	p.has = function(name, callback)
	{
		if(!name) return false;

		var listeners = this._listeners[name];
		if(!listeners) return false;
		if(!callback)
			return listeners.length > 0;
		return listeners.indexOf(callback) >= 0;
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;
		this._listeners = null;
	};

	/**
	*  Return type of the value.
	*
	*  @private
	*  @method type
	*  @param  {*} value
	*  @return {String} The type
	*/
	function type(value)
	{
		if (value === null)
		{
			return 'null';
		}
		var typeOfValue = typeof value;
		if (typeOfValue === 'object' || typeOfValue === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeOfValue;
	}

	/**
	*  Adds EventDispatcher methods and properties to an object or object prototype.
	*  @method mixIn
	*  @param {Object} object The object or prototype
	*  @param {Boolean} [callConstructor=false] If the EventDispatcher constructor should be called as well.
	*  @static
	*  @public
	*/
	EventDispatcher.mixIn = function(object, callConstructor)
	{
		object.trigger = p.trigger;
		object.on = p.on;
		object.off = p.off;
		object.has = p.has;
		if(callConstructor)
			EventDispatcher.call(object);
	};

	// Assign to name space
	namespace('springroll').EventDispatcher = EventDispatcher;

}());

/**
*  @module Core
*  @namespace springroll
*/
(function(global, doc, undefined){
		
	/**
	*  Handle the page visiblity change, if supported. Application uses one of these to
	*  monitor page visibility. It is suggested that you listen to "pause", "paused",
	*  or "unpaused" events on the application instead of using one of these yourself.
	*
	*  @class PageVisibility
	*  @constructor
	*  @param {Function} onFocus Callback when the page becomes visible
	*  @param {Function} onBlur Callback when the page loses visibility
	*/
	var PageVisibility = function(onFocus, onBlur)
	{
		/**
		* Callback when the page becomes visible
		* @property {Function} _onFocus
		* @private
		*/
		this._onFocus = onFocus;
		
		/**
		* Callback when the page loses visibility
		* @property {Function} _onBlur
		* @private
		*/
		this._onBlur = onBlur;
		
		/**
		* If this object is enabled.
		* @property {Function} _enabled
		* @private
		*/
		this._enabled = false;

		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		/**
		* The visibility toggle listener function
		* @property {Function} _onToggle
		* @private
		*/
		this._onToggle = function()
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				this._onBlur();
			else
				this._onFocus();
		}.bind(this);
		
		this.enabled = true;
	},
	
	// Reference to the prototype
	p = PageVisibility.prototype,
	
	/**
	* The name of the visibility change event for the browser
	*
	* @property {String} _visibilityChange
	* @private
	*/
	_visibilityChange = null;
	
	// Select the visiblity change event name
	if (doc.hidden !== undefined)
	{
		_visibilityChange = "visibilitychange";
	}
	else if (doc.mozHidden !== undefined)
	{
		_visibilityChange = "mozvisibilitychange";
	}
	else if (doc.msHidden !== undefined)
	{
		_visibilityChange = "msvisibilitychange";
	}
	else if (doc.webkitHidden !== undefined)
	{
		_visibilityChange = "webkitvisibilitychange";
	}
	
	/**
	* If this object is enabled.
	* @property {Function} enabled
	* @private
	*/
	Object.defineProperty(p, "enabled", {
		get: function() { return this._enabled; },
		set: function(value)
		{
			value = !!value;
			if(this._enabled == value) return;
			this._enabled = value;
			
			global.removeEventListener("pagehide", this._onBlur);
			global.removeEventListener("pageshow", this._onFocus);
			global.removeEventListener("blur", this._onBlur);
			global.removeEventListener("focus", this._onFocus);
			global.removeEventListener("visibilitychange", this._onToggle);
			doc.removeEventListener(_visibilityChange, this._onToggle, false);
			
			if(value)
			{
				// Listen to visibility change
				// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
				doc.addEventListener(_visibilityChange, this._onToggle, false);
				// Listen for page events (when clicking the home button on iOS)
				global.addEventListener("pagehide", this._onBlur);
				global.addEventListener("pageshow", this._onFocus);
				global.addEventListener("blur", this._onBlur);
				global.addEventListener("focus", this._onFocus);
				global.addEventListener("visibilitychange", this._onToggle, false);
			}
		}
	});
	
	/**
	*  Disable the detection
	*  @method destroy
	*/
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange || !this._onToggle) return;
		
		this.enabled = false;
		this._onToggle = null;
		this._onFocus = null;
		this._onBlur = null;
	};
	
	// Assign to the global space
	namespace('springroll').PageVisibility = PageVisibility;
	
}(window, document));
/**
*  @module Core
*  @namespace springroll
*/
(function(undefined){

	// classes to import
	var Debug,
		Loader,
		TimeUtils,
		PageVisibility,
		EventDispatcher = include('springroll.EventDispatcher');

	/**
	*  Creates a new application, for example (HappyCamel extends Application)
	*  manages displays, update loop controlling, handles resizing
	*
	*	var app = new Application({fps:60, resizeElement:window});
	*
	*  @class Application
	*  @extend EventDispatcher
	*  @constructor
	*  @param {Object} [options] The options for creating the application
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String|int} [options.version] The current version number for your application. This
	*                                        number will automatically be appended to all file
	*                                        requests. For instance, if the version is "0.0.1" all
	*                                        file requests will be appended with "?v=0.0.1"
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*                                         numbers for each asset. This is useful for controlling
	*                                         the live browser cache. For instance, this text file
	*                                         would have an asset on each line followed by a number:
	*                                         `assets/config/config.json 2` would load
	*                                         `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding
	*                                             "?v=" to the end of each file path requested. Use
	*                                             for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file
	*                                     requests this is a great way to load all load requests
	*                                     with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*                                                            fit.
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original
	*                                                aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add
	*                                           a maximum aspect ratio. This allows for "title-safe"
	*                                           responsiveness. Must be greater than the original
	*                                           aspect ratio of the canvas.
	*  @param {Number} [options.minAspectRatio] If doing uniform resizing, optional parameter to add
	*                                           a minimum aspect ratio. This allows for "title-safe"
	*                                           responsiveness. Must be less than the original
	*                                           aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as
	*                                                         options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from
	*                                       0 (general) to 4 (error). the `Debug` class must be used
	*                                       for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging, the debug
	*                                        module must be included to use this feature. Can be an
	*                                        IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update
	*                                               the Tween itself
	*  @param {Boolean} [options.autoPause=true] The application pauses automatically when
	*                                            the window loses focus.
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to automatically instantiate as the
	*                                      display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior
	*                                               is to load assets from the same domain.
	*/
	var Application = function(options)
	{
		if (_instance)
		{
			throw "Only one Application can be opened at a time";
		}
		_instance = this;

		EventDispatcher.call(this);

		if(!Debug)
		{
			Debug = include('Debug');
			Loader = include('springroll.Loader');
			TimeUtils = include('springroll.TimeUtils');
			PageVisibility = include('springroll.PageVisibility');
		}

		/**
		*  Initialization options/query string parameters, these properties are read-only
		*  Application properties like raf, fps, don't have any affect on the options object.
		*  @property {Object} options
		*  @readOnly
		*/
		this.options = options || {};

		/**
		*  Primary renderer for the application, for simply accessing
		*  Application.instance.display.stage;
		*  The first display added becomes the primary display automatically.
		*  @property {Display} display
		*  @public
		*/
		this.display = null;

		/**
		*  If we should wait to init the Application, this is useful is something is inheriting
		*  Application but want to do some extra stuff before init is actually called.
		*  @property {Boolean} _readyToInit
		*  @protected
		*/
		this._readyToInit = true;

		_displays = {};
		_tickCallback = this._tick.bind(this);

		//other initialization stuff too
		//if there are some specific properties on the options, use them to make a display
		//call init after handling loading up a versions file or any other needed asynchronous
		//stuff?
		this._internalInit();
	};

	// Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = Application.prototype = Object.create(s);

	/**
	*  The collection of function references to call when initializing the application
	*  these are registered by external libraries that need to setup, destroyed
	*  for instance Loader
	*  @property {Array} _globalInit
	*  @private
	*  @static
	*/
	Application._globalInit = [];

	/**
	*  The collection of function references to call when destroying the application
	*  these are registered by external libraries that need to setup, destroyed
	*  for instance Loader
	*  @property {Array} _globalDestroy
	*  @private
	*  @static
	*/
	Application._globalDestroy = [];

	/**
	*  The frame rate object
	*  @private
	*  @property {DOMObject} _framerate
	*/
	var _framerate = null,

	/**
	*  The number of ms since the last frame update
	*  @private
	*  @property {int} _lastFrameTime
	*/
	_lastFrameTime = 0,

	/**
	*  The last time since the last fps update
	*  @private
	*  @property {int} _lastFPSUpdateTime
	*/
	_lastFPSUpdateTime = 0,

	/**
	*  The number of frames since the last fps update
	*  @private
	*  @property {int} _frameCount
	*/
	_frameCount = 0,

	/**
	*	The bound callback for listening to tick events
	*	@private
	*   @property {Function} _tickCallback
	*/
	_tickCallback = null,

	/**
	*  If the current application is paushed
	*  @private
	*  @property {Boolean} _paused
	*/
	_paused = false,

	/**
	*  The id of the active requestAnimationFrame or setTimeout call.
	*  @property {Number} _tickId
	*  @private
	*/
	_tickId = -1,

	/**
	*  If requestionAnimationFrame should be used
	*  @private
	*  @property {Bool} _useRAF
	*  @default false
	*/
	_useRAF = false,

	/**
	*  The current internal frames per second
	*  @property {Number} _fps
	*  @private
	*  @default 0
	*/
	_fps = 0,

	/**
	* The number of milliseconds per frame
	* @property {int} _msPerFrame
	* @private
	*/
	_msPerFrame = 0,

	/**
	*  Dom element (or the window) to attach resize listeners and read the size from
	*  @property {DOMElement|Window|null} _resizeElement
	*  @private
	*  @default null
	*/
	_resizeElement = null,

	/**
	*  The aspect ratio of the primary display, as width / height.
	*  @property {Number} _aspectRatio
	*  @private
	*/
	_aspectRatio = 0,

	/**
	*  A PageVisibility object to automatically pause Application when the page is hidden.
	*  @property {PageVisibility} _pageVisibility
	*  @private
	*/
	_pageVisibility = null,


	/**
	*  Rendering plugins, in a dictionary by canvas id
	*  @property {dictionary} _displays
	*  @private
	*/
	_displays = null,

	/**
	*  Default initialization options.
	*  @property {dictionary} _defaultOptions
	*  @private
	*/
	_defaultOptions =
	{
		//application properties
		raf: true,
		fps: 60,
		resizeElement: null,
		uniformResize: true,
		queryStringParameters: false,
		debug: false,
		minLogLevel: 0,
		ip: null,
		//default display properties
		canvasId: null,
		display: null,
		displayOptions: null,
		
		updateTween: false,
		autoPause: true
	},

	/**
	*  A helper object to avoid object creation each resize event.
	*  @property {Object} _resizeHelper
	*  @private
	*/
	_resizeHelper = { width: 0, height: 0},

	/**
	*  Fired when initialization of the application is done
	*  @event init
	*/
	INIT = 'init',

	/**
	*  Event when everything's done but we haven't actually inited
	*  @event preInit
	*  @protected
	*/
	BEFORE_INIT = 'beforeInit',

	/**
	*  Fired when an update is called, every frame update
	*  @event update
	*  @param {int} elasped The number of milliseconds since the last frame update
	*/
	UPDATE = 'update',

	/**
	*  Fired when a resize is called
	*  @event resize
	*  @param {int} width The width of the resize element
	*  @param {int} height The height of the resize element
	*/
	RESIZE = 'resize',

	/**
	*  Fired when the pause state is toggled
	*  @event pause
	*  @param {boolean} paused If the application is now paused
	*/
	PAUSE = 'pause',

	/**
	*  Fired when the application becomes paused
	*  @event paused
	*/
	PAUSED = 'paused',

	/**
	*  Fired when the application resumes from a paused state
	*  @event resumed
	*/
	RESUMED = 'resumed',

	/**
	*  Fired when the application is destroyed
	*  @event destroy
	*/
	DESTROY = 'destroy';

	/**
	*  Libraries would register global initialization functions when they are created, e.g.
	*  Application.registerInit(Loader.init);
	*  @method registerInit
	*  @param {Function} func
	*  @static
	*  @public
	*/
	Application.registerInit = function(func)
	{
		Application._globalInit.push(func);
	};
	/**
	*  Libraries would register global destroy functions when they are created or initialized, e.g.
	*  Application.registerInit(Loader.instance.destroy.bind(Loader.instance));
	*  @method registerDestroy
	*  @param {Function} func
	*  @static
	*  @public
	*/
	Application.registerDestroy = function(func)
	{
		Application._globalDestroy.push(func);
	};

	/**
	*  Get the singleton instance of the application
	*  @property {Application} instance
	*  @static
	*  @public
	*/
	var _instance = null;
	Object.defineProperty(Application, "instance", {
		get: function() {
			return _instance;
		}
	});

	/**
	*  The internal initialization
	*  @method _internalInit
	*  @private
	*/
	p._internalInit = function()
	{
		//grab the query string parameters if we should be doing so
		var query = !!this.options.parseQueryString ? parseQueryStringParams() : {};

		// Assemble all of the options, the last takes precedence
		this.options = Object.merge({}, _defaultOptions, this.options, query);

		// Call any global libraries to initialize
		for (var i = 0, len = Application._globalInit.length; i < len; ++i)
		{
			Application._globalInit[i]();
		}

		_useRAF = this.options.raf;
		this.fps = this.options.fps;
		var framerate = this.options.framerate;
		if(framerate)
		{
			if(typeof framerate == "string")
				_framerate = document.getElementById(framerate);
			else
				_framerate = framerate;
		}
		var resizeElement = this.options.resizeElement;
		if(resizeElement)
		{
			if(typeof resizeElement == "string")
				_resizeElement = document.getElementById(resizeElement);
			else
				_resizeElement = resizeElement;
			this.triggerResize = this.triggerResize.bind(this);
			window.addEventListener("resize", this.triggerResize);
		}

		// Turn on debugging
		if (this.options.debug !== undefined)
			Debug.enabled = this.options.debug === true || this.options.debug === "true";

		if (this.options.minLogLevel !== undefined)
			Debug.minLogLevel = parseInt(this.options.minLogLevel, 10);

		//if we were supplied with an IP address, connect to it with the Debug class for logging
		if(typeof this.options.debugRemote == "string")
			Debug.connect(this.options.debugRemote);

		// If tween and/or ticker are included
		var Tween = include('createjs.Tween', false),
			Ticker = include('createjs.Ticker', false);

		// Add an option to have the application control the Tween tick
		if (Tween && this.options.updateTween)
		{
			if (Ticker)
			{
				Ticker.setPaused(true);
			}
			this.on('update', Tween.tick);
		}

		//set up the page visibility listener
		_pageVisibility = new PageVisibility(this._onVisible.bind(this), this._onHidden.bind(this));
		this.autoPause = this.options.autoPause;

		if(this.options.canvasId && this.options.display)
			this.addDisplay(this.options.canvasId, this.options.display,
							this.options.displayOptions);


		// Bind the do init
		this._doInit = this._doInit.bind(this);

		// Check to see if we should load a versions file
		// The versions file keeps track of file versions to avoid cache issues
		if (this.options.versionsFile !== undefined)
		{
			// Try to load the default versions file
			// callback should be made with a scope in mind
			Loader.instance.cacheManager.addVersionsFile(
				this.options.versionsFile,
				this._doInit
			);
		}
		else
		{
			// Wait until the next execution sequence
			// so that init can be added after construction
			setTimeout(this._doInit, 0);
		}
	};

	/**
	*  Initialize the application
	*  @method _doInit
	*  @protected
	*/
	p._doInit = function()
	{
		this.trigger(BEFORE_INIT);

		// If a sub-class will manually try to init later on
		if (!this._readyToInit) return;

		// Call the init function
		if (this.init) this.init();

		//do an initial resize to make sure everything is sized properly
		this.triggerResize();

		//start update loop
		this.paused = false;

		// Dispatch the init event
		this.trigger(INIT);
	};

	/**
	*  Define all of the query string parameters
	*  @private
	*  @method parseQueryStringParams
	*  @return {object} The object reference to update
	*/
	var parseQueryStringParams = function()
	{
		var output = {};
		var href = window.location.search;
		if(!href)//empty string is false
		{
			return output;
		}
		var vars = href.substr(href.indexOf("?")+1);
		var pound = vars.indexOf('#');
		vars = pound < 0 ? vars : vars.substring(0, pound);
		var splitFlashVars = vars.split("&");
		var myVar;
		for (var i = 0, len = splitFlashVars.length; i < len; i++)
		{
			myVar = splitFlashVars[i].split("=");
			if (true)
			{
				Debug.log(myVar[0] + " -> " + myVar[1]);
			}
			output[myVar[0]] = myVar[1];
		}
		return output;
	};

	/**
	*  Override this to do post constructor initialization
	*  @method init
	*  @protected
	*/
	p.init = null;

	/**
	*  Private listener for when the page is hidden.
	*  @method _onHidden
	*  @private
	*/
	p._onHidden = function()
	{
		this.paused = true;
	};

	/**
	*  Private listener for when the page is shown.
	*  @method _onVisible
	*  @private
	*/
	p._onVisible = function()
	{
		this.paused = false;
	};
	
	/**
	*  If the Application should automatically pause when the window loses focus.
	*  @property {Boolean} autoPause
	*/
	Object.defineProperty(p, "autoPause", {
		get: function()
		{
			return _pageVisibility.enabled;
		},
		set: function(value)
		{
			_pageVisibility.enabled = value;
		}
	});

	/**
	*  Pause updates at the application level
	*  @property {Boolean} paused
	*/
	Object.defineProperty(p, "paused", {
		get: function()
		{
			return _paused;
		},
		set: function(value)
		{
			_paused = !!value;
			this.trigger(PAUSE, _paused);
			this.trigger(_paused ? PAUSED : RESUMED, _paused);

			if(_paused)
			{
				if(_tickId != -1)
				{
					if(_useRAF)
					{
						cancelAnimationFrame(_tickId);
					}
					else
						clearTimeout(_tickId);
					_tickId = -1;
				}
			}
			else
			{
				if(_tickId == -1)
				{
					_tickId = _useRAF ?
						requestAnimFrame(_tickCallback):
						setTargetedTimeout(_tickCallback);
				}
				_lastFPSUpdateTime = _lastFrameTime = TimeUtils.now();
			}
		}
	});

	/**
	*  Makes a setTimeout with a time based on _msPerFrame and the amount of time spent in the
	*  current tick.
	*  @method setTargetedTimeout
	*  @param {Function} callback The tick function to call.
	*  @param {int} timeInFrame=0 The amount of time spent in the current tick in milliseconds.
	*  @private
	*/
	var setTargetedTimeout = function(callback, timeInFrame)
	{
		var timeToCall = _msPerFrame;
		//subtract the time spent in the frame to actually hit the target fps
		if(timeInFrame)
			timeToCall = Math.max(0, _msPerFrame - timeInFrame);
		return setTimeout(callback, timeToCall);
	};

	/**
	*  Fire a resize event with the current width and height of the display
	*  @method triggerResize
	*/
	p.triggerResize = function()
	{
		if(!_resizeElement) return;

		// window uses innerWidth, DOM elements clientWidth
		_resizeHelper.width = (_resizeElement.innerWidth || _resizeElement.clientWidth) | 0;
		_resizeHelper.height = (_resizeElement.innerHeight || _resizeElement.clientHeight) | 0;

		this.calculateDisplaySize(_resizeHelper);

		//round down, as canvases require integer sizes
		_resizeHelper.width |= 0;
		_resizeHelper.height |= 0;

		//resize the displays
		var key;
		for (key in _displays)
		{
			_displays[key].resize(_resizeHelper.width, _resizeHelper.height);
		}
		//send out the resize event
		this.trigger(RESIZE, _resizeHelper.width, _resizeHelper.height);

		//redraw all displays
		for (key in _displays)
		{
			_displays[key].render(0, true); // force renderer
		}
	};

	/**
	*  Calculates the resizing of displays. By default, this limits the new size
	*  to the initial aspect ratio of the primary display. Override this function
	*  if you need variable aspect ratios.
	*  @method calculateDisplaySize
	*  @protected
	*  @param {Object} size A size object containing the width and height of the resized container.
	*                       The size parameter is also the output of the function, so the size
	*                       properties are edited in place.
	*  @param {int} size.width The width of the resized container.
	*  @param {int} size.height The height of the resized container.
	*/
	p.calculateDisplaySize = function(size)
	{
		if (!_aspectRatio || !this.options.uniformResize) return;

		var maxAspectRatio = this.options.maxAspectRatio || _aspectRatio,
			minAspectRatio = this.options.minAspectRatio || _aspectRatio,
			currentAspect = size.width / size.height;

		if (currentAspect < minAspectRatio)
		{
			//limit to the narrower width
			size.height = size.width / minAspectRatio;
		}
		else if (currentAspect > maxAspectRatio)
		{
			//limit to the shorter height
			size.width = size.height * maxAspectRatio;
		}
	};

	/**
	*  Add a display. If this is the first display added, then it will be stored as this.display.
	*  @method addDisplay
	*  @param {String} id The id of the canvas element, this will be used to grab the Display later
	*                     also the Display should be the one to called document.getElementById(id)
	*                     and not the application sinc we don't care about the DOMElement as this
	*                     point
	*  @param {function} displayConstructor The function to call to create the display instance
	*  @param {Object} [options] Optional Display specific options
	*  @return {Display} The created display.
	*/
	p.addDisplay = function(id, displayConstructor, options)
	{
		if(_displays[id])
		{
			if (true)
			{
				Debug.error("A display already exists with the id of " + id);
			}
			return;
		}
		var display = _displays[id] = new displayConstructor(id, options);
		if (!this.display)
		{
			this.display = display;
			_aspectRatio = display.width / display.height;
			var maxAspectRatio = this.options.maxAspectRatio || _aspectRatio;

			if (maxAspectRatio < _aspectRatio)
			{
				if (true)
				{
					throw "Invalid 'maxAspectRatio': Must be greater than the original aspect ratio of the display";
				}
				else
				{
					throw "Invalid 'maxAspectRatio'";
				}
			}
		}
		return display;
	};

	/**
	*  Gets a specific renderer by the canvas id.
	*  @method getDisplay
	*  @param {String} id The id of the canvas
	*  @return {Display} The requested display.
	*/
	p.getDisplay = function(id)
	{
		return _displays[id];
	};

	/**
	*  Gets a specific renderer by the canvas id.
	*  @method getDisplays
	*  @public
	*  @param {function} [each] Optional looping method, callback takes a single parameter of the
	*                           display
	*  @return {Array} The collection of Display objects
	*/
	p.getDisplays = function(each)
	{
		var output = [];
		for (var key in _displays)
		{
			output.push(_displays[key]);
			if (typeof each === "function")
			{
				each.call(this, _displays[key]);
			}
		}
		return output;
	};

	/**
	* Removes and destroys a display
	* @method removeDisplay
	* @param {String} id The Display's id (also the canvas ID)
	*/
	p.removeDisplay = function(id)
	{
		var display = _displays[id];
		if(display)
		{
			display.destroy();
			delete _displays[id];
		}
	};

	/**
	*  Property for getting/setting the target fps (when not using RAF)
	*  @public
	*  @property {Number} fps
	*/
	Object.defineProperty(p, "fps", {
		get: function()
		{
			return _fps;
		},
		set: function(value)
		{
			if(typeof value != "number") return;
			_fps = value;
			_msPerFrame = (1000 / _fps) | 0;
		}
	});

	/**
	*  Getter and setting for using Request Animation Frame
	*  @public
	*  @property {Boolean} raf
	*/
	Object.defineProperty(p, "raf", {
		get: function()
		{
			return _useRAF;
		},
		set: function(value)
		{
			_useRAF = !!value;
		}
	});

	/**
	*  _tick would be bound in _tickCallback
	*  @method _tick
	*  @private
	*/
	p._tick = function()
	{
		if (_paused)
		{
			_tickId = -1;
			return;
		}

		var now = TimeUtils.now();
		var dTime = now - _lastFrameTime;

		// Only update the framerate every second
		if(_framerate)
		{
			_frameCount++;
			var elapsed = now - _lastFPSUpdateTime;
			if (elapsed > 1000)
			{
				var framerateValue = 1000 / elapsed * _frameCount;
				_framerate.innerHTML = "FPS: " + (Math.round(framerateValue * 1000) / 1000);
				_lastFPSUpdateTime = now;
				_frameCount = 0;
			}
		}
		_lastFrameTime = now;

		//trigger the update event
		this.trigger(UPDATE, dTime);

		//then update all displays
		for (var key in _displays)
		{
			_displays[key].render(dTime);
		}

		//request the next tick
		//request the next animation frame
		_tickId = _useRAF ?
			requestAnimFrame(_tickCallback) :
			setTargetedTimeout(_tickCallback, TimeUtils.now() - _lastFrameTime);
	};

	/**
	* Destroys the application, global libraries registered via Application.registerDestroy() and
	* all active displays
	* @method destroy
	*/
	p.destroy = function()
	{
		this._readyToInit = false;
		this.paused = true;
		this.trigger(DESTROY);

		for (var key in _displays)
		{
			_displays[key].destroy();
		}
		_displays = null;

		for (var i = 0, len = Application._globalDestroy.length; i < len; ++i)
		{
			Application._globalDestroy[i]();
		}

		if(_resizeElement)
		{
			window.removeEventListener("resize", this.triggerResize);
		}

		_pageVisibility.destroy();
		_pageVisibility = null;

		_instance =
		_tickCallback =
		_framerate =
		_resizeElement = null;

		Debug.disconnect();

		s.destroy.call(this);
	};

	// Add to the name space
	namespace('springroll').Application = Application;

}());

/**
*  @module Core
*  @namespace springroll
*/
(function(undefined){

	/**
	*   The display provides the base properties for all custom display. A display
	*   is a specialized view for the application. As the name suggests, this class
	*   should not be instanciated directly.
	*
	*   @class AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the display.
	*   @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	*/
	var AbstractDisplay = function(id, options)
	{
		options = options || {};

		/**
		*  the canvas managed by this display
		*  @property {DOMElement} canvas
		*  @readOnly
		*  @public
		*/
		this.canvas = document.getElementById(id);

		/**
		*  The DOM id for the canvas
		*  @property {String} id
		*  @readOnly
		*  @public
		*/
		this.id = id;

		/**
		*  Convenience method for getting the width of the canvas element
		*  would be the same thing as canvas.width
		*  @property {int} width
		*  @readOnly
		*  @public
		*/
		this.width = this.canvas.width;

		/**
		*  Convenience method for getting the height of the canvas element
		*  would be the same thing as canvas.height
		*  @property {int} height
		*  @readOnly
		*  @public
		*/
		this.height = this.canvas.height;

		/**
		*  The main rendering context or the root display object or stage.
		*  @property {mixed} stage
		*  @readOnly
		*  @public
		*/
		this.stage = null;

		/**
		*  If rendering is paused on this display only. Pausing all displays can be done
		*  using Application.paused setter.
		*  @property {Boolean} paused
		*  @public
		*/
		this.paused = false;

		/**
		*  If input is enabled on the stage.
		*  @property {Boolean} _enabled
		*  @private
		*/
		this._enabled = false;

		/**
		*  If the display is visible.
		*  @property {Boolean} _visible
		*  @private
		*/
		this._visible = this.canvas.style.display != "none";

		// prevent mouse down turning into text cursor
		this.canvas.onmousedown = function(e)
		{
			e.preventDefault();
		};

		/**
		*  The Animator class to use when using this display. Other modules
		*  uses this to determine what Animator to use, for instance states
		*  uses Animator when playing transition animations.
		*  @property {Animator} animator
		*  @readOnly
		*  @public
		*  @default null
		*/
		this.animator = null;

		/**
		*  Some of the modules require a special display adapter to provide
		*  common methods for managing display objects.
		*  @property {DisplayAdapter} adapter
		*  @readOnly
		*  @public
		*  @default null
		*/
		this.adapter = null;
	};

	var p = AbstractDisplay.prototype;

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  Without a rendering library, this does not actually have an effect.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
		}
	});

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
		}
	});

	/**
	* Resizes the canvas. This is only called by the Application.
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	};

	/** 
	* Updates the stage and draws it. This is only called by the Application. 
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	* @param {Boolean} [force=false] For the re-render
	*/
	p.render = function(elapsed, force)
	{
		// implement specific
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.animator = null;
		this.adapter = null;
		this.canvas.onmousedown = null;
		this.canvas = null;
	};

	// Assign to the global namespace
	namespace('springroll').AbstractDisplay = AbstractDisplay;

}());
/**
*  @module Core
*  @namespace springroll
*/
(function(undefined){

	// Classes to import
	var Application,
		Loader;

	/**
	*  Used for managing the browser cache of loading external elements
	*  can easily load version manifest and apply it to the media loader
	*  supports cache busting all media load requests
	*  uses the query string to bust browser versions.
	*
	*  @class CacheManager
	*/
	var CacheManager = function()
	{
		if(!Application)
		{
			Application = include('springroll.Application');
			Loader = include('springroll.Loader');
		}

		this._applySpecificVersion = this._applySpecificVersion.bind(this);
		this._applyGlobalVersion = this._applyGlobalVersion.bind(this);

		/**
		*  The collection of version numbers
		*  @protected
		*  @property {Dictionary} _versions
		*/
		this._versions = {};

		/**
		*  The list of URL filtering functions.
		*  @protected
		*  @property {Array} _filters
		*/
		this._filters = [];

		/**
		*  A global version or cache busting string to apply to every url.
		*  @property {String} _globalVersion
		*/
		this._globalVersion = null;

		var cb = Application.instance.options.cacheBust;
		this.cacheBust = (cb === "true" || cb === true);

		if(true)
		{
			if (this.cacheBust) Debug.log("CacheBust all files is on.");
		}
	};

	/* Easy access to the prototype */
	var p = CacheManager.prototype = {};

	/**
	*  If we are suppose to cache bust every file
	*  @property {Boolean} cacheBust
	*  @public
	*  @default false
	*/
	Object.defineProperty(p, "cacheBust",
	{
		get: function()
		{
			return !!(this._globalVersion && this._globalVersion.indexOf("cb=") === 0);
		},
		set: function(value)
		{
			if(value)
			{
				this._globalVersion = "cb=" + Date.now();
				this.unregisterURLFilter(this._applySpecificVersion);
				this.registerURLFilter(this._applyGlobalVersion);
			}
			else
			{
				var version = Application.instance.options.version;
				this._globalVersion = version ? "v=" + version : null;
				if(this._globalVersion)
				{
					this.unregisterURLFilter(this._applySpecificVersion);
					this.registerURLFilter(this._applyGlobalVersion);
				}
				else
				{
					this.unregisterURLFilter(this._applyGlobalVersion);
					this.registerURLFilter(this._applySpecificVersion);
				}
			}
		}
	});

	/**
	*  Destroy the cache manager, don't use after this.
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._versions = null;
		this._filters = null;
		this._applySpecificVersion = null;
		this._applyGlobalVersion = null;
	};

	/**
	*  Adds a versions text file containing versions for different assets.
	*  @public
	*  @method addVersionsFile
	*  @param {String} url The url of the versions file.
	*  @param {Function} callback Callback when the versions file has been loaded.
	*  @param {String} baseUrl A base url to prepend all lines of the file.
	*/
	p.addVersionsFile = function(url, callback, baseUrl)
	{
		Debug.assert(/^.*\.txt$/.test(url), "The versions file must be a *.txt file");

		var loader = Loader.instance;

		// If we already cache busting, we can ignore this
		if (this.cacheBust)
		{
			if (callback) callback();
			return;
		}

		// Add a random version number to never cache the text file
		this.addVersion(url, Date.now().toString());

		//ensure that that cache busting version is applied
		url = this._applySpecificVersion(url);

		var cm = this;

		// Load the version
		loader.load(url,
			function(result)
			{
				// check for a valid result content
				if (result && result.content)
				{
					// Remove carrage returns and split on newlines
					var lines = result.content.replace(/\r/g, '').split("\n");
					var i, parts;

					// Go line by line
					for (i = 0, len = lines.length; i < len; i++)
					{
						// Check for a valid line
						if (!lines[i]) continue;

						// Split lines
						parts = lines[i].split(' ');

						// Add the parts
						if (parts.length != 2) continue;

						// Add the versioning
						cm.addVersion((baseUrl || "") + parts[0], parts[1]);
					}
				}
				if (callback) callback();
			}
		);
	};

	/**
	*  Add a version number for a file
	*  @method addVersion
	*  @public
	*  @param {String} url The url of the object
	*  @param {String} version Version number or has of file
	*/
	p.addVersion = function(url, version)
	{
		if (!this._versions[url])
			this._versions[url] = version;
	};

	/**
	*  Adds a function for running all urls through, to modify them if needed.
	*  Functions used should accept one string parameter (the url), and return the
	*  modified url.
	*  @method registerURLFilter
	*  @public
	*  @param {Function} filter The function that will handle urls.
	*/
	p.registerURLFilter = function(filter)
	{
		if(this._filters.indexOf(filter) == -1)
			this._filters.push(filter);
	};

	/**
	*  Removes a function from the list of filtering functions.
	*  @method unregisterURLFilter
	*  @public
	*  @param {Function} filter The function to remove.
	*/
	p.unregisterURLFilter = function(filter)
	{
		var index = this._filters.indexOf(filter);
		if(index > -1)
			this._filters.splice(index, 1);
	};

	/**
	*  Applies a url specific version to a url from the versions file.
	*  @method _applySpecificVersion
	*  @private
	*  @param {String} url The url to apply versioning to.
	*  @return {String} The modified url.
	*/
	p._applySpecificVersion = function(url)
	{
		var ver = this._versions[url];
		//if a version exists for this url, and the url doesn't already have 'v=' in it
		//then apply the url specific version.
		if(ver && /(\?|\&)v\=[0-9]*/.test(url) === false)
		{
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + "v=" + ver.version;
		}
		return url;
	};

	/**
	*  Applies cache busting or a global version to a url.
	*  @method _applyGlobalVersion
	*  @private
	*  @param {String} url The url to apply versioning to.
	*  @return {String} The modified url.
	*/
	p._applyGlobalVersion = function(url)
	{
		if(!this._globalVersion) return url;
		var test = this._globalVersion.indexOf("cb=") === 0 ?
			(/(\?|\&)cb\=[0-9]*/) : (/(\?|\&)v\=/);
		if(test.test(url) === false)
		{
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + this._globalVersion;
		}
		return url;
	};

	/**
	*  Applies a base path to a relative url. This is not used in the filtering
	*  system because PreloadJS has its own method of prepending the base path
	*  that we use. Instead, it is used with an extra parameter to prepare().
	*  @method _applyBasePath
	*  @private
	*  @param {String} url The url to prepend the base path to.
	*  @return {String} The modified url.
	*/
	p._applyBasePath = function(url)
	{
		var basePath = Application.instance.options.basePath;
		if (/^http(s)?\:/.test(url) === false && basePath && url.search(basePath) == -1)
		{
			url = basePath + url;
		}
		return url;
	};

	/**
	*  Prepare a URL with the necessary cache busting and/or versioning
	*  as well as the base directory.
	*  @public
	*  @method prepare
	*  @param {String} url The url to prepare
	*  @param {Boolean} [applyBasePath=false] If the global base path should be applied to the url.
	*		This defaults to false because it can potentially interfere with later regular
	*		expression checks, particularly with PreloadJS
	*  @return {String} The final url with version/cache and basePath added
	*/
	p.prepare = function(url, applyBasePath)
	{
		for (var i = 0, len = this._filters.length; i < len; ++i)
		{
			url = this._filters[i](url);
		}

		if(applyBasePath)
		{
			url = this._applyBasePath(url);
		}
		return url;
	};

	// Assign to namespace
	namespace('springroll').CacheManager = CacheManager;

}());

/**
*  @module Core
*  @namespace springroll
*/
(function(){
	
	/**
	*  Represents a single item in the loader queue 
	*
	*  @class LoaderQueueItem
	*/
	var LoaderQueueItem = function()
	{
		/**
		*  The url of the load
		*  @public
		*  @property {string} url
		*/
		this.url = null;
		
		/**
		*  Data associate with the load
		*  @public
		*  @property {*} data
		*/
		this.data = null;
		
		/**
		*  The callback function of the load, to call when 
		*  the load as finished, takes one argument as result
		*  @public
		*  @property {function} callback
		*/
		this.callback = null;
		
		/**
		*  The priority of this item
		*  @property {int} priority
		*  @public
		*/
		this.priority = 0;
		
		/**
		*  The amount we've loaded so far, from 0 to 1
		*  @public
		*  @property {Number} progress
		*/
		this.progress = 0;
		
		/**
		*  The progress callback
		*  @public
		*  @proprty {function} updateCallback
		*/
		this.updateCallback = null;
		
		/**
		*  The callback when a load queue item fails
		*  @private
		*  @proprty {function} _boundFail
		*/
		this._boundFail = null;

		/**
		*  The callback when a load queue item progresses
		*  @private
		*  @proprty {function} _boundProgress
		*/
		this._boundProgress = null;

		/**
		*  The callback when a load queue item completes
		*  @private
		*  @proprty {function} _boundComplete
		*/
		this._boundComplete = null;
	};
	
	/** Reference to the prototype */
	var p = LoaderQueueItem.prototype;
	
	/** 
	* Highest priority
	* @static
	* @public
	* @final
	* @property {int} PRIORITY_HIGH
	*/
	LoaderQueueItem.PRIORITY_HIGH = 1;
	
	/** 
	* Normal priority, the default
	* @static
	* @public
	* @final
	* @property {int} PRIORITY_NORMAL
	*/
	LoaderQueueItem.PRIORITY_NORMAL = 0;
	
	/** 
	* Lowest priority
	* @static
	* @public
	* @final
	* @property {int} PRIORITY_LOW
	*/
	LoaderQueueItem.PRIORITY_LOW = -1;
	
	/**
	*  Represent this object as a string
	*  @public
	*  @method toString
	*  @return {string} The string representation of this object
	*/
	p.toString = function()
	{
		return "[LoaderQueueItem(url:'"+this.url+"', priority:"+this.priority+")]";
	};
	
	/**
	*  Destroy this result
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.callback = null;
		this.updateCallback = null;
		this.data = null;
		this._boundFail = null;
		this._boundProgress = null;
		this._boundComplete = null;
	};
	
	// Assign to the name space
	namespace('springroll').LoaderQueueItem = LoaderQueueItem;
	
}());
/**
*  @module Core
*  @namespace springroll
*/
(function(){
	
	// Classes to import
	var LoaderQueueItem,
		CacheManager,
		Application,
		Sound,
		LoadQueue,
		LoaderResult;

	/**
	*  The Loader is the singleton loader for loading all assets
	*  including images, data, code and sounds. Loader supports cache-busting
	*  in the browser using dynamic query string parameters.
	* 
	*  @class Loader
	*/
	var Loader = function()
	{
		if (!Application)
		{
			LoaderQueueItem = include('springroll.LoaderQueueItem');
			CacheManager = include('springroll.CacheManager');
			Application = include('springroll.Application');
			LoaderResult = include('springroll.LoaderResult');
			LoadQueue = include('createjs.LoadQueue');
			Sound = include('createjs.Sound', false);
		}

		/**
		*  If we can load
		*  @private
		*/
		this._canLoad = true;
		
		/**
		*  The maximum number of simulaneous loads
		*  @public
		*  @property {int} maxSimultaneousLoads
		*  @default 2
		*/
		this.maxSimultaneousLoads = 2;
		
		/**
		*  The reference to the cache manager
		*  @public
		*  @property {CacheManager} cacheManager
		*/
		this.cacheManager = null;
	};
	
	/** The prototype */
	var p = Loader.prototype;
	
	/**
	* Reference to the private instance object
	* @static
	* @protected
	*/
	var _instance = null;
	
	/**
	*  The collection of LoaderQueueItems
	*  @private
	*/
	var queue = null;
	
	/**
	*  The collection of LoaderQueueItems by url
	*  @private
	*/
	var queueItems = null;
	
	/**
	*  The collection of loaders
	*  @private
	*  @property {object} loaders
	*/
	var loaders = null;
	
	/**
	*  The pool of queue items
	*  @private
	*  @property {array} loaders
	*/
	var qiPool = null;

	/**
	*  The pool of loader items
	*  @private
	*  @property {array} loaders
	*/
	var loaderPool = null;

	/**
	*  The pool of result items
	*  @private
	*  @property {array} loaders
	*/
	var resultPool = null;
	
	/**
	*  The current number of items loading
	*  @private
	*  @property {int} numLoads
	*  @default 0
	*/
	var numLoads = 0;
	
	/**
	*  The retry attempts
	*  @private
	*  @property {Object} retries
	*/
	var retries = null;
	
	/**
	*  Static constructor creating the singleton
	*  @method init
	*  @static
	*  @public
	*/
	Loader.init = function()
	{
		if (!_instance)
		{
			_instance = new Loader();
			_instance._initialize();
			//register the destroy function
			Application.registerDestroy(
				_instance.destroy.bind(_instance)
			);
		}
		return _instance;
	};

	//register the global init function
	springroll.Application.registerInit(Loader.init);
		
	/**
	*  Static function for getting the singleton instance
	*  @static
	*  @readOnly
	*  @public
	*  @property {Loader} instance
	*/
	Object.defineProperty(Loader, "instance", {
		get:function()
		{
			return _instance;
		}
	});
	
	/**
	*  Destroy the Loader singleton, don't use after this
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		var i, len, key, arr = this.queue;
		if(arr)
		{
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			arr = qiPool;
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			arr = resultPool;
			for(i = 0, len = arr.length; i < i; ++i)
				arr[i].destroy();
			for(key in loaders)
			{
				queueItems[key].destroy();
				loaders[key].close();
			}
		}
		_instance = null;
		if (this.cacheManager)
			this.cacheManager.destroy();
		this.cacheManager = null;
		queue = null;
		resultPool = null;
		loaderPool = null;
		qiPool = null;
		queueItems = null;
		retries = null;
		loaders = null;
	};
	
	/**
	*  Initilize the object
	*  @protected
	*  @method _initialize
	*/
	p._initialize = function()
	{
		qiPool = [];
		loaderPool = [];
		resultPool = [];
		queue = [];
		queueItems = {};
		loaders = {};
		retries = {};
		this.cacheManager = new CacheManager();
	};
	
	/**
	*  Load a file 
	*  @method load
	*  @public
	*  @param {string} url The file path to load
	*  @param {function} callback The callback function when completed
	*  @param {function*} updateCallback The callback for load progress update, passes 0-1 as param
	*  @param {int*} priority The priority of the load
	*  @param {*} data optional data
	*/
	p.load = function(url, callback, updateCallback, priority, data)
	{
		var qi = this._getQI();
		
		var basePath = Application.instance.options.basePath;
		if (basePath !== undefined && /^http(s)?\:/.test(url) === false && url.search(basePath) == -1)
		{
			qi.basePath = basePath;
		}
		
		qi.url = url;
		qi.callback = callback;
		qi.updateCallback = updateCallback || null;
		qi.priority = priority || LoaderQueueItem.PRIORITY_NORMAL;
		qi.data = data || null;
		
		queue.push(qi);
		
		// Sory by priority
		queue.sort(function(a, b){
			return a.priority - b.priority;
		});
		
		// Try to load the next queue item
		this._tryNextLoad();
	};
	
	/**
	*  There was an error loading the file
	*  @private
	*  @method _onLoadFailed
	*  @param {LoaderQueueItem} qi The loader queue item
	*/
	p._onLoadFailed = function(qi, event)
	{
		Debug.error("Unable to load file: " + qi.url  + " - reason: " + event.error);
		
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		this._poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];
		
		if(retries[qi.url])
			retries[qi.url]++;
		else
			retries[qi.url] = 1;
		if(retries[qi.url] > 3)
			this._loadDone(qi, null);
		else
		{
			numLoads--;
			queue.push(qi);
			this._tryNextLoad();
		}
	};
	
	/**
	*  The file load progress event
	*  @method _onLoadProgress
	*  @private
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} event The progress event
	*/
	p._onLoadProgress = function(qi, event)
	{
		qi.progress = event.progress;
		if (qi.updateCallback){
			qi.updateCallback(qi.progress);
		}	
	};
	
	/**
	*  The file was loaded successfully
	*  @private
	*  @method _onLoadCompleted
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} ev The load event
	*/
	p._onLoadCompleted = function(qi, ev)
	{
		if(true)
		{
			Debug.log("File loaded successfully from " + qi.url);
		}
		var loader = loaders[qi.url];
		loader.removeAllEventListeners();
		loader.close();
		this._poolLoader(loader);
		
		delete queueItems[qi.url];
		delete loaders[qi.url];
		this._loadDone(qi, this._getResult(ev.result, qi.url, loader));
	};
	
	/**
	*  Attempt to do the next load
	*  @method _tryNextLoad
	*  @private
	*/
	p._tryNextLoad = function()
	{
		if (numLoads > this.maxSimultaneousLoads - 1 || queue.length === 0) return;
		
		numLoads++;
		
		var qi = queue.shift();
		
		if(true)
		{
			Debug.log("Attempting to load file '" + qi.url + "'");
		}
		
		queueItems[qi.url] = qi;
		
		var loader = this._getLoader(qi.basePath);
		
		// Add to the list of loaders
		loaders[qi.url] = loader;
		
		loader.addEventListener("fileload", qi._boundComplete);
		loader.addEventListener("error", qi._boundFail);
		loader.addEventListener("fileprogress", qi._boundProgress);
		var url = this.cacheManager.prepare(qi.url);
		loader.loadFile(qi.data ? {id:qi.data.id, src:url, data:qi.data} : url);
	};
	
	/**
	*  Alert that the loading is finished
	*  @private 
	*  @method _loadDone
	*  @param {LoaderQueueItem} qi The loader queue item
	*  @param {object} result The event from preloadjs or null
	*/
	p._loadDone = function(qi, result)
	{
		numLoads--;
		if(qi.data && result)//a way to keep track of load results without excessive function binding
			result.id = qi.data.id;
		qi.callback(result);
		//qi.destroy();
		this._poolQI(qi);
		this._tryNextLoad();
	};
	
	/**
	*  Cancel a load that's currently in progress
	*  @public
	*  @method cancel
	*  @param {string} url The url
	*  @return {bool} If canceled returns true, false if not canceled
	*/
	p.cancel = function(url)
	{
		var qi = queueItems[url];
		var loader = loaders[url];
		
		if (qi && loader)
		{
			loader.close();
			delete loaders[url];
			delete queueItems[qi.url];
			numLoads--;
			this._poolLoader(loader);
			this._poolQI(qi);
			return true;
		}
		
		for(var i = 0, len = queue.length; i < len; i++)
		{
			qi = queue[i];
			if (qi.url == url){
				queue.splice(i, 1);
				this._poolQI(qi);
				return true;
			}
		}
		return false;		
	};
	
	p._getQI = function()
	{
		var rtn;
		if(qiPool.length)
			rtn = qiPool.pop();
		else
		{
			rtn = new LoaderQueueItem();
			rtn._boundFail = this._onLoadFailed.bind(this, rtn);
			rtn._boundProgress = this._onLoadProgress.bind(this, rtn);
			rtn._boundComplete = this._onLoadCompleted.bind(this, rtn);
		}
		return rtn;
	};
	
	p._poolQI = function(qi)
	{
		qiPool.push(qi);
		qi.callback = qi.updateCallback = qi.data = qi.url = null;
		qi.progress = 0;
	};
	
	p._getLoader = function(basePath)
	{
		var rtn;
		if(loaderPool.length)
		{
			rtn = loaderPool.pop();
			rtn._basePath = basePath;//apparently they neglected to make this public
		}
		else
			rtn = new LoadQueue(true, basePath);
		//allow the loader to handle sound as well
		if(Sound)
		{
			rtn.installPlugin(Sound);
		}
		return rtn;
	};
	
	p._poolLoader = function(loader)
	{
		loader.removeAll();//clear the loader for reuse
		loaderPool.push(loader);
	};
	
	p._getResult = function(result, url, loader)
	{
		var rtn;
		if(resultPool.length)
		{
			rtn = resultPool.pop();
			rtn.content = result;
			rtn.url = url;
			rtn.loader = loader;
		}
		else
			rtn = new LoaderResult(result, url, loader);
		return rtn;
	};
	
	p._poolResult = function(result)
	{
		result.content = result.url = result.loader = result.id = null;
		resultPool.push(result);
	};
	
	// MediaLoader name is deprecated
	namespace('springroll').MediaLoader = Loader;
	namespace('springroll').Loader = Loader;
}());
/**
*  @module Core
*  @namespace springroll
*/
(function(){
	
	/**
	*  The return result of the Loader load
	*  @class LoaderResult
	*  @constructor
	*  @param {*} content The dynamic content loaded
	*  @param {string} url The url that was loaded
	*  @param {createjs.LoadQueue} loader The LoadQueue that performed the load
	*/
	var LoaderResult = function(content, url, loader)
	{
		/**
		*  The contents of the load
		*  @public
		*  @property {*} content 
		*/
		this.content = content;

		/**
		*  The url of the load
		*  @public
		*  @property {string} url
		*/
		this.url = url;

		/**
		*  Reference to the preloader object
		*  @public
		*  @property {createjs.LoaderQueue} loader
		*/
		this.loader = loader;
	};
	
	/** Reference to the prototype */
	var p = LoaderResult.prototype;
	
	/**
	* A to string method
	* @public
	* @method toString
	* @return {string} A string rep of the object
	*/
	p.toString = function()
	{
		return "[LoaderResult('"+this.url+"')]";
	};
	
	/**
	* Destroy this result
	* @public
	* @method destroy
	*/
	p.destroy = function()
	{
		this.callback = null;
		this.url = null;
		this.content = null;
	};
	
	// Assign to the name space
	// MediaLoadeResult is deprecated
	namespace('springroll').MediaLoaderResult = LoaderResult;
	namespace('springroll').LoaderResult = LoaderResult;
	
}());
/**
*  @module Core
*  @namespace springroll
*/
(function() {
	
	/**
	*  A function that is used as a normal callback, but checks an object for a property in order to combine two
	*  callbacks into one. For example usage:
	*
	*  var voPlayer = new springroll.VOPlayer();
	*  var callback = springroll.CombinedCallback.create(myFunc.bind(this), voPlayer, "playing", "_callback");
	*  Animator.play(myClip, "myAnim", callback);
	*  
	*  In this example, when Animator calls 'callback', if voPlayer["playing"] is false, 'myFunc' is called immediately.
	*  If voPlayer["playing"] is true, then voPlayer["_callback"] is set to 'myFunc' so that it will be called when voPlayer completes.
	*  
	*  @class CombinedCallback
	*  @constructor
	*  @param {function} call The callback to call when everything is complete.
	*  @param {*} obj The object to check as an additional completion dependency.
	*  @param {String} prop The property to check on obj. If obj[prop] is false, then it is considered complete.
	*  @param {String} callProp The property to set on obj if obj[prop] is true when the CombinedCallback is called.
	*/
	var CombinedCallback = function(call, obj, prop, callProp)
	{
		if(!obj[prop])//accept anything that resolves to false: eg voPlayer.playing == false
			call();
		else
			obj[callProp] = call;
	};

	/**
	*  Creates a CombinedCallback for use.
	*  
	*  @method create
	*  @static
	*  @param {function} call The callback to call when everything is complete.
	*  @param {*} obj The object to check as an additional completion dependency.
	*  @param {String} prop The property to check on obj. If obj[prop] is false, then it is considered complete.
	*  @param {String} callProp The property to set on obj if obj[prop] is true when the CombinedCallback is called.
	*/
	CombinedCallback.create = function(call, obj, prop, callProp)
	{
		return CombinedCallback.bind(this, call, obj, prop, callProp);
	};

	namespace('springroll').CombinedCallback = CombinedCallback;
}());
/**
*  @module Core
*  @namespace springroll
*/
(function(undefined){

	/**
	*  The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
	*
	*  @class SavedData
	*/
	var SavedData = {},

	/** A constant to determine if we can use localStorage and sessionStorage */
	WEB_STORAGE_SUPPORT = window.Storage !== undefined,

	/** A constant for cookie fallback for SavedData.clear() */
	ERASE_COOKIE = -1;

	//in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
	if(WEB_STORAGE_SUPPORT)
	{
		try
		{
			localStorage.setItem("LS_TEST", "test");
			localStorage.removeItem("LS_TEST");
		}
		catch(e)
		{
			WEB_STORAGE_SUPPORT = false;
		}
	}

	/**
	*  Remove a saved variable by name.
	*  @method remove
	*  @static
	*  @param {String} name The name of the value to remove
	*/
	SavedData.remove = function(name)
	{
		if(WEB_STORAGE_SUPPORT)
		{
			localStorage.removeItem(name);
			sessionStorage.removeItem(name);
		}
		else
			SavedData.write(name,"",ERASE_COOKIE);
	};

	/**
	*  Save a variable.
	*  @method write
	*  @static
	*  @param {String} name The name of the value to save
	*  @param {mixed} value The value to save. This will be run through JSON.stringify().
	*  @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
	*/
	SavedData.write = function(name, value, tempOnly)
	{
		if(WEB_STORAGE_SUPPORT)
		{
			if(tempOnly)
				sessionStorage.setItem(name, JSON.stringify(value));
			else
				localStorage.setItem(name, JSON.stringify(value));
		}
		else
		{
			var expires;
			if (tempOnly)
			{
				if(tempOnly !== ERASE_COOKIE)
					expires = "";//remove when browser is closed
				else
					expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT";//save cookie in the past for immediate removal
			}
			else
				expires = "; expires="+new Date(2147483646000).toGMTString();//THE END OF (32bit UNIX) TIME!

			document.cookie = name+"="+escape(JSON.stringify(value))+expires+"; path=/";
		}
	};

	/**
	*  Read the value of a saved variable
	*  @method read
	*  @static
	*  @param {String} name The name of the variable
	*  @return {mixed} The value (run through `JSON.parse()`) or null if it doesn't exist
	*/
	SavedData.read = function(name)
	{
		if(WEB_STORAGE_SUPPORT)
		{
			var value = localStorage.getItem(name) || sessionStorage.getItem(name);
			if(value)
				return JSON.parse(value);
			else
				return null;
		}
		else
		{
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i = 0, c, len;

			for(i=0, len=ca.length; i<len;i++)
			{
				c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) === 0) return JSON.parse(unescape(c.substring(nameEQ.length,c.length)));
			}
			return null;
		}
	};

	// Assign to the global space
	namespace('springroll').SavedData = SavedData;

}());

/**
*  @module Core
*  @namespace springroll
*/
(function(undefined) {

	var Application = include('springroll.Application');

	/**
	*  A class for delaying a call through the Application, instead of relying on setInterval() or setTimeout().
	* 
	*  @class DelayedCall
	*  @constructor
	*  @param {function} callback The function to call when the delay has completed.
	*  @param {int} delay The time to delay the call, in milliseconds.
	*  @param {Boolean} [repeat=false] If the DelayedCall should automatically repeat itself when completed.
	*  @param {Boolean} [autoDestroy=true] If the DelayedCall should clean itself up when completed.
	*/
	var DelayedCall = function(callback, delay, repeat, autoDestroy)
	{		
		/**
		*  The function to call when the delay is completed.
		*  @private
		*  @property {function} _callback
		*/
		this._callback = callback;

		/**
		*  The delay time, in milliseconds.
		*  @private
		*  @property {int} _delay
		*/
		this._delay = delay;

		/**
		*  The timer counting down from _delay, in milliseconds.
		*  @private
		*  @property {int} _timer
		*/
		this._timer = delay;

		/**
		*  If the DelayedCall should repeat itself automatically.
		*  @private
		*  @property {Boolean} _repeat
		*  @default false
		*/
		this._repeat = !!repeat;

		/**
		*  If the DelayedCall should destroy itself after completing
		*  @private
		*  @property {Boolean} _autoDestroy
		*  @default true
		*/
		this._autoDestroy = autoDestroy === undefined ? true : !!autoDestroy;

		/**
		*  If the DelayedCall is currently paused (not stopped).
		*  @private
		*  @property {Boolean} _paused
		*/
		this._paused = false;

		//save a bound version of the update function
		this._update = this._update.bind(this);

		//start the delay
		Application.instance.on("update", this._update);
	};

	var p = DelayedCall.prototype;

	/**
	*  The callback supplied to the Application for an update each frame.
	*  @private
	*  @method _update
	*  @param {int} elapsed The time elapsed since the previous frame.
	*/
	p._update = function(elapsed)
	{
		if(!this._callback)
		{
			this.destroy();
			return;
		}

		this._timer -= elapsed;
		if(this._timer <= 0)
		{
			this._callback();
			if(this._repeat)
				this._timer += this._delay;
			else if(this._autoDestroy)
				this.destroy();
			else
				Application.instance.off("update", this._update);
		}
	};

	/**
	*  Restarts the DelayedCall, whether it is running or not.
	*  @public
	*  @method restart
	*/
	p.restart = function()
	{
		if(!this._callback) return;
		var app = Application.instance;
		if(!app.has("update", this._update))
			app.on("update", this._update);
		this._timer = this._delay;
		this._paused = false;
	};

	/**
	*  Stops the DelayedCall, without destroying it.
	*  @public
	*  @method stop
	*/
	p.stop = function()
	{
		Application.instance.off("update", this._update);
		this._paused = false;
	};

	/**
	*  If the DelayedCall is paused or not.
	*  @public
	*  @property {Boolean} paused
	*/
	Object.defineProperty(p, "paused", {
		get: function() { return this._paused; },
		set: function(value)
		{
			if(!this._callback) return;
			var app = Application.instance;
			if(this._paused && !value)
			{
				this._paused = false;
				if(!app.has("update", this._update))
					app.on("update", this._update);
			}
			else if(value)
			{
				if(app.has("update", this._update))
				{
					this._paused = true;
					app.off("update", this._update);
				}
			}
		}
	});

	/**
	*  Stops and cleans up the DelayedCall. Do not use it after calling
	*  destroy().
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		Application.instance.off("update", this._update);
		this._callback = null;
	};

	namespace('springroll').DelayedCall = DelayedCall;
}());
/**
*  @module Core
*/
(function() {
	/**
	*  Add methods to String
	*  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	*  @class String
	*/

	/**
	*  Returns a formatted string, similar to the printf() function in many languages.
	*  This simplified version substitutes "%s" with the arguments in order. To escape "%s",
	*  use "%%s".
	*  @method format
	*  @param {Array|*} args An array or list of arguments for formatting.
	*  @return {String} The substituted string.
	*/
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	Object.defineProperty(String.prototype, 'format', {
		enumerable: false,
		writable:false,
		value: function() {
			if (arguments.length < 1) return this;
			var args = Array.isArray(args) ? args : Array.prototype.slice.call(arguments);
			
			return this.replace(
				/([^%]|^)%(?:(\d+)\$)?s/g,
				function(p0, p, position)
				{
					if (position)
					{
						return p + args[parseInt(position)-1];
					}
					return p + args.shift();
				}
			).replace(/%%s/g, '%s');
		}
	});
}());

/**
*  @module Core
*/
(function() {
	/**
	*  Add methods to Array
	*  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	*  @class Array
	*/

	/**
	*  Shuffles the array
	*  @method shuffle
	*/
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	if(!Array.prototype.shuffle)
	{
		Object.defineProperty(Array.prototype, 'shuffle', {
			enumerable: false,
			writable:false,
			value: function() {
				for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
				return this;
			}
		});
	}

	/**
	*  Get a random item from an array
	*  @method random
	*  @static
	*  @param {Array} array The array
	*  @return {*} The random item
	*/
	if(!Array.prototype.random)
	{
		Object.defineProperty(Array.prototype, 'random', {
			enumerable: false,
			writable: false,
			value: function() {
				return this[Math.floor(Math.random() * this.length)];
			}
		});
	}

	/**
	*  Get the last item in the array
	*  @method last
	*  @static
	*  @param {Array} array The array
	*  @return {*} The last item
	*/
	if(!Array.prototype.last)
	{
		Object.defineProperty(Array.prototype, 'last',
		{
			enumerable: false,
			writable: false,
			value: function()
			{
				return this[this.length - 1];
			}
		});
	}
}());

/**
 * @module Core
 */
(function(Math)
{
	/**
	 * Add methods to Math
	 * @class Math
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method randomInt
	 * @static
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */

	/**
	 * Return a random int between minimum and maximum values.
	 * If a single value is supplied, it will return a number between 0 and the supplied value.
	 * @method getRandomInt
	 * @static
	 * @deprecated
	 * @param {int} min Lowest number. If max is omitted, then this becomes max.
	 * @param {int} max Highest number.
	 * @return {int} The random value
	 */
	Math.randomInt = Math.getRandomInt = function(min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/**
	 * Return dist between two points
	 * @method dist
	 * @static
	 * @param {Number} x The x position of the first point
	 * @param {Number} y The y position of the first point
	 * @param {Number} x0 The x position of the second point
	 * @param {Number} y0 The y position of the second point
	 * @return {Number} The distance
	 */
	Math.dist = function(x, y, x0, y0)
	{
		return Math.sqrt((x -= x0) * x + (y -= y0) * y);
	};

}(Math));