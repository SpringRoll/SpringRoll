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

		_displays = {};
		_tickCallback = this._tick.bind(this);

		//other initialization stuff too
		//if there are some specific properties on the options, use them to make a display
		//call init after handling loading up a versions file or any other needed asynchronous stuff?
		this._internalInit();
	};

	// Reference to the prototype
	var p = Application.prototype = Object.create(cloudkid.EventDispatcher.prototype);

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

		var versionsLoaded = function()
		{
			// Call the init function
			if (this.init) this.init();

			// Dispatch the init event
			this.trigger(INIT);

			//do an initial resize to make sure everything is sized properly
			this._resize();

			//start update loop
			this.paused = false;
		}.bind(this);

		// Check to see if we should load a versions file
		// The versions file keeps track of file versions to avoid cache issues
		if (this.options.versionsFile !== undefined)
		{
			// Try to load the default versions file
			// callback should be made with a scope in mind
			cloudkid.MediaLoader.instance.cacheManager.addVersionsFile(
				this.options.versionsFile, 
				versionsLoaded
			);
		}
		else
		{
			versionsLoaded();
		}
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
			if (DEBUG)
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
		if(!_resizeElement) return;

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
			if(DEBUG)
				Debug.error("A display already exists with the id of " + id);
			return;
		}
		var display = _displays[id] = new displayConstructor(id, options);
		if(!this.display)
		{
			this.display = display;
			_aspectRatio = display.width / display.height;
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
				_framerate.innerHTML = "FPS: " + (Math.round(framerateValue * 1000) / 1000);
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
		_tickCallback = null;
	};

	// Add to the name space
	namespace('cloudkid').Application = Application;

}());