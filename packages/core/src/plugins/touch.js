import {ApplicationPlugin} from '@springroll/core';
// @if DEBUG
import {DebugOptions} from '@springroll/debug';
// @endif

(function(window) {
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('touch', 'filters');

    // Init the animator
    plugin.setup = function() {
        const navigator = window.navigator;

        /**
         * If the current brower is iOS
         * @property {Boolean} isIOS
         */
        this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;

        /**
         * If the current brower is Android
         * @property {Boolean} isAndroid
         */
        this.isAndroid = navigator.userAgent.search(/Android/) > -1;

        /**
         * If the current brower has touch input available
         * @property {Boolean} hasTouch
         */
        this.hasTouch = !!(('ontouchstart' in window) || // iOS & Android
            (navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
            (navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+

        // @if DEBUG
        /**
         * Manually override the check for hasTouch (unminifed library version only)
         * @property {Boolean} options.forceTouch
         * @default false
         */
        this.options.add('forceTouch', false)
            .on('forceTouch', value => {
                if (value === 'true' || value === true) {
                    this.hasTouch = true;
                }
            });

        DebugOptions.boolean('forceTouch', 'Force hasTouch to true');        
        // @endif
    };

    // Add common filteres interaction
    plugin.ready = function() {
        // @if DEBUG
        const value = this.options.forceTouch;
        if (value === 'true' || value === true) {
            this.hasTouch = true;
        }
        // @endif

        // Add the interaction filters, must have interface module MobilePlugin
        if (this.filters) {
            let ui = this.hasTouch ? '_touch' : '_mouse';
            this.filters.add('%INTERACTION%', ui);
            this.filters.add('%UI%', ui);
        }
    };

}(window));