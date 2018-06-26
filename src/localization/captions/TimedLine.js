/**
 * @export
 * @class TimedLine
 */
export default class TimedLine {
  /**
   * Creates an instance of TimedLine.
   * @param {Number} startTime - start time in milliseconds relative to caption
   * @param {Number} endTime - end time in milliseconds relative to caption
   * @param {string} content - html formatted string content to show during time-span
   * @memberof TimedLine
   */
  constructor(startTime, endTime, content) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.setContent(content);
  }

  /**
   * Set's line's content. removes HTML formatting for text
   * @param  {any} content
   * @return {void}@memberof TimedLine
   */
  setContent(content) {
    this.content = content;
    this.text = content.replace(/(<([^>]+)>)/gi, '');
  }
}
