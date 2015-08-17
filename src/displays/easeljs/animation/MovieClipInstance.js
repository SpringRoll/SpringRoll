/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, Animation, EaselJS Display
 */
(function(undefined)
{
	var MovieClip = include('createjs.MovieClip');
	var AnimatorInstance = include('springroll.AnimatorInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class MovieClipInstance
	 * @extends springroll.AnimatorInstance
	 * @private
	 * @constructor
	 * @param {createjs.MovieClip} clip
	 */
	var MovieClipInstance = function(clip)
	{
		AnimatorInstance.call(this, clip);

		// Make sure the clip is disabled
		clip.tickEnabled = false;
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	MovieClipInstance.test = function(clip)
	{
		return clip instanceof MovieClip;
	};

	// Inherit the AnimatorInstance
	var p = extend(MovieClipInstance, AnimatorInstance);

	/**
	 * Get and set the elapsedTime override
	 * @property {Number} elapsedTime
	 */
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function()
		{
			return this.clip.elapsedTime; 
		},
		set: function(elapsedTime)
		{
			this.clip.elapsedTime = elapsedTime;

			// because the movieclip only checks the elapsed time here (tickEnabled is false),
			// calling advance() with no parameters is fine - it won't advance the time
			this.clip.advance();
		}
	});

	/**
	 * Play the clip override
	 * @method play
	 */
	p.play = function()
	{
		this.clip.play();

		// update the movieclip to make sure it is redrawn 
		// correctly at the next opportunity
		this.clip.advance();
	};

	// Assign to namespace
	namespace('springroll.easeljs').MovieClipInstance = MovieClipInstance;

}());