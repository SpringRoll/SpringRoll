/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The EventDispatcher mirrors the functionality of AS3 and EaselJS's EventDispatcher,
	 * but is more robust in terms of inputs for the `on()` and `off()` methods.
	 *
	 * @class EventDispatcher
	 * @constructor
	 */
	var EventDispatcher = function()
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
	};

	// Reference to the prototype
	var p = extend(EventDispatcher);

	/**
	 * If the dispatcher is destroyed
	 * @property {Boolean} destroyed
	 */
	Object.defineProperty(p, 'destroyed',
	{
		enumerable: true,
		get: function()
		{
			return this._destroyed;
		}
	});

	/**
	 * Dispatch an event
	 * @method trigger
	 * @param {String} type The type of event to trigger
	 * @param {*} arguments Additional parameters for the listener functions.
	 */
	p.trigger = function(type)
	{
		if (this._destroyed) return;

		if (this._listeners.hasOwnProperty(type) && (this._listeners[type] !== undefined))
		{
			// copy the listeners array
			var listeners = this._listeners[type].slice();

			var args;

			if (arguments.length > 1)
			{
				args = Array.prototype.slice.call(arguments, 1);
			}

			for (var i = listeners.length - 1; i >= 0; --i)
			{
				var listener = listeners[i];
				if (listener._eventDispatcherOnce)
				{
					delete listener._eventDispatcherOnce;
					this.off(type, listener);
				}
				listener.apply(this, args);
			}
		}
	};

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
	p.once = function(name, callback, priority)
	{
		return this.on(name, callback, priority, true);
	};

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
	p.on = function(name, callback, priority, once)
	{
		if (this._destroyed) return;

		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key], priority, once);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '),
				n = null;

			var listener;
			for (var i = 0, nl = names.length; i < nl; i++)
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
						listener.sort(listenerSorter);
				}
			}
		}
		// Callbacks array
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f], priority, once);
			}
		}
		return this;
	};

	function listenerSorter(a, b)
	{
		return a._priority - b._priority;
	}

	/**
	 * Remove the event listener
	 *
	 * @method off
	 * @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
	 * @param {Function|Array*} callback The listener function or collection of callback functions
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.off = function(name, callback)
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
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' ');
			var n = null;
			var listener;
			var index;
			for (var i = 0, nl = names.length; i < nl; i++)
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
	};

	/**
	 * Checks if the EventDispatcher has a specific listener or any listener for a given event.
	 *
	 * @method has
	 * @param {String} name The name of the single event type to check for
	 * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
	 * @return {Boolean} If the EventDispatcher has the specified listener.
	 */
	p.has = function(name, callback)
	{
		if (!name || !this._listeners.hasOwnProperty(name)) return false;

		var listeners = this._listeners[name];
		if (!listeners) return false;
		if (!callback)
			return listeners.length > 0;
		return listeners.indexOf(callback) >= 0;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._destroyed = true;
		this._listeners = null;
	};

	/**
	 * Return type of the value.
	 *
	 * @private
	 * @method type
	 * @param  {*} value
	 * @return {String} The type
	 */
	function type(value)
	{
		if (value === null)
		{
			return 'null';
		}
		var typeOfValue = typeof value;
		if (typeOfValue === 'object' || typeOfValue === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeOfValue;
	}

	// Assign to name space
	namespace('springroll').EventDispatcher = EventDispatcher;

}());