/**
 * @typedef {import('./TimedLine.js').TimedLine} TimedLine
 * @typedef {import('./renderers/IRenderer.js').IRender} IRender
 */
/**
 * @export
 * @class Caption
 * @property {TimedLine[]} lines
 * @property {number} time
 * @property {number} lineIndex
 * @property {IRender} renderer
 */
export class Caption {
  /**
   * Creates an instance of Caption.
   * @param {TimedLine[]} lines - Array of lines to be used for caption.
   * @memberof Caption
   */
  constructor(lines) {
    this.lines = lines;

    // Sort by end time, this ensures proper execution order of lines.
    this.lines.sort(function (a, b) {
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
   * Resets time, lineIndex and content fields.
   * @private
   * @memberof Caption
   */
  reset() {
    this.time = 0;
    this.lineIndex = 0;
    this.renderer = null;
  }

  /**
   * Updates content based on time passed.
   * This should be called every frame that the caption is active.
   *
   * @param {Number} deltaTime - Time in seconds since last frame.
   * @memberof Caption
   */
  update(deltaTime) {
    const time = this.time + deltaTime * 1000;
    if (time === this.time) {
      return;
    }

    this.updateState(time, this.time);
    this.time = time;
  }

  /**
   * Handles calling callbacks and updating caption's current state.
   * @param  {Number} currentTime
   * @param  {Number} lastTime
   * @memberof Caption
   */
  updateState(currentTime, lastTime) {
    if (this.isFinished()) {
      return;
    }
    if (currentTime > this.lines[this.lineIndex].endTime) {
      this.renderer.lineEnd();
    }
    while (currentTime > this.lines[this.lineIndex].endTime) {
      if ((this.lineIndex++, this.isFinished())) {
        return;
      }
    }

    const line = this.lines[this.lineIndex];
    if (currentTime >= line.startTime && lastTime <= line.startTime) {
      this.renderer.lineBegin(line);
      return;
    }
  }

  /**
   * Checks if caption has completed.
   * @returns {Boolean}
   * @memberof Caption
   */
  isFinished() {
    return this.lineIndex >= this.lines.length;
  }

  /**
   * Sets time and line index of caption.
   *
   * @param {Number} [time=0] - Time in milliseconds.
   * @memberof Caption
   */
  start(time = 0, renderer = { lineBegin: () => { }, lineEnd: () => { } }) {
    this.reset();
    this.renderer = renderer;
    this.updateTimeIndex(time);
    this.updateState(this.time, this.lines[this.lineIndex].startTime - 1);
  }

  /**
   * Updates the current time and index of the caption instance
   * @param {Number} [time=0]
   * @memberof Caption
   */
  updateTimeIndex(time = 0) {
    this.time = time;
    if (this.isFinished()) {
      return;
    }
    for (let i = this.lines.length - 1; i > -1; i--) {
      if (this.lines[i].startTime <= time) {
        this.lineIndex = i;
        break;
      }
    }
  }
}
