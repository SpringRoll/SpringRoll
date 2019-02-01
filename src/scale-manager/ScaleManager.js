import { Debugger } from '../debug';

/**
 * @typedef {import('./Anchor').Anchor} Anchor
 * @typedef {{x:Number, y:Number}} Point
 */

/**
 * callback to used scale game and canvas
 * @callback ScaleCallback
 * @param {Number} x horizontal scale value
 * @param {Number} y vertical scale value
 */

/**
 * Handles scaling the game
 */
export class ScaleManager {
  /**
   * Creates an instance of ScaleManager.
   * @param  {object} param
   * @param  {Number} param.width width of game
   * @param  {Number} param.height height of game
   * @param  {Number} param.safeWidth width of safe area for the game
   * @param  {Number} param.safeHeight height of safe area for the game
   * @param  {ScaleCallback} param.callback function called to scale game and canvas
   * @memberof ScaleManager
   */
  constructor({
    width,
    height,
    safeWidth = Infinity,
    safeHeight = Infinity,
    callback
  }) {
    this.gameWidth = width;
    this.gameHeight = height;
    this.safeWidth = safeWidth <= width ? safeWidth : width;
    this.safeHeight = safeHeight <= height ? safeHeight : height;
    this.callback = callback;

    this.onResize = this.onResize.bind(this);

    /** @type {Anchor[]} */
    this.anchors = [];

    if (callback instanceof Function) {
      this.enable(callback);
    }
  }

  /**
   * onResize maps and passes the relevant data to the user provided callback function.
   * @param {UIEvent} event
   * @private
   */
  onResize(event) {
    const resize = () => {
      const width = event.target.innerWidth;
      const height = event.target.innerHeight;

      // Calculate Canvas size and scale //
      const scaleMod = Math.min(
        width / this.safeWidth,
        height / this.safeHeight
      );

      const nWidth = Math.max(0, Math.min(this.gameWidth * scaleMod, width));
      const nHeight = Math.max(0, Math.min(this.gameHeight * scaleMod, height));

      const scale = {
        x: (this.gameWidth / nWidth) * scaleMod,
        y: (this.gameHeight / nHeight) * scaleMod
      };

      this.callback({ width: nWidth, height: nHeight, scale });

      this.offset = this.calcOffset(scale);

      const halfWidth = this.gameWidth * 0.5;
      const halfHeight = this.gameHeight * 0.5;

      for (let i = 0, length = this.anchors.length; i < length; i++) {
        const anchor = this.anchors[i];
        anchor.updatePosition({
          offset: this.offset,
          halfWidth,
          halfHeight
        });
      }
    };

    resize();

    // handle a bug in iOS where innerWidth and innerHeight aren't correct immediately after resize.
    setTimeout(resize, 500);
  }

  /**
   * Calculates the offset for anchors.
   * @param  {Point} scale scale value
   * @return {Point}
   * @memberof ScaleManager
   */
  calcOffset(scale) {
    // this has a small error that still needs to be tracked down
    const gameWidthRatio = this.gameWidth / this.safeWidth;
    const gameHeightRatio = this.gameHeight / this.safeHeight;

    const deltaX = (scale.x - 1) / (gameWidthRatio - 1);
    const deltaY = (scale.y - 1) / (gameHeightRatio - 1);

    const x = (this.gameWidth - this.safeWidth) * deltaX * 0.5;
    const y = (this.gameHeight - this.safeHeight) * deltaY * 0.5;

    return { x, y };
  }

  /**
   * Adds and anchor to be updated during resize
   * @param  {Anchor} anchor
   * @memberof ScaleManager
   */
  addAnchor(anchor) {
    if (this.anchors.includes(anchor)) {
      return;
    }
    const halfWidth = this.gameWidth * 0.5;
    const halfHeight = this.gameHeight * 0.5;

    anchor.updatePosition({
      offset: this.offset,
      halfWidth,
      halfHeight
    });

    this.anchors.push(anchor);
  }

  /**
   * Removes an anchor
   * @param  {any} anchor
   * @return {void}@memberof ScaleManager
   */
  removeAnchor(anchor) {
    this.anchors = this.anchors.filter(a => a !== anchor);
  }

  /**
   * Enables the scale manager listener. Will not be enabled if a callback is not supplied.
   * @param {ScaleCallback} callback The function to be called on resize events.
   */
  enable(callback) {
    if (callback instanceof Function) {
      this.callback = callback;
      window.addEventListener('resize', this.onResize);
      window.dispatchEvent(new Event('resize')); // <-- this forces resize to fire;
    } else {
      Debugger.warn('Scale Manager was not passed a function');
    }
  }
  /**
   * Disables the scale manager.
   */
  disable() {
    window.removeEventListener('resize', this.onResize);
  }
}
