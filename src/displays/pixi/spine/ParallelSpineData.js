/**
 * @module PIXI Spine
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display, Animation
 */
(function()
{
	/**
	 * Class for assisting in creating an array of Spine animations to play at the same time
	 * on one skeleton through Animator. Concurrent animations will play until one non-looping
	 * animation ends.
	 *
	 * @class ParallelSpineData
	 * @constructor
	 * @param {String} anim The name of the animation on the skeleton.
	 * @param {Boolean} [loop=false] If this animation should loop.
	 * @param {Number} [speed=1] The speed at which this animation should be played.
	 */
	var ParallelSpineData = function(anim, loop, speed)
	{
		this.anim = anim;
		this.loop = !!loop;
		this.speed = speed > 0 ? speed : 1;
	};

	// Assign to namespace
	namespace("springroll.pixi").ParallelSpineData = ParallelSpineData;

}());