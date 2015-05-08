/**
 * @module Learning Dispatcher
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
	 	LearningDispatcher = include('springroll.LearningDispatcher'),
	 	LearningMedia = include('springroll.LearningMedia');

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
		 * For media conveninece methods tracking media events, such as 
		 * playFeedback, playMovie, etc
		 * @property {springroll.LearningMedia} media
		 */
		this.media = new LearningMedia();

		/**
		 * The Learning Dispatcher instance
		 * @property {springroll.LearningDispatcher} learning
		 */
		this.learning = new LearningDispatcher(this, DEBUG);

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

		/**
		 * For the learning, we want to send consistent data when sending
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
		this.normalizePosition = function(x, y, coordSpace)
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
	};

	// Setup the game media
	p.preload = function(done)
	{
		this.media.init(this);
		done();
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.media.destroy();
		this.media = null;

		this.learning.destroy();
		this.learning = null;
	};

	// register plugin
	ApplicationPlugin.register(LearningPlugin);

}());