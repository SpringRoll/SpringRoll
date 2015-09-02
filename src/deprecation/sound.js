(function()
{
	var Sound = include('springroll.Sound');

	// Reference to prototype
	var p = Sound.prototype;

 	/**
	 * @method
	 * @name springroll.Sound#loadConfig
	 * @see {@link springroll.Sound#addContext}
	 * @deprecated since version 0.3.0
	 */
	p.loadConfig = function(config)
	{
		if (DEBUG) console.warn("loadConfig is now deprecated, please use addContext method, e.g. : app.sound.addContext(config);");
		return this.addContext(config);
	};

	/**
	 * @method
	 * @name springroll.Sound#preloadSound
	 * @see {@link springroll.Sound#preload}
	 * @deprecated since version 0.4.0
	 */
	p.preloadSound = function(alias, callback)
	{
		if (DEBUG) console.warn("preloadSound is now deprecated, please use preload method, e.g. : app.sound.preload(alias, callback);");
		this.preload(alias, callback);
	};

}());