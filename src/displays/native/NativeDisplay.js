/**
*  @module Native Display
*  @namespace springroll.native
*/
(function(undefined){

	var AbstractDisplay = include('springroll.AbstractDisplay');

	/**
	*   NativeDisplay is a display plugin for doing native rendering. This represents
	*   the bare minimum needed by the Application to render.
	*
	*   @class NativeDisplay
	*   @extends springroll.AbstractDisplay
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
		this.adapter = include('springroll.native.DisplayAdapter');
	};

	var p = NativeDisplay.prototype = Object.create(AbstractDisplay.prototype);

	// Assign to the global namespace
	namespace('springroll').NativeDisplay = NativeDisplay;
	namespace('springroll.native').NativeDisplay = NativeDisplay;

}());