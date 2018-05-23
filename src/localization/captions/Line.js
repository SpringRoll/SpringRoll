/**
 *
 *
 * @export
 * @class Line
 */
export default class Line {
  /**
   * Creates an instance of Line.
   * @param {JSON} data
   * @memberof Line
   */
  constructor(data)
  {
    this.content = data.content || '';
    this.start = data.start || 0;
    this.end = data.end || 1000;
  }
}
