/**
*  @module Game
*  @namespace springroll
*/
(function(undefined){

	//Library depencencies
	var Application = include('springroll.Application'),
		StateManager = include('springroll.StateManager'),
		VOPlayer,
		Captions,
		Sound;

	/**
	*  A sub-class of Application which provides automatic Sound initialization. Also
	*  provides StateManager architecture to manage game screens and transitions between
	*  them. Last, the Game class will allow for easily setting captions for use
	*  by the VOPlayer and Animator classes.
	*  @example
		var game = new springroll.Game();
		game.on('init', function(){
			// Ready to use!
		});
	*  @class Game
	*  @extends springroll.Application
	*  @constructor
	*  @param {Object} [options] The collection of options, see Application for more options.
	*  @param {String} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition
	*                                                              animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound
	*                                                                      alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out
	*                                                                        sound alias or sound
	*                                                                        object
	*  @param {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} [options.captions] The
	*                          captions text field object to use for the VOPlayer captions object.
	*  @param {String} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin
	*                                                   swf for SoundJS
	*  @param {Array} [options.audioTypes=['ogg','mp3'] The order in which file types are
	*                                                   preferred, where "ogg" becomes a ".ogg"
	*                                                   extension on all sound file urls.
	*  @param {Boolean} [options.mute=false] Set the initial mute state of the all the audio
	*                                        (unminifed library version only)
	*  @param {String} [options.name=''] The name of the game
	*  @param {Boolean} [options.forceMobile=false] Manually override the check for isMobile
	*                                               (unminifed library version only)
	*  @param {Boolean} [options.updateTween=true] Have the application take care of the Tween
	*                                              updates
	*  @param {int} [options.fps=60] The framerate to use for rendering the stage
	*  @param {Boolean} [options.raf=true] Use request animation frame
	*  @param {String} [options.versionsFile] Path to a text file which contains explicit version
	*                                         numbers for each asset. This is useful for
	*                                         controlling the live browser cache. For instance,
	*                                         this text file would have an asset on each line
	*                                         followed by a number: `assets/config/config.json 2`
	*                                         this would load `assets/config/config.json?v=2`
	*  @param {Boolean} [options.cacheBust=false] Override the end-user browser cache by adding
	*                                             "?v=" to the end of each file path requested. Use
	*                                             for development, debugging only!
	*  @param {String} [options.basePath] The optional file path to prefix to any relative file
	*                                     requests. This is a great way to load all load requests
	*                                     with a CDN path.
	*  @param {String|DOMElement|Window} [options.resizeElement] The element to resize the canvas to
	*  @param {Boolean} [options.uniformResize=true] Whether to resize the displays to the original
	*                                                aspect ratio
	*  @param {Number} [options.maxAspectRatio] If doing uniform resizing, optional parameter to
	*                                           add a maximum aspect ratio. This allows for
	*                                           "title-safe" responsiveness. Must be greater than
	*                                           the original aspect ratio of the canvas.
	*  @param {Number} [options.minAspectRatio] If doing uniform resizing, optional parameter to add
	*                                           a minimum aspect ratio. This allows for "title-safe"
	*                                           responsiveness. Must be less than the original
	*                                           aspect ratio of the canvas.
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as
	*                                                         options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0
	*                                       (general) to 4 (error). the `Debug` class must be used
	*                                       for this feature.
	*  @param {String} [options.debugRemote] The host computer for remote debugging, the debug
	*                                        module must be included to use this feature. Can be an
	*                                        IP address or host name.
	*  @param {Boolean} [options.updateTween=true] If using TweenJS, the Application will update
	*                                              the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to automatically instantiate as the
	*                                      display (e.g. `springroll.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `springroll.PixiTask`, default behavior
	*                                               is to load assets from the same domain.
	*/
	var Game = function(options)
	{
		Sound = include('springroll.Sound');
		VOPlayer = include('springroll.VOPlayer');

		// Set the default options
		Application.call(this, Object.merge({
			swfPath : 'assets/swfs/',
			audioTypes : ["ogg", "mp3"],
			mute : false,
			captions : null,
			updateTween : true,
			name : '',
			forceMobile : false,
			state : null,
			transition : null,
			transitionSounds : {
				'in' : 'TransitionIn',
				'out' : 'TransitionOut'
			}
		}, options));

		/**
		*  The name of the game, useful for debugging purposes
		*  @property {String} name
		*  @default ""
		*/
		this.name = this.options.name;

		/**
		*  The current music alias playing
		*  @property {String} _music
		*  @private
		*/
		this._music = null;

		/**
		*  The global player for playing voice over
		*  @property {springroll.VOPlayer} player
		*/
		this.player = new VOPlayer();

		/**
		*  The global captions object
		*  @property {springroll.Captions} captions
		*/
		this.captions = null;

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

		/**
		*  If the current brower is mobile
		*  @property {Boolean} isMobile
		*/
		if (DEBUG && this.options.forceMobile)
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

			/**
			*  If the current brower is iOS
			*  @property {Boolean} isIOS
			*/
			this.isIOS = agent.search(/iPhone|iPad|iPod/) > -1;
			this.isMobile = this.isIOS || agent.search(/Android|Blackberry/) > -1;
		}

		// Callback right before init is called, we'll
		// override the init and load the sound first
		this.once('beforeInit', onBeforeInit.bind(this));
	};

	// Extend application
	var s = Application.prototype;
	var p = extend(Game, Application);

	/**
	*  The sound is ready to use
	*  @event soundReady
	*/
	var SOUND_READY = 'soundReady';

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
	*  Override the do init method
	*  @method onBeforeInit
	*  @protected
	*/
	var onBeforeInit = function()
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
		if (DEBUG)
		{
			// For testing, mute the game if requested
			Sound.instance.muteAll = !!this.options.mute;
		}
		this._readyToInit = true;
		this.trigger(SOUND_READY);
		this._doInit();
	};

	/**
	*  Manual initialization of the states
	*  @method initStates
	*  @protected
	*/
	p.initStates = function()
	{
		this.trigger(INIT_STATES);

		// Goto the transition state
		if (!this.transition)
		{
			if (DEBUG)
			{
				throw "StateManager requires a 'transition' property to be set or through constructor options";
			}
			else
			{
				throw "No options.transition";
			}
		}

		//if the transition is a CreateJS movieclip, start it out
		//at the end of the transition out animation. If it has a
		//'transitionLoop' animation, that will be played as soon as a state is set
		if (this.transition.gotoAndStop)
		{
			this.transition.gotoAndStop("onTransitionOut_stop");
		}

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

		// Goto the first state
		if (this.options.state)
		{
			this.manager.setState(this.options.state);
		}

		this.trigger(STATES_READY);
	};

	/**
	*  Add a single state
	*  @method addState
	*  @param {String} alias The shortcut alias for the state
	*  @param {BaseState} state The state manager state to add
	*/
	p.addState = function(alias, state)
	{
		if (!this.manager)
		{
			if (DEBUG)
			{
				throw "StateManager has not been created, call initStates() on Game";
			}
			else
			{
				throw "StateManager no initialized";
			}
		}
		
		// Add to the manager
		this.manager.addState(alias, state);

		// Add the state display object to the main display
		this.display.stage.addChild(state.panel);
	};

	/**
	*  Add a bunch of states at once by a dictionary of aliases to states
	*  @method addStates
	*  @param {Object} states The collection of states where the key is the state alias
	*/
	p.addStates = function(states)
	{
		for(var alias in states)
		{
			this.addState(alias, states[alias]);
		}
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
	*  Convenience method to loads a Sound config object.
	*  @method addSounds
	*  @public
	*  @param {Object} config The config to load.
	*  @param {String} [config.context] The optional sound context to load sounds into unless
	*                                   otherwise specified by the individual sound. Sounds do not
	*                                   require a context.
	*  @param {String} [config.path=""] The path to prepend to all sound source urls in this config.
	*  @param {Array} config.soundManifest The list of sounds, either as String ids or Objects with
	*                                      settings.
	*  @param {Object|String} config.soundManifest.* An entry in the array. If this is a
	*                                                string, then it is the same as
	*                                                {'id':'<yourString>'}.
	*  @param {String} config.soundManifest.*.id The id to reference the sound by.
	*  @param {String} [config.soundManifest.*.src] The src path to the file, without an
	*                                               extension. If omitted, defaults to id.
	*  @param {Number} [config.soundManifest.*.volume=1] The default volume for the sound,
	*                                                    from 0 to 1.
	*  @param {Boolean} [config.soundManifest.*.loop=false] If the sound should loop by
	*                                                       default whenever the loop
	*                                                       parameter in play() is not
	*                                                       specified.
	*  @param {String} [config.soundManifest.*.context] A context name to override
	*                                                   config.context with.
	*  @return {Sound} The sound object for chaining
	*/
	p.addSounds = function(config)
	{
		return Sound.instance.loadConfig(config);
	};

	/**
	*  Sets the dicitonary for the captions used by player. If a Captions object
	*  did not exist previously, then it creates one, and sets it up on all Animators.
	*  @method addCaptions
	*  @param {Object} captionData The captions data to give to the Captions object
	*/
	p.addCaptions = function(captionData)
	{
		if (!this.captions)
		{
			Captions = include('springroll.Captions');

			// Create the new captions
			var captions = new Captions(captionData, this.options.captions);
			
			this.player.captions = captions;
			this.captions = captions;
			
			// Give the display to the animators
			this.getDisplays(function(display){
				// ensure that displays without Animators don't break anything
				if(display.animator)
				{
					display.animator.captions = captions;
				}
			});
		}
		else
		{
			// Update the player captions
			this.captions.setDictionary(captionData);
		}
	};

	/**
	*  Sets the dicitonary for the captions used by player. If a Captions object
	*  did not exist previously, then it creates one, and sets it up on all Animators.
	*  @method setCaptionsDictionary
	*  @deprecated Use Game.addCaptions
	*  @param {Object} captionData The captions data to give to the Captions object
	*/
	p.setCaptionsDictionary = function(captionData)
	{
		if (DEBUG)
		{
			Debug.warn("Game.setCaptionsDictionary is deprecated, use Game.addCaptions instead");
		}
		this.addCaptions(captionData);
	};

	/**
	*  Destroy the game, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}
		if (this.player)
		{
			this.player.destroy();
			this.player = null;
		}
		if (this.transition)
		{
			this.display.adapter.removeChildren(this.transition);
			this.transition = null;
		}
		this.captions = null;
		s.destroy.call(this);
	};

	/**
	*  The toString debugging method
	*  @method toString
	*  @return {String} The reprsentation of this class
	*/
	p.toString = function()
	{
		return "[Game name='" + this.name + "'']";
	};

	// Assign to the namespace
	namespace('springroll').Game = Game;

}());