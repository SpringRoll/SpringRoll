/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	var Sound = include('springroll.Sound');
	var SoundInstance = include('springroll.SoundInstance');
	var VOPlayer = include('springroll.VOPlayer');

	/**
	 * @class Sound
	 */
	// Reference to prototype
	var p = Sound.prototype;

	/**
	 * If sound is supported on the device/browser, see {{#crossLink "springroll.Sound/isSupported:property"}}{{/crossLink}}
	 * @property {Boolean} soundEnabled
	 * @deprecated since version 0.4.10
	 */
	Object.defineProperty(p, "soundEnabled",
	{
		get: function()
		{
			if (DEBUG) console.warn("soundEnabled is now deprecated, please use isSupported instead.");
			return this.isSupported;
		}
	});


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

	/**
	 * Unpauses all sounds, see {{#crossLink "springroll.Sound/resumeAll:method"}}{{/crossLink}}
	 * @method unpauseAll
	 * @deprecated since version 0.4.0
	 * @public
	 */
	p.unpauseAll = function()
	{
		if (DEBUG) console.warn("unpauseAll is now deprecated, please use resumeAll method, e.g. : app.sound.resumeAll();");
		this.resumeAll();
	};

	/**
	 * Unpauses a specific sound, see {{#crossLink "springroll.Sound/resume:method"}}{{/crossLink}}
	 * @method unpauseSound
	 * @deprecated since version 0.4.0
	 * @public
	 * @param {String} alias The alias of the sound to resume.
	 */
	p.unpauseSound = function(alias)
	{
		if (DEBUG) console.warn("unpauseSound is now deprecated, please use resume method, e.g. : app.sound.resume(alias);");
		this.resume(alias);
	};

	/**
	 * Unpauses a specific sound, see {{#crossLink "springroll.Sound/pause:method"}}{{/crossLink}}
	 * @method pauseSound
	 * @deprecated since version 0.4.0
	 * @public
	 * @param {String} alias The alias of the sound to pause.
	 */
	p.pauseSound = function(alias)
	{
		if (DEBUG) console.warn("pauseSound is now deprecated, please use pause method, e.g. : app.sound.pause(alias);");
		this.pause(alias);
	};

	/**
	 * @class SoundInstance
	 */
	p = SoundInstance.prototype;

	/**
	 * Unpauses this SoundInstance, see {{#crossLink "springroll.SoundInstance/resume:method"}}{{/crossLink}}
	 * @method unpause
	 * @deprecated since version 0.4.0
	 * @public
	 */
	p.unpause = function()
	{
		if (DEBUG) console.warn("unpause is now deprecated, please use resume method, e.g. : soundInst.resume();");
		this.resume();
	};

	/**
	 * @class VOPlayer
	 */
	p = VOPlayer.prototype;

	/**
	 * Get the current list of VO sounds, see {{#crossLink "springroll.VOPlayer/voList:property"}}{{/crossLink}}
	 * @property soundList
	 * @deprecated since version 0.4.0
	 * @public
	 */
	Object.defineProperty(p, 'soundList',
	{
		get: function()
		{
			if (DEBUG) console.warn("soundList is now deprecated, please use voList property, e.g. : app.voPlayer.voList");
			return this.voList;
		}
	});

}());