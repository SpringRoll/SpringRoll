import { TemplateRenderer } from './RendererTemplate';
import { DOMRenderer } from './RendererDOM';
/**
 *
 * TextRenderer is intended for just rendering test. It will attempt to sanitize any strings passed to it by removing html syntax
 * @export
 * @class TextRenderer
 * @implements {RendererInterface}
 */
export class TextRenderer extends DOMRenderer {
  /**
   *
   * Called by Caption Player when a new line needs to be displayed
   * @memberof TextRenderer
   */
  lineBegin(line) {
    this.renderTarget.innerText = this.sanitize(
      TemplateRenderer(line.content, this.templateVariables)
    );
  }

  /**
   *
   * Called by Caption Player when a line is complete
   * @memberof TextRenderer
   */
  lineEnd() {
    this.renderTarget.textContent = '';
  }

  /**
   *
   * Will attempt to remove all html from a string before it's renderer to the page
   * @param {*} html
   * @memberof TextRenderer
   */
  sanitize(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}
