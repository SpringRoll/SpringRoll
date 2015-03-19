/**
 * @module Container
 * @namespace springroll
 * @requires  Core
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