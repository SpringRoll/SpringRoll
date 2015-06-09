/**
 * @module Core
 * @namespace springroll
 */
(function(undefined) {

	var Application;

	/**
	*  A class for delaying a call through the Application, instead of relying on setInterval() or
	*  setTimeout().
	*
	*  @class DelayedCall
	*  @constructor
	*  @param {function} callback The function to call when the delay has completed.
	*  @param {int} delay The time to delay the call, in milliseconds (or optionally frames).
	*  @param {Object|Boolean} [options=false] The options to use or repeat value
	*  @param {Boolean} [options.repeat=false] If the DelayedCall should automatically repeat itself when
	*                                  completed.
	*  @param {Boolean} [options.autoDestroy=true] If the DelayedCall should clean itself up when completed.
	*  @param {Boolean} [options.useFrames=false] If the DelayedCall should use frames instead of
	*                                     milliseconds for the delay.
	*  @param {Boolean} [autoDestroy=true] If the DelayedCall should clean itself up when completed.
	*  @param {Boolean} [useFrames=false] If the DelayedCall should use frames instead of
	*                                     milliseconds for the delay.
	*/
	var DelayedCall = function(callback, delay, options, autoDestroy, useFrames)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
		}

		// @deprecate the options as repeat param
		if (typeof options === "boolean")
		{
			options = {
				repeat: !!options,
				autoDestroy: autoDestroy === undefined ? true : !!autoDestroy,
				useFrames: !!useFrames
			};
		}

		// Set the default options
		options = Object.merge({
			repeat: false,
			autoDestroy: true,
			useFrames: false
		}, options || {});

		
		/**
		*  The function to call when the delay is completed.
		*  @private
		*  @property {function} _callback
		*/
		this._callback = callback;

		/**
		*  The delay time, in milliseconds.
		*  @private
		*  @property {int} _delay
		*/
		this._delay = delay;

		/**
		*  The timer counting down from _delay, in milliseconds.
		*  @private
		*  @property {int} _timer
		*/
		this._timer = delay;

		/**
		*  If the DelayedCall should repeat itself automatically.
		*  @private
		*  @property {Boolean} _repeat
		*  @default false
		*/
		this._repeat = options.repeat;

		/**
		*  If the DelayedCall should destroy itself after completing
		*  @private
		*  @property {Boolean} _autoDestroy
		*  @default true
		*/
		this._autoDestroy = options.autoDestroy;
		
		/**
		*  If the DelayedCall should use frames instead of milliseconds for the delay.
		*  @private
		*  @property {Boolean} _useFrames
		*  @default false
		*/
		this._useFrames = options.useFrames;

		/**
		*  If the DelayedCall is currently paused (not stopped).
		*  @private
		*  @property {Boolean} _paused
		*/
		this._paused = false;

		//save a bound version of the update function
		this._update = this._update.bind(this);

		//start the delay
		Application.instance.on("update", this._update);
	};

	var p = DelayedCall.prototype;

	/**
	*  The callback supplied to the Application for an update each frame.
	*  @private
	*  @method _update
	*  @param {int} elapsed The time elapsed since the previous frame.
	*/
	p._update = function(elapsed)
	{
		if(!this._callback)
		{
			this.destroy();
			return;
		}

		this._timer -= this._useFrames ? 1 : elapsed;
		if(this._timer <= 0)
		{
			this._callback();
			if(this._repeat)
				this._timer += this._delay;
			else if(this._autoDestroy)
				this.destroy();
			else
				Application.instance.off("update", this._update);
		}
	};

	/**
	*  Restarts the DelayedCall, whether it is running or not.
	*  @public
	*  @method restart
	*/
	p.restart = function()
	{
		if(!this._callback) return;
		var app = Application.instance;
		if(!app.has("update", this._update))
			app.on("update", this._update);
		this._timer = this._delay;
		this._paused = false;
	};

	/**
	*  Stops the DelayedCall, without destroying it.
	*  @public
	*  @method stop
	*/
	p.stop = function()
	{
		Application.instance.off("update", this._update);
		this._paused = false;
	};

	/**
	*  If the DelayedCall is paused or not.
	*  @public
	*  @property {Boolean} paused
	*/
	Object.defineProperty(p, "paused", {
		get: function() { return this._paused; },
		set: function(value)
		{
			if(!this._callback) return;
			var app = Application.instance;
			if(this._paused && !value)
			{
				this._paused = false;
				if(!app.has("update", this._update))
					app.on("update", this._update);
			}
			else if(value)
			{
				if(app.has("update", this._update))
				{
					this._paused = true;
					app.off("update", this._update);
				}
			}
		}
	});

	/**
	*  Stops and cleans up the DelayedCall. Do not use it after calling
	*  destroy().
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		Application.instance.off("update", this._update);
		this._callback = null;
	};

	namespace('springroll').DelayedCall = DelayedCall;
}());