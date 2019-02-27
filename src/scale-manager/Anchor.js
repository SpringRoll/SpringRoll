import { Debugger } from '../debug';
import { ScaledEntity } from './ScaledEntity';

/**
 * @typedef {{x:Number, y:Number}} Point
 */

/**
 * callback to used move game entities
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
    const x = this.calcWorldPosition(
      this.position.x,
      this.direction.x,
      offset.x,
      gameSize.x / 2
    );

    const y = this.calcWorldPosition(
      this.position.y,
      this.direction.y,
      offset.y,
      gameSize.y / 2
    );

    this.callback({ x, y });
  }

  /**
   * Calculates and returns the world position of a single axis
   * Based on viewport offset and anchor direction.
   * @param  {Number} position
   * @param  {Number} direction
   * @param  {Number} offset
   * @param  {Number} halfSize
   * @return {void}@memberof Anchor
   */
  calcWorldPosition(position, direction, offset, halfSize) {
    return (
      position * -direction -
      offset * direction +
      (halfSize + direction * halfSize)
    );
  }
}
