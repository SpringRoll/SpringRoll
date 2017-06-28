import Sound from './Sound';

/**
 * A playing instance of a sound (or promise to play as soon as it loads). These can only
 * be created through springroll.Sound.instance.play().
 * ### module: @springroll/sound
 * @class
 * @memberof springroll
 */
export default class SoundInstance {
    constructor() {
        /**
         * SoundJS SoundInstance, essentially a sound channel.
         * @member {createjs.SoundInstance}
         * @private
         */
        this._channel = null;

        /**
         * Internal callback function for when the sound ends.
         * @member {function}
         * @private
         */
        this._endFunc = null;

        /**
         * User's callback function for when the sound ends.
         * @member {function}
         * @private
         */
        this._endCallback = null;

        /**
         * User's callback function for when the sound starts.
         * This is only used if the sound wasn't loaded before play() was called.
         * @member {function}
         * @private
         */
        this._startFunc = null;

        /**
         * An array of relevant parameters passed to play(). This is only used if
         * the sound wasn't loaded before play() was called.
         * @member {Array}
         * @private
         */
        this._startParams = null;

        /**
         * The alias for the sound that this instance was created from.
         * @member {String}
         * @readOnly
         */
        this.alias = null;

        /**
         * The current time in milliseconds for the fade that this sound instance is performing.
         * @member {Number}
         * @private
         */
        this._fTime = 0;

        /**
         * The duration in milliseconds for the fade that this sound instance is performing.
         * @member {Number}
         * @private
         */
        this._fDur = 0;

        /**
         * The starting volume for the fade that this sound instance is performing.
         * @member {Number}
         * @private
         */
        this._fStart = 0;

        /**
         * The ending volume for the fade that this sound instance is performing.
         * @member {Number}
         * @private
         */
        this._fEnd = 0;

        /**
         * The current sound volume (0 to 1). This is multiplied by the sound context's volume.
         * Setting this won't take effect until updateVolume() is called.
         * @member {Number}
         * @protected
         * @readOnly
         */
        this.curVol = 0;

        /**
         * The sound pan value, from -1 (left) to 1 (right).
         * @member {Number}
         * @private
         * @readOnly
         */
        this._pan = 0;

        /**
         * The length of the sound in milliseconds. This is 0 if it hasn't finished loading.
         * @member {Number}
         */
        this.length = 0;

        /**
         * If the sound is currently paused. Setting this has no effect - use pause()
         * and resume().
         * @member {Boolean}
         * @readOnly
         */
        this.paused = false;

        /**
         * If the sound is paused due to a global pause, probably from the Application.
         * @member {Boolean}
         * @readOnly
         */
        this.globallyPaused = false;

        /**
         * An active SoundInstance should always be valid, but if you keep a reference after a
         * sound stops it will no longer be valid (until the SoundInstance is reused for a
         * new sound).
         * @member {Boolean}
         * @readOnly
         */
        this.isValid = true;
    }

    /**
     * The position of the sound playhead in milliseconds, or 0 if it hasn't started playing yet.
     * @member {Number}
     * @readOnly
     */
    get position() {
        return this._channel ? this._channel.getPosition() : 0;
    }

    /**
     * Stops this SoundInstance.
     */
    stop() {
        let s = Sound.instance;

        if (s) {
            let sound = s._sounds[this.alias];
            //in case this SoundInstance is not valid any more for some reason
            if (!sound) {
                return;
            }

            let index = sound.playing.indexOf(this);
            if (index > -1) {
                sound.playing.splice(index, 1);
            }

            index = sound.waitingToPlay.indexOf(this);
            if (index > -1) {
                sound.waitingToPlay.splice(index, 1);
            }

            s._stopInst(this);
        }
    }

    /**
     * Updates the volume of this SoundInstance.
     * @protected
     * @param {Number} contextVol The volume of the sound context that the sound belongs to. If
     *                          omitted, the volume is automatically collected.
     */
    updateVolume(contextVol) {
        if (!this._channel) {
            return;
        }

        if (contextVol === undefined) {
            let s = Sound.instance;
            let sound = s._sounds[this.alias];
            if (sound.context) {
                let context = s._contexts[sound.context];
                contextVol = context.muted ? 0 : context.volume;
            }
            else {
                contextVol = 1;
            }
        }
        this._channel.setVolume(contextVol * this.curVol);
    }

    /**
     * The current sound volume (0 to 1). This is multiplied by the sound context's volume to
     * get the actual sound volume.
     * @member {Number}
     */
    get volume() {
        return this.curVol;
    }
    set volume(value) {
        this.curVol = value;
        this.updateVolume();
    }

    /**
     * The sound pan value, from -1 (left) to 1 (right).
     * @member {Number}
     */
    get pan() {
        return this._pan;
    }
    set pan(value) {
        this._pan = value;
        if (this._channel) {
            this._channel.pan = value;
        }
    }

    /**
     * Pauses this SoundInstance.
     */
    pause() {
        //ensure that this is marked as a manual pause
        this.globallyPaused = false;

        if (this.paused) {
            return;
        }

        this.paused = true;

        if (!this._channel) {
            return;
        }

        this._channel.paused = true;

        Sound.instance._onInstancePaused();
    }

    /**
     * Unpauses this SoundInstance.
     */
    resume() {
        if (!this.paused) {
            return;
        }

        this.paused = false;

        if (!this._channel) {
            return;
        }

        Sound.instance._onInstanceResume();
        
        this._channel.paused = false;

        if (this._channel.gainNode) {
            //reset values on the channel to ensure that the volume update takes -
            //the default volume on the audio after playing/resuming will be 1
            this._channel._volume = -1;
            this._channel.gainNode.gain.value = 0;
        }
        this.updateVolume();
    }
}
