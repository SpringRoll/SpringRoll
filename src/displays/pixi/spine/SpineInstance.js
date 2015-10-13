/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function(undefined)
{
	var Application = include("springroll.Application");
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var Spine = include('PIXI.spine.Spine', false);
	var ParallelSpineData = include('springroll.pixi.ParallelSpineData');

	if (!Spine) return;

	/**
	 * The plugin for working with Spine skeletons and animator
	 * @class SpineInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 */
	var SpineInstance = function()
	{
		AnimatorInstance.call(this);

		this.prevPosition = 0;
	};

	// Reference to the prototype
	var p = AnimatorInstance.extend(SpineInstance);

	/**
	 * The initialization method
	 * @method init
	 * @param  {*} clip The movieclip
	 */
	p.init = function(clip)
	{
		//we don't want Spine animations to advance every render, only when Animator tells them to
		clip.autoUpdate = false;

		this.clip = clip;
		this.isLooping = false;
		this.currentName = null;
		this.position = this.duration = 0;
	};

	p.beginAnim = function(animObj, isRepeat)
	{
		var spineState = this.clip.state;
		spineState.clearTracks();
		var skeletonData = this.clip.stateData.skeletonData;

		this.isLooping = !!animObj.loop;

		var anim = this.currentName = animObj.anim;
		if (typeof anim == "string")
		{
			//single anim
			this.duration = skeletonData.findAnimation(anim).duration;
			spineState.setAnimationByName(0, anim, this.isLooping);
		}
		else //if(Array.isArray(anim))
		{
			var i;
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				//this.spineSpeeds = new Array(anim.length);
				this.duration = 0;
				var maxDuration = 0,
					maxLoopDuration = 0,
					duration;
				for (i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					spineState.setAnimationByName(i, anim[i].anim, animLoop);
					duration = skeletonData.findAnimation(anim[i].anim).duration;
					if (animLoop)
					{
						if (duration > maxLoopDuration)
							maxLoopDuration = duration;
					}
					else
					{
						if (duration > maxDuration)
							maxDuration = duration;
					}
					/*if (anim[i].speed > 0)
						this.spineSpeeds[i] = anim[i].speed;
					else
						this.spineSpeeds[i] = 1;*/
				}
				//set the duration to be the longest of the non looping animations
				//or the longest loop if they all loop
				this.duration = maxDuration || maxLoopDuration;
			}
			//list of sequential spine anims
			else
			{
				this.duration = skeletonData.findAnimation(anim[0]).duration;
				if (anim.length == 1)
				{
					spineState.setAnimationByName(0, anim[0], this.isLooping);
				}
				else
				{
					spineState.setAnimationByName(0, anim[0], false);
					for (i = 1; i < anim.length; ++i)
					{
						spineState.addAnimationByName(0, anim[i],
							this.isLooping && i == anim.length - 1);
						this.duration += skeletonData.findAnimation(anim[i]).duration;
					}
				}
			}
		}

		if (isRepeat)
			this.position = 0;
		else
		{
			var animStart = animObj.start || 0;
			this.position = animStart < 0 ? Math.random() * this.duration : animStart;
		}

		this.clip.update(this.position);
	};

	/**
	 * Ends animation playback.
	 * @method endAnim
	 */
	p.endAnim = function()
	{
		this.clip.update(this.duration - this.position);
	};

	/**
	 * Updates position to a new value, and does anything that the clip needs, like updating
	 * timelines.
	 * @method setPosition
	 * @param  {Number} newPos The new position in the animation.
	 */
	p.setPosition = function(newPos)
	{
		if (newPos < this.position)
			this.clip.update(this.duration - this.position + newPos);
		else
			this.clip.update(newPos - this.position);
		this.position = newPos;
	};

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	SpineInstance.test = function(clip)
	{
		return clip instanceof Spine;
	};

	/**
	 * Checks if animation exists
	 *
	 * @method hasAnimation
	 * @static
	 * @param {*} clip The clip to check for an animation.
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @return {Boolean} does this animation exist?
	 */
	SpineInstance.hasAnimation = function(clip, anim)
	{
		var i;
		var skeletonData = clip.stateData.skeletonData;
		if (typeof anim == "string")
		{
			//single anim
			return !!skeletonData.findAnimation(anim);
		}
		else if (Array.isArray(anim))
		{
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				for (i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if (!skeletonData.findAnimation(anim[i].anim))
						return false;
				}
			}
			//list of sequential spine anims
			else
			{
				for (i = 0; i < anim.length; ++i)
				{
					//ensure all animations exist
					if (!skeletonData.findAnimation(anim[i]))
						return false;
				}
			}
			return true;
		}
		return false;
	};

	/**
	 * Calculates the duration of an animation or list of animations.
	 * @method getDuration
	 * @static
	 * @param  {*} clip The clip to check.
	 * @param  {String} event The animation or animation list.
	 * @return {Number} Animation duration in milliseconds.
	 */
	SpineInstance.getDuration = function(clip, event)
	{
		var i;
		var skeletonData = this.clip.stateData.skeletonData;
		if (typeof anim == "string")
		{
			//single anim
			return skeletonData.findAnimation(anim).duration;
		}
		else if (Array.isArray(anim))
		{
			var duration = 0;
			//concurrent spine anims
			if (anim[0] instanceof ParallelSpineData)
			{
				var maxDuration = 0,
					maxLoopDuration = 0,
					tempDur;
				for (i = 0; i < anim.length; ++i)
				{
					var animLoop = anim[i].loop;
					tempDur = skeletonData.findAnimation(anim[i].anim).duration;
					if (animLoop)
					{
						if (tempDur > maxLoopDuration)
							maxLoopDuration = tempDur;
					}
					else
					{
						if (tempDur > maxDuration)
							maxDuration = tempDur;
					}
				}
				//set the duration to be the longest of the non looping animations
				//or the longest loop if they all loop
				duration = maxDuration || maxLoopDuration;
			}
			//list of sequential spine anims
			else
			{
				duration = skeletonData.findAnimation(anim[0]).duration;
				if (anim.length > 1)
				{
					for (i = 1; i < anim.length; ++i)
					{
						duration += skeletonData.findAnimation(anim[i]).duration;
					}
				}
			}
			return duration;
		}
		return 0;
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

	// Assign to namespace
	namespace('springroll.pixi').SpineInstance = SpineInstance;

}());