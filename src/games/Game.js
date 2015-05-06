/**
 * @module Game
 * @namespace springroll
 * @requires Core
 */
(function(undefined){

	//Library depencencies
	var Debug,
		Application = include('springroll.Application'),
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
	*  @param {String} [options.name=''] The name of the game
	*  @param {Boolean} [options.forceTouch=false] Manually override the check for hasTouch
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
		Debug = include('springroll.Debug', false);
		Sound = include('springroll.Sound');
		VOPlayer = include('springroll.VOPlayer');

		// Set the default options
		Application.call(this, Object.merge({
			captions : null,
			updateTween : true,
			forceMobile : false,
			state : null,
			transition : null,
			transitionSounds : {
				'in' : 'TransitionIn',
				'out' : 'TransitionOut'
			}
		}, options));

		/**
		*  The collection of states
		*  @property {Object} _states
		*  @private
		*/
		this._states = null;

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
		*  If the current brower is iOS
		*  @property {Boolean} isIOS
		*/
		this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;
		
		/**
		*  If the current brower is Android
		*  @property {Boolean} isAndroid
		*/
		this.isAndroid = navigator.userAgent.search(/Android/) > -1;

		/**
		*  If the current brower has touch input available
		*  @property {Boolean} hasTouch
		*/
		if (DEBUG && this.options.forceMobile)
		{
			this.hasTouch = true;
		}
		else
		{
			//Detect availability of touch events
			this.hasTouch = !!(('ontouchstart' in window) ||// iOS & Android
				(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || // IE10
				(window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 0)); // IE11+
		}
	};

	// Extend application
	var s = Application.prototype;
	var p = extend(Game, Application);

	/**
	*  The collection of states where the key is the state alias and value is the state display object
	*  @property {Object} states
	*  @default null
	*/
	Object.defineProperty(p, "states",
	{
		set: function(states)
		{
			if (this.manager)
			{
				if (DEBUG)
				{
					throw "StateManager has already been initialized, cannot set states multiple times";
				}
				else
				{
					throw "Game.states already set";
				}
			}

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

			//if the transition is a EaselJS movieclip, start it out
			//at the end of the transition out animation. If it has a
			//'transitionLoop' animation, that will be played as soon as a state is set
			if (this.transition.gotoAndStop)
			{
				this.transition.gotoAndStop("onTransitionOut_stop");
			}

			// Create the state manager
			var manager = this.manager = new StateManager(
				this.display,
				this.transition,
				this.options.transitionSounds
			);
			
			var stage = this.display.stage;
			
			//create states
			for (var alias in states)
			{
				// Add to the manager
				manager.addState(alias, states[alias]);

				// Add the state display object to the main display
				stage.addChild(states[alias].panel);
			}

			this._states = states;

			// Add the transition on top of everything else
			stage.addChild(this.transition);

			// Goto the first state
			if (this.options.state)
			{
				manager.setState(this.options.state);
			}
		},
		get: function()
		{
			return this._states;
		}
	});

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
		if (this.transition)
		{
			this.display.adapter.removeChildren(this.transition);
			this.transition = null;
		}
		this.captions = null;
		s.destroy.call(this);
	};

	// Assign to the namespace
	namespace('springroll').Game = Game;

}());