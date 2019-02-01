import { Debugger } from '../debug';

/**
 * @typedef {{x:Number, y:Number}} Point
 */

/**
 * callback to used scale game and canvas
 * @callback PositionCallback
 * @param {Number} x horizontal position relative to anchor direction
 * @param {Number} y vertical position relative to anchor direction
 */

/**
 * @export
 * @class Anchor
 */
export class Anchor {
  /**
   * Creates an instance of AnchoredEntity.
   * @param  {object} param
   * @param  {Point} param.position
   * @param  {Point} [param.direction= {x: -1, y: -1}]
   * @param  {PositionCallback} param.callback
   * @memberof Anchor
   */
  constructor({ position, direction, callback } = {}) {
    this.position = position || { x: 0, y: 0 };

    this.direction = direction || { x: -1, y: -1 };
    this.direction.x = Math.sign(this.direction.x);
    this.direction.y = Math.sign(this.direction.y);

    if (callback instanceof Function) {
      this.callback = callback;
      return;
    }

    // Warn user that anchor callback is not set.
    this.callback = () => {
      Debugger.log('warn', this, 'Anchor missing callback');
    };
  }

  /**
   * @param  {object} param
   * @param  {Point}  param.offset
   * @param  {Number} param.halfWidth
   * @param  {Number} param.halfHeight
   * @return {void} @memberof Anchor
   */
  updatePosition({ offset, halfWidth, halfHeight }) {
    const x =
      this.position.x * -this.direction.x -
      offset.x * this.direction.x +
      (halfWidth + this.direction.x * halfWidth);

    const y =
      this.position.y * -this.direction.y -
      offset.y * this.direction.y +
      (halfHeight + this.direction.y * halfHeight);

    this.callback({ x, y });
  }
}
