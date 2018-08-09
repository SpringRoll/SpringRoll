/**
 * Render interface to help enforce minimum requirements for caption renderers
 * @interface
 * @class IRender
 * @property {function} start called when the Caption Player starts playing captions
 * @property {function} stop called when the Caption Player stops playing captions
 * @property {function} lineBegin called when rendering a new line of text
 * @property {function} lineEnd called when finished rendering a new of text
 */
export class IRender {
  /**
   *Creates an instance of Renderer.
   * @memberof Renderer
   */
  constructor() {
    if (
      'function' !== typeof this.start ||
      'function' !== typeof this.stop ||
      'function' !== typeof this.lineBegin ||
      'function' !== typeof this.lineEnd
    ) {
      console.error(
        'Springroll Caption Renderer not implemented corrected. Please ensure you have a "start", "end", "lineBegin", and "lineEnd" function in your class.'
      );
    }
  }
}
