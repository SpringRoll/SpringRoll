/**
 * @module Container
 * @namespace springroll
 */
(function(undefined)
{
	var Debug = include('springroll.Debug', false);

	/**
	 * Provide feature detection
	 * @class Features
	 */
	var Features = {};

	/**
	 * If the browser has flash
	 * @property {boolean} flash
	 */
	Features.flash = function()
	{
		var hasFlash = false;
		try
		{
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if (fo)
			{
				hasFlash = true;
			}
		}
		catch (e)
		{
			if (navigator.mimeTypes &&
				navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
				navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin)
			{
				hasFlash = true;
			}
		}
		return hasFlash;
	}();

	/**
	 * If the browser has WebGL support
	 * @property {boolean} webgl
	 */
	Features.webgl = function()
	{
		var canvas = document.createElement('canvas');
		if ('supportsContext' in canvas)
		{
			return canvas.supportsContext('webgl') ||
				canvas.supportsContext('experimental-webgl');
		}
		return !!window.WebGLRenderingContext;
	}();

	/**
	 * If the browser has Canvas support
	 * @property {boolean} canvas
	 */
	Features.canvas = function()
	{
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}();

	/**
	 * If the browser has WebAudio API support
	 * @property {boolean} webaudio
	 */
	Features.webaudio = function()
	{
		return 'webkitAudioContext' in window || 'AudioContext' in window;
	}();

	/**
	 * If the browser has Web Sockets API
	 * @property {boolean} websockets
	 */
	Features.websockets = function()
	{
		return 'WebSocket' in window || 'MozWebSocket' in window;
	}();

	/**
	 * If the browser has Geolocation API
	 * @property {boolean} geolocation
	 */
	Features.geolocation = function()
	{
		return 'geolocation' in navigator;
	}();

	/**
	 * If the browser has Web Workers API
	 * @property {boolean} webworkers
	 */
	Features.webworkers = function()
	{
		return !!window.Worker;
	}();

	/**
	 * If the browser has touch
	 * @property {boolean} touch
	 */
	Features.touch = function()
	{
		return !!(('ontouchstart' in window) || // iOS & Android
			(navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
			(navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+
	}();

	/**
	 * Test for basic browser compatiliblity 
	 * @method basic
	 * @static
	 * @return {String} The error message, if fails
	 */
	Features.basic = function()
	{
		if (!Features.canvas)
		{
			return 'Browser does not support canvas';
		}
		else if (!Features.webaudio && !Features.flash)
		{
			return 'Browser does not support WebAudio or Flash audio';
		}
		return null;
	};

	/**
	 * See if the current bowser has the correct features
	 * @method test
	 * @static
	 * @param {object} capabilities The capabilities
	 * @param {object} capabilities.features The features
	 * @param {object} capabilities.features.webgl WebGL required
	 * @param {object} capabilities.features.geolocation Geolocation required
	 * @param {object} capabilities.features.webworkers Web Workers API required
	 * @param {object} capabilities.features.webaudio WebAudio API required
	 * @param {object} capabilities.features.websockets WebSockets required
	 * @param {object} capabilities.sizes The sizes
	 * @param {Boolean} capabilities.sizes.xsmall Screens < 480
	 * @param {Boolean} capabilities.sizes.small Screens < 768
	 * @param {Boolean} capabilities.sizes.medium Screens < 992
	 * @param {Boolean} capabilities.sizes.large Screens < 1200
	 * @param {Boolean} capabilities.sizes.xlarge Screens >= 1200
	 * @param {object} capabilities.ui The ui
	 * @param {Boolean} capabilities.ui.touch Touch capable
	 * @param {Boolean} capabilities.ui.mouse Mouse capable
	 * @return {String|null} The error, or else returns null
	 */
	Features.test = function(capabilities)
	{
		// check for basic compatibility
		var err = Features.basic();
		if (err)
		{
			return err;
		}
		var features = capabilities.features;
		var ui = capabilities.ui;
		var sizes = capabilities.sizes;

		for (var name in features)
		{
			if (Features[name] !== undefined)
			{
				// Failed built-in feature check
				if (features[name] && !Features[name])
				{
					return "Browser does not support " + name;
				}
				else
				{
					if (DEBUG && Debug)
						Debug.log("Browser has " + name);
				}
			}
			else
			{
				if (DEBUG && Debug)
					Debug.warn("The feature " + name + " is not supported");
			}
		}

		// Failed negative touch requirement
		if (!ui.touch && Features.touch)
		{
			return "Game does not support touch input";
		}

		// Failed mouse requirement
		if (!ui.mouse && !Features.touch)
		{
			return "Game does not support mouse input";
		}

		// Check the sizes
		var size = Math.max(window.screen.width, window.screen.height);

		if (!sizes.xsmall && size < 480)
		{
			return "Game doesn't support extra small screens";
		}
		if (!sizes.small && size < 768)
		{
			return "Game doesn't support small screens";
		}
		if (!sizes.medium && size < 992)
		{
			return "Game doesn't support medium screens";
		}
		if (!sizes.large && size < 1200)
		{
			return "Game doesn't support large screens";
		}
		if (!sizes.xlarge && size >= 1200)
		{
			return "Game doesn't support extra large screens";
		}
		return null;
	};

	if (DEBUG && Debug)
	{
		Debug.info("Browser Feature Detection" +
			("\n\tFlash support " + (Features.flash ? "\u2713" : "\u00D7")) +
			("\n\tCanvas support " + (Features.canvas ? "\u2713" : "\u00D7")) +
			("\n\tWebGL support " + (Features.webgl ? "\u2713" : "\u00D7")) +
			("\n\tWebAudio support " + (Features.webaudio ? "\u2713" : "\u00D7"))
		);
	}

	//Leak Features namespace
	namespace('springroll').Features = Features;

})();