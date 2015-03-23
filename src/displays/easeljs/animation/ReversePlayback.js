/**
 * @module EaselJS Animation
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Application = include('springroll.Application');

	/**
	 * Create an update listener that checks plays the animation
	 * in reverse. Requires the animation to have the same labeling
	 * system as the springroll.Animator system.
	 * 	i.e. each animation must have a corresponding ending frame
	 * 	marked with	a '_stop' and '_loop' suffixes,
	 *	for instance: "walk" requires "walk_loop"
	 * @class ReversePlayback
	 * @static
	 * @param {createjs.MovieClip} clip
	 *	The MovieClip containing the timeline and animation
	 */
	var ReversePlayback = function(clip)
	{
		/**
		 * The animation clip to play
		 * @property {createjs.MovieClip} clip
		 */
		this.clip = clip;

		/**
		 * The framerate which to playback the clip
		 * @property {int} frameRate
		 */
		this.frameRate = 24;

		/**
		 * The list of frame events
		 * @property {object} frameDictionary
		 */
		this.frameDictionary = buildDictionary(clip);

		// Update binding
		this.update = this.update.bind(this);
	};

	// Reference to prototype
	var p = ReversePlayback.prototype;

	/**
	 * Build a dictionary of all animations start and end
	 * frame positions'
	 * @method _buildDictionary
	 * @private
	 */
	var buildDictionary = function(clip)
	{
		var str, i, label, dict = {};
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			if (str.indexOf('_stop') > -1 || str.indexOf('_loop') > -1)
			{
				continue;
			}

			if (!dict[str])
			{
				dict[str] = {
					first: label.position,
					last: null
				};
			}
		}

		var stop, loop;
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			stop = str.indexOf('_stop');
			loop = str.indexOf('_loop');
			if (loop > -1)
			{
				dict[str.substring(0, loop)].last = label.position;
			}
		}
		return dict;
	};

	/**
	 * Play the specificied animation
	 * @method  play
	 * @param {string} label
	 */
	p.play = function(label)
	{
		this.stop();
		
		var frame = this.frameDictionary[label];
		this.startFrame = frame.last;
		this.endFrame = frame.first;
		this.framePassed = this.frameRate;
		this.clip.gotoAndStop(this.endFrame);
		Application.instance.on('update', this.update);
	};

	/**
	 * Go to the previous frame of the animation
	 * @method  goToPreviousFrame
	 */
	p.goToPreviousFrame = function()
	{
		var prevFrame = this.clip.currentFrame - 1;
		if (prevFrame < this.endFrame)
		{
			//loop back to last-frame
			prevFrame = this.startFrame;
		}
		this.clip.gotoAndStop(prevFrame);
	};

	/**
	 * Update the animation when framerate matches animation's framerate
	 * @method  update
	 * @param {number} elapsed Time in milleseconds since last frame update
	 */
	p.update = function(elapsed)
	{
		this.framePassed -= elapsed;
		if (this.framePassed <= 0)
		{
			this.framePassed = this.frameRate;
			this.goToPreviousFrame();
		}
	};

	/**
	 * End the frame update loop
	 * @method stop
	 */
	p.stop = function()
	{
		Application.instance.off('update', this.update);
	};

	//Assign to namespace
	namespace('springroll.easeljs').ReversePlayback = ReversePlayback;
}());