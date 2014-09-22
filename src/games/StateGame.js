/**
*  @module Game
*  @namespace cloudkid
*/
(function(undefined){
	
	var StateManager,
		SoundGame = include('cloudkid.SoundGame');

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
	*  @param {string} [options.state] The initial state
	*  @param {createjs.MovieClip|PIXI.Spine} [options.transition] The StateManager transition animation
	*  @param {Object} [options.transitionSounds] The transition sound data
	*  @param {Object|String} [options.transitionSounds.in="TransitionIn"] The transition in sound alias or sound object
	*  @param {Object|String} [options.transitionSounds.out="TransitionOut"] The transition out sound alias or sound object
	*  @param {String} [options.captionsPath='assets/config/captions.json'] The path to the captions dictionary. If this is set to null
	*		captions will not be created or used by the VO player.
	*  @param {string} [options.swfPath='assets/swfs/'] The relative location to the FlashPlugin swf for SoundJS
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
	*  @param {Boolean} [options.queryStringParameters=false] Parse the query string paramenters as options
	*  @param {Boolean} [options.debug=false] Enable the Debug class
	*  @param {int} [options.minLogLevel=0] The minimum log level to show debug messages for from 0 (general) to 4 (error),
	*		the `Debug` class must be used for this feature.
	*  @param {String} [options.ip] The host computer for IP remote debugging,
	*		the debug module must be included to use this feature.
	*  @param {Boolean} [options.updateTween=false] If using TweenJS, the Application will update the Tween itself
	*  @param {String} [options.canvasId] The default display DOM ID name
	*  @param {Function} [options.display] The name of the class to instaniate as the display (e.g. `cloudkid.PixiDisplay`)
	*  @param {Object} [options.displayOptions] Display-specific options
	*  @param {Boolean} [options.crossOrigin=false] Used by `cloudkid.PixiTask`, default behavior is to load assets from the same domain.	
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

		StateManager = include('cloudkid.StateManager');

		/**
		*  The transition animation to use between the StateManager state changes
		*  @property {createjs.MovieClip|PIXI.Spine} transition
		*/
		this.transition = this.options.transition ||  null;

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

		// Goto the first state
		if (this.options.state)
		{
			this.manager.setState(this.options.state);
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