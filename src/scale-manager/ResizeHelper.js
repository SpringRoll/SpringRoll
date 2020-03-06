import { Property } from '../state/Property';

/**
 * Utility class that handles resize events for ScaleManager and SafeScaleManager.
 * @internal
 */
export class ResizeHelper {
  /**
   * Returns the enabled state of the ResizeHelper.
   * @memberof ResizeHelper
   */
  get enabled() { return this._enabled; }
  /**
   * Sets the enabled state of the ResizeHelper. 
   * Forces a resize event.
   * @memberof ResizeHelper
   */
  set enabled(value) {
    this._enabled;
    if (this._enabled) {
      this.resize();
    }
  }

  /**
   *Creates an instance of ResizeHelper.
  * @param {ScaleManager | SafeScaleManager} scaleManager 
  * @memberof ResizeHelper
  */
  constructor(scaleManager) {
    this._enabled = true;
    this.resizeCallback = scaleManager.onResize.bind(scaleManager);

    window.addEventListener('resize', this.resizeCallback);

    if (typeof Event === 'function') {
      this.resize();
    }
    else {
      this.aspectRatio = new Property(0);
      this.aspectRatio.subscribe(this.resize.bind(this));

      this.resizeEvent = window.document.createEvent('UIEvents');
      this.resizeEvent.initUIEvent('resize', true, false, window, 0);

      this.resizeTick();
    }
  }

  /**
   * For older browsers, specifically for IE11, this a loop making sure resize events are fired.
   * @memberof ResizeHelper
   */
  resizeTick() {
    setTimeout(() => this.resizeTick(), 10);
    this.aspectRatio.value = window.innerWidth / window.innerHeight;
  }

  /**
   * Dispatches window resize events if the ResizeHelper is enabled.
   * @memberof ResizeHelper
   */
  resize() {
    if (!this.enabled) {
      return;
    }
    window.dispatchEvent(this.resizeEvent ? this.resizeEvent : new Event('resize'));
  }
}