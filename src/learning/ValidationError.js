/**
 * @module Learning Dispatcher
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var EventError = include('springroll.EventError');

	/**
	 *  Error when validating value by Learning Dispatcher
	 *  @class ValidationError
	 *  @extends springroll.EventError
	 *  @constructor
	 *  @param {string} message The error message
	 *  @param {string} property The name of the property
	 */
	var ValidationError = function(message, property, value)
	{
		EventError.call(this, message, null, null);

		/**
		 *  The name of the property erroring on
		 *  @property {string} property
		 */
		this.property = property;

		/**
		 *  The supplied value, if any
		 *  @property {*} value
		 */
		this.value = value;
	};

	//Extend the Error class
	var p = ValidationError.prototype = Object.create(EventError.prototype);

	//Assign the constructor
	ValidationError.prototype.constructor = ValidationError;

	/**
	 *  To string override
	 *  @method toString
	 *  @return {string} The string representation of the error
	 */
	p.toString = function()
	{
		return this.message + " [property: '" + this.property +
			"', value: '" + JSON.stringify(this.value) +
			"', eventCode: " + this.eventCode +
			", api: '" + this.api + "']";
	};

	//Assign to namespace
	namespace('springroll').ValidationError = ValidationError;
}());
