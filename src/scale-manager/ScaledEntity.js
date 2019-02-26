/**
 * @typedef {{x:Number, y:Number}} Point
 * @typedef {{offset: Point, gameSize:Point, scale:Point }} EntityResizeEvent
 */

/**
 * @export
 * @interface ScaledEntity
 */
export class ScaledEntity {
  /**
   * @param  {EntityResizeEvent} event
   * @return {void} @memberof ScaledEntity
   */
  onResize() {
    throw 'not implemented';
  }
}
