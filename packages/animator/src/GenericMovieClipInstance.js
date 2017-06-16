/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
    var Application = include("springroll.Application");
    var AnimatorInstance = include('springroll.AnimatorInstance');

    /**
     * Animator Instance is a wrapper for different types of media
     * files. They need to extend some basic methods.
     * @class AnimatorTimeline
     */
    var GenericMovieClipInstance = function()
    {
        AnimatorInstance.call(this);

        /**
         * The start time of the current animation on the movieclip's timeline.
         * @property {Number} startTime
         */
        this.startTime = 0;

        /**
         * Length of current animation in frames.
         * @property {int} length
         */
        this.length = 0;

        /**
         * The frame number of the first frame of the current animation. If this is -1, then the
         * animation is currently a pause instead of an animation.
         * @property {int} firstFrame
         */
        this.firstFrame = -1;

        /**
         * The frame number of the last frame of the current animation.
         * @property {int} lastFrame
         */
        this.lastFrame = -1;
    };

    //Reference to the prototype
    var p = AnimatorInstance.extend(GenericMovieClipInstance);

    /**
     * The initialization method
     * @method init
     * @param  {*} clip The movieclip
     */
    p.init = function(clip)
    {
        //make sure the movieclip is framerate independent
        if (!clip.framerate)
        {
            clip.framerate = Application.instance.options.fps || 15;
        }
        clip.tickEnabled = false;

        this.clip = clip;
        this.isLooping = false;
        this.currentName = null;
        this.position = this.duration = 0;
        //ensure that if we call endAnim() before any animation
        //that it stays on the current frame
        this.lastFrame = clip.currentFrame;
    };

    p.beginAnim = function(animObj, isRepeat)
    {
        //calculate frames, duration, etc
        //then gotoAndPlay on the first frame
        var anim = this.currentName = animObj.anim;

        var l, first = -1,
            last = -1,
            loop = false;
        //the wildcard event plays the entire timeline
        if (anim == "*" && !this.clip.timeline.resolve(anim))
        {
            first = 0;
            last = this.clip.timeline.duration - 1;
            loop = !!animObj.loop;
        }
        else
        {
            var labels = this.clip.getLabels();
            //go through the list of labels (they are sorted by frame number)
            var stopLabel = anim + "_stop";
            var loopLabel = anim + "_loop";

            for (var i = 0, len = labels.length; i < len; ++i)
            {
                l = labels[i];
                if (l.label == anim)
                {
                    first = l.position;
                }
                else if (l.label == stopLabel)
                {
                    last = l.position;
                    break;
                }
                else if (l.label == loopLabel)
                {
                    last = l.position;
                    loop = true;
                    break;
                }
            }
        }

        this.firstFrame = first;
        this.lastFrame = last;
        this.length = last - first;
        this.isLooping = loop;
        var fps = this.clip.framerate;
        this.startTime = this.firstFrame / fps;
        this.duration = this.length / fps;
        if (isRepeat)
        {
            this.position = 0;
        }
        else
        {
            var animStart = animObj.start || 0;
            this.position = animStart < 0 ? Math.random() * this.duration : animStart;
        }

        this.clip.play();
        this.clip.elapsedTime = this.startTime + this.position;
        this.clip.advance();
    };

    /**
     * Ends animation playback.
     * @method endAnim
     */
    p.endAnim = function()
    {
        this.clip.gotoAndStop(this.lastFrame);
    };

    /**
     * Updates position to a new value, and does anything that the clip needs, like updating
     * timelines.
     * @method setPosition
     * @param  {Number} newPos The new position in the animation.
     */
    p.setPosition = function(newPos)
    {
        this.position = newPos;
        this.clip.elapsedTime = this.startTime + newPos;
        //because the movieclip only checks the elapsed time here (tickEnabled is false),
        //calling advance() with no parameters is fine - it won't advance the time
        this.clip.advance();
    };

    /**
     * Check to see if a clip is compatible with this
     * @method test
     * @static
     * @return {Boolean} if the clip is supported by this instance
     */
    GenericMovieClipInstance.test = function(clip)
    {
        return clip.framerate !== undefined &&
            clip.getLabels !== undefined &&
            clip.elapsedTime !== undefined &&
            clip.gotoAndStop !== undefined &&
            clip.gotoAndPlay !== undefined &&
            clip.stop !== undefined &&
            clip.play !== undefined;
    };

    /**
     * Checks if animation exists
     * @method hasAnimation
     * @static
     * @param {*} clip The clip to check for an animation.
     * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
     * @return {Boolean} does this animation exist?
     */
    GenericMovieClipInstance.hasAnimation = function(clip, event)
    {
        //the wildcard event plays the entire timeline
        if (event == "*" && !clip.timeline.resolve(event))
        {
            return true;
        }

        var labels = clip.getLabels();
        var startFrame = -1;
        var stopFrame = -1;
        var stopLabel = event + "_stop";
        var loopLabel = event + "_loop";
        var l;
        for (var i = 0, len = labels.length; i < len; ++i)
        {
            l = labels[i];
            if (l.label == event)
            {
                startFrame = l.position;
            }
            else if (l.label == stopLabel || l.label == loopLabel)
            {
                stopFrame = l.position;
                break;
            }
        }
        return startFrame >= 0 && stopFrame > 0;
    };

    /**
     * Calculates the duration of an animation or list of animations.
     * @method getDuration
     * @static
     * @param  {*} clip The clip to check.
     * @param  {String} event The animation or animation list.
     * @return {Number} Animation duration in milliseconds.
     */
    GenericMovieClipInstance.getDuration = function(clip, event)
    {
        //make sure the movieclip has a framerate
        if (!clip.framerate)
        {
            clip.framerate = Application.instance.options.fps || 15;
        }

        //the wildcard event plays the entire timeline
        if (event == "*" && !clip.timeline.resolve(event))
        {
            return clip.timeline.duration / clip.framerate * 1000;
        }

        var labels = clip.getLabels();
        var startFrame = -1;
        var stopFrame = -1;
        var stopLabel = event + "_stop";
        var loopLabel = event + "_loop";
        var l;
        for (var i = 0, labelsLength = labels.length; i < labelsLength; ++i)
        {
            l = labels[i];
            if (l.label == event)
            {
                startFrame = l.position;
            }
            else if (l.label == stopLabel || l.label == loopLabel)
            {
                stopFrame = l.position;
                break;
            }
        }
        if (startFrame >= 0 && stopFrame > 0)
        {
            return (stopFrame - startFrame) / clip.framerate * 1000;
        }
        else
        {
            return 0;
        }
    };

    /**
     * Reset this animator instance
     * so it can be re-used.
     * @method destroy
     */
    p.destroy = function()
    {
        this.clip = null;
    };

    //Assign to namespace
    namespace('springroll').GenericMovieClipInstance = GenericMovieClipInstance;

}());