/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var HintsPlayer = include('springroll.HintsPlayer');

	/**
	 * Create an app plugin for Hinting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class HintsPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var HintsPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(HintsPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * The hint player API
		 * @property {springroll.HintsPlayer} hints
		 */
		this.hints = new HintsPlayer(this);
	};

	// Check for dependencies
	p.preload = function(done)
	{
		if (!this.media) throw "Hinting requires Learning Media module";

		// Send messages to the container
		if (this.container)
		{
			// Listen for manual help clicks
			this.container.on('playHelp', this.hints.play);

			// Listen whtn the hint changes
			this.hints.on('enabled', function(enabled)
			{
				this.container.send('helpEnabled', enabled);
			}
			.bind(this));
		}
		done();
	};

	// Destroy the animator
	p.teardown = function()
	{
		if (this.container)
		{
			this.container.off('playHelp');
		}
		this.hints.off('enabled');
		this.hints.destroy();
		this.hints = null;
	};

	// register plugin
	ApplicationPlugin.register(HintsPlugin);

}());