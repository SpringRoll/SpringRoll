/**
 * @module EaselJS Display
 * @namespace springroll.easeljs
 * @requires Core
 */
(function(undefined)
{
	// Import createjs classes
	var AbstractDisplay = include('springroll.AbstractDisplay'),
		Stage,
		Touch;

	/**
	 * EaselJSDisplay is a display plugin for the springroll Framework
	 * that uses the EaselJS library for rendering.
	 * @class EaselJSDisplay
	 * @extends springroll.AbstractDisplay
	 * @constructor
	 * @param {String} id The id of the canvas element on the page to draw to.
	 * @param {Object} options The setup data for the EaselJS stage.
	 * @param {String} [options.stageType="stage"] If the stage should be a normal stage or a SpriteStage (use "spriteStage").
	 * @param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	 * @param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To disable them, use 0 or -1.
	 */
	var EaselJSDisplay = function(id, options)
	{
		if (!Stage)
		{
			Stage = include('createjs.Stage');
			Touch = include('createjs.Touch');
		}

		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		 * The rate at which EaselJS calculates mouseover events, in times/second.
		 * @property {int} mouseOverRate
		 * @public
		 * @default 30
		 */
		this.mouseOverRate = options.mouseOverRate || 30;

		/**
		 * If the display should keep mouse move events running when the display is disabled.
		 * @property {Boolean} keepMouseover
		 * @public
		 */
		this.keepMouseover = options.keepMouseover || false;

		if (options.stageType == "spriteStage")
		{
			// TODO: make a sprite stage (not officially released yet)
			// this.stage = new SpriteStage(id);
		}
		else
		{
			/**
			 * The rendering library's stage element, the root display object
			 * @property {createjs.Stage|createjs.SpriteStage} stage
			 * @readOnly
			 * @public
			 */
			this.stage = new Stage(id);
		}
		this.stage.autoClear = !!options.clearView;
		
		this.adapter = include('springroll.easeljs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = extend(EaselJSDisplay, AbstractDisplay);

	/**
	 * An internal helper to avoid creating an object each render
	 * while telling EaselJS the amount of time elapsed.
	 * @property DELTA_HELPER
	 * @static
	 * @private
	 */
	var DELTA_HELPER = {
		delta: 0
	};

	/**
	 * If input is enabled on the stage for this display. The default is true.
	 * @property {Boolean} enabled
	 * @public
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);

			if (value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				Touch.enable(this.stage);
			}
			else
			{
				if (this.keepMouseover)
				{
					this.stage.enableDOMEvents("keepMove");
				}
				else
				{
					this.stage.enableMouseOver(false);
					this.stage.enableDOMEvents(false);
				}
				Touch.disable(this.stage);
				// reset the cursor if it isn't disabled
				if (this.canvas.style.cursor != "none")
					this.canvas.style.cursor = "";
			}
		}
	});

	/**
	 * Updates the stage and draws it. This is only called by the Application.
	 * This method does nothing if paused is true or visible is false.
	 * @method render
	 * @internal
	 * @param {int} elapsed The time elapsed since the previous frame.
	 * @param {Boolean} [force=false] Will re-render even if the game is paused or not visible
	 */
	p.render = function(elapsed, force)
	{
		if (force || (!this.paused && this._visible))
		{
			DELTA_HELPER.delta = elapsed;
			this.stage.update(DELTA_HELPER);
		}
	};

	/**
	 * Destroys the display. This method is called by the Application and should
	 * not be called directly, use Application.removeDisplay(id).
	 * The stage recursively removes all display objects here.
	 * @method destroy
	 * @internal
	 */
	p.destroy = function()
	{
		this.stage.removeAllChildren(true);

		s.destroy.call(this);
	};

	// Assign to the global namespace
	namespace('springroll').EaselJSDisplay = EaselJSDisplay;
	namespace('springroll.easeljs').EaselJSDisplay = EaselJSDisplay;

}());