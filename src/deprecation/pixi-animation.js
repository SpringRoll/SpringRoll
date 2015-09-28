/**
 * @module PIXI Animation
 * @namespace springroll.pixi
 * @requires Core, PIXI Display
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	 * See {{#crossLink "springroll.Animator"}}{{/crossLink}}
	 * @class Animator
	 * @deprecated since version 0.4.0
	 */
	var Animator = namespace('springroll').Animator = namespace('springroll.pixi').Animator = {};

	/**
	 * If an instance can be animated, See {{#crossLink "springroll.Animator/canAnimate:method"}}{{/crossLink}}
	 * @static
	 * @method canAnimate
	 * @deprecated since version 0.4.0
	 * @param {*} instance The instance to check
	 * @return {Boolean} If the instance is animate-able
	 */
	Animator.canAnimate = function(instance)
	{
		if (DEBUG) console.warn('Animator.canAnimate() is now deprecated, please use the app.animator.canAnimate()');
		return Application.instance.animator.canAnimate(instance);
	};

	/**
	 * Get the duration for an instance by event, see {{#crossLink "springroll.Animator/getDuration:method"}}{{/crossLink}}
	 * @method getDuration
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {string} event The event name
	 * @return {int} The length in milliseconds
	 */
	Animator.getDuration = function(instance, event)
	{
		if (DEBUG) console.warn('Animator.getDuration() is now deprecated, please use the app.animator.getDuration()');
		return Application.instance.animator.getDuration(instance, event);
	};

	/**
	 * Get a timeline by instance, see {{#crossLink "springroll.Animator/getTimeline:method"}}{{/crossLink}}
	 * @static
	 * @method getTimeline
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @return {springroll.AnimatorTimeline} The timeline instance
	 */
	Animator.getTimeline = function(instance)
	{
		if (DEBUG) console.warn('Animator.getTimeline() is now deprecated, please use the app.animator.getTimeline()');
		return Application.instance.animator.getTimeline(instance);
	};

	/**
	 * If an instance has an animation event label, see {{#crossLink "springroll.Animator/hasAnimation:method"}}{{/crossLink}}
	 * @static
	 * @method instanceHasAnimation
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {String} event The event label to check
	 * @return {Boolean} If the instance has the event
	 */
	Animator.instanceHasAnimation = function(instance, event)
	{
		if (DEBUG) console.warn('Animator.instanceHasAnimation() is now deprecated, please use the app.animator.instanceHasAnimation()');
		return Application.instance.animator.hasAnimation(instance, event);
	};

	/**
	 * Pause all animations in a group, see {{#crossLink "springroll.Animator/pauseInGroup:method"}}{{/crossLink}}
	 * @method pauseInGroup
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {Boolean} paused The paused state
	 * @param {PIXI.Container} container The container of instances
	 */
	Animator.pauseInGroup = function(paused, container)
	{
		if (DEBUG) console.warn('Animator.pauseInGroup() is now deprecated, please use the app.animator.pauseInGroup()');
		Application.instance.animator.pauseInGroup(paused, container);
	};

	/**
	 * Resume all animations, see {{#crossLink "springroll.Animator/resume:method"}}{{/crossLink}}
	 * @static
	 * @method resume
	 * @deprecated since version 0.4.0
	 */
	Animator.resume = function()
	{
		if (DEBUG) console.warn('Animator.resume() is now deprecated, please use the app.animator.resume()');
		Application.instance.animator.resume();
	};

	/**
	 * Stop all animations, see {{#crossLink "springroll.Animator/stopAll:method"}}{{/crossLink}}
	 * @method stopAll
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.stopAll = function(container, removeCallbacks)
	{
		if (DEBUG) console.warn('Animator.stopAll() is now deprecated, please use the app.animator.stopAll()');
		Application.instance.animator.stopAll(container, removeCallbacks);
	};

	/**
	 * Destroy the animator, see {{#crossLink "springroll.Animator/destroy:method"}}{{/crossLink}}
	 * @method destroy
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.destroy = function()
	{
		if (DEBUG) console.warn('Animator.destroy() is now deprecated, please use the app.animator.destroy()');
		Application.instance.animator.destroy();
	};

	/**
	 * Get the paused state of instance, see {{#crossLink "springroll.Animator/paused:property"}}{{/crossLink}}
	 * @method getPaused
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The instance to get
	 * @return {Boolean} Is paused
	 */
	Animator.getPaused = function(instance)
	{
		if (DEBUG) console.warn('Animator.getPaused() is now deprecated, please use the app.animator.paused');
		return Application.instance.animator.paused;
	};

	/**
	 * Initialize the animator, see {{#crossLink "springroll.Application/animator:property"}}{{/crossLink}}
	 * @method init
	 * @static
	 * @deprecated since version 0.4.0
	 * @return {springroll.Animator} The animator instance
	 */
	Animator.init = function()
	{
		if (DEBUG) console.warn('Animator.init() is now deprecated, please use the app.animator property');
		return Application.intance.animator;
	};

	/**
	 * Pause all animations, see {{#crossLink "springroll.Animator/pause:method"}}{{/crossLink}}
	 * @method pause
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.pause = function()
	{
		if (DEBUG) console.warn('Animator.pause() is now deprecated, please use the app.animator.pause()');
		Application.instance.animator.pause();
	};

	/**
	 * Play an instance event, see {{#crossLink "springroll.Animator/play:method"}}{{/crossLink}}
	 * @method play
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip instance
	 * @param {Object|String} eventList The event information to play
	 * @param {Function} onComplete The completed function
	 * @param {Function} [onCancelled] The cancelled function
	 */
	Animator.play = function(instance, eventList, onComplete, onCancelled)
	{
		if (DEBUG) console.warn('Animator.play() is now deprecated, please use the app.animator.play');
		return Application.instance.animator.play(instance, eventList, onComplete, onCancelled);
	};

	/**
	 * See {{#crossLink "springroll.Animator/stop:method"}}{{/crossLink}}
	 * @method stop
	 * @static
	 * @deprecated since version 0.4.0
	 * @param {*} instance The clip to play
	 * @param {Boolean} [removeCallbacks=false] If we should remove callbacks
	 */
	Animator.stop = function(instance, removeCallbacks)
	{
		if (DEBUG) console.warn('Animator.stop() is now deprecated, please use the app.animator.stop()');
		Application.instance.animator.stop(instance, removeCallbacks);
	};

	/**
	 * @method toString
	 * @static
	 * @deprecated since version 0.4.0
	 */
	Animator.toString = function()
	{
		if (DEBUG) console.warn('Animator.toString is now deprecated');
		return '[Animator]';
	};

	Object.defineProperties(Animator, 
	{
		/**
		 * See {{#crossLink "springroll.Animator/captions:property"}}{{/crossLink}}
		 * @property {springroll.Captions} captions
		 * @static
		 * @deprecated since version 0.4.0
		 */
		captions: 
		{
			get: function()
			{
				if (DEBUG) console.warn('Animator.captions is now deprecated, please use the app.animator.captions');
				return Application.instance.animator.captions;
			}
		},
		/**
		 * See {{#crossLink "springroll.Animator/debug:property"}}{{/crossLink}}
		 * @property {Boolean} debug
		 * @static
		 * @deprecated since version 0.4.0
		 */
		debug: 
		{
			get: function()
			{
				if (DEBUG) console.warn('Animator.debug is now deprecated, please use the app.animator.debug');
				return Application.instance.animator.debug;
			}
		}
	});

}());