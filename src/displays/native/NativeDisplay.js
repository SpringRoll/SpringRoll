/**
*  @module Native Display
*  @namespace cloudkid.native
*/
(function(undefined){

	var AbstractDisplay = include('cloudkid.AbstractDisplay');

	/**
	*   NativeDisplay is a display plugin for doing native rendering. This represents
	*   the bare minimum needed by the Application to render.
	*
	*   @class NativeDisplay
	*   @extends cloudkid.AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the display.
	*   @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	*/
	var NativeDisplay = function(id, options)
	{
		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		*  The main rendering context, typically either `CanvasRenderingContext2d` 
		*  or `WebGLRenderingContext`
		*  @property {RenderingContext}
		*  @readOnly
		*  @public
		*/
		this.stage = this.canvas.getContext(options.contextId || "2d");

		// Add the display adapter
		this.adapter = include('cloudkid.native.DisplayAdapter');
	};

	var p = NativeDisplay.prototype = Object.create(AbstractDisplay.prototype);

	// Assign to the global namespace
	namespace('cloudkid').NativeDisplay = NativeDisplay;
	namespace('cloudkid.native').NativeDisplay = NativeDisplay;

}());