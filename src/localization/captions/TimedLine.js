/**
 *
 *
 * @export
 * @class Line
 */
export default class TimedLine {
  /**
   * Creates an instance of TimedLine.
   * @param {string} content - Formatted string content to show during timespan
   * @param {Number} startTime - start time in milliseconds reletive to caption
   * @param {Number} endTime - end time in milliseconds reletive to caption
   * @memberof TimedLine
   */
  constructor(content, startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.content = content;
  }

  /**
   * get string contents of line.
   * @param {Number} time - time in milliseconds
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
