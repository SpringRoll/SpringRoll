/**
 * @module Container
 * @namespace springroll
 * @requires  Core
 */
(function(document, undefined)
{
	//Import classes
	var SavedData = include('springroll.SavedData'),
		GameContainer = include('springroll.GameContainer'),
		$ = include('jQuery');

	/**
	 * The game container
	 * @class LearningGameContainer
	 * @extends springroll.GameContainer
	 * @constructor
	 * @param {string} iframeSelector jQuery selector for game iframe container
	 * @param {object} [options] Optional parameters, see springroll.GameContainer for full list
	 * @param {string} [options.helpButton] jQuery selector for help button
	 */
	var LearningGameContainer = function(iframeSelector, options)
	{
		GameContainer.call(this, iframeSelector, options);

		/**
		 * Reference to the help button
		 * @property {jquery} helpButton
		 */
		this.helpButton = $(options.helpButton)
			.click(onPlayHelp.bind(this));

		// Add more events when game is being opened
		this.on('open', onOpen.bind(this));
	};

	//Reference to the prototype
	var s = GameContainer.prototype;
	var p = extend(LearningGameContainer, GameContainer);

	/**
	 * Fired when the enabled status of the help button changes
	 * @event helpEnabled
	 * @param {boolean} enabled If the help button is enabled
	 */

	/**
	 * Event when dispatching a Learning Dispatcher event
	 * @event learningEvent
	 * @param {object} data The event data
	 */

	/**
	 * Event when dispatching a Google Analytics event
	 * @event analyticEvent
	 * @param {object} data The event data
	 * @param {string} data.category The event category
	 * @param {string} data.action The event action
	 * @param {string} [data.label] The optional label
	 * @param {number} [data.value] The optional value
	 */

	/**
	 *  Open a game or path
	 *  @method onOpen
	 *  @private
	 */
	var onOpen = function()
	{
		this.messenger.on(
		{
			analyticEvent: onAnalyticEvent.bind(this),
			learningEvent: onLearningEvent.bind(this),
			helpEnabled: onHelpEnabled.bind(this)
		});
	};

	/**
	 * Reset the mutes for audio and captions
	 * @method onHelpEnabled
	 * @private
	 */
	var onHelpEnabled = function(event)
	{
		this.helpEnabled = !!event.data;
	};

	/**
	 * Track an event for Google Analtyics
	 * @method onAnalyticEvent
	 * @private
	 * @param {event} event Bellhop analyticEvent
	 */
	var onAnalyticEvent = function(event)
	{
		var data = event.data;

		// PBS Specifc implementation of Google Analytics
		var GoogleAnalytics = include("GA_obj", false);
		if (GoogleAnalytics)
		{
			GoogleAnalytics.analyticEvent(
				data.category,
				data.action,
				data.label,
				data.value
			);
		}

		// Generic implementation of Google Analytics
		GoogleAnalytics = include('ga', false);
		if (GoogleAnalytics)
		{
			GoogleAnalytics('send',
			{
				'hitType': 'event',
				'eventCategory': data.category,
				'eventAction': data.action,
				'eventLabel': data.label,
				'eventValue': data.value
			});
		}

		this.trigger('analyticEvent', event.data);
	};

	/**
	 * Track an event for springroll LearningDispatcher
	 * @method onLearningEvent
	 * @param {event} event The bellhop learningEvent
	 * @private
	 */
	var onLearningEvent = function(event)
	{
		this.trigger('learningEvent', event.data);
	};

	/**
	 * Handler when the play hint button is clicked
	 * @method onPlayHelp
	 * @private
	 */
	var onPlayHelp = function()
	{
		if (!this.paused && !this.helpButton.hasClass('disabled'))
		{
			this.messenger.send('playHelp');
		}
	};

	/**
	 * If the current game is paused
	 * @property {Boolean} paused
	 * @default false
	 */
	Object.defineProperty(p, 'paused',
	{
		set: function(paused)
		{
			Object.getOwnPropertyDescriptor(s, 'paused').set.call(this, paused);

			// Disable the help button when paused if it's active
			if (paused && !this.helpButton.hasClass('disabled'))
			{
				this.helpButton.data('paused', true);
				this.helpEnabled = false;
			}
			else if (this.helpButton.data('paused'))
			{
				this.helpButton.removeData('paused');
				this.helpEnabled = true;
			}
		},
		get: function()
		{
			return this._paused;
		}
	});

	/**
	 * Set the captions are muted
	 * @property {Boolean} helpEnabled
	 */
	Object.defineProperty(p, 'helpEnabled',
	{
		set: function(enabled)
		{
			this._helpEnabled = enabled;
			this.helpButton.removeClass('disabled enabled')
				.addClass(enabled ? 'enabled' : 'disabled');

			this.trigger('helpEnabled', enabled);
		},
		get: function()
		{
			return this._helpEnabled;
		}
	});

	/**
	 * Reset all the buttons back to their original setting
	 * and clear the iframe.
	 * @method reset
	 */
	p.reset = function()
	{
		s.reset.call(this);

		// Disable the hint button
		this.helpEnabled = false;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.helpButton = null;

		s.destroy.call(this);
	};

	// Assign to namespace
	namespace('springroll').LearningGameContainer = LearningGameContainer;

}(document));