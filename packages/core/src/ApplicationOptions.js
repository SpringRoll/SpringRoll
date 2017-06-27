import PropertyEmitter from './events/PropertyEmitter';

/**
 * Manage the Application options
 * @class ApplicationOptions
 * @extends springroll.PropertyEmitter
 * @constructor {Object} [overrides] The supplied options
 */
export default class ApplicationOptions extends PropertyEmitter
{
    constructor(app, options)
    {
        super();

        /**
         * The user input options
         * @property {Object} _options
         * @private
         */
        this._options = options || {};

        /**
         * Reference to the application
         * @property {springroll.Application} _app
         * @private
         */
        this._app = app;

        /**
         * Use the query string parameters for options overrides
         * @property {Boolean} options.useQueryString
         * @default false
         */
        let useQueryString = false;
        // @if DEBUG
        useQueryString = true;
        // @endif
        this.add('useQueryString', useQueryString, true);

        /**
         * The name of the application
         * @property {String} options.name
         * @default ''
         */
        this.add('name', '', true);
    }

    /**
     * Initialize the values in the options
     * @method init
     */
    init()
    {
        let options = this._options;

        // Create the options overrides
        options = Object.assign({}, options);

        // If parse querystring is turned on, we'll
        // override with any of the query string parameters
        if (options.useQueryString)
        {
            Object.assign(options, this.getQueryString());
        }

        // Create getter and setters for all properties
        // this is so we can dispatch events when the property changes
        for (let name in options)
        {
            this.add(name, options[name]);
        }

        //trigger all of the initial values, because otherwise they don't take effect.
        let properties = this._properties;
        for (let id in properties)
        {
            this.emit(id, properties[id].value);
        }
    }

    /**
     * Get the query string as an object
     * @property {Object} getQueryString
     * @private
     */
    getQueryString()
    {
        let output = {};
        let href = window.location.search;

        if (!href) //empty string is false
        {
            return output;
        }

        let vars = href.substr(href.indexOf("?") + 1);
        let pound = vars.indexOf('#');
        vars = pound < 0 ? vars : vars.substring(0, pound);
        let splitFlashVars = vars.split("&");
        let myVar;

        for (let i = 0, len = splitFlashVars.length; i < len; i++)
        {
            myVar = splitFlashVars[i].split("=");
            let value = myVar[1];

            if (value === "true" || value === undefined)
            {
                value = true;
            }
            else if (value === "false")
            {
                value = false;
            }
            output[myVar[0]] = value;
        }
        return output;
    }

    /**
     * Convert a string into a DOM Element
     * @method asDOMElement
     * @param {String} name The property name to fetch
     */
    asDOMElement(name)
    {
        let prop = this._properties[name];

        if (prop && prop.value && typeof prop.value === "string")
        {
            prop.value = /^[\#\.]/.test(prop.value) ?
                document.querySelector(prop.value):
                document.getElementById(prop.value);
        }
    }

    /**
     * Override a default value
     * @method override
     * @param {String} name The property name to fetch
     * @param {*} value The value
     * @return {springroll.ApplicationOptions} Instance of this options for chaining
     */
    override(name, value)
    {
        let prop = this._properties[name];

        if (prop === undefined)
        {
            // @if DEBUG
            throw "Unable to override a property that doesn't exist '" + name + "'";
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw "Invalid override " + name;
            // @endif
        }
        prop.setValue(value);
        
        return this;
    }
}
