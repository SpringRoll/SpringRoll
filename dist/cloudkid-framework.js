/*! CloudKidFramework 0.0.1 */
/**
*  @module cloudkid
*/
(function(window){
	
	"use strict";

	/**
	*  Designed to provide utility related to functions and polyfills
	*  @class FunctionUtils
	*/
	var FunctionUtils = {};
	
	// If there's already a bind, ignore
	if (!Function.prototype.bind)
	{
		/**
		*  Add the bind functionality to the Function prototype
		*  this allows passing a reference in the function callback 
		*
		*	var callback = function(){};
		*	cloudkid.MediaLoader.instance.load('something.json', callback.bind(this));
		*
		*  @method bind
		*  @static
		*  @param {function} that The reference to the function
		*  @return {function} The bound function
		*/
		FunctionUtils.bind = Function.prototype.bind = function bind(that) 
		{
			var target = this;

			if (typeof target != "function") 
			{
				throw new TypeError();
			}

			var args = Array.prototype.slice.call(arguments, 1),
			bound = function()
			{
				if (this instanceof bound) 
				{
					var F = function(){};
					F.prototype = target.prototype;
					var self = new F();

					var result = target.apply(self, args.concat(Array.prototype.slice.call(arguments)));
				
					if (Object(result) === result)
					{
						return result;
					}
					return self;
				}
				else 
				{
					return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
				}
			};
			return bound;
		};
	}
	
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	// create a setTimeout based fallback if there wasn't an official or prefixed version
	if (!window.requestAnimationFrame)
	{
		var lastTime = 0;
		// Create the polyfill
		window.requestAnimationFrame = function(callback)
		{
			var currTime = nowFunc();//use the now function from down below
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

	/**
	*  A polyfill for requestAnimationFrame, this also gets assigned to the window if it doesn't exist
	*  also window.requestAnimFrame is a redundant and short way to access this property
	*  @static
	*  @method requestAnimationFrame
	*/
	FunctionUtils.requestAnimationFrame = window.requestAnimationFrame;
	window.requestAnimFrame = window.requestAnimationFrame;

	/**
	*  A polyfill for cancelAnimationFrame, this also gets assigned to the window if it doesn't exist
	*  @static
	*  @method cancelAnimationFrame
	*/
	FunctionUtils.cancelAnimationFrame = window.cancelAnimationFrame;

	var nowFunc = window.performance && (performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow);
	if(nowFunc)
		nowFunc = nowFunc.bind(performance);
	else//apparently in Chrome this is extremely inaccurate (triple framerate or something silly)
		nowFunc = Date.now ? Date.now.bind(Date) : function() { return new Date().getTime(); };

	/**
	*  A polyfill for performance.now(), with a fallback of using Date.now().
	*  @static
	*  @method now
	*/
	FunctionUtils.now = nowFunc;

	// Assign to namespace
	namespace('cloudkid').FunctionUtils = FunctionUtils;
	
}(window));
/**
*  @module cloudkid
*/
(function(global, undefined){
	
	"use strict";
	
	/**
	*  The EventDispatcher mirrors the functionality of AS3 and CreateJS's EventDispatcher, 
	*  but is more robust in terms of inputs for the `on()` and `off()` methods.
	*  
	*  @class EventDispatcher
	*  @constructor
	*/
	var EventDispatcher = function(){},
	
	// Reference to the prototype 
	p = EventDispatcher.prototype;
	
	/**
	* The collection of listeners
	* @property {Array} _listeners
	* @private
	*/
	p._listeners = [];
	
	/**
	*  Dispatch an event
	*  @method trigger
	*  @param {String} type The event string name, 
	*  @param {*} params Additional parameters
	*/
	p.trigger = function(type, params)
	{
		if (this._listeners[type] !== undefined) 
		{	
			var listeners = this._listeners[type];
			
			for(var i = 0, l = listeners.length; i < l; i++) 
			{
				listeners[i](params);
			}
		}
	};
	
	/**
	*  Add an event listener. The parameters for the listener functions depend on the event.
	*  
	*  @method on
	*  @param {String|object} name The type of event (can be multiple events separated by spaces), 
	*          or a map of events to handlers
	*  @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	*  @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	*/
	p.on = function(name, callback)
	{
		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key]);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				if (this._listeners[n].indexOf(callback) === -1)
				{
					this._listeners[n].push(callback);
				}
			}
		}
		// Callbacks array
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f]);
			}
		}
		return this;
	};
	
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
		// remove all 
		if (name === undefined)
		{
			this._listeners = [];
		}
		// remove multiple callbacks
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++) 
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				// remove all by time
				if (callback === undefined)
				{
					this._listeners[n].length = 0;
				}
				else
				{
					var index = this._listeners[n].indexOf(callback);
					if (index !== -1)
					{
						this._listeners[n].splice(index, 1);
					}
				}
			}
		}
		return this;
	};

	/**
	*  Checks if the EventDispatcher has a specific listener.
	*  
	*  @method has
	*  @param {String} name The name of the single event type to check for
	*  @param {Function} callback The listener function to check for
	*  @return {Boolean} If the EventDispatcher has the specified listener.
	*/
	p.has = function(name, callback)
	{
		if(!name || !callback) return false;

		var listeners = this._listeners[n];
		if(!listeners) return false;
		return listeners.indexOf(callback) >= 0;
	};
	
	/**
	* Return type of the value.
	*
	* @private
	* @method type
	* @param  {*} value
	* @return {String} The type
	*/
	function type(value)
	{
		if (value === null)
		{
			return String(value);
		}
		if (typeof value === 'object' || typeof value === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeof value;
	}
	
	// Assign to the global spacing
	namespace('cloudkid').EventDispatcher = EventDispatcher;
	
}(window));
/**
*  @module cloudkid
*/
(function(){

	/**
	*  Creates a new application, for example (HappyCamel extends Application)
	*  manages displays, update loop controlling, handles resizing
	*  var app = new Application({fps:60, resizeObject:window});
	*  @class Application
	*  @extend EventDispatcher
	*  @constructor
	*  @param {Object} options
	*/
	var Application = function(options)
	{
		if (_instance)
		{
			throw "Only one Application can be opened at a time";
		}
		_instance = this;

		/**
		*  Initialization options/query string parameters, these properties are read-only
		*  Application properties like raf, fps, don't have any affect on the options object.
		*  @property {Object} options
		*  @readOnly
		*/
		this.options = options || {};

		/**
		*  Primary renderer for the application, for simply accessing Application.instance.display.stage;
		*  The first display added becomes the primary display automatically.
		*  @property {Display} display
		*  @public 
		*/
		this.display = null;

		this._displays = {};

		//other initialization stuff too
		//if there are some specific properties on the options, use them to make a display
		//call init after handling loading up a versions file or any other needed asynchronous stuff?
		this._internalInit();
	};

	// Reference to the prototype
	var p = Application.prototype = Object.create(EventDispatcher.prototype);

	/**
	*  The collection of function references to call when initializing the application
	*  these are registered by external libraries that need to setup, destroyed
	*  for instance MediaLoader
	*  @property {Array} _globalInit
	*  @private
	*  @static
	*/
	Application._globalInit = [];

	/**
	*  The collection of function references to call when destroying the application
	*  these are registered by external libraries that need to setup, destroyed
	*  for instance MediaLoader
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
	_aspectRatio = 1,

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
		queryStringParameters: false,
		debug: false,
		minLogLevel: 0,
		ip: null,
		//default display properties
		canvasId: null,
		display: null,
		displayOptions: null
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
	*  @param {boolean} paused If the application is paused
	*/
	PAUSE = 'pause',

	/**
	*  Fired when the application becomes paused
	*  @event paused
	*/
	PAUSED = 'paused',

	/**
	*  Fired when the application resumes from a paused state
	*  @event paused
	*/
	RESUMED = 'resumed',

	/**
	*  Fired when the application is destroyed
	*  @event destroy
	*/
	DESTROY = 'destroy';

	/**
	*  Libraries would register global initialization functions when they are created, e.g.
	*  Application.registerInit(MediaLoader.init);
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
	*  Application.registerInit(MediaLoader.instance.destroy.bind(MediaLoader.instance));
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
		if(this.options.queryStringParameters)
			parseQueryStringParams(this.options);
		//set up default options
		for(var key in _defaultOptions)
		{
			if(!this.options.hasOwnProperty(key))
				this.options[key] = _defaultOptions[key];
		}

		// Call any global libraries to initialize
		for(var i = 0; i < Application._globalInit.length; ++i)
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
				_resizeElement = document.getElementById(framerate);
			else
				_resizeElement = framerate;
			this._resize = this._resize.bind(this);
			_resizeElement.addEventListener("resize", this._resize);
		}

		// Turn on debugging
		if (this.options.debug !== undefined)
			Debug.enabled = this.options.debug === true || this.options.debug === "true";
		
		if (this.options.minLogLevel !== undefined)
			Debug.minLogLevel = parseInt(this.options.minLogLevel, 10);

		//if we were supplied with an IP address, connect to it with the Debug class for logging
		if(typeof this.options.ip == "string")
			Debug.connect(this.options.ip);

		//set up the page visibility listener
		_pageVisibility = new cloudkid.PageVisibility(this._onVisible.bind(this), this._onHidden.bind(this));

		if(this.options.canvasId && this.options.display)
			this.addDisplay(this.options.canvasId, this.options.display, this.options.displayOptions);

		// Call the init function
		if (this.init) this.init();

		// Dispatch the init event
		this.trigger(INIT);

		//do an initial resize to make sure everything is sized properly
		this._resize();

		//start update loop
		this.paused = false;
	};

	/**
	*  Define all of the query string parameters
	*  @private
	*  @method parseQueryStringParams
	*  @param {object} output The object reference to update
	*/
	var parseQueryStringParams = function(output)
	{
		var href = window.location.search;
		if(!href)//empty string is false
			return output;
		var vars = href.substr(href.indexOf("?")+1);
		var pound = vars.indexOf('#');
		vars = pound < 0 ? vars : vars.substring(0, pound);
		var splitFlashVars = vars.split("&");
		var myVar;
		for (var i = 0; i < splitFlashVars.length; i++)
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
				_lastFPSUpdateTime = _lastFrameTime = cloudkid.FunctionUtils.now();
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
	*  Resize listener function, handles default resize behavior on all displays and dispatches a resize event
	*  @method _resize
	*  @private
	*/
	p._resize = function()
	{
		_resizeHelper.width = _resizeElement.innerWidth | 0;
		_resizeHelper.height = _resizeElement.innerHeight | 0;
		this.calculateDisplaySize(_resizeHelper);
		//round down, as canvases require integer sizes
		_resizeHelper.width |= 0;
		_resizeHelper.height |= 0;
		//resize the displays
		for(var key in _displays)
		{
			_displays[key].resize(_resizeHelper.width, _resizeHelper.height);
		}
		//send out the resize event
		this.trigger(RESIZE, _resizeHelper.width, _resizeHelper.height);
	};

	/**
	*  Calculates the resizing of displays. By default, this limits the new size 
	*  to the initial aspect ratio of the primary display. Override this function
	*  if you need variable aspect ratios.
	*  @method calculateDisplaySize
	*  @protected
	*  @param {Object} [size] A size object containing the width and height of the resized container.
	* 				The size parameter is also the output of the function, so the size properties are edited in place.
	*  @param {int} [size.w] The width of the resized container.
	*  @param {int} [size.h] The height of the resized container.
	*/
	p.calculateDisplaySize = function(size)
	{
		if(size.width / size.height < _aspectRatio)
		{
			//limit to the narrower width
			size.height = size.width / _aspectRatio;
		}
		else
		{
			//limit to the shorter height
			size.width = size.height * _aspectRatio;
		}
	};

	/**
	*  Add a display. If this is the first display added, then it will be stored as this.display.
	*  @method addDisplay
	*  @param {String} id The id of the canvas element, this will be used to grab the Display later
	*                also the Display should be the one to called document.getElementById(id)
	*                and not the application sinc we don't care about the DOMElement as this point            
	*  @param {function} displayConstructor The function to call to create the display instance
	*  @param {Object} [options] Optional Display specific options
	*  @return {Display} The created display.
	*/
	p.addDisplay = function(id, displayConstructor, options)
	{
		if(_displays[id])
		{
			if(true)
				Debug.error("A display already exists with the id of " + id);
			return;
		}
		var display = _displays[id] = new displayConstructor(id, options);
		if(!this.display)
		{
			this.display = display;
			_aspectRatio = display.width / display.height;
		}
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
	*  @return {Array} The collection of Display objects
	*/
	p.getDisplays = function()
	{
		var output = [];
		for(var key in _displays)
			output.push(_displays[key]);
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

		var now = cloudkid.FunctionUtils.now();
		var dTime = now - _lastFrameTime;
		
		// Only update the framerate every second
		if(_framerate)
		{
			_frameCount++;
			var elapsed = now - _lastFPSUpdateTime;
			if (elapsed > 1000)
			{
				var framerateValue = 1000 / elapsed * _frameCount;
				_framerate.innerHTML = "FPS: " + (Math.round(_framerateValue * 1000) / 1000);
				_lastFPSUpdateTime = now;
				_frameCount = 0;
			}
		}
		_lastFrameTime = now;

		//trigger the update event
		this.trigger(UPDATE, dTime);

		//then update all displays
		for(var key in _displays)
		{
			_displays[key].render(dTime);
		}

		//request the next tick
		//request the next animation frame
		_tickId = _useRAF ? 
			requestAnimFrame(_tickCallback) : 
			setTargetedTimeout(_tickCallback, cloudkid.FunctionUtils.now() - _lastFrameTime);
	};

	/**
	* Destroys the application, global libraries registered via Application.registerDestroy() and all active displays
	* @method destroy
	*/
	p.destroy = function()
	{
		this.paused = true;
		this.trigger(DESTROY);
		for(var key in _displays)
		{
			_displays[key].destroy();
		}
		_displays = null;
		for(var i = 0; i < Application._globalDestroy.length; ++i)
			Application._globalDestroy[i]();
		if(_resizeElement)
			_resizeElement.removeEventListener("resize", this._resize);
		_framerate = _resizeElement = null;
		_pageVisibility.destroy();
		_pageVisibility = null;
		this._listeners = null;
	};

	// Add to the name space
	namespace('cloudkid').Application = Application;

}());
/**
*  @module cloudkid
*/
(function(global, doc, undefined){
	
	"use strict";
	
	/**
	*  Handle the page visiblity change, if supported. Application uses one of these to
	*  monitor page visibility. It is suggested that you listen to "pause", "paused", 
	*  or "unpaused" events on the application instead of using one of these yourself.
	*  
	*  @class PageVisibility
	*  @constructor
	*  @param {function} onFocus Callback when the page becomes visible
	*  @param {function} onBlur Callback when the page loses visibility
	*/
	var PageVisibility = function(onFocus, onBlur)
	{
		this.initialize(onFocus, onBlur);
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
	
	/**
	* Callback when the page becomes visible
	* @property {function} _onFocus
	* @private
	*/
	p._onFocus = null;
	
	/**
	* Callback when the page loses visibility
	* @property {function} _onBlur
	* @private
	*/
	p._onBlur = null;
	
	/**
	* The visibility toggle function
	* @property {function} _onToggle
	* @private
	*/
	p._onToggle = null;
	
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
	*  Create new Page visibility
	*  
	*  @method initialize
	*  @param {function} onFocus The callback when the page comes into focus
	*  @param {function} onBlur The callback when the page loses focus
	*/
	p.initialize = function(onFocus, onBlur)
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		this._onBlur = onBlur;
		this._onFocus = onFocus;
		
		// The visibility toggle function
		var onVisibilityChange = function() 
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				onBlur();
			else 
				onFocus();
		};
		
		// Listen to visibility change
		// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
		doc.addEventListener(_visibilityChange, onVisibilityChange, false);
		
		// Listen for page events (when clicking the home button on iOS)
		global.addEventListener("pagehide", onBlur);
		global.addEventListener("pageshow", onFocus);
		global.addEventListener("blur", onBlur);
		global.addEventListener("focus", onFocus);
		global.addEventListener("visibilitychange", onVisibilityChange, false);
		
		this._onToggle = onVisibilityChange;
	};
	
	/**
	*  Disable the detection
	*  @method destroy
	*/
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		global.removeEventListener("pagehide", this._onBlur);
		global.removeEventListener("pageshow", this._onFocus);
		global.removeEventListener("blur", this._onBlur);
		global.removeEventListener("focus", this._onFocus);
		global.removeEventListener("visibilitychange", this._onToggle);
		
		doc.removeEventListener(_visibilityChange, this._onToggle, false);
		
		this._onFocus = null;
		this._onBlur = null;
	};
	
	// Assign to the global space
	namespace('cloudkid').PageVisibility = PageVisibility;
	
}(window, document));