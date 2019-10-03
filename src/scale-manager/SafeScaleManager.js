import { Debugger } from '../debug';

/**
 * @typedef {import('./ScaledEntity').ScaledEntity} ScaledEntity
 * @typedef {import('./ScaledEntity').EntityResizeEvent} EntityResizeEvent
 * @typedef {{x:Number, y:Number}} Point
 */

/**
 * callback to used scale game and canvas
 * @callback ScaleCallback
 * @param {Number} width width canvas should be
 * @param {Number} height height canvas should be
 * @param {Point} scale x/y scale values
 */

/**
 * Handles scaling the game
 */
export class SafeScaleManager {
  /**
   * Creates an instance of SafeScaleManager.
   * @param  {object} param
   * @param  {Number} param.width width of game
   * @param  {Number} param.height height of game
   * @param  {Number} param.safeWidth width of safe area for the game
   * @param  {Number} param.safeHeight height of safe area for the game
   * @param  {ScaleCallback} param.callback function called to scale game and canvas
   * @memberof SafeScaleManager
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

    /** @type {ScaledEntity[]} */
    this.entities = [];

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
      const offset = this.calcOffset(scale);
      const gameSize = { x: this.gameWidth, y: this.gameHeight };

      /** @type {EntityResizeEvent} */
      this.resizeEventData = Object.freeze({
        scale,
        offset,
        gameSize
      });

      this.callback({ width: nWidth, height: nHeight, scale });

      for (let i = 0, length = this.entities.length; i < length; i++) {
        const entity = this.entities[i];
        entity.onResize(this.resizeEventData);
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
   * @memberof SafeScaleManager
   */
  calcOffset(scale) {
    const gameWidthRatio = this.gameWidth / this.safeWidth;
    const gameHeightRatio = this.gameHeight / this.safeHeight;

    let deltaX = (scale.x - 1) / (gameWidthRatio - 1);
    let deltaY = (scale.y - 1) / (gameHeightRatio - 1);

    //FIXES: NaN / infinite Bug from 0 / 0;
    deltaX = Number.isFinite(deltaX) ? deltaX : 0;
    deltaY = Number.isFinite(deltaY) ? deltaY : 0;

    const x = (this.gameWidth - this.safeWidth) * deltaX * 0.5;
    const y = (this.gameHeight - this.safeHeight) * deltaY * 0.5;

    return { x, y };
  }

  /**
   * Adds and anchor to be updated during resize
   * @param  {ScaledEntity} entity
   * @memberof SafeScaleManager
   */
  addEntity(entity) {
    if (this.entities.includes(entity)) {
      return;
    }

    if (this.resizeEventData) {
      entity.onResize(this.resizeEventData);
    }

    this.entities.push(entity);
  }

  /**
   * Removes an anchor
   * @param  {ScaledEntity} entity
   * @return {void} @memberof SafeScaleManager
   */
  removeEntity(entity) {
    this.entities = this.entities.filter(e => e !== entity);
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
