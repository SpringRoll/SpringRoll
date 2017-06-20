/**
 * Animator Timeline is a class designed to provide
 * base animation functionality
 * @class AnimatorTimeline
 */
var AnimatorTimeline = function()
{
    /**
     * The function to call when we're done
     * @property {Function} onComplete
     */
    this.onComplete = null;

    /**
     * The function to call when stopped early.
     * @property {Function} onCancelled
     */
    this.onCancelled = null;

    /**
     * An array of animations and pauses.
     * @property {Array} eventList
     */
    this.eventList = null;

    /**
     * The index of the active animation in eventList.
     * @property {int} listIndex
     */
    this.listIndex = -1;

    /**
     * The instance of the timeline to animate
     * @property {springroll.AnimatorInstance} instance
     */
    this.instance = null;

    /**
     * If the current animation loops - determined by looking to see if it ends
     * in "_stop" or "_loop"
     * @property {Boolean} isLooping
     */
    this.isLooping = false;

    /**
     * If this timeline plays captions for the current sound.
     * @property {Boolean} useCaptions
     * @readOnly
     */
    this.useCaptions = false;

    /**
     * If the timeline is paused.
     * @property {Boolean} _paused
     * @private
     */
    this._paused = false;

    /**
     * The current animation duration in seconds.
     * @property {Number} duration
     */
    this.duration = 0;

    /**
     * The animation speed for the current animation. Default is 1.
     * @property {Number} speed
     */
    this.speed = 1;

    /**
     * Sound alias to sync to during the current animation.
     * @property {String} soundAlias
     */
    this.soundAlias = null;

    /**
     * A sound instance object from springroll.Sound, used for tracking sound
     * position for the current animation.
     * @property {Object} soundInst
     */
    this.soundInst = null;

    /**
     * If the timeline will, but has yet to play a sound for the current animation.
     * @property {Boolean} playSound
     */
    this.playSound = false;

    /**
     * The time (seconds) into the current animation that the sound starts.
     * @property {Number} soundStart
     */
    this.soundStart = 0;

    /**
     * The time (seconds) into the animation that the sound ends
     * @property {Number} soundEnd
     */
    this.soundEnd = 0;

    /**
     * If the timeline is complete. Looping timelines will never complete.
     * @property {Boolean} complete
     * @readOnly
     */
    this.complete = false;

    this._position = 0;

    this.isTimer = false;
};

/**
 * Reset the timeline so we can reuse
 * @method reset
 * @private
 * @return {springroll.AnimatorTimeline} Instance of timeline
 */
AnimatorTimeline.prototype.reset = function()
{
    if (this.instance)
    {
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
};

Object.defineProperty(AnimatorTimeline.prototype, "position",
{
    get: function()
    {
        return this._position;
    },
    set: function(value)
    {
        this._position = value;
        if (!this.isTimer)
        {
            this.instance.setPosition(value);
        }
    }
});

/**
 * Advances to the next item in the list of things to play.
 * @method _nextItem
 * @private
 */
AnimatorTimeline.prototype._nextItem = function()
{
    var repeat = false;
    if (this.soundInst) this.soundInst._endCallback = null;
    //if on a looping animation, set up the animation to be replayed
    //(this will only happen on looping animations with audio)
    if (this.isLooping)
    {
        //if sound is playing, we need to stop it immediately
        //otherwise it can interfere with replaying the audio
        var sound = this.soundInst;
        if (sound)
        {
            sound.stop();
            this.soundInst = null;
        }
        //say that we are repeating, so that we start at the beginning of the loop
        //in case it started part way in
        repeat = true;
    }
    else
    {
        if (!this.isTimer)
            this.instance.endAnim();
        //reset variables
        this.soundEnd = this.soundStart = 0;
        this.isLooping = this.playSound = this.useCaptions = false;
        this.soundInst = this.soundAlias = null;

        //see if the animation list is complete
        if (++this.listIndex >= this.eventList.length)
        {
            this.complete = true;
            return;
        }
    }
    //take action based on the type of item in the list
    var listItem = this.eventList[this.listIndex];

    switch (typeof listItem)
    {
        case "object":
            {
                this.isTimer = false;
                var instance = this.instance;
                instance.beginAnim(listItem, repeat);
                this.duration = instance.duration;
                this.speed = listItem.speed;
                this.isLooping = instance.isLooping || listItem.loop;
                this._position = instance.position;

                if (listItem.alias)
                {
                    this.soundAlias = listItem.alias;
                    this.soundStart = listItem.audioStart;
                    this.playSound = true;
                    this.useCaptions = listItem.useCaptions;
                }
                break;
            }
        case "number":
            {
                this.isTimer = true;
                this.duration = listItem;
                this._position = 0;
                break;
            }
        case "function":
            {
                listItem();
                this._nextItem();
                break;
            }
    }
};

/**
 * The position of the current animation, or the current pause timer, in milliseconds.
 * @property {Number} time
 */
Object.defineProperty(AnimatorTimeline.prototype, "time",
{
    get: function()
    {
        return this.position * 1000;
    },
    set: function(value)
    {
        this.position = value * 0.001;
    }
});

/**
 * Sets and gets the animation's paused status.
 * @property {Boolean} paused
 */
Object.defineProperty(AnimatorTimeline.prototype, "paused",
{
    get: function()
    {
        return this._paused;
    },
    set: function(value)
    {
        if (value == this._paused)
            return;

        this._paused = !!value;
        var sound = this.soundInst;
        if (sound)
        {
            if (this.paused)
            {
                sound.pause();
            }
            else
            {
                sound.resume();
            }
        }
    }
});

export default AnimatorTimeline;