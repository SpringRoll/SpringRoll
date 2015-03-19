/**
 *  @module Progress Tracker
 *  @namespace springroll
 */
(function()
{
	//Import class
	var ProgressTrackerError = include('springroll.ProgressTrackerError');

	/**
	 *  General errors when using the Progress Tracker
	 *  @class EventError
	 *  @extends springroll.ProgressTrackerError
	 *  @constructor
	 *  @param {string} message The error message
	 *  @param {int} eventCode The number of the event
	 */
	var EventError = function(message, eventCode, api)
	{
		ProgressTrackerError.call(this, message);

		/**
		 *  The name of the property erroring on
		 *  @property {int} eventCode
		 */
		this.eventCode = eventCode;

		/**
		 *  The name of the API method errored on
		 *  @property {string} api
		 */
		this.api = api;

		/**
		 *  The definition of the API and all it's arguments
		 *  @property {springroll.EventSignature} signature
		 */
		this.signature = null;
	};

	//Extend the Error class
	var p = extend(EventError, ProgressTrackerError);

	//Assign the constructor
	p.constructor = EventError;

	/**
	 *  To string override
	 *  @method toString
	 *  @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message + " [eventCode: " + this.eventCode +
			", api: '" + this.api + "']";
	};

	//Assign to namespace
	namespace('springroll').EventError = EventError;
}());
