/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{
	var EventDispatcher = include('springroll.EventDispatcher');

	/**
	 * The display provides the base properties for all custom display. A display
	 * is a specialized view for the application. As the name suggests, this class
	 * should not be instanciated directly.
	 *
	 * @class AbstractDisplay
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @private
	 * @param {String} id The id of the canvas element on the page to draw to.
	 * @param {Object} options The setup data for the display.
	 * @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	 */
	var AbstractDisplay = function(id, options)
	{
		EventDispatcher.call(this);

		options = options ||
		{};

		/**
		 * the canvas managed by this display
		 * @property {DOMElement} canvas
		 * @readOnly
		 * @public
		 */
		this.canvas = document.getElementById(id);

		/**
		 * The DOM id for the canvas
		 * @property {String} id
		 * @readOnly
		 * @public
		 */
		this.id = id;

		/**
		 * Convenience method for getting the width of the canvas element
		 * would be the same thing as canvas.width
		 * @property {int} width
		 * @readOnly
		 * @public
		 */
		this.width = this.canvas.width;

		/**
		 * Convenience method for getting the height of the canvas element
		 * would be the same thing as canvas.height
		 * @property {int} height
		 * @readOnly
		 * @public
		 */
		this.height = this.canvas.height;

		/**
		 * The main rendering context or the root display object or stage.
		 * @property {mixed} stage
		 * @readOnly
		 * @public
		 */
		this.stage = null;

		/**
		 * If rendering is paused on this display only. Pausing all displays can be done
		 * using Application.paused setter.
		 * @property {Boolean} paused
		 * @public
		 */
		this.paused = false;

		/**
		 * If input is enabled on the stage.
		 * @property {Boolean} _enabled
		 * @private
		 */
		this._enabled = false;

		/**
		 * If the display is visible.
		 * @property {Boolean} _visible
		 * @private
		 */
		this._visible = this.canvas.style.display != "none";

		/**
		 * Some of the modules require a special display adapter to provide
		 * common methods for managing display objects.
		 * @property {DisplayAdapter} adapter
		 * @readOnly
		 * @public
		 * @default null
		 */
		this.adapter = null;
	};

	var p = EventDispatcher.extend(AbstractDisplay);

	/**
	 * If input is enabled on the stage for this display. The default is true.
	 * Without a rendering library, this does not actually have an effect.
	 * @property {Boolean} enabled
	 * @public
	 */
	Object.defineProperty(p, "enabled",
	{
		// enabled getter
		get: function()
		{
			return this._enabled;
		},
		// enabled setter
		set: function(value)
		{
			var oldEnabled = this._enabled;
			this._enabled = value;

			if (oldEnabled != value)
			{
				/**
				 * If the display becomes enabled
				 * @event enabled
				 */

				/**
				 * If the display becomes disabled
				 * @event disabled
				 */
				this.trigger(value ? 'enabled' : 'disabled');

				/**
				 * Enabled state changed on the display
				 * @event enable
				 * @param {Boolean} enabled Current state of enabled
				 */
				this.trigger('enable', value);
			}
		}
	});

	/**
	 * If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	 * @property {Boolean} visible
	 * @public
	 */
	Object.defineProperty(p, "visible",
	{
		// visible getter
		get: function()
		{
			return this._visible;
		},
		// visible setter
		set: function(value)
		{
			var oldVisible = this._visible;
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";

			if (oldVisible != value)
			{
				/**
				 * If the display becomes visible
				 * @event visible
				 */

				/**
				 * If the display becomes hidden
				 * @event hidden
				 */
				this.trigger(value ? 'visible' : 'hidden');

				/**
				 * Visibility changed on the display
				 * @event visibility
				 * @param {Boolean} visible Current state of the visibility
				 */
				this.trigger('visibility', value);
			}
		}
	});

	/**
	 * Resizes the canvas. This is only called by the Application.
	 * @method resize
	 * @param {int} width The width that the display should be
	 * @param {int} height The height that the display should be
	 */
	p.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	};

	/**
	 * Updates the stage and draws it. This is only called by the Application.
	 * This method does nothing if paused is true or visible is false.
	 * @method render
	 * @param {int} elapsed The time elapsed since the previous frame.
	 * @param {Boolean} [force=false] For the re-render
	 */
	p.render = function(elapsed, force)
	{
		// implement specific
	};

	/**
	 * Destroys the display. This method is called by the Application and should
	 * not be called directly, use Application.removeDisplay(id).
	 * The stage recursively removes all display objects here.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.enabled = false;
		this.adapter = null;
		this.stage = null;
		if (this.canvas.parentNode)
		{
			this.canvas.parentNode.removeChild(this.canvas);
		}
		this.canvas.onmousedown = null;
		this.canvas = null;
	};

	// Assign to the global namespace
	namespace('springroll').AbstractDisplay = AbstractDisplay;

}());