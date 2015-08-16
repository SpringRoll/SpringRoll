/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function(undefined)
{
	/**
	 * The auto-incrementing id for the clip
	 * @method
	 */
	var ANIMATOR_ID = 0;

	/**
	 * Animator Instance is a wrapper for different types of media
	 * files. They need to extend some basic methods.
	 *
	 * @class AnimatorTimeline
	 * @constructor
	 * @param {*} clip The animation to play
	 */
	var AnimatorInstance = function(clip)
	{
		/**
		 * The animation clip to play
		 * @param {*} clip 
		 */
		this.clip = clip;

		// Add a unique id to the clip
		clip.__animatorId = ++ANIMATOR_ID;
	};

	// Reference to the prototype
	var p = AnimatorInstance.prototype;

	/**
	 * Check to see if a clip is compatible with this
	 * @method test
	 * @static
	 * @return {Boolean} if the clip is supported by this instance
	 */
	AnimatorInstance.test = function(clip)
	{
		return clip.framerate !== undefined &&
			clip.getLabels !== undefined &&
			clip.elapsedTime !== undefined && 
			clip.gotoAndStop !== undefined &&
			clip.gotoAndPlay !== undefined &&
			clip.stop !== undefined &&
			clip.play !== undefined &&
			clip.advance !== undefined;
	};

	/**
	 * Get and set the framerate
	 * @property {int} framerate
	 */
	Object.defineProperty(p, 'framerate',
	{
		get: function() { return this.clip.framerate; },
		set: function(framerate) { this.clip.framerate = framerate; }
	});

	/**
	 * Get and set the elapsedTime
	 * @property {Number} elapsedTime
	 */
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function() { return this.clip.elapsedTime; },
		set: function(elapsedTime) { this.clip.elapsedTime = elapsedTime; }
	});

	/**
	 * The unique id for this animation
	 * @property {Number} id
	 * @readOnly
	 */
	Object.defineProperty(p, 'id',
	{
		get: function() { return this.clip.__animatorId; }
	});

	/**
	 * Get the collection of labels
	 * @method getLabels
	 * @return {Array} The collection of label, object with a label key
	 */
	p.getLabels = function()
	{
		return this.clip.getLabels();
	};

	/**
	 * Goto and stop on a frame
	 * @method gotoAndStop
	 * @param {String|int} frame The frame to goto
	 */
	p.gotoAndStop = function(frame)
	{
		this.clip.gotoAndStop(frame);
	};

	/**
	 * Goto and play on a frame
	 * @method gotoAndPlay
	 * @param {String|int} frame The frame to goto
	 */
	p.gotoAndPlay = function(frame)
	{
		this.clip.gotoAndPlay(frame);
	};

	/**
	 * Play the animation
	 * @method play
	 */
	p.play = function()
	{
		this.clip.play();
	};

	/**
	 * Stop the animation
	 * @method stop
	 */
	p.stop = function()
	{
		this.clip.stop();
	};

	/**
	 * Advance to the next frame as soon as possible to draw
	 * @method advance
	 */
	p.advance = function()
	{
		this.clip.advance();
	};

	/**
	 * Checks if animation exists
	 *
	 * @method hasAnimation
	 * @param {String} event The frame label event (e.g. "onClose" to "onClose_stop")
	 * @public
	 * @return {Boolean} does this animation exist?
	 */
	p.hasAnimation = function(event)
	{
		var labels = this.getLabels();
		var startFrame = -1,
			stopFrame = -1;
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		var l;
		for (var i = 0, len = labels.length; i < len; ++i)
		{
			l = labels[i];
			if (l.label == event)
			{
				startFrame = l.position;
			}
			else if (l.label == stopLabel || l.label == loopLabel)
			{
				stopFrame = l.position;
				break;
			}
		}
	};

	/**
	 * Get the duration of an event label
	 * @method getDuration
	 * @param {String|Array} event The event or events
	 * @return {int} Duration of sequence in milliseconds
	 */
	p.getDuration = function(event)
	{
		if (Array.isArray(event))
		{
			var duration = 0;
			for (var j = 0, eventLength = event.length; j < eventLength; j++)
			{
				duration += this.getDuration(event[j]);
			}
			return duration;
		}
		else
		{
			if (typeof event == "number")
			{
				return event;	
			}
			else if (typeof event == "object" && event.anim)
			{
				event = event.anim;
			}
			else if (typeof event != "string")
			{
				return 0;
			}

			var labels = this.getLabels();
			var startFrame = -1,
				stopFrame = -1;
			var stopLabel = event + "_stop";
			var loopLabel = event + "_loop";
			var l;
			for (var i = 0, labelsLength = labels.length; i < labelsLength; ++i)
			{
				l = labels[i];
				if (l.label == event)
				{
					startFrame = l.position;
				}
				else if (l.label == stopLabel || l.label == loopLabel)
				{
					stopFrame = l.position;
					break;
				}
			}
			if (startFrame >= 0 && stopFrame > 0)
			{
				//make sure the movieclip has a framerate
				if (!this.framerate)
				{
					var fps = _app.options.fps;
					if (!fps)
						fps = 15;
					this.framerate = fps;
				}

				return (stopFrame - startFrame) / this.framerate * 1000;
			}
			else
			{
				return 0;
			}
		}
	};

	/**
	 * Reset this animator instance
	 * so it can be re-used.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stop();
		delete this.clip.__animatorId;
		this.clip = null;
	};

	// Assign to namespace
	namespace('springroll').AnimatorInstance = AnimatorInstance;

}());