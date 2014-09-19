/*! CloudKidFramework 0.0.6 */
!function(){"use strict";/**
*  @module Game
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
	Object.defineProperty(Array.prototype, 'shuffle', {
		enumerable: false,
		writable:false, 
		value: function() {
			for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
			return this;
		}
	});

	/**
	*  Get a random item from an array
	*  @method random
	*  @static
	*  @param {Array} array The array
	*  @return {*} The random item
	*/
	Object.defineProperty(Array.prototype, 'random', {
		enumerable: false,
		writable: false,
		value: function() {
			return this[Math.floor(Math.random() * this.length)];
		}
	});
}());

/**
*  @module Game
*/
(function(Math){

	/**
	*  Add methods to Math
	*  @class Math
	*/

	/**
	 * Return a random int between minimum and maximum
	 * @method dist
	 * @static
	 * @param {Int} min lowest number
	 * @param {Int} max highest number
	 * @return {int} The random value
	 */
	Math.getRandomInt = function(min, max)
	{
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
/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){

	//Library depencencies
	var Application = include('cloudkid.Application'),
		LoadTask,
		TaskManager;

	/**
	*  A game extends the main application and provides some game specific convenience function 
	*  and additional events. Most importantly it provides preload functionalty though the state
	*  manager. Assume loading a single configuration JSON file.
	*  @example
		var game = new cloudkid.Game();
		game.on('loaded', function(){
			// Ready to use!
		});
	*  @class Game
	*  @extends Application
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*/
	var Game = function(options)
	{
		LoadTask = include('cloudkid.LoadTask');
		TaskManager = include('cloudkid.TaskManager');

		// Override the updateTween Application default
		if (options.updateTween === undefined)
		{
			options.updateTween = true;
		}

		Application.call(this, options);

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {string} name
		*  @default "Untitled"
		*/
		this.name = options.name || "Untitled";

		/**
		*  The game configuration loaded from and external JSON file
		*  @property {object} config
		*/
		this.config = null;

		/**
		*  If the current brower is mobile
		*  @property {boolean} isMobile
		*/
		if (true && options.forceMobile !== undefined)
		{
			this.isMobile = !!options.forceMobile;
		}
		else
		{
			// Auto detect the mobile browser
			// normally we'd use touch but the pointer events
			// in Internet Explorer mess that up, so we're 
			// looking for specific browser.
			var agent = navigator.userAgent;
			this.isIOS = agent.search(/iPhone|iPad|iPod/) > -1;
			this.isMobile = this.isIOS || agent.search(/Android|Blackberry/) > -1;
		}

		// Listen for when the application is initalized
		onInit = onInit.bind(this);
		this.on('init', onInit);
	};

	// Extend application
	var s = Application.prototype;
	var p = Game.prototype = Object.create(s);

	/**
	*  The game has finished loading
	*  @event loaded
	*/
	var LOADED = 'loaded';

	/**
	*  The config has finished loading, in case you want to 
	*  add additional tasks to the manager after this.
	*  @event configLoaded
	*  @param {object} config The JSON object for config
	*  @param {TaskManager} manager The task manager
	*/
	var CONFIG_LOADED = 'configLoaded';

	/**
	*  The game has started loading
	*  @event loading
	*  @param {array} tasks The list of tasks to preload
	*/
	var LOADING = 'loading';

	/**
	*  Callback when the sound has been initialized
	*  @method onSoundReady
	*  @private
	*/
	var onInit = function()
	{
		this.off('init', onInit);
		
		var tasks = [
			new LoadTask(
				"config", 
				this.options.configPath || "assets/config/config.json", 
				onConfigLoaded.bind(this)
			)
		];

		// Allow extending game to add additional tasks
		this.trigger(LOADING, tasks);

		TaskManager.process(tasks, onTasksComplete.bind(this));
	};

	/**
	 *  Callback when the config is loaded
	 *  @param {LoaderResult} result The Loader result from the load task
	 */
	var onConfigLoaded = function(result, task, manager)
	{
		this.config = result.content;
		this.trigger(CONFIG_LOADED, this.config, manager);
	};

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onTasksComplete = function()
	{
		this.trigger(LOADED);
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.config = null;

		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[Game name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('cloudkid').Game = Game;

}());
/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){

	//Library depencencies
	var Game = include('cloudkid.Game'),
		VOPlayer,
		Captions,
		Sound;

	/**
	*  A sub-application for Game which setups Sound, VOPlayer and Captions.
	*  @example
		var game = new cloudkid.SoundGame();
		game.on('soundReady', function(){
			// Ready to use!
		});
	*  @class SoundGame
	*  @extends Game
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
	*  @param {boolean} [options.mute=false] Set the initial mute state of the all the audio (unminifed library version only)
	*/
	var SoundGame = function(options)
	{
		Sound = include('cloudkid.Sound');
		VOPlayer = include('cloudkid.VOPlayer');
		Captions = include('cloudkid.Captions', false);

		Game.call(this, options);

		/**
		*  The current music alias playing
		*  @property {string} _music
		*  @private
		*/
		this._music = null;

		/**
		*  The global player for playing voice over
		*  @property {VOPlayer} player
		*/
		this.player = null;

		// Listen for the game is loaded then initalize the sound
		onLoaded = onLoaded.bind(this);
		onLoading = onLoading.bind(this);

		this.on({
			loaded : onLoaded,
			loading : onLoading
		});
	};

	// Extend application
	var s = Game.prototype;
	var p = SoundGame.prototype = Object.create(s);

	/**
	*  The Sound is completed, this is the event to listen to 
	*  when the game ready to use. Do NOT use Application's init,
	*  or Game's loaded events as the entry point for your application.
	*  @event soundReady
	*/
	var SOUND_READY = 'soundReady';

	/**
	*  Callback when preload as been finished
	*  @method onLoading
	*  @private
	*  @param {Array} tasks The collection of tasks
	*/
	var onLoading = function(tasks)
	{
		if (this.options.captionsPath !== null)
		{
			tasks.push(new LoadTask(
				'captions',
				this.options.captionsPath || "assets/config/captions.json",
				onCaptionsLoaded.bind(this)
			));
		}
		else
		{
			onCaptionsLoaded();
		}
	};

	/**
	*  Callback when the captions have been loaded
	*  @method onCaptionsLoaded
	*  @private
	*  @param {LoaderResult} result The loader result
	*/
	var onCaptionsLoaded = function(result)
	{
		var captions = null;

		// Add to the captions
		if (result)
		{
			captions = new Captions(result.content);
		}

		this.player = new VOPlayer(captions);
	};

	/**
	*  Callback when preload as been finished
	*  @method onLoaded
	*  @private
	*/
	var onLoaded = function()
	{
		// Initialize the sound
		Sound.init({
			swfPath : this.options.swfPath,
			ready : onSoundReady.bind(this)
		});
	};

	/**
	*  Callback when the sound has been initialized
	*  @method onSoundReady
	*  @private
	*/
	var onSoundReady = function()
	{
		var sounds = this.config.sounds;
		var sound = Sound.instance;

		//initialize Sound and load up global sound config
		if (sounds)
		{
			if (sounds.vo) sound.loadConfig(sounds.vo);
			if (sounds.sfx) sound.loadConfig(sounds.sfx);
			if (sounds.music) sound.loadConfig(sounds.music);
		}

		if (true)
		{
			// For testing, mute the game if requested
			sound.setMuteAll(!!this.options.mute);
		}

		this.trigger(SOUND_READY);
	};

	/**
	*  Set the current music alias to play
	*  @property {string} music
	*  @default null
	*/
	Object.defineProperty(p, "music",
	{
		set: function(value)
		{
			if (value == this._music)
			{
				return;
			}
			var sound = Sound.instance;

			if (true && !sound)
			{
				Debug.assert("Sound must be created before setting music!");
			}

			if (this._music)
			{
				sound.fadeOut(this._music);
			}
			this._music = value;

			if (this._music)
			{
				sound.play(
					this._music, 
					{
						start: sound.fadeIn.bind(sound, this._music),
						loop: -1
					}
				);
			}
		},
		get: function()
		{
			return this._music;
		}
	});

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.player)
		{
			this.player.destroy();
			this.player = null;
		}
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[SoundGame name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('cloudkid').SoundGame = SoundGame;

}());
/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){
	
	var StateManager,
		Game = include('cloudkid.Game');

	/**
	*  A game with state management, provides some convenience and events for adding states.
	*  @example
		var game = new cloudkid.StateGame();
		game.on('statesReady', function(){
			// Ready to use!
		});
	*  @class StateGame
	*  @extends SoundGame
	*  @constructor
	*  @param {object} [options] The Application options
	*  @param {string} [options=state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionEnd"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionStart"] The transition out sound alias or sound object
	*/
	var StateGame = function(options)
	{
		SoundGame.call(this, options);

		StateManager = include('cloudkid.StateManager');

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = options.transition ||  null;

		/**
		*  The state manager
		*  @property {cloudkid.StateManager} manager
		*/
		this.manager = null;

		// Listen for the soundReady event
		this.on('soundReady', onSoundReady.bind(this));
	};

	/**
	*  Reference to the prototype extends application
	*/
	var s = SoundGame.prototype;
	var p = StateGame.prototype = Object.create(s);

	/**
	*  Before creating the statemanager, a transition
	*  should probably be added at this callback
	*  @event initStateManager
	*/
	var INIT_STATES = 'initStates';

	/**
	*  The States are setup, this is the event to listen to 
	*  when the game ready to use. Do NOT use Application's init,
	*  or Game's loaded, or SoundGame's 'soundReady' events 
	*  as the entry point for your application.
	*  @event statesReady
	*/
	var STATES_READY = 'statesReady';

	/**
	*  Initialize the states event, this is where state could be added
	*  @event initStates
	*/
	var ADD_STATES = 'addStates';

	/**
	*  Callback when the game is loaded
	*  @method onLoaded
	*  @private
	*/
	var onSoundReady = function()
	{
		this.off('soundReady');

		this.trigger(INIT_STATE_MANAGER);

		// Goto the transition state
		if (!this.transition)
		{
			if (true)
			{
				throw "StateManager requires a 'transition' property to be set or through constructor options";
			}
			else
			{
				throw "No transition on StateGame";
			}
		}

		//if the transition is a CreateJS movieclip, start it out 
		//at the end of the transition out animation. If it has a 
		//'transitionLoop' animation, that will be played as soon as a state is set
		if(this.transition.gotoAndStop)
			this.transition.gotoAndStop("onTransitionOut_stop");

		// Create the state manager
		this.manager = new StateManager(
			this.display,
			this.transition, 
			options.transitionSounds || {
				"in" : "TransitionEnd",
				"out": "TransitionStart"
			}
		);

		// states should be added on this event!
		this.trigger(ADD_STATES);

		// Add the transition on top of everything else
		this.display.stage.addChild(this.transition);

		// Goto the first state
		if (options.state)
		{
			this.manager.setState(options.state);
		}

		// Rock and roll
		this.trigger(STATES_READY);
	};

	/**
	*  Add a single state
	*  @method addState
	*  @param {string} alias The shortcut alias for the state
	*  @param {BaseState} state The state manager state to add
	*/
	p.addState = function(alias, state)
	{
		// Add to the manager
		this.manager.addState(alias, state);

		// Add the state display object to the main display
		this.display.stage.addChild(state.panel);
	};

	/**
	*  Add a bunch of states at once by a dictionary of aliases to states
	*  @method addStates
	*  @param {object} states The collection of states where the key is the state alias
	*/
	p.addStates = function(states)
	{
		for(var alias in states)
		{
			this.addState(alias, states[alias]);
		}
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}

		if (this.transition)
		{
			this.display.adapter.removeChildren(this.transition);
			this.transition = null;
		}
		
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[StateGame name='" + this.name + "'']";
	};
	
	// Assign to the global namespace
	namespace('cloudkid').StateGame = StateGame;
	
}());
/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){

	//Library depencencies
	var StateGame = include('cloudkid.StateGame'),
		UIScaler;

	/**
	*  A sub-game class to provide scaling functionality and responsive design.
	*  @example
		var game = new cloudkid.ScalingGame();
		game.on('scalingReady', function(){
			// Ready to use!
		});
	*  @class ScalingGame
	*  @extends StateGame
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*/
	var ScalingGame = function(options)
	{
		UIScaler = include('cloudkid.UIScaler');

		StateGame.call(this, options);

		/**
		*  The current device pixel ratio as reported by the browser
		*  @property {number} pixelRatio
		*/
		this.pixelRatio = window.devicePixelRatio || 1;
		
		/**
		*  The main UIScaler for any display object references in the main game.
		*  @property {UIScaler} scaler
		*/
		this.scaler = null; 

		/** 
		*  The default pixels per inch on the screen
		*  @property {int} ppi
		*  @default 96
		*/
		this.ppi = 96;

		// Listen when the state manager is setup
		this.on('statesReady', onStatesReady.bind(this));
	};

	// Extend application
	var s = StateGame.prototype;
	var p = ScalingGame.prototype = Object.create(s);

	/**
	*  The main entry point for this game
	*  @event scalingReady
	*/
	var SCALING_READY = 'scalingReady';

	/**
	*  Callback when tasks are completed
	*  @method onTasksComplete
	*  @private
	*/
	var onStatesReady = function()
	{
		this.off('statesReady');

		var config = this.config,
			display = this.display;

		if (!config.designedSettings)
		{
			if (true)
			{
				throw "The config.json requires designedSettings object which contains keys 'designedWidth', 'designedHeight', and 'designedPPI'";
			}
			else
			{
				throw "designedSettings required in config";
			}
		}

		if (!config.scaling)
		{
			if (true)
			{
				throw "The config.json requires scaling object which contains all the state scaling";
			}
			else
			{
				throw "scaling required in config";
			}
		}

		// Create the calling from the configuration
		this.scaler = UIScaler.fromJSON(
			this, 
			config.designedSettings, 
			config.scaling,
			false
		);

		// Resize now that the config is loaded - fix portrait mode
		this.on("resize", resize.bind(this));

		// Dispatch a resize function
		this.trigger('resize', display.width, display.height);

		// We're done initializing the scaler
		this.trigger(SCALING_READY);
	};

	/**
	*  Handler for the stage resizing
	*  @method resize
	*  @private
	*  @param {number} width The width of the display
	*  @param {number} height  The height of the display
	*/
	var resize = function(w, h)
	{
		var pretendPPI = this.ppi;

		// assume a small phone and force a higher ppi in 
		// size calculations for larger buttons
		if (h <= 450)
		{
			pretendPPI *= 1.5;
		}
		
		// Set the new design scale size
		UIScaler.init(w, h, pretendPPI);

		this.scaler.resize();
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.scaler)
		{
			this.scaler.destroy();
			this.scaler = null;
		}
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {string} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[ScalingGame name='" + this.name + "'']";
	};

	// Add to the namespace
	namespace('cloudkid').ScalingGame = ScalingGame;

}());}();