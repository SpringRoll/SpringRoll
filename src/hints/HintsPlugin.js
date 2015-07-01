/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		HintsPlayer = include('springroll.HintsPlayer');

	/**
	 * Create an app plugin for Hinting, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class HintsPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();
	
	// Init the animator
	plugin.setup = function()
	{
		/**
		 * The hint player API
		 * @property {springroll.HintsPlayer} hints
		 */
		this.hints = new HintsPlayer(this);
	};

	// Check for dependencies
	plugin.preload = function(done)
	{
		if (!this.display.animator)
		{
			if (DEBUG)
			{
				throw "Hints requires the CreateJS or PIXI Animator to run";
			}
			else
			{
				throw "No animator";
			}
		}

		if (!this.voPlayer) 
		{
			if (DEBUG)
			{
				throw "Hints requires the Sound module to be included";
			}
			else
			{
				throw "No sound";
			}
		}

		// Listen for events
		this.hints.on({
			vo: onVOHint.bind(this), 
			anim: onAnimatorHint.bind(this)
		});

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

	/**
	* Handle the VO event
	* @method onVOHint
	* @private
	* @param {object} data The VO data
	*/
	var onVOHint = function(data)
	{
		if (!!this.media)
		{
			this.media.playInstruction(
				data.events,
				data.complete,
				data.cancel
			);
		}
		else
		{
			this.voPlayer.play(
				data.events,
				data.complete,
				data.cancel
			);
		}
	};

	/**
	* Handle the animator event
	* @method onAnimatorHint
	* @private
	* @param {object} data The animator data
	*/
	var onAnimatorHint = function(data)
	{
		if (!!this.media)
		{
			this.media.playInstruction(
				data.instance,
				data.events,
				data.complete,
				data.cancel
			);
		}
		else
		{
			this.display.animator.play(
				data.instance,
				data.events,
				data.complete,
				data.cancel
			);
		}	
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.container)
		{
			this.container.off('playHelp');
		}
		if (this.hints)
		{
			this.hints.off('enabled vo anim');
			this.hints.destroy();
			this.hints = null;
		}
	};

}());