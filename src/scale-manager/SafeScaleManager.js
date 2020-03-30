import { Debugger } from '../debug';
import { ResizeHelper } from './ResizeHelper';

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
 * @param {Number} scaleRatio minimum aspect ratio that fit's in the screen.
 * @param {Object} viewArea Rectangle defining the total viewable area of game content.
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
    callback = () => {}
  }) {
    this.gameWidth = width;
    this.gameHeight = height;
    this.safeWidth = safeWidth <= width ? safeWidth : width;
    this.safeHeight = safeHeight <= height ? safeHeight : height;
    this.callback = callback;
    this.scaleRatio = 1;

    // Rectangle containing the total viewable game content.
    this.viewArea = { 
      x: 0, 
      y: 0, 
      width: 0, 
      height: 0, 
      left: 0, 
      right: 0, 
      top: 0, 
      bottom: 0 
    };

    /** @type {ScaledEntity[]} */
    this.entities = [];

    /** @private */
    this.resizer = new ResizeHelper(this.onResize.bind(this));

    if (callback instanceof Function) {
      this.enable(callback);
    }
  }

  /**
   * onResize maps and passes the relevant data to the user provided callback function.
   * @param {object} param
   * @param {number} param.width - Current window width
   * @param {number} param.height - Current window height
   * @private
   */
  onResize({ width, height }) {
    // Calculate the scaling ratio.
    this.scaleRatio = Math.min(width / this.safeWidth, height / this.safeHeight);

    const nWidth = Math.max(0, Math.min(this.gameWidth * this.scaleRatio, width));
    const nHeight = Math.max(0, Math.min(this.gameHeight * this.scaleRatio, height));

    const scale = {
      x: (this.gameWidth / nWidth) * this.scaleRatio,
      y: (this.gameHeight / nHeight) * this.scaleRatio
    };

    const scaledWidth = width / this.scaleRatio;
    const scaledHeight = height / this.scaleRatio;

    this.viewArea.left = Math.max(-(scaledWidth - this.gameWidth) * 0.5, 0);
    this.viewArea.top = Math.max(-(scaledHeight - this.gameHeight) * 0.5, 0);
    this.viewArea.right = Math.min(this.viewArea.left + scaledWidth, this.gameWidth);
    this.viewArea.bottom = Math.min(this.viewArea.top + scaledHeight, this.gameHeight);
    
    this.viewArea.x = this.viewArea.left;
    this.viewArea.y = this.viewArea.top;
    this.viewArea.width = this.viewArea.right - this.viewArea.left;
    this.viewArea.height = this.viewArea.bottom - this.viewArea.top;

    /** @type {EntityResizeEvent} */
    this.resizeEventData = Object.freeze({
      offset: { x: this.viewArea.x, y: this.viewArea.y },
      gameSize:{ x: this.gameWidth, y: this.gameHeight },
      viewArea: this.viewArea,
      scale
    });
    
    this.callback({ 
      width: nWidth, 
      height: nHeight, 
      scaleRatio: this.scaleRatio,
      viewArea: this.viewArea,
      scale
    });

    for (let i = 0, length = this.entities.length; i < length; i++) {
      const entity = this.entities[i];
      entity.onResize(this.resizeEventData);
    }
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
   * @param  {ScaledEntity | ScaledEntity[]} entity
   * @memberof SafeScaleManager
   */
  addEntity(entity) {
    if (!Array.isArray(entity)) {
      entity = [entity];      
    }

    entity.forEach(e => {
      if (this.entities.includes(e)) {
        return;
      }
  
      if (this.resizeEventData) {
        e.onResize(this.resizeEventData);
      }
  
      this.entities.push(e);
    });
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
      this.resizer.enabled = true;
    } else {
      Debugger.warn('Scale Manager was not passed a function');
    }
  }
  /**
   * Disables the scale manager.
   */
  disable() {
    this.resizer.enabled = false;
  }
}
