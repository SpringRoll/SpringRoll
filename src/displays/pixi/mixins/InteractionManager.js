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

		//not strictly necessary for disabling click events, but don't want to add a duplicate later
		core.ticker.shared.remove(this.update, this);

		if (window.navigator.msPointerEnabled)
		{
			this.interactionDOMElement.style['-ms-content-zooming'] = '';
			this.interactionDOMElement.style['-ms-touch-action'] = '';
		}

		this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
		window.removeEventListener('mouseup', this.onPointerUp, true);

		this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
		this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, true);
		this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);

		this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
		window.removeEventListener('pointercancel', this.onPointerCancel, true);
		window.removeEventListener('pointerup', this.onPointerUp, true);
	};

}());