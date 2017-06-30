/**
 * Class for storing tokens that can be replaced within strings.
 * This can be useful for things like localizing assets paths, or providing
 * scale suffix to images.
 * ### module: @springroll/core
 * @class
 * @memberof springroll
 */
export default class StringFilters {
    constructor() {
        /**
         * Dictionary of filters
         * @member {Array}
         * @private
         */
        this._filters = [];
    }

    /**
     * Register a filter
     * @param {string|RegExp} replace The string or regex to replace
     * @param {string} replacement String to repalce with
     */
    add(replace, replacement) {
        if (!replace || (typeof replace !== 'string' && replace instanceof RegExp === false)) {
            // @if DEBUG
            throw 'replace value must be a valid String or RegExp';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'invalide replace value';
            // @endif
        }
        if (typeof replacement !== 'string') {
            // @if DEBUG
            throw 'replacement value must be astring';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'invalid replacement value';
            // @endif
        }

        if (this._filters) {
            for (let i = this._filters.length - 1; i >= 0; i--) {
                if (replace.toString() === this._filters[i].replace.toString()) {
                    // @if DEBUG
                    throw `Filter ${replace} already exists in this._filters array.`;
                    // @endif

                    // @if RELEASE
                    // eslint-disable-next-line no-unreachable
                    throw 'Filter already exists';
                    // @endif
                }
            }
            this._filters.push(
                {
                    replace: replace,
                    replacement: replacement
                });
        }
    }

    /**
     * Test a string against all registered filters
     * @param {string} str The string to check
     */
    filter(str) {
        if (!this._filters) {
            return str;
        }
        for (let i = this._filters.length - 1; i >= 0; i--) {
            const replace = this._filters[i].replace;
            const replacement = this._filters[i].replacement;
            str = str.replace(replace, replacement);
        }
        return str;
    }

    /**
     */
    destroy() {
        this._filters = null;
    }
}
