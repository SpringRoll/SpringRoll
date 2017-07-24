/**
 * The return result of the Loader load.
 * ### module: @springroll/loader
 * @class
 * @memberof springroll
 */
export default class LoaderResult {
    /**
     * @param {any} content The dynamic content loaded
     * @param {string} url The url that was loaded
     * @param {any} [data] Optional data associated with object
     */
    constructor(content, url, data) {
        /**
         * The contents of the load
         * @member {any}
         */
        this.content = content;

        /**
         * The url of the load
         * @member {string}
         */
        this.url = url;

        /**
         * The data for the load item.
         * @member {any}
         */
        this.data = data;

        /**
         * The original asset id, if any
         * @member {string}
         */
        this.id = null;
    }

    /**
     * A to string method
     * @return {string} A string rep of the object
     */
    toString() {
        return `[LoaderResult(url: '${this.url}')]`;
    }

    /**
     * Reset to the original state
     */
    reset() {
        this.content =
            this.url =
            this.data =
            this.id = null;
    }

    /**
     * Destroy this result
     */
    destroy() {
        this.reset();
    }
}
