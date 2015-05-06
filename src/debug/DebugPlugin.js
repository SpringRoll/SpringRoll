/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Debug = include('springroll.Debug');

	/**
	 * Create an app plugin for Debug, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class DebugPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var DebugPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(DebugPlugin, ApplicationPlugin);

	// Init the animator
	p.init = function()
	{
		/**
		 * Enable the Debug class. After initialization, this
		 * is a pass-through to Debug.enabled.
		 * @property {Boolean} debug
		 * @default false
		 */
		this.options.add('debug', false);

		/**
		 * Minimum log level from 0 to 4
		 * @property {int} minLogLevel
		 * @default 0
		 */
		this.options.add('minLogLevel', 0);

		/**
		 * The host computer for remote debugging, the debug
		 * module must be included to use this feature. Can be an
		 * IP address or host name. After initialization, setting
		 * this will still connect or disconect Debug for remote
		 * debugging. This is a write-only property.
		 * @property {String} debugRemote
		 */
		this.options.add('debugRemote', null)
		.respond('debug', function()
		{
			return Debug ? Debug.enabled : false;
		})
		.on('debug', function(value)
		{
			if (Debug) Debug.enabled = value;
		})
		.on('debugRemote', function(value)
		{
			if (Debug)
			{
				Debug.disconnect();
				if (value)
				{
					Debug.connect(value);
				}
			}
		})
		.respond('minLogLevel', function()
		{
			return Debug ? Debug.minLogLevel.asInt : 0;
		})
		.on('minLogLevel', function(value)
		{
			if (Debug)
			{
				Debug.minLogLevel = Debug.Levels.valueFromInt(
					parseInt(value, 10)
				);

				if (!Debug.minLogLevel)
				{
					Debug.minLogLevel = Debug.Levels.GENERAL;
				}
			}
		});
	};

	// Destroy the animator
	p.destroy = function()
	{
		Debug.disconnect();
	};

	// register plugin
	ApplicationPlugin.register(DebugPlugin);

}());