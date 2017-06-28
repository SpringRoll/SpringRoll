/**
 * Animator Instance is a wrapper for different types of media
 * files. They need to extend some basic methods.
 * ### module: @springroll/animation
 * @class
 * @memberof springroll
 */
export default class AnimatorInstance {
    constructor() {
        /**
         * The animation clip to play
         * @member {*}
         */
        this.clip = null;

        /**
         * Time, in seconds, of the current animation playback, from 0 -> duration.
         * @member {Number}
         */
        this.position = 0;

        /**
         * Duration, in seconds, of the current animation.
         * @member {Number}
         */
        this.duration = 0;

        /**
         * If the current animation is a looping animation.
         * @member {Boolean}
         */
        this.isLooping = false;

        /**
         * The name of the current animation.
         * @member {String}
         */
        this.currentName = null;
    }

    /**
     * The initialization method
     * @param  {*} clip The movieclip
     */
    init(clip) {
        this.clip = clip;
    }

    /**
     * Sets up variables that are needed (including duration), and does any other setup else needed.
     * @param {Object} animObj The animation data object.
     * @param {Boolean} isRepeat If this animation is restarting a loop.
     */
    beginAnim(/*animObj, isRepeat*/) {}

    /**
     * Ends animation playback.
     */
    endAnim() {}

    /**
     * Updates position to a new value, and does anything that the clip needs, like updating
     * timelines.
     * @param  {Number} newPos The new position in the animation.
     */
    setPosition(/*newPos*/) {}

    /**
     * Check to see if a clip is compatible with this
     * @static
     * @return {Boolean} if the clip is supported by this instance
     */
    static test(/*clip*/) {
        return false;
    }

    /**
     * Determines if a clip has an animation.
     * @static
     * @param  {*} clip The clip to check for an animation.
     * @param  {String|Object} event The animation.
     * @return {Boolean} If the clip has the animation.
     */
    static hasAnimation(/*clip, event*/) {
        return false;
    }

    /**
     * Calculates the duration of an animation or list of animations.
     * @static
     * @param  {*} clip The clip to check.
     * @param  {String|Object|Array} event The animation or animation list.
     * @return {Number} Animation duration in milliseconds.
     */
    static getDuration(/*clip, event*/) {
        return 0;
    }

    /**
     * Create pool and add create and remove functions
     * @param {function} InstanceClass The instance class
     * @param {function} [ParentClass=springroll.AnimatorTimeline] The class to extend
     * @return {object} The prototype for new class
     */
    static extend(InstanceClass, ParentClass) {
        /**
         * The pool of used up instances
         * @member {Array}
         * @static
         * @protected
         */
        InstanceClass._pool = [];

        /**
         * Get an instance either from a recycled pool or new
         * @static
         * @param  {*} clip The animation clip or display object
         * @return {springroll.AnimatorInstance} The new instance
         */
        InstanceClass.create = function(clip) {
            let instance = InstanceClass._pool.length > 0 ?
                InstanceClass._pool.pop() :
                new InstanceClass();

            instance.init(clip);
            return instance;
        };

        /**
         * Recycle an instance to the class's pool
         * @static
         * @param  {springroll.AnimatorInstance} instance The instance to pool
         */
        InstanceClass.pool = function(instance) {
            instance.destroy();
            InstanceClass._pool.push(instance);
        };

        //Extend the parent class
        InstanceClass.prototype = Object.create((ParentClass || AnimatorInstance).prototype);
        return InstanceClass.prototype;
    }

    /**
     * Reset this animator instance
     * so it can be re-used.
     */
    destroy() {
        this.clip = null;
    }
}
