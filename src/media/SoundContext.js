/**
 * @module Sound
 * @namespace springroll
 * @requires Core
 */
(function()
{
	/**
	 * A private class that represents a sound context.
	 * @class SoundContext
	 * @constructor
	 * @private
	 * @param {String} id The name of the sound context.
	 */
	var SoundContext = function(id)
	{
		/**
		 * The name of the sound context.
		 * @property {String} id
		 * @public
		 */
		this.id = id;

		/**
		 * The current volume to apply to all sounds in the context (0 to 1).
		 * @property {Number} volume
		 * @public
		 */
		this.volume = 1;

		/**
		 * If all sounds in the sound context are muted or not.
		 * @property {bool} muted
		 * @public
		 */
		this.muted = false;

		/**
		 * The sound objects in this context, from Sound.instance._sounds;
		 * @property {Array} sounds
		 * @public
		 */
		this.sounds = [];

		/**
		 * A list of context ids of SoundContexts that belong to this one,
		 * for example: "game-sfx" and "ui-sfx" being sub-contexts of "sfx".
		 * @property {Array} subContexts
		 */
		this.subContexts = [];
	};

	// Assign to name space
	namespace('springroll').SoundContext = SoundContext;

}());