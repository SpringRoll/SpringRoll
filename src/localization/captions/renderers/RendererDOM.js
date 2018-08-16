import { IRender } from './IRenderer';
/**
 *
 * DOMRender is a incomplete renderer that is intended to supply just the basic start and stop functions
 * @export
 * @class DOMRenderer
 * @param {HTMLElement} element
 * @param {Object} templateVariables
 */
export class DOMRenderer extends IRender {
  /**
   *Creates an instance of DOMRenderer.
   * @memberof DOMRenderer
   */
  constructor(element, templateVariables = {}) {
    super();

    if (!(element instanceof HTMLElement)) {
      console.error('Invalid html element provided to renderer');
    }

    this.renderTarget = element;
    this.templateVariables = templateVariables;
  }
  /**
   * Makes target element visible and ready to present captions
   * @param {object} [templateVariables = {}] Variables that can used during caption play time
   * @memberof DOMRenderer
   */
  start(templateVariables = {}) {
    this.renderTarget.style.visibility = 'visible';
    this.templateVariables = templateVariables;
  }

  /**
   *
   * H
   * @memberof DOMRenderer
   */
  stop() {
    this.renderTarget.style.visibility = 'hidden';
    this.templateVariables = {};
  }
}
