/**
 * @module Debug
 * @namespace springroll
 */
(function()
{
	/**
	 * Class for display a list of query string options
	 * nicely in the console.
	 * @class DebugOptions
	 */
	var DebugOptions = {};

	/**
	 * The space between columns
	 * @property {int} COLUMN_BUFFER
	 * @private
	 * @readOnly
	 * @final
	 */
	var COLUMN_BUFFER = 4;

	/**
	 * The collections of options
	 * @property {array} _options
	 * @private
	 */
	var _options = [];

	/**
	 * The maximum length of the label column
	 * @property {array} _maxLabel
	 * @private
	 */
	var _maxLabel = 0;

	/**
	 * The maximum length of the type column
	 * @property {array} _maxType
	 * @private
	 */
	var _maxType = 0;

	/**
	 * Config object for the CSS styles throughout
	 * @property {Object} CSS
	 * @private
	 * @readOnly
	 * @final
	 */
	var CSS = {
		HEADER: 'color: #FF4136; font-size: 1.2em; text-decoration:underline;', //orange-red color
		LABEL: 'color: #2ECC40;', //green
		TYPE: 'color: #0074D9;', //blue
		DESC: 'color: #FF851B' //orange
	};

	/**
	 * The header for the final log
	 * @property {String} HEADER
	 * @private
	 * @readOnly
	 * @final
	 */
	var HEADER = '\n%cQuery Debug Options:\n%c';

	/**
	 * The map of different basic types of options.
	 * @property {String} TYPES
	 * @private
	 * @readOnly
	 * @final
	 */
	var TYPES = {
		INT: 'int',
		NUMBER: 'number',
		STRING: 'string',
		BOOLEAN: 'boolean'
	};

	/**
	 * Define a int query parameter.
	 * @method int
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.int = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.INT, desc);
	};

	/**
	 * Define a boolean query parameter
	 * @method boolean
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.boolean = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.BOOLEAN, desc);
	};

	/**
	 * Define a string query parameter
	 * @method string
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.string = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.STRING, desc);
	};

	/**
	 * Define a number query parameter
	 * @method number
	 * @param {string} label The label for the options
	 * @param {string} desc Description of values the option can accept
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.number = function(label, desc)
	{
		return DebugOptions.add(label, TYPES.NUMBER, desc);
	};

	/**
	 * Define a number query parameter
	 * @method add
	 * @param {string} label The label for the options
	 * @param {string} type The type of value the option accepts
	 * @param {string} [desc] Description of values the option can accept
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.add = function(label, type, desc)
	{
		_maxLabel = Math.max(label.length, _maxLabel);
		_maxType = Math.max(type.length, _maxType);
		_options.push(
		{
			label: label,
			type: type,
			desc: desc
		});
		return DebugOptions;
	};

	/**
	 * Build the log and final argument array for the
	 * options output console.log();
	 * @method log
	 * @static
	 */
	DebugOptions.log = function()
	{
		// The concatinated output string
		var output = HEADER;

		// The CSS options to pass to console.log
		var css = [
			// The style for the header's text
			CSS.HEADER,
			// A 'reset' CSS that prevents the color/size of the header
			// from leaking into the first option logged
			'display:none'
		];

		// add the buffer to the max label
		// and type lengths
		_maxLabel += COLUMN_BUFFER;
		_maxType += COLUMN_BUFFER;
		var newLineSpacer = spacer(_maxLabel + _maxType + COLUMN_BUFFER);

		var option;
		var len = _options.length;

		for (var i = 0; i < len; i++)
		{
			option = _options[i];
			// tab label
			output += '\t%c' + spacer(_maxLabel, option.label);
			// tab type
			output += '%c' + spacer(_maxType, option.type);
			// null-string if no desc
			if (option.desc)
			{
				option.desc = option.desc.replace(
					/(\r\n|\n|\r)/gm,
					'\n' + newLineSpacer);
				output += ('%c' + option.desc);
			}
			// new line
			output += '\n';

			css.push(CSS.LABEL, CSS.TYPE);

			// only push the CSS for the description
			// if the description exists
			if (option.desc)
			{
				css.push(CSS.DESC);
			}
		}

		// Send the console an argument list,
		// the first item is the entire formatted string of
		// options, with the 2nd onward args being all the CSS
		// in corresponding order with the %c formatting symbols
		// in the formatted string.
		console.log.apply(console, [output + '\n'].concat(css));
	};

	/**
	 * Forget all the options that have been remembered
	 * @method reset
	 * @static
	 * @return {pbskids.DebugOptions} instance of this DebugOptions for chaining
	 */
	DebugOptions.reset = function()
	{
		_options.length = [];
		_maxLabel = 0;
		_maxType = 0;

		return DebugOptions;
	};

	/**
	 * Generate a spacer slug. Returned object is concatenated
	 * space character, i.e. ' ', to the specified count.
	 * @method spacer
	 * @private
	 * @param {int} count How many characters the spacer needs
	 * @param {string} str The input string to add spaces to
	 * @return {string}
	 */
	var spacer = function(count, str)
	{
		if (str)
		{
			while (str.length < count)
			{
				str += ' '; //space
			}
		}
		else
		{
			str = ' '; //initial space is necessary?
			while (--count)
			{
				str += ' '; //space
			}
		}
		return str;
	};

	//Assign to namespace
	namespace('springroll').DebugOptions = DebugOptions;
}());