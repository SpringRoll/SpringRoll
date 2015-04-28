/**
 * @module Learning Dispatcher
 * @namespace springroll
 * @requires Core
 */
(function()
{
	//Import classes
	var EventCatalog = include('springroll.EventCatalog');

	/**
	 *  Define the signature of the api
	 *  @class EventSignature
	 *  @constructor
	 *  @param {string} api The name of the API
	 *  @param {array} [args] The list of arguments to be called
	 *  @param {string} [info] The info description of the API
	 */
	var EventSignature = function(eventCode, api, args, eventArgs, info)
	{
		/**
		 *  The event code
		 *  @property {string} eventCode
		 */
		this.eventCode = eventCode;

		/**
		 *  The name of the method
		 *  @property {string} api
		 */
		this.api = api;

		/**
		 *  The arguments to be called by the API
		 *  @property {array} args
		 */
		this.args = args || null;

		/**
		 *  The arguments required by the spec
		 *  @property {array} eventArgs
		 */
		this.eventArgs = eventArgs || null;

		/**
		 *  The API description
		 *  @property {string} info
		 */
		this.info = info || null;
	};

	//Reference to the prototype
	var p = EventSignature.prototype;

	/**
	 *  See if the event args or the api args has an property by name
	 *  @method hasProperty
	 *  @param {string}  property The name of the argument
	 *  @param {Boolean} [isEventArg=false] If we're checking on the event args, default
	 *         checks on the API arguments.
	 *  @return {Boolean} If the property is found
	 */
	p.hasProperty = function(property, isEventArg)
	{
		var args = !!isEventArg ? this.eventArgs : this.args;

		if (!args || !args.length)
		{
			return false;
		}
		for (var i = 0, len = args.length; i < len; i++)
		{
			if (property === args[i].name)
			{
				return true;
			}
		}
		return false;
	};

	if (DEBUG)
	{
		/**
		 *  Generate documentation, development build only!
		 *  @method docs
		 */
		p.docs = function()
		{
			var html = '<div class="pt-row collapsed" id="pt-api-' + this.api + '">' +
				'<div class="pt-api">' + this.api +
				'<span class="pt-event-code">' + this.eventCode + '</span>' +
				'<span class="pt-toggle"></span></div>';

			if (this.info)
			{
				html += '<div class="pt-api-info">' + this.info + '</div>';
			}
			html += this._argsDocs(this.args, EventCatalog.globals);
			html += '</div>';

			return html;
		};

		/**
		 *  Create the markup for the arguments
		 *  @method _argsDocs
		 *  @private
		 *  @param {array} args The list of arguments
		 *  @param {array} ignoreNames Ignore any name matching these collection of string
		 *  @return {string} The markup
		 */
		p._argsDocs = function(args, ignoreNames)
		{
			var html = "";

			if (args && args.length)
			{
				html += '<ul class="pt-api-args">';
				for (var i = 0, arg, type, len = args.length; i < len; i++)
				{
					arg = args[i];

					var argName = arg.name;
					//Don't document global arguments
					if (ignoreNames && ignoreNames.indexOf(argName) !== -1)
					{
						continue;
					}

					html += '<li class="pt-arg arg-' + argName + '">';
					html += '<span class="pt-arg-name">' + argName + '</span>';

					var argType = arg.type;
					type = Array.isArray(argType) ?
						JSON.stringify(argType) :
						argType;

					html += '<span class="pt-arg-type">' + type + '</span>';

					if (arg.optional)
					{
						html += '<span class="pt-arg-optional">(optional)</span>';
					}
					if (arg.info)
					{
						html += '<span class="pt-arg-info">' + arg.info + '</span>';
					}

					//Recursive arguments for objects which contain
					//additional arguments
					if (arg.args)
					{
						html += this._argsDocs(arg.args);
					}
					html += '</li>';
				}
				html += '</ul>';
			}
			return html;
		};
	}

	if (RELEASE)
	{
		//no documentation in release, but don't break public api
		p.docs = function()
		{
			return "";
		};
	}

	/**
	 *  Get the api signature of a method
	 *  @method _format
	 *  @private
	 *  @param {array} args The API arguments
	 *  @param {string} [indent="\t"] The indentation
	 *  @return {string} The signature api
	 */
	p._format = function(args, indent)
	{
		var api = "";
		indent = indent || "\t";
		if (args && args.length)
		{
			api += "\n";
			var arg;
			var len = args.length;
			for (var i = 0; i < len; i++)
			{
				arg = args[i];

				api += indent + arg.name + ":";
				var argType = arg.type;
				if (Array.isArray(argType))
				{
					api += "[" + argType.join(", ") + "]";
				}
				else
				{
					api += argType;
				}

				if (arg.args)
				{
					api += " {";
					api += this._format(arg.args, indent + "\t");
					api += "\n" + indent + "}";
				}

				if (i < len - 1)
				{
					api += ",";
				}
				api += "\n";
			}
		}
		return api;
	};

	/**
	 *  Get the string representation of the signature
	 *  @method toString
	 *  @return {string} The string version of the signature
	 */
	p.toString = function()
	{
		return this.api + " (" + this._format(this.args) + ")";
	};

	//Assign to namespace
	namespace('springroll').EventSignature = EventSignature;
}());
