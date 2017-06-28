/**
 * Console output filter
 * @class
 * @private
 */
export default class ConsoleTarget {
    
    constructor() {

        /**
         * `true` if the filter is enabled
         * @member {Boolean}
         * @private
         * @default
         */
        this._enabled = (typeof console !== 'undefined');

        /**
         * `true` if colors are supported
         * @member {Boolean}
         * @private
         * @default
         */
        this._colors = typeof document.documentMode === 'undefined';
        // document.documentMode is an IE only property specifying 
        // what version of IE the document is being displayed for

        // detect IE9's issue with apply on console functions
        if (this._enabled) {
            try {
                console.assert.apply(console, [true, 'IE9 test']);
            }
            catch (error) {
                // Reference to the bind method
                const bind = Function.prototype.bind;

                // Bind all these methods in order to use apply
                // this is ONLY needed for IE9
                const methods = [
                    'log',
                    'debug',
                    'warn',
                    'info',
                    'error',
                    'assert',
                    'dir',
                    'trace',
                    'group',
                    'groupCollapsed',
                    'groupEnd'
                ];

                // Loop through console methods
                for (let method, i = 0; i < methods.length; i++) {
                    method = methods[i];
                    if (console[method]) {
                        console[method] = bind.call(console[method], console);
                    }
                }
            }
        }
    }

    /**
     * Run the target.
     * @param {String} command - Values include: log, debug, warn, info, error, assert, dir
     *        trace, clear, group, groupCollapsed, groupEnd
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    run(command, params) {
        if (!this._enabled) {
            return;
        }
        if (command === 'debug' && !console.debug) {
            command = 'log';
        }
        if (console[command]) {
            if (params.length === 1) {
                console[command](params[0]);
            }
            else {
                console[command].apply(console, params);
            }
        }
    }

    /**
     * Run the target.
     * @param {String} hexColor - Color to output
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    color(hexColor, params) {
        if (!this._enabled) {
            return;
        }
        if (!this._colors) {
            this.run('log', params);
        }
        else {
            const colorString = `color:${hexColor}`;

            if (typeof params[0] === 'object') {
                params.unshift(colorString);
                params.unshift('%c%o');
            }
            else {
                params[0] = '%c' + params[0];
                params.push(colorString);
            }
            this.run('log', params);
        }
    }
}