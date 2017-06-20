import {Application} from '@springroll/core';
import {Task} from '@springroll/loaders';

/**
 * Internal task for preloading a list of sounds. When the result of the load is
 * destroyed (destroy()), then the list of sounds are unloaded.
 * @class SoundTask
 * @extends springroll.Task
 * @private
 * @constructor
 * @param {Object} asset The data properties
 * @param {Array} asset.sounds The list of Sound aliases
 * @param {Boolean} [asset.cache=false] If we should cache the result
 * @param {String} [asset.id] Id of asset
 * @param {Function} [asset.complete] The event to call when done
 */
var SoundTask = function(asset)
{
    Task.call(this, asset, asset.sounds[0]);

    /**
     * The path to the list of sound aliases
     * @property {Array} sounds
     */
    this.sounds = asset.sounds;
};

// Reference to prototype
SoundTask.prototype = Object.create(Task.prototype);

/**
 * Test if we should run this task
 * @method test
 * @static
 * @param {Object} asset The asset to check
 * @return {Boolean} If the asset is compatible with this asset
 */
SoundTask.test = function(asset)
{
    return !!asset.sounds && Array.isArray(asset.sounds);
};

/**
 * Start the task
 * @method  start
 * @param  {Function} callback Callback when finished
 */
SoundTask.prototype.start = function(callback)
{
    var sound = Application.instance.sound;
    var aliases = this.sounds;
    sound.preload(aliases, function()
    {
        // Add a destroy function to do the clean-up of aliases
        // in case we are caching
        aliases.destroy = function()
        {
            sound.unload(this);
            this.length = 0;
            delete this.destroy;
        };
        callback(aliases);
    });
};

/**
 * Destroy and don't use after this
 * @method destroy
 */
SoundTask.prototype.destroy = function()
{
    this.sounds = null;
    Task.prototype.destroy.call(this);
};

export default SoundTask;
