import AnimatorTimeline from './AnimatorTimeline';
import {include} from '@springroll/core';

// @if DEBUG
import Debug from '@springroll/debug';
// @endif

/**
 * Animator is a static class designed to provided
 * base animation functionality, using frame labels of MovieClips
 * @class Animator
 * @constructor
 * @param {springroll.Application} app Reference to the application
 */
export default class Animator {
    constructor(app) {
        /**
         * If we fire debug statements
         * @property {Boolean} debug
         */
        this.debug = false;

        /**
         * The global captions object to use with animator
         * @property {springroll.Captions} captions
         */
        this.captions = null;

        /**
         * Reference to the application
         * @property {springroll.Application} _app
         * @private
         */
        this._app = app;

        /**
         * The collection of AnimatorPlugin definitions
         * @property {Array} _definitions
         * @private
         */
        this._definitions = [];

        /**
         * The collection of timelines
         * @property {Array} _timelines
         * @private
         */
        this._timelines = [];

        /**
         * The collection of active timelines, indexed by MovieClip/instance. This will be
         * null in browsers where Map is not supported.
         * @property {Map} _timelineMap
         * @private
         */
        try {
            //having a parameter causes an error in non-fully compliant implementations,
            //like iOS 8.X - there is a serious issue that sometimes happens in iOS 8.0-8.2
            //This prevents 8.3 from using the faster map, but beyond attempting to detect exactly
            //which version of iOS is being used, there isn't much of a choice.
            this._timelineMap = new Map([]);
            //ensure that all the Map features we need are supported
            if (typeof this._timelineMap.delete !== 'function' ||
                typeof this._timelineMap.has !== 'function' ||
                typeof this._timelineMap.set !== 'function' ||
                typeof this._timelineMap.get !== 'function') {
                this._timelineMap = null;
            }
        }
        catch (e) {
            // no catch
        }

        /**
         * The collection of used timeline objects
         * @property {Array} _timelinePool
         * @private
         */
        this._timelinePool = [];

        /**
         * If there are timelines available
         * @property {Boolean} _hasTimelines
         * @private
         */
        this._hasTimelines = false;

        /**
         * If the Animator is paused
         * @property {Boolean} _paused
         * @private
         */
        this._paused = false;

        //update bind
        this._update = this._update.bind(this);
    }

    /**
     * Register an animator instance definition type
     * @method register
     * @param {String} qualifiedClassName The class name
     * @param {int} priority The priority order for definition
     */
    register(qualifiedClassName, priority) {
        let plugin = include(qualifiedClassName, false);
        if (!plugin) {
            return;
        }
        plugin.priority = priority;
        this._definitions.push(plugin);
        this._definitions.sort(function(a, b) {
            return b.priority - a.priority;
        });
    }

    /**
     * Play an animation for a frame label event, with more verbose play options.
     * @method play
     * @param {*} clip The display object with the same API to animate.
     * @param {Object} options One of or an array of the following
     * @param {String} options.anim the frame label of the animation to play,
     * e.g. "onClose" to "onClose_stop".
     * @param {int} [options.start=0] Milliseconds into the animation to start.
     * A value of -1 starts from a random time in the animation.
     * @param {int} [options.speed=1] a multiplier for the animation speed.
     * @param {Object|String} [options.audio] Audio to sync the animation to using
     * springroll.Sound. audio can be a String if you want the audio to start 0 milliseconds
     * into the animation.
     * @param {String} [options.audio.alias] The sound alias
     * @param {int} [options.audio.start] The sound delay
     * @param {Function} [onComplete] The callback function for when the animation is done.
     * @param {Function|Boolean} [onCancelled] A callback function for when an animation
     * is stopped with Animator.stop() or to play another  animation. A value of 'true'
     * uses onComplete for onCancelled.
     * @return {springroll.AnimatorTimeline} The Timeline object that represents this play() call.
     */

    /**
     * Play an animation for a frame label event or events
     * @method play
     * @param {*} clip The display object with the same API to animate.
     * @param {String|Array} eventList The name of an event or collection of events
     * @param {Function} [onComplete] The callback function for when the animation is done.
     * @param {Function|Boolean} [onCancelled] A callback function for when an animation is
     *        stopped with Animator.stop() or to play another
     *        animation. A value of 'true' uses onComplete for
     *        onCancelled.
     * @return {springroll.AnimatorTimeline} The Timeline object that represents this play() call.
     */
    play(clip, eventList, onComplete, onCancelled) {
        if (onCancelled === true) {
            onCancelled = onComplete;
        }
        if (!Array.isArray(eventList)) {
            eventList = [eventList];
        }

        this.stop(clip);

        let timeline = this._makeTimeline(
            clip,
            eventList,
            onComplete,
            onCancelled
        );

        //if the animation is present and complete
        if (timeline.eventList && timeline.eventList.length >= 1) {
            timeline._nextItem(); //advance the timeline to the first item

            //Before we add the timeline, we should check to see
            //if there are no timelines, then start the enter frame
            //updating
            if (!this._hasTimelines) {
                this._startUpdate();
            }

            if (this._timelineMap) {
                this._timelineMap.set(clip, timeline);
            }
            this._timelines.push(timeline);
            this._hasTimelines = true;

            return timeline;
        }

        // @if DEBUG
        let label = eventList[0].anim ||
            eventList[0].audio ||
            eventList[0] ||
            '<label unknown>';
        let readableInstance = clip.name ||
            clip.key ||
            clip.label ||
            clip.id ||
            clip.toString() ||
            clip;
        Debug.groupCollapsed('No valid animation label "' + label + '" in MovieClip ' + readableInstance);
        Debug.red('eventList:', eventList);
        Debug.red('instance:', clip);
        Debug.trace('Animator.play');
        Debug.groupEnd();
        // @endif

        //reset the timeline and add to the pool of timeline objects
        this._timelinePool.push(timeline.reset());

        if (onComplete) {
            onComplete();
        }
        return null;
    }

    /**
     * Creates the AnimatorTimeline for a given animation
     * @method _makeTimeline
     * @param {*} clip The instance to animate
     * @param {Array} eventList List of animation events
     * @param {Function} onComplete The function to callback when we're done
     * @param {Function} onCancelled The function to callback when cancelled
     * @return {springroll.AnimatorTimeline} The Timeline object
     * @private
     */
    _makeTimeline(clip, eventList, onComplete, onCancelled) {
        let timeline = this._timelinePool.length ?
            this._timelinePool.pop() :
            new AnimatorTimeline();

        let Definition = this.getDefinitionByClip(clip);
        if (!Definition) {
            return timeline;
        }
        let instance = Definition.create(clip);

        if (!instance) {
            // @if DEBUG
            Debug.warn('Attempting to use Animator to play something that is not compatible: ', clip);
            // @endif
            return timeline;
        }

        timeline.instance = instance;
        timeline.eventList = []; //create a duplicate event list with specific info
        timeline.onComplete = onComplete;
        timeline.onCancelled = onCancelled;
        timeline.speed = speed;
        let audio, start, speed, alias;

        for (let j = 0, jLen = eventList.length; j < jLen; ++j) {
            let listItem = eventList[j];

            if (typeof listItem === 'string') {
                if (!Definition.hasAnimation(clip, listItem)) {
                    continue;
                }

                timeline.eventList.push(
                    {
                        anim: listItem,
                        audio: null,
                        start: 0,
                        speed: 1
                    });
            }
            else if (typeof listItem === 'object') {
                if (!Definition.hasAnimation(clip, listItem.anim)) {
                    continue;
                }

                let animData = {
                    anim: listItem.anim,
                    //convert into seconds, as that is what the time uses internally
                    start: typeof listItem.start === 'number' ? listItem.start * 0.001 : 0,
                    speed: listItem.speed > 0 ? listItem.speed : 1,
                    loop: listItem.loop
                };
                audio = listItem.audio;
                //figure out audio stuff if it is okay to use
                if (audio && this._app.sound) {
                    if (typeof audio === 'string') {
                        start = 0;
                        alias = audio;
                    }
                    else {
                        start = audio.start > 0 ? audio.start * 0.001 : 0; //seconds
                        alias = audio.alias;
                    }
                    if (this._app.sound.isSupported && !this._app.sound.systemMuted &&
                        this._app.sound.exists(alias)) {
                        this._app.sound.preload(alias);
                        animData.alias = alias;
                        animData.audioStart = start;

                        animData.useCaptions = this.captions && this.captions.hasCaption(alias);
                    }
                }
                timeline.eventList.push(animData);
            }
            else if (typeof listItem === 'number') {
                //convert to seconds
                timeline.eventList.push(listItem * 0.001);
            }
            else if (typeof listItem === 'function') {
                //add functions directly
                timeline.eventList.push(listItem);
            }
        }
        return timeline;
    }

    /**
     * Determines if a given instance can be animated by Animator. Note - `id` is a property
     * with a unique value for each `createjs.DisplayObject`. If a custom object is made that does
     * not inherit from DisplayObject, it needs to not have an id that is identical to anything
     * from EaselJS.
     * @method canAnimate
     * @param {*} clip The object to check for animation properties.
     * @return {Boolean} If the instance can be animated or not.
     */
    canAnimate(clip) {
        if (!clip) {
            return false;
        }
        return !!this.getDefinitionByClip(clip);
    }

    /**
     * Get a definition by clip
     * @private
     * @method  getDefinitionByClip
     * @param  {*} clip The animation clip
     * @return {function|null} The new definition
     */
    getDefinitionByClip(clip) {
        for (let Definition, i = 0, len = this._definitions.length; i < len; i++) {
            Definition = this._definitions[i];
            if (Definition.test(clip)) {
                return Definition;
            }
        }
        return null;
    }

    /**
     * Checks if animation exists
     * @method hasAnimation
     * @param {*} clip The instance to check
     * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
     * @public
     * @return {Boolean} does this animation exist?
     */
    hasAnimation(clip, event) {
        let Definition = this.getDefinitionByClip(clip);
        if (!Definition) {
            return false;
        }
        return Definition.hasAnimation(clip, event);
    }

    /**
     * Get duration of animation event (or sequence of events) in seconds
     * @method getDuration
     * @param {*} instance The timeline to check
     * @param {String|Array} event The frame label event or array, in the format that play() uses.
     * @public
     * @return {Number} Duration of animation event in milliseconds
     */
    getDuration(clip, event) {
        let Definition = this.getDefinitionByClip(clip);
        if (!Definition) {
            return 0;
        }
        if (!Array.isArray(event)) {
            return Definition.getDuration(clip, event.anim || event);
        }

        let duration = 0;
        for (let i = 0; i < event.length; ++i) {
            let item = event[i];
            if (typeof item === 'number') {
                duration += item;
            }
            else if (typeof item === 'string') {
                duration += Definition.getDuration(clip, item);
            }
            else if (typeof item === 'object' && item.anim) {
                duration += Definition.getDuration(clip, item.anim);
            }
        }
        return duration;
    }

    /**
     * Stop the animation.
     * @method stop
     * @param {*} clip The instance to stop the action on
     * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete
     * or on cancelled callback of this animation.
     */
    stop(clip, removeCallbacks) {
        let timeline = this.getTimelineByClip(clip);
        if (!timeline) {
            return;
        }
        if (removeCallbacks) {
            timeline.onComplete = timeline.onCancelled = null;
        }
        this._remove(timeline, true);
    }

    /**
     * Stop all current Animator animations. This is good for cleaning up all
     * animation, as it doesn't do a callback on any of them.
     * @method stopAll
     * @param {createjs.Container} [container] Specify a container to stop timelines
     * contained within. This only checks one layer deep.
     * @param {Boolean} [removeCallbacks=false] Completely disregard the on complete
     * or on cancelled callback of the current animations.
     */
    stopAll(container, removeCallbacks) {
        if (!this._hasTimelines) {
            return;
        }

        let timeline;
        for (let i = this._timelines.length - 1; i >= 0; --i) {
            timeline = this._timelines[i];

            if (!container || container.contains(timeline.instance.clip)) {
                if (removeCallbacks) {
                    timeline.onComplete = timeline.onCancelled = null;
                }
                this._remove(timeline, true);
            }
        }
    }

    /**
     * Remove a timeline from the stack
     * @method _remove
     * @param {springroll.AnimatorTimeline} timeline
     * @param {Boolean} doCancelled If we do the on complete callback
     * @private
     */
    _remove(timeline, doCancelled) {
        let index = this._timelines.indexOf(timeline);

        //We can't remove an animation twice
        if (index < 0) {
            return;
        }

        let onComplete = timeline.onComplete,
            onCancelled = timeline.onCancelled;

        //in most cases, if doOnComplete is true, it's a natural stop and
        //the audio can be allowed to continue
        if (doCancelled && timeline.soundInst) {
            timeline.soundInst.stop(); //stop the sound from playing
        }

        if (this._timelineMap) {
            this._timelineMap.delete(timeline.instance.clip);
        }

        //Remove from the stack
        if (index === this._timelines.length - 1) {
            this._timelines.pop();
        }
        else {
            this._timelines.splice(index, 1);
        }
        this._hasTimelines = this._timelines.length > 0;

        //stop the captions, if relevant
        if (timeline.useCaptions) {
            this.captions.stop();
        }

        //Reset the timeline and add to the pool
        //of timeline objects
        this._timelinePool.push(timeline.reset());

        //Check if we should stop the update
        if (!this._hasTimelines) {
            this._stopUpdate();
        }

        //call the appropriate callback
        if (doCancelled) {
            if (onCancelled) {
                onCancelled();
            }
        }
        else if (onComplete) {
            onComplete();
        }
    }

    /**
     * Pause all tweens which have been excuted by `play()`
     * @method pause
     */
    pause() {
        if (this._paused) {
            return;
        }
        this._paused = true;

        for (let i = this._timelines.length - 1; i >= 0; --i) {
            this._timelines[i].paused = true;
        }
        this._stopUpdate();
    }

    /**
     * Resumes all tweens executed by the `play()`
     * @method resume
     */
    resume() {
        if (!this._paused) {
            return;
        }
        this._paused = false;

        //Resume playing of all the instances
        for (let i = this._timelines.length - 1; i >= 0; --i) {
            this._timelines[i].paused = false;
        }
        if (this._hasTimelines) {
            this._startUpdate();
        }
    }

    /**
     * Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
     * @method pauseInGroup
     * @param {Boolean} paused If this should be paused or unpaused
     * @param {createjs.Container} container The container to stop timelines contained within
     */
    pauseInGroup(paused, container) {
        if (!this._hasTimelines || !container) {
            return;
        }
        for (let i = this._timelines.length - 1; i >= 0; --i) {
            if (container.contains(this._timelines[i].instance.clip)) {
                this._timelines[i].paused = paused;
            }
        }
    }

    /**
     * Get the timeline object for an instance
     * @method getTimeline
     * @param {*} clip The animation clip
     * @return {springroll.AnimatorTimeline} The timeline
     */
    getTimeline(clip) {
        if (!this._hasTimelines) {
            return null;
        }
        return this.getTimelineByClip(clip);
    }

    /**
     * Loop a clip by timeline
     * @method getTimelineByClip
     * @private
     * @param {*} clip The clip to check
     * @return {springroll.AnimatorTimeline} The timeline for clip
     */
    getTimelineByClip(clip) {
        if (this._timelineMap) {
            return this._timelineMap.has(clip) ? this._timelineMap.get(clip) : null;
        }
        else {
            for (let i = this._timelines.length - 1; i >= 0; --i) {
                if (this._timelines[i].instance.clip === clip) {
                    return this._timelines[i];
                }
            }
        }
        return null;
    }

    /**
     * Whether the Animator class is currently paused.
     * @property {Boolean} paused
     * @readOnly
     */
    get paused() {
        return this._paused;
    }


    /**
     * Start the updating
     * @method _startUpdate
     * @private
     */
    _startUpdate() {
        this._app.on('update', this._update);
    }

    /**
     * Stop the updating
     * @method _stopUpdate
     * @private
     */
    _stopUpdate() {
        this._app.off('update', this._update);
    }

    /**
     * The update every frame
     * @method
     * @param {int} elapsed The time in milliseconds since the last frame
     * @private
     */
    _update(elapsed) {
        let delta = elapsed * 0.001; //ms -> sec

        let t;
        let audioPos;
        let position;
        for (let i = this._timelines.length - 1; i >= 0; --i) {
            t = this._timelines[i];
            if (!t) {
                return; //error checking or stopping of all timelines during update
            }
            if (t.paused) {
                continue;
            }

            //we'll use this to figure out if the timeline is on the next item
            //to avoid code repetition
            position = 0;

            if (t.soundInst) {
                if (t.soundInst.isValid) {
                    //convert sound position ms -> sec
                    audioPos = t.soundInst.position * 0.001;
                    if (audioPos < 0) {
                        audioPos = 0;
                    }
                    position = t.soundStart + audioPos;

                    if (t.useCaptions) {
                        this.captions.seek(t.soundInst.position);
                    }
                }
                //if sound is no longer valid, stop animation playback immediately
                else {
                    position = t.duration;
                }
            }
            else {
                position = t.position + delta * t.speed;
            }

            if (position >= t.duration) {
                while (position >= t.duration) {
                    position -= t.duration;
                    if (t.isLooping) {
                        //error checking
                        if (!t.duration) {
                            t.complete = true;
                            break;
                        }
                        //call the on complete function each time
                        if (t.onComplete) {
                            t.onComplete();
                        }
                    }
                    t._nextItem();
                    if (t.complete) {
                        break;
                    }
                }
                if (t.complete) {
                    this._remove(t);
                    continue;
                }
            }

            if (t.playSound && position >= t.soundStart) {
                t.position = t.soundStart;
                t.playSound = false;
                t.soundInst = this._app.sound.play(
                    t.soundAlias,
                    this._onSoundDone.bind(this, t, t.listIndex, t.soundAlias),
                    this._onSoundStarted.bind(null, t, t.listIndex)
                );
                if (t.useCaptions) {
                    this.captions.play(t.soundAlias);
                }
            }
            else {
                t.position = position;
            }
        }
    }

    /**
     * The sound has been started
     * @method _onSoundStarted
     * @private
     * @param {springroll.AnimatorTimeline} timeline
     * @param {int} playIndex
     */
    _onSoundStarted(timeline, playIndex) {
        if (timeline.listIndex !== playIndex) {
            return;
        }
        //convert sound length to seconds
        timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
    }

    /**
     * The sound is done
     * @method _onSoundDone
     * @private
     * @param {springroll.AnimatorTimeline} timeline
     * @param {int} playIndex
     * @param {String} soundAlias
     */
    _onSoundDone(timeline, playIndex, soundAlias) {
        if (this.captions && this.captions.currentAlias === soundAlias) {
            this.captions.stop();
        }

        if (timeline.listIndex !== playIndex) {
            return;
        }

        if (timeline.soundEnd > timeline.position) {
            timeline.position = timeline.soundEnd;
        }
        timeline.soundInst = null;
    }

    /**
     * Stops all animations and cleans up the variables used.
     * @method destroy
     */
    destroy() {
        this.stopAll(null, true);
        this.captions = null;
        this._app = null;
        this._timelines = null;
        this._timelinePool = null;
        this._timelineMap = null;
        this._definitions = null;
    }
}
