/**
 * @module Learning
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	 * General errors when using the Learning Dispatcher
	 * @class LearningError
	 * @extends Error
	 * @constructor
	 * @private
	 * @param {string} message The error message
	 * @param {int} eventCode The number of the event
	 */
	var LearningError = function(message)
	{
		var e = Error.call(this, message);

		/**
		 * The error message
		 * @property {string} message
		 */
		this.message = message;

		/**
		 * The stack trace
		 * @property {string} stack
		 */
		this.stack = e.stack;
	};

	//Extend the Error class
	var p = extend(LearningError, Error);

	//Assign the constructor
	p.constructor = LearningError;

	/**
	 * To string override
	 * @method toString
	 * @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message;
	};

	//Assign to namespace
	namespace('springroll').LearningError = LearningError;

}());
