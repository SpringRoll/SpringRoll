/**
 * @export
 * @class Caption
 */
export default class Caption {
  /**
   * Creates an instance of Caption.
   * @param {TimedLine[]} lines - array of Lines to be used for caption
   * @memberof Caption
   */
  constructor(lines) {
    this.lines = lines;

    // Sort by end time, this ensures proper execution order of lines.
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
  }

  /**
   * Updates content based on time passed.
   * This ~should~ be called every frame that the caption is active.
   *
   * @param {Number} deltaTime - time in seconds since last frame
   * @memberof Caption
   */
  update(deltaTime) {
    const time = this.time + deltaTime * 1000;
    if (time == this.time) {
      return;
    }

    this.updateState(time, this.time);
    this.time = time;
  }

  /** */
  updateState(currentTime, lastTime) {
    if (this.isFinished()) {
      return;
    }

    if (currentTime > this.lines[this.lineIndex].endTime) {
      this.hideCallback();
    }

    while (currentTime > this.lines[this.lineIndex].endTime) {
      this.lineIndex++;
      if (this.isFinished()) {
        return;
      }
    }

    const line = this.lines[this.lineIndex];
    if (currentTime >= line.startTime && lastTime < line.startTime) {
      this.showCallback(line);
      return;
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
  start(time = 0, showCallback = () => {}, hideCallback = () => {}) {
    this.reset();
    this.update(time / 1000);
    this.showCallback = showCallback;
    this.hideCallback = hideCallback;
  }
}
