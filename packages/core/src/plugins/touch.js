import ApplicationPlugin from '../ApplicationPlugin';

(function(window) {

    const plugin = new ApplicationPlugin('touch', 'filters');

    // Init the animator
    plugin.setup = function() {
        const navigator = window.navigator;

        /**
         * If the current brower is iOS
         * @member {boolean} springroll.Application#isIOS
         */
        this.isIOS = navigator.userAgent.search(/iPhone|iPad|iPod/) > -1;

        /**
         * If the current brower is Android
         * @member {boolean} springroll.Application#isAndroid
         */
        this.isAndroid = navigator.userAgent.search(/Android/) > -1;

        /**
         * If the current brower has touch input available
         * @member {boolean} springroll.Application#hasTouch
         */
        this.hasTouch = !!(('ontouchstart' in window) || // iOS & Android
            (navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
            (navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+
    };

    // Add common filteres interaction
    plugin.ready = function() {
        // @if DEBUG
        const value = this.options.forceTouch;
        if (value === 'true' || value === true) {
            this.hasTouch = true;
        }
        // @endif

        // Add the interaction filters
        if (this.filters) {
            let ui = this.hasTouch ? '_touch' : '_mouse';
            this.filters.add('%INTERACTION%', ui);
            this.filters.add('%UI%', ui);
        }
    };

}(window));