/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	var Application = include("springroll.Application");

	/**
	 * Animator Instance is a wrapper for different types of media
	 * files. They need to extend some basic methods.
	 * @class AnimatorTimeline
	 */
	var AnimatorInstance = function()
	{
		/**
		 * The animation clip to play
		 * @property {*} clip
		 */
		this.clip = null;

		/**
		 * Time, in seconds, of the current animation playback, from 0 -> duration.
		 * @property {Number} position
		 */
		this.position = 0;

		/**
		 * Duration, in seconds, of the current animation.
		 * @property {Number} duration
		 */
		this.duration = 0;

		/**
		 * If the current animation is a looping animation.
		 * @property {Boolean} isLooping
		 */
		this.isLooping = false;

		/**
		 * The name of the current animation.
		 * @property {String} currentName
		 */
		this.currentName = null;
	};

	//reference to the prototype
	var p = AnimatorInstance.prototype;

	/**
	 * The initialization method
	 * @method init
	 * @param  {*} clip The movieclip
	 */
	p.init = function(clip)
	{
		this.clip = clip;
	};

	/**
	 * Sets up variables that are needed (including duration), and does any other setup else needed.
	 * @method beginAnim
	 * @param {Object} animObj The animation data object.
	 * @param {Boolean} isRepeat If this animation is restarting a loop.
	 */
	p.beginAnim = function(animObj, isRepeat) {};

	/**
	 * Ends animation playback.
	 * @method endAnim
	 */
	p.endAnim = function() {};

	/**
	 * Updates position to a new value, and does anything that the clip needs, like updating
	 * timelines.
	 * @method setPosition
	 * @param  {Number} newPos The new position in the animation.
	 */
	p.setPosition = function(newPos) {};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	AnimatorInstance.test = function(clip)
	{
		return false;
	};

	/**
	 * Determines if a clip has an animation.
	 * @method hasAnimation
	 * @static
	 * @param  {*} clip The clip to check for an animation.
	 * @param  {String|Object} event The animation.
	 * @return {Boolean} If the clip has the animation.
	 */
	AnimatorInstance.hasAnimation = function(clip, event)
	{
		return false;
	};

	/**
	 * Calculates the duration of an animation or list of animations.
	 * @method getDuration
	 * @static
	 * @param  {*} clip The clip to check.
	 * @param  {String|Object|Array} event The animation or animation list.
	 * @return {Number} Animation duration in milliseconds.
	 */
	AnimatorInstance.getDuration = function(clip, event)
	{
		return 0;
	};

	/**
	 * Create pool and add create and remove functions
	 * @method extend
	 * @param {function} InstanceClass The instance class
	 * @param {function} [ParentClass=springroll.AnimatorTimeline] The class to extend
	 * @return {object} The prototype for new class
	 */
	AnimatorInstance.extend = function(InstanceClass, ParentClass)
	{
		/**
		 * The pool of used up instances
		 * @property {Array} _pool
		 * @static
		 * @protected
		 */
		InstanceClass._pool = [];

		/**
		 * Get an instance either from a recycled pool or new
		 * @method create
		 * @static
		 * @param  {*} clip The animation clip or display object
		 * @return {springroll.AnimatorInstance} The new instance
		 */
		InstanceClass.create = function(clip)
		{
			var instance = InstanceClass._pool.length > 0 ?
				InstanceClass._pool.pop() :
				new InstanceClass();

			instance.init(clip);
			return instance;
		};

		/**
		 * Recycle an instance to the class's pool
		 * @method pool
		 * @static
		 * @param  {springroll.AnimatorInstance} instance The instance to pool
		 */
		InstanceClass.pool = function(instance)
		{
			instance.destroy();
			InstanceClass._pool.push(instance);
		};

		//Extend the parent class
		return extend(InstanceClass, ParentClass || AnimatorInstance);
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

	//assign to namespace
	namespace('springroll').AnimatorInstance = AnimatorInstance;

}());