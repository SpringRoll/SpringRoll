/**
 * Output to a DOM element.
 * @class
 * @private
 */
export default class DOMTarget {

    constructor() {
        /**
         * If the filter is enabled
         * @member {boolean}
         */
        this._enabled = false;

        /**
         * DOM element to output to.
         * @member {HTMLElement}
         */
        this._output = null;

        /**
         * Mapping of commands to class names
         * @member {Array<String>}
         * @private
         */
        this._levels = {
            log: 'general',
            debug: 'debug',
            info: 'info',
            error: 'error',
            warn: 'warn'
        };
    }

    /**
     * Set the output element.
     * @member {HTMLElement}
     */
    set output(output) {
        this._enabled = !!output;
        this._output = output;
    }
    get output() {
        return this._output;
    }

    /**
     * Run the target.
     * @param {string} command - Values include: log, debug, warn, info, error, assert, dir
     *        trace, clear, group, groupCollapsed, groupEnd
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    run(command, params) {
        if (!this._enabled) {
            return;
        }
        const level = this._levels[command];
        if (level) {
            this._output.innerHTML += `<div class="${level}">${params.join(', ')}</div>`;
        }
        else if (command === 'assert' && !params[0]) {
            this.run('error', params.shift());
        }
        else if (command === 'clear') {
            this._output.innerHTML = '';
        }
    }

    /**
     * Run the target.
     * @param {string} command - Values include: log, debug, warn, info, error, assert, dir
     *        trace, clear.
     * @param {Array<mixed>} [params] - Additional parameters.
     */
    color(hexString, params) {
        if (!this._enabled) {
            return;
        }
        this._output.innerHTML += `<div style="color:${hexString}">${params.join(', ')}</div>`;
    }
}