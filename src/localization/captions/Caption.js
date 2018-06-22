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
   * Updates content based on time passed.
   * This ~should~ be called every frame that the caption is active.
   *
   * @param {Number} deltaTime - time in seconds since last frame
   * @memberof Caption
   */
  update(deltaTime) {
    this.time += deltaTime * 1000;
    this.incrementLineIndex(this.time);
    if (!this.isFinished()) {
      this.content = this.lines[this.lineIndex].getContent(this.time);
    } else {
      this.content = '';
    }
  }

  /**
   * Returns current content;
   *
   * @returns {string} content
   * @memberof Caption
   */
  getContent() {
    return this.content;
  }

  /**
   * increments lineIndex if time is greater than the end time of the current line.
   * @private
   * @param {Number} time - time in milliseconds
   * @memberof Caption
   */
  incrementLineIndex(time) {
    if (this.isFinished()) {
      // <-- this will make sure it doesn't throw an error if this.lines is empty
      return;
    }
    while (time > this.lines[this.lineIndex].endTime) {
      this.lineIndex++;
      if (this.isFinished()) {
        break;
      }
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
    this.update(time / 1000);
  }
}
