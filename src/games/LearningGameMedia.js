/**
 * @module learning Game
 * @namespace springroll
 * @requires Core, Game, Sound, Captions, Tasks, Interface, Learning Dispatcher, Hinting
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		StringFilters = include('springroll.StringFilters');

	/**
	 *  This class contains a bunch of media playing class
	 *  to provide convenience around using the Learning Dispatcher
	 *  @class LearningGameMedia
	 *  @constructor
	 *  @param {springroll.LearningGame} game Instance of the current game
	 */
	var LearningGameMedia = function(game)
	{
		/**
		 * @param {springroll.StringFilters} filters
		 */
		this.filters = game.filters;
		
		/**
		 * @param {springroll.LearningDispatcher} learning
		 */
		this.learning = game.learning;

		/**
		 * @param {springroll.LearningGameMedia} player
		 */
		this.player = game.player;

		/**
		 * @param {createjs.Display} display
		 */
		this.display = game.display;
	};

	//Reference to the prototype
	var p = LearningGameMedia.prototype;

	/**
	 *  Plays animation or list of animations using springroll.Animator,
	 *  firing startMovie and endMovie or skipMovie LearningDispatcher events.
	 *  @method playMovie
	 *  @param {MovieClip} instance The MovieClip to animate.
	 *  @param {String|Array|Object} events Event or list of events to animate. See
	 *                                     springroll.Animator.play() docs for details.
	 *   @param {Function} [onComplete]	VO/Animation Ended callback
	 *   @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                         If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                         If omited, no callback will be fired on interruption.
	 *  @return {springroll.AnimatorTimeline} AnimatorTimeline of the played animation.
	 */
	p.playMovie = function(instance, events, onComplete, onCancel)
	{
		if (!this.learning)
		{
			if (DEBUG && Debug)
			{
				Debug.warn("LearningDispatcher is not available and will not trigger Movie events");
			}
			return this.display.animator.play(instance, events, options);
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
	 *  Plays events/aliases using Animator or VOPlayer, and fires startInstruction and endInstruction LearningDispatcher events
	 *
	 *  Example Animator usage:
	 *  game.playInstruction(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playInstruction("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playInstruction
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                        If omited, no callback will be fired on interruption.
	 *    @return {springroll.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playInstruction = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger Instruction events");
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

			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger Instruction events");
				}
				this.player.play(events, onComplete, onCancel);
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
	 *  Plays events/aliases using Animator or VOPlayer, and fires startIncorrectFeedback and endIncorrectFeedback LearningDispatcher events
	 *
	 *  Example Animator usage:
	 *  game.playInstruction(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playInstruction("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playInstruction
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} events   If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'
	 *                                        If omited, no callback will be fired on interruption.
	 *  @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playIncorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger IncorrectFeedback events");
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

			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger IncorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
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
	 *  Plays events/aliases using Animator or VOPlayer, and fires startCorrectFeedback and endCorrectFeedback LearningDispatcher events
	 *
	 *  Example Animator usage:
	 *  game.playInstruction(someMovieClip, {"anim":"frameLabel", "audio":"soundAlias"}, doneFunction, interruptedFunction);
	 *
	 *  Example VOPlayer usage:
	 *  game.playInstruction("soundAlias", doneFunction, interruptedFunction);
	 *
	 *  @method playInstruction
	 *  @param {MovieClip} [instance] createjs.MovieClip instance to play with Animator.
	 *                                 Omit this parameter to play alias(es) with VOPlayer instead
	 *  @param {String|Array|Object} event    If 'instance' is omitted, Alias or Array of aliases for VO lines to play with VOPlayer.
	 *                                         See VOPlayer.play docs for options.
	 *                                         If 'instance' is present, Event or list of events to animate with createjs.Animator.
	 *                                         See springroll.Animator.play() docs for options
	 *  @param {Function} [onComplete]	VO/Animation Ended callback
	 *  @param {Function|Boolean} [onCancel] VO/Animation Cancelled (interrupted) callback.
	 *                                        If set to 'true' (Boolean), will use same callback as 'onComplete'.
	 *                                        If omited, no callback will be fired on interruption.
	 *  @return {springroll.easeljs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playCorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var learning = this.learning,
			animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger CorrectFeedback events");
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

			if (!learning)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("LearningDispatcher is not available and will not trigger CorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
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
	 *  Generalized method for playing either feedback or instructions
	 *  @method triggerVOPlay
	 *  @protected
	 *  @param {String|Array} alias    Alias or Array of aliases for VO lines to play
	 *  @param {Function} learningStart The learning to call while starting
	 *  @param {Function} learningEnd The learning call to call after finishing/canceling VO
	 *  @param {Function} [onComplete]    VO Ended callback
	 *  @param {Function} [onCancel] VO Cancelled (interrupted) callback
	 */
	p.triggerVOPlay = function(alias, learningStart, learningEnd, onComplete, onCancel)
	{
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

		if (this._learningAnimatorInstance)
		{
			animator.stop(this._learningAnimatorInstance);
		}

		var captions = this.player.captions;

		//Callback function for ending or canceling the VO
		var callback = function(finish)
		{
			learningEnd.call(this.learning);
			if (finish) finish();
		};

		if (onCancel === true)
			onCancel = onComplete;

		//Play the audio
		this.player.play(
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
	 *  Handles learning events for triggered Animator calls.
	 *  @method triggerMoviePlay
	 *  @protected
	 *  @param {MovieClip} instance The MovieClip to animate.
	 *  @param {String|Array} events Event or list of events to animate. See
	 *                              springroll.Animator.play() docs for details.
	 *  @param {Object} options Additional options. See springroll.Animator.play() docs
	 *                          for details.
	 *  @param {String} learningEvent LearningDispatcher VO/animation event type
	 *                               ("movie", "instruction", "incorrect", or "correct").
	 *  @return {springroll.AnimatorTimeline} AnimatorTimeline of animation.
	 */
	p.triggerMoviePlay = function(instance, events, onComplete, onCancel, learningEvent)
	{
		//Localized instance of learning
		var learning = this.learning;
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

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

		var captions = this.player.captions;
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
						eventInfo = this.filters.filter(eventInfo);

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
						eventInfo.anim = anim = this.filters.filter(eventInfo.anim);
						
						if (eventInfo.audio)
						{
							if (typeof eventInfo.audio == 'object')
							{
								eventInfo.audio.alias =	audio = this.filters.filter(eventInfo.audio.alias);
							}
							else
							{
								eventInfo.audio = audio = this.filters.filter(eventInfo.audio);
							}
						}

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
	 *  Get an alias or group of aliases as a string
	 *  @method aliasToString
	 *  @private
	 *  @param {array|string} alias The alias to convert
	 *  @return {string} The alias as string
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
			this.display.animator.stop(this._learningAnimatorInstance);
		}
		else
		{
			this.player.stop();
		}
	};

	/**
	 * Whether or not VOPlayer or Animator are currently playing
	 * @method isPlaying
	 * @return {Boolean} Whether or not VOPlayer or Animator are currently playing
	 */
	p.isPlaying = function()
	{
		return this.player.playing || !!this._learningAnimatorInstance;
	};

	/**
	 *  Destroy and don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.learning = null;
		this.player = null;
	};

	//Assign to namespace
	namespace('springroll').LearningGameMedia = LearningGameMedia;
}());