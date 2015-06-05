/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Debug;
	/**
	 * An enumeration value. This class is private, and is only used by Enum.
	 * @class EnumValue
	 * @private
	 * @constructor
	 * @param {String} name The name of the enum value.
	 * @param {int} value The integer value of the enum.
	 * @param {String} toString A string for toString() to return, instead of the name.
	 */
	var EnumValue = function(name, value, toString)
	{

		if (Debug === undefined)
			Debug = include('springroll.Debug', false);

		/**
		 * The name of the value, for reflection or logging purposes.
		 * @property {String} name
		 */
		this.name = name;
		/**
		 * The integer value of this enum entry.
		 * @property {int} _value
		 * @private
		 */
		this._value = value;
		/**
		 * A string for toString() to return, instead of the name.
		 * @property {String} _toString
		 * @private
		 */
		this._toString = toString || this.name;
	};

	/**
	 * The integer value of this enum entry.
	 * @property {int} asInt
	 */
	Object.defineProperty(EnumValue.prototype, "asInt",
	{
		get: function()
		{
			return this._value;
		}
	});

	EnumValue.prototype.toString = function()
	{
		return this._toString;
	};

	/**
	* An enumeration, similar to Enums in C#. Each value is created as an EnumValue on the Enum,
	* referenced as a property with the same name as the EnumValue. Examples:
	*
		var myEnum = new springroll.Enum(
			"valueOf0",
			"valueOf1",
			"valueOf2");
		var myOtherEnum = new springroll.Enum(
			{name: "one", value:"1", toString:"I am the One!"},
			"two",
			{name:"screwSequentialNumbers", value:42});
			
		myEnum.valueOf0 != 0;//enum values are not integers
		myEnum.valueOf1 != myOtherEnum.one;//enum values are not the same as other enums
		myEnum.valueOf2.asInt == 2;//enum values can be explicitly compared to integers
		myOtherEnum.screwSequentialNumbers == myOtherEnum.valueFromInt(42);//can use ints to get values
		console.log(myOtherEnum.one.toString());//outputs "I am the One!"

		for (var i in myEnum) console.log(i); //outputs "valueOf0","valueOf1","valueOf2"
	*
	* @class Enum
	* @constructor
	* @param {Array|String|Object} arguments 
	*  The list of enumeration values. You can pass either an
	*  array or a list of parameters. Each string will be
	*  the previous value plus one, while objects with
	*  'name' and 'value' properties will have the specified
	*  numeric value.
	*/
	var Enum = function()
	{
		var args = Array.isArray(arguments[0]) ?
			arguments[0] :
			Array.prototype.slice.call(arguments);

		/**
		 * A potentially sparse array of each enum value, stored by integer values.
		 * @property {Array} _byValue
		 * @private
		 */
		Object.defineProperty(this, '_byValue',
		{
			enumerable: false,
			writable: false,
			value: []
		});

		/**
		 * The values that this Enum was initialized with. We save this so
		 * that we can potentially pass this via Bellhop and re-initialize.
		 * @public
		 * @property {Array} rawEnumValues
		 */
		Object.defineProperty(this, 'rawEnumValues',
		{
			enumerable: false,
			writable: false,
			value: args
		});

		var counter = 0;
		var item;
		var value;
		var name;

		// Create an EnumValue for each argument provided
		for (var i = 0, len = args.length; i < len; ++i)
		{
			if (typeof args[i] == "string")
			{
				name = args[i];
			}
			else
			{
				name = args[i].name;
				value = args[i].value || counter;
				counter = value;
			}

			// if name already exists in Enum 
			if (this[name])
			{
				if (DEBUG && Debug)
				{
					Debug.error("Error creating enum value " + name + ": " + value +
						" - an enum value already exists with that name.");
				}
				continue;
			}

			item = (typeof args[i] == "string") ?
				new EnumValue(name, counter, name) :
				new EnumValue(name, value, args[i].toString || name);

			this[item.name] = item;
			if (this._byValue[counter])
			{
				if (Array.isArray(this._byValue[counter]))
				{
					this._byValue[counter].push(item);
				}
				else
				{
					this._byValue[counter] = [this._byValue[counter], item];
				}
			}
			else
			{
				this._byValue[counter] = item;
			}
			counter++;
		}

		/**
		 * The count of values the enum was initialized with.
		 * @public
		 * @property {int} length
		 */
		Object.defineProperty(this, 'length',
		{
			enumerable: false,
			writable: false,
			value: args.length
		});

		/**
		 * Retrieves the next EnumValue in the Enum (loops to first value at end).
		 * @method {EnumValue} input
		 * @return {EnumValue}  
		 */
		Object.defineProperty(this, 'next',
		{
			enumerable: false,
			writable: false,
			// {EnumValue} input
			value: function(input)
			{
				var nextInt = input.asInt + 1;
				if (nextInt >= counter)
				{
					return this.first;
				}
				return this.valueFromInt(nextInt);
			}
		});

		/**
		 * Retrieves the first EnumValue in the Enum
		 * @method {EnumValue} input
		 * @return {EnumValue}  
		 */
		Object.defineProperty(this, 'first',
		{
			enumerable: false,
			writable: false,
			value: this.valueFromInt(args[0].value || 0)
		});

		/**
		 * Retrieves the last EnumValue in the Enum
		 * @method {EnumValue} input
		 * @return {EnumValue}  
		 */
		Object.defineProperty(this, 'last',
		{
			enumerable: false,
			writable: false,
			value: this.valueFromInt(counter-1)
		});
	};

	/**
	 * Gets an enum value by integer value. If you have multiple enum values with the same integer
	 * value, this will always retrieve the first enum value.
	 * @method {Array} valueFromInt
	 * @param {int} input The integer value to get an enum value for.
	 * @return {EnumValue} The EnumValue that represents the input integer.
	 */
	Object.defineProperty(Enum.prototype, 'valueFromInt',
	{
		enumerable: false,
		writable: false,
		value: function(input)
		{
			var rtn = this._byValue[input];
			if (rtn)
			{
				return Array.isArray(rtn) ? rtn[0] : rtn;
			}
			return null;
		}
	});

	namespace('springroll').Enum = Enum;
}());