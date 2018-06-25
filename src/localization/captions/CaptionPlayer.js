import { Debugger } from './../../debug/Debugger';

/**
 * Object used to render caption
 * @typedef {{start:(), stop:(), show:(line: TimedLine), hide:()}} ICaptionRenderer
 */

/**
 *  CaptionPlayer is used to start, stop and update captions.
 *  it applies the content of an active caption to a given CaptionRenderer.
 *
 * @export
 * @class CaptionPlayer
 */
export default class CaptionPlayer {
  // Maybe:(CaptionPlayer is written for playing a single caption at a time, minor rework would be required for multiple captions)

  /**
   * Creates an instance of CaptionPlayer.
   * @param {Object.<string, Caption>} captions - captions map.
   * @param {ICaptionRenderer} renderer CaptionRenderer that content is applied too.
   * @memberof CaptionPlayer
   */
  constructor(captions, renderer) {
    this.renderer = renderer;
    this.captions = captions;

    this.activeCaption = null;
  }

  /**
   * updates any currently playing caption
   * This ~should~ be called every frame.
   *
   * @param {Number} deltaTime Time passed in seconds since last update call.
   * @memberof CaptionPlayer
   */
  update(deltaTime) {
    if (this.activeCaption) {
      this.activeCaption.update(deltaTime);
      this.stop();
    }
  }

  /**
   * Starts playing a caption.
   *
   * @param {String} name name of caption
   * @param {number} [time=0] start time in milliseconds
   * @returns {boolean} true is caption started
   * @memberof CaptionPlayer
   */
  start(name, time = 0) {
    this.stop();
    this.activeCaption = this.captions[name];
    if (this.activeCaption) {
      if (this.renderer.start) {
        this.renderer.start();
      }

      this.activeCaption.start(time, this.renderer.show, this.renderer.hide);
      this.update(0);
    } else {
      Debugger.log('warn', `[CaptionPlayer.Start()] caption ${name} not found`);
    }
  }

  /**
   * Stops any caption currently playing
   * @memberof CaptionPlayer
   */
  stop() {
    if (this.activeCaption) {
      if (this.renderer.stop) {
        this.renderer.stop();
      }
      this.activeCaption = null;
    }
  }
}
