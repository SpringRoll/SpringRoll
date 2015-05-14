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
	 * Create an app plugin for Learning Dispatcher, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class LearningPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var LearningPlugin = function()
	{
		ApplicationPlugin.call(this);
		this.priority = 1;
	};

	// Reference to the prototype
	var p = extend(LearningPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
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
		this.learning = new Learning(this, DEBUG);

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
	p.teardown = function()
	{
		this.learning.destroy();
		this.learning = null;
	};

	// register plugin
	ApplicationPlugin.register(LearningPlugin);

}());