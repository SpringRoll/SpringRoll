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
  constructor({ onFocus = () => {}, onBlur = () => {} }) {
    /**
     * Callback when the page becomes visible
     * @property {Function} onFocus
     * @private
     */
    this._onFocus = onFocus;

    /**
     * Callback when the page loses visibility
     * @property {Function} onBlur
     * @private
     */
    this._onBlur = onBlur;
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
   *
   *
   * @memberof PageVisibility
   */
  enable() {
    this.enabled = true;
    window.addEventListener('pagehide', this._onBlur);
    window.addEventListener('pageshow', this._onFocus);
    window.addEventListener('blur', this._onBlur);
    window.addEventListener('focus', this._onFocus);
    window.addEventListener('visibilitychange', this.onToggle, false);
  }

  /**
   *
   *
   * @memberof PageVisibility
   */
  disable() {
    this.enabled = false;
    window.removeEventListener('pagehide', this._onBlur);
    window.removeEventListener('pageshow', this._onFocus);
    window.removeEventListener('blur', this._onBlur);
    window.removeEventListener('focus', this._onFocus);
    window.removeEventListener('visibilitychange', this.onToggle);
  }

  /**
   * Disable the detection
   * @method destroy
   */
  destroy() {
    this.disable();

    this.enabled = false;
    this.onToggle = null;
    this._onFocus = null;
    this._onBlur = null;
  }
}
