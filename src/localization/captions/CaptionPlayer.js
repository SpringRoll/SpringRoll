/**
 *  TODO:(Better Desciptions on functions.)
 *  TODO:(CaptionPlayer is written for playing a single caption at a time, minor rework would be required for multiple captions)
 *
 * @export
 * @class CaptionPlayer
 */
export default class CaptionPlayer {
  /**
   * Creates an instance of CaptionPlayer.
   * @param {Object} captions
   * @param {HTMLElement} element DOM element that text is written too. TODO:(specifiy element type. p, div, textarea?);
   * @memberof CaptionPlayer
   */
  constructor(captions, element) {
    this.element = element;
    this.captions = captions;

    this.activeCaption = null;
    this.callback = null;

    this.hideElement();
  }

  /**
   * updates any currently playing caption
   * This should be called every frame.
   *
   * @param {any} deltaTime Time passed in seconds since last update call.
   * @memberof CaptionPlayer
   */
  update(deltaTime) {
    if (this.activeCaption) {
      this.activeCaption.update(deltaTime);
      if (!this.activeCaption.isFinished()) {
        this.element.innerHTML = this.activeCaption.content; // <-- TODO: not sure if this is the proper way to set a DOM element.
      } else {
        this.stop();
      }
    }
  }

  /**
   * Starts playing a caption.
   *
   * @param {String} name name of caption
   * @param {number} [time=0] start time in milliseconds
   * @param {any} [callback=null] callback when caption is complete.
   * @returns {boolean} true is caption started
   * @memberof CaptionPlayer
   */
  start(name, time = 0) {
    this.stop();
    this.activeCaption = this.captions[name];
    if (this.activeCaption) {
      this.activeCaption.start(time);
      this.showElement();
    } else {
      //TODO: Log Warning 'Caption -NAME- not found'
    }
  }

  /**
   * Stops any caption currently playing
   * @memberof CaptionPlayer
   */
  stop() {
    if (this.activeCaption) {
      this.activeCaption = null;
      if (this.callback) {
        this.hideElement();
        this.callback();
      }
    }
  }

  /**
   * sets element to be visible
   * @memberof CaptionPlayer
   */
  showElement() {
    this.element.style.visibility = 'visible';
  }

  /**
   * sets element to be hidden
   * @memberof CaptionPlayer
   */
  hideElement() {
    this.element.style.visibility = 'hidden';
  }
}
