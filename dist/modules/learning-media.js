/*! SpringRoll 0.4.1 */
/**
 * @module Learning Media
 * @namespace springroll
 * @requires Core, Learning, Sound, Captions
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		StringFilters = include('springroll.StringFilters');

	/**
	 * This class contains a bunch of media playing class
	 * to provide convenience around using the Learning Dispatcher
	 * @class LearningMedia
	 */
	var LearningMedia = function()
	{
		/**
		 * Reference to the StringFilters
		 * @property {springroll.StringFilters} filters
		 */
		this.filters = null;
		
		/**
		 * Reference to the Learning Dispatcher
		 * @property {springroll.Learning} learning
		 */
		this.learning = null;

		/**
		 * Reference to the VO Player
		 * @property {springroll.VOPlayer} voPlayer
		 */
		this.voPlayer = null;

		/**
		 * Reference to the main display
		 * @property {createjs.Display} display
		 */
		this.display = null;

		/**
		 * Reference to the animator instance
		 * @property {springroll.Animator} animator
		 */
		this.animator = null;
	};

	//Reference to the prototype
	var p = LearningMedia.prototype;

	/**
	 * Intiailize the media
	 * @method init
	 * @param {springroll.Application} app
	 */
	p.init = function(app)
	{
		this.filters = app.filters;
		this.learning = app.learning;
		this.voPlayer = app.voPlayer;
		this.display = app.display;
		this.animator = app.animator;
	};
	
	p._filterEvents = function(events)
	{
		if(typeof events == "string")
			return this.filters.filter(events);
		else
		{
			if(!Array.isArray(events))
				events = [events];
			for(var i = 0; i < events.length; ++i)
			{
				var eventInfo = events[i];
				switch (typeof eventInfo)
				{
					case "string":
						eventInfo = this.filters.filter(eventInfo);
						break;
					case "object":
						//we passed an object
						eventInfo.anim = this.filters.filter(eventInfo.anim);

						if (eventInfo.audio)
						{
							if (typeof eventInfo.audio == 'object')
							{
								eventInfo.audio.alias =	this.filters.filter(eventInfo.audio.alias);
							}
							else
							{
								eventInfo.audio = this.filters.filter(eventInfo.audio);
							}
						}
						break;
				}
				events[i] = eventInfo;
			}
			return events;
		}
	};

	/**
	 * Plays animation or list of animations using springroll.Animator,
	 * firing startMovie and endMovie or skipMovie Learning events.
	 * @method playMovie
	 * @param {MovieClip} instance The MovieClip to animate.
	 * @param {String|Array|Object} events Event or list of events to animate. See
	 *                                   springroll.Animator.play() docs for details.
	 * @param {Function} [onComplete]	VO/Animation Ended callback
	 * @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                       If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                       If omited, no callback will be fired on interruption.
	 * @return {springroll.AnimatorTimeline} AnimatorTimeline of the played animation.
	 */
	p.playMovie = function(instance, events, onComplete, onCancel)
	{
		events = this._filterEvents(events);
	
		if (!this.learning.spec)
		{
			if (true && Debug)
			{
				Debug.warn("Learning is not available and will not trigger Movie events");
			}
			return this.animator.play(instance, events, options);
		}

		return this.triggerMoviePlay(
			instance,
			events,
			onComplete,
			onCancel,
			"movie"
		);
	};

	/**
	 * Plays events/aliases using Animator or VOPlayer, and fires startInstruction and endInstruction Learning events
	 *
	 * Example Animator usage:
	 * game.playInstruction(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 * Example VOPlayer usage:
	 * game.playInstruction("soundAlias", doneFunction, interruptedFunction);
	 *
	 * @method playInstruction
	 * @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                               Omit this parameter to play alias(es) with VOPlayer instead
	 * @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                       See VOPlayer.play docs for options.
	 *                                       If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                       See springroll.Animator.play() docs for options
	 * @param {Function} [onComplete]	VO/Animation Ended callback
	 * @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                      If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                      If omited, no callback will be fired on interruption.
	 *  @return {springroll.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playInstruction = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning;
		var animator = this.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			events = this._filterEvents(events);
			
			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger Instruction events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}
			
			return this.triggerMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"instruction"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;
			
			events = this._filterEvents(events);

			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger Instruction events");
				}
				this.voPlayer.play(events, onComplete, onCancel);
				return;
			}
			this.triggerVOPlay(
				events,
				learning.startInstruction,
				learning.endInstruction,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 * Plays events/aliases using Animator or VOPlayer, and fires startIncorrectFeedback and endIncorrectFeedback Learning events
	 *
	 * Example Animator usage:
	 * game.playIncorrectFeedback(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 * Example VOPlayer usage:
	 * game.playIncorrectFeedback("soundAlias", doneFunction, interruptedFunction);
	 *
	 * @method playIncorrectFeedback
	 * @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                               Omit this parameter to play alias(es) with VOPlayer instead
	 * @param {String|Array|Object} events   If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                       See VOPlayer.play docs for options.
	 *                                       If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                       See springroll.Animator.play() docs for options
	 * @param {Function} [onComplete]	VO/Animation Ended callback
	 * @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                      If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                      If omited, no callback will be fired on interruption.
	 * @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playIncorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning;
		var animator = this.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			events = this._filterEvents(events);
			
			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger IncorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.triggerMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"incorrect"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;
			
			events = this._filterEvents(events);

			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger IncorrectFeedback events");
				}
				this.voPlayer.play(events, onComplete, onCancel);
				return;
			}
			this.triggerVOPlay(
				events,
				learning.startIncorrectFeedback,
				learning.endIncorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 * Plays events/aliases using Animator or VOPlayer, and fires startCorrectFeedback and endCorrectFeedback Learning events
	 *
	 * Example Animator usage:
	 * game.playCorrectFeedback(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 * Example VOPlayer usage:
	 * game.playCorrectFeedback("soundAlias", doneFunction, interruptedFunction);
	 *
	 * @method playCorrectFeedback
	 * @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                               Omit this parameter to play alias(es) with VOPlayer instead
	 * @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                       See VOPlayer.play docs for options.
	 *                                       If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                       See springroll.Animator.play() docs for options
	 * @param {Function} [onComplete]	VO/Animation Ended callback
	 * @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                      If set to 'true' (Boolean), will use same callback as 'onComplete'.
	 *                                      If omited, no callback will be fired on interruption.
	 * @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playCorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning,
			animator = this.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			events = this._filterEvents(events);
			
			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger CorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.triggerMoviePlay(
				instance,
				events,
				onComplete,
				onCancel,
				"correct"
			);
		}
		else //use VOPlayer
		{
			onCancel = onComplete;
			onComplete = events;
			events = instance;
			
			events = this._filterEvents(events);

			if (!learning.spec)
			{
				if (true && Debug)
				{
					Debug.warn("Learning is not available and will not trigger CorrectFeedback events");
				}
				this.voPlayer.play(events, onComplete, onCancel);
				return;
			}
			this.triggerVOPlay(
				events,
				learning.startCorrectFeedback,
				learning.endCorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 * Generalized method for playing either feedback or instructions
	 * @method triggerVOPlay
	 * @protected
	 * @param {String|Array} alias    Alias or Array of aliases for VO lines to play
	 * @param {Function} learningStart The learning to call while starting
	 * @param {Function} learningEnd The learning call to call after finishing/canceling VO
	 * @param {Function} [onComplete]    VO Ended callback
	 * @param {Function} [onCancel] VO Cancelled (interrupted) callback
	 */
	p.triggerVOPlay = function(alias, learningStart, learningEnd, onComplete, onCancel)
	{
		var animator = this.animator;

		//stop any previously playing stuff
		this.voPlayer.stop();

		if (this._learningAnimatorInstance)
		{
			animator.stop(this._learningAnimatorInstance);
		}

		var captions = this.voPlayer.captions;

		//Callback function for ending or canceling the VO
		var callback = function(finish)
		{
			//quit early if LearningMedia has been destroyed.
			if(!this.learning) return;
			
			learningEnd.call(this.learning);
			if (finish) finish();
		};

		if (onCancel === true)
			onCancel = onComplete;

		//Play the audio
		this.voPlayer.play(
			alias,
			callback.bind(this, onComplete),
			callback.bind(this, onCancel)
		);

		//Trigger the start event
		learningStart.call(
			this.learning,
			captions.getFullCaption(alias),
			aliasToString(alias),
			"audio",
			captions.getLength(alias)
		);
	};

	/**
	 * Handles learning events for triggered Animator calls.
	 * @method triggerMoviePlay
	 * @protected
	 * @param {MovieClip} instance The MovieClip to animate.
	 * @param {String|Array} events Event or list of events to animate. See
	 *                            springroll.Animator.play() docs for details.
	 * @param {Object} options Additional options. See springroll.Animator.play() docs
	 *                        for details.
	 * @param {String} learningEvent Learning VO/animation event type
	 *                             ("movie", "instruction", "incorrect", or "correct").
	 * @return {springroll.AnimatorTimeline} AnimatorTimeline of animation.
	 */
	p.triggerMoviePlay = function(instance, events, onComplete, onCancel, learningEvent)
	{
		//Localized instance of learning
		var learning = this.learning;
		var animator = this.animator;

		//stop any previously playing stuff
		this.voPlayer.stop();

		if (this._learningAnimatorInstance)
		{
			animator.stop(this._learningAnimatorInstance);
		}

		if (!Array.isArray(events))
		{
			events = [events];
		}

		var duration = 0; //Event "duration"
		var fullCaption = ""; //Event "description"
		var alias = ""; //Event "id"

		var captions = this.voPlayer.captions;
		var eventInfo, anim, audio, learningEnd, learningCancel;

		//Current loop iteration Caption and ID/alias
		var thisCaption, thisID;

		for (var i = 0, len = events.length; i < len; ++i)
		{
			eventInfo = events[i];
			thisID = null;
			thisCaption = null;

			switch (typeof eventInfo)
			{
				case "number":
					{
						duration += eventInfo;
						break;
					}
				case "string":
					{
						//we passed in a string - the audio alias should be assumed
						//to be the same as the animation alias
						duration += animator.getDuration(instance, eventInfo);
						thisID = eventInfo;

						//if no audio, will return event alias.
						thisCaption = captions.getFullCaption(eventInfo);

						//convert to Animator friendly format
						events[i] = {
							anim: eventInfo,
							audio: eventInfo
						};
						break;
					}
				case "object":
					{
						//we passed an object
						anim = eventInfo.anim;

						if (eventInfo.audio)
						{
							if (typeof eventInfo.audio == 'object')
							{
								audio = eventInfo.audio.alias;
							}
							else
							{
								audio = eventInfo.audio;
							}
						}
						else
							audio = null;

						duration += animator.getDuration(instance, anim);

						//if no audio, use the anim label instead
						if (!audio)
						{
							audio = anim;
						}
						else if (typeof audio != "string")
						{
							audio = audio.alias;
						}
						thisCaption = captions.getFullCaption(audio);
						thisID = audio;
						break;
					}
			}

			if (thisID)
			{
				if (alias.length > 0)
				{
					alias += ",";
				}
				alias += thisID;
			}
			if (thisCaption)
			{
				if (fullCaption.length > 0)
				{
					fullCaption += " ";
				}
				fullCaption += thisCaption;
			}
		}

		duration = duration | 0; //make it an int

		switch (learningEvent)
		{
			case "instruction":
				{
					learning.startInstruction(fullCaption, alias, "animation", duration);
					learningEnd = learning.endInstruction.bind(learning);
					break;
				}
			case "correct":
				{
					learning.startCorrectFeedback(fullCaption, alias, "animation", duration);
					learningEnd = learning.endCorrectFeedback.bind(learning);
					break;
				}
			case "incorrect":
				{
					learning.startIncorrectFeedback(fullCaption, alias, "animation", duration);
					learningEnd = learning.endIncorrectFeedback.bind(learning);
					break;
				}
			case "movie":
				{
					learning.startMovie(alias, duration, fullCaption);
					learningEnd = learning.endMovie.bind(learning);
					learningCancel = learning.skipMovie.bind(learning);
					break;
				}
		}

		var callback = function(learningCall, otherCall)
		{
			//quit early if LearningMedia has been destroyed
			if(!this.learning) return;
			
			this._learningAnimatorInstance = null;

			if (learningCall) //learning end event
			{
				learningCall();
			}

			if (otherCall) //original callback
			{
				otherCall();
			}
		};

		//Setup callbacks
		var onCompleteCallback = callback.bind(this, learningEnd, onComplete);
		var onCancelCallback = callback.bind(
			this,
			learningCancel ? learningCancel : learningEnd,
			onCancel === true ? onComplete : onCancel
		);

		this._learningAnimatorInstance = instance;
		return animator.play(instance, events, onCompleteCallback, onCancelCallback);
	};


	/**
	 * Get an alias or group of aliases as a string
	 * @method aliasToString
	 * @private
	 * @param {Array|String} alias The alias to convert
	 * @return {String} The alias as string
	 */
	var aliasToString = function(alias)
	{
		if (Array.isArray(alias))
		{
			var output = "";
			for (var i = 0, len = alias.length; i < len; ++i)
			{
				if (typeof alias[i] == "string")
				{
					if (output.length > 0)
					{
						output += ",";
					}
					output += alias[i];
				}
			}
			return output;
		}
		else
		{
			return String(alias);
		}
	};

	/**
	 * Stops the currently playing animation or VO.
	 * @method stop
	 */
	p.stop = function()
	{
		if (this._learningAnimatorInstance)
		{
			this.animator.stop(this._learningAnimatorInstance);
		}
		else
		{
			this.voPlayer.stop();
		}
	};

	/**
	 * Whether or not VOPlayer or Animator are currently playing
	 * @method isPlaying
	 * @return {Boolean} Whether or not VOPlayer or Animator are currently playing
	 */
	p.isPlaying = function()
	{
		return this.voPlayer.playing || !!this._learningAnimatorInstance;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.learning = null;
		this.voPlayer = null;
		this.display = null;
		this.filters = null;
	};

	//Assign to namespace
	namespace('springroll').LearningMedia = LearningMedia;
}());
/**
 * @module Learning Media
 * @namespace springroll
 * @requires Core, Learning, Sound, Captions
 */
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		LearningMedia = include('springroll.LearningMedia');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * For media conveninece methods tracking media events, such as 
		 * playFeedback, playMovie, etc
		 * @property {springroll.LearningMedia} media
		 */
		this.media = new LearningMedia();
	};

	// Setup the game media
	plugin.preload = function(done)
	{
		this.media.init(this);
		done();
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this.media)
		{
			this.media.destroy();
			this.media = null;
		}
	};

}());