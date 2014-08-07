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
		*  methods like raf, fps, don't haff any affect
		*  @property {Object} options
		*  @readOnly
		*/
		this.options = options;

		/**
		*  Primary renderer for the application, for accessing Application.instance.display.stage;
		*  The first display added becomes the primary display automatically.
		*  @property {Display} display
		*  @public 
		*/
		this.display = null;

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
	*  @property {Array} _globaInit
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
	_framerate = null,
	
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
	*  The calculated framerate
	*  @private
	*  @property {Number} _framerateValue
	*/
	_framerateValue = null,
	
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
	*  Rendering plugins, in a dictionary by canvas id
	*  @property {dictionary} _displays
	*  @private
	*/
	_displays = null,

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
		// Call any global libraries to initialize
		for(var i = 0; i < Application._globalInit.length; ++i)
		{
			Application._globalInit[i]();
		}

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
	*  Override this to do post constructor initialization
	*  @method init
	*  @protected
	*/
	p.init = null;

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
		}
	});

	/**
	*  Resize listener function, handles default resize behavior on all displays and dispatches a resize event
	*  @method _resize
	*  @private
	*/
	p._resize = function(){};

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
	p.calculateDisplaySize = function(size){};

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

	};

	/**
	*  Gets a specific renderer by the canvas id.
	*  @method getDisplay
	*  @param {String} id The id of the canvas
	*  @return {Display} The requested display.
	*/
	p.getDisplay = function(id)
	{

	};

	/**
	*  Gets a specific renderer by the canvas id.
	*  @method getDisplays
	*  @public
	*  @return {Array} The collection of Display objects
	*/
	p.getDisplays = function()
	{

	};

	/**
	* Removes and destroys a display
	* @method removeDisplay
	* @param {String} id The Display's id (also the canvas ID)
	*/
	p.removeDisplay = function(id)
	{

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
			_fps = value;
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

	//update functions replaced by event - eg Application.instance.on("update", this.update.bind(this))

	// Not here, but should be in the class - function that does 
	// math to use setTimeout at a targeted framerate (like the current OS)

	/**
	*  _tick would be bound in _tickCallback
	*  @method _tick
	*  @private
	*/
	p._tick = function()
	{
		//calculate framerate stuff
		//do update functions in _updateFunctions
		//then update all renderers
	};

	/**
	* Destroys the application, global libraries registered via Application.registerDestroy() and all active displays
	* @method destroy
	*/
	p.destroy = function()
	{

	};

	// Add to the name space
	namespace('cloudkid').Application = Application;

}());