import { Debugger } from '../../debug/Debugger';
import { CaptionFactory } from './CaptionFactory';

/**
 * @typedef {import('./renderers/IRenderer.js').IRender} IRender
 */

/**
 *  CaptionPlayer is used to start, stop and update captions.
 *  It applies the content of an active caption to a given CaptionRenderer.
 *
 * @export
 * @class CaptionPlayer
/*
 *
 * @export
 * @class CaptionPlayer
 */
export class CaptionPlayer {
  /**
   * Creates an instance of CaptionPlayer.
   * @param {*} captions - Captions map.
   * @param {IRender} renderer CaptionRenderer that content is applied to.
   * @memberof CaptionPlayer
   */
  constructor(captions, renderer) {
    this.captions = CaptionFactory.createCaptionMap(captions);

    this.renderer = renderer;

    this.activeCaption = null;
  }

  /**
   * Updates any currently playing caption.
   * This should be called every frame.
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
   * @param {String} name Name of caption.
   * @param {number} [time=0] Atart time in milliseconds.
   * @param {object} [args = {}] Arguments that will get passed to the renderer
   * @memberof CaptionPlayer
   */
  start(name, time = 0, args = {}) {
    this.stop();
    this.activeCaption = this.captions[name];
    if (this.activeCaption) {
      this.renderer.start(args);
      this.activeCaption.start(time, this.renderer);
      return;
    }

    Debugger.log('warn', `[CaptionPlayer.Start()] caption ${name} not found`);
  }

  /**
   * Stops any caption currently playing.
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
