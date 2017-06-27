import EventEmitter from './EventEmitter';

/**
 * Event dispatcher with ability to detect whenever a property
 * is changed.
 * @class PropertyEmitter
 * @extends springroll.EventEmitter
 * @constructor {Object} [overrides] The supplied options
 */
class PropertyEmitter extends EventEmitter {
    constructor() {
        super();

        /**
         * The map of property values to store
         * @private
         * @property {Object} _properties
         */
        this._properties = {};
    }

    /**
     * Generic setter for an option
     * @private
     * @method _set
     * @param {string} prop The property name
     * @param {mixed} value The value to set
     */
    _set(name, value) {
        let prop = this._properties[name];
        if (prop.readOnly) {
            throw `Property '${name}' is read-only`;
        }
        let oldValue = prop.value;
        prop.value = value;
        if (oldValue !== value) {
            this.emit(name, value);
        }
    }

    /**
     * Generic setter for an option
     * @private
     * @method _get
     * @param {string} prop The option name
     * @return {mixed} The value of the option
     */
    _get(name) {
        let prop = this._properties[name];
        if (prop.responder) {
            let value = prop.responder();
            prop.value = value;
            return value;
        }
        return prop.value;
    }

    /**
     * Add a new property to allow deteching
     * @method add
     * @param {string} prop The property name
     * @param {mixed} [value=null] The default value
     * @param {Boolean} [readOnly=false] If the property is readonly
     * @return {PropertyEmitter} The instance for chaining
     */
    add(name, value, readOnly) {
        let props = this._properties;
        let prop = props[name];

        if (prop !== undefined) {
            prop.setValue(value);
            prop.setReadOnly(readOnly === undefined ? prop.readOnly : readOnly);
            return this;
        }

        if (this.hasOwnProperty(name)) {
            throw `Object already has property '${name}'`;
        }

        props[name] = new Property(name, value, readOnly);

        Object.defineProperty(this, name,
            {
                get: this._get.bind(this, name),
                set: this._set.bind(this, name)
            });
        return this;
    }

    /**
     * Whenever a property is get a responder is called
     * @method respond
     * @param {String} name The property name
     * @param {Function} responder Function to call when getting property
     * @return {PropertyEmitter} The instance for chaining
     */
    respond(name, responder) {
        let prop = this._properties[name];
        if (prop === undefined) {
            // @if DEBUG
            throw `Property '${name}' does not exist, you must add(name, value) first before adding responder"`;
            // @endif
            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw `Property '${name}' does not exist"`;
            // @endif
        }
        prop.responder = responder;

        // Update the property value
        prop.value = responder();

        return this;
    }

    /**
     * Clean-up all references, don't use after this
     * @method destroy
     */
    destroy() {
        let prop;
        for (let name in this._properties) {
            prop = this._properties[name];
            prop.value = null;
            prop.responder = null;
        }
        this._properties = null;
        super.destroy();
    }
}

/**
 * Internal class for managing the property
 * @class Property
 * @private
 * @constructor
 * @param {String} name The name of the property
 * @param {*} [value=null] The initial value
 * @param {Boolean} [readOnly=false] If property is read-only
 */
class Property {
    constructor(name, value, readOnly) {
        this.name = name;
        this.setValue(value);
        this.setReadOnly(readOnly);
        this.responder = null;
    }

    /**
     * Set the value of the property
     * @method setValue
     * @param {*} [value=null] The value to set
     */
    setValue(value = null) {
        this.value = value;
    }

    /**
     * Set the value of the property
     * @method setReadOnly
     * @param {Boolean} [readOnly=false] The readOnly status
     */
    setReadOnly(readOnly = false) {
        this.readOnly = !!readOnly;
    }
}

export default PropertyEmitter;
