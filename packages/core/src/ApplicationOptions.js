import PropertyEmitter from './events/PropertyEmitter';

/**
 * Manage the Application options.
 * ### module: @springroll/core
 * @class
 * @memberof springroll
 * @extends springroll.PropertyEmitter
 */
export default class ApplicationOptions extends PropertyEmitter {
    constructor(app, options) {
        super();

        /**
         * Use the query string parameters for options overrides
         * @member {Boolean}
         * @default false
         */
        let useQueryString = false;
        // @if DEBUG
        useQueryString = true;
        // @endif

        /**
         * The user input options
         * @member {Object}
         * @private
         */
        this._options = Object.assign({
            useQueryString,
            name: ''
        }, options);

        /**
         * Reference to the application
         * @member {springroll.Application}
         * @private
         */
        this._app = app;
    }

    /**
     * Initialize the values in the options
     */
    init() {

        const options = this._options;

        // If parse querystring is turned on, we'll
        // override with any of the query string parameters
        if (options.useQueryString) {
            Object.assign(options, this.getQueryString());
        }

        // Create getter and setters for all properties
        // this is so we can dispatch events when the property changes
        for (let name in options) {
            this.add(name, options[name]);
        }

        //trigger all of the initial values, because otherwise they don't take effect.
        let properties = this._properties;
        for (let id in properties) {
            this.emit(id, properties[id].value);
        }
    }

    /**
     * Get the query string as an object
     */
    getQueryString() {
        let output = {};
        let href = window.location.search;

        //empty string is false
        if (!href) {
            return output;
        }

        let vars = href.substr(href.indexOf('?') + 1);
        let pound = vars.indexOf('#');
        vars = pound < 0 ? vars : vars.substring(0, pound);
        let splitFlashVars = vars.split('&');
        let myVar;

        for (let i = 0, len = splitFlashVars.length; i < len; i++) {
            myVar = splitFlashVars[i].split('=');
            let value = myVar[1];

            if (value === 'true' || value === undefined) {
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
            output[myVar[0]] = value;
        }
        return output;
    }

    /**
     * Convert a string into a DOM Element
     * @param {String} name The property name to fetch
     */
    asDOMElement(name) {
        let prop = this._properties[name];

        if (prop && prop.value && typeof prop.value === 'string') {
            prop.value = /^[#.]/.test(prop.value) ?
                document.querySelector(prop.value):
                document.getElementById(prop.value);
        }
    }

    /**
     * Override a default value
     * @param {String} name The property name to fetch
     * @param {mixed} value The value
     * @return {springroll.ApplicationOptions} Instance of this options for chaining
     */
    override(name, value) {
        let prop = this._properties[name];

        if (prop === undefined) {
            // @if DEBUG
            throw 'Unable to override a property that doesn\'t exist \'' + name + '\'';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'Invalid override ' + name;
            // @endif
        }
        prop.setValue(value);
        
        return this;
    }
}
