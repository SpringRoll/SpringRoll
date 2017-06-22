/**
 * The EventDispatcher mirrors the functionality of AS3 and EaselJS's EventDispatcher,
 * but is more robust in terms of inputs for the `on()` and `off()` methods.
 *
 * @class EventDispatcher
 * @constructor
 */
export default class EventDispatcher
{
    constructor()
    {
        /**
         * The collection of listeners
         * @property {Object} _listeners
         * @private
         */
        this._listeners = {};

        /**
         * If the dispatcher is destroyed
         * @property {Boolean} _destroyed
         * @protected
         */
        this._destroyed = false;
    }

    /**
     * If the dispatcher is destroyed
     * @property {Boolean} destroyed
     */
    get destroyed()
    {
        return this._destroyed;
    }

    /**
     * Dispatch an event
     * @method trigger
     * @param {String} type The type of event to trigger
     * @param {*} arguments Additional parameters for the listener functions.
     */
    trigger(type, ...args)
    {
        if (this._destroyed)
        {
            return;
        }

        if (this._listeners.hasOwnProperty(type) && (this._listeners[type] !== undefined))
        {
            // copy the listeners array
            let listeners = this._listeners[type].slice();

            for (let i = listeners.length - 1; i >= 0; --i)
            {
                let listener = listeners[i];

                if (listener._eventDispatcherOnce)
                {
                    delete listener._eventDispatcherOnce;
                    this.off(type, listener);
                }
                
                if (args.length)
                {
                    listener.apply(this, args);
                }
                else
                {
                    listener.call(this);
                }
            }
        }
    }

    /**
     * Add an event listener but only handle it one time.
     *
     * @method once
     * @param {String|object} name The type of event (can be multiple events separated by spaces),
     *      or a map of events to handlers
     * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
     * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
     * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
     */
    once(name, callback, priority)
    {
        return this.on(name, callback, priority, true);
    }

    /**
     * Add an event listener. The parameters for the listener functions depend on the event.
     *
     * @method on
     * @param {String|object} name The type of event (can be multiple events separated by spaces),
     *      or a map of events to handlers
     * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
     * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
     * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
     */
    on(name, callback, priority, once)
    {
        if (this._destroyed)
        {
            return;
        }

        // Callbacks map
        if (this.type(name) === 'object')
        {
            for (let key in name)
            {
                if (name.hasOwnProperty(key))
                {
                    this.on(key, name[key], priority, once);
                }
            }
        }
        // Callback
        else if (this.type(callback) === 'function')
        {
            let names = name.split(' ');
            let n = null;

            let listener;
            for (let i = 0, nl = names.length; i < nl; i++)
            {
                n = names[i];

                if (this._listeners.hasOwnProperty(n))
                {
                    listener = this._listeners[n];
                }
                else
                {
                    listener = this._listeners[n] = [];
                }

                if (once)
                {
                    callback._eventDispatcherOnce = true;
                }

                callback._priority = parseInt(priority) || 0;

                if (listener.indexOf(callback) === -1)
                {
                    listener.push(callback);
                    if (listener.length > 1)
                    {
                        listener.sort(function(a, b)
                        {
                            return a._priority - b._priority;
                        });
                    }
                }
            }
        }
        // Callbacks array
        else if (Array.isArray(callback))
        {
            for (let f = 0, fl = callback.length; f < fl; f++)
            {
                this.on(name, callback[f], priority, once);
            }
        }
        return this;
    }

    /**
     * Remove the event listener
     *
     * @method off
     * @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
     * @param {Function|Array*} callback The listener function or collection of callback functions
     * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
     */
    off(name, callback)
    {
        if (this._destroyed) return;

        // remove all
        if (name === undefined)
        {
            this._listeners = {};
        }
        // remove multiple callbacks
        else if (Array.isArray(callback))
        {
            for (let f = 0, fl = callback.length; f < fl; f++)
            {
                this.off(name, callback[f]);
            }
        }
        else
        {
            let names = name.split(' ');
            let n = null;
            let listener;
            let index;

            for (let i = 0, nl = names.length; i < nl; i++)
            {
                n = names[i];

                if (this._listeners.hasOwnProperty(n))
                {
                    listener = this._listeners[n];

                    // remove all listeners for that event
                    if (callback === undefined)
                    {
                        listener.length = 0;
                    }
                    else
                    {
                        //remove single listener
                        index = listener.indexOf(callback);

                        if (index !== -1)
                        {
                            listener.splice(index, 1);
                        }
                    }
                }
            }
        }
        return this;
    }

    /**
     * Checks if the EventDispatcher has a specific listener or any listener for a given event.
     *
     * @method has
     * @param {String} name The name of the single event type to check for
     * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
     * @return {Boolean} If the EventDispatcher has the specified listener.
     */
    has(name, callback)
    {
        if (!name || !this._listeners.hasOwnProperty(name)) return false;

        const listeners = this._listeners[name];

        if (!listeners)
        {
            return false;
        }

        if (!callback)
        {
            return listeners.length > 0;
        }

        return listeners.indexOf(callback) >= 0;
    }

    /**
     * Destroy and don't use after this
     * @method destroy
     */
    destroy()
    {
        this._destroyed = true;
        this._listeners = null;
    }

    /**
     * Return type of the value.
     *
     * @private
     * @method type
     * @param  {*} value
     * @return {String} The type
     */
    type(value)
    {
        if (value === null)
        {
            return 'null';
        }
        const typeOfValue = typeof value;

        if (typeOfValue === 'object' || typeOfValue === 'function')
        {
            return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
        }

        return typeOfValue;
    }
}
