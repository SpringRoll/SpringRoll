/**
 *  TODO:(Better Desciptions on functions.)
 *
 * @export
 * @class CaptionPlayer
 */
export default class CaptionPlayer {
  /**
   * Creates an instance of CaptionPlayer.
   * @param {JSON} data Caption Data see TODO:(link to caption data example);
   * @param {HTMLElement} element DOM element that text is written too. TODO:(specifiy element type. p, div, textarea?);
   * @memberof CaptionPlayer
   */
  constructor(data, element) {
    this.element = element;
    this.element.style.visibility = 'hidden';
  }

  /**
   * updates any currently playing caption
   * This should be called every frame.
   *
   * @param {any} deltaTime Time passed in seconds since last update call.
   * @memberof CaptionPlayer
   */
  update(deltaTime) {
    
  }

  /**
   * Starts playing a caption.
   *
   * @param {String} name name of caption
   * @param {number} [time=0] start time of caption
   * @param {any} [callback=null] callback when caption is complete.
   * @memberof CaptionPlayer
   */
  start(name, time = 0, callback = null) {

  }

  /**
   * Stops any caption currently playing
   * @memberof CaptionPlayer
   */
  stop() {

  }
}
