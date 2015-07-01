/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Captions = include('springroll.Captions'),
		Debug = include('springroll.Debug', false);

	/**
	 * Plugin for the Captions class, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class CaptionsPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin(60);

	// Initialize
	plugin.setup = function()
	{
		/**
		 * The captions text field object to use for the 
		 * VOPlayer captions object.
		 * @property {DOMElement|String|createjs.Text|PIXI.Text|PIXI.BitmapText} options.captions
		 * @default 'captions'
		 * @readOnly
		 */
		this.options.add('captions', 'captions', true);

		/**
		 * The path to the captions file to preload.
		 * @property {string} options.captionsPath
		 * @default null
		 * @readOnly
		 */
		this.options.add('captionsPath', null, true);
		
		/**
		*  The global captions object
		*  @property {springroll.Captions} captions
		*/
		this.captions = new Captions();
	};

	// Preload the captions
	plugin.preload = function(done)
	{
		// Give the player a reference
		if (this.voPlayer)
		{
			this.voPlayer.captions = this.captions;
		}

		// Setup the text field
		this.captions.textField = this.options.captions;

		var captionsPath = this.options.captionsPath;
		if (captionsPath)
		{
			this.loader.load(captionsPath, function(result)
			{
				this.captions.data = result.content;
				done();
			}
			.bind(this));
		}
		else
		{
			if (DEBUG && Debug)
			{
				Debug.info("Application option 'captionsPath' is empty, set to automatically load captions JSON");
			}
			done();
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.captions)
		{
			this.captions.destroy();
			this.captions = null;
		}
	};

}());