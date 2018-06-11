/**
 * @param {Function} onFocus Callback when the page becomes focused
 * @param {Function} onBlur Callback when the page loses visibility
 * @property {Function} onFocus Callback for when the page becomes visible
 * @property {Function} onBlur Callback for when the page loses visibility
 * @property {Function} onToggle the visibility toggle listener function
 */
export class PageVisibility {
  /**
   *Creates an instance of PageVisibility.
   * @param {Function} [onFocus=function() {}]
   * @param {Function} [onBlur=function() {}]
   */
  constructor(onFocus = function() {}, onBlur = function() {}) {
    this.onFocus = onFocus.bind(this);
    this.onBlur = onBlur.bind(this);

    /**
     * The visibility toggle listener function
     * @property {Function} onToggle
     * @private
     */
    this.onToggle = function() {
      if (document.hidden) {
        this.onBlur();
      } else {
        this.onFocus();
      }
    }.bind(this);
  }

  /**
   * Enables the event listeners
   */
  enable() {
    this.enabled = true;
    window.addEventListener('pagehide', this.onBlur);
    window.addEventListener('pageshow', this.onFocus);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    window.addEventListener('visibilitychange', this.onToggle, false);
  }

  /**
   * Disables the event listeners
   */
  disable() {
    this.enabled = false;
    window.removeEventListener('pagehide', this.onBlur);
    window.removeEventListener('pageshow', this.onFocus);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    window.removeEventListener('visibilitychange', this.onToggle);
  }

  /**
   * Disable the detection
   */
  destroy() {
    this.disable();

    this.enabled = false;
    this.onToggle = null;
    this.onFocus = null;
    this.onBlur = null;
  }
}
