import { Debugger } from './../../debug/Debugger';

/**
 * Object used to render caption
 * @typedef {{start:(), stop:(), lineBegin:(line: TimedLine), lineEnd:()}} ICaptionRenderer
 */

/**
 *  CaptionPlayer is used to start, stop and update captions.
 *  it applies the content of an active caption to a given CaptionRenderer.
 *
 * @export
 * @class CaptionPlayer
 */
export default class CaptionPlayer {
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
      if (this.activeCaption.isFinished()) {
        this.stop();
      }
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

      this.activeCaption.start(
        time,
        this.renderer.lineBegin,
        this.renderer.lineEnd
      );
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
    }
    this.activeCaption = null;
  }
}
