/**
 * @module Core
 * @namespace springroll
 */
import EventDispatcher from './EventDispatcher';

/**
 * Event dispatcher with ability to detect whenever a property
 * is changed.
 * @class PropertyDispatcher
 * @extends springroll.EventDispatcher
 * @constructor {Object} [overrides] The supplied options
 */
var PropertyDispatcher = function()
{
    EventDispatcher.call(this);

    /**
     * The map of property values to store
     * @private
     * @property {Object} _properties
     */
    this._properties = {};
};

// Extend the base class
PropertyDispatcher.prototype = Object.create(EventDispatcher.prototype);

/**
 * Generic setter for an option
 * @private
 * @method _set
 * @param {string} prop The property name
 * @param {mixed} value The value to set
 */
PropertyDispatcher.prototype._set = function(name, value)
{
    var prop = this._properties[name];
    if (prop.readOnly)
    {
        throw "Property '" + name + "' is read-only";
    }
    var oldValue = prop.value;
    prop.value = value;
    if (oldValue != value)
    {
        this.trigger(name, value);
    }
};

/**
 * Generic setter for an option
 * @private
 * @method _get
 * @param {string} prop The option name
 * @return {mixed} The value of the option
 */
PropertyDispatcher.prototype._get = function(name)
{
    var prop = this._properties[name];
    if (prop.responder)
    {
        var value = prop.responder();
        prop.value = value;
        return value;
    }
    return prop.value;
};

/**
 * Add a new property to allow deteching
 * @method add
 * @param {string} prop The property name
 * @param {mixed} [value=null] The default value
 * @param {Boolean} [readOnly=false] If the property is readonly
 * @return {PropertyDispatcher} The instance for chaining
 */
PropertyDispatcher.prototype.add = function(name, value, readOnly)
{
    var props = this._properties;
    var prop = props[name];

    if (prop !== undefined)
    {
        prop.setValue(value);
        prop.setReadOnly(readOnly === undefined ? prop.readOnly : readOnly);
        return this;
    }

    if (this.hasOwnProperty(name))
    {
        throw "Object already has property " + name;
    }

    props[name] = new Property(name, value, readOnly);

    Object.defineProperty(this, name,
    {
        get: this._get.bind(this, name),
        set: this._set.bind(this, name)
    });
    return this;
};

/**
 * Whenever a property is get a responder is called
 * @method respond
 * @param {String} name The property name
 * @param {Function} responder Function to call when getting property
 * @return {PropertyDispatcher} The instance for chaining
 */
PropertyDispatcher.prototype.respond = function(name, responder)
{
    var prop = this._properties[name];
    if (prop === undefined)
    {
        // @if DEBUG
        throw "Property " + name + " does not exist, you must add(name, value) first before adding responder";
        // @endif
        // @if RELEASE
        // eslint-disable-next-line no-unreachable
        throw "Property " + name + " does not exist";
        // @endif
    }
    prop.responder = responder;

    // Update the property value
    prop.value = responder();

    return this;
};

/**
 * Clean-up all references, don't use after this
 * @method destroy
 */
PropertyDispatcher.prototype.destroy = function()
{
    var prop;
    for (var name in this._properties)
    {
        prop = this._properties[name];
        prop.value = null;
        prop.responder = null;
    }
    this._properties = null;
    EventDispatcher.prototype.destroy.call(this);
};

/**
 * Internal class for managing the property
 * @class Property
 * @private
 * @constructor
 * @param {String} name The name of the property
 * @param {*} [value=null] The initial value
 * @param {Boolean} [readOnly=false] If property is read-only
 */
var Property = function(name, value, readOnly)
{
    this.name = name;
    this.setValue(value);
    this.setReadOnly(readOnly);
    this.responder = null;
};

/**
 * Set the value of the property
 * @method setValue
 * @param {*} [value=null] The value to set
 */
Property.prototype.setValue = function(value)
{
    this.value = value === undefined ? null : value;
};

/**
 * Set the value of the property
 * @method setReadOnly
 * @param {Boolean} [readOnly=false] The readOnly status
 */
Property.prototype.setReadOnly = function(readOnly)
{
    this.readOnly = readOnly === undefined ? false : !!readOnly;
};

// Assign to namespace
export default PropertyDispatcher;