/*! SpringRoll 0.3.14 */
/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	 *  General errors when using the Learning Dispatcher
	 *  @class LearningError
	 *  @extends Error
	 *  @constructor
	 *  @param {string} message The error message
	 *  @param {int} eventCode The number of the event
	 */
	var LearningError = function(message)
	{
		var e = Error.call(this, message);

		/**
		 *  The error message
		 *  @property {string} message
		 */
		this.message = message;

		/**
		 *  The stack trace
		 *  @property {string} stack
		 */
		this.stack = e.stack;
	};

	//Extend the Error class
	var p = extend(LearningError, Error);

	//Assign the constructor
	p.constructor = LearningError;

	/**
	 *  To string override
	 *  @method toString
	 *  @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message;
	};

	//Assign to namespace
	namespace('springroll').LearningError = LearningError;

}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var LearningError = include('springroll.LearningError');

	/**
	 *  A map of all the event codes to the API method names
	 *  @class EventCatalog
	 */
	var EventCatalog = function()
	{
		/**
		 * The collection of all codes map to events
		 * @property {Object} events
		 */
		this.events = Object.merge({}, defaultEvents);
	};

	// Reference to the prototype
	var p = EventCatalog.prototype;

	/**
	 *  The map of event codes to method names
	 *  @property {Object} defaultEvents
	 *  @static
	 *  @private
	 *  @readOnly
	 */
	var defaultEvents = {
		"2000": "startGame",
		"2010": "endGame",
		"2020": "startRound",
		"2030": "endRound",
		"2040": "startLevel",
		"2050": "endLevel",
		"2060": "startTutorial",
		"2070": "endTutorial",
		"2075": "skipTutorial",
		"2080": "startMovie",
		"2081": "skipMovie",
		"2083": "endMovie",
		"3010": "startInstruction",
		"3110": "endInstruction",
		"3020": "startIncorrectFeedback",
		"3120": "endIncorrectFeedback",
		"3021": "startCorrectFeedback",
		"3121": "endCorrectFeedback",
		"4010": "selectLevel",
		"4020": "selectAnswer",
		"4030": "startDrag",
		"4035": "endDragOutside",
		"4070": "offClick",
		"4080": "dwellTime",
		"4090": "clickHelp",
		"4095": "clickReplay",
		"4100": "submitAnswer"
	};

	/**
	 *  The list of global argument names common to all events. This will
	 *  ignore any event spec arguments matching these names because
	 *  they are automatically submitted with event calls.
	 *  @property {Array} globals
	 *  @static
	 */
	EventCatalog.globals = [
		'game_time',
		'level',
		'round'
	];

	/**
	*  Look up an event code by API name
	*  @method loopkup
	*  @param {string} api The name of the API method
	*  @return {string} The matching event code
	*/
	p.lookup = function(api)
	{
		for (var eventCode in this.events)
		{
			if (api === this.events[eventCode])
			{
				return eventCode;
			}
		}
		return null;
	};

	/**
	*  Add additional apis
	*  @method add
	*  @param {object} map The map of event codes to API names
	*/
	p.add = function(map)
	{
		for (var eventCode in map)
		{
			if (this.events[eventCode] === undefined)
			{
				this.events[eventCode] = map[eventCode];
			}
			else
			{
				throw new LearningError("Cannot override the existing event code " + eventCode);
			}
		}
	};

	//Basic arguments for instructional and feedback events
	var feedbackArgs = [
		{
			"name": "description",
			"type": "string",
			"info": "The text or description of the instruction"
		},
		{
			"name": "identifier",
			"type": "string",
			"info": "A unique identifier for this piece of instruction"
		},
		{
			"name": "media_type",
			"type": ["audio", "animation", "other"],
			"info": "The type of media that has just played"
		},
		{
			"name": "total_duration",
			"type": "int",
			"info": "The estimated duration of the media playback in milliseconds (if it ran uninterrupted)"
		}
	];

	/**
	 *  The built-in argument overrides, provides consistent arguments
	 *  order for common API calls.
	 *  @property {Object} args
	 *  @static
	 *  @readOnly
	 */
	EventCatalog.args = {
		"3010": feedbackArgs,
		"3020": feedbackArgs,
		"3021": feedbackArgs,
		"2080": [
			{
				"name": "movie_id",
				"type": "string",
				"info": "The identifier for the movie that was playing"
			},
			{
				"name": "duration",
				"type": "int",
				"info": "The duration of the media playback in milliseconds"
			},
			{
				"name": "description",
				"type": "string",
				"info": "The text or description of the instruction"
			}
		]
	};

	/**
	*  Destroy this catalog, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.events = null;
	};

	//Assign to namespace
	namespace('springroll').EventCatalog = EventCatalog;

}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Import classes
	var EventCatalog = include('springroll.EventCatalog');

	/**
	 *  Define the signature of the api
	 *  @class EventSignature
	 *  @constructor
	 *  @param {string} api The name of the API
	 *  @param {array} [args] The list of arguments to be called
	 *  @param {string} [info] The info description of the API
	 */
	var EventSignature = function(eventCode, api, args, eventArgs, info)
	{
		/**
		 *  The event code
		 *  @property {string} eventCode
		 */
		this.eventCode = eventCode;

		/**
		 *  The name of the method
		 *  @property {string} api
		 */
		this.api = api;

		/**
		 *  The arguments to be called by the API
		 *  @property {array} args
		 */
		this.args = args || null;

		/**
		 *  The arguments required by the spec
		 *  @property {array} eventArgs
		 */
		this.eventArgs = eventArgs || null;

		/**
		 *  The API description
		 *  @property {string} info
		 */
		this.info = info || null;
	};

	//Reference to the prototype
	var p = EventSignature.prototype;

	/**
	 *  See if the event args or the api args has an property by name
	 *  @method hasProperty
	 *  @param {string}  property The name of the argument
	 *  @param {Boolean} [isEventArg=false] If we're checking on the event args, default
	 *         checks on the API arguments.
	 *  @return {Boolean} If the property is found
	 */
	p.hasProperty = function(property, isEventArg)
	{
		var args = !!isEventArg ? this.eventArgs : this.args;

		if (!args || !args.length)
		{
			return false;
		}
		for (var i = 0, len = args.length; i < len; i++)
		{
			if (property === args[i].name)
			{
				return true;
			}
		}
		return false;
	};

	if (true)
	{
		/**
		 *  Generate documentation, development build only!
		 *  @method docs
		 */
		p.docs = function()
		{
			var html = '<div class="learning-row collapsed" id="learning-api-' + this.api + '">' +
				'<div class="learning-api">' + this.api +
				'<span class="learning-event-code">' + this.eventCode + '</span>' +
				'<span class="learning-toggle"></span></div>';

			if (this.info)
			{
				html += '<div class="learning-api-info">' + this.info + '</div>';
			}
			html += this._argsDocs(this.args, EventCatalog.globals);
			html += '</div>';

			return html;
		};

		/**
		 *  Create the markup for the arguments
		 *  @method _argsDocs
		 *  @private
		 *  @param {array} args The list of arguments
		 *  @param {array} ignoreNames Ignore any name matching these collection of string
		 *  @return {string} The markup
		 */
		p._argsDocs = function(args, ignoreNames)
		{
			var html = "";

			if (args && args.length)
			{
				html += '<ul class="learning-api-args">';
				for (var i = 0, arg, type, len = args.length; i < len; i++)
				{
					arg = args[i];

					var argName = arg.name;
					//Don't document global arguments
					if (ignoreNames && ignoreNames.indexOf(argName) !== -1)
					{
						continue;
					}

					html += '<li class="learning-arg arg-' + argName + '">';
					html += '<span class="learning-arg-name">' + argName + '</span>';

					var argType = arg.type;
					type = Array.isArray(argType) ?
						JSON.stringify(argType) :
						argType;

					html += '<span class="learning-arg-type">' + type + '</span>';

					if (arg.optional)
					{
						html += '<span class="learning-arg-optional">(optional)</span>';
					}
					if (arg.info)
					{
						html += '<span class="learning-arg-info">' + arg.info + '</span>';
					}

					//Recursive arguments for objects which contain
					//additional arguments
					if (arg.args)
					{
						html += this._argsDocs(arg.args);
					}
					html += '</li>';
				}
				html += '</ul>';
			}
			return html;
		};
	}

	if (false)
	{
		//no documentation in release, but don't break public api
		p.docs = function()
		{
			return "";
		};
	}

	/**
	 *  Get the api signature of a method
	 *  @method _format
	 *  @private
	 *  @param {array} args The API arguments
	 *  @param {string} [indent="\t"] The indentation
	 *  @return {string} The signature api
	 */
	p._format = function(args, indent)
	{
		var api = "";
		indent = indent || "\t";
		if (args && args.length)
		{
			api += "\n";
			var arg;
			var len = args.length;
			for (var i = 0; i < len; i++)
			{
				arg = args[i];

				api += indent + arg.name + ":";
				var argType = arg.type;
				if (Array.isArray(argType))
				{
					api += "[" + argType.join(", ") + "]";
				}
				else
				{
					api += argType;
				}

				if (arg.args)
				{
					api += " {";
					api += this._format(arg.args, indent + "\t");
					api += "\n" + indent + "}";
				}

				if (i < len - 1)
				{
					api += ",";
				}
				api += "\n";
			}
		}
		return api;
	};

	/**
	 *  Get the string representation of the signature
	 *  @method toString
	 *  @return {string} The string version of the signature
	 */
	p.toString = function()
	{
		return this.api + " (" + this._format(this.args) + ")";
	};

	//Assign to namespace
	namespace('springroll').EventSignature = EventSignature;
}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Import class
	var LearningError = include('springroll.LearningError');

	/**
	 *  General errors when using the Learning Dispatcher
	 *  @class EventError
	 *  @extends springroll.LearningError
	 *  @constructor
	 *  @param {string} message The error message
	 *  @param {int} eventCode The number of the event
	 */
	var EventError = function(message, eventCode, api)
	{
		LearningError.call(this, message);

		/**
		 *  The name of the property erroring on
		 *  @property {int} eventCode
		 */
		this.eventCode = eventCode;

		/**
		 *  The name of the API method errored on
		 *  @property {string} api
		 */
		this.api = api;

		/**
		 *  The definition of the API and all it's arguments
		 *  @property {springroll.EventSignature} signature
		 */
		this.signature = null;
	};

	//Extend the Error class
	var p = extend(EventError, LearningError);

	//Assign the constructor
	p.constructor = EventError;

	/**
	 *  To string override
	 *  @method toString
	 *  @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message + " [eventCode: " + this.eventCode +
			", api: '" + this.api + "']";
	};

	//Assign to namespace
	namespace('springroll').EventError = EventError;
}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var EventError = include('springroll.EventError');

	/**
	 *  Error when validating value by Learning Dispatcher
	 *  @class ValidationError
	 *  @extends springroll.EventError
	 *  @constructor
	 *  @param {string} message The error message
	 *  @param {string} property The name of the property
	 */
	var ValidationError = function(message, property, value)
	{
		EventError.call(this, message, null, null);

		/**
		 *  The name of the property erroring on
		 *  @property {string} property
		 */
		this.property = property;

		/**
		 *  The supplied value, if any
		 *  @property {*} value
		 */
		this.value = value;
	};

	//Extend the Error class
	var p = ValidationError.prototype = Object.create(EventError.prototype);

	//Assign the constructor
	ValidationError.prototype.constructor = ValidationError;

	/**
	 *  To string override
	 *  @method toString
	 *  @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message + " [property: '" + this.property +
			"', value: '" + JSON.stringify(this.value) +
			"', eventCode: " + this.eventCode +
			", api: '" + this.api + "']";
	};

	//Assign to namespace
	namespace('springroll').ValidationError = ValidationError;
}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Import classes
	var ValidationError = include('springroll.ValidationError'),
		EventError = include('springroll.EventError'),
		EventCatalog = include('springroll.EventCatalog');

	/**
	 *  Utility class for handling events
	 *  @class EventUtils
	 *  @static
	 */
	var EventUtils = {};

	/**
	 *  Convert an array of input arguments into a data map
	 *  @method argsMap
	 *  @static
	 *  @param {Array} allArgs All the event arguments
	 *  @param {array} inputs The data to validate
	 *  @return {Object} The validated event data object
	 */
	EventUtils.argsMap = function(allArgs, inputs)
	{
		var i, arg, args = [],
			data = {};

		//Ignore the arguments we don't care about
		for (i = 0; i < allArgs.length; i++)
		{
			arg = allArgs[i];

			if (EventCatalog.globals.indexOf(arg.name) === -1)
			{
				args.push(arg);
			}
		}

		if (args.length != inputs.length)
		{
			throw new EventError("Arguments length doesn't match the API, expected " +
				args.length + " but got " + inputs.length);
		}

		for (i = 0; i < args.length; i++)
		{
			arg = args[i];
			data[arg.name] = inputs.shift();
		}
		return data;
	};

	/**
	 *  Validate arguments
	 *  @method validate
	 *  @static
	 *  @param {Array} args The event arguments
	 *  @param {object} inputs The data to validate
	 *  @return {Object} The validated event data object
	 */
	EventUtils.validate = function(args, inputs)
	{
		var arg, input, data = {};

		for (var i = 0, len = args.length; i < len; i++)
		{
			arg = args[i];

			//We don't care about these arguments
			if (EventCatalog.globals.indexOf(arg.name) !== -1)
			{
				continue;
			}
			arg = args[i];
			input = inputs[arg.name];

			if (input === undefined)
			{
				throw new EventError("No value found for argument '" + arg.name + "'");
			}
			validateValue(arg.type, input, arg.args || null, arg.name);
			data[arg.name] = input;
		}
		return data;
	};

	/**
	 *  Do the actual type validation on a specific value
	 *  @method _validate
	 *  @private
	 *  @constructor
	 *  @param {string|Array} type The type of value, if an array a set of valid items
	 *  @param {*} value The value to test against
	 *  @param {array} args The list of properties to validate if a typed object
	 */
	var validateValue = function(type, value, args, parent)
	{
		//Check for empty values
		if (value === undefined || value === null)
		{
			throw new ValidationError("Supplied value is empty", parent, value);
		}

		//wildcard don't validate
		if (type === "*") return;

		//validate vanilla strings, ints and numbers
		if ((type === "string" && typeof value !== type) ||
			(type === "int" && parseInt(value) !== value) ||
			(type === "number" && parseFloat(value) !== value) ||
			(type === "array" && !Array.isArray(value)) ||
			(type === "boolean" && typeof value !== type) ||
			(type === "object" && typeof value !== type))
		{
			throw new ValidationError("Not a valid " + type, parent, value);
		}

		var i, len;

		//Can check for typed arrays, such as an array
		//filled with only ints, strings or numbers
		if (/^array\-\>(int|boolean|string|number|array|object)$/.test(type))
		{
			if (!Array.isArray(value))
			{
				throw new ValidationError(
					"Not a valid " + type,
					parent,
					value
				);
			}

			//Validate each argument on the array
			var arrayType = type.replace("array->", "");
			for (i = 0, len = value.length; i < len; i++)
			{
				try
				{
					validateValue(arrayType, value[i], args, parent);
				}
				catch (e)
				{
					throw new ValidationError(
						"Invalid " + type + " at index " + i,
						parent,
						value
					);
				}
			}
		}

		//Validate set items
		if (Array.isArray(type) && type.indexOf(value) === -1)
		{
			throw new ValidationError(
				"Value is not valid in set",
				parent,
				value
			);
		}

		//Validate properties of an object
		if (type === "object" && !!args)
		{
			len = args.length;
			for (i = 0; i < len; i++)
			{
				var prop = args[i];
				validateValue(
					prop.type,
					value[prop.name],
					prop.args,
					parent + "." + prop.name
				);
			}
		}
	};

	//Assign to namespace
	namespace('springroll').EventUtils = EventUtils;
}());

/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function($, undefined)
{
	//The event dispatcher
	var Application = include('springroll.Application'),
		Debug = include('springroll.Debug', false),
		EventCatalog = include('springroll.EventCatalog'),
		EventDispatcher = include('springroll.EventDispatcher'),
		EventError = include('springroll.EventError'),
		EventSignature = include('springroll.EventSignature'),
		EventUtils = include('springroll.EventUtils'),
		LearningError = include('springroll.LearningError'),
		SavedData = include('springroll.SavedData'),
		ValidationError = include('springroll.ValidationError');

	/**
	 *  The base game class
	 *  @class Learning
	 *  @extends springroll.EventDispatcher
	 *  @constructor
	 *  @param {springroll.Application} app The application reference
	 *  @param {boolean} [showTray=false] Show the documentation at init or false (dev build only!)
	 */
	var Learning = function(app, showTray)
	{
		EventDispatcher.call(this);

		/**
		 *  Create a new instance of the event catalog
		 *  @property {springroll.EventCatalog} catalog
		 */
		this.catalog = new EventCatalog();

		if (true)
		{
			if ($ === undefined)
			{
				this._handleError('jQuery is required for debug mode');
				return;
			}

			/**
			 *  The documentation dom element, development build only!
			 *  @property {Element} _tray
			 *  @private
			 */
			this._tray = $('<div class="learning-tray">' +
				'<h2>Learning API <span class="learning-version"></span></h2>' +
				'</div>');

			/**
			 *  The toggle handle dom element, development build only!
			 *  @property {Element} _handle
			 *  @private
			 */
			this._handle = $('<button class="learning-handle"></button>');

			// Match the last position of the PT tray.
			// ie Start with the tray open ('learning-tray-show') when reloading
			// or returning to the game.
			var defaultTrayPosition = SavedData.read('learning-tray-show') ?
				'learning-tray-show' :
				'learning-tray-hide';
			
			/**
			 *  The body dom element, development build only!
			 *  @property {Element} _body
			 *  @private
			 */
			this._body = $("body").append(this._tray, this._handle)
				.addClass(defaultTrayPosition);

			this._handle.click(this.toggleDocs.bind(this));

			this.showTray = !!showTray;
		}

		/**
		 *  The collection of timers
		 *  @property {object} _timers
		 *  @private
		 */
		this._timers = {};

		//Add the spec, can be added later
		this.spec = null;

		/**
		 *  The reference to the application
		 *  @property {springroll.Application} _app
		 *  @private
		 */
		this._app = app;

		/**
		 *  The saved feedback or instructions
		 *  @property {Object} _feedback
		 *  @private
		 */
		this._feedback = null;

		/**
		 *  The saved data for movie events
		 *  @property {Object} _movie
		 *  @private
		 */
		this._movie = null;

		/**
		 *  The collection of api methods called
		 *  @property {array} _history
		 *  @private
		 */
		this._history = [];

		/**
		 *  The current level number if support, null if unsupported
		 *  @property {int} _round
		 *  @private
		 *  @default null
		 */
		this._level = null;

		/**
		 *  The current round number if support, null if unsupported
		 *  @property {int} _round
		 *  @private
		 *  @default null
		 */
		this._round = null;

		/**
		 * Keep track of the round a feedback event was started on
		 * the ending event should dispatch the same round.
		 * @property {int} _feedbackStartRound
		 * @private
		 * @default null
		 */
		this._feedbackStartRound = null;

		//Add event to handle the internal timers
		updateTimers = updateTimers.bind(this);
		app.on('update', updateTimers);

		//Add a listeners for called
		this.on(CALLED, this._onCalled.bind(this));
	};

	/**
	 *  If the Learning should throw errors
	 *  @property {Boolean} throwErrors
	 *  @static
	 */
	Learning.throwErrors = false;

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = extend(Learning, EventDispatcher);

	/**
	 *  An event is tracked
	 *  @event learningEvent
	 *  @param {object} data The event data
	 *  @param {string} data.game_id The unique game id
	 *  @param {string} data.event_id The unique event id
	 *  @param {object} data.event_data The data attached to event
	 *  @param {int} data.event_data.event_code The code of the event
	 */
	var EVENT = 'learningEvent';

	/**
	 *  An api method was called, this happens before any validation
	 *  @event called
	 *  @param {string} api The name of the api method called
	 */
	var CALLED = 'called';

	/**
	 *  Handle errors
	 *  @method _handleError
	 *  @private
	 *  @param {Error} error The error to handle
	 *  @return {[type]}       [description]
	 */
	p._handleError = function(error)
	{
		try
		{
			if (typeof error === "string")
			{
				error = new LearningError(error);
			}
			throw error;
		}
		catch (e)
		{
			if (true)
			{
				if (e instanceof ValidationError)
				{
					this._showError(e.message, e.api, e.property);
				}
				else if (e instanceof EventError)
				{
					this._showError(e.message, e.api);
				}
				if (Debug)
				{
					Debug.error(error);
				}
			}
			if (Learning.throwErrors)
			{
				throw e;
			}
		}
	};

	/**
	 *  The map of API event name overrides
	 *  @method addMap
	 *  @param {object} eventDictionary The collection of game-specific APIs, this is a map
	 *         of the eventCode to the name of the API method
	 */
	p.addMap = function(eventDictionary)
	{
		if (eventDictionary)
		{
			try
			{
				this.catalog.add(eventDictionary);
			}
			catch (e)
			{
				this._handleError(e);
			}
		}
	};

	/**
	 *  The tracking specification
	 *  @property {object} spec
	 *  @property {string} spec.gameId
	 *  @property {int} spec.version
	 *  @property {array} spec.events
	 */
	Object.defineProperty(p, "spec",
	{
		get: function()
		{
			return this._spec;
		},
		set: function(spec)
		{
			this._spec = spec;

			if (spec)
			{
				var api, args, eventData, eventCode;
				for (eventCode in spec.events)
				{
					api = this.catalog.events[eventCode];

					if (!api)
					{
						api = 'event' + eventCode;
						this.catalog.events[eventCode] = api;
					}

					eventData = spec.events[eventCode];

					//Create the dynamic API method based on the
					//arguments found in the spec event data
					if (this[api] === undefined)
					{
						this[api] = this._specTrack.bind(this, api);
						args = eventData.args;
					}
					//Allow for a staticly defined override
					else
					{
						args = EventCatalog.args[eventCode];
					}

					//Create a new signature for the api call
					var signature = new EventSignature(
						eventCode,
						api,
						args,
						eventData.args,
						eventData.info
					);

					this[api].signature = signature;

					if (true)
					{
						this._tray.append(signature.docs());
					}
				}
				//Populate the tray with some information
				if (true)
				{
					$(".learning-version").text(spec.version);
					$(".learning-api").click(this._toggleRowCollapse.bind(this));
				}
			}
		}
	});

	if (true)
	{
		/**
		 *  When clicking on a method name
		 *  @method _toggleRowCollapse
		 *  @private
		 *  @param {event} e The click event
		 */
		p._toggleRowCollapse = function(e)
		{
			$(e.currentTarget).parent().toggleClass('collapsed');
		};

		/**
		 *  Toogle the display of the documentation
		 *  @method toggleDocs
		 */
		p.toggleDocs = function()
		{
			var show = !this._body.hasClass('learning-tray-show');
			this._body.removeClass('learning-tray-show learning-tray-hide')
				.addClass(show ? 'learning-tray-show' : 'learning-tray-hide');

			//remember the position of the tray for this session
			SavedData.write('learning-tray-show', show);

			this._app.triggerResize();
		};

		/**
		 *  Show the documentation panel, development build only!
		 *  @property {boolean} showTray
		 */
		Object.defineProperty(p, 'showTray',
		{
			set: function(show)
			{
				this._tray.hide();
				if (show)
				{
					this._tray.show();
				}
			}
		});
	}

	if (false)
	{
		//Set-up public methods for release build
		//so that the API stays consistent
		p.toggleDocs = function()
		{
			this._handleError("toggleDocs only available in dev build");
		};

		Object.defineProperty(p, 'showTray',
		{
			set: function(show)
			{
				this._handleError("showTray setter only available in dev build");
			}
		});
	}

	/**
	 *  Convenience function for measuring the duration which is common
	 *  for many events. These timers respect the application being paused
	 *  and should be use instead of implementing Date.now() or some other
	 *  Date-based method.
	 *  @method startTimer
	 *  @param {string} alias A unique alias for this timer
	 */
	p.startTimer = function(alias)
	{
		if (this._timers[alias] !== undefined)
		{
			this._handleError("Timer exists matching '" + alias + "', call stopTimer first");
			return;
		}
		this._timers[alias] = 0;
	};

	/**
	 *  Check the current progress of a timer, this will not destory the timer
	 *  @method pollTimer
	 *  @param {string} alias The unique alias for this timer
	 *  @return {int} The timer in milliseconds
	 */
	p.pollTimer = function(alias)
	{
		if (this._timers[alias] === undefined)
		{
			this._handleError("Timer doesn't exist matching '" + alias + "'");
			return;
		}
		return this._timers[alias] | 0;
	};

	/**
	 *  Get the amount of time since the start of the game
	 *  @method gameTime
	 *  @return {int} The time since the beginning of the game in milliseconds
	 */
	p.gameTime = function()
	{
		return this.pollTimer('_game');
	};

	/**
	 *  Stop a timer and get the final duration to send with an event. This
	 *  will clean-up and discard the timer and it can't be used again.
	 *  @method stopTimer
	 *  @param {string} alias The unique alias for this timer
	 *  @return {int} The timer in milliseconds
	 */
	p.stopTimer = function(alias)
	{
		var duration = this.pollTimer(alias);
		this.removeTimer(alias);
		return duration;
	};

	/**
	 *  This will clean-up and discard the timer and it can't be used again.
	 *  @method removeTimer
	 *  @param {string} alias The unique alias for this timer
	 */
	p.removeTimer = function(alias)
	{
		if (this._timers[alias] !== undefined)
		{
			delete this._timers[alias];
		}
	};

	/**
	 *  Handle the frame update
	 *  @method updateTimers
	 *  @private
	 *  @param {int} elapsed The number of milliseconds since the last update
	 */
	var updateTimers = function(elapsed)
	{
		for (var alias in this._timers)
		{
			this._timers[alias] += elapsed;
		}
	};

	/**
	 *  Override for start game event
	 *  @method startGame
	 */
	p.startGame = function()
	{
		var sign = this.startGame.signature;

		//make sure signature exists
		if (!sign)
		{
			this._handleError("startGame: signature is undefined");
			return;
		}

		//Initialize the round
		if (sign.hasProperty('round', true))
		{
			this._round = 0;
		}

		//Initialize the level
		if (sign.hasProperty('level', true))
		{
			this._level = 0;
		}

		//Reset the history on start game
		this._history.length = 0;
		this._history.push('startGame');

		this.startTimer('_game');
		this._track('startGame',
		{
			version: this._spec.version
		});
	};

	/**
	 *  Override for the end game event
	 *  @method endGame
	 *  @param {string} [exitType] The exit type for certain games
	 */
	p.endGame = function(exitType)
	{
		var sessionDuration = this.gameTime();
		var signature = this.endGame.signature;

		if (exitType && signature.hasProperty('exit_type', true))
		{
			this._track('endGame',
			{
				session_duration: sessionDuration,
				exit_type: exitType
			});
		}
		else
		{
			this._track('endGame',
			{
				session_duration: sessionDuration
			});
		}

		//Reset the history on start game
		this._history.length = 0;
	};

	/**
	 *  Basic method for starting a feedback or instruction
	 *  @method _startFeedback
	 *  @private
	 *  @param {string} api     The event method to call
	 *  @param {string} description   Description of the instruction
	 *  @param {string} identifier    A unique identifier
	 *  @param {string} mediaType     Either audio animation or other
	 *  @param {int} totalDuration The estimated time of instruction in milliseconds
	 */
	p._startFeedback = function(api, description, identifier, mediaType, totalDuration)
	{
		if (this._feedback)
		{
			this._handleError("Feedback or instruction already started, stop it first");
			return;
		}
		var feedback = {
			media_type: mediaType,
			description: description,
			identifier: identifier,
			total_duration: totalDuration
		};
		this._feedbackStartRound = this._round;
		this._track(api, feedback);
		this.startTimer('_feedback');
		this._feedback = feedback;
	};

	/**
	 *  Basic method for starting a feedback or instruction
	 *  @method _startFeedback
	 *  @private
	 *  @param {string} api The event method to call
	 */
	p._endFeedback = function(api)
	{
		var feedback = this._feedback;
		if (!feedback)
		{
			this._handleError("Feedback or instruction not found, start it first");
			return;
		}
		delete feedback.total_duration;
		feedback.duration = this.stopTimer('_feedback');
		this._feedback = null;
		this._track(api, feedback, this._feedbackStartRound);
		this._feedbackStartRound = null;
	};

	/**
	 *  Start the system initiated instruction
	 *  @method startInstruction
	 *  @param {string} description The text description of the instruction
	 *  @param {string} identifier A unique identifier for this peice of instruction
	 *  @param {string} mediaType The type of media, audio animation or other
	 *  @param {int} total_duration The estimated duration of the media in milliseconds
	 */
	p.startInstruction = function(description, identifier, mediaType, totalDuration)
	{
		this._startFeedback('startInstruction', description, identifier, mediaType, totalDuration);
	};

	/**
	 *  End the system initiated instruction
	 *  @method endInstruction
	 */
	p.endInstruction = function()
	{
		if (!this.requires || !this.requires('startInstruction')) return;
		this._endFeedback('endInstruction');
	};

	/**
	 *  Start the incorrect feedback
	 *  @method startIncorrectFeedback
	 *  @param {string} description The text description of the instruction
	 *  @param {string} identifier A unique identifier for this peice of instruction
	 *  @param {string} mediaType The type of media, audio animation or other
	 *  @param {int} total_duration The estimated duration of the media in milliseconds
	 */
	p.startIncorrectFeedback = function(description, identifier, mediaType, totalDuration)
	{
		this._startFeedback('startIncorrectFeedback', description, identifier, mediaType, totalDuration);
	};

	/**
	 *  End the incorrect feedback
	 *  @method endIncorrectFeedback
	 */
	p.endIncorrectFeedback = function()
	{
		if (!this.requires || !this.requires('startIncorrectFeedback')) return;
		this._endFeedback('endIncorrectFeedback');
	};

	/**
	 *  Start the correct feedback event
	 *  @method startCorrectFeedback
	 *  @param {string} description The text description of the instruction
	 *  @param {string} identifier A unique identifier for this peice of instruction
	 *  @param {string} mediaType The type of media, audio animation or other
	 *  @param {int} total_duration The estimated duration of the media in milliseconds
	 */
	p.startCorrectFeedback = function(description, identifier, mediaType, totalDuration)
	{
		this._startFeedback(
			'startCorrectFeedback',
			description,
			identifier,
			mediaType,
			totalDuration
		);
	};

	/**
	 *  End the correct feedback event
	 *  @method endCorrectFeedback
	 */
	p.endCorrectFeedback = function()
	{
		if (!this.requires || !this.requires('startCorrectFeedback')) return;
		this._endFeedback('endCorrectFeedback');
	};

	/**
	 *  The movie started
	 *  @method startMovie
	 *  @param {string} movieId The identifier for the movie that's playing
	 *  @param {int} duration  The duration of the media playback in milliseconds
	 *  @param {string} description The text or description of the instruction
	 */
	p.startMovie = function(movieId, duration, description)
	{
		if (this._movie)
		{
			this._handleError("Movie is already started called skipMovie or endMovie first");
			return;
		}
		this._movie = {
			movie_id: movieId,
			duration: duration,
			description: description
		};
		this.startTimer('_movie');
		this._track('startMovie', this._movie);
	};

	/**
	 *  The user decided to skip the movie playback by clicking a skip button
	 *  @method skipMovie
	 */
	p.skipMovie = function()
	{
		if (!this.requires || !this.requires('startMovie')) return;

		var movie = this._movie;
		if (!movie)
		{
			this._handleError("No movie started, call startMovie first");
			return;
		}
		movie.time_played = this.stopTimer('_movie');
		this._movie = null;
		this._track('skipMovie', movie);
	};

	/**
	 *  The movie ended
	 *  @method endMovie
	 */
	p.endMovie = function()
	{
		if (!this.requires || !this.requires('startMovie')) return;

		var data = this._movie;
		if (!data)
		{
			this._handleError("No movie started, call startMovie first");
			return;
		}
		this.removeTimer('_movie');
		var movie = this._movie;
		this._movie = null;
		this._track('endMovie', movie);
	};

	/**
	 *  Handler when an api is called
	 *  @method _onCalled
	 *  @private
	 *  @param {string} api The name of the API method called
	 */
	p._onCalled = function(api)
	{
		if (api === 'startRound' && this._round !== null)
		{
			this._round++;
		}
		else if (api === 'startLevel' && this._level !== null)
		{
			this._level++;
		}
	};

	/**
	 *  Generic method to track an event based on the spec, the arguments
	 *  mirror the arguments in the event spec.
	 *  @method _specTrack
	 *  @private
	 *  @param {string} api The name of the api
	 *  @param {*} [...extraArgs] The Additional arguments
	 */
	p._specTrack = function(api)
	{
		var signature = this[api].signature,
			data = null;

		try
		{
			data = EventUtils.argsMap(
				signature.args,
				Array.prototype.slice.call(arguments, 1)
			);
		}
		catch (error)
		{
			if (error instanceof EventError)
			{
				error.api = api;
				error.eventCode = this.catalog.lookup(api);
				error.signature = signature;
			}
			this._handleError(error);
			return;
		}

		//Now we have a formatted data object, pass to the track method
		this._track(api, data);
	};
	
	/**
	 *  Generic method to track an event based on the spec, the arguments
	 *  mirror the arguments in the event spec.
	 *  @method _track
	 *  @private
	 *  @param {string} api The name of the api
	 *  @param {object} [input] The collection of argument values
	 *  @param {int} [round] The explicit round to add the track event for
	 */
	p._track = function(api, input, round)
	{
		if (!this.requires || !this.requires('startGame')) return;

		var eventCode = this.catalog.lookup(api),
			eventData = this._spec.events[eventCode],
			signature = this[api].signature,
			data = null;

		//Check that the event code is valid on this spec
		if (eventData === undefined)
		{
			this._handleError(new EventError("Supplied event code is invalid", eventCode, api));
			return;
		}

		try
		{
			//Validate the specification arguments against the input
			data = EventUtils.validate(
				signature.eventArgs,
				input
			);
		}
		catch (error)
		{
			if (error instanceof EventError)
			{
				error.api = api;
				error.eventCode = eventCode;
				error.signature = signature;
			}
			this._handleError(error);
			return;
		}

		//Trigger the called event, validation checked out
		this.trigger(CALLED, api);

		//If we're using the concept of levels, add it
		if (this._level !== null)
		{
			data.level = this._level;
		}

		//If we're using the concept of rounds, add it
		if (round !== undefined && round !== null)
		{
			data.round = round;
		}
		else if (this._round !== null)
		{
			data.round = this._round;
		}

		//Get the current game time since the start
		//this gets applyed to all events being sent
		data.game_time = this.gameTime();

		//Add the event code to the data
		data.event_code = parseInt(eventCode);

		if (true)
		{
			$("#learning-api-" + api).addClass('success');
		}

		//Key track of the tracking history
		//so we can do a history check
		//using requires
		this._history.push(api);

		//Trigger an event where the event is the API
		//and the parameter is the event data
		this.trigger(api, data);

		//Dispatch the tracking event here
		this.trigger(
			EVENT,
			{
				game_id: this._spec.gameId,
				event_id: eventData.id,
				event_data: data
			}
		);
	};

	if (true)
	{
		/**
		 *  Display an error in the tray
		 *  @method _showError
		 *  @private
		 *  @param {string} message The message to log
		 *  @param {string} api      The name of the api
		 *  @param {string} [property] Optional property
		 */
		p._showError = function(message, api, property)
		{
			var container = $("#learning-api-" + api)
				.addClass('error')
				.removeClass('collapsed');

			message = '<span class="learning-api-alert">' + message + '</span>';

			// Add the erroring to the property specifically
			if (property)
			{
				container.find(".arg-" + property)
					.addClass('error')
					.prepend(message);
			}
			// Add the error message to the container
			else
			{
				container.find('.learning-api').after(message);
			}
		};
	}

	/**
	 *  Require that an api has been called
	 *  @method requires
	 *  @param {String} api The names of the method or API call
	 *  @return {Boolean} If the api was called before
	 */
	p.requires = function(api)
	{
		if (this._history.indexOf(api) === -1)
		{
			this._handleError("Learning API '" + api + "' needs to be called first");
			return false;
		}
		return true;
	};

	/**
	 *  Don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		if (this._app)
		{
			this._app.off('update', updateTimers);
		}

		if (this.catalog)
		{
			this.catalog.destroy();
			this.catalog = null;
		}

		this.off(CALLED);

		if (true)
		{
			this._body.removeClass('learning-tray-show learning-tray-hide');
			this._handle.remove();
			this._tray.remove();
			this._handle = null;
			this._tray = null;
			this._body = null;
		}
		this._app = null;
		this._timers = null;
		this._spec = null;
		this._history = null;
		this._movie = null;
		this._feedback = null;

		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').Learning = Learning;

}(window.jQuery));
/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Point,
	 	Learning = include('springroll.Learning');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(10);

	// Init the animator
	plugin.setup = function()
	{		
		/**
		 *  An learning event is dispatched
		 *  @event learningEvent
		 *  @param {object} data The event data
		 *  @param {string} data.game_id The unique game id
		 *  @param {string} data.event_id The unique event id
		 *  @param {object} data.event_data The data attached to event
		 *  @param {int} data.event_data.event_code The code of the event
		 */

		/**
		 * The Learning Dispatcher instance
		 * @property {springroll.Learning} learning
		 */
		this.learning = new Learning(this, true);

		// Listen for the config setup and add the spec
		this.once('configLoaded', function(config)
		{
			if (config.spec)
			{
				this.learning.addMap(config.specDictionary || null);
				this.learning.spec = config.spec;
			}
		});
		// Bubble up the learning event
		this.learning.on('learningEvent', function(data)
		{
			this.trigger('learningEvent', data);
		}
		.bind(this));

		// Handle the end game event
		this.once('endGame', function(exitType)
		{
			this.learning.endGame(exitType);
		});

		// Start the game on game loaded
		this.once('init', function()
		{
			this.learning.startGame();
		});
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.learning)
		{
			this.learning.destroy();
			this.learning = null;
		}
	};

}());