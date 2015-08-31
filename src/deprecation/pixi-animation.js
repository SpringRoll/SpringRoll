(function()
{
	var Application = include('springroll.Application');

	/**
	 * @class Animator
	 * @namespace springroll.pixi
	 * @see {@link springroll.Animator}
	 * @deprecated since version 0.4.0
	 */
	var Animator = namespace('springroll.pixi').Animator = {};

	/**
	 * @method
	 * @name springroll.pixi.Animator#canAnimate
	 * @see {@link springroll.Animator#canAnimate}
	 * @deprecated since version 0.4.0
	 */
	Animator.canAnimate = function(instance)
	{
		console.warn('Animator.canAnimate() is now deprecated, please use the app.animator.canAnimate()');
		return Application.instance.animator.canAnimate(instance);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getDuration
	 * @see {@link springroll.Animator#getDuration}
	 * @deprecated since version 0.4.0
	 */
	Animator.getDuration = function(instance, event)
	{
		console.warn('Animator.getDuration() is now deprecated, please use the app.animator.getDuration()');
		return Application.instance.animator.getDuration(instance, event);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getTimeline
	 * @see {@link springroll.Animator#getTimeline}
	 * @deprecated since version 0.4.0
	 */
	Animator.getTimeline = function(instance)
	{
		console.warn('Animator.getTimeline() is now deprecated, please use the app.animator.getTimeline()');
		return Application.instance.animator.getTimeline(instance);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#instanceHasAnimation
	 * @see {@link springroll.Animator#instanceHasAnimation}
	 * @deprecated since version 0.4.0
	 */
	Animator.instanceHasAnimation = function(instance, event)
	{
		console.warn('Animator.instanceHasAnimation() is now deprecated, please use the app.animator.instanceHasAnimation()');
		return Application.instance.animator.hasAnimation(instance, event);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#pauseInGroup
	 * @see {@link springroll.Animator#pauseInGroup}
	 * @deprecated since version 0.4.0
	 */
	Animator.pauseInGroup = function(paused, container)
	{
		console.warn('Animator.pauseInGroup() is now deprecated, please use the app.animator.pauseInGroup()');
		Application.instance.animator.pauseInGroup(paused, container);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#resume
	 * @see {@link springroll.Animator#resume}
	 * @deprecated since version 0.4.0
	 */
	Animator.resume = function()
	{
		console.warn('Animator.resume() is now deprecated, please use the app.animator.resume()');
		Application.instance.animator.resume();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#stopAll
	 * @see {@link springroll.Animator#stopAll}
	 * @deprecated since version 0.4.0
	 */
	Animator.stopAll = function(container, removeCallbacks)
	{
		console.warn('Animator.stopAll() is now deprecated, please use the app.animator.stopAll()');
		Application.instance.animator.stopAll(container, removeCallbacks);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#destroy
	 * @see {@link springroll.Animator#destroy}
	 * @deprecated since version 0.4.0
	 */
	Animator.destroy = function()
	{
		console.warn('Animator.destroy() is now deprecated, please use the app.animator.destroy()');
		Application.instance.animator.destroy();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#getPaused
	 * @see {@link springroll.Animator#paused}
	 * @deprecated since version 0.4.0
	 */
	Animator.getPaused = function(instance)
	{
		console.warn('Animator.getPaused() is now deprecated, please use the app.animator.paused');
		return Application.instance.animator.paused;
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#init
	 * @see {@link springroll.Animator#init}
	 * @deprecated since version 0.4.0
	 */
	Animator.init = function()
	{
		console.warn('Animator.init() is now deprecated, please use the app.animator property');
		return Application.intance.animator;
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#pause
	 * @see {@link springroll.Animator#pause}
	 * @deprecated since version 0.4.0
	 */
	Animator.pause = function()
	{
		console.warn('Animator.pause() is now deprecated, please use the app.animator.pause()');
		Application.instance.animator.pause();
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#play
	 * @see {@link springroll.Animator#play}
	 * @deprecated since version 0.4.0
	 */
	Animator.play = function(instance, eventList, onComplete, onCancelled)
	{
		console.warn('Animator.play() is now deprecated, please use the app.animator.play');
		return Application.instance.animator.play(instance, eventList, onComplete, onCancelled);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#stop
	 * @see {@link springroll.Animator#stop}
	 * @deprecated since version 0.4.0
	 */
	Animator.stop = function(instance, removeCallbacks)
	{
		console.warn('Animator.stop() is now deprecated, please use the app.animator.stop()');
		Application.instance.animator.stop(instance, removeCallbacks);
	};

	/**
	 * @method
	 * @name springroll.pixi.Animator#toString
	 * @deprecated since version 0.4.0
	 */
	Animator.toString = function()
	{
		console.warn('Animator.toString is now deprecated');
		return '[Animator]';
	};

	Object.defineProperties(Animator, 
	{
		/**
		 * @property
		 * @name springroll.pixi.Animator#captions
		 * @see {@link springroll.Animator#captions}
		 * @deprecated since version 0.4.0
		 */
		captions: 
		{
			get: function()
			{
				console.warn('Animator.captions is now deprecated, please use the app.animator.captions');
				return Application.instance.animator.captions;
			}
		},
		/**
		 * @property
		 * @name springroll.pixi.Animator#debug
		 * @see {@link springroll.Animator#debug}
		 * @deprecated since version 0.4.0
		 */
		debug: 
		{
			get: function()
			{
				console.warn('Animator.debug is now deprecated, please use the app.animator.debug');
				return Application.instance.animator.debug;
			}
		}
	});

}());