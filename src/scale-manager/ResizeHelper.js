import { Property } from '../state/Property';

/**
 * Utility class that handles resize events for ScaleManager and SafeScaleManager.
 * @internal
 */
export class ResizeHelper {
  /**
   * Whether or not the application is running on an iOS device.
   * @readonly
   * @memberof ResizeHelper
   */
  get iOS() { return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform); }

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
    this._enabled = value;
    if (this._enabled) {
      this.resize();
    }
  }

  /**
   *Creates an instance of ResizeHelper.
  * @param {function} resizeCallback
  * @memberof ResizeHelper
  */
  constructor(resizeCallback) {
    this._enabled = true;
    this.resizeCallback = resizeCallback;

    // Setup a listener for the 'resize' event from the window's event system.
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Defaulted to needing a resize loop on iOS devices due to a potential bug where
    // the window resize event isn't dispatched at the correct time.
    let requiresResizeLoop = this.iOS;

    // Setup environment specific resize event variables
    if (typeof Event === 'function') {
      this.resize();
    }
    else {
      this.resizeEvent = window.document.createEvent('UIEvents');
      this.resizeEvent.initUIEvent('resize', true, false, window, 0);
      requiresResizeLoop = true;
    }

    if (requiresResizeLoop) {
      // The resize loop will observe the aspect ratio of the window and will dispatch events anytime it changes.
      this.aspectRatio = new Property(0);
      this.aspectRatio.subscribe(this.resize.bind(this));

      // Call the first resize tick.
      this.resizeTick();

      // Check for aspect ratio change every 50 milliseconds.
      setInterval(this.resizeTick.bind(this), 50);
    }
  }

  /**
   * For older browsers, specifically for IE11, starts a loop making sure resize events are fired.
   * @memberof ResizeHelper
   * @private
   */
  resizeTick() {
    // Make sure references to the window dimensions are up to date.
    const resolution = this.getWindowResolution();

    // Update the aspect ratio property.
    this.aspectRatio.value = Math.round((resolution.height / resolution.width) * 1000) * 0.0001;
  }

  /**
   * Dispatches window resize events if the ResizeHelper is manually handling a resize loop.
   * This is the callback for the aspectRatio property change and is intended to only be called in
   * specific environments or when enabling/disableing the ResizeHelper.
   * @memberof ResizeHelper
   * @private
   */
  resize() {
    window.dispatchEvent(this.resizeEvent ? this.resizeEvent : new Event('resize'));
  }

  /**
   * Handler for window resize events. Forwards this event to the scale manager if enabled.
   * @memberof ResizeHelper
   */
  onWindowResize() {
    if (!this.enabled) {
      return;
    }
    // Call the resize callback to handle scaling logic.
    this.resizeCallback(this.getWindowResolution());
  }

  /**
   * Sets the window width and window height values of the ResizeHelper.
   * @memberof ResizeHelper
   */
  getWindowResolution() {
    let width, height;

    if (this.iOS) {
      width = document.documentElement.clientWidth;
      height = document.documentElement.clientHeight;
    }
    else {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    return { width, height };
  }
}