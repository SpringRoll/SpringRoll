/**
 * Animator Timeline is a class designed to provide
 * base animation functionality.
 * ### module: @springroll/animation
 * @class
 * @memberof springroll
 */
export default class AnimatorTimeline {
    constructor() {
        /**
         * The function to call when we're done
         * @member {function}
         */
        this.onComplete = null;

        /**
         * The function to call when stopped early.
         * @member {function}
         */
        this.onCancelled = null;

        /**
         * An array of animations and pauses.
         * @member {Array}
         */
        this.eventList = null;

        /**
         * The index of the active animation in eventList.
         * @member {number}
         */
        this.listIndex = -1;

        /**
         * The instance of the timeline to animate
         * @member {springroll.AnimatorInstance}
         */
        this.instance = null;

        /**
         * If the current animation loops - determined by looking to see if it ends
         * in "_stop" or "_loop"
         * @member {boolean}
         */
        this.isLooping = false;

        /**
         * If this timeline plays captions for the current sound.
         * @member {boolean}
         * @readOnly
         */
        this.useCaptions = false;

        /**
         * If the timeline is paused.
         * @member {boolean}
         * @private
         */
        this._paused = false;

        /**
         * The current animation duration in seconds.
         * @member {number}
         */
        this.duration = 0;

        /**
         * The animation speed for the current animation. Default is 1.
         * @member {number}
         */
        this.speed = 1;

        /**
         * Sound alias to sync to during the current animation.
         * @member {string}
         */
        this.soundAlias = null;

        /**
         * A sound instance object from springroll.Sound, used for tracking sound
         * position for the current animation.
         * @member {object}
         */
        this.soundInst = null;

        /**
         * If the timeline will, but has yet to play a sound for the current animation.
         * @member {boolean}
         */
        this.playSound = false;

        /**
         * The time (seconds) into the current animation that the sound starts.
         * @member {number}
         */
        this.soundStart = 0;

        /**
         * The time (seconds) into the animation that the sound ends
         * @member {number}
         */
        this.soundEnd = 0;

        /**
         * If the timeline is complete. Looping timelines will never complete.
         * @member {boolean}
         * @readOnly
         */
        this.complete = false;

        this._position = 0;

        this.isTimer = false;
    }

    /**
     * The position of the current animation, or the current pause timer, in milliseconds.
     * @member {number} time
     * @memberof springroll.AnimatorTimeline#
     */
    get time() {
        return this.position * 1000;
    }
    set time(value) {
        this.position = value * 0.001;
    }

    /**
     * Sets and gets the animation's paused status.
     * @member {boolean} paused
     * @memberof springroll.AnimatorTimeline#
     */
    get paused() {
        return this._paused;
    }
    set paused(value) {
        if (value === this._paused) {
            return;
        }

        this._paused = !!value;
        let sound = this.soundInst;
        if (sound) {
            if (this.paused) {
                sound.pause();
            }
            else {
                sound.resume();
            }
        }
    }

    /**
     * Reset the timeline so we can reuse
     * @private
     * @return {springroll.AnimatorTimeline} Instance of timeline
     */
    reset() {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
        this.complete = false;
        this.soundEnd = 0;
        this.soundStart = 0;
        this.playSound = false;
        this.soundInst = null;
        this.soundAlias = null;
        this.speed = 1;
        this._position = 0;
        this.duration = 0;
        this._paused = false;
        this.useCaptions = false;
        this.isLooping = false;
        this.isTimer = false;
        this.listIndex = -1;
        this.eventList = null;
        this.onCancelled = null;
        this.onComplete = null;
        return this;
    }

    /**
     * The current playback time in seconds.
     * @member {number} position
     * @memberof springroll.AnimatorTimeline#
     */
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
        if (!this.isTimer) {
            this.instance.setPosition(value);
        }
    }

    /**
     * Advances to the next item in the list of things to play.
     * @private
     */
    _nextItem() {
        let repeat = false;
        if (this.soundInst) {
            this.soundInst._endCallback = null;
        }
        //if on a looping animation, set up the animation to be replayed
        //(this will only happen on looping animations with audio)
        if (this.isLooping) {
            //if sound is playing, we need to stop it immediately
            //otherwise it can interfere with replaying the audio
            let sound = this.soundInst;
            if (sound) {
                sound.stop();
                this.soundInst = null;
            }
            //say that we are repeating, so that we start at the beginning of the loop
            //in case it started part way in
            repeat = true;
        }
        else {
            if (!this.isTimer) {
                this.instance.endAnim();
            }
            //reset variables
            this.soundEnd = this.soundStart = 0;
            this.isLooping = this.playSound = this.useCaptions = false;
            this.soundInst = this.soundAlias = null;

            //see if the animation list is complete
            if (++this.listIndex >= this.eventList.length) {
                this.complete = true;
                return;
            }
        }
        //take action based on the type of item in the list
        let listItem = this.eventList[this.listIndex];

        switch (typeof listItem) {
            case 'object':
                this.isTimer = false;
                this.instance.beginAnim(listItem, repeat);
                this.duration = this.instance.duration;
                this.speed = listItem.speed;
                this.isLooping = this.instance.isLooping || listItem.loop;
                this._position = this.instance.position;

                if (listItem.alias) {
                    this.soundAlias = listItem.alias;
                    this.soundStart = listItem.audioStart;
                    this.playSound = true;
                    this.useCaptions = listItem.useCaptions;
                }
                break;
            case 'number':
                this.isTimer = true;
                this.duration = listItem;
                this._position = 0;
                break;
            case 'function':
                listItem();
                this._nextItem();
                break;
        }
    }
}
