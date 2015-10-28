/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI InteractionManager class
	 *  @class InteractionManager
	 */

	var InteractionManager = include("PIXI.interaction.InteractionManager", false);
	if (!InteractionManager) return;

	var p = InteractionManager.prototype;

	/**
	 * Removes mousedown, mouseup, etc. events, but leaves the mousemove events. This allows a
	 * custom cursor to continue to update its position while disabling any real interaction.
	 * @method removeClickEvents
	 */
	p.removeClickEvents = function()
	{
		if (!this.interactionDOMElement)
		{
			return;
		}

		//core.ticker.shared.remove(this.update);

		if (window.navigator.msPointerEnabled)
		{
			this.interactionDOMElement.style['-ms-content-zooming'] = '';
			this.interactionDOMElement.style['-ms-touch-action'] = '';
		}

		//window.document.removeEventListener('mousemove', this.onMouseMove, true);
		this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
		//this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);
		//this.interactionDOMElement.removeEventListener('mouseover', this.onMouseOver, true);

		this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
		this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
		this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

		//this.interactionDOMElement = null;

		window.removeEventListener('mouseup', this.onMouseUp, true);

		//this.eventsAdded = false;
	};

}());