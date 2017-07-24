/**
 * An enumeration value. This class is private, and is only used by Enum.
 * ### module: @springroll/core
 * @class
 * @memberof springroll
 */
class EnumValue {

    /**
     * @param {string} name The name of the enum value.
     * @param {number} value The integer value of the enum.
     * @param {string} toString A string for toString() to return, instead of the name.
     */
    constructor(name, value, toString) {
        /**
         * The name of the value, for reflection or logging purposes.
         * @member {string}
         */
        this.name = name;

        /**
         * The integer value of this enum entry.
         * @member {number}
         * @private
         */
        this._value = value;

        /**
         * A string for toString() to return, instead of the name.
         * @member {string}
         * @private
         */
        this._toString = toString || this.name;
    }

    /**
     * The integer value of this enum entry.
     * @member {number} springroll.EnumValue#asInt
     */
    get asInt() {
        return this._value;
    }

    toString() {
        return this._toString;
    }
}

/**
 * An enumeration, similar to Enums in C#. Each value is created as an EnumValue on the Enum,
 * referenced as a property with the same name as the EnumValue.
 * ### module: @springroll/core
 * @example
 * const myEnum = new springroll.Enum(
 *     "valueOf0",
 *     "valueOf1",
 *     "valueOf2");
 * const myOtherEnum = new springroll.Enum(
 *     {name: "one", value:"1", toString:"I am the One!"},
 *     "two",
 *     {name:"screwSequentialNumbers", value:42});
 *     
 * myEnum.valueOf0 !== 0;//enum values are not integers
 * myEnum.valueOf1 !== myOtherEnum.one;//enum values are not the same as other enums
 * myEnum.valueOf2.asInt === 2;//enum values can be explicitly compared to integers
 * myOtherEnum.screwSequentialNumbers === myOtherEnum.valueFromInt(42);//can use ints to get values
 * console.log(myOtherEnum.one.toString());//outputs "I am the One!"
 *
 * for (const i in myEnum) console.log(i); //outputs "valueOf0","valueOf1","valueOf2"
 *
 * @class
 * @memberof springroll
 */
export default class Enum {
    /**
     * @param {Array|string|object} arguments The list of enumeration values. You can pass either an
     * array or a list of parameters. Each string will be
     * the previous value plus one, while objects with
     * 'name' and 'value' properties will have the specified
     * numeric value.
     */
    constructor() {
        const args = Array.isArray(arguments[0]) ?
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
         * @member {Array} springroll.Enum#rawEnumValues
         */
        Object.defineProperty(this, 'rawEnumValues',
            {
                enumerable: false,
                writable: false,
                value: args
            });

        let counter = 0;
        let item;
        let value;
        let name;

        // Create an EnumValue for each argument provided
        for (let i = 0, len = args.length; i < len; ++i) {
            if (typeof args[i] === 'string') {
                name = args[i];
            }
            else {
                name = args[i].name;
                value = args[i].value || counter;
                counter = value;
            }

            // if name already exists in Enum
            if (this[name]) {
                // @if DEBUG
                throw `Error creating enum value ${name}: ${value} - an enum value already exists with that name.`;
                // @endif
                // eslint-disable-next-line no-unreachable
                continue;
            }

            if (typeof args[i] === 'string') {
                item = new EnumValue(name, counter, name);
            }
            else {
                item = new EnumValue(name, value, args[i].toString || name);
            }

            this[item.name] = item;
            if (this._byValue[counter]) {
                if (Array.isArray(this._byValue[counter])) {
                    this._byValue[counter].push(item);
                }
                else {
                    this._byValue[counter] = [this._byValue[counter], item];
                }
            }
            else {
                this._byValue[counter] = item;
            }
            counter++;
        }

        /**
         * The count of values the enum was initialized with.
         * @member {number} springroll.Enum#length
         */
        Object.defineProperty(this, 'length',
            {
                enumerable: false,
                writable: false,
                value: args.length
            });

        /**
         * Retrieves the next EnumValue in the Enum (loops to first value at end).
         * @method springroll.Enum#next
         * @param {springroll.EnumValue} input An EnumValue to retrieve the value that follows.
         * @return {springroll.EnumValue}
         */
        Object.defineProperty(this, 'next',
            {
                enumerable: false,
                writable: false,
                // {EnumValue} input
                value: function(input) {
                    let nextInt = input.asInt + 1;
                    if (nextInt >= counter) {
                        return this.first;
                    }
                    return this.valueFromInt(nextInt);
                }
            });

        /**
         * Retrieves the first EnumValue in the Enum
         * @method springroll.Enum#first
         * @return {springroll.EnumValue}
         */
        Object.defineProperty(this, 'first',
            {
                enumerable: false,
                writable: false,
                value: this.valueFromInt(args[0].value || 0)
            });

        /**
         * Retrieves the last EnumValue in the Enum
         * @method springroll.Enum#last
         * @return {springroll.EnumValue}
         */
        Object.defineProperty(this, 'last',
            {
                enumerable: false,
                writable: false,
                value: this.valueFromInt(counter - 1)
            });
    }
}

/**
 * Gets an enum value by integer value. If you have multiple enum values with the same integer
 * value, this will always retrieve the first enum value.
 * @method springroll.Enum#valueFromInt
 * @param {number} input The integer value to get an enum value for.
 * @return {springroll.EnumValue} The EnumValue that represents the input integer.
 */
Object.defineProperty(Enum.prototype, 'valueFromInt',
    {
        enumerable: false,
        writable: false,
        value: function(input) {
            const result = this._byValue[input];
            if (result) {
                return Array.isArray(result) ? result[0] : result;
            }
            return null;
        }
    });
