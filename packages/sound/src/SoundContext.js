/**
 * A private class that represents a sound context.
 * ### module: @springroll/sound
 * @class
 * @memberof springroll
 * @private
 * @param {string} id The name of the sound context.
 */
export default class SoundContext {
    constructor(id) {
        /**
         * The name of the sound context.
         * @member {string}
         */
        this.id = id;

        /**
         * The current volume to apply to all sounds in the context (0 to 1).
         * @member {number}
         */
        this.volume = 1;

        /**
         * If all sounds in the sound context are muted or not.
         * @member {bool}
         */
        this.muted = false;

        /**
         * The sound objects in this context, from Sound.instance._sounds;
         * @member {Array}
         */
        this.sounds = [];

        /**
         * A list of context ids of SoundContexts that belong to this one,
         * for example: "game-sfx" and "ui-sfx" being sub-contexts of "sfx".
         * @member {Array}
         */
        this.subContexts = [];
    }
}