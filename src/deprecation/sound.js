/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Sound = include('springroll.Sound');

	// Reference to prototype
	var p = Sound.prototype;

	/**
	 * @class Sound
	 */
 	/**
 	 * Add a configuration to the load, see {{#crossLink "springroll.Sound/addContext:method"}}{{/crossLink}}
	 * @method loadConfig
	 * @deprecated since version 0.3.0
	 * @param {Object} config The configuration
	 * @return {springroll.Sound} Sound object for chaining
	 */
	p.loadConfig = function(config)
	{
		if (DEBUG) console.warn("loadConfig is now deprecated, please use addContext method, e.g. : app.sound.addContext(config);");
		return this.addContext(config);
	};

	/**
	 * Preload a single sound, see {{#crossLink "springroll.Sound/preload:method"}}{{/crossLink}}
	 * @method preloadSound
	 * @deprecated since version 0.4.0
	 * @param {String} alias The sound to preload
	 * @param {Function} callback Callback when complete
	 */
	p.preloadSound = function(alias, callback)
	{
		if (DEBUG) console.warn("preloadSound is now deprecated, please use preload method, e.g. : app.sound.preload(alias, callback);");
		this.preload(alias, callback);
	};

}());