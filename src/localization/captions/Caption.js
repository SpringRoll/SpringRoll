/**
 * @export
 * @class Caption
 */
export default class Caption {
  /**
   * Creates an instance of Caption.
   * @param {TimedLine} - array of Lines to be used for caption
   * @memberof Caption
   */
  constructor(lines) {
    this.lines = lines;

    // Sort by end time, this ensures proper exicution order of lines.
    this.lines.sort(function(a, b) {
      if (a.endTime < b.endTime) {
        return -1;
      }
      if (a.endTime > b.endTime) {
        return 1;
      }
      return 0;
    });

    this.reset();
  }

  /**
   * resets time, lineIndex and content fields
   * @private
   * @memberof Caption
   */
  reset() {
    this.time = 0;
    this.lineIndex = 0;
    this.content = '';
  }

  /**
   *
   *
   * @param {Number} deltaTime - time in seconds since last frame
   * @memberof Caption
   */
  update(deltaTime) {
    this.time += deltaTime * 1000;
    this.incrementLineIndex(this.time);
    if (!this.isFinished()) {
      this.content = this.lines[this.lineIndex].getContent(this.time);
    }
  }

  /**
   * increments lineIndex if time is greater than the end time of the current line.
   * @private
   * @param {Number} time - time in milliseconds
   * @memberof Caption
   */
  incrementLineIndex(time) {
    if (time > this.lines[this.lineIndex].endTime) {
      this.lineIndex++;
    }
  }

  /**
   * Checks if caption has completed
   * @returns {Boolean}
   * @memberof Caption
   */
  isFinished() {
    return this.lineIndex >= this.lines.length;
  }

  /**
   * sets time and line index of caption;
   *
   * @param {Number} [time=0] - time in milliseconds
   * @memberof Caption
   */
  start(time = 0) {
    this.reset();
    if (time > 0) {
      this.lineIndex = this.findClosestIndex(time);
    }
  }

  /**
   *
   * @private
   * @param {any} time - time in milliseconds
   * @returns {Number} index of line with endTime less than time
   * @memberof Caption
   */
  findClosestIndex(time) {
    for (let i = 0; i < this.lines.length; i++) {
      if (time < this.lines[i].endTime) {
        return i;
      }
    }
  }
}
