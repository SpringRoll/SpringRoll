/**
*  @module Generic Display
*  @namespace cloudkid
*/
(function(undefined){

	var AbstractDisplay = include('cloudkid.AbstractDisplay');

	/**
	*   GenericDisplay is a display plugin for doing native rendering. This represents
	*   the bare minimum needed by the Application to render.
	*
	*   @class GenericDisplay
	*   @extends AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the display.
	*   @param {String} [options.contextId="2d"] Valid options are "2d" and "webgl"
	*/
	var GenericDisplay = function(id, options)
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
	};

	var p = GenericDisplay.prototype = Object.create(AbstractDisplay.prototype);

	// Assign to the global namespace
	namespace('cloudkid').GenericDisplay = GenericDisplay;

}());