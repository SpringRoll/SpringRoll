/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var Debug = include('springroll.Debug');

	/**
	 * Create an app plugin for Debug, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class DebugPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var DebugPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(DebugPlugin, ApplicationPlugin);

	// Init the animator
	p.init = function()
	{
		/**
		 * Enable the Debug class. After initialization, this
		 * is a pass-through to Debug.enabled.
		 * @property {Boolean} options.debug
		 * @default true
		 */
		this.options.add('debug', true);

		/**
		 * Minimum log level from 0 to 4
		 * @property {int} options.minLogLevel
		 * @default 0
		 */
		this.options.add('minLogLevel', 0);

		/**
		 * The framerate container
		 * @property {String|DOMElement} options.framerate
		 */
		this.options.add('framerate');

		/**
		 * The host computer for remote debugging, the debug
		 * module must be included to use this feature. Can be an
		 * IP address or host name. After initialization, setting
		 * this will still connect or disconect Debug for remote
		 * debugging. This is a write-only property.
		 * @property {String} options.debugRemote
		 */
		this.options.add('debugRemote', null)
		.respond('debug', function()
		{
			return Debug.enabled;
		})
		.on('debug', function(value)
		{
			Debug.enabled = value;
		})
		.on('debugRemote', function(value)
		{
			Debug.disconnect();
			if (value)
			{
				Debug.connect(value);
			}
		})
		.respond('minLogLevel', function()
		{
			return Debug.minLogLevel.asInt;
		})
		.on('minLogLevel', function(value)
		{
			Debug.minLogLevel = Debug.Levels.valueFromInt(
				parseInt(value, 10)
			);

			if (!Debug.minLogLevel)
			{
				Debug.minLogLevel = Debug.Levels.GENERAL;
			}
		});
	};

	p.ready = function(done)
	{
		this.options.asDOMElement('framerate');
		var framerate = this.options.framerate;

		if (!framerate)
		{
			var stage = this.display.canvas;
			framerate = document.createElement("div");
			framerate.id = "framerate";
			stage.parentNode.insertBefore(framerate, stage);
		}

		// Set the default text
		framerate.innerHTML = "FPS: 00.000";

		var frameCount = 0;
		var framerateTimer = 0;

		this.on('update', function(elapsed)
		{
			frameCount++;
			framerateTimer += elapsed;
			
			// Only update the framerate every second
			if (framerateTimer >= 1000)
			{
				var fps = 1000 / framerateTimer * frameCount;
				framerate.innerHTML = "FPS: " + formatFps(fps, 3);
				framerateTimer = 0;
				frameCount = 0;
			}
		})
		.on('resumed', function()
		{
			frameCount = framerateTimer = 0;
		});
		done();
	};

	/**
	 * Format the FPS display
	 * @method formatFps
	 * @private
	 */
	var formatFps = function(num, places)
	{
		var size = Math.pow(10, places);
		var value = String(Math.round(num * size) / size);
		var parts = value.split(".");
		if (parts.length == 1)
		{
			parts[1] = ".000";
		}
		else
		{
			while(parts[1].length < places)
			{
				parts[1] += "0";
			}
		}
		return parts.join('.');		
	};

	// Destroy the animator
	p.destroy = function()
	{
		if (DEBUG)
		{
			this.off('update resumed');

			// Remove the framerate container
			var framerate = document.getElementById('framerate');
			if (framerate && framerate.parentNode)
			{
				framerate.parentNode.removeChild(framerate);
			}
		}
		Debug.disconnect();
	};

	// register plugin
	ApplicationPlugin.register(DebugPlugin);

}());