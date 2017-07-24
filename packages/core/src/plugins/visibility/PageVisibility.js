/**
 * Handle the page visiblity change, if supported. Application uses one of these to
 * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
 * or `resumed` events on the Application instead of using one of these yourself.
 * ### module: @springroll/core
 * @class
 * @memberof springroll
 */
export default class PageVisibility {
    /**
     * @param {function} onFocus Callback when the page becomes visible
     * @param {function} onBlur Callback when the page loses visibility
     */
    constructor(onFocus, onBlur) {
        /**
         * Callback when the page becomes visible
         * @member {function}
         * @private
         */
        this._onFocus = onFocus;

        /**
         * Callback when the page loses visibility
         * @member {function}
         * @private
         */
        this._onBlur = onBlur;

        /**
         * If this object is enabled.
         * @member {function}
         * @private
         */
        this._enabled = false;

        /**
         * The name of the visibility change event for the browser
         * @member {string}
         * @private
         */
        this._visibilityChange = null;

        // Select the visiblity change event name
        if (document.hidden !== undefined) {
            this._visibilityChange = 'visibilitychange';
        }
        else if (document.mozHidden !== undefined) {
            this._visibilityChange = 'mozvisibilitychange';
        }
        else if (document.msHidden !== undefined) {
            this._visibilityChange = 'msvisibilitychange';
        }
        else if (document.webkitHidden !== undefined) {
            this._visibilityChange = 'webkitvisibilitychange';
        }

        this.isIE9 = !this._visibilityChange && document.onfocusin !== undefined;

        // If this browser doesn't support visibility
        if (!this._visibilityChange && document.onfocusin === undefined) {
            return;  
        }

        /**
         * The visibility toggle listener function
         * @member {function}
         * @private
         */
        this._onToggle = () => {

            if (document.hidden || document.webkitHidden || document.msHidden || document.mozHidden) {
                this._onBlur();
            }
            else {
                this._onFocus();
            }
        };

        this.enabled = true;
    }

    /**
     * If this object is enabled.
     * @member {function}
     * @private
     */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        value = !!value;

        if (this._enabled === value) {
            return;
        }

        this._enabled = value;

        window.removeEventListener('pagehide', this._onBlur);
        window.removeEventListener('pageshow', this._onFocus);
        window.removeEventListener('blur', this._onBlur);
        window.removeEventListener('focus', this._onFocus);
        window.removeEventListener('visibilitychange', this._onToggle);
        document.removeEventListener(this._visibilityChange, this._onToggle, false);

        if (this.isIE9) {
            document.removeEventListener('focusin', this._onFocus);
            document.removeEventListener('focusout', this._onBlur);
        }

        if (value) {
            // Listen to visibility change
            // see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
            document.addEventListener(this._visibilityChange, this._onToggle, false);
            // Listen for page events (when clicking the home button on iOS)
            window.addEventListener('pagehide', this._onBlur);
            window.addEventListener('pageshow', this._onFocus);
            window.addEventListener('blur', this._onBlur);
            window.addEventListener('focus', this._onFocus);
            window.addEventListener('visibilitychange', this._onToggle, false);
            
            //IE9 is old and uses its own events
            if (this.isIE9) {
                document.addEventListener('focusin', this._onFocus);
                document.addEventListener('focusout', this._onBlur);
            }
        }
    }

    /**
     * Disable the detection
     */
    destroy() {
        // If this browser doesn't support visibility
        if (!this._visibilityChange || !this._onToggle) {
            return;
        }

        this.enabled = false;
        this._onToggle = null;
        this._onFocus = null;
        this._onBlur = null;
    }
}
