/**
 *
 *
 * @export
 * @class Line
 */
export default class TimedLine {
  /**
   * Creates an instance of TimedLine.
   * @param {any} content - Formatted string content to show during timespan
   * @param {any} startTime - start time in milliseconds reletive to caption
   * @param {any} endTime - end time in milliseconds reletive to caption
   * @memberof TimedLine
   */
  constructor(content, startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.content = content;
  }

  /**
   * get string contents of line.
   * @param {any} time - time in milliseconds
   * @returns {String} content if time is between startTime and endTime, other wise returns and empty string
   * @memberof TimedLine
   */
  getContent(time) {
    if (time <= this.endTime) {
      if (time >= this.startTime) {
        return this.content;
      }
    }
    return '';
  }
}
