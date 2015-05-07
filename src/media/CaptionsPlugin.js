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
	};

	// Reference to the prototype
	var p = extend(CaptionsPlugin, ApplicationPlugin);

	// Initialize
	p.init = function()
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
		this.captions = null;

		/**
		*  Sets the dicitonary for the captions used by player. If a Captions object
		*  did not exist previously, then it creates one, and sets it up on all Animators.
		*  @method addCaptions
		*  @param {Object} captionData The captions data to give to the Captions object
		*/
		this.addCaptions = function(captionData)
		{
			if (!this.captions)
			{
				// Create the new captions
				var captions = new Captions(captionData, this.options.captions);
				
				if (this.player)
				{
					this.player.captions = captions;
				}
				else if (DEBUG && Debug)
				{
					Debug.warn("The VOPlayer is not setup, cannot add captions to it.");
				}
				this.captions = captions;
				
				// Give the display to the animators
				this.getDisplays(function(display)
				{
					// ensure that displays without 
					// Animators don't break anything
					if(display.animator)
					{
						display.animator.captions = captions;
					}
				});
			}
			else
			{
				// Update the player captions
				this.captions.setDictionary(captionData);
			}
		};
	};

	// Preload the captions
	p.ready = function(done)
	{
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
	p.destroy = function()
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