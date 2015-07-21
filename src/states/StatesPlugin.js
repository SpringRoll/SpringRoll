/**
 * @module States
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		StateManager = include('springroll.StateManager'),
		Debug = include('springroll.Debug', false);

	/**
	 * Create an app plugin for Loader, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class StatesPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Fired when an event has been added
		 * @event stateAdded
		 * @param {String} alias The state alias
		 * @param {springroll.State} state The State object
		 */
		
		/**
		 * The collection of states
		 * @property {Object} _states
		 * @private
		 */
		this._states = null;

		/**
		 * The state manager
		 * @property {springroll.StateManager} manager
		 */
		this.manager = null;

		/**
		 * The transition animation to use between the StateManager state changes
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} _transition
		 * @private
		 */
		this._transition = null;

		/**
		 * The transition animation to use between the StateManager state changes
		 * @property {createjs.MovieClip|springroll.easeljs.BitmapMovieClip|PIXI.Spine} transition
		 */
		Object.defineProperty(this, "transition", 
		{
			set: function(transition)
			{
				if (!this.display)
				{
					if (DEBUG)
					{
						throw "No default display is available to set the states. Use the display application option";
					}
					else
					{
						throw "No default display";
					}
				}

				// Remove the old transition
				var stage = this.display.stage;
				if (this._transition)
				{
					stage.removeChild(this._transition);
				}

				// Save the transtion reference
				this._transition = transition;

				// Add to the manager
				if (this.manager)
				{
					this.manager.transition = transition;
				}

				// Add to the stage
				if (transition)
				{
					// Stop the transition from playing
					if (transition.stop)
					{
						transition.stop();
					}
					stage.addChild(transition);
				}
			},
			get: function()
			{
				return this._transition;
			}
		});

		/**
		 * The initial state to go to when everything is finished
		 * @property {Boolean} options.state
		 * @default null
		 * @readOnly
		 */
		this.options.add('state', null, true);

		/**
		 * The animation to use for the StateManager
		 * @property {createjs.MovieClip|PIXI.Spine} options.transition
		 */
		this.options.add('transition');

		/**
		 * The transition sounds to use for the state transition
		 * @property {Object} options.transitionSounds
		 * @readOnly
		 */
		/**
		 * The transition in sound alias or sound object
		 * @property {Object} options.transitionSounds.in
		 * @default null
		 * @readOnly
		 */
		/**
		 * The transition out sound alias or sound object
		 * @property {Object} options.transitionSounds.out
		 * @default null
		 * @readOnly
		 */
		this.options.add('transitionSounds',
		{
			'in' : null,
			'out' : null
		}, true);

		/**
		 * The collection of states where the key is the state alias and value is the state display object
		 * @property {Object} states
		 * @default null
		 */
		Object.defineProperty(this, "states",
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
						throw "States already set";
					}
				}

				if (!this.display)
				{
					if (DEBUG)
					{
						throw "No default display is available to set the states. Use the display application option";
					}
					else
					{
						throw "No default display";
					}
				}

				// Create the state manager
				var manager = this.manager = new StateManager(
					this.display,
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

					this.trigger('stateAdded', alias, states[alias]);
				}

				this._states = states;

				// Get the transition from either the transition manual set or the options
				var transition =  this._transition || this.options.transition;

				//if the transition is a EaselJS movieclip, start it out
				//at the end of the transition out animation. If it has a
				//'transitionLoop' animation, that will be played as soon as a state is set
				if (transition)
				{
					// Add the transition this will addChild on top of all the panels
					this.transition = transition;

					// Goto the fully covered state
					if (transition.gotoAndStop)
					{
						transition.gotoAndStop("onTransitionOut_stop");
					}
				}

				// Goto the first state
				if (this.options.state)
				{
					manager.state = this.options.state;
				}
			},
			get: function()
			{
				return this._states;
			}
		});

		if (DEBUG)
		{
			/**
			 * Debug key strokes
			 * → = trigger a skip to the next state for testing
			 * ← = trigger a skip to the previous state for testing
			 */
			window.onkeyup = function(e)
			{
				if (!this.manager || !this.manager.currentState) return;

				var key = e.keyCode ? e.keyCode : e.which;
				var currentState = this.manager.currentState;
				switch (key)
				{
					//right arrow
					case 39:
					{
						if (Debug) Debug.info("Going to next state via keyboard");
						currentState.nextState();
						break;
					}
					//left arrow
					case 37:
					{
						if (Debug) Debug.info("Going to previous state via keyboard");
						currentState.previousState();
						break;
					}
				}
			}
			.bind(this);
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (DEBUG)
		{
			window.onkeyup = null;
		}
		this._state = null;
		if (this.manager)
		{
			this.manager.destroy();
			this.manager = null;
		}
		if (this.transition)
		{
			if (this.display)
			{
				this.display.adapter.removeChildren(this.transition);
			}
			this.transition = null;
		}
	};

}());