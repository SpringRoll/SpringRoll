/**
 *
 *
 * @export
 * @class PageVisibility
 */
export default class PageVisibility {
  /**
   * @class PageVisibility
   * @constructor
   * @param {Function} onFocus Callback when the page becomes visible
   * @param {Function} onBlur Callback when the page loses visibility
   */
  constructor(onFocus = () => {}, onBlur = () => {}) {
    /**
     * Callback when the page becomes visible
     * @property {Function} onFocus
     * @private
     */
    this.onFocus = onFocus;

    /**
     * Callback when the page loses visibility
     * @property {Function} onBlur
     * @private
     */
    this.onBlur = onBlur;
  }

  /**
   * The visibility toggle listener function
   * @property {Function} onToggle
   * @private
   */
  onToggle() {
    if (document.hidden) {
      this._onBlur();
    } else {
      this._onFocus();
    }
  }

  /**
   * Enables the event listeners
   * @method enable
   * @memberof PageVisibility
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
   * @method disable
   * @memberof PageVisibility
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
   * @method destroy
   * @memberof PageVisibility
   */
  destroy() {
    this.disable();

    this.enabled = false;
    this.onToggle = null;
    this._onFocus = null;
    this._onBlur = null;
  }
}
