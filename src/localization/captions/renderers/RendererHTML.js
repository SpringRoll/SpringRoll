import { DOMRenderer } from './RendererDOM';
import { TemplateRenderer } from './RendererTemplate';
/**
 *
 * HTML Renderer is intended for rendering raw html in the use case of wanting to display styled captions
 * @export
 * @class HtmlRenderer
 * @implements {RendererInterface}
 */
export class HtmlRenderer extends DOMRenderer {
  /**
   *
   * Called by Caption Player when a new line needs to be displayed
   * @memberof HtmlRenderer
   */
  lineBegin(line) {
    this.renderTarget.innerHTML = TemplateRenderer(
      line.content,
      this.templateVariables
    );
  }

  /**
   *
   * Called by Caption Player when a line is complete
   * @memberof HtmlRenderer
   */
  lineEnd() {
    this.renderTarget.innerHTML = '';
  }
}
