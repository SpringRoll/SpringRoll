/**
 * @export
 * @class TimedLine
 */
export class TimedLine {
  /**
   * Creates an instance of TimedLine.
   * @param {Number} startTime - Start time in milliseconds relative to caption.
   * @param {Number} endTime - End time in milliseconds relative to caption.
   * @param {string} content - HMTL formatted string content to show during time-span.
   * @memberof TimedLine
   */
  constructor(startTime, endTime, content) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.setContent(content);
  }

  /**
   * Sets line's content. Removes HTML formatting for text.
   * @param  {any} content
   * @return {void}@memberof TimedLine
   */
  setContent(content) {
    this.content = content;
    this.text = content.replace(/(<([^>]+)>)/gi, '');
  }
}
