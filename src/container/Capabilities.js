/**
 * @module Container
 * @namespace springroll
 * @requires  Core
 */
(function()
{
	var Features = include('springroll.Features'),
		Debug = include('springroll.Debug', false);

	/**
	 * Test the capabilities of a game release
	 * @class Capabilities
	 */
	var Capabilities = {};

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
	Capabilities.test = function(capabilities)
	{
		var features = capabilities.features;
		var ui = capabilities.ui;
		var sizes = capabilities.sizes;		
		
		for(var name in features)
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
						Debug.log("Browser has "+ name);
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

	namespace('springroll').Capabilities = Capabilities;
}());