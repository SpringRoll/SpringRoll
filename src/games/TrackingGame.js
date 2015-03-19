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
	 * @param {object} [options]
	 *	See SpringRoll's Game class options for the full list
	 * @param {string} [options.configPath='assets/config/config.json']
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
	 * @param {object} [options.playOptions]
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
			debug: DEBUG,
			parseQueryString: DEBUG,
			cacheBust: DEBUG,
			canvasId: "stage",
			resizeElement: "frame",
			singlePlay: false,
			playOptions: null
		};

		// Add the framerate object before the main display
		// in the markup
		if (DEBUG)
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
			if (DEBUG)
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
		 * @property {object} config
		 */
		this.config = null;

		/**
		 * For media conveninece methods
		 * @property {springroll.TrackerMedia} media
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
		this.playOptions = this.options.playOptions ||
		{};

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

		if (DEBUG)
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
	 * @param {object} config The JSON object for config
	 * @param {TaskManager} manager The task manager
	 */
	var CONFIG_LOADED = 'configLoaded';

	/**
	 * The game has started loading
	 * @event loading
	 * @param {array} tasks The list of tasks to preload
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
	 * @method onSinglePlay
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onSinglePlay = function(e)
	{
		Object.merge(this.playOptions, e.data ||
		{});
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
				DEBUG,
				config.specDictionary || null
			);
			this.tracker.on('track', this.progressEvent.bind(this));
			window.onbeforeunload = onWindowClose.bind(this);
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
			if (DEBUG)
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
			if (DEBUG)
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
	 * @param {string} context The name of the sound context
	 * @param {Event} e The bellhop event
	 */
	var onContextMuted = function(context, e)
	{
		Sound.instance.setContextMute(context, !!e.data);
	};

	/**
	 * Send a progress tracker event
	 * @method progressEvent
	 * @param {object} eventData The data associated with an event
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
	 * @param {string} [exitType='game_completed'] The type of exit
	 */
	p.endGame = function(exitType)
	{
		window.onbeforeunload = null; //prevent calling this function twice

		this.tracker.endGame(exitType || 'game_completed');
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

		if (DEBUG)
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