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
	var CaptionsPlugin = function()
	{
		ApplicationPlugin.call(this);
		this.priority = 2;
	};

	// Reference to the prototype
	var p = extend(CaptionsPlugin, ApplicationPlugin);

	// Initialize
	p.setup = function()
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
		 * @default 'assets/config/captions.json'
		 * @readOnly
		 */
		this.options.add('captionsPath', 'assets/config/captions.json', true);
		
		/**
		*  The global captions object
		*  @property {springroll.Captions} captions
		*/
		this.captions = new Captions();

		/**
		*  Sets the dicitonary for the captions used by player. If a Captions object
		*  did not exist previously, then it creates one, and sets it up on all Animators.
		*  @method addCaptions
		*  @param {Object} data The captions data to give to the Captions object
		*/
		this.addCaptions = function(data)
		{
			// Update the player captions
			this.captions.data = data;
		};
	};

	// Preload the captions
	p.preload = function(done)
	{
		// Give the player a reference
		if (this.player)
		{
			this.player.captions = this.captions;
		}

		// Setup the text field
		this.captions.textField = this.options.captions;

		var captionsPath = this.options.captionsPath;
		if (captionsPath)
		{
			this.loader.load(captionsPath, function(result)
			{
				this.addCaptions(result.content);
				done();
			}
			.bind(this));
		}
		else
		{
			done();
		}
	};

	// Destroy the animator
	p.teardown = function()
	{
		if (this.captions)
		{
			this.captions.destroy();
			this.captions = null;
		}
	};

	// register plugin
	ApplicationPlugin.register(CaptionsPlugin);

}());