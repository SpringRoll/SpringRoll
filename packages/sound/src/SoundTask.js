import {Application} from '@springroll/core';
import {Task} from '@springroll/loaders';

/**
 * Internal task for preloading a list of sounds. When the result of the load is
 * destroyed (destroy()), then the list of sounds are unloaded.
 * ### module: @springroll/sound
 * @class
 * @memberof springroll
 * @extends springroll.Task
 * @private
 */
export default class SoundTask extends Task {
    /** 
     * @param {Object} asset The data properties
     * @param {Array} asset.sounds The list of Sound aliases
     * @param {Boolean} [asset.cache=false] If we should cache the result
     * @param {String} [asset.id] Id of asset
     * @param {Function} [asset.complete] The event to call when done
     */
    constructor(asset) {
        super(asset, asset.sounds[0]);

        /**
         * The path to the list of sound aliases
         * @member {Array}
         */
        this.sounds = asset.sounds;
    }

    /**
     * Test if we should run this task
     * @static
     * @param {Object} asset The asset to check
     * @return {Boolean} If the asset is compatible with this asset
     */
    static test(asset) {
        return !!asset.sounds && Array.isArray(asset.sounds);
    }

    /**
     * Start the task
     * @param  {Function} callback Callback when finished
     */
    start(callback) {
        let sound = Application.instance.sound;
        let aliases = this.sounds;
        sound.preload(aliases, function() {
            // Add a destroy function to do the clean-up of aliases
            // in case we are caching
            aliases.destroy = function() {
                sound.unload(this);
                this.length = 0;
                delete this.destroy;
            };
            callback(aliases);
        });
    }

    /**
     * Destroy and don't use after this
     */
    destroy() {
        this.sounds = null;
        super.destroy();
    }
}
