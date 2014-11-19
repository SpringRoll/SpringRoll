/**
*  @module PIXI Display
*  @namespace springroll.pixi
*/
(function() {
	
	var Spine = include('PIXI.Spine'),
		AnimatorTimeline = include('springroll.pixi.AnimatorTimeline'),
		Application = include('springroll.Application'),
		Sound;

	/**
	*  Animator for interacting with Spine animations
	*  @class Animator
	*  @static
	*/
	var Animator = {};
	
	/**
	* The collection of AnimatorTimelines that are playing
	* @property {Array} _timelines
	* @private
	*/
	var _timelines = null,
	
	/**
	* The number of animations
	* @property {int} _numAnims
	* @private
	* @static
	*/
	_numAnims = 0,
	
	/**
	 * Stored collection of AnimatorTimelines. This is internal to Animator and can't be accessed externally.
	 * @property {Array} _animPool
	 * @private
	 * @static
	 */
	_animPool = null;
	
	/**
	*  The global captions object to use with animator
	*  @property {springroll.Captions} captions
	*  @public
	*/
	Animator.captions = null;

	/**
	 * Initializes the singleton instance of Animator.
	 * @method init
	 * @static
	 */
	Animator.init = function()
	{
		_animPool = [];
		_timelines = [];

		Sound = include('springroll.Sound', false);
	};
	
	/**
	* Play a specified animation
	*
	* @function play
	* @param {PIXI.MovieClip|PIXI.Spine} clip The clip to play
	* @param {String|Array} anim Depending on the type of clip, this could be one of several things.
	*
	* If animating a MovieClip, this should be the array of Textures that is the animation (or null
	*  to use the existing array on the clip).
	*
	* If animating a Spine object:
	* - If anim is a string it will play that single animation by name.
	* - If anim is an array of strings it will play as a list of animations (only the last one
	*   can loop).
	* - If anim is an array of objects (with anim, loop, and speed properties) then multiple
	*   animations will be played simultaneously.
	*    When multiple animations play, animation stops when any non looping animation ends.
	* @param {Object|Function} [options] The object of optional parameters or onComplete callback
	*                                    function
	* @param {Function} [options.onComplete=null] The function to call once the animation has
	*                                             finished
	* @param {Boolean} [options.loop=false] Whether the animation should loop
	* @param {int} [options.speed=1] The speed at which to play the animation
	* @param {int} [options.startTime=0] The time in milliseconds into the animation to start.
	* @param {Object|String} [options.audio=null] Data about a sound to sync the animation to,
	*                                                 as an alias or in the format
	*                                                 {alias:"MyAlias", start:0}. start is the
	*                                                 seconds into the animation to start playing
	*                                                 the sound. If it is omitted or audio is
	*                                                 a string, it defaults to 0.
	* @param {Function} [options.onCancelled] A callback function for when an animation is stopped
	*                                         with Animator.stop() or to play another animation.
	* @return {pixi.AnimatorTimeline} The timeline object
	*/
	Animator.play = function(clip, anim, options)
	{
		var callback, loop, speed, startTime, audio, cancelledCallback;

		if (options && typeof options == "function")
		{
			callback = options;
			options = {};
		}
		else if(options)
		{
			callback = options.onComplete || null;
		}
		else
		{
			options = {};
		}
		
		//ensure that we can play the clip
		if (clip === null || (!(clip instanceof Spine) && !(clip.updateAnim)))
		{
			if (callback) callback();
			return;
		}
		
		Animator.stop(clip);
		loop = options.loop || false;
		speed = options.speed || 1;
		startTime = options.startTime;
		//convert into seconds, as that is what the time uses internally
		startTime = startTime ? startTime * 0.001 : 0;
		audio = options.audio || options.soundData || null;
		cancelledCallback = options.onCancelled || null;

		var t = _animPool.length ?
			_animPool.pop().init(clip, callback, speed, cancelledCallback) :
			new AnimatorTimeline(clip, callback, speed, cancelledCallback);

		if (t.isSpine)
		{
			var i;
			
			//allow the animations to be a string, or an array of strings
			if (typeof anim == "string")
			{
				if (!checkSpineForAnimation(clip, anim))
				{
					_repool(t);
					if (callback)
						callback();
					return;
				}
				clip.state.setAnimationByName(anim, loop);
				clip.updateAnim(startTime > 0 ? startTime * t.speed : 0);
			}
			//Array - either animations in order or animations at the same time
			else
			{
				//array of Strings, play animations by name in order
				if (typeof anim[0] == "string")
				{
					clip.state.setAnimationByName(anim[0], false);
					for(i = 1; i < anim.length; ++i)
					{
						clip.state.addAnimationByName(anim[i], loop && i == anim.length - 1);
					}
					clip.updateAnim(startTime > 0 ? startTime * t.speed : 0);
				}
				//array of objects - play different animations at the same time
				else
				{
					t.spineStates = new Array(anim.length);
					t.speed = new Array(anim.length);
					for(i = 0; i < anim.length; ++i)
					{
						var s = new PIXI.spine.AnimationState(clip.stateData);
						t.spineStates[i] = s;
						s.setAnimationByName(anim[i].anim, loop || anim[i].loop);
						if (anim[i].speed)
							t.speed[i] = anim[i].speed;
						else
							t.speed[i] = speed || 1;
						if (startTime > 0)
							s.update(startTime * t.speed[i]);
						s.apply(clip.skeleton);
					}
				}
			}
		}
		else//standard PIXI.MovieClip
		{
			if (anim && anim instanceof Array)
			{
				clip.textures = anim;
				clip.updateDuration();
			}
			clip.loop = loop;
			clip.onComplete = _onMovieClipDone.bind(this, t);
			clip.gotoAndPlay(0);
			if (startTime > 0)
				clip.updateAnim(startTime * t.speed);
		}
		//only do sound if the Sound library is in use
		if (audio && Sound)
		{
			t.playSound = true;
			if (typeof audio == "string")
			{
				t.soundStart = 0;
				t.soundAlias = audio;
			}
			else
			{
				t.soundStart = audio.start > 0 ? audio.start : 0;//seconds
				t.soundAlias = audio.alias;
			}
			t.useCaptions = Animator.captions && Animator.captions.hasCaption(t.soundAlias);

			if (t.soundStart === 0)
			{
				t.soundInst = Sound.instance.play(t.soundAlias, onSoundDone.bind(this, t),
													onSoundStarted.bind(this, t));
			}
			else
			{
				//start preloading the sound, for less wait time when the animation gets to it
				Sound.instance.preloadSound(audio.alias);
			}
		}
		t.loop = loop;
		t.time = startTime > 0 ? startTime : 0;
		_timelines.push(t);
		if (++_numAnims == 1)
			Application.instance.on("update", _update);
		return t;
	};

	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 *
	 * @function instanceHasAnimation
	 * @param {PIXI.Spine} instance The animation to search. This has to be a Spine animation.
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	Animator.instanceHasAnimation = function(instance, anim)
	{
		if (instance instanceof Spine)
			return checkSpineForAnimation(instance, anim);
		return false;
	};
	
	/**
	 * Checks to see if a Spine animation includes a given animation alias
	 *
	 * @function checkSpineForAnimation
	 * @param {PIXI.Spine} clip The spine to search
	 * @param {String} anim The animation alias to search for
	 * @returns {Boolean} Returns true if the animation is found
	 */
	var checkSpineForAnimation = function(clip, anim)
	{
		return clip.stateData.skeletonData.findAnimation(anim) !== null;
	};
	
	/**
	 * Stop a clip
	 *
	 * @function stop
	 * @param {PIXI.MovieClip|PIXI.Spine} clip The clip to stop
	 */
	Animator.stop = function(clip, doCallback)
	{
		for(var i = 0; i < _numAnims; ++i)
		{
			if (_timelines[i].clip === clip)
			{
				var t = _timelines[i];
				_timelines.splice(i, 1);
				if (--_numAnims === 0)
					Application.instance.off("update", _update);
				if (t.cancelledCallback)
					t.cancelledCallback();
				if (t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
			}
		}
	};
	
	/**
	 * Stops all current animations
	 *
	 * @function stop
	 */
	Animator.stopAll = function()
	{
		for(var i = 0; i < _numAnims; ++i)
		{
				var t = _timelines[i];
				if (t.cancelledCallback)
					t.cancelledCallback();
				if (t.soundInst)
					t.soundInst.stop();
				_repool(t);
				break;
		}
		Application.instance.off("update", _update);
		_timelines.length = _numAnims = 0;
	};
	
	/**
	 * Put an AnimatorTimeline back into the general pool after it's done playing
	 * or has been manually stopped.
	 *
	 * @function _repool
	 * @param {AnimatorTimeline} timeline
	 * @private
	 */
	var _repool = function(timeline)
	{
		timeline.clip = null;
		timeline.callback = null;
		timeline.cancelledCallback = null;
		timeline.loop = false;
		timeline.spineStates = null;
		timeline.speed = null;
		timeline.soundInst = null;
		_animPool.push(timeline);
	};
	
	/**
	 * Update each frame
	 *
	 * @function _update
	 * @param {int} elapsed The time since the last frame
	 * @private
	 */
	var _update = function(elapsed)
	{
		var delta = elapsed * 0.001;//ms -> sec
		
		for(var i = _numAnims - 1; i >= 0; --i)
		{
			var t = _timelines[i];
			if (t.paused) continue;
			var prevTime = t.time;
			if (t.soundInst)
			{
				if (t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					var audioPos = t.soundInst.position * 0.001;
					if (audioPos < 0)
						audioPos = 0;
					t.time = t.soundStart + audioPos;
					if (t.useCaptions)
					{
						Animator.captions.seek(t.soundInst.position);
					}
				}
				else//if sound is no longer valid, stop animation immediately
				{
					_onMovieClipDone(t);
					continue;
				}
			}
			else
			{
				t.time += delta;
				if (t.playSound && t.time >= t.soundStart)
				{
					t.time = t.soundStart;
					t.soundInst = Sound.instance.play(
						t.soundAlias,
						onSoundDone.bind(this, t),
						onSoundStarted.bind(this, t)
					);
					if (t.useCaptions)
					{
						Animator.captions.play(t.soundAlias);
					}
				}
			}
			var c = t.clip;
			if (t.isSpine)
			{
				if (t.spineStates)
				{
					var complete = false;
					for(var j = 0, len = t.spineStates.length; j < len; ++j)
					{
						var s = t.spineStates[j];
						s.update((t.time - prevTime) * t.speed[j]);
						s.apply(c.skeleton);
						if (!s.currentLoop && s.isComplete())
							complete = true;
					}
					if (complete)
					{
						_timelines.splice(i, 1);
						_numAnims--;
						if (t.useCaptions)
							Animator.captions.stop();
						if (t.callback)
							t.callback();
						_repool(t);
					}
				}
				else
				{
					c.updateAnim((t.time - prevTime) * t.speed);
					var state = c.state;
					if (!state.currentLoop && state.queue.length === 0 &&
						state.currentTime >= state.current.duration)
					{
						_timelines.splice(i, 1);
						_numAnims--;
						if (t.useCaptions)
							captions.stop();
						if (t.callback)
							t.callback();
						_repool(t);
					}
				}
			}
			else//standard PIXI.MovieClip
			{
				c.updateAnim((t.time - prevTime) * t.speed);
			}
		}
		if (_numAnims === 0)
			Application.instance.off("update", _update);
	};
	
	var onSoundStarted = function(timeline)
	{
		timeline.playSound = false;
		//convert sound length to seconds
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;
	};
	
	var onSoundDone = function(timeline)
	{
		if (timeline.soundEnd > 0 && timeline.time < timeline.soundEnd)
			timeline.time = timeline.soundEnd;
		timeline.soundInst = null;
	};
	
	/**
	 * Called when a movie clip is done playing, calls the AnimatorTimeline's
	 * callback if it has one
	 *
	 * @function _onMovieClipDone
	 * @param {pixi.AnimatorTimeline} timeline
	 * @private
	 */
	var _onMovieClipDone = function(timeline)
	{
		for(var i = 0; i < _numAnims; ++i)
		{
			if (_timelines[i] === timeline)
			{
				var t = _timelines[i];
				if (t.useCaptions)
					Animator.captions.stop();
				t.clip.onComplete = null;
				_timelines.splice(i, 1);
				if (--_numAnims === 0)
					Application.instance.off("update", _update);
				if (t.callback)
					t.callback();
				_repool(t);
				break;
			}
		}
	};
	
	/**
	 * Destroy this
	 *
	 * @function destroy
	 */
	Animator.destroy = function()
	{
		Animator.captions = null;
		_animPool = null;
		_timelines = null;
		Application.instance.off("update", _update);
	};

	//set up the global initialization and destroy
	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);
	
	namespace('springroll').Animator = Animator;
	namespace('springroll.pixi').Animator = Animator;
}());