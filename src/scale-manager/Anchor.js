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
   * Creates an instance of Anchor.
   * @param  {object} param
   * @param  {Point} param.position
   * @param  {Point} [param.direction= {x: -1, y: -1}]
   * @param  {PositionCallback} param.callback
   * @memberof Anchor
   */
  constructor({
    position,
    direction,
    callback = () => Debugger.log('warn', this, 'Anchor missing callback')
  } = {}) {
    super();
    this.position = position || { x: 0, y: 0 };
    this.direction = direction || { x: -1, y: -1 };
    this.callback = callback;
  }

  /**
   * @param  {object} param
   * @param  {Point}  param.viewArea
   * @return {void} @memberof Anchor
   */
  onResize({ viewArea }) {
    const halfWidth = viewArea.width * 0.5;
    const halfHeight = viewArea.height * 0.5;

    const centerX = viewArea.x + halfWidth;
    const centerY = viewArea.y + halfHeight;

    const x = centerX + (this.direction.x * halfWidth) + this.position.x;
    const y = centerY + (this.direction.y * halfHeight) + this.position.y;

    this.callback({ x, y });
  }
}
