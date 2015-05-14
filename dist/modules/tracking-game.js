/*! SpringRoll 0.2.2 */
/**
 * @module Tracking Game
 * @namespace springroll
 * @requires Core, Game, Sound, Captions, Tasks, Interface, Progress Tracker, Hinting
 */
(function()
{
	/**
	 * Class for filtering strings
	 * @constructor
	 * @class StringFilters
	 */
	var StringFilters = function() {};

	// Reference to prototype
	var p = StringFilters.prototype;

	/**
	 * Dictionary of filters
	 * @property {Array} _filters
	 * @private
	 */
	p._filters = [];

	/**
	 * Register a filter
	 * @method add
	 * @param {String|RegExp} replace The string or regex to replace
	 * @param {String} replacement String to repalce with
	 * @static
	 */
	p.add = function(replace, replacement)
	{
		if (!replace || (typeof replace != 'string' && replace instanceof RegExp === false))
		{
			if (true)
				throw 'replace value must be a valid String or RegExp';
			else
				throw 'invalide replace value';
		}
		if (typeof replacement != 'string')
		{
			if (true)
				throw 'replacement value must be astring';
			else
				throw 'invalid replacement value';
		}
		
		if (this._filters)
		{
			for (var i = this._filters.length - 1; i >= 0; i--)
			{
				if (replace.toString() == this._filters[i].replace.toString())
				{
					if (true)
						throw "Filter " + replace +
						" already exists in this._filters array.";
					else
						throw "Filter already exists.";
				}
			}
			this._filters.push(
			{
				replace: replace,
				replacement: replacement
			});
		}
	};

	/**
	 * Test a string against all registered filters
	 * @method filter
	 * @param {String} str The string to check
	 * @static
	 */
	p.filter = function(str)
	{
		if (!this._filters)
		{
			return str;
		}
		for (var i = this._filters.length - 1; i >= 0; i--)
		{
			var replace = this._filters[i].replace;
			var replacement = this._filters[i].replacement;
			str = str.replace(replace, replacement);
		}
		return str;
	};

	/**
	 * @method destroy
	 * @static
	 */
	p.destroy = function()
	{
		this._filters = null;
	};

	//Assign to namespace
	namespace('springroll').StringFilters = StringFilters;
}());
/**
 * @module Tracking Game
 * @namespace springroll
 * @requires Core, Game, Sound, Captions, Tasks, Interface, Progress Tracker, Hinting
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		StringFilters = include('springroll.StringFilters');

	/**
	 *  This class contains a bunch of media playing class
	 *  to provide convenience around using the Progress Tracker
	 *  @class TrackingGameMedia
	 *  @constructor
	 *  @param {springroll.TrackingGame} game Instance of the current game
	 */
	var TrackingGameMedia = function(game)
	{
		/**
		 * @param {springroll.StringFilters} filters
		 */
		this.filters = game.filters;
		/**
		 * @param {springroll.ProgressTracker} tracker
		 */
		this.tracker = game.tracker;
		/**
		 * @param {springroll.TrackingGameMedia} player
		 */
		this.player = game.player;
		/**
		 * @param {createjs.Display} display
		 */
		this.display = game.display;
	};

	//Reference to the prototype
	var p = TrackingGameMedia.prototype;

	/**
	 *  Plays animation or list of animations using springroll.Animator,
	 *  firing startMovie and endMovie or skipMovie ProgressTracker events.
	 *  @method playMovie
	 *  @param {MovieClip} instance The MovieClip to animate.
	 *  @param {String|Array|Object} events Event or list of events to animate. See
	 *                                     springroll.Animator.play() docs for details.
	 *   @param {Function} [onComplete]	VO/Animation Ended callback
	 *   @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                         If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                         If omited, no callback will be fired on interruption.
	 *  @return {springroll.AnimatorTimeline} AnimatorTimeline of the played animation.
	 */
	p.playMovie = function(instance, events, onComplete, onCancel)
	{
		if (!this.tracker)
		{
			if (true && Debug)
			{
				Debug.warn("ProgressTracker is not available and will not track Movie events");
			}
			return this.display.animator.play(instance, events, options);
		}

		return this.trackMoviePlay(
			instance,
			events,
			onComplete,
			onCancel,
			"movie"
		);
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startInstruction and endInstruction ProgressTracker events
	 *
	 *  Example Animator usage:
	 *  game.playInstruction(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playInstruction("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playInstruction
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                        If omited, no callback will be fired on interruption.
	 *    @return {springroll.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playInstruction = function(instance, events, onComplete, onCancel)
	{
		var tracker = this.tracker;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track Instruction events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}
			return this.trackMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"instruction"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;

			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track Instruction events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startInstruction,
				tracker.endInstruction,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startIncorrectFeedback and endIncorrectFeedback ProgressTracker events
	 *
	 *  Example Animator usage:
	 *  game.playIncorrectFeedback(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playIncorrectFeedback("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playIncorrectFeedback
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} events   If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                        If omited, no callback will be fired on interruption.
	 *  @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playIncorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var tracker = this.tracker;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track IncorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.trackMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"incorrect"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;

			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track IncorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startIncorrectFeedback,
				tracker.endIncorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startCorrectFeedback and endCorrectFeedback ProgressTracker events
	 *
	 *  Example Animator usage:
	 *  game.playCorrectFeedback(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playCorrectFeedback("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playCorrectFeedback
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'.
	 *                                        If omited, no callback will be fired on interruption.
	 *  @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playCorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var tracker = this.tracker,
			animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track CorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.trackMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"correct"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;

			if (!tracker)
			{
				if (true && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track CorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startCorrectFeedback,
				tracker.endCorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Generalized method for playing either feedback or instructions
	 *  @method trackVOPlay
	 *  @protected
	 *  @param {String|Array} alias    Alias or Array of aliases for VO lines to play
	 *  @param {Function} trackingStart The tracking to call while starting
	 *  @param {Function} trackingEnd The tracking call to call after finishing/canceling VO
	 *  @param {Function} [onComplete]    VO Ended callback
	 *  @param {Function} [onCancel] VO Cancelled (interrupted) callback
	 */
	p.trackVOPlay = function(alias, trackingStart, trackingEnd, onComplete, onCancel)
	{
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

		if (this._trackerAnimatorInstance)
		{
			animator.stop(this._trackerAnimatorInstance);
		}

		var captions = this.player.captions;

		//Callback function for ending or canceling the VO
		var callback = function(finish)
		{
			trackingEnd.call(this.tracker);
			if (finish) finish();
		};

		if (onCancel === true)
			onCancel = onComplete;

		//Play the audio
		this.player.play(
			alias,
			callback.bind(this, onComplete),
			callback.bind(this, onCancel)
		);

		//Track the start event
		trackingStart.call(
			this.tracker,
			captions.getFullCaption(alias),
			aliasToString(alias),
			"audio",
			captions.getLength(alias)
		);
	};

	/**
	 *  Handles tracking events for tracked Animator calls.
	 *  @method trackMoviePlay
	 *  @protected
	 *  @param {MovieClip} instance The MovieClip to animate.
	 *  @param {String|Array} events Event or list of events to animate. See
	 *                              springroll.Animator.play() docs for details.
	 *  @param {Object} options Additional options. See springroll.Animator.play() docs
	 *                          for details.
	 *  @param {String} trackerEvent ProgressTracker VO/animation event type
	 *                               ("movie", "instruction", "incorrect", or "correct").
	 *  @return {springroll.AnimatorTimeline} AnimatorTimeline of animation.
	 */
	p.trackMoviePlay = function(instance, events, onComplete, onCancel, trackerEvent)
	{
		//Localized instance of tracker
		var tracker = this.tracker;
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

		if (this._trackerAnimatorInstance)
		{
			animator.stop(this._trackerAnimatorInstance);
		}

		if (!Array.isArray(events))
		{
			events = [events];
		}

		var duration = 0; //Event "duration"
		var fullCaption = ""; //Event "description"
		var alias = ""; //Event "id"

		var captions = this.player.captions;
		var eventInfo, anim, audio, trackingEnd, trackingCancel;

		//Current loop iteration Caption and ID/alias
		var thisCaption, thisID;

		for (var i = 0, len = events.length; i < len; ++i)
		{
			eventInfo = events[i];
			thisID = null;
			thisCaption = null;

			switch (typeof eventInfo)
			{
				case "number":
					{
						duration += eventInfo;
						break;
					}
				case "string":
					{
						eventInfo = this.filters.filter(eventInfo);

						//we passed in a string - the audio alias should be assumed
						//to be the same as the animation alias
						duration += animator.getDuration(instance, eventInfo);
						thisID = eventInfo;

						//if no audio, will return event alias.
						thisCaption = captions.getFullCaption(eventInfo);

						//convert to Animator friendly format
						events[i] = {
							anim: eventInfo,
							audio: eventInfo
						};
						break;
					}
				case "object":
					{
						//we passed an object
						eventInfo.anim = anim = this.filters.filter(eventInfo.anim);

						if (eventInfo.audio)
						{
							if (typeof eventInfo.audio == 'object')
							{
								eventInfo.audio.alias =	audio = this.filters.filter(eventInfo.audio.alias);
							}
							else
							{
								eventInfo.audio = audio = this.filters.filter(eventInfo.audio);
							}
						}

						duration += animator.getDuration(instance, anim);

						//if no audio, use the anim label instead
						if (!audio)
						{
							audio = anim;
						}
						else if (typeof audio != "string")
						{
							audio = audio.alias;
						}
						thisCaption = captions.getFullCaption(audio);
						thisID = audio;
						break;
					}
			}

			if (thisID)
			{
				if (alias.length > 0)
				{
					alias += ",";
				}
				alias += thisID;
			}
			if (thisCaption)
			{
				if (fullCaption.length > 0)
				{
					fullCaption += " ";
				}
				fullCaption += thisCaption;
			}
		}

		duration = duration | 0; //make it an int

		switch (trackerEvent)
		{
			case "instruction":
				{
					tracker.startInstruction(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endInstruction.bind(tracker);
					break;
				}
			case "correct":
				{
					tracker.startCorrectFeedback(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endCorrectFeedback.bind(tracker);
					break;
				}
			case "incorrect":
				{
					tracker.startIncorrectFeedback(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endIncorrectFeedback.bind(tracker);
					break;
				}
			case "movie":
				{
					tracker.startMovie(alias, duration, fullCaption);
					trackingEnd = tracker.endMovie.bind(tracker);
					trackingCancel = tracker.skipMovie.bind(tracker);
					break;
				}
		}

		var callback = function(trackerCall, otherCall)
		{
			this._trackerAnimatorInstance = null;

			if (trackerCall) //tracker end event
			{
				trackerCall();
			}

			if (otherCall) //original callback
			{
				otherCall();
			}
		};

		//Setup callbacks
		var onCompleteCallback = callback.bind(this, trackingEnd, onComplete);
		var onCancelCallback = callback.bind(
			this,
			trackingCancel ? trackingCancel : trackingEnd,
			onCancel === true ? onComplete : onCancel
		);

		this._trackerAnimatorInstance = instance;
		return animator.play(instance, events, onCompleteCallback, onCancelCallback);
	};


	/**
	 *  Get an alias or group of aliases as a string
	 *  @method aliasToString
	 *  @private
	 *  @param {Array|String} alias The alias to convert
	 *  @return {String} The alias as string
	 */
	var aliasToString = function(alias)
	{
		if (Array.isArray(alias))
		{
			var output = "";
			for (var i = 0, len = alias.length; i < len; ++i)
			{
				if (typeof alias[i] == "string")
				{
					if (output.length > 0)
					{
						output += ",";
					}
					output += alias[i];
				}
			}
			return output;
		}
		else
		{
			return String(alias);
		}
	};

	/**
	 * Stops the currently playing animation or VO.
	 * @method stop
	 */
	p.stop = function()
	{
		if (this._trackerAnimatorInstance)
		{
			this.display.animator.stop(this._trackerAnimatorInstance);
		}
		else
		{
			this.player.stop();
		}
	};

	/**
	 * Whether or not VOPlayer or Animator are currently playing
	 * @method isPlaying
	 * @return {Boolean} Whether or not VOPlayer or Animator are currently playing
	 */
	p.isPlaying = function()
	{
		return this.player.playing || !!this._trackerAnimatorInstance;
	};

	/**
	 *  Destroy and don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.tracker = null;
		this.player = null;
	};

	//Assign to namespace
	namespace('springroll').TrackingGameMedia = TrackingGameMedia;
}());
/**
 * @module Tracking Game
 * @namespace springroll
 * @requires Core, Game, Sound, Captions, Tasks, Interface, Progress Tracker, Hinting
 */
(function()
{
	//Include game
	var Game = include('springroll.Game'),
		Debug = include('springroll.Debug', false),
		Captions = include('springroll.Captions'),
		Application = include('springroll.Application'),
		Sound = include('springroll.Sound'),
		Bellhop = include('Bellhop'),
		TaskManager = include('springroll.TaskManager'),
		LoadTask = include('springroll.LoadTask'),
		UIScaler = include('springroll.UIScaler'),
		TrackingGameMedia = include('springroll.TrackingGameMedia'),
		StringFilters = include('springroll.StringFilters'),
		PageVisibility = include('springroll.PageVisibility'),
		ProgressTracker,
		HintPlayer;

	/**
	 * The base game class
	 * @class TrackingGame
	 * @extends springroll.Game
	 * @constructor
	 * @param {Object} [options]
	 *	See SpringRoll's Game class options for the full list
	 * @param {String} [options.configPath='assets/config/config.json']
	 *	The path to the default config to load
	 * @param {String} [options.captionsPath='assets/config/captions.json']
	 *	The path to the captions dictionary. If this is set to null
	 *	captions will not be created or used by the VO player.
	 * @param {String} [options.captions='captions']
	 *	The id of the captions output DOM Element
	 * @param {String} [options.canvasId='stage']
	 *	The ID fo the DOM element to use as the main display
	 * @param {String} [options.resizeElement='frame']
	 *	The element to resize the display to
	 * @param {String} [options.framerate='framerate']
	 *	The DOM element id for the ouput framerate, the framerate
	 *	element is created dynamically in dev mode and is added
	 *	right before the main canvas element (options.canvasId).
	 * @param {Boolean} [options.singlePlay=false]
	 *	If the game should be played in single-play mode
	 * @param {Object} [options.playOptions]
	 *	The optional single-play mode gameplay options
	 */
	var TrackingGame = function(options)
	{
		HintPlayer = include('springroll.HintPlayer', false);
		ProgressTracker = include('springroll.ProgressTracker', false);

		options = options ||
		{};

		// The base options, these are overrideable by the
		// options above, but these are some better defaults
		var baseOptions = {
			captions: "captions",
			captionsPath: 'assets/config/captions.json',
			configPath: 'assets/config/config.json',
			debug: true,
			useQueryString: true,
			cacheBust: true,
			canvasId: "stage",
			resizeElement: "frame",
			singlePlay: false,
			playOptions: null
		};

		// Add the framerate object before the main display
		// in the markup
		if (true)
		{
			baseOptions.framerate = "framerate";
			var canvasId = options.canvasId || baseOptions.canvasId;
			var stage = document.getElementById(canvasId);
			if (stage)
			{
				var framerate = document.createElement("div");
				framerate.id = "framerate";
				framerate.innerHTML = "FPS: 00.000";
				stage.parentNode.insertBefore(framerate, stage);
			}
		}

		// Create the game with options
		Game.call(this, Object.merge(baseOptions, options));

		// Make sure we have a game name
		if (!this.name)
		{
			if (true)
			{
				throw "TrackingGame name is undefined, please add a Application option of 'name'";
			}
			else
			{
				throw "TrackingGame name is undefined";
			}
		}

		/**
		 * The progress tracker instance
		 * @property {springroll.ProgressTracker} tracker
		 */
		this.tracker = null;

		/**
		 * The StringFilters instance
		 * @property {springroll.StringFilters} filters
		 */
		this.filters = null;

		/**
		 * The main UIScaler for any display object references
		 * in the main game.
		 * @property {springroll.UIScaler} scaler
		 */
		this.scaler = null;

		/**
		 * The game configuration loaded from and external JSON file
		 * @property {Object} config
		 */
		this.config = null;

		/**
		 * For media conveninece methods
		 * @property {springroll.TrackingGameMedia} media
		 */
		this.media = null;

		/**
		 * The default play-mode for the game is continuous, if the game is
		 * running as part of a sequence is it considered in "single play" mode
		 * and the game will therefore close itself.
		 * @property {Boolean} singlePlay
		 * @readOnly
		 * @default false
		 */
		this.singlePlay = !!this.options.singlePlay;

		/**
		 * The optional play options to use if the game is played in "single play"
		 * mode. These options are passed from the game container to specify
		 * options that are used for this single play session. For instance,
		 * if you want the single play to focus on a certain level or curriculum
		 * such as `{ "shape": "square" }`
		 * @property {Object} playOptions
		 * @readOnly
		 */
		this.playOptions = this.options.playOptions || {};

		/**
		 * Send a message to let the site know that this has
		 * been loaded, if the site is there
		 * @property {Bellhop} messenger
		 */
		this.messenger = new Bellhop();
		this.messenger.connect();

		// Merge the container options with the current
		// game options
		if (this.messenger.supported)
		{
			var messenger = this.messenger;
			//Setup the messenger listeners for site soundMute and captionsMute events
			messenger.on(
			{
				soundMuted: onSoundMuted,
				captionsMuted: onCaptionsMuted,
				musicMuted: onContextMuted.bind(this, 'music'),
				voMuted: onContextMuted.bind(this, 'vo'),
				sfxMuted: onContextMuted.bind(this, 'sfx'),
				captionsStyles: onCaptionsStyles.bind(this),
				pause: onPause.bind(this),
				playOptions: onPlayOptions.bind(this),
				singlePlay: onSinglePlay.bind(this),
				close: onClose.bind(this)
			});

			// Turn off the page hide and show auto pausing the App
			this.autoPause = false;

			//handle detecting and sending blur/focus events
			this._pageVisibility = new PageVisibility(
				messenger.send.bind(messenger, 'gameFocus', true),
				messenger.send.bind(messenger, 'gameFocus', false)
			);
		}

		/**
		 * The hint player API
		 * @property {springroll.HintPlayer} hint
		 */
		this.hint = HintPlayer ? new HintPlayer(this) : null;

		if (true)
		{
			/**
			 * Debug key strokes
			 * → = trigger a skip to the next state for testing
			 * ← = trigger a skip to the previous state for testing
			 * TODO: add 'h' to test hinting
			 */
			window.onkeyup = function(e)
			{
				var key = e.keyCode ? e.keyCode : e.which;
				switch (key)
				{
					case 39: //right arrow
						if (Debug) Debug.info("Going to next state via keyboard");
						this.manager.next();
						break;
					case 37: //left arrow
						if (Debug) Debug.info("Going to previous state via keyboard");
						this.manager.previous();
						break;
				}
			}.bind(this);

			if (springroll.DebugOptions) springroll.DebugOptions.boolean('forceTouch', 'Force hasTouch to true');
		}

		this.filters = new StringFilters();
		this.filters.add(
			'%INTERACTION%',
			this.hasTouch ? '_touch' : '_mouse');

		//Add listener
		this.once('soundReady', onSoundReady.bind(this));
	};

	//Reference to the prototype
	var s = Game.prototype;
	var p = extend(TrackingGame, Game);

	/**
	 * The game has finished loading
	 * @event loaded
	 */
	var LOADED = 'loaded';

	/**
	 * The config has finished loading, in case you want to
	 * add additional tasks to the manager after this.
	 * @event configLoaded
	 * @param {Object} config The JSON object for config
	 * @param {TaskManager} manager The task manager
	 */
	var CONFIG_LOADED = 'configLoaded';

	/**
	 * The game has started loading
	 * @event loading
	 * @param {Array} tasks The list of tasks to preload
	 */
	var LOADING = 'loading';

	/**
	 * When the game is initialized
	 * @method onSoundReady
	 * @private
	 */
	var onSoundReady = function()
	{
		//Turn off the init until we're done preloading
		this._readyToInit = false;

		var tasks = [
			new LoadTask(
				'config',
				this.options.configPath,
				onConfigLoaded.bind(this)
			)
		];

		//Load the captions if it's set
		if (this.options.captionsPath)
		{
			tasks.push(
				new LoadTask(
					'captions',
					this.options.captionsPath,
					onCaptionsLoaded.bind(this)
				)
			);
		}

		//Allow extending game to add additional tasks
		this.trigger(LOADING, tasks);
		TaskManager.process(tasks, onTasksComplete.bind(this));
	};

	/**
	 * When the container pauses the game
	 * @method onPause
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPause = function(e)
	{
		this.paused = !!e.data;
		this.enabled = !this.paused;
	};

	/**
	 * Handler when a game enters single play mode
	 * @method onPlayOptions
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPlayOptions = function(e)
	{
		Object.merge(this.playOptions, e.data || {});
	};

	/**
	 * Handler when a game enters single play mode
	 * @method onSinglePlay
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onSinglePlay = function(e)
	{
		this.singlePlay = true;
	};

	/**
	 * When a game is in singlePlay mode it will end.
	 * It's unnecessary to check `if (this.singlePlay)` just
	 * call the method and it will end the game if it can.
	 * @method singlePlayEnd
	 */
	p.singlePlayEnd = function()
	{
		if (this.singlePlay)
		{
			this.endGame();
		}
	};

	/**
	 * Browser requests leaving the page
	 * @method onWindowClose
	 * @private
	 */
	var onWindowClose = function()
	{
		this.endGame('left_site');
		return undefined;
	};

	/**
	 * Game container requests closing the game
	 * @method onClose
	 * @private
	 */
	var onClose = function()
	{
		this.endGame('closed_container');
	};

	/**
	 * Callback when the captions are loaded
	 * @method onConfigLoaded
	 * @private
	 * @param {springroll.LoaderResult} result The Loader result from the load task
	 */
	var onCaptionsLoaded = function(result)
	{
		this.addCaptions(result.content);
	};

	/**
	 * Callback when the config is loaded
	 * @method onConfigLoaded
	 * @private
	 * @param {springroll.LoaderResult} result The Loader result from the load task
	 */
	var onConfigLoaded = function(result, task, manager)
	{
		var config = this.config = result.content;

		//initialize Sound and load up global sound config
		var sounds = config.sounds;
		if (sounds)
		{
			if (sounds.vo)
			{
				this.addSounds(sounds.vo);
			}
			if (sounds.sfx)
			{
				this.addSounds(sounds.sfx);
			}
			if (sounds.music)
			{
				this.addSounds(sounds.music);
			}
		}

		if (ProgressTracker && config.spec)
		{
			this.tracker = new ProgressTracker(
				this,
				config.spec,
				true,
				config.specDictionary || null
			);
			this.tracker.on('track', this.progressEvent.bind(this));
			window.onunload = window.onbeforeunload = onWindowClose.bind(this);
		}

		this.media = new TrackingGameMedia(this);

		this.trigger(CONFIG_LOADED, config, manager);
	};

	/**
	 * Callback when tasks are completed
	 * @method onTasksComplete
	 * @private
	 */
	var onTasksComplete = function()
	{
		//Intialize the state manager
		this.initStates();

		var config = this.config;
		var designed = config.designedSettings;

		if (!designed)
		{
			if (true)
			{
				throw "The config requires 'designedSettings' object which contains keys 'width' and 'height'";
			}
			else
			{
				throw "'designedSettings' required in config";
			}
		}

		if (!config.scaling)
		{
			if (true)
			{
				throw "The config requires 'scaling' object which contains all the state scaling items";
			}
			else
			{
				throw "'scaling' required in config";
			}
		}

		//Create the calling from the configuration
		//This will only scale items on the root of the stage
		this.scaler = new UIScaler(
			this,
			designed,
			config.scaling,
			true,
			this.display
		);

		this.messenger.send('loadDone');

		if (this.tracker)
		{
			this.tracker.startGame();
		}

		//Ready to initialize
		this._readyToInit = true;
		this.trigger(LOADED);
		this._doInit();
	};

	/**
	 * The captions style is being set
	 * @method onCaptionsStyles
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onCaptionsStyles = function(e)
	{
		var styles = e.data;
		var captions = this.captions ||
		{};
		var textField = captions.textField || null;

		// Make sure we have a text field and a DOM object
		if (textField && textField.nodeName)
		{
			textField.className = "size-" + styles.size + " " +
				"bg-" + styles.background + " " +
				"color-" + styles.color + " " +
				"edge-" + styles.edge + " " +
				"font-" + styles.font + " " +
				"align-" + styles.align;
		}
	};

	/**
	 * Handler when the sound is muted
	 * @method onSoundMuted
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onSoundMuted = function(e)
	{
		Sound.instance.muteAll = !!e.data;
	};

	/**
	 * Handler when the captions are muted
	 * @method onCaptionsMuted
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onCaptionsMuted = function(e)
	{
		Captions.muteAll = !!e.data;
	};

	/**
	 * Handler when the context is muted
	 * @method onContextMuted
	 * @private
	 * @param {String} context The name of the sound context
	 * @param {Event} e The bellhop event
	 */
	var onContextMuted = function(context, e)
	{
		Sound.instance.setContextMute(context, !!e.data);
	};

	/**
	 * Send a progress tracker event
	 * @method progressEvent
	 * @param {Object} eventData The data associated with an event
	 */
	p.progressEvent = function(eventData)
	{
		this.messenger.send('progressEvent', eventData);
	};

	/**
	 * Track a Google Analytics event
	 * @method trackEvent
	 * @param {String} action The action label
	 * @param {String} [label] The optional label for the event
	 * @param {Number} [value] The optional value for the event
	 */
	p.trackEvent = function(action, label, value)
	{
		this.messenger.send('trackEvent',
		{
			category: this.name,
			action: action,
			label: label,
			value: value
		});
	};

	/**
	 * For the tracker, we want to send consistent data when sending
	 * Position. This helper method will generate that data.
	 * In the future, we may return an object with known properties,
	 * but for now we are returning an object of {x:int, y:int,
	 * stage_width:int, stage_height:int} in unscaled numbers.
	 *
	 * @method normalizePosition
	 * @param {Number|createjs.Point} x The x position, or a point to use.
	 * @param {Number|createjs.DisplayObject} y The y position, or a
	 *	display object in which the position's coordinate space is in.
	 * @param {createjs.DisplayObject} [coordSpace] The coordinate space
	 *	the position is in, so it can be converted to global space.
	 * @return {Object} {x:int, y:int, stage_width:int, stage_height:int}
	 */
	p.normalizePosition = function(x, y, coordSpace)
	{
		if (x instanceof createjs.Point)
		{
			coordSpace = y;
			y = x.y;
			x = x.x;
		}
		//TODO: Support Pixi with this as well
		if (coordSpace && coordSpace.localToGlobal)
		{
			var globalPoint = coordSpace.localToGlobal(x, y);
			x = globalPoint.x;
			y = globalPoint.y;
		}

		var display = this.display;
		return {
			x: x | 0,
			y: y | 0,
			stage_width: display.width,
			stage_height: display.height
		};
	};

	/**
	 * Manually close the game, this can happen when playing through once
	 * @method endGame
	 * @param {String} [exitType='game_completed'] The type of exit
	 */
	p.endGame = function(exitType)
	{
		window.onunload = window.onbeforeunload = null; //prevent calling this function twice

		if (this.tracker) this.tracker.endGame(exitType || 'game_completed');
		this.destroy();
	};

	/**
	 * Destroy the game, don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		if (this.hint)
		{
			this.hint.destroy();
			this.hint = null;
		}

		if (this.scaler)
		{
			this.scaler.destroy();
			this.scaler = null;
		}

		if (this.media)
		{
			this.media.destroy();
			this.media = null;
		}

		if(this._pageVisibility)
		{
			this._pageVisibility.destroy();
			this._pageVisibility = null;
		}

		this.config = null;

		if (true)
		{
			// Remove the framerate container
			var framerate = document.getElementById(this.options.framerate);
			if (framerate && framerate.parentNode)
			{
				framerate.parentNode.removeChild(framerate);
			}
		}

		// Remove the captions
		var captions = document.getElementById(this.options.captions);
		if (captions && captions.parentNode)
		{
			captions.parentNode.removeChild(captions);
		}

		try
		{
			// Super destroy
			s.destroy.call(this);
		}
		catch (e)
		{
			if (Debug)
			{
				Debug.error(e.message);
				Debug.error(e.stack);
			}
			else
			{
				console.log(e.message, e.stack);
			}
		}

		// Destroy tracker after destroying the rest of the application
		// so that dwell timers can be removed
		if (this.tracker)
		{
			this.tracker.destroy();
			this.tracker = null;
		}

		// Send the end game event to the container
		this.messenger.send('endGame');
		this.messenger.destroy();
		this.messenger = null;
	};

	//Assign to namespace
	namespace('springroll').TrackingGame = TrackingGame;
}());