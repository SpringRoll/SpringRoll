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

		if (DEBUG)
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
				'<h2>Learning Dispatcher API  <span class="learning-version"></span></h2>' +
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

		//Add event to handle the internal timers
		updateTimers = updateTimers.bind(this);
		app.on('update', updateTimers);

		//Add a listeners for called
		this.on(CALLED, this._onCalled.bind(this));
	};

	/**
	 *  If the Learning Dispatcher should throw errors
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
			if (DEBUG)
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
					Debug.error(error.toString());
					Debug.error(error.stack);
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

					if (DEBUG)
					{
						this._tray.append(signature.docs());
					}
				}
				//Populate the tray with some information
				if (DEBUG)
				{
					$(".learning-version").text(spec.version);
					$(".learning-api").click(this._toggleRowCollapse.bind(this));
				}
			}
		}
	});

	if (DEBUG)
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

	if (RELEASE)
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
		this._track(api, feedback);
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
	 */
	p._track = function(api, input)
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
		if (this._round !== null)
		{
			data.round = this._round;
		}

		//Get the current game time since the start
		//this gets applyed to all events being sent
		data.game_time = this.gameTime();

		//Add the event code to the data
		data.event_code = parseInt(eventCode);

		if (DEBUG)
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

	if (DEBUG)
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

		if (DEBUG)
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