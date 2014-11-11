/*! SpringRoll 0.0.6 */
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

	/**
	*  Get the last item in the array
	*  @method last
	*  @static
	*  @param {Array} array The array
	*  @return {*} The last item
	*/
	Object.defineProperty(Array.prototype, 'last',
	{
		enumerable: false,
		writable: false,
		value: function()
		{
			return this[this.length - 1];
		}
	});
}());

/**
 *  @module Game
 */
(function(Math)
{
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
	 * @return {Int} The random value
	 */
	Math.getRandomInt = function(min, max)
	{
		/** OVERRIDE
		 * 	allow single-parameter use, where min is
		 * 	assumed to be 0, and max is the supplied single-parameter
		 * 	i.e. function(max) {
		 *		return <value between 0 and parameter>
		 * 	}
		 */
		if (max === undefined)
		{
			max = min;
			min = 0;
		}
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
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var Application = include('springroll.Application'),
		LoadTask,
		TaskManager;

	/**
	*  A game extends the main application and provides some game specific convenience function
	*  and additional events. Most importantly it provides preload functionalty though the state
	*  manager. Assume loading a single configuration JSON file.
	*  @example
		var game = new springroll.Game();
		game.on('loaded', function(){
			// Ready to use!
		});
	*  @class Game
	*  @extends springroll.Application
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile=false] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number:
	* 		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding "?v="
	*		to the end of each file path requested. Use for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file requests
	*		this is a great way to load all load requests with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add a maximum aspect ratio.
	*         This allows for "title-safe" responsiveness. Must be greater than the original aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging,
	*		the debug module must be included to use this feature. Can be an IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var Game = function(options)
	{
		LoadTask = include('springroll.LoadTask');
		TaskManager = include('springroll.TaskManager');

		Application.call(this, Object.merge({
			updateTween : true,
			name : 'Untitled',
			forceMobile : false,
			configPath : 'assets/config/config.json'
		}, options));

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {string} name
		*  @default "Untitled"
		*/
		this.name = this.options.name;

		/**
		*  The game configuration loaded from and external JSON file
		*  @property {object} config
		*/
		this.config = null;

		/**
		*  If the current brower is mobile
		*  @property {boolean} isMobile
		*/
		if (true && this.options.forceMobile)
		{
			this.isMobile = true;
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

		// Callback right before init is called
		this.once('beforeInit', onBeforeInit.bind(this));
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
	*  Override the do init method
	*  @method onBeforeInit
	*  @protected
	*/
	var onBeforeInit = function()
	{
		this._readyToInit = false;

		var tasks = [
			new LoadTask(
				"config",
				this.options.configPath,
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
		this._readyToInit = true;
		this.trigger(LOADED);
		Application.prototype._doInit.call(this);
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
	namespace('springroll').Game = Game;

}());
/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var Game = include('springroll.Game'),
		Application = include('springroll.Application'),
		VOPlayer,
		LoadTask,
		Captions,
		Sound;

	/**
	*  A sub-application for Game which setups Sound, VOPlayer and Captions.
	*  @example
		var game = new springroll.SoundGame();
		game.on('soundReady', function(){
			// Ready to use!
		});
	*  @class SoundGame
	*  @extends springroll.Game
	*  @constructor
	*  @param {Object} [options] The collection of options, see Application for more options.
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The
	*          captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions
	*          dictionary. If this is set to null captions will not be created or used by the VO
	*          player.
	*  @param {String} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf
	*                                                   for SoundJS.
	*  @param {Array} [options.audioTypes=['ogg', 'mp3'] The order in which file types are
	*                                             preferred, where "ogg" becomes a ".ogg" extension
	*                                             on all sound file urls.
	*  @param {Boolean} [options.mute=false] Set the initial mute state of the all the audio
	*                                        (unminifed library version only).
	*  @param {String} [options.name] The name of the game
	*  @param {String} [options.configPath='assets/config/config.json'] The path to the default
	*                                                                   config to load.
	*  @param {Boolean} [options.forceMobile=false] Manually override the check for isMobile
	*                                               (unminifed library version only).
	*  @param {Boolean} [options.updateTween=true] Have the application take care of the Tween
	*                                              updates.
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number:
	*		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding
	*                                             "?v=" to the end of each file path requested. Use
	*                                             for development, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file
	*                                     requests. This is a great way to load all load requests
	*                                     with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original
	*                                                aspect ratio.
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add
	*                                           a maximum aspect ratio. This allows for "title-safe"
	*                                           responsiveness. Must be greater than the original
	*                                           aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as
	*                                                         options.
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from
	*                                       0 (general) to 4 (error). The `Debug` class must be used
	*                                       for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging, the debug
	*                                        module must be included to use this feature. Can be an
	*                                        IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update
	*                                               the Tween itself.
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the default
	*                                      display (e.g. `springroll.PixiDisplay`).
	*  @param {Object} [options.displayOptions] Display-specific options for the default display.
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior
	*                                               is to load assets from the same domain.
	*/
	var SoundGame = function(options)
	{
		Sound = include('springroll.Sound');
		VOPlayer = include('springroll.VOPlayer');
		Captions = include('springroll.Captions', false);

		Game.call(this, Object.merge({
			captionsPath : 'assets/config/captions.json',
			swfPath : 'assets/swfs/',
			audioTypes : ["ogg", "mp3"],
			mute : false,
			captions : null
		}, options));

		/**
		*  The current music alias playing
		*  @property {String} _music
		*  @private
		*/
		this._music = null;

		/**
		*  The global player for playing voice over
		*  @property {VOPlayer} player
		*/
		this.player = null;

		/**
		*  The global captions object
		*  @property {DOMElement|createjs.Text|PIXI.Text|PIXI.BitmapText} captions
		*/
		this.captions = null;

		// Listen for the game is loaded then initalize the sound
		this.once('loading', onLoading.bind(this));
		this.once('loaded', onLoaded.bind(this));
	};

	// Extend application
	var s = Game.prototype;
	var p = SoundGame.prototype = Object.create(s);

	/**
	*  The Sound is completed, this is the event to listen to
	*  when the game ready to use.
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
			LoadTask = include('springroll.LoadTask');
			tasks.push(new LoadTask(
				'captions',
				this.options.captionsPath,
				onCaptionsLoaded.bind(this)
			));
		}
		else
		{
			onCaptionsLoaded.call(this);
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
			// Create a new captions object
			captions = new Captions(result.content, this.options.captions);

			// Give the display to the animators
			this.getDisplays(function(display){
				//ensure that displays without Animators don't break anything
				if(display.animator)
					display.animator.captions = captions;
			});

			// Add the reference to the game
			this.captions = captions.textField;
		}

		// Create a new VO Player class
		this.player = new VOPlayer(captions);
	};

	/**
	*  Callback when preload as been finished
	*  @method onLoaded
	*  @private
	*/
	var onLoaded = function()
	{
		this._readyToInit = false;

		// Initialize the sound
		Sound.init({
			swfPath : this.options.swfPath,
			ready : onSoundReady.bind(this),
			types : this.options.audioTypes
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

		this._readyToInit = true;
		this.trigger(SOUND_READY);
		Application.prototype._doInit.call(this);
	};

	/**
	*  Set the current music alias to play
	*  @property {String} music
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
	 * Sets the dicitonary for the captions used by player. If a Captions object
	 * did not exist previously, then it creates one, and sets it up on all Animators.
	 * @method setCaptionsDictionary
	 * @param {Object} captionData The captions data to give to the Captions object
	 */
	p.setCaptionsDictionary = function(captionData)
	{
		if(!this.player.captions)
		{
			var captions = this.player.captions = new Captions(captionData, this.options.captions);
			this.captions = captions.textField;
			// Give the display to the animators
			this.getDisplays(function(display){
				//ensure that displays without Animators don't break anything
				if(display.animator)
					display.animator.captions = captions;
			});
		}
		else
		{
			this.player.captions.setDictionary(captionData);
		}
	};

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
	*  @return {String} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[SoundGame name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('springroll').SoundGame = SoundGame;

}());
/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){
	
	var StateManager,
		SoundGame = include('springroll.SoundGame');

	/**
	*  A game with state management, provides some convenience and events for adding states.
	*  @example
		var game = new springroll.StateGame();
		game.on('addStates', function(){
			//add some states with game.addState()
		});
		game.on('statesReady', function(){
			// Ready to use!
		});
	*  @class StateGame
	*  @extends springroll.SoundGame
	*  @constructor
	*  @param {object} [options] The Application options
	*  @param {string} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out sound alias or sound object
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
	*  @param {Array} [options.audioTypes=['ogg', 'mp3'] The order in which file types are
	*                                             preferred, where "ogg" becomes a ".ogg" extension
	*                                             on all sound file urls.
	*  @param {boolean} [options.mute=false] Set the initial mute state of the all the audio (unminifed library version only)
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile=false] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number:
	* 		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding "?v="
	*		to the end of each file path requested. Use for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file requests
	*		this is a great way to load all load requests with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add a maximum aspect ratio.
	*         This allows for "title-safe" responsiveness. Must be greater than the original aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging,
	*		the debug module must be included to use this feature. Can be an IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var StateGame = function(options)
	{
		SoundGame.call(this, Object.merge({
			state : null,
			transition : null,
			transitionSounds : {
				'in' : 'TransitionIn',
				'out' : 'TransitionOut'
			}
		}, options));

		StateManager = include('springroll.StateManager');

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = this.options.transition ||  null;

		/**
		*  The state manager
		*  @property {springroll.StateManager} manager
		*/
		this.manager = null;

		// Listen for the soundReady event
		this.once('soundReady', onSoundReady.bind(this));
	};

	/**
	*  Reference to the prototype extends application
	*/
	var s = SoundGame.prototype;
	var p = StateGame.prototype = Object.create(s);

	/**
	*  Before creating the statemanager, a transition
	*  should probably be added at this callback
	*  @event initStates
	*/
	var INIT_STATES = 'initStates';

	/**
	*  The states are setup, this is the event to listen to
	*  when the game ready to use.
	*  @event statesReady
	*/
	var STATES_READY = 'statesReady';

	/**
	*  Initialize the states event, this is where state could be added
	*  @event addStates
	*/
	var ADD_STATES = 'addStates';

	/**
	*  Callback when the game is loaded
	*  @method onLoaded
	*  @private
	*/
	var onSoundReady = function()
	{
		this.trigger(INIT_STATES);

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
			this.options.transitionSounds
		);

		// states should be added on this event!
		this.trigger(ADD_STATES);

		// Add the transition on top of everything else
		this.display.stage.addChild(this.transition);

		this.trigger(STATES_READY);

		// Goto the first state
		if (this.options.state)
		{
			this.manager.setState(this.options.state);
		}
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
	namespace('springroll').StateGame = StateGame;
	
}());
/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var StateGame = include('springroll.StateGame'),
		UIScaler;

	/**
	*  A sub-game class to provide scaling functionality and responsive design.
	*  @example
		var game = new springroll.ScalingGame();
		game.on('scalingReady', function(){
			// Ready to use!
		});
	*  @class ScalingGame
	*  @extends springroll.StateGame
	*  @constructor
	*  @param {object} [options] The collection of options, see Application for more options.
	*  @param {string} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out sound alias or sound object
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
	*  @param {Array} [options.audioTypes=['ogg', 'mp3'] The order in which file types are
	*                                             preferred, where "ogg" becomes a ".ogg" extension
	*                                             on all sound file urls.
	*  @param {boolean} [options.mute=false] Set the initial mute state of the all the audio (unminifed library version only)
	*  @param {string} [options.name] The name of the game
	*  @param {string} [options.configPath='assets/config/config.json'] The path to the default config to load
	*  @param {boolean} [options.forceMobile=false] Manually override the check for isMobile (unminifed library version only)
	*  @param {boolean} [options.updateTween=true] Have the application take care of the Tween updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*		numbers for each asset. This is useful for controlling the live browser cache.
	*		For instance, this text file would have an asset on each line followed by a number:
	* 		`assets/config/config.json 2` this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding "?v="
	*		to the end of each file path requested. Use for developmently, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file requests
	*		this is a great way to load all load requests with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to add a maximum aspect ratio.
	*         This allows for "title-safe" responsiveness. Must be greater than the original aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging,
	*		the debug module must be included to use this feature. Can be an IP address or host name.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior is to load assets from the same domain.
	*/
	var ScalingGame = function(options)
	{
		UIScaler = include('springroll.UIScaler');

		StateGame.call(this, options);
		
		/**
		*  The main UIScaler for any display object references in the main game.
		*  @property {UIScaler} scaler
		*/
		this.scaler = null;

		// Listen when the state manager is setup
		this.once('statesReady', onStatesReady.bind(this));
	};

	// Extend application
	var s = StateGame.prototype;
	var p = ScalingGame.prototype = Object.create(s);

	/**
	*  When the scaling has been initialized
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
		var config = this.config,
			display = this.display,
			designed = config.designedSettings;

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

		// Create the calling from the configuration
		// This will only scale items on the root of the stage
		this.scaler = new UIScaler(
			this,
			designed,
			config.scaling,
			true,
			this.display
		);
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
	namespace('springroll').ScalingGame = ScalingGame;

}());}();