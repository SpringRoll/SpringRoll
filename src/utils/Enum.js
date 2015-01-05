/**
*  @module Core
*  @namespace springroll
*/
(function() {
	
	/**
	*  An enumeration value. This class is private, and is only used by Enum.
	*  @class EnumValue
	*  @private
	*  @constructor
	*  @param {String} name The name of the enum value.
	*  @param {int} value The integer value of the enum.
	*  @param {String} toString A string for toString() to return, instead of the name.
	*/
	var EnumValue = function(name, value, toString)
	{
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
	Object.defineProperty(EnumValue.prototype, "asInt", {
		get: function() { return this._value; }
	});
	EnumValue.prototype.toString = function()
	{
		return this._toString;
	};
	
	/**
	*  An enumeration, similar to Enums in C#. Each value is created as an EnumValue on the Enum,
	*  referenced as a property with the same name as the EnumValue. Examples:
	*
		var myEnum = new springroll.Enum("valueOf0",
										"valueOf1",
										"valueOf2");
		var myOtherEnum = new springroll.Enum({name: "one", value:"1", toString:"I am the One!"},
											"two",
											{name:"screwSequentialNumbers", value:42});
		myEnum.valueOf0 != 0;//enum values are not integers
		myEnum.valueOf1 != myOtherEnum.one;//enum values are not the same as other enums
		myEnum.valueOf2.asInt == 2;//enum values can be explicitly compared to integers
		myOtherEnum.screwSequentialNumbers == myOtherEnum.valueFromInt(42);//can use ints to get values
		console.log(myOtherEnum.one.toString());//outputs "I am the One!"
	*
	*  @class Enum
	*  @constructor
	*  @param {Array|String|Object} arguments The list of enumeration values. You can pass either an
	*                                         array or a list of parameters. Each string will be
	*                                         the previous value plus one, while objects with
	*                                         'name' and 'value' properties will have the specified
	*                                         numeric value.
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
		this._byValue = [];
		var counter = 0, item, i, value, name;
		//create each value
		for(i = 0; i < args.length; ++i)
		{
			if(typeof args[i] == "string")
			{
				name = args[i];
				if(this[name])
				{
					Debug.error("Error creating enum value " + name + ": " + value + " - an enum value already exists with that name.");
					continue;
				}
				item = this._byValue[counter] = new EnumValue(name, counter, name);
				this[item.name] = item;
			}
			else
			{
				name = args[i].name;
				value = args[i].value || counter;
				if(this._byValue[value])
				{
					Debug.error("Error creating enum value " + name + ": " + value + " - an enum value already exists with that integer value.");
					continue;
				}
				else if(this[name])
				{
					Debug.error("Error creating enum value " + name + ": " + value + " - an enum value already exists with that name.");
					continue;
				}
				item = new EnumValue(name, value, args[i].toString || name);
				this[item.name] = item;
				this._byValue[item._value] = item;
				counter = item._value;
			}
			counter++;
		}
	};
	
	/**
	* A potentially sparse array of each enum value, stored by integer values.
	* @method {Array} valueFromInt
	* @param {int} input The integer value to get an enum value for.
	* @return {EnumValue} The EnumValue that represents
	*/
	Enum.prototype.valueFromInt = function(input)
	{
		return this._byValue[input] || null;
	};

	namespace('springroll').Enum = Enum;
}());