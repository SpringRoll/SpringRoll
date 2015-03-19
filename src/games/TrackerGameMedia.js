/**
 * @module Tracker Game
 * @namespace springroll
 * @requires Core, Game, Sound, Captions, Tasks, Interface, Progress Tracker, Hinting
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		StringFilters = include('springroll.StringFilters');

	/**
	 *  This class contains a bunch of media playing class
	 *  to provide convenience around using the Progress Tracker
	 *  @class TrackerGameMedia
	 *  @constructor
	 *  @param {springroll.TrackerGame} game Instance of the current game
	 */
	var TrackerGameMedia = function(game)
	{
		/**
		 * @param {springroll.StringFilters} filters
		 */
		this.filters = game.filters;
		/**
		 * @param {springroll.ProgressTracker} tracker
		 */
		this.tracker = game.tracker;
		/**
		 * @param {springroll.TrackerGameMedia} player
		 */
		this.player = game.player;
		/**
		 * @param {createjs.Display} display
		 */
		this.display = game.display;
	};

	//Reference to the prototype
	var p = TrackerGameMedia.prototype;

	/**
	 *  Plays animation or list of animations using springroll.Animator,
	 *  firing startMovie and endMovie or skipMovie ProgressTracker events.
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
		if (!this.tracker)
		{
			if (DEBUG && Debug)
			{
				Debug.warn("ProgressTracker is not available and will not track Movie events");
			}
			return this.display.animator.play(instance, events, options);
		}

		return this.trackMoviePlay(
			instance,
			events,
			onComplete,
			onCancel,
			"movie"
		);
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startInstruction and endInstruction ProgressTracker events
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
		var tracker = this.tracker;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track Instruction events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}
			return this.trackMoviePlay(
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

			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track Instruction events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startInstruction,
				tracker.endInstruction,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startIncorrectFeedback and endIncorrectFeedback ProgressTracker events
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
	 *  @return {springroll.createjs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playIncorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var tracker = this.tracker;
		var animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track IncorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.trackMoviePlay(
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

			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track IncorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startIncorrectFeedback,
				tracker.endIncorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Plays events/aliases using Animator or VOPlayer, and fires startCorrectFeedback and endCorrectFeedback ProgressTracker events
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
	 *  @return {springroll.createjs.AnimatorTimeline|undefined} AnimatorTimeline of the played animation, or nothing if VO only.
	 */
	p.playCorrectFeedback = function(instance, events, onComplete, onCancel)
	{
		var tracker = this.tracker,
			animator = this.display.animator;

		if (animator.canAnimate(instance)) //use Animator
		{
			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track CorrectFeedback events");
				}
				return animator.play(instance, events, onComplete, onCancel);
			}

			return this.trackMoviePlay(
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

			if (!tracker)
			{
				if (DEBUG && Debug)
				{
					Debug.warn("ProgressTracker is not available and will not track CorrectFeedback events");
				}
				this.player.play(events, onComplete, onCancel);
				return;
			}
			this.trackVOPlay(
				events,
				tracker.startCorrectFeedback,
				tracker.endCorrectFeedback,
				onComplete,
				onCancel
			);
		}
	};

	/**
	 *  Generalized method for playing either feedback or instructions
	 *  @method trackVOPlay
	 *  @protected
	 *  @param {String|Array} alias    Alias or Array of aliases for VO lines to play
	 *  @param {Function} trackingStart The tracking to call while starting
	 *  @param {Function} trackingEnd The tracking call to call after finishing/canceling VO
	 *  @param {Function} [onComplete]    VO Ended callback
	 *  @param {Function} [onCancel] VO Cancelled (interrupted) callback
	 */
	p.trackVOPlay = function(alias, trackingStart, trackingEnd, onComplete, onCancel)
	{
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

		if (this._trackerAnimatorInstance)
		{
			animator.stop(this._trackerAnimatorInstance);
		}

		var captions = this.player.captions;

		//Callback function for ending or canceling the VO
		var callback = function(finish)
		{
			trackingEnd.call(this.tracker);
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

		//Track the start event
		trackingStart.call(
			this.tracker,
			captions.getFullCaption(alias),
			aliasToString(alias),
			"audio",
			captions.getLength(alias)
		);
	};

	/**
	 *  Handles tracking events for tracked Animator calls.
	 *  @method trackMoviePlay
	 *  @protected
	 *  @param {MovieClip} instance The MovieClip to animate.
	 *  @param {String|Array} events Event or list of events to animate. See
	 *                              springroll.Animator.play() docs for details.
	 *  @param {Object} options Additional options. See springroll.Animator.play() docs
	 *                          for details.
	 *  @param {String} trackerEvent ProgressTracker VO/animation event type
	 *                               ("movie", "instruction", "incorrect", or "correct").
	 *  @return {springroll.AnimatorTimeline} AnimatorTimeline of animation.
	 */
	p.trackMoviePlay = function(instance, events, onComplete, onCancel, trackerEvent)
	{
		//Localized instance of tracker
		var tracker = this.tracker;
		var animator = this.display.animator;

		//stop any previously playing stuff
		this.player.stop();

		if (this._trackerAnimatorInstance)
		{
			animator.stop(this._trackerAnimatorInstance);
		}

		if (!Array.isArray(events))
		{
			events = [events];
		}

		var duration = 0; //Event "duration"
		var fullCaption = ""; //Event "description"
		var alias = ""; //Event "id"

		var captions = this.player.captions;
		var eventInfo, anim, audio, trackingEnd, trackingCancel;

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

		switch (trackerEvent)
		{
			case "instruction":
				{
					tracker.startInstruction(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endInstruction.bind(tracker);
					break;
				}
			case "correct":
				{
					tracker.startCorrectFeedback(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endCorrectFeedback.bind(tracker);
					break;
				}
			case "incorrect":
				{
					tracker.startIncorrectFeedback(fullCaption, alias, "animation", duration);
					trackingEnd = tracker.endIncorrectFeedback.bind(tracker);
					break;
				}
			case "movie":
				{
					tracker.startMovie(alias, duration, fullCaption);
					trackingEnd = tracker.endMovie.bind(tracker);
					trackingCancel = tracker.skipMovie.bind(tracker);
					break;
				}
		}

		var callback = function(trackerCall, otherCall)
		{
			this._trackerAnimatorInstance = null;

			if (trackerCall) //tracker end event
			{
				trackerCall();
			}

			if (otherCall) //original callback
			{
				otherCall();
			}
		};

		//Setup callbacks
		var onCompleteCallback = callback.bind(this, trackingEnd, onComplete);
		var onCancelCallback = callback.bind(
			this,
			trackingCancel ? trackingCancel : trackingEnd,
			onCancel === true ? onComplete : onCancel
		);

		this._trackerAnimatorInstance = instance;
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
		if (this._trackerAnimatorInstance)
		{
			this.display.animator.stop(this._trackerAnimatorInstance);
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
		return this.player.playing || !!this._trackerAnimatorInstance;
	};

	/**
	 *  Destroy and don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.tracker = null;
		this.player = null;
	};

	//Assign to namespace
	namespace('springroll').TrackerGameMedia = TrackerGameMedia;
}());