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
	*	var app = new Application();
	*
	*  @class Application
	*  @extend springroll.EventDispatcher
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
		_displaysMap = {};
		_displays = [];

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

	/**
	 * The current version of the library
	 * @property {String} version
	 * @static
	 * @readOnly
	 */
	Application.version = VERSION;

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
	 *  The collection of displays
	 *  @property {Array} _displays
	 *  @private
	 */
	_displays = null,

	/**
	 *  The displays by canvas id
	 *  @property {Object} _displaysMap
	 *  @private
	 */
	_displaysMap = null;


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
	 *  Fired when the pause state is toggled
	 *  @event pause
	 *  @param {boolean} paused If the application is now paused
	 */

	/**
	 *  When a display is added.
	 *  @event displayAdded
	 *  @param {springroll.AbstractDisplay} [display] The current display being added
	 */
	
	/**
	 *  When a display is removed.
	 *  @event displayRemoved
	 *  @param {string} [displayId] The display alias
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

		this.trigger('beforeInit');

		//start update loop
		this.paused = false;
	
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
			_displays.forEach(function(display)
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
				if (_tickId == -1 && _tickCallback)
				{
					_lastFrameTime = TimeUtils.now();
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
		if (_displaysMap[id])
		{
			throw "Display exists with id '" + id + "'";
		}
		// Creat the display
		var display = new displayConstructor(id, options);

		// Add it to the collections
		_displaysMap[id] = display;
		_displays.push(display);
		
		// Inherit the enabled state from the application
		display.enabled = _enabled;

		if (!this.display)
		{
			this.display = display;
		}
		this.trigger('displayAdded', display);
		return display;
	};

	/**
	 *  Get all the displays
	 *  @property {Array} displays
	 *  @readOnly
	 */
	Object.defineProperty(p, 'displays',
	{
		get: function()
		{
			return _displays;
		}
	});

	/**
	 *  Gets a specific renderer by the canvas id.
	 *  @method getDisplay
	 *  @param {String} id The id of the canvas
	 *  @return {Display} The requested display.
	 */
	p.getDisplay = function(id)
	{
		return _displaysMap[id];
	};

	/**
	 *  Gets a specific renderer by the canvas id.
	 *  @method getDisplays
	 *  @deprecated Use the displays property on the application instead.
	 *  @public
	 *  @param {function} [each] Optional looping method, callback takes a single parameter of the
	 *                           display
	 *  @return {Array} The collection of Display objects
	 */
	p.getDisplays = function(each)
	{
		if (typeof each == "function")
		{
			_displays.forEach(each);
		}
		return _displays;
	};

	/**
	 * Removes and destroys a display
	 * @method removeDisplay
	 * @param {String} id The Display's id (also the canvas ID)
	 */
	p.removeDisplay = function(id)
	{
		var display = _displaysMap[id];
		if (display)
		{
			_displays.splice(_displays.indexOf(display), 1);
			display.destroy();
			delete _displaysMap[id];
			this.trigger('displayRemoved', id);
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
		//displays may be null if a tick happens while we are in the process of destroying
		if (_displays)
		{
			for (var i = 0; i < _displays.length; i++)
			{
				_displays[i].render(elapsed);
			}
		}

		//request the next tick
		//request the next animation frame
		if (_tickCallback)
		{
			_tickId = _useRAF ?
				requestAnimFrame(_tickCallback) :
				setTargetedTimeout(_tickCallback, TimeUtils.now() - _lastFrameTime);
		}
	};

	/**
	 * Destroys the application and all active displays and plugins
	 * @method destroy
	 */
	p.destroy = function()
	{
		// Only destroy the application once
		if (this.destroyed) return;

		this.paused = true;
		this.trigger('destroy');

		// Destroy in the reverse priority order
		var plugins = Application._plugins.slice().reverse();

		plugins.forEach(function(plugin)
		{
			plugin.teardown.call(_instance);
		});

		_displays.forEach(function(display)
		{
			display.destroy();
		});
		_displays = null;
		_displaysMap = null;

		_instance =
		_tickCallback = null;

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