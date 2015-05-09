/**
 *  @module Core
 *  @namespace springroll
 */
(function(undefined)
{
	// classes to import
	var TimeUtils = include('springroll.TimeUtils'),
		async = include('springroll.async'),
		EventDispatcher = include('springroll.EventDispatcher'),
		ApplicationOptions = include('springroll.ApplicationOptions');

	/**
	*  Creates a new application, for example (HappyCamel extends Application)
	*  manages displays, update loop controlling, handles resizing
	*
	*	var app = new Application({fps:60, resizeElement:window});
	*
	*  @class Application
	*  @extend EventDispatcher
	*  @constructor
	*  @param {Object} [options] The options for creating the application, 
	* 		see `springroll.ApplicationOptions` for the specific options
	*		that can be overridden and set. 
	*/
	var Application = function(options)
	{
		if (_instance)
		{
			throw "Only one Application can be opened at a time";
		}
		_instance = this;

		EventDispatcher.call(this);

		/**
		 *  Initialization options/query string parameters, these properties are read-only
		 *  Application properties like raf, fps, don't have any affect on the options object.
		 *  @property {springroll.ApplicationOptions} options
		 *  @readOnly
		 */
		this.options = new ApplicationOptions(this, options);

		/**
		 *  Primary renderer for the application, for simply accessing
		 *  Application.instance.display.stage;
		 *  The first display added becomes the primary display automatically.
		 *  @property {Display} display
		 *  @public
		 */
		this.display = null;

		// Reset the displays
		_displays = {};

		// Add the _tick bind
		_tickCallback = this._tick.bind(this);

		// Call any global libraries to initialize
		Application._plugins.forEach(function(plugin)
		{
			plugin.setup.call(_instance);
		});

		// Options are initialized after plugins
		// so plugins can define their own options
		this.options.init();

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {String} name
		*  @default ""
		*/
		this.name = this.options.name;

		//other initialization stuff too
		//if there are some specific properties on the options, use them to make a display
		//call init after handling loading up a versions file or any other needed asynchronous
		//stuff?
		setTimeout(this._preInit.bind(this), 0);
	};

	// Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = extend(Application, EventDispatcher);

	/**
	 *  The collection of function references to call when initializing the application
	 *  these are registered by external modules.
	 *  @property {Array} _plugins
	 *  @private
	 *  @static
	 */
	Application._plugins = [];

	/**
	 *  The number of ms since the last frame update
	 *  @private
	 *  @property {int} _lastFrameTime
	 */
	var _lastFrameTime = 0,

	/**
	 *	The bound callback for listening to tick events
	 *	@private
	 *   @property {Function} _tickCallback
	 */
	_tickCallback = null,

	/**
	 *  If the current application is paused
	 *  @private
	 *  @property {Boolean} _paused
	 */
	_paused = false,

	/**
	 *  If the current application is enabled
	 *  @private
	 *  @property {Boolean} _enabled
	 */
	_enabled = true,

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
	*  The maximum width of the primary display, compared to the original height.
	*  @property {Number} _maxWidth
	*  @private
	*/
	_maxWidth = 0,
	
	/**
	*  The maximum height of the primary display, compared to the original width.
	*  @property {Number} _maxHeight
	*  @private
	*/
	_maxHeight = 0,
	
	/**
	*  The original width of the primary display, used to calculate the aspect ratio.
	*  @property {int} _originalWidth
	*  @private
	*/
	_originalWidth = 0,
	
	/**
	*  The original height of the primary display, used to calculate the aspect ratio.
	*  @property {int} _originalHeight
	*  @private
	*/
	_originalHeight = 0,

	/**
	 *  The aspect ratio of the primary display, as width / height.
	 *  @property {Number} _aspectRatio
	 *  @private
	 */
	_aspectRatio = 0,

	/**
	 *  Rendering plugins, in a dictionary by canvas id
	 *  @property {dictionary} _displays
	 *  @private
	 */
	_displays = null,

	/**
	 *  A helper object to avoid object creation each resize event.
	 *  @property {Object} _resizeHelper
	 *  @private
	 */
	_resizeHelper = {
		width: 0,
		height: 0
	};

	/**
	 *  Fired when initialization of the application is ready
	 *  @event init
	 */
	
	/**
	 *  Fired when initialization of the application is done
	 *  @event afterInit
	 */
	
	/**
	 *  Fired when before initialization of the application
	 *  @event beforeInit
	 */
	
	/**
	 *  Fired when an update is called, every frame update
	 *  @event update
	 *  @param {int} elasped The number of milliseconds since the last frame update
	 */

	/**
	 *  Fired when a resize is called
	 *  @event resize
	 *  @param {int} width The width of the resize element
	 *  @param {int} height The height of the resize element
	 */

	/**
	 *  Fired when the pause state is toggled
	 *  @event pause
	 *  @param {boolean} paused If the application is now paused
	 */

	/**
	 *  Fired when the application becomes paused
	 *  @event paused
	 */

	/**
	 *  Fired when the application resumes from a paused state
	 *  @event resumed
	 */

	/**
	 *  Fired when the application is destroyed
	 *  @event destroy
	 */

	/**
	 *  Get the singleton instance of the application
	 *  @property {Application} instance
	 *  @static
	 *  @public
	 */
	var _instance = null;
	Object.defineProperty(Application, "instance",
	{
		get: function()
		{
			return _instance;
		}
	});

	/**
	 *  The internal initialization
	 *  @method _preInit
	 *  @private
	 */
	p._preInit = function()
	{
		if (this.destroyed) return;

		var options = this.options;

		_useRAF = options.raf;
		options.on('raf', function(value)
		{
			_useRAF = value;
		});

		options.on('fps', function(value)
		{
			if (typeof value != "number") return;
			_msPerFrame = (1000 / value) | 0;
		}); 

		if (options.resizeElement)
		{
			_resizeElement = options.resizeElement;
			this.triggerResize = this.triggerResize.bind(this);
			window.addEventListener("resize", this.triggerResize);
		}
		
		//set up setters/getters in options for certain properties
		_maxWidth = options.maxWidth;
		options.on('maxWidth', function(value)
		{
			_maxWidth = value;
		});

		_maxHeight = options.maxHeight;
		options.on('maxHeight', function(value)
		{
			_maxHeight = value;
		});
		
		//add the initial display if specified
		if (options.canvasId && options.display)
		{
			this.addDisplay(
				options.canvasId, 
				options.display,
				options.displayOptions
			);
		}

		var tasks = [];

		// Add the plugin ready functions to the list
		// of async tasks to start-up
		Application._plugins.forEach(function(plugin)
		{
			if (plugin.preload)
			{
				tasks.push(plugin.preload.bind(_instance));
			}
		});

		// Run the asyncronous tasks
		async.waterfall(tasks, this._doInit.bind(this));
	};

	/**
	 *  Initialize the application
	 *  @method _doInit
	 *  @protected
	 */
	p._doInit = function(err)
	{
		if (this.destroyed) return;

		// Error with the async startup
		if (err) throw err;

		//do an initial resize to make sure everything is sized properly
		this.triggerResize();

		//start update loop
		this.paused = false;

		this.trigger('beforeInit');
	
		// Dispatch the init event
		this.trigger('init');

		// Call the init function
		if (this.init) this.init();

		this.trigger('afterInit');
	};

	/**
	 *  Override this to do post constructor initialization
	 *  @method init
	 *  @protected
	 */
	p.init = null;

	/**
	 *  Enables at the application level which enables
	 *  and disables all the displays.
	 *  @property {Boolean} enabled
	 *  @default true
	 */
	Object.defineProperty(p, "enabled",
	{
		set: function(enabled)
		{
			_enabled = enabled;
			this.getDisplays(function(display)
			{
				display.enabled = enabled;
			});
		},
		get: function()
		{
			return _enabled;
		}
	});

	/**
	 *  Pause updates at the application level
	 *  @property {Boolean} paused
	 */
	Object.defineProperty(p, "paused",
	{
		get: function()
		{
			return _paused;
		},
		set: function(value)
		{
			_paused = !!value;
			this.trigger('pause', _paused);
			this.trigger(_paused ? 'paused' : 'resumed', _paused);

			if (_paused)
			{
				if (_tickId != -1)
				{
					if (_useRAF)
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
				if (_tickId == -1)
				{
					_tickId = _useRAF ?
						requestAnimFrame(_tickCallback) :
						setTargetedTimeout(_tickCallback);
				}
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
		if (timeInFrame)
			timeToCall = Math.max(0, _msPerFrame - timeInFrame);
		return setTimeout(callback, timeToCall);
	};

	/**
	 *  Fire a resize event with the current width and height of the display
	 *  @method triggerResize
	 */
	p.triggerResize = function()
	{
		if (!_resizeElement) return;

		// window uses innerWidth, DOM elements clientWidth
		_resizeHelper.width = (_resizeElement.innerWidth || _resizeElement.clientWidth) | 0;
		_resizeHelper.height = (_resizeElement.innerHeight || _resizeElement.clientHeight) | 0;

		this.calculateDisplaySize(_resizeHelper);

		// round up, as canvases require integer sizes
		// and canvas should be slightly larger to avoid
		// a hairline around outside of the canvas
		_resizeHelper.width = Math.ceil(_resizeHelper.width);
		_resizeHelper.height = Math.ceil(_resizeHelper.height);

		//resize the displays
		var key;
		for (key in _displays)
		{
			_displays[key].resize(_resizeHelper.width, _resizeHelper.height);
		}
		//send out the resize event
		this.trigger('resize', _resizeHelper.width, _resizeHelper.height);

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
		if (!_originalHeight || !this.options.uniformResize) return;

		var maxAspectRatio = _maxWidth / _originalHeight,
			minAspectRatio = _originalWidth / _maxHeight,
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
		if (_displays[id])
		{
			throw "Display exists with id '" + id + "'";
		}
		var display = _displays[id] = new displayConstructor(id, options);
		if (!this.display)
		{
			this.display = display;
			_originalWidth = display.width;
			_originalHeight = display.height;
			if(!_maxWidth)
				_maxWidth = _originalWidth;
			if(!_maxHeight)
				_maxHeight = _originalHeight;
		}
		// Inherit the enabled state from the application
		display.enabled = _enabled;
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
		if (display)
		{
			display.destroy();
			delete _displays[id];
		}
	};

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
		var elapsed = now - _lastFrameTime;
		_lastFrameTime = now;

		//trigger the update event
		this.trigger('update', elapsed);

		//then update all displays
		for (var key in _displays)
		{
			_displays[key].render(elapsed);
		}

		//request the next tick
		//request the next animation frame
		_tickId = _useRAF ?
			requestAnimFrame(_tickCallback) :
			setTargetedTimeout(_tickCallback, TimeUtils.now() - _lastFrameTime);
	};

	/**
	 * Destroys the application and all active displays and plugins
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.paused = true;
		this.trigger('destroy');

		for (var key in _displays)
		{
			_displays[key].destroy();
		}
		_displays = null;

		// Destroy in the reverse priority order
		var plugins = Application._plugins.slice().reverse();

		plugins.forEach(function(plugin)
		{
			plugin.teardown.call(_instance);
		});

		if (_resizeElement)
		{
			window.removeEventListener("resize", this.triggerResize);
		}

		_instance =
		_tickCallback =
		_resizeElement = null;

		this.display = null;
		this.options.destroy();
		this.options = null;

		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {String} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[Application name='" + this.name + "']";
	};

	// Add to the name space
	namespace('springroll').Application = Application;

}());