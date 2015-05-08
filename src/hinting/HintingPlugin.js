/**
 * @module Hinting
 * @namespace springroll
 * @requires Core, Game, Sound, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var HintPlayer = include('springroll.HintPlayer');

	/**
	 * Create an app plugin for Hinting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class HintingPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var HintingPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(HintingPlugin, ApplicationPlugin);

	// Init the animator
	p.setup = function()
	{
		/**
		 * The hint player API
		 * @property {springroll.HintPlayer} hint
		 */
		this.hint = new HintPlayer(this);
	};

	// Check for dependencies
	p.preload = function(done)
	{
		if (!this.messenger) throw "Hinting requires ContainerPlugin";
		if (!this.media) throw "Hinting requires LearningMedia";

		// Listen for manual help clicks
		this.messenger.on('playHelp', this.hint.play);

		// Listen whtn the hint changes
		this.hint.on('enabled', function(enabled)
		{
			this.messenger.send('helpEnabled', enabled);
		}
		.bind(this));

		done();
	};

	// Destroy the animator
	p.teardown = function()
	{
		this.messenger.off('playHelp');
		this.hint.off('enabled');
		this.hint.destroy();
		this.hint = null;
	};

	// register plugin
	ApplicationPlugin.register(HintingPlugin);

}());