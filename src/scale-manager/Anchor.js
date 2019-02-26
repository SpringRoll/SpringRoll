import { Debugger } from '../debug';
import { ScaledEntity } from './ScaledEntity';

/**
 * @typedef {{x:Number, y:Number}} Point
 */

/**
 * callback to used scale game and canvas
 * @callback PositionCallback
 * @param {Point} position position relative to anchor direction
 */

/**
 * Used to fix positions to a relative point in the viewport.
 * @export
 * @class Anchor
 * @implements ScaledEntity
 */
export class Anchor extends ScaledEntity {
  /**
   * Creates an instance of AnchoredEntity.
   * @param  {object} param
   * @param  {Point} param.position
   * @param  {Point} [param.direction= {x: -1, y: -1}]
   * @param  {PositionCallback} param.callback
   * @memberof Anchor
   */
  constructor({ position, direction, callback } = {}) {
    super();
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
   * @param  {Point} param.gameSize
   * @return {void} @memberof Anchor
   */
  onResize({ offset, gameSize }) {
    const halfWidth = gameSize.x / 2;
    const halfHeight = gameSize.y / 2;

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
