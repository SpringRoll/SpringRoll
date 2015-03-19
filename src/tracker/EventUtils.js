/**
 *  @module Progress Tracker
 *  @namespace springroll
 */
(function()
{
	//Import classes
	var ValidationError = include('springroll.ValidationError'),
		EventError = include('springroll.EventError'),
		EventCatalog = include('springroll.EventCatalog');

	/**
	 *  Utility class for handling events
	 *  @class EventUtils
	 *  @static
	 */
	var EventUtils = {};

	/**
	 *  Convert an array of input arguments into a data map
	 *  @method argsMap
	 *  @static
	 *  @param {Array} allArgs All the event arguments
	 *  @param {array} inputs The data to validate
	 *  @return {Object} The validated event data object
	 */
	EventUtils.argsMap = function(allArgs, inputs)
	{
		var i, arg, args = [],
			data = {};

		//Ignore the arguments we don't care about
		for (i = 0; i < allArgs.length; i++)
		{
			arg = allArgs[i];

			if (EventCatalog.globals.indexOf(arg.name) === -1)
			{
				args.push(arg);
			}
		}

		if (args.length != inputs.length)
		{
			throw new EventError("Arguments length doesn't match the API, expected " +
				args.length + " but got " + inputs.length);
		}

		for (i = 0; i < args.length; i++)
		{
			arg = args[i];
			data[arg.name] = inputs.shift();
		}
		return data;
	};

	/**
	 *  Validate arguments
	 *  @method validate
	 *  @static
	 *  @param {Array} args The event arguments
	 *  @param {object} inputs The data to validate
	 *  @return {Object} The validated event data object
	 */
	EventUtils.validate = function(args, inputs)
	{
		var arg, input, data = {};

		for (var i = 0, len = args.length; i < len; i++)
		{
			arg = args[i];

			//We don't care about these arguments
			if (EventCatalog.globals.indexOf(arg.name) !== -1)
			{
				continue;
			}
			arg = args[i];
			input = inputs[arg.name];

			if (input === undefined)
			{
				throw new EventError("No value found for argument '" + arg.name + "'");
			}
			validateValue(arg.type, input, arg.args || null, arg.name);
			data[arg.name] = input;
		}
		return data;
	};

	/**
	 *  Do the actual type validation on a specific value
	 *  @method _validate
	 *  @private
	 *  @constructor
	 *  @param {string|Array} type The type of value, if an array a set of valid items
	 *  @param {*} value The value to test against
	 *  @param {array} args The list of properties to validate if a typed object
	 */
	var validateValue = function(type, value, args, parent)
	{
		//Check for empty values
		if (value === undefined || value === null)
		{
			throw new ValidationError("Supplied value is empty", parent, value);
		}

		//wildcard don't validate
		if (type === "*") return;

		//validate vanilla strings, ints and numbers
		if ((type === "string" && typeof value !== type) ||
			(type === "int" && parseInt(value) !== value) ||
			(type === "number" && parseFloat(value) !== value) ||
			(type === "array" && !Array.isArray(value)) ||
			(type === "boolean" && typeof value !== type) ||
			(type === "object" && typeof value !== type))
		{
			throw new ValidationError("Not a valid " + type, parent, value);
		}

		var i, len;

		//Can check for typed arrays, such as an array
		//filled with only ints, strings or numbers
		if (/^array\-\>(int|boolean|string|number|array|object)$/.test(type))
		{
			if (!Array.isArray(value))
			{
				throw new ValidationError(
					"Not a valid " + type,
					parent,
					value
				);
			}

			//Validate each argument on the array
			var arrayType = type.replace("array->", "");
			for (i = 0, len = value.length; i < len; i++)
			{
				try
				{
					validateValue(arrayType, value[i], args, parent);
				}
				catch (e)
				{
					throw new ValidationError(
						"Invalid " + type + " at index " + i,
						parent,
						value
					);
				}
			}
		}

		//Validate set items
		if (Array.isArray(type) && type.indexOf(value) === -1)
		{
			throw new ValidationError(
				"Value is not valid in set",
				parent,
				value
			);
		}

		//Validate properties of an object
		if (type === "object" && !!args)
		{
			len = args.length;
			for (i = 0; i < len; i++)
			{
				var prop = args[i];
				validateValue(
					prop.type,
					value[prop.name],
					prop.args,
					parent + "." + prop.name
				);
			}
		}
	};

	//Assign to namespace
	namespace('springroll').EventUtils = EventUtils;
}());
