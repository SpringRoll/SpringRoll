/**
 *  @module Progress Tracker
 *  @namespace springroll
 */
(function()
{
	var ProgressTrackerError = include('springroll.ProgressTrackerError');

	/**
	 *  A map of all the event codes to the API method names
	 *  @class EventCatalog
	 */
	var EventCatalog = function()
	{
		/**
		 * The collection of all codes map to events
		 * @property {Object} events
		 */
		this.events = Object.merge({}, defaultEvents);
	};

	// Reference to the prototype
	var p = EventCatalog.prototype;

	/**
	 *  The map of event codes to method names
	 *  @property {Object} defaultEvents
	 *  @static
	 *  @private
	 *  @readOnly
	 */
	var defaultEvents = {
		"2000": "startGame",
		"2010": "endGame",
		"2020": "startRound",
		"2030": "endRound",
		"2040": "startLevel",
		"2050": "endLevel",
		"2060": "startTutorial",
		"2070": "endTutorial",
		"2075": "skipTutorial",
		"2080": "startMovie",
		"2081": "skipMovie",
		"2083": "endMovie",
		"3010": "startInstruction",
		"3110": "endInstruction",
		"3020": "startIncorrectFeedback",
		"3120": "endIncorrectFeedback",
		"3021": "startCorrectFeedback",
		"3121": "endCorrectFeedback",
		"4010": "selectLevel",
		"4020": "selectAnswer",
		"4030": "startDrag",
		"4035": "endDragOutside",
		"4070": "offClick",
		"4080": "dwellTime",
		"4090": "clickHelp",
		"4095": "clickReplay",
		"4100": "submitAnswer"
	};

	/**
	 *  The list of global argument names common to all events. This will
	 *  ignore any event spec arguments matching these names because
	 *  they are automatically submitted with event calls.
	 *  @property {Array} globals
	 *  @static
	 */
	EventCatalog.globals = [
		'game_time',
		'level',
		'round'
	];

	/**
	*  Look up an event code by API name
	*  @method loopkup
	*  @param {string} api The name of the API method
	*  @return {string} The matching event code
	*/
	p.lookup = function(api)
	{
		for (var eventCode in this.events)
		{
			if (api === this.events[eventCode])
			{
				return eventCode;
			}
		}
		return null;
	};

	/**
	*  Add additional apis
	*  @method add
	*  @param {object} map The map of event codes to API names
	*/
	p.add = function(map)
	{
		for (var eventCode in map)
		{
			if (this.events[eventCode] === undefined)
			{
				this.events[eventCode] = map[eventCode];
			}
			else
			{
				throw new ProgressTrackerError("Cannot override the existing event code " + eventCode);
			}
		}
	};

	//Basic arguments for instructional and feedback events
	var feedbackArgs = [
		{
			"name": "description",
			"type": "string",
			"info": "The text or description of the instruction"
		},
		{
			"name": "identifier",
			"type": "string",
			"info": "A unique identifier for this piece of instruction"
		},
		{
			"name": "media_type",
			"type": ["audio", "animation", "other"],
			"info": "The type of media that has just played"
		},
		{
			"name": "total_duration",
			"type": "int",
			"info": "The estimated duration of the media playback in milliseconds (if it ran uninterrupted)"
		}
	];

	/**
	 *  The built-in argument overrides, provides consistent arguments
	 *  order for common API calls.
	 *  @property {Object} args
	 *  @static
	 *  @readOnly
	 */
	EventCatalog.args = {
		"3010": feedbackArgs,
		"3020": feedbackArgs,
		"3021": feedbackArgs,
		"2080": [
			{
				"name": "movie_id",
				"type": "string",
				"info": "The identifier for the movie that was playing"
			},
			{
				"name": "duration",
				"type": "int",
				"info": "The duration of the media playback in milliseconds"
			},
			{
				"name": "description",
				"type": "string",
				"info": "The text or description of the instruction"
			}
		]
	};

	/**
	*  Destroy this catalog, don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.events = null;
	};

	//Assign to namespace
	namespace('springroll').EventCatalog = EventCatalog;

}());
