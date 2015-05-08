/**
 * @module Interface
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for touch detecting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class AnalyticsPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var AnalyticsPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(AnalyticsPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * Track a Google Analytics event
		 * @method analyticEvent
		 * @param {String} action The action label
		 * @param {String} [label] The optional label for the event
		 * @param {Number} [value] The optional value for the event
		 */
		this.analyticEvent = function(action, label, value)
		{
			this.trigger('analyticEvent',
			{
				category: this.name,
				action: action,
				label: label,
				value: value
			});
		};
	};

	// Check for application name
	p.preload = function(done)
	{
		if (!this.name)
		{
			if (DEBUG)
			{
				throw "Application name is empty, please add a Application option of 'name'";
			}
			else
			{
				throw "Application name is empty";
			}
		}
		done();
	};

	// register plugin
	ApplicationPlugin.register(AnalyticsPlugin);

}());