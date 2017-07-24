import {include, EventEmitter} from '@springroll/core';

/**
 * Abstract the communication layer between the iframe
 * and the parent DOM
 * @class
 * @extends springroll.EventEmitter
 * @memberof springroll
 */
export default class Bellhop extends EventEmitter {
    
    constructor() {
        super();

        /**
         *  Bound handler for the window message event
         *  @member {function}
         *  @private
         */
        this.onReceive = this.receive.bind(this);

        /**
         *  If we are connected to another instance of the bellhop
         *  @member {boolean}
         *  @readonly
         *  @default false
         *  @private
         */
        this.connected = false;

        /**
         *  The name of this Bellhop instance, useful for debugging purposes
         *  @member {string}
         */
        this.name = '';

        /**
         *  If this instance represents an iframe instance
         *  @member {boolean}
         *  @private
         *  @default true
         */
        this.isChild = true;

        /**
         *  If we are current trying to connec
         *  @member {boolean}
         *  @default false
         *  @private
         */
        this.connecting = false;

        /**
         *  If using cross-domain, the domain to post to
         *  @member {boolean}
         *  @private
         *  @default "*"
         */
        this.origin = '*';

        /**
         *  Save any sends to wait until after we're done
         *  @member {Array}
         *  @private
         */
        this._sendLater = [];

        /**
         *  Do we have something to connect to, should be called after
         *  attempting to `connect()`
         *  @member {boolean}
         *  @readOnly
         */
        this.supported = null;

        /**
         * The iframe element
         * @member {HTMLIFrameElement}
         * @private
         * @readOnly
         */
        this.iframe = null;
    }

    /**
     *  The connection has been established successfully
     *  @event springroll.Bellhop#connected
     */

    /**
     *  Connection could not be established
     *  @event springroll.Bellhop#failed
     */

    /**
     *  Handle messages in the window
     *  @private
     */
    receive(event) {
        // Ignore events that don't originate from the target
        // we're connected to
        if (event.source !== this.target) {
            return;
        }

        let data = event.data;

        // This is the initial connection event
        if (data === 'connected') {
            this.connecting = false;
            this.connected = true;

            this.emit('connected');

            // Be polite and respond to the child that we're ready
            if (!this.isChild) {
                this.target.postMessage(data, this.origin);
            }

            let i, len = this._sendLater.length;

            // If we have any sends waiting to send
            // we are now connected and it should be okay 
            if (len > 0) {
                for (i = 0; i < len; i++) {
                    let e = this._sendLater[i];
                    this.send(e.type, e.data);
                }
                this._sendLater.length = 0;
            }
        }
        else {
            // Ignore all other event if we don't have a context
            if (!this.connected) {
                return;
            }

            try {
                data = JSON.parse(data, Bellhop.reviver);
            }
            catch (err) {
                // If we can't parse the JSON
                // just ignore it, this should
                // only be an object
                return;
            }

            // Only valid objects with a type and matching channel id
            if (typeof data === 'object' && data.type) {
                this.emit(data);
            }
        }
    }

    /**
     *  And override for the toString built-in method
     *  @method toString
     *  @return {string} Representation of this instance
     */
    toString() {
        return '[Bellhop \'' + this.name + '\']';
    }

    /**
     *  The target where to send messages
     *  @property {Window} target
     *  @private
     *  @readOnly
     */
    get target() {
        return this.isChild ? window.parent : this.iframe.contentWindow;
    }

    /**
     *  Setup the connection
     *  @param {HTMLIFrameElement} [iframe] The iframe to communicate with. If no value is set, the assumption
     *         is that we're the child trying to communcate with our window.parent
     *  @param {string} [origin="*"] The domain to communicate with if different from the current.
     *  @return {springroll.Bellhop} Return instance of current object
     */
    connect(iframe, origin) {
        // Ignore if we're already trying to connect
        if (this.connecting) {
            return this;
        }

        // Disconnect from any existing connection
        this.disconnect();

        // We are trying to connect
        this.connecting = true;

        //re-init if we had previously been destroyed
        if (!this._sendLater) {
            this._sendLater = [];
        }

        // The iframe if we're the parent
        this.iframe = iframe || null;

        // The instance of bellhop is inside the iframe
        let isChild = this.isChild = (iframe === undefined);
        let target = this.target;
        this.supported = isChild ? !!target && window !== target : !!target;
        this.origin = origin === undefined ? '*' : origin;

        // Listen for incoming messages
        if (window.attachEvent) {
            window.attachEvent('onmessage', this.onReceive);
        }
        else {
            window.addEventListener('message', this.onReceive);
        }

        if (isChild) {
            // No parent, can't connect
            if (window === target) {
                this.emit('failed');
            }
            else {
                // If connect is called after the window is ready
                // we can go ahead and send the connect message
                if (window.document.readyState === 'complete') {
                    target.postMessage('connected', this.origin);
                }
                else {
                    // Or wait until the window is finished loading
                    // then send the handshake to the parent
                    window.onload = function() {
                        target.postMessage('connected', this.origin);
                    }.bind(this);
                }
            }
        }
        return this;
    }

    /**
     *  Disconnect if there are any open connections
     */
    disconnect() {
        this.connected = false;
        this.connecting = false;
        this.origin = null;
        this.iframe = null;
        if (this._sendLater) {
            this._sendLater.length = 0;
        }
        this.isChild = true;

        if (window.detachEvent) {
            window.detachEvent('onmessage', this.onReceive);
        }
        else {
            window.removeEventListener('message', this.onReceive);
        }

        return this;
    }

    /**
     *  Send an event to the connected instance
     *  @param {string} event The event type to send to the parent
     *  @param {object} [data] Additional data to send along with event
     *  @return {springroll.Bellhop} Return instance of current object
     */
    send(event, data) {
        if (typeof event !== 'string') {
            throw 'The event type must be a string';
        }
        event = {
            type: event
        };

        // Add the additional data, if needed
        if (data !== undefined) {
            event.data = data;
        }
        if (this.connecting) {
            this._sendLater.push(event);
        }
        else if (!this.connected) {
            return this;
        }
        else {
            this.target.postMessage(JSON.stringify(event), this.origin);
        }
        return this;
    }

    /**
     *  A convenience method for sending and the listening to create 
     *  a singular link to fetching data. This is the same calling send
     *  and then getting a response right away with the same event.
     *  @param {string} event The name of the event
     *  @param {function} callback The callback to call after, takes event object as one argument
     *  @param {object} [data] Optional data to pass along
     *  @param {boolean} [runOnce=false] If we only want to fetch once and then remove the listener
     *  @return {springroll.Bellhop} Return instance of current object
     */
    fetch(event, callback, data, runOnce = false) {

        if (!this.connecting && !this.connected) {
            throw 'No connection, please call connect() first';
        }
        const internalCallback = (e) => {
            if (runOnce) {
                this.off(e.type, internalCallback);
            }
            callback(e);
        };
        this.on(event, internalCallback);
        this.send(event, data);
        return this;
    }

    /**
     *  A convience method for listening to an event and then responding with some data
     *  right away. Automatically removes the listener
     *  @param {string} event The name of the event
     *  @param {object} data The object to pass back. 
     *      May also be a function; the return value will be sent as data in this case.
     *  @param {boolean} [runOnce=false] If we only want to respond once and then remove the listener
     *  @return {springroll.Bellhop} Return instance of current object
     */
    respond(event, data, runOnce = false) {
        const internalCallback = (e) => {
            if (runOnce) {
                this.off(e.type, internalCallback);
            }
            this.send(event, typeof data === 'function' ? data() : data);
        };
        this.on(event, internalCallback);
        return this;
    }

    /**
     *  Destroy and don't user after this
     */
    destroy() {
        super.destroy();
        this.disconnect();
        this._sendLater = null;
    }

    /**
     * When restoring from JSON via `JSON.parse`, we may pass a reviver function.
     * In our case, this will check if the object has a specially-named property (`__classname`).
     * If it does, we will attempt to construct a new instance of that class, rather than using a
     * plain old Object. Note that this recurses through the object.
     * See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">JSON.parse()</a>
     * @param  {string} key   each key name
     * @param  {object} value Object that we wish to restore
     * @return {object}       The object that was parsed - either cast to a class, or not
     */
    static reviver(key, value) {
        if (value && typeof value.__classname === 'string') {
            let _class = include(value.__classname);
            if (_class) {
                let rtn = new _class();
                //if we may call fromJSON, do so
                if (rtn.fromJSON) {
                    rtn.fromJSON(value);
                    //return the cast Object
                    return rtn;
                }
            }
        }
        //return the object we were passed in
        return value;
    }
}
