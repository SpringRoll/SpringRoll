/**
*  @module Framework
*  @namespace springroll
*/
(function(undefined){

	/**
	*   The display provides the base properties for all custom display. A display
	*   is a specialized view for the application. As the name suggests, this class
	*   should not be instanciated directly.
	*
	*   @class AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the display.
	*   @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	*/
	var AbstractDisplay = function(id, options)
	{
		options = options || {};

		/**
		*  the canvas managed by this display
		*  @property {DOMElement} canvas
		*  @readOnly
		*  @public
		*/
		this.canvas = document.getElementById(id);

		/**
		*  The DOM id for the canvas
		*  @property {String} id
		*  @readOnly
		*  @public
		*/
		this.id = id;

		/**
		*  Convenience method for getting the width of the canvas element
		*  would be the same thing as canvas.width
		*  @property {int} width
		*  @readOnly
		*  @public
		*/
		this.width = this.canvas.width;

		/**
		*  Convenience method for getting the height of the canvas element
		*  would be the same thing as canvas.height
		*  @property {int} height
		*  @readOnly
		*  @public
		*/
		this.height = this.canvas.height;

		/**
		*  The main rendering context or the root display object or stage.
		*  @property {mixed} stage
		*  @readOnly
		*  @public
		*/
		this.stage = null;

		/**
		*  If rendering is paused on this display only. Pausing all displays can be done
		*  using Application.paused setter.
		*  @property {Boolean} paused
		*  @public
		*/
		this.paused = false;

		/**
		*  If input is enabled on the stage.
		*  @property {Boolean} _enabled
		*  @private
		*/
		this._enabled = false;

		/**
		*  If the display is visible.
		*  @property {Boolean} _visible
		*  @private
		*/
		this._visible = this.canvas.style.display != "none";

		// prevent mouse down turning into text cursor
		this.canvas.onmousedown = function(e)
		{
			e.preventDefault();
		};

		/**
		*  The Animator class to use when using this display. Other modules
		*  uses this to determine what Animator to use, for instance states
		*  uses Animator when playing transition animations.
		*  @property {Animator} animator
		*  @readOnly
		*  @public
		*  @default null
		*/
		this.animator = null;

		/**
		*  Some of the modules require a special display adapter to provide
		*  common methods for managing display objects.
		*  @property {DisplayAdapter} adapter
		*  @readOnly
		*  @public
		*  @default null
		*/
		this.adapter = null;
	};

	var p = AbstractDisplay.prototype;

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  Without a rendering library, this does not actually have an effect.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
		}
	});

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
		}
	});

	/**
	* Resizes the canvas. This is only called by the Application.
	* @method resize
	* @internal
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
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.animator = null;
		this.adapter = null;
		this.canvas.onmousedown = null;
		this.canvas = null;
	};

	// Assign to the global namespace
	namespace('springroll').AbstractDisplay = AbstractDisplay;

}());